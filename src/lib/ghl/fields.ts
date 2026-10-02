import { CallDeskError } from "@/lib/calls/validation";
import { createCustomField, listCustomFields, setCustomFieldOptions, type GhlFieldDef, type NewFieldDef } from "./client";

// Contact custom fields the sales desk lives on. The desk never hard-codes a GHL field id: every call
// resolves the definitions from GHL (cached 10 min) and matches by name, so Dave can add a Lead Source
// option in GHL (Settings → Custom Fields → Lead Source) and the desk shows it with no deploy.
//
// Two fields already existed on the location (created by the LSE audit flow, Sep 10 2026) and are reused:
// "Audit Score" (NUMERICAL) and "Audit Report URL" (TEXT). The rest are created by ensureSalesFields()
// — POST /api/team/ghl/setup, owner-only — or by hand in GHL with exactly these names.
export type SalesFieldKey = "leadSource" | "outreach" | "interest" | "lastContact" | "nextFollowup" | "nextFollowupTime" | "quotedMonthly" | "interestedIn" | "salesNotes" | "mondayLeadId" | "auditScore" | "auditReport";

export const LEAD_SOURCE_OPTIONS = ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] as const;
export const LEAD_SOURCE = { giveaway: "The Big Giveaway", ebook: "Ebook download", website: "Website form", facebook: "Facebook", referral: "Referral", other: "Other" } as const;
/** Outreach labels. The first 11 are byte-identical to the Monday Giveaway Leads "Outreach Status" column (read off the board
 *  Oct 1 2026) so the migration maps 1:1. "In progress" is the desk's own (Dave, Oct 2 2026: a lead the rep talked to and is
 *  still working); it sits last because that is where it is appended on the live field — see ensureSalesOptions below. The
 *  desk's call outcomes write five of these (src/lib/calls/outcomes.ts); the rest are set by hand in GHL. */
export const OUTREACH_OPTIONS = ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won", "In progress"] as const;
export const INTEREST_OPTIONS = ["Cold", "Warm", "Hot"] as const;

export const SALES_FIELDS: Record<SalesFieldKey, NewFieldDef & { reuse?: boolean }> = {
  leadSource: { name: "Lead Source", dataType: "SINGLE_OPTIONS", options: [...LEAD_SOURCE_OPTIONS], position: 201 },
  outreach: { name: "Outreach Status", dataType: "SINGLE_OPTIONS", options: [...OUTREACH_OPTIONS], position: 202 },
  interest: { name: "Interest", dataType: "SINGLE_OPTIONS", options: [...INTEREST_OPTIONS], position: 203 },
  lastContact: { name: "Last Contact", dataType: "DATE", position: 204 },
  nextFollowup: { name: "Next Follow-up", dataType: "DATE", position: 205 },
  nextFollowupTime: { name: "Next Follow-up Time", dataType: "TEXT", placeholder: "HH:MM Eastern, blank = all day", position: 206 },
  quotedMonthly: { name: "Quoted Monthly", dataType: "MONETORY", position: 207 },
  interestedIn: { name: "Interested In", dataType: "TEXT", position: 208 },
  salesNotes: { name: "Sales Notes", dataType: "LARGE_TEXT", position: 209 },
  mondayLeadId: { name: "Monday Lead ID", dataType: "TEXT", placeholder: "Giveaway Leads item id this contact was imported from", position: 210 },
  auditScore: { name: "Audit Score", dataType: "NUMERICAL", reuse: true },
  auditReport: { name: "Audit Report URL", dataType: "TEXT", reuse: true },
};

export type ResolvedField = { id: string; name: string; dataType: string; options: string[] };
export type SalesFields = Partial<Record<SalesFieldKey, ResolvedField>>;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
/** Match a GHL definition to a catalog entry by field key first, then by normalized name. */
export function matchField(defs: GhlFieldDef[], key: SalesFieldKey): GhlFieldDef | undefined {
  const want = SALES_FIELDS[key].name;
  const wantKey = `contact.${norm(want)}`;
  return defs.find((d) => d.fieldKey && norm(d.fieldKey) === norm(wantKey)) || defs.find((d) => norm(d.name) === norm(want));
}
export function resolveFromDefs(defs: GhlFieldDef[]): SalesFields {
  const out: SalesFields = {};
  for (const key of Object.keys(SALES_FIELDS) as SalesFieldKey[]) {
    const d = matchField(defs, key);
    if (d) out[key] = { id: d.id, name: d.name, dataType: d.dataType, options: (d.picklistOptions || []).map(String) };
  }
  return out;
}
/** Live definitions (cached). Throws a 503 CallDeskError when GHL can't be read, so the desk says why. */
export async function salesFields(fresh = false): Promise<SalesFields> {
  const defs = await listCustomFields(fresh);
  return resolveFromDefs(defs);
}
/**
 * Lead Source field id for the PUBLIC intake routes (giveaway, playbook, website forms). Best effort and
 * bounded: uses the warm cache when there is one, otherwise ONE 3-second read with no retries, and after
 * a failure it stops asking for a minute — a GHL slowdown must never hold up a visitor's form.
 */
