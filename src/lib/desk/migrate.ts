import { CallDeskError, MONDAY_ID } from "@/lib/calls/validation";
import { importMarker } from "@/lib/calls/markers";
import { addNote, addTags, contactDisplayName, createContact, fieldText, getContact, ghlLocationId, listNotes, normalizePhone, searchContacts, splitName, updateContact, upsertContact, type GhlContact, type GhlContactPatch } from "@/lib/ghl/client";
import { ghlIdFromLink } from "@/lib/ghl/admin";
import { salesFields, type SalesFields } from "@/lib/ghl/fields";
import { monday } from "@/lib/onboarding/api";
import { COL, PIPELINE_BOARD_ID, STAGES, SUBITEM_COL, TEMPLATE_GROUP_ID, isGiveawayWinner } from "@/lib/onboarding/config";
import { splitNextAction } from "@/lib/onboarding/pipeline";
import { readIntake, writeIntake } from "@/lib/onboarding/store";
import { CCOL, CLIENTS_BOARD_ID, CLIENT_GROUPS } from "@/lib/clients/config";
import { snapshot, stripeConnected } from "@/lib/clients/stripe";
import { parseChecklist, serializeChecklist, type StoredItem } from "./checklist-text";
import { DESK_FIELDS, DESK_TAGS, deskList, deskText, deskWrites, type DeskFieldKey, type DeskFields } from "./fields";
import { splitPackages } from "./money";
import { summaryMarker } from "./onboarding";
import { allDeskFields, type DeskValues } from "./record";
import { isGhlRecordId } from "./switch";
import { deskTeam, isTeamName, memberByName, nameForMondayId } from "./team";

// One-time cutover tool behind POST /api/team/ghl/desk-migrate (owner-only): the Onboarding Pipeline and
// Active Clients boards → the GoHighLevel contact for each business. Dry-run by default, batchable
// (offset / limit), restrictable to listed Monday items (onlyIds) and idempotent — a contact that already
// carries the Monday item id is skipped unless `force`. This is the ONE place on the GoHighLevel side that
// reads Monday; it never writes to Monday.
//
// What it writes on a contact: desk fields ("Desk …"), the desk tags, the contact's own name / company /
// email / phone / website / city ONLY where blank, the owner (assignedTo) only where there is none, and one
// note per Monday update (marked, so a re-run never copies it twice). Never an LSE field or an `lse:` tag.
// What it writes in storage: `contactId` on the client's existing intake record — nothing is moved or renamed,
// so links clients were already sent keep resolving.
//
// Match order for an Onboarding Pipeline item:
//   already imported (Desk Monday Onboarding ID) → explicit `map` → the board's GHL Contact link → the lead it was
//   handed off from (Lead ID: a contact id, or the Monday lead id Phase 1 imported) → email → phone → exact business
//   name (one candidate only) → create (needs an email or a phone; name-only creation is opt-in).
// For an Active Clients item: already imported (Desk Monday Client ID) → `map` → its onboarding record's contact →
//   GHL Contact link → Stripe customer → email → phone → exact business name → create.
// Only rows with "Team desk" checked are imported unless includeOffDesk (Dave, Sep 24: the other clients stay Josh's bookkeeping).
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Column = { id: string; text: string | null; value: string | null };
type Update = { id: string; text_body: string | null; created_at: string; creator: { name: string } | null };
type Sub = { id: string; name: string; column_values: Column[] };
export type MondayRow = { id: string; name: string; group: { id: string; title: string } | null; column_values: Column[]; subitems?: Sub[] | null; updates?: Update[] };

const PIPELINE_COLUMNS = [...new Set([...Object.values(COL), "build_week"])];
const UPDATES_PER_ITEM = 50; // the newest 50 updates of an item are copied as notes; the report warns when an item has that many
const CLIENT_COLUMNS = Object.values(CCOL);
async function readBoard(boardId: string, columns: string[], withSubitems: boolean): Promise<MondayRow[]> {
  const rows: MondayRow[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data: { boards: { items_page: { cursor: string | null; items: MondayRow[] } }[] } = await monday(
      `query DeskMigrate($board: [ID!]!, $cursor: String) { boards(ids: $board) { items_page(limit: 100, cursor: $cursor) { cursor items { id name group { id title } column_values(ids: ${JSON.stringify(columns)}) { id text value } ${withSubitems ? `subitems { id name column_values(ids: ${JSON.stringify(Object.values(SUBITEM_COL))}) { id text value } }` : ""} updates(limit: ${UPDATES_PER_ITEM}) { id text_body created_at creator { name } } } } } }`,
      { board: [boardId], cursor }, 25000,
    );
    const pg = data.boards?.[0]?.items_page;
    if (!pg) throw new CallDeskError(`Monday board ${boardId} is not available to this connection.`, 502);
    rows.push(...pg.items); cursor = pg.cursor;
    if (!cursor) break;
  }
  return rows;
}

