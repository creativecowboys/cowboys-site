import type { CallHistory, CallLead } from "@/app/leads/types";
import { PLAYBOOKS } from "@/lib/playbooks";

// "What they told us" on the Sales desk (Dave, Oct 2 2026): "if I click on Ansel … he came from an ebook download. I can't see
// what he was interested in from our page." The forms already put it in GoHighLevel; the desk now reads it and says it plainly.
//
// Where each answer lives (all written by the public intake routes, never by the desk):
//   ebook / playbook  src/lib/ghl-playbook.ts — fields Playbook Trade / Crew Size / Typical Job / Has Website / Tier / City, GHL's own
//                     source line "Playbook: HVAC GBP Fix (facebook / fall)", tags playbook-lead, playbook-<trade>-gbp, pb-tier-<a|b|c>
//   Big Giveaway      src/lib/ghl-giveaway.ts — fields Giveaway Business Type / Giveaway Source, tags giveaway-entrant,
//                     giveaway-has-site / giveaway-no-site; the audit score and report and Interested In are desk fields on the lead
//   website forms     src/lib/ghl-website-form.ts — source line "Website form: Contact Page", tag website-form, and a contact NOTE
//                     carrying the service, industry and message (read here from the lead's history)
// A field is read by NAME (src/lib/ghl/fields.ts INTAKE_FIELDS); when it is blank (an older contact) the tags and the source line
// stand in. Display only: nothing in this file is written anywhere. Pure and free of Node imports, because the desk (a client
// component) words the panel and the roster chip with it and src/lib/calls/ghl.ts builds the data with it.

export type Tier = "A" | "B" | "C";
export type ToldEbook = {
  /** The playbook's trade ("HVAC"): Playbook Trade, else the playbook tag, else GoHighLevel's source line. */
  trade?: string;
  /** Its title without "The" ("7-Day Google Business Profile Fix"), when the trade is one of ours (src/lib/playbooks.ts). */
  playbook?: string;
  /** Other playbooks the contact downloaded too, by trade (from their tags). */
  also?: string[];
  crew?: string; job?: string; website?: "Yes" | "No"; tier?: Tier; city?: string;
  /** The campaign part of the source line ("facebook / hvac-fall"). Left out when it only says "direct" (no campaign on the link). */
  via?: string;
};
export type ToldGiveaway = {
  /** What they picked on the entry form ("Home Services & Trades (plumbing, HVAC, roofing, etc.)"). */
  businessType?: string;
  /** From the giveaway-has-site / giveaway-no-site tag. */
  site?: "yes" | "no";
  /** Giveaway Source (utm content or source). Left out when it only says "organic" (no campaign on the link). */
  via?: string;
};
/** Which website form, from the source line. What they wrote comes from the form's note in the lead's history (formNotes). */
export type ToldForm = { form?: string };
export type LeadTold = {
  /** The day the contact was created in GoHighLevel (YYYY-MM-DD, Eastern). */
  added?: string;
  ebook?: ToldEbook; giveaway?: ToldGiveaway; form?: ToldForm;
};

/** The intake field values of one contact, read by name in src/lib/calls/ghl.ts (keys match INTAKE_FIELDS in src/lib/ghl/fields.ts). */
export type IntakeValues = Partial<Record<"playbookTrade" | "playbookCrew" | "playbookJob" | "playbookHasWebsite" | "playbookTier" | "playbookCity" | "giveawayBusinessType" | "giveawaySource", string>>;
export type ToldInput = { tags?: readonly unknown[] | null; source?: string | null; dateAdded?: string | null; values?: IntakeValues };

const clean = (v: unknown): string => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const lower = (v: string) => v.trim().toLowerCase();
const PLAYBOOK_LINE = /^playbook:\s*(.*?)\s+gbp fix\s*(?:\((.*)\))?\s*$/i;
const FORM_LINE = /^website form:\s*(.+)$/i;
const PLAYBOOK_TAG = /^playbook-([a-z0-9-]+)-gbp$/;
const TIER_TAG = /^pb-tier-([abc])$/;

