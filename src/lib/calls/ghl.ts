import { createHmac, timingSafeEqual } from "node:crypto";
import type { CallDraft, CallHistory, CallLead, CallsPageData, SaveCallResult } from "@/app/leads/types";
import { CallDeskError, GHL_ID, MONDAY_ID } from "./validation";
import { isCallOutcome, mondayOutcome } from "./outcomes";
import { prettyTime } from "./followup-time";
import { callMarker, handoffMarker, payloadMarker, readableHistory } from "./markers";
import { addNote, addTags, contactDisplayName, contactUrl, fieldText, getContact, listNotes, searchContacts, updateContact, type GhlContact, type GhlNote, type SearchFilter } from "@/lib/ghl/client";
import { INTEREST_OPTIONS, leadSourceOptions, requireField, salesFields, type SalesFields } from "@/lib/ghl/fields";
import { ghlRepIds, ghlRepName, REP_NAMES, type RepName } from "@/lib/ghl/reps";

// The sales desk on GoHighLevel (Oct 1 2026, Dave: "swap the leads coming in to GHL"). A lead is a GHL
// contact; the desk's columns are contact custom fields (src/lib/ghl/fields.ts); call notes are GHL
// notes carrying the same [CC-CALL:…] markers Monday updates did; the owner is `assignedTo`; the
// optimistic-concurrency token is the contact's `dateUpdated`. Same guarantees as src/lib/calls/monday.ts:
// server only, board-locked (location-locked), append-only notes, retry/conflict guards.
//
// Which contacts are "leads": anything tagged with one of LEAD_TAGS (the three intake routes tag their
// contacts; `sales-lead` is for a rep to push any contact onto the desk by hand in GHL) OR anything with
// a Lead Source set (the backfill/migration). Search results lag writes by a few seconds (GHL docs).
export const LEAD_TAGS = ["giveaway-entrant", "playbook-lead", "website-form", "sales-lead"] as const;
export const WON_TAG = "sales-won";
/** The designated GHL test contact (package-builder and desk checks on production). Never shown on the roster; still reachable by id. */
export const TEST_CONTACT_ID = "C8FHl1LIfXEMI9isByB2";
const PAGE = 500; // GHL's max per search page
const MAX_PAGES = 4; // 2,000 leads per list call is plenty; the cursor continues past that

const todayEastern = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
// A Monday item id is all digits and must never be sent to GHL as a contact id.
const requireGhlId = (id: string) => { if (!GHL_ID.test(id) || MONDAY_ID.test(id)) throw new CallDeskError("Invalid lead.", 400); return id; };

/**
 * LEADS_GHL_TAGS narrows the roster without a code change: a comma list of tags, e.g. "sales-lead,playbook-lead,website-form"
 * shows only the leads imported from the Monday board plus new ebook and website leads (the import tags every Monday lead
 * `sales-lead`). When it is set, "has a Lead Source" no longer pulls a contact in — the tags are the whole rule.
 */
export function rosterTags(env = process.env.LEADS_GHL_TAGS): { tags: string[]; custom: boolean } {
  const list = (env || "").split(",").map((s) => s.trim()).filter((s) => /^[\w .-]{1,60}$/.test(s));
  return list.length ? { tags: list, custom: true } : { tags: [...LEAD_TAGS], custom: false };
}
export function rosterFilters(leadSourceFieldId?: string, env = process.env.LEADS_GHL_TAGS): SearchFilter[] {
  const { tags, custom } = rosterTags(env);
  const any: SearchFilter[] = tags.map((t) => ({ field: "tags", operator: "eq", value: t }));
  if (leadSourceFieldId && !custom) any.push({ field: `customFields.${leadSourceFieldId}`, operator: "exists" });
  return [{ group: "OR", filters: any }];
}

/**
 * A GHL DATE custom field as YYYY-MM-DD. GHL has returned these both as an ISO string and as an epoch
 * (ms or s) depending on how the value was written, so accept either: an epoch that is exactly midnight
 * UTC is a date-only value (read it in UTC); anything else is a moment, read in Eastern.
 */