// ───────────────────────────── reading a Monday row ─────────────────────────────
const parse = (v: string | null): unknown => { try { return JSON.parse(v || "null"); } catch { return null; } };
const col = (row: MondayRow, id: string) => row.column_values.find((c) => c.id === id);
const text = (row: MondayRow, id: string) => (col(row, id)?.text || "").trim();
const link = (row: MondayRow, id: string) => { const v = parse(col(row, id)?.value || null) as { url?: unknown } | null; return typeof v?.url === "string" ? v.url.trim() : ""; };
const checked = (row: MondayRow, id: string) => { const v = parse(col(row, id)?.value || null) as { checked?: unknown } | null; return v?.checked === true || v?.checked === "true"; };
const date = (row: MondayRow, id: string) => /^\d{4}-\d{2}-\d{2}/.exec(text(row, id))?.[0] || "";
/** A people column → a desk team name: by Monday person id first, then by the first name Monday shows. "" when nobody on the team matches. */
export function personName(row: MondayRow, id: string): string {
  const raw = parse(col(row, id)?.value || null) as { personsAndTeams?: { id?: unknown; kind?: string }[] } | null;
  for (const p of raw?.personsAndTeams || []) { const name = p?.kind === "person" && p.id != null ? nameForMondayId(String(p.id)) : ""; if (name) return name; }
  const first = text(row, id).split(",")[0].trim().split(/\s+/)[0] || "";
  return deskTeam().find((m) => m.name.toLowerCase() === first.toLowerCase())?.name || "";
}

// ───────────────────────────── matching ─────────────────────────────
const nameKey = (v: string) => v.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
export type DeskIndex = {
  byId: Map<string, GhlContact>; byEmail: Map<string, GhlContact>; byPhone: Map<string, GhlContact>; byCompany: Map<string, GhlContact[]>;
  byMondayOnboarding: Map<string, GhlContact>; byMondayClient: Map<string, GhlContact>; byMondayLead: Map<string, GhlContact>; byStripe: Map<string, GhlContact>; total: number;
};
/** Every contact in the location, indexed once per run. Contacts arrive oldest first, so the earliest wins a duplicate email / phone. */
export function indexForDesk(contacts: GhlContact[], f: DeskFields, sales: SalesFields): DeskIndex {
  const ix: DeskIndex = { byId: new Map(), byEmail: new Map(), byPhone: new Map(), byCompany: new Map(), byMondayOnboarding: new Map(), byMondayClient: new Map(), byMondayLead: new Map(), byStripe: new Map(), total: contacts.length };
  const first = (map: Map<string, GhlContact>, key: string, c: GhlContact) => { if (key && !map.has(key)) map.set(key, c); };
  for (const c of contacts) {
    ix.byId.set(c.id, c);
    first(ix.byEmail, (c.email || "").trim().toLowerCase(), c);
    const phone = c.phone ? normalizePhone(c.phone) : ""; if (phone.length >= 11) first(ix.byPhone, phone, c);
    const company = nameKey(c.companyName || c.businessName || ""); if (company.length >= 4) ix.byCompany.set(company, [...(ix.byCompany.get(company) || []), c]);
    first(ix.byMondayOnboarding, deskText(c, f, "mondayOnboardingId").trim(), c);
    first(ix.byMondayClient, deskText(c, f, "mondayClientId").trim(), c);
    first(ix.byMondayLead, fieldText(c, sales.mondayLeadId?.id).trim(), c);
    first(ix.byStripe, deskText(c, f, "stripeCustomer").trim(), c);
  }
  return ix;
}