let intakeBlockedUntil = 0;
export async function leadSourceIdForIntake(): Promise<string | undefined> {
  if (Date.now() < intakeBlockedUntil) return undefined;
  try { return resolveFromDefs(await listCustomFields(false, { timeoutMs: 3000, retries: 0 })).leadSource?.id; }
  catch { intakeBlockedUntil = Date.now() + 60_000; return undefined; }
}
export const resetIntakeLookup = () => { intakeBlockedUntil = 0; };
export function requireField(fields: SalesFields, key: SalesFieldKey): ResolvedField {
  const f = fields[key];
  if (!f) throw new CallDeskError(`The GoHighLevel custom field "${SALES_FIELDS[key].name}" does not exist yet. An owner runs Set up GoHighLevel fields on the desk (POST /api/team/ghl/setup), or creates it in GHL Settings → Custom Fields with that exact name.`, 503);
  return f;
}
/** Lead Source options come from GHL, never from code — the catalog list only seeds the field on creation. */
export const leadSourceOptions = (fields: SalesFields): string[] => fields.leadSource?.options || [];

// ───────────────────────────── dropdown options ─────────────────────────────
/** The option on a live dropdown that matches a label, ignoring capitalisation and stray spaces. GoHighLevel keeps whatever
 *  spelling was typed when the option was made, so "In Progress" added by hand is the same option as the desk's "In progress". */
export function liveOption(options: readonly string[], label: string): string | undefined {
  const want = label.trim().toLowerCase();
  return options.find((o) => o.trim().toLowerCase() === want);
}
/** The dropdowns whose values the desk writes from a fixed list in code. Lead Source is deliberately NOT here: its options are
 *  Dave's to edit in GoHighLevel (the catalog list only seeds the field), so nothing in this file ever adds to it. */
export const CODE_OWNED_DROPDOWNS = ["outreach", "interest"] as const satisfies readonly SalesFieldKey[];
/** Catalog options a live dropdown does not have yet (a different capitalisation counts as having it). */
const optionsMissingFrom = (key: SalesFieldKey, live: readonly string[]): string[] => (SALES_FIELDS[key].options || []).filter((o) => !liveOption(live, o));
/** What the desk says instead of writing a status GoHighLevel has no option for. Plain enough to read out to an owner. */
export const missingOptionMessage = (fieldName: string, label: string): string =>
  `"${label}" is not an option on the "${fieldName}" field in GoHighLevel yet, so nothing was saved. An owner needs to add it: run the GoHighLevel field setup for the sales dropdowns (POST /api/team/ghl/setup with scope "sales-options"), or add the option by hand in GoHighLevel under Settings, Custom Fields, ${fieldName}. Until then, choose a different outcome.`;

export type SetupReport = { present: { key: SalesFieldKey; name: string; id: string; missingOptions?: string[] }[]; created: { key: SalesFieldKey; name: string; id: string }[]; missing: { key: SalesFieldKey; name: string; dataType: string; options?: string[] }[]; failed: { key: SalesFieldKey; name: string; error: string }[]; dryRun: boolean };
/** Idempotent: creates whatever is missing (unless dryRun), never edits an existing field or its options. A field that exists
 *  but lacks an option the desk writes is listed with `missingOptions`; adding those is a separate call (ensureSalesOptions). */