export function isoDate(v: string): string {
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(v)?.[0];
  if (iso) return iso;
  let ms = NaN;
  if (/^\d{9,14}$/.test(v)) ms = v.length <= 10 ? Number(v) * 1000 : Number(v);
  else if (v) ms = Date.parse(v);
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) return d.toISOString().slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function mapLead(c: GhlContact, fields: SalesFields): CallLead {
  const f = (key: keyof SalesFields) => fieldText(c, fields[key]?.id);
  const person = contactDisplayName(c);
  const ownerId = c.assignedTo || "";
  const ownerName = ghlRepName(ownerId);
  const outreach = f("outreach") || ((c.tags || []).includes(WON_TAG) ? "Won" : "");
  const quoted = f("quotedMonthly").replace(/[^\d.]/g, "").replace(/\.0+$/, "");
  const leadSource = f("leadSource");
  return {
    id: c.id, name: (c.companyName || c.businessName || person || c.email || "(no name)").trim(), contact: person,
    email: c.email || "", phone: c.phone || "", website: c.website || "", city: [c.city, c.state].filter(Boolean).join(", "),
    owner: ownerName || (ownerId ? "Assigned in GHL" : ""), ownerId, ownerIds: ownerId ? [ownerId] : [], ownerName,
    outreach, interest: f("interest"), notes: f("salesNotes"), lastContact: isoDate(f("lastContact")),
    nextFollowup: isoDate(f("nextFollowup")), nextFollowupTime: /^\d{2}:\d{2}$/.test(f("nextFollowupTime")) ? f("nextFollowupTime") : "",
    quotedMonthly: quoted, interestedIn: f("interestedIn"), auditScore: f("auditScore"), auditReport: f("auditReport"),
    group: outreach === "Won" ? "Won" : leadSource || "Leads", leadSource,
    updatedAt: c.dateUpdated || c.dateAdded || "", recordUrl: contactUrl(c.id),
  };
}

// Signed page cursor. Keyed on the site secret (not a vendor token): rotating NEXTAUTH_SECRET invalidates open pages, nothing else.
const cursorSecret = () => process.env.NEXTAUTH_SECRET || process.env.GHL_API_TOKEN || "";
function signCursor(body: string): string { return createHmac("sha256", cursorSecret()).update(`ghl-desk-cursor.${body}`).digest("base64url"); }
function wrapCursor(page: number | null): string | null {
  if (!page) return null;
  const body = Buffer.from(JSON.stringify({ page, expires: Date.now() + 55 * 60000 })).toString("base64url");
  return `${body}.${signCursor(body)}`;
}
export function unwrapCursor(value: string | null): number {
  if (value === null) return 1;
  if (value.length > 400 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new CallDeskError("Invalid page. Reload the lead list.", 400);
  const [body, signature] = value.split(".");
  const expected = Buffer.from(signCursor(body)); const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new CallDeskError("Invalid page. Reload the lead list.", 400);
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!Number.isInteger(decoded.page) || decoded.page < 1 || decoded.page > 20 || !Number.isFinite(decoded.expires) || decoded.expires <= Date.now()) throw new Error("invalid");
    return decoded.page;
  } catch { throw new CallDeskError("This page has expired. Reload the lead list.", 400); }
}

export const ghlOwners = () => { const ids = ghlRepIds(); return REP_NAMES.map((name) => ({ id: ids[name], name })); };

/** Whole roster in one call when it fits (≤ 2,000), newest first; the cursor continues otherwise. */
export async function getCallsPage(cursor: string | null): Promise<CallsPageData> {
  const fields = await salesFields();
  const start = unwrapCursor(cursor);
  const leads: CallLead[] = [];
  let next: number | null = null;
  let filters = rosterFilters(fields.leadSource?.id);
  for (let page = start; page < start + MAX_PAGES; page++) {
    let result: { contacts: GhlContact[]; total: number };
    try { result = await searchContacts({ filters, page, pageLimit: PAGE, sort: [{ field: "dateAdded", direction: "desc" }] }, { timeoutMs: 25000 }); }
    catch (e) {
      // If GHL rejects the custom-field clause, fall back to tags only rather than show an empty desk.
      if (fields.leadSource?.id && filters.length && (e as { ghlStatus?: number }).ghlStatus === 400 && page === start) {
        console.error("ghl roster: custom-field filter rejected, retrying with tags only");
        filters = rosterFilters(undefined);
        result = await searchContacts({ filters, page, pageLimit: PAGE, sort: [{ field: "dateAdded", direction: "desc" }] }, { timeoutMs: 25000 });
      } else throw e;
    }
    leads.push(...result.contacts.filter((c) => c.id !== TEST_CONTACT_ID).map((c) => mapLead(c, fields)));
    if (result.contacts.length < PAGE) { next = null; break; }
    next = page + 1;
  }
  return { leads, cursor: wrapCursor(next), boardName: "GoHighLevel · Creative Cowboys contacts", system: "ghl", systemName: "GoHighLevel", owners: ghlOwners(), leadSources: leadSourceOptions(fields) };
}