export type MatchKind = "imported" | "mapped" | "onboarding-record" | "ghl-link" | "lead" | "stripe" | "email" | "phone" | "company-name" | "create" | "create-name-only" | "unmatched";
export type Match = { match: MatchKind; contact: GhlContact | null; candidates?: { id: string; name: string }[]; detail?: string };
type MatchInput = { row: MondayRow; kind: "onboarding" | "client"; email: string; phone: string; leadId: string; onboardingItem: string; stripeEmail: string; stripeCustomer: string };
type MatchOptions = {
  map?: Record<string, string>; createNameOnly?: boolean;
  /** onboarding item id → contact id, for rows already handled in this run */
  linked?: Map<string, string>;
  /** onboarding items that will get a NEW contact in this run (only matters in a dry run, where nothing is created yet) */
  pending?: Set<string>;
};
export function matchRow(input: MatchInput, ix: DeskIndex, opts: MatchOptions = {}): Match {
  const { row, kind } = input;
  const hit = (match: MatchKind, contact: GhlContact | undefined): Match | null => (contact ? { match, contact } : null);
  const imported = hit("imported", (kind === "onboarding" ? ix.byMondayOnboarding : ix.byMondayClient).get(row.id)); if (imported) return imported;
  const mappedId = opts.map?.[row.id];
  if (mappedId) { const m = hit("mapped", ix.byId.get(mappedId)); if (m) return m; return { match: "unmatched", contact: null, detail: `map points at ${mappedId}, which is not a contact in this location` }; }
  if (kind === "client" && input.onboardingItem) {
    // One contact per business: a client row joins the contact of its onboarding record, and waits for it rather than get a second contact.
    const ob = hit("onboarding-record", ix.byId.get(opts.linked?.get(input.onboardingItem) || "") || ix.byMondayOnboarding.get(input.onboardingItem)); if (ob) return ob;
    if (opts.pending?.has(input.onboardingItem)) return { match: "onboarding-record", contact: null, detail: "joins the contact its onboarding record creates in this run" };
    return { match: "unmatched", contact: null, detail: `its onboarding record (Monday item ${input.onboardingItem}) is not imported yet — import that first. If it just was, wait a minute (GoHighLevel's search runs a few seconds behind writes) and run this again. If that onboarding item no longer exists, pass map: { "${row.id}": "<contact id>" }.` };
  }
  const linked = hit("ghl-link", ix.byId.get(ghlIdFromLink(row))); if (linked) return linked;
  if (kind === "onboarding" && input.leadId) { const lead = hit("lead", isGhlRecordId(input.leadId) ? ix.byId.get(input.leadId) : ix.byMondayLead.get(input.leadId)); if (lead) return lead; }
  if (input.stripeCustomer) { const s = hit("stripe", ix.byStripe.get(input.stripeCustomer) || (input.stripeEmail ? ix.byEmail.get(input.stripeEmail) : undefined)); if (s) return s; }
  const email = input.email.trim().toLowerCase(); const byEmail = hit("email", email ? ix.byEmail.get(email) : undefined); if (byEmail) return byEmail;
  const phone = input.phone ? normalizePhone(input.phone) : ""; const byPhone = hit("phone", phone.length >= 11 ? ix.byPhone.get(phone) : undefined); if (byPhone) return byPhone;
  const same = nameKey(row.name).length >= 4 ? ix.byCompany.get(nameKey(row.name)) || [] : [];
  if (same.length === 1) return { match: "company-name", contact: same[0] };
  const candidates = same.slice(0, 5).map((c) => ({ id: c.id, name: (c.companyName || contactDisplayName(c) || c.id).trim() }));
  if (same.length > 1) return { match: "unmatched", contact: null, candidates, detail: `${same.length} contacts share this business name — pass map: { "${row.id}": "<contact id>" }` };
  if (email || phone.length >= 11) return { match: "create", contact: null };
  if (opts.createNameOnly && row.name.trim()) return { match: "create-name-only", contact: null };
  return { match: "unmatched", contact: null, detail: `no email or phone on the Monday row and no contact with this business name — pass map: { "${row.id}": "<contact id>" } (or createNameOnly to make a new contact from the name)` };
}

// ───────────────────────────── planning the writes ─────────────────────────────
export type Plan = { values: DeskValues; native: Omit<GhlContactPatch, "customFields" | "tags">; tags: string[]; salesLeadId: string; warnings: string[] };
const option = (f: DeskFields, key: DeskFieldKey, value: string, warnings: string[], what: string): string => {
  if (!value) return "";
  const live = f[key]?.options || []; const options = live.length ? live : DESK_FIELDS[key].options || [];
  if (options.includes(value)) return value;
  warnings.push(`${what} "${value}" is not an option on ${DESK_FIELDS[key].name} — left blank`);
  return "";
};
const put = (values: DeskValues, key: DeskFieldKey, value: string | number | string[] | null | undefined) => { if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && !value.length)) values[key] = value; };
function packagesOf(row: MondayRow, colId: string, f: DeskFields, warnings: string[]): string[] {
  const live = f.packages?.options || []; const options = live.length ? live : DESK_FIELDS.packages.options || [];
  const all = splitPackages(text(row, colId));
  for (const p of all.filter((x) => !options.includes(x))) warnings.push(`package "${p}" is not an option on Desk Packages — skipped`);
  return all.filter((p) => options.includes(p));
}
/** The contact's own fields: fill what is blank, never overwrite what GoHighLevel has. */
function nativeFor(row: MondayRow, existing: GhlContact | null, contact: string, email: string, phone: string, website: string, city: string, warnings: string[]): Plan["native"] {
  const native: Plan["native"] = {};
  const { firstName, lastName } = splitName(contact);
  if (!existing?.firstName && !existing?.lastName && firstName) { native.firstName = firstName; if (lastName) native.lastName = lastName; }
  if (!existing?.companyName && row.name) native.companyName = row.name.slice(0, 200);
  else if (existing?.companyName && nameKey(existing.companyName) !== nameKey(row.name)) warnings.push(`GoHighLevel calls this business "${existing.companyName}", the board calls it "${row.name}" — GoHighLevel's name is kept`);
  if (!existing?.email && email) native.email = email.toLowerCase();
  if (!existing?.phone && phone) native.phone = normalizePhone(phone);
  if (!existing?.website && website) native.website = website;
  if (!existing?.city && city) { const [town, state] = city.split(",").map((s) => s.trim()); if (town) native.city = town; if (state && /^[A-Za-z]{2}$/.test(state) && !existing?.state) native.state = state.toUpperCase(); }
  return native;
}