export async function ensureSalesFields(dryRun = true): Promise<SetupReport> {
  const defs = await listCustomFields(true);
  const report: SetupReport = { present: [], created: [], missing: [], failed: [], dryRun };
  for (const key of Object.keys(SALES_FIELDS) as SalesFieldKey[]) {
    const def = SALES_FIELDS[key];
    const have = matchField(defs, key);
    if (have) {
      const lacking = (CODE_OWNED_DROPDOWNS as readonly SalesFieldKey[]).includes(key) ? optionsMissingFrom(key, (have.picklistOptions || []).map(String)) : [];
      report.present.push(lacking.length ? { key, name: have.name, id: have.id, missingOptions: lacking } : { key, name: have.name, id: have.id });
      continue;
    }
    if (dryRun) { report.missing.push({ key, name: def.name, dataType: def.dataType, options: def.options }); continue; }
    try {
      const created = await createCustomField({ name: def.name, dataType: def.dataType, options: def.options, placeholder: def.placeholder, position: def.position });
      report.created.push({ key, name: created.name || def.name, id: created.id });
      await new Promise((r) => setTimeout(r, 150));
    } catch (e) { report.failed.push({ key, name: def.name, error: e instanceof Error ? e.message : String(e) }); }
  }
  return report;
}

/**
 * One row per code-owned dropdown. `status`: complete = it has every option the desk writes · would-add = a dry run found
 * options to add · added = added, and read back from GoHighLevel · check = added, but the list needs a person to look at it
 * (see `detail`) · failed = GoHighLevel refused or did not keep the change · skipped = not touched (see `detail`).
 */