function mapHistory(notes: GhlNote[]): CallHistory[] {
  return notes.map((n) => ({ id: n.id, text: readableHistory(n.body || ""), createdAt: n.dateAdded || "", author: ghlRepName(n.userId) || "Team", isCallNote: (n.body || "").includes("[CC-CALL:") }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getCallLead(id: string): Promise<{ lead: CallLead; history: CallHistory[] }> {
  requireGhlId(id);
  const [fields, contact, notes] = await Promise.all([salesFields(), getContact(id), listNotes(id)]);
  return { lead: mapLead(contact, fields), history: mapHistory(notes) };
}

const version = (c: GhlContact) => c.dateUpdated || c.dateAdded || "";

/** Assign (or clear) the GHL owner. Returns the refreshed lead so the desk can update in place. */
export async function assignOwner(id: string, owner: RepName | "", expectedUpdatedAt: string): Promise<CallLead> {
  requireGhlId(id);
  const fields = await salesFields();
  const initial = await getContact(id);
  if (version(initial) !== expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your notes are safe. Load the latest record before assigning it.", 409);
  const userId = owner ? ghlRepIds()[owner] : null;
  await updateContact(id, { assignedTo: userId });
  const confirmed = await getContact(id);
  if ((confirmed.assignedTo || "") !== (userId || "")) throw new CallDeskError("The GoHighLevel owner changed before confirmation. Your notes are safe. Load the latest record to check the assignment.", 409);
  return mapLead(confirmed, fields);
}

/** Change the Lead Source dropdown. The value must be one of the field's options as GHL currently has them. */
export async function setLeadSource(id: string, value: string, expectedUpdatedAt: string): Promise<CallLead> {
  requireGhlId(id);
  const fields = await salesFields(true);
  const field = requireField(fields, "leadSource");
  if (!field.options.includes(value)) throw new CallDeskError(`"${value}" is not a Lead Source option in GoHighLevel. Options: ${field.options.join(", ") || "none yet"}.`, 400);
  const initial = await getContact(id);
  if (version(initial) !== expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Load the latest record before changing its source.", 409);
  await updateContact(id, { customFields: [{ id: field.id, field_value: value }] });
  const confirmed = await getContact(id);
  if (fieldText(confirmed, field.id) !== value) throw new CallDeskError("GoHighLevel did not confirm the new lead source. Reload the lead to check it.", 409);
  return mapLead(confirmed, fields);
}

const esc = (s: string) => s.replace(/\r/g, "").trim();
/** Plain-text note (GHL notes are not HTML). Same fields and markers as the Monday version. */
export function formatCallNote(draft: CallDraft): string {
  const rows: [string, string][] = [
    ["Rep", draft.rep], ["Outcome", draft.outcome], ["Business goal", draft.goal], ["Current marketing", draft.currentMarketing],
    ["Main challenge", draft.challenge], ["Budget discussed", draft.budget], ["Timing", draft.timing], ["Recommendation", draft.recommendation],
    ["Conversation notes", draft.notes], ["Next step", draft.nextStep], ["Interest", draft.interest],
    ["Follow-up date", draft.followupDate ? `${draft.followupDate}${draft.followupTime ? ` around ${prettyTime(draft.followupTime)}` : ""}` : ""],
    ["Monthly quote discussed", draft.quotedMonthly ? `$${draft.quotedMonthly}` : ""],
  ];
  return `Call note — Creative Cowboys desk\n${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${esc(v)}`).join("\n")}\n\n${callMarker(draft.callId)} ${payloadMarker(draft)}`;
}

/** Field writes for a saved call. Blank optional values mean leave GHL unchanged, never erase existing information. */
export function callFields(draft: CallDraft, today: string, fields: SalesFields): { id: string; field_value: unknown }[] {
  if (!isCallOutcome(draft.outcome)) throw new CallDeskError("Choose a valid call outcome.", 400);
  const out: { id: string; field_value: unknown }[] = [
    { id: requireField(fields, "outreach").id, field_value: mondayOutcome(draft.outcome) },
    { id: requireField(fields, "lastContact").id, field_value: today },
  ];
  if (draft.interest && (INTEREST_OPTIONS as readonly string[]).includes(draft.interest)) out.push({ id: requireField(fields, "interest").id, field_value: draft.interest });
  if (draft.followupDate) {
    out.push({ id: requireField(fields, "nextFollowup").id, field_value: draft.followupDate });
    out.push({ id: requireField(fields, "nextFollowupTime").id, field_value: draft.followupTime || "" });
  }
  if (draft.quotedMonthly) out.push({ id: requireField(fields, "quotedMonthly").id, field_value: Number(draft.quotedMonthly) });
  return out;
}
const sameFields = (before: GhlContact, after: GhlContact, ids: string[]) => ids.every((id) => fieldText(before, id) === fieldText(after, id));

// A process-local guard reduces double clicks on the same warm instance. It is NOT a distributed lock:
// GHL has no compare-and-set either; the note marker + version check are what make a retry safe.
const savingLeads = new Set<string>();
export async function saveCall(draft: CallDraft): Promise<SaveCallResult> {
  requireGhlId(draft.leadId);
  if (savingLeads.has(draft.leadId)) throw new CallDeskError("A call for this lead is already saving. Keep your draft and retry in a moment.", 409);
  savingLeads.add(draft.leadId);
  try {
    const fields = await salesFields();
    const initial = await getContact(draft.leadId);
    const recordUrl = contactUrl(draft.leadId);
    const prior = (await listNotes(draft.leadId)).find((n) => (n.body || "").includes(callMarker(draft.callId)));
    if (prior) {
      if (!(prior.body || "").includes(payloadMarker(draft))) throw new CallDeskError("A different version of this call note is already in GoHighLevel. Your edited draft has not been saved. Review the existing note before starting a new call record.", 409);
      return { saved: true, updateId: prior.id, recordUrl, warning: "This call note was already saved. Field completion could not be confirmed, so no fields were overwritten. Review the lead in GoHighLevel." };
    }
    if (version(initial) !== draft.expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your draft is safe. Reload the lead and review the changes before saving.", 409);
    const columns = callFields(draft, todayEastern(), fields); // resolve the fields BEFORE writing the note, so a missing field can't leave a half-saved call
    let updateId: string;
    // Authored as the rep (GHL user id) so the note reads as theirs in GHL, not as the integration's.
    try { updateId = (await addNote(draft.leadId, formatCallNote(draft), ghlRepIds()[draft.rep])).id; }
    catch { throw new CallDeskError("GoHighLevel did not confirm the call note. It may already be saved. Keep this draft and retry with the same call reference; do not start a new call.", 502); }
    const saved = { saved: true as const, updateId, recordUrl };
    try {
      const fresh = await getContact(draft.leadId);
      if (!sameFields(initial, fresh, columns.map((c) => c.id))) return { ...saved, warning: "Your call note is saved. Another change was detected, so the status, follow-up and quote were left unchanged. Review them in GoHighLevel." };
      await updateContact(draft.leadId, { customFields: columns });
      return saved;
    } catch {
      return { ...saved, warning: "Your call note is saved. GoHighLevel did not confirm all field updates. Check the status, follow-up date, and quote in GoHighLevel before making further changes." };
    }
  } finally { savingLeads.delete(draft.leadId); }
}

/** Handoff: status Won, last contact today, `sales-won` tag, and one append-only note (idempotent on the handoff id). */
export async function markSourceLead(leadId: string, itemUrl: string, handoffId: string): Promise<void> {
  requireGhlId(leadId);
  const fields = await salesFields();
  await getContact(leadId); // 404s cleanly when the contact is gone
  const marker = handoffMarker(handoffId);
  const notes = await listNotes(leadId);
  if (!notes.some((n) => (n.body || "").includes(marker))) {
    await addNote(leadId, `Handed off to onboarding.\nRecord: ${itemUrl}\nCall history stays on this contact; onboarding work continues on the Onboarding Pipeline board.\n\n${marker}`);
  }
  await updateContact(leadId, { customFields: [{ id: requireField(fields, "outreach").id, field_value: "Won" }, { id: requireField(fields, "lastContact").id, field_value: todayEastern() }] });
  await addTags(leadId, [WON_TAG]).catch((e) => console.error(`ghl handoff: won tag failed for ${leadId}: ${e instanceof Error ? e.message : e}`));
}

export async function readLeadVersion(leadId: string): Promise<{ updatedAt: string; name: string }> {
  requireGhlId(leadId);
  const c = await getContact(leadId);
  return { updatedAt: version(c), name: (c.companyName || contactDisplayName(c) || c.email || leadId).trim() };
}