export function planOnboarding(row: MondayRow, existing: GhlContact | null, f: DeskFields, deskLink = ""): Plan {
  const warnings: string[] = [];
  const values: DeskValues = { mondayOnboardingId: row.id };
  const stage = STAGES.find((s) => s.group === row.group?.id);
  if (stage) values.obStage = stage.label; else warnings.push(`group "${row.group?.title || "?"}" is not a desk stage — imported with no stage (shows as Unknown)`);
  put(values, "obHealth", option(f, "obHealth", text(row, COL.health), warnings, "health"));
  put(values, "obOwner", personName(row, COL.onboardingOwner)); put(values, "buildOwner", personName(row, COL.buildOwner));
  const salesOwner = personName(row, COL.salesOwner); put(values, "salesOwner", salesOwner);
  for (const [key, id] of [["obOwner", COL.onboardingOwner], ["buildOwner", COL.buildOwner], ["salesOwner", COL.salesOwner]] as const) if (text(row, id) && !values[key]) warnings.push(`${DESK_FIELDS[key].name}: "${text(row, id)}" is not on the desk team — left blank`);
  put(values, "businessType", option(f, "businessType", text(row, COL.businessType).split(",")[0].trim(), warnings, "business type"));
  put(values, "signed", date(row, COL.signed)); put(values, "targetLaunch", date(row, COL.targetLaunch)); put(values, "lastTouch", date(row, COL.lastTouch));
  if (checked(row, COL.profileComplete)) values.profileComplete = "Yes";
  if (checked(row, COL.baseline)) values.baseline = "Yes";
  put(values, "gbpAccess", option(f, "gbpAccess", text(row, COL.gbpAccess), warnings, "GBP access"));
  put(values, "dnsPath", option(f, "dnsPath", text(row, COL.dnsPath).split(",")[0].trim(), warnings, "DNS path"));
  const next = splitNextAction(text(row, COL.nextAction));
  put(values, "nextAction", next.action.slice(0, 500)); put(values, "nextDue", next.due);
  put(values, "packages", packagesOf(row, COL.package, f, warnings));
  const custom = Number(text(row, COL.customMonthly)); if (text(row, COL.customMonthly) && Number.isFinite(custom)) values.customMonthly = custom;
  const setup = Number(text(row, COL.setup)); if (text(row, COL.setup) && Number.isFinite(setup)) values.setup = setup;
  put(values, "agreement", option(f, "agreement", text(row, COL.agreement), warnings, "agreement"));
  put(values, "obPayment", option(f, "obPayment", text(row, COL.payment), warnings, "payment"));
  put(values, "intake", option(f, "intake", text(row, COL.intake), warnings, "intake"));
  put(values, "handoffId", text(row, COL.handoffId)); put(values, "searchAtlasListing", /^[1-9]\d{0,9}$/.test(text(row, COL.searchAtlasListing)) ? text(row, COL.searchAtlasListing) : "");
  put(values, "driveFolder", link(row, COL.driveFolder)); put(values, "gbpUrl", link(row, COL.gbpUrl)); put(values, "notes", text(row, COL.notes)); put(values, "deskLink", deskLink);
  const checklist: StoredItem[] = (row.subitems || []).map((s) => {
    const t = (id: string) => s.column_values.find((c) => c.id === id)?.text?.trim() || "";
    const owner = t(SUBITEM_COL.owner).split(",")[0].trim().split(/\s+/)[0] || "";
    return { name: s.name, status: ["Done", "Working on it", "Stuck"].includes(t(SUBITEM_COL.status)) ? t(SUBITEM_COL.status) : "", phase: t(SUBITEM_COL.phase).split(",")[0].trim(), owner: isTeamName(owner) ? owner : "", due: /^\d{4}-\d{2}-\d{2}/.exec(t(SUBITEM_COL.due))?.[0] || "" };
  });
  // The checklist is only seeded: one that already exists on the contact (edited on the desk since a first import) is never replaced.
  if (checklist.length && !(existing && deskText(existing, f, "checklist"))) values.checklist = serializeChecklist(checklist);
  if (text(row, "build_week")) warnings.push(`Build Week "${text(row, "build_week")}" has no desk field — not imported`);
  const native = nativeFor(row, existing, text(row, COL.contact), text(row, COL.email), text(row, COL.phone), link(row, COL.siteUrl), text(row, COL.city), warnings);
  const owner = memberByName(salesOwner);
  if (!existing?.assignedTo && owner?.ghlUserId) native.assignedTo = owner.ghlUserId;
  const leadId = text(row, COL.leadId);
  return { values, native, tags: [DESK_TAGS.onboarding], salesLeadId: MONDAY_ID.test(leadId) ? leadId : "", warnings };
}