export type OptionRow = {
  key: SalesFieldKey; name: string; id: string; status: "complete" | "would-add" | "added" | "check" | "failed" | "skipped";
  /** The options GoHighLevel had when this ran, in its own order. */
  live: string[];
  /** Catalog options that were missing — the only things this call ever adds. */
  add: string[];
  /** Dry run: the list that would be sent. Real run: the list GoHighLevel holds afterwards, read back. */
  after: string[];
  /** Real run only: options that were there before and are not there now. Anything here needs putting back by hand. */
  lost?: string[];
  /** Options GoHighLevel already has under another capitalisation: used as they are, never added a second time. */
  spelled?: { want: string; live: string }[];
  detail: string;
};
export type OptionsReport = { dryRun: boolean; scope: "sales-options"; fields: OptionRow[]; missingFields: string[]; summary: string[]; untouched: string };
const quoted = (list: readonly string[]) => list.map((o) => `"${o}"`).join(", ");
const byHand = (name: string, add: readonly string[]) => `Add ${add.length === 1 ? "it" : "them"} by hand instead: GoHighLevel, Settings, Custom Fields, ${name}, Edit, add ${quoted(add)} spelled exactly like that, Save. The desk reads the option list from GoHighLevel, so no deploy is needed.`;
// The owner reads this report through a browser tool that blanks anything shaped like a query string, so upstream text is stripped of those characters.
const plain = (text: string) => text.replace(/[=?&]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
const uniq = (list: readonly string[]) => list.filter((o, i) => list.indexOf(o) === i);

/**
 * Adds the options the desk writes to its own dropdowns when GoHighLevel does not have them yet (Oct 2 2026: "In progress"
 * on Outreach Status). Dry run by default: it then only reports which option would be added to which field.
 *
 * Narrow on purpose. It looks at CODE_OWNED_DROPDOWNS and nothing else — never Lead Source, never a field outside the sales
 * catalog, so never an "LSE …" or "Desk …" field. It only ever ADDS: the list it sends is what the field has now, in the
 * field's own order, with the missing options appended, so nothing is renamed, moved or removed. It will not touch a field
 * that is not a dropdown, or one GoHighLevel returned no options for (sending a list would replace options it cannot see).
 * A failure is reported, not thrown, and nothing is retried: the report then says how to add the option by hand.
 */
export async function ensureSalesOptions(dryRun = true, opts: { settleMs?: number } = {}): Promise<OptionsReport> {
  const settleMs = opts.settleMs ?? 1500;
  const defs = await listCustomFields(true);
  const report: OptionsReport = { dryRun, scope: "sales-options", fields: [], missingFields: [], summary: [], untouched: `Only ${CODE_OWNED_DROPDOWNS.map((k) => SALES_FIELDS[k].name).join(" and ")} are looked at. ${SALES_FIELDS.leadSource.name} is never changed from here: its options are managed in GoHighLevel.` };
  const optionsOf = (d: GhlFieldDef | undefined) => (d?.picklistOptions || []).map(String);
  for (const key of CODE_OWNED_DROPDOWNS) {
    const have = matchField(defs, key);
    if (!have) {
      report.missingFields.push(SALES_FIELDS[key].name);
      report.summary.push(`"${SALES_FIELDS[key].name}" does not exist in GoHighLevel yet. Create it first with the plain field setup (POST /api/team/ghl/setup, no scope).`);
      continue;
    }
    const live = optionsOf(have);
    const add = optionsMissingFrom(key, live);
    const spelled = (SALES_FIELDS[key].options || []).map((want) => ({ want, live: liveOption(live, want) || "" })).filter((x) => x.live && x.live !== x.want);
    const row: OptionRow = { key, name: have.name, id: have.id, status: "complete", live, add, after: [...live, ...add], detail: "", ...(spelled.length ? { spelled } : {}) };
    report.fields.push(row);
    const skip = (why: string) => { row.status = "skipped"; row.after = live; row.detail = why; report.summary.push(why); };
    if (/^lse\b/i.test(have.name.trim())) { skip(`"${have.name}" is a Local SEO Engine field; not touched.`); continue; }
    if (have.dataType !== "SINGLE_OPTIONS") { skip(`"${have.name}" is a ${have.dataType} field in GoHighLevel, not a dropdown; not touched.`); continue; }
    if (!live.length) { skip(`GoHighLevel returned no options for "${have.name}". Sending a list would replace options this call cannot see, so it was not touched. Look at the field in GoHighLevel.`); continue; }
    if (!add.length) {
      row.detail = `"${have.name}" already has every option the desk writes (${live.length} options).`;
      report.summary.push(row.detail);
      continue;
    }
    if (dryRun) {
      row.status = "would-add";
      row.detail = `Would add ${quoted(add)} to "${have.name}" (${live.length} options now, ${row.after.length} after). Nothing is renamed, reordered or removed.`;
      report.summary.push(row.detail);
      continue;
    }
    let refused = "";
    try { await setCustomFieldOptions(have, row.after); }
    catch (e) { refused = plain(e instanceof Error ? e.message : String(e)); }
    // What GoHighLevel holds now decides the outcome — not the answer to the PUT, which is unproven and may have timed out after applying.
    const readBack = async () => {
      const def = (await listCustomFields(true)).find((d) => d.id === have.id);
      if (!def) throw new Error("the field was not in the list GoHighLevel returned");
      return optionsOf(def);
    };
    let now: string[] = live;
    try {
      now = await readBack();
      if (add.some((o) => !now.includes(o)) && !refused && settleMs > 0) { await new Promise((r) => setTimeout(r, settleMs)); now = await readBack(); }
    } catch (e) {
      row.status = "failed"; row.after = live;
      row.detail = `Tried to add ${quoted(add)} to "${have.name}"${refused ? ` and GoHighLevel answered: ${refused}` : ""}, but the field could not be read back (${plain(e instanceof Error ? e.message : String(e))}). Run the dry run again to see what GoHighLevel holds now.`;
      report.summary.push(row.detail);
      continue;
    }
    row.after = now;
    const lost = live.filter((o) => !now.includes(o));
    const notAdded = add.filter((o) => !now.includes(o));
    const twice = uniq(now.filter((o, i) => now.indexOf(o) !== i));
    const moved = uniq(now.filter((o) => live.includes(o))).join("\n") !== uniq(live).join("\n"); // the options it had, in the order it has them now
    if (lost.length) {
      row.status = "failed"; row.lost = lost;
      row.detail = `"${have.name}" lost ${quoted(lost)} in this call. Put ${lost.length === 1 ? "it" : "them"} back by hand now: GoHighLevel, Settings, Custom Fields, ${have.name}, Edit. It had: ${quoted(live)}. It has: ${quoted(now)}.`;
    } else if (notAdded.length) {
      row.status = "failed";
      row.detail = `Could not add ${quoted(notAdded)} to "${have.name}": ${refused ? `GoHighLevel answered: ${refused}` : "GoHighLevel accepted the call but the option is not on the field"}. The ${live.length} options it had are all still there. ${byHand(have.name, notAdded)}`;
    } else if (twice.length || moved) {
      row.status = "check";
      row.detail = `Added ${quoted(add)} to "${have.name}", and nothing was lost, but ${twice.length ? `GoHighLevel now lists ${quoted(twice)} more than once` : "the options are in a different order than before"}. Tidy the list by hand in GoHighLevel (Settings, Custom Fields, ${have.name}).`;
    } else {
      row.status = "added";
      row.detail = `Added ${quoted(add)} to "${have.name}". GoHighLevel now lists ${now.length} options; the ${live.length} it had are unchanged and in the same order.`;
    }
    report.summary.push(row.detail);
    await new Promise((r) => setTimeout(r, 150));
  }
  return report;
}