/** "2026-10-01T02:34:26.952Z" → "2026-09-30": the day in Eastern time ("" when it is not a date). */
export function easternDay(value: string | null | undefined): string {
  const ms = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(ms)) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-30" → "Sep 30" (with the year when it is not this year). Parsed from its parts, never with new Date(), which would shift it a day in US time. */
export function prettyDay(ymd: string, thisYear = new Date().getFullYear()): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return "";
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}${Number(m[1]) !== thisYear ? `, ${m[1]}` : ""}`;
}

const playbookByTrade = (trade: string) => Object.values(PLAYBOOKS).find((pb) => lower(pb.trade) === lower(trade));
/** The trade a playbook tag stands for: ours by the registry ("playbook-roofer-gbp" → "Roofing"), any other by its name ("Landscaper"). */
function tradeOfTag(tag: string): string {
  const known = Object.values(PLAYBOOKS).find((pb) => pb.tag === tag);
  if (known) return known.trade;
  const slug = PLAYBOOK_TAG.exec(tag)?.[1] || "";
  return slug.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/** What the forms told us about this contact, from its fields, tags and source line. Never undefined for a GoHighLevel contact. */
export function toldFromContact(input: ToldInput): LeadTold {
  const tags = (Array.isArray(input.tags) ? input.tags : []).map((t) => lower(String(t)));
  const has = (t: string) => tags.includes(t);
  const v = input.values || {};
  const source = clean(input.source);
  const told: LeadTold = {};
  const added = easternDay(input.dateAdded);
  if (added) told.added = added;

  // ebook / playbook
  const line = PLAYBOOK_LINE.exec(source);
  const tagTrades = tags.filter((t) => PLAYBOOK_TAG.test(t)).map(tradeOfTag).filter(Boolean);
  const tierTag = tags.map((t) => TIER_TAG.exec(t)?.[1]).find(Boolean);
  if (clean(v.playbookTrade) || has("playbook-lead") || tagTrades.length || tierTag || line) {
    const ebook: ToldEbook = {};
    const trade = clean(v.playbookTrade) || tagTrades[0] || clean(line?.[1]);
    if (trade) {
      ebook.trade = trade;
      const pb = playbookByTrade(trade);
      if (pb) ebook.playbook = pb.headline[0].replace(/^the\s+/i, "");
      const also = [...new Set(tagTrades.filter((t) => lower(t) !== lower(trade)))];
      if (also.length) ebook.also = also;
    }
    if (clean(v.playbookCrew)) ebook.crew = clean(v.playbookCrew);
    if (clean(v.playbookJob)) ebook.job = clean(v.playbookJob);
    const site = lower(clean(v.playbookHasWebsite));
    if (site === "yes" || site === "no") ebook.website = site === "yes" ? "Yes" : "No";
    const tier = (/^[abc]$/i.test(clean(v.playbookTier)) ? clean(v.playbookTier) : tierTag || "").toUpperCase();
    if (tier) ebook.tier = tier as Tier;
    if (clean(v.playbookCity)) ebook.city = clean(v.playbookCity);
    const via = clean(line?.[2]);
    if (via && lower(via) !== "direct") ebook.via = via;
    told.ebook = ebook;
  }

  // Big Giveaway
  if (has("giveaway-entrant") || has("giveaway-has-site") || has("giveaway-no-site") || clean(v.giveawayBusinessType) || clean(v.giveawaySource) || lower(source) === "big giveaway") {
    const giveaway: ToldGiveaway = {};
    if (clean(v.giveawayBusinessType)) giveaway.businessType = clean(v.giveawayBusinessType);
    if (has("giveaway-has-site")) giveaway.site = "yes"; else if (has("giveaway-no-site")) giveaway.site = "no";
    const via = clean(v.giveawaySource);
    if (via && lower(via) !== "organic") giveaway.via = via;
    told.giveaway = giveaway;
  }

  // website forms
  const form = FORM_LINE.exec(source);
  if (has("website-form") || form) told.form = form ? { form: clean(form[1]) } : {};
  return told;
}

// ───────────────────────────── a website form's note ─────────────────────────────
export type FormNote = { form: string; service?: string; industry?: string; message?: string; at: string };
/**
 * The note src/lib/ghl-website-form.ts writes with every website form ("Website form: Contact Page", then "Service requested: …",
 * "Industry: …" and "Message: …", each only when given; the message runs to the end and may span lines). Null for any other note.
 */
export function parseFormNote(text: string, at = ""): FormNote | null {
  const lines = String(text || "").replace(/\r/g, "").trim().split("\n");
  const first = FORM_LINE.exec(lines[0] || "");
  if (!first) return null;
  const note: FormNote = { form: clean(first[1]), at };
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    const m = /^(Service requested|Industry|Message):[ \t]*(.*)$/.exec(l);
    if (!m) continue;
    if (m[1] === "Message") { const msg = [m[2], ...lines.slice(i + 1)].join("\n").trim(); if (msg) note.message = msg; break; }
    if (clean(m[2])) note[m[1] === "Industry" ? "industry" : "service"] = clean(m[2]);
  }
  return note;
}
/** Every website form note in a lead's history, newest first (the history comes newest first from the lead's record). */
export const formNotes = (history: readonly CallHistory[] = []): FormNote[] =>
  history.filter((h) => !h.isCallNote).map((h) => parseFormNote(h.text, h.createdAt)).filter((n): n is FormNote => !!n);

// ───────────────────────────── wording ─────────────────────────────
/** The tier rule in plain words (src/lib/playbooks.ts tierFor). */
export const TIER_WORDS: Record<Tier, string> = {
  A: "best fit: a crew of 2 to 15, jobs of $2,000+, no website",
  B: "a crew, or jobs of $500+",
  C: "solo, small jobs",
};
export const tierLine = (tier: Tier): string => `Tier ${tier} (${TIER_WORDS[tier]})`;

/** The giveaway's business types (src/lib/giveaway.ts BUSINESS_TYPES) in a word or two, for the roster chip. */
const SHORT_TYPES: [RegExp, string][] = [
  [/^home services/i, "Trades"], [/^restaurant/i, "Food & drink"], [/^retail/i, "Retail"], [/^health/i, "Health & fitness"],
  [/^professional/i, "Pro services"], [/^automotive/i, "Automotive"], [/^beauty/i, "Beauty"], [/^real estate/i, "Real estate"],
  [/^nonprofit/i, "Nonprofit"], [/^something else/i, ""],
];
export function shortBusinessType(type: string | undefined): string {
  const t = clean(type);
  if (!t) return "";
  const hit = SHORT_TYPES.find(([re]) => re.test(t));
  if (hit) return hit[1];
  const plain = t.split(/[(,]/)[0].trim();
  return plain.length <= 20 ? plain : `${plain.slice(0, 19).trimEnd()}…`;
}
const hostOf = (url: string): string => {
  try { return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, ""); } catch { return ""; }
};

export type ToldFact = { label: string; value: string; href?: string };
export type ToldSection = { key: "ebook" | "giveaway" | "form"; title: string; facts: ToldFact[]; message?: string };
export type ToldView = { cameIn: string; sections: ToldSection[] };
type ToldLead = Pick<CallLead, "told" | "leadSource" | "city" | "website" | "auditScore" | "auditReport" | "interestedIn">;
/** Which intake the Lead Source names: that section goes first. */
const sourceKey = (leadSource: string): ToldSection["key"] | "" => {
  const s = lower(leadSource || "");
  return s.includes("ebook") || s.includes("playbook") ? "ebook" : s.includes("giveaway") ? "giveaway" : s.includes("website") || s.includes("form") ? "form" : "";
};
const MESSAGE_MAX = 1200;

/**
 * The "What they told us" block on a lead, or null when there is nothing to say (a Monday lead, or a contact no form ever
 * touched). Only what exists is shown: an empty answer is left out, never filled with a placeholder.
 */
export function toldView(lead: ToldLead, history: readonly CallHistory[] = [], thisYear = new Date().getFullYear()): ToldView | null {
  const told = lead.told;
  if (!told) return null;
  const sections: ToldSection[] = [];
  const site = (said: string, url: string): ToldFact => (url && hostOf(url) ? { label: "Website", value: hostOf(url), href: url } : { label: "Website", value: said });

  if (told.ebook) {
    const e = told.ebook;
    const facts: ToldFact[] = [];
    if (e.also?.length) facts.push({ label: "Also downloaded", value: e.also.map((t) => `the ${t} playbook`).join(", ") });
    if (e.crew) facts.push({ label: "Crew", value: e.crew });
    if (e.job) facts.push({ label: "Typical job", value: e.job });
    if (e.website === "Yes") facts.push(site("Yes", lead.website));
    if (e.website === "No") facts.push({ label: "Website", value: "No" });
    if (e.tier) facts.push({ label: "Fit", value: tierLine(e.tier) });
    if (e.city && !lower(lead.city || "").replace(/[^a-z0-9]/g, "").includes(lower(e.city).replace(/[^a-z0-9]/g, ""))) facts.push({ label: "City", value: e.city });
    if (e.via) facts.push({ label: "Came from", value: e.via });
    sections.push({ key: "ebook", title: e.trade ? `Downloaded the ${e.trade} playbook${e.playbook ? ` (${e.playbook})` : ""}` : "Downloaded a playbook", facts });
  }

  const notes = formNotes(history).slice(0, 3);
  for (const n of notes) {
    const facts: ToldFact[] = [];
    if (n.form) facts.push({ label: "Form", value: n.form });
    if (n.service) facts.push({ label: "Service", value: n.service });
    if (n.industry) facts.push({ label: "Industry", value: n.industry });
    const day = prettyDay(easternDay(n.at), thisYear);
    if (day) facts.push({ label: "Sent", value: day });
    const message = n.message && n.message.length > MESSAGE_MAX ? `${n.message.slice(0, MESSAGE_MAX).trimEnd()}… (the whole message is under Before you call)` : n.message;
    sections.push({ key: "form", title: "Filled out a form on our website", facts, ...(message ? { message } : {}) });
  }
  if (!notes.length && told.form) sections.push({ key: "form", title: "Filled out a form on our website", facts: told.form.form ? [{ label: "Form", value: told.form.form }] : [] });

  if (told.giveaway) {
    const g = told.giveaway;
    const facts: ToldFact[] = [];
    if (g.businessType) facts.push({ label: "Business type", value: g.businessType });
    if (g.site === "yes") facts.push(site("Yes", lead.website));
    if (g.site === "no") facts.push({ label: "Website", value: "None yet" });
    if (g.via) facts.push({ label: "Came from", value: g.via });
    const score = clean(lead.auditScore);
    if (score) facts.push({ label: "Site audit", value: `${score}/100`, ...(lead.auditReport ? { href: lead.auditReport } : {}) });
    if (clean(lead.interestedIn)) facts.push({ label: "Interested in", value: clean(lead.interestedIn) });
    sections.push({ key: "giveaway", title: "Entered the Big Giveaway", facts });
  }

  if (!sections.length) return null;
  const first = sourceKey(lead.leadSource);
  const ordered = first ? [...sections.filter((s) => s.key === first), ...sections.filter((s) => s.key !== first)] : sections;
  const day = told.added ? prettyDay(told.added, thisYear) : "";
  return { cameIn: day ? `Came in ${day}` : "", sections: ordered };
}

/** The small chip on a roster row, next to the Lead Source tag: "HVAC · Tier C" for an ebook lead, "Trades · no site" for a giveaway entrant. "" when it would not help pick a call. */
export function toldChip(lead: Pick<CallLead, "told" | "leadSource">): string {
  const told = lead.told;
  if (!told) return "";
  const ebook = told.ebook ? [told.ebook.trade || "", told.ebook.tier ? `Tier ${told.ebook.tier}` : ""].filter(Boolean).join(" · ") : "";
  const g = told.giveaway;
  const giveaway = g ? [shortBusinessType(g.businessType), g.site === "no" ? "no site" : g.site === "yes" ? "has site" : ""].filter(Boolean).join(" · ") : "";
  return sourceKey(lead.leadSource) === "giveaway" ? giveaway || ebook : ebook || giveaway;
}