export function planClient(row: MondayRow, existing: GhlContact | null, f: DeskFields): Plan {
  const warnings: string[] = [];
  const values: DeskValues = { mondayClientId: row.id };
  const group = CLIENT_GROUPS.find((g) => g.group === row.group?.id);
  if (group) values.clientStatus = group.label; else warnings.push(`group "${row.group?.title || "?"}" is not a desk group — imported with no status (shows as Unknown)`);
  put(values, "clientHealth", option(f, "clientHealth", text(row, CCOL.health), warnings, "health"));
  put(values, "payStatus", option(f, "payStatus", text(row, CCOL.payStatus), warnings, "payment status"));
  put(values, "payMethod", option(f, "payMethod", text(row, CCOL.payMethod).split(",")[0].trim(), warnings, "payment method"));
  const manager = personName(row, CCOL.accountManager); put(values, "accountManager", manager);
  if (text(row, CCOL.accountManager) && !manager) warnings.push(`Desk Account Manager: "${text(row, CCOL.accountManager)}" is not on the desk team — left blank`);
  const billingDay = Number(text(row, CCOL.billingDay)); if (text(row, CCOL.billingDay) && Number.isInteger(billingDay) && billingDay >= 1 && billingDay <= 31) values.billingDay = billingDay;
  for (const [key, id] of [["nextBill", CCOL.nextBill], ["lastPayment", CCOL.lastPayment], ["clientSince", CCOL.clientSince], ["termEnds", CCOL.termEnds], ["lastReport", CCOL.lastReport], ["gbpChecked", CCOL.gbpChecked]] as const) put(values, key, date(row, id));
  put(values, "stripeCustomer", /^cus_[A-Za-z0-9]+$/.test(text(row, CCOL.stripeCustomer)) ? text(row, CCOL.stripeCustomer) : "");
  const custom = Number(text(row, CCOL.customMonthly)); if (text(row, CCOL.customMonthly) && Number.isFinite(custom)) values.customMonthly = custom;
  // One contact carries both records. Where the onboarding record already set a shared field, the client row only adds to it.
  const had = (key: DeskFieldKey) => (existing ? deskText(existing, f, key) : "");
  const packages = packagesOf(row, CCOL.package, f, warnings);
  const already = existing ? deskList(existing, f, "packages") : [];
  if (already.length && packages.length && [...packages].sort().join("|") !== [...already].sort().join("|")) warnings.push(`packages differ: the contact has ${already.join(", ")}; the Active Clients row has ${packages.join(", ")} — both are kept`);
  put(values, "packages", [...new Set([...already, ...packages])]);
  const gbp = option(f, "gbpAccess", text(row, CCOL.gbpAccess), warnings, "GBP access");
  if (gbp && !(gbp === "Not Requested" && had("gbpAccess"))) values.gbpAccess = gbp; // never step an onboarding record's Requested / Verified back to Not Requested
  if (!had("searchAtlasListing") && /^[1-9]\d{0,9}$/.test(text(row, CCOL.searchAtlasListing))) values.searchAtlasListing = text(row, CCOL.searchAtlasListing);
  if (!had("driveFolder")) put(values, "driveFolder", link(row, CCOL.driveFolder));
  if (!had("gbpUrl")) put(values, "gbpUrl", link(row, CCOL.gbpUrl));
  const notes = text(row, CCOL.notes); const prior = had("notes");
  if (notes && !prior.includes(notes)) values.notes = prior ? `${prior}\n\n${notes}` : notes;
  // The Monday desk kept a graduated client's files under its onboarding item. Normally this contact already carries that
  // id (it IS the onboarding record). If the onboarding item is gone and the row was pinned to a contact by hand, carry the
  // id anyway so the files are still found; it does not make the contact an onboarding record (that takes a stage or the tag).
  const onboardingItem = text(row, CCOL.onboardingItem);
  if (MONDAY_ID.test(onboardingItem) && !had("mondayOnboardingId")) values.mondayOnboardingId = onboardingItem;
  const native = nativeFor(row, existing, text(row, CCOL.contact), text(row, CCOL.email), text(row, CCOL.phone), link(row, CCOL.website), "", warnings);
  return { values, native, tags: [DESK_TAGS.client], salesLeadId: "", warnings };
}

