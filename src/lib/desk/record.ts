import { CallDeskError } from "@/lib/calls/validation";
import { isoDate, TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { addTags, contactDisplayName, contactUrl, getContact, GhlError, normalizePhone, searchContacts, splitName, updateContact, type GhlContact, type GhlContactPatch, type SearchFilter } from "@/lib/ghl/client";
import { todayEastern } from "@/lib/onboarding/api";
import { STAGES, isGiveawayWinner, type StageId } from "@/lib/onboarding/config";
import { missingRequired } from "@/lib/onboarding/checklist";
import type { HandoffForm, OnboardingRow } from "@/lib/onboarding/types";
import type { DeskTabName } from "@/app/leads/types";
import { CLIENT_GROUPS, type ClientGroupId } from "@/lib/clients/config";
import { flagsFor } from "@/lib/clients/board";
import type { ClientRow } from "@/lib/clients/types";
import { parseChecklist, toChecklistItems } from "./checklist-text";
import { DESK_TAGS, deskFields, deskList, deskNumber, deskText, deskWrites, requireAllDeskFields, type DeskFieldKey, type DeskFields, type DeskValue } from "./fields";
import { joinPackages, monthlyList } from "./money";
import { memberByGhlUser } from "./team";
import { isGhlRecordId } from "./switch";

// One GoHighLevel contact per business, for its whole life: lead → onboarding → client. The Sales tab
// already works the contact (Phase 1); this module reads and writes the SAME contact for the Onboarding
// and Clients tabs through desk-owned "Desk …" fields, so every call note, handoff note, onboarding note
// and client note is one continuous history on one record.
//
//   - A contact is an onboarding record when it carries a Desk Onboarding Stage (or the desk-onboarding tag);
//     it is a client when it carries a Desk Client Status (or the desk-client tag). It can be both.
//   - The record id on the desk is the contact id. The optimistic-concurrency token is `dateUpdated`.
//   - The desk writes desk fields, desk tags, and the contact's own name / company / email / phone /
//     website when staff edit them. It never writes an LSE field, an `lse:` tag or an opportunity.
export type DeskKind = "onboarding" | "client";
export const version = (c: GhlContact): string => c.dateUpdated || c.dateAdded || "";
export const hasTag = (c: GhlContact, tag: string): boolean => (c.tags || []).includes(tag);
export const businessName = (c: GhlContact): string => (c.companyName || c.businessName || contactDisplayName(c) || c.email || "(no name)").trim();

export const stageIdForLabel = (label: string): StageId | "unknown" => STAGES.find((s) => s.label === label)?.id ?? "unknown";
export const stageLabel = (id: StageId): string => STAGES.find((s) => s.id === id)!.label;
export const groupIdForLabel = (label: string): ClientGroupId | "unknown" => CLIENT_GROUPS.find((g) => g.label === label)?.id ?? "unknown";
export const groupLabel = (id: ClientGroupId): string => CLIENT_GROUPS.find((g) => g.id === id)!.label;

export const isOnboardingRecord = (c: GhlContact, f: DeskFields): boolean => hasTag(c, DESK_TAGS.onboarding) || !!deskText(c, f, "obStage");
export const isClientRecord = (c: GhlContact, f: DeskFields): boolean => hasTag(c, DESK_TAGS.client) || !!deskText(c, f, "clientStatus");
/** A legacy client: "Desk Legacy Client" says Yes. No, blank, or a location where that field does not exist yet is a normal desk client. */
export const isLegacyClient = (c: GhlContact, f: DeskFields): boolean => deskText(c, f, "legacy").trim().toLowerCase() === "yes";

/**
 * Where this business's files and intake record live in storage. A record imported from Monday keeps its
 * Monday-era key (the pipeline item id, or "c" + the client item id) so nothing in Blob moves and a client's
 * live intake link keeps resolving; a record born on GoHighLevel uses the contact id.
 */
export function fileScopeFor(c: GhlContact, f: DeskFields): string {
  const ob = deskText(c, f, "mondayOnboardingId").trim();
  if (/^[1-9]\d{0,19}$/.test(ob)) return ob;
  const client = deskText(c, f, "mondayClientId").trim();
  if (/^[1-9]\d{0,19}$/.test(client)) return `c${client}`;
  return c.id;
}

const date = (c: GhlContact, f: DeskFields, key: DeskFieldKey) => isoDate(deskText(c, f, key));
const city = (c: GhlContact) => [c.city, c.state].filter(Boolean).join(", ");
const ownerIds = (name: string) => (name ? [name] : []);

export function mapOnboarding(c: GhlContact, f: DeskFields, today = todayEastern()): OnboardingRow {
  const t = (key: DeskFieldKey) => deskText(c, f, key);
  const packages = deskList(c, f, "packages");
  const stage = stageIdForLabel(t("obStage"));
  const checklist = toChecklistItems(parseChecklist(t("checklist")), packages);
  const due = date(c, f, "nextDue");
  const salesOwner = t("salesOwner") || memberByGhlUser(c.assignedTo)?.name || "";
  return {
    id: c.id, name: businessName(c), url: contactUrl(c.id), updatedAt: version(c),
    stage, group: t("obStage"), health: t("obHealth"),
    onboardingOwner: t("obOwner"), onboardingOwnerIds: ownerIds(t("obOwner")), salesOwner, salesOwnerIds: ownerIds(salesOwner), buildOwner: t("buildOwner"),
    contact: contactDisplayName(c), email: c.email || "", phone: c.phone || "", city: city(c), businessType: t("businessType"),
    packages: joinPackages(packages), monthly: String(monthlyList(packages, deskNumber(c, f, "customMonthly"))), setup: deskNumber(c, f, "setup"), customMonthly: deskNumber(c, f, "customMonthly"),
    signed: date(c, f, "signed"), targetLaunch: date(c, f, "targetLaunch"), nextAction: t("nextAction"), lastTouch: date(c, f, "lastTouch"),
    gbpAccess: t("gbpAccess"), dnsPath: t("dnsPath"), agreement: t("agreement"), payment: t("obPayment"), intake: t("intake"),
    leadId: c.id, handoffId: t("handoffId"), siteUrl: c.website || "", gbpUrl: t("gbpUrl"), onboardingLink: t("deskLink"), driveFolder: t("driveFolder"), notes: t("notes"),
    searchAtlasListing: t("searchAtlasListing").trim(), ghlContact: contactUrl(c.id),
    profileComplete: t("profileComplete") === "Yes", baseline: t("baseline") === "Yes",
    checklist, missing: missingRequired(checklist),
    overdue: !!due && due < today && stage !== "launched",
  };
}
/** The next-action due date is not on the row (the desk only shows "overdue"); the panel's editor needs it. */
export const nextDueOf = (c: GhlContact, f: DeskFields): string => date(c, f, "nextDue");

export function mapClient(c: GhlContact, f: DeskFields, today = todayEastern()): ClientRow {
  const t = (key: DeskFieldKey) => deskText(c, f, key);
  const packages = deskList(c, f, "packages");
  const manager = t("accountManager");
  const base: Omit<ClientRow, "flags"> = {
    id: c.id, name: businessName(c), url: contactUrl(c.id), updatedAt: version(c),
    group: groupIdForLabel(t("clientStatus")), groupTitle: t("clientStatus"), health: t("clientHealth"),
    packages: joinPackages(packages), mrr: String(monthlyList(packages, deskNumber(c, f, "customMonthly"))), customMonthly: deskNumber(c, f, "customMonthly"),
    accountManager: manager, accountManagerIds: ownerIds(manager),
    contact: contactDisplayName(c), email: c.email || "", phone: c.phone || "", website: c.website || "", gbpUrl: t("gbpUrl"), ghlContact: contactUrl(c.id), driveFolder: t("driveFolder"), notes: t("notes"),
    payStatus: t("payStatus"), payMethod: t("payMethod"), billingDay: deskNumber(c, f, "billingDay"), nextBill: date(c, f, "nextBill"), lastPayment: date(c, f, "lastPayment"), clientSince: date(c, f, "clientSince"), termEnds: date(c, f, "termEnds"), lastReport: date(c, f, "lastReport"),
    gbpAccess: t("gbpAccess"), gbpChecked: date(c, f, "gbpChecked"), stripeCustomer: t("stripeCustomer").trim(),
    // The onboarding record is the same contact; the id lets the panel link back to it.
    onboardingItem: isOnboardingRecord(c, f) ? c.id : "", teamDesk: true,
    searchAtlasListing: t("searchAtlasListing").trim(), gbpLive: null,
    legacy: isLegacyClient(c, f),
  };
  return { ...base, flags: flagsFor(base, today) }; // the same problem rules as the Monday Clients tab
}
/** "One place at a time": a client whose onboarding is not Launched yet stays on the Onboarding tab. */
export const stillOnboarding = (c: GhlContact, f: DeskFields): boolean => isOnboardingRecord(c, f) && stageIdForLabel(deskText(c, f, "obStage")) !== "launched";

// ───────────────────────────── which tab a contact is on ─────────────────────────────
// The one definition of "this business is on the Onboarding tab / the Clients tab". The two tabs list by it, and the Sales tab
// leaves out every contact it places (Dave, Oct 9 2026: "Once they move to onboarding and active clients, we don't need to be
// able to find those people in the sales section") — so the three tabs cannot disagree about where a business is.
/** The Onboarding tab lists every onboarding record, whatever its stage (a launched one waits under "Show launched"). */
export const onOnboardingTab = (c: GhlContact, f: DeskFields): boolean => isOnboardingRecord(c, f);
/** The Clients tab lists every client record that is not still onboarding ("one place at a time"): active, paused, at risk, churned, legacy — all of them. */
export const onClientsTab = (c: GhlContact, f: DeskFields): boolean => isClientRecord(c, f) && !stillOnboarding(c, f);
export type DeskTab = DeskTabName;
/** Where on the desk this contact is, or null when it is on neither tab. A launched record that is also a client reads as "clients" (the Onboarding tab hides launched records unless asked). */
export function deskTabOf(c: GhlContact, f: DeskFields): DeskTab | null {
  if (onClientsTab(c, f)) return "clients";
  if (onOnboardingTab(c, f)) return "onboarding";
  return null;
}
/**
 * The Sales tab's rule, ready to apply to each contact on the roster. It reads the desk field definitions from the same
 * ten-minute cache the roster itself uses, so it costs no request of its own, and it never refuses: a location where a desk
 * field is missing places contacts by the desk tags alone (as the tabs' own lists do when the field filter is refused).
 */
export async function deskTabRule(): Promise<(c: GhlContact) => DeskTab | null> {
  const f = await deskFields();
  return (c) => deskTabOf(c, f);
}

// ───────────────────────────── reads ─────────────────────────────
/** `fresh` re-reads the definitions from GoHighLevel instead of the 10-minute cache — for the moment after someone changed a field's options there. */
export async function allDeskFields(fresh = false): Promise<DeskFields> {
  const fields = await deskFields(fresh);
  requireAllDeskFields(fields);
  return fields;
}
/** One contact, fresh (never from the search index). A contact GoHighLevel no longer has is a 404, not a 502. */
export async function readContact(id: string): Promise<GhlContact> {
  if (!isGhlRecordId(id)) throw new CallDeskError("Invalid client.", 400);
  try { return await getContact(id); }
  catch (e) {
    if (e instanceof GhlError && [400, 404, 422].includes(e.ghlStatus)) throw new CallDeskError("This client is not in GoHighLevel (the contact may have been deleted or merged there).", 404);
    throw e;
  }
}

const PAGE = 500;
const MAX_PAGES = 4;
async function searchAll(filters: SearchFilter[]): Promise<GhlContact[]> {
  const all: GhlContact[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const r = await searchContacts({ filters, page, pageLimit: PAGE, sort: [{ field: "dateAdded", direction: "desc" }] }, { timeoutMs: 25000 });
    all.push(...r.contacts);
    if (r.contacts.length < PAGE) break;
  }
  return [...new Map(all.map((c) => [c.id, c])).values()];
}
/**
 * Every onboarding record (or every client). Membership is "has the desk tag OR has the stage field"; if
 * GoHighLevel rejects the custom-field clause the list falls back to the tag alone rather than come up empty.
 * The designated test contact never shows in a list (it stays reachable by id). Search results lag writes by a
 * few seconds — anything that must be fresh reads the contact by id instead.
 */
export async function listRecords(kind: DeskKind, f: DeskFields, opts: { strict?: boolean } = {}): Promise<GhlContact[]> {
  const tag = kind === "onboarding" ? DESK_TAGS.onboarding : DESK_TAGS.client;
  const fieldId = f[kind === "onboarding" ? "obStage" : "clientStatus"]?.id;
  const byTag: SearchFilter = { field: "tags", operator: "eq", value: tag };
  let found: GhlContact[];
  try { found = await searchAll(fieldId ? [{ group: "OR", filters: [byTag, { field: `customFields.${fieldId}`, operator: "exists" }] }] : [byTag]); }
  catch (e) {
    if (!(e instanceof GhlError) || ![400, 422].includes(e.ghlStatus) || !fieldId) throw e;
    // The tag-only list can miss a record whose tag was never added. Good enough to show a tab; not good enough to decide
    // that nobody is a giveaway winner — a strict caller gets an error instead of a shorter list.
    if (opts.strict) throw new CallDeskError("GoHighLevel refused the filter the desk uses to list its records, so the list may be incomplete.", 503);
    console.error(`desk ${kind} list: custom-field filter rejected by GoHighLevel (${e.ghlStatus}), retrying with the tag only`);
    found = await searchAll([byTag]);
  }
  const member = kind === "onboarding" ? isOnboardingRecord : isClientRecord;
  return found.filter((c) => c.id !== TEST_CONTACT_ID && member(c, f));
}

/** A Monday-era id (an old link, a tab left open across the switch) → the contact it was imported to. 404 when nothing was imported under that id. */
export async function resolveRecordId(id: string, kind: DeskKind, f: DeskFields): Promise<string> {
  if (isGhlRecordId(id)) return id;
  const key: DeskFieldKey = kind === "onboarding" ? "mondayOnboardingId" : "mondayClientId";
  const hit = (await listRecords(kind, f)).find((c) => deskText(c, f, key).trim() === id);
  if (!hit) throw new CallDeskError("That link points at a record from the old board that was not brought over to GoHighLevel. Open the client from the list instead.", 404);
  return hit.id;
}

// ───────────────────────────── writes ─────────────────────────────
export type DeskValues = Partial<Record<DeskFieldKey, DeskValue>>;
/** One PUT: desk fields (shaped per live type) plus, optionally, the contact's own name / company / email / phone / website. Never `tags` (PUT would replace the list) and never `locationId`. */
export async function writeRecord(id: string, f: DeskFields, values: DeskValues, native: Omit<GhlContactPatch, "customFields" | "tags"> = {}): Promise<void> {
  const customFields = deskWrites(f, values);
  if (!customFields.length && !Object.keys(native).length) return;
  await updateContact(id, { ...native, ...(customFields.length ? { customFields } : {}) });
}
export async function ensureTag(c: GhlContact, tag: string): Promise<void> {
  if (!(Object.values(DESK_TAGS) as string[]).includes(tag)) throw new CallDeskError(`Refusing to add the tag "${tag}": the desk only adds its own tags.`, 500);
  if (!hasTag(c, tag)) await addTags(c.id, [tag]);
}

// ───────────────────────────── handoff → field values ─────────────────────────────
/** The note that sits in "Desk Notes" from the day of the handoff (the same lines the Monday Notes column got). */
export function handoffNotes(form: HandoffForm): string {
  return [
    isGiveawayWinner(form.packages) && "GIVEAWAY WINNER — NO CHARGE. Do not invoice or set up a recurring plan.",
    `Monthly agreed: ${form.monthlyAgreed ? `$${form.monthlyAgreed}` : "not recorded"} · Setup agreed: ${form.setupAgreed ? `$${form.setupAgreed}` : "not recorded"}`,
    `Scope: ${form.scope}`, form.exclusions && `Exclusions: ${form.exclusions}`, form.goals && `Goals: ${form.goals}`,
  ].filter(Boolean).join("\n");
}
/** Desk fields for a brand-new onboarding record. Agreed monthly is NOT turned into a price field — it lives in the notes and the handoff record, as before. */
export function handoffValues(form: HandoffForm, today: string, deskLink: string): DeskValues {
  const values: DeskValues = {
    obStage: stageLabel("new"), obHealth: "Not Started", gbpAccess: "Not Requested", intake: "Not sent",
    agreement: form.agreement, obPayment: form.payment, packages: [...form.packages], handoffId: form.handoffId,
    signed: today, lastTouch: today, salesOwner: form.salesOwner, notes: handoffNotes(form),
    nextAction: form.nextAction ? `${form.nextOwner ? `${form.nextOwner}: ` : ""}${form.nextAction}` : "Madison: send the intake link and request assets",
    nextDue: form.nextDue || "",
  };
  if (form.businessType) values.businessType = form.businessType;
  if (form.startDate) values.targetLaunch = form.startDate;
  if (form.setupAgreed) values.setup = form.setupAgreed;
  if (deskLink) values.deskLink = deskLink;
  return values;
}
/** The contact's own fields from the handoff form: fill what is blank; the business name is the one thing the rep's form wins on. Email and phone are never overwritten. */
export function handoffNative(form: HandoffForm, existing: GhlContact | null): Omit<GhlContactPatch, "customFields" | "tags"> {
  const native: Omit<GhlContactPatch, "customFields" | "tags"> = {};
  const { firstName, lastName } = splitName(form.contact);
  if (!existing?.firstName && !existing?.lastName && firstName) { native.firstName = firstName; if (lastName) native.lastName = lastName; }
  if (form.business && form.business !== (existing?.companyName || "")) native.companyName = form.business.slice(0, 200);
  if (!existing?.email && form.email) native.email = form.email.toLowerCase();
  if (!existing?.phone && form.phone) native.phone = normalizePhone(form.phone);
  if (!existing?.website && form.website) native.website = form.website.includes(":") ? form.website : `https://${form.website}`;
  if (!existing?.city && form.city) {
    const [town, state] = form.city.split(",").map((s) => s.trim());
    if (town) native.city = town;
    if (state && /^[A-Za-z]{2}$/.test(state) && !existing?.state) native.state = state.toUpperCase();
  }
  return native;
}
/** Plain-text handoff summary (GoHighLevel notes are not HTML). Same rows and the same marker as the Monday update. */
export function handoffSummary(form: HandoffForm): string {
  const rows: [string, string][] = [
    ["Business", form.business], ["Contact", [form.contact, form.email, form.phone].filter(Boolean).join(" · ")], ["Website", form.website], ["Location", form.city],
    ["Sales owner", form.salesOwner], ["Packages", form.packages.join(", ")], ["Monthly agreed", form.monthlyAgreed ? `$${form.monthlyAgreed}` : "Not recorded"], ["Setup agreed", form.setupAgreed ? `$${form.setupAgreed}` : "Not recorded"],
    ["Scope", form.scope], ["Exclusions", form.exclusions], ["Goals", form.goals], ["Promises / call context", form.context], ["Expected start", form.startDate],
    ["Agreement", form.agreement], ["Payment", form.payment], ["Next action", [form.nextOwner, form.nextAction, form.nextDue && `due ${form.nextDue}`].filter(Boolean).join(" — ")],
  ];
  return `Sales → onboarding handoff\n${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v.replace(/\r/g, "").trim()}`).join("\n")}`;
}