// ───────────────────────────── the run ─────────────────────────────
export type MigrateOptions = { dryRun: boolean; offset?: number; limit?: number; force?: boolean; onlyIds?: string[]; map?: Record<string, string>; boards?: ("onboarding" | "clients")[]; includeOffDesk?: boolean; createNameOnly?: boolean; origin?: string;
  /** Pause between writes, in ms (default 120 — well inside GoHighLevel's rate limit). Tests pass 0; the route never sets it. */
  pauseMs?: number };
export type DeskMigrateRow = { board: "onboarding" | "clients"; mondayId: string; name: string; match: MatchKind; ghlId: string; ghlName: string; state: string; fields: string[]; contactFields: string[]; owner: boolean; tags: string[]; updates: number; checklist: number; storage: string[]; warnings: string[]; candidates?: { id: string; name: string }[]; detail?: string; done?: boolean; error?: string };
export type DeskMigrateReport = {
  dryRun: boolean; total: number; offset: number; processed: number; nextOffset: number | null; ghlContacts: number; counts: Record<MatchKind, number> & { written: number; failed: number }; rows: DeskMigrateRow[];
  skipped: { template: number; offDesk: { mondayId: string; name: string }[] };
  /** Every row on either board tagged Giveaway Winner, and whether it is on a GoHighLevel contact yet. After the flip the billing guard reads GoHighLevel only — a winner left behind on Monday would no longer be protected. */
  winners: { board: "onboarding" | "clients"; mondayId: string; name: string; imported: boolean }[];
};

async function readAllContacts(): Promise<GhlContact[]> {
  const all: GhlContact[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await searchContacts({ page, pageLimit: 500, sort: [{ field: "dateAdded", direction: "asc" }] }, { timeoutMs: 25000 });
    all.push(...r.contacts);
    if (r.contacts.length < 500) break;
  }
  return all;
}
const fieldNames = (f: DeskFields, values: DeskValues) => (Object.keys(values) as DeskFieldKey[]).map((k) => f[k]?.name || DESK_FIELDS[k].name);

export async function migrateDesk(opts: MigrateOptions): Promise<DeskMigrateReport> {
  const f = await allDeskFields();
  const sales = await salesFields();
  const boards = opts.boards?.length ? opts.boards : (["onboarding", "clients"] as const);
  const [pipeline, clients] = await Promise.all([
    boards.includes("onboarding") ? readBoard(PIPELINE_BOARD_ID, PIPELINE_COLUMNS, true) : Promise.resolve([] as MondayRow[]),
    boards.includes("clients") ? readBoard(CLIENTS_BOARD_ID, CLIENT_COLUMNS, false) : Promise.resolve([] as MondayRow[]),
  ]);
  const keep = (r: MondayRow) => !opts.onlyIds?.length || opts.onlyIds.includes(r.id);
  const onboardingRows = pipeline.filter((r) => r.group?.id !== TEMPLATE_GROUP_ID).filter(keep);
  const offDesk = clients.filter((r) => !checked(r, CCOL.teamDesk));
  const clientRows = clients.filter((r) => opts.includeOffDesk || checked(r, CCOL.teamDesk)).filter(keep);
  const all = [...onboardingRows.map((row) => ({ kind: "onboarding" as const, row })), ...clientRows.map((row) => ({ kind: "client" as const, row }))];
  const offset = Math.max(0, opts.offset || 0); const limit = Math.min(Math.max(opts.limit || 25, 1), 100);
  const slice = all.slice(offset, offset + limit);
  const ix = indexForDesk(await readAllContacts(), f, sales);
  const report: DeskMigrateReport = {
    dryRun: opts.dryRun, total: all.length, offset, processed: slice.length, nextOffset: offset + limit < all.length ? offset + limit : null, ghlContacts: ix.total,
    counts: { imported: 0, mapped: 0, "onboarding-record": 0, "ghl-link": 0, lead: 0, stripe: 0, email: 0, phone: 0, "company-name": 0, create: 0, "create-name-only": 0, unmatched: 0, written: 0, failed: 0 },
    rows: [], skipped: { template: pipeline.length - pipeline.filter((r) => r.group?.id !== TEMPLATE_GROUP_ID).length, offDesk: opts.includeOffDesk ? [] : offDesk.filter(keep).map((r) => ({ mondayId: r.id, name: r.name })) },
    winners: [],
  };
  const gap = opts.pauseMs ?? 120;
  const linked = new Map<string, string>(); // onboarding item id → contact id, as this run goes
  const pending = new Set<string>(); // onboarding items whose contact this run creates (dry run: would create)
  for (const { kind, row } of slice) {
    const board = kind === "onboarding" ? "onboarding" as const : "clients" as const;
    const out: DeskMigrateRow = { board, mondayId: row.id, name: row.name, match: "unmatched", ghlId: "", ghlName: "", state: row.group?.title || "", fields: [], contactFields: [], owner: false, tags: [], updates: (row.updates || []).filter((u) => (u.text_body || "").trim()).length, checklist: (row.subitems || []).length, storage: [], warnings: [] };
    try {
      const stripeCustomer = kind === "client" && /^cus_[A-Za-z0-9]+$/.test(text(row, CCOL.stripeCustomer)) ? text(row, CCOL.stripeCustomer) : "";
      let stripeEmail = "";
      if (stripeCustomer && stripeConnected()) stripeEmail = (await snapshot(stripeCustomer).catch(() => null))?.email?.toLowerCase() || "";
      const email = text(row, kind === "onboarding" ? COL.email : CCOL.email); const phone = text(row, kind === "onboarding" ? COL.phone : CCOL.phone);
      const found = matchRow({ row, kind, email, phone, leadId: kind === "onboarding" ? text(row, COL.leadId) : "", onboardingItem: kind === "client" ? text(row, CCOL.onboardingItem) : "", stripeCustomer, stripeEmail }, ix, { map: opts.map, createNameOnly: opts.createNameOnly, linked, pending });
      out.match = found.match; out.candidates = found.candidates; out.detail = found.detail; report.counts[found.match]++;
      let contact = found.contact;
      out.ghlId = contact?.id || ""; out.ghlName = contact ? (contact.companyName || contactDisplayName(contact) || "").trim() : "";
      if (contact && kind === "onboarding") linked.set(row.id, contact.id);
      if (!contact && kind === "onboarding" && (found.match === "create" || found.match === "create-name-only")) pending.add(row.id);
      if (found.match === "unmatched") { report.rows.push(out); continue; }
      if (found.match === "onboarding-record" && !contact) { // a dry run (nothing is created yet), or a real run in which the onboarding row failed
        out.ghlName = "(the contact its onboarding record creates)";
        if (!opts.dryRun) out.detail = "skipped: its onboarding record was not written in this run — fix that row and run this again";
        report.rows.push(out); continue;
      }
      const plan = kind === "onboarding" ? planOnboarding(row, contact, f, contact && opts.origin ? `${opts.origin}/leads?tab=onboarding&client=${contact.id}` : "") : planClient(row, contact, f);
      // GoHighLevel refuses an email or phone another contact already holds, and that refusal would fail the whole write:
      // leave this contact's blank as it is and say so (the dry run shows it too).
      if (contact) {
        const emailOwner = plan.native.email ? ix.byEmail.get(plan.native.email) : undefined;
        if (emailOwner && emailOwner.id !== contact.id) { plan.warnings.push(`the board's email is already on another contact (${emailOwner.id}) — not added to this one; if that is the same business, merge the two in GoHighLevel`); delete plan.native.email; }
        const phoneOwner = plan.native.phone ? ix.byPhone.get(plan.native.phone) : undefined;
        if (phoneOwner && phoneOwner.id !== contact.id) { plan.warnings.push(`the board's phone is already on another contact (${phoneOwner.id}) — not added to this one; if that is the same business, merge the two in GoHighLevel`); delete plan.native.phone; }
      }
      if ((row.updates || []).length >= UPDATES_PER_ITEM) plan.warnings.push(`this item has ${UPDATES_PER_ITEM} or more updates — only the newest ${UPDATES_PER_ITEM} are copied as notes`);
      out.fields = fieldNames(f, plan.values); out.contactFields = Object.keys(plan.native).filter((k) => k !== "assignedTo"); out.owner = "assignedTo" in plan.native; out.tags = plan.tags; out.warnings = plan.warnings;
      if (found.match === "imported" && !opts.force) { out.detail = "already imported — skipped (force re-writes it)"; report.rows.push(out); continue; }
      if (opts.dryRun) { report.rows.push(out); continue; }

      const customFields = deskWrites(f, plan.values);
      // The lead this onboarding record was handed off from: keep its Monday lead id on the contact so the stored handoff is found.
      if (plan.salesLeadId && sales.mondayLeadId && !(contact && fieldText(contact, sales.mondayLeadId.id))) customFields.push({ id: sales.mondayLeadId.id, field_value: plan.salesLeadId });
      if (contact) await updateContact(contact.id, { ...plan.native, customFields });
      else {
        const payload = { locationId: ghlLocationId(), ...plan.native, customFields, source: "Team desk (Monday import)" };
        contact = found.match === "create-name-only" ? await createContact(payload) : (await upsertContact(payload)).contact;
        out.ghlId = contact.id; out.ghlName = row.name; out.tags = [...plan.tags, DESK_TAGS.imported];
        ix.byId.set(contact.id, contact);
        if (plan.native.email) ix.byEmail.set(plan.native.email, contact);
        if (plan.native.phone) ix.byPhone.set(plan.native.phone, contact);
        if (kind === "onboarding") linked.set(row.id, contact.id);
        // The staff link back to the desk needs the new contact's id, so it is written once the contact exists.
        if (kind === "onboarding" && opts.origin) {
          const link = deskWrites(f, { deskLink: `${opts.origin}/leads?tab=onboarding&client=${contact.id}` });
          await updateContact(contact.id, { customFields: link });
          customFields.push(...link);
        }
      }
      const contactId = contact.id;
      // The checklist is one large-text field: prove GoHighLevel kept every row before calling this record imported.
      if (typeof plan.values.checklist === "string") {
        const kept = parseChecklist(deskText(await getContact(contactId), f, "checklist")).length;
        if (kept !== out.checklist) throw new Error(`GoHighLevel kept ${kept} of ${out.checklist} checklist rows — the Desk Checklist field is too small for this record. The other fields were written; fix the field and re-run this row with force.`);
      }
      // A later row for the same business (its Active Clients row) must see what this row just wrote.
      const merged: GhlContact = { ...contact, ...plan.native, customFields: [...(contact.customFields || []).filter((x) => !customFields.some((w) => w.id === x.id)), ...customFields.map((w) => ({ id: w.id, value: w.field_value }))] };
      ix.byId.set(contactId, merged);
      (kind === "onboarding" ? ix.byMondayOnboarding : ix.byMondayClient).set(row.id, merged);
      if (plan.native.email && !ix.byEmail.has(plan.native.email)) ix.byEmail.set(plan.native.email, merged);
      if (plan.native.phone && !ix.byPhone.has(plan.native.phone)) ix.byPhone.set(plan.native.phone, merged);
      await addTags(contactId, out.tags);
      // Monday updates → notes, once each (the marker is the Monday update id).
      const have = await listNotes(contactId);
      let copied = 0;
      for (const u of [...(row.updates || [])].reverse()) {
        const body = (u.text_body || "").trim();
        if (!body || have.some((n) => (n.body || "").includes(importMarker(u.id)))) continue;
        const handoff = /\[CC-HANDOFF:([^\]]+)\]/.exec(body)?.[1];
        await addNote(contactId, `From the old board (${u.creator?.name || "Team"}, ${u.created_at.slice(0, 10)}):\n${body}\n\n${importMarker(u.id)}${handoff ? ` ${summaryMarker(handoff)}` : ""} [CC-SRC:${kind === "onboarding" ? "onboarding" : "client"}]`);
        copied++; await pause(gap);
      }
      // Storage: the client's intake / file record stays under its Monday-era key and learns which contact it belongs to.
      const onboardingScope = kind === "client" ? text(row, CCOL.onboardingItem) : "";
      for (const scope of kind === "onboarding" ? [row.id] : [`c${row.id}`, ...(MONDAY_ID.test(onboardingScope) ? [onboardingScope] : [])]) {
        const intake = await readIntake(scope).catch(() => null);
        if (intake && intake.contactId !== contactId) { await writeIntake({ ...intake, contactId }); out.storage.push(`intake/${scope}: contactId set`); }
        else if (intake) out.storage.push(`intake/${scope}: already linked`);
      }
      out.detail = `wrote ${customFields.length} fields, ${copied} of ${out.updates} updates copied as notes`; out.done = true;
      report.counts.written++;
      await pause(gap);
    } catch (e) { out.error = (e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 400); report.counts.failed++; } // no query-string shapes: the browser tool that reads this report redacts them
    report.rows.push(out);
  }
  const isWinner = (r: MondayRow, colId: string) => isGiveawayWinner(splitPackages(text(r, colId)));
  report.winners = [
    ...pipeline.filter((r) => r.group?.id !== TEMPLATE_GROUP_ID && isWinner(r, COL.package)).map((r) => ({ board: "onboarding" as const, mondayId: r.id, name: r.name, imported: ix.byMondayOnboarding.has(r.id) })),
    ...clients.filter((r) => isWinner(r, CCOL.package)).map((r) => ({ board: "clients" as const, mondayId: r.id, name: r.name, imported: ix.byMondayClient.has(r.id) })),
  ];
  return report;
}
