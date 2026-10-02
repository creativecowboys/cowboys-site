import { CallDeskError, MONDAY_ID } from "@/lib/calls/validation";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { deskUrl } from "@/lib/desk-path";
import { importMarker } from "@/lib/calls/markers";
import { addNote, addTags, contactDisplayName, createContact, fieldText, getContact, GhlError, ghlLocationId, listNotes, normalizePhone, searchContacts, splitName, updateContact, type GhlContact, type GhlContactPatch } from "@/lib/ghl/client";
import { ghlIdFromLink } from "@/lib/ghl/admin";
import { salesFields, type SalesFields } from "@/lib/ghl/fields";
import { monday } from "@/lib/onboarding/api";
import { COL, GIVEAWAY_WINNER, PIPELINE_BOARD_ID, STAGES, SUBITEM_COL, TEMPLATE_GROUP_ID, isGiveawayWinner } from "@/lib/onboarding/config";
import { splitNextAction } from "@/lib/onboarding/pipeline";
import { deletePath, readIntake, readJson, writeIntake, writeJson } from "@/lib/onboarding/store";
import { CCOL, CLIENTS_BOARD_ID, CLIENT_GROUPS } from "@/lib/clients/config";
import { snapshot, stripeConnected } from "@/lib/clients/stripe";
import { parseChecklist, serializeChecklist, type StoredItem } from "./checklist-text";
import { DESK_FIELDS, DESK_TAGS, deskList, deskText, deskWrites, type DeskFieldKey, type DeskFields } from "./fields";
import { splitPackages } from "./money";
import { summaryMarker } from "./onboarding";
import { allDeskFields, isClientRecord, isLegacyClient, stillOnboarding, type DeskValues } from "./record";
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
//
// LEGACY CLIENTS (Dave, Oct 2 2026: "our old clients.. we can call them legacy clients. We can bring them into the active
// clients tab"). An Active Clients row WITHOUT "Team desk" is one of the agency's long-standing clients: it comes over with
// includeOffDesk, is marked "Desk Legacy Client" = Yes (only where that field is blank — an owner's own Yes / No on the contact
// is never overwritten), and — having no email or phone on the board — gets a NEW contact made from its business name with
// createNameOnly. GoHighLevel cannot refuse a duplicate of a contact that has no email and no phone, and its search runs
// behind writes, so the import keeps its own record of every name-only contact it creates (storage, CREATED_PATH below):
// a second run finds that contact by id even before GoHighLevel's search lists it. The import never creates a payment task.
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** The `source` GoHighLevel shows on a contact this import created — also how a later run knows the contact is one of its own. */
const IMPORT_SOURCE = "Team desk (Monday import)";

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
const checked = (row: MondayRow, id: string) => { const v = parse(col(row, id)?.value || null) as { checked?: unknown } | null; return v?.checked === true || String(v?.checked).toLowerCase() === "true"; };
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
  /** Every contact, and in how many contacts' business names each word appears — for the look-alike hint on rows that would create a contact. */
  all: GhlContact[]; wordCount: Map<string, number>;
};
/** Every contact in the location, indexed once per run. Contacts arrive oldest first, so the earliest wins a duplicate email / phone. */
export function indexForDesk(contacts: GhlContact[], f: DeskFields, sales: SalesFields): DeskIndex {
  const ix: DeskIndex = { byId: new Map(), byEmail: new Map(), byPhone: new Map(), byCompany: new Map(), byMondayOnboarding: new Map(), byMondayClient: new Map(), byMondayLead: new Map(), byStripe: new Map(), total: contacts.length, all: contacts, wordCount: new Map() };
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
    for (const w of new Set(wordsOf(c.companyName || c.businessName))) ix.wordCount.set(w, (ix.wordCount.get(w) || 0) + 1);
  }
  return ix;
}

// ───────────────────────────── look-alikes (a hint in the report, never a match) ─────────────────────────────
// A row that is about to get a NEW contact is only safe if GoHighLevel does not already hold that business under a slightly
// different name ("Sconyers Concrete" for the board's "Sconyers Concrete Inc"), under a person's name with the business in
// the email address, or on the same website. Exact names are matched above; this lists the near misses so a person can pin
// the row to the right contact with `map` instead of creating a second one. It never changes what a row matches.
//
// It has to be worth reading: on the real location (1,216 contacts, Oct 2 2026) a first cut that offered any contact sharing
// an "uncommon" word listed every church for Chapelhill Church and every insurance agent for Commercial Insurance Agency.
// So a shared word only counts when it is the FIRST word of both names (the part of a name that is its own — Sconyers, Whiten,
// McKinley) and few other businesses carry it; a person's name never counts unless it IS the business name.
const LEGAL_WORDS = new Set(["inc", "llc", "llp", "pllc", "pc", "co", "corp", "ltd", "company", "the", "and", "of", "at"]);
function wordsOf(v: unknown): string[] { return String(v ?? "").toLowerCase().replace(/&/g, " and ").replace(/['’.]/g, "").split(/[^a-z0-9]+/).filter(Boolean); }
const coreKey = (v: unknown) => wordsOf(v).filter((w) => !LEGAL_WORDS.has(w)).join("");
const hostOf = (u: unknown) => String(u ?? "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
const lettersOf = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
/** Are two names within two letters of each other ("whitenpools" / "whitenspools")? Only asked of names long enough for that to mean something. */
function nearlySame(a: string, b: string): boolean {
  if (a.length < 8 || b.length < 8 || Math.abs(a.length - b.length) > 2) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (Math.min(...row) > 2) return false;
    prev = row;
  }
  return prev[b.length] <= 2;
}
export type Lookalike = { id: string; name: string; why: string };
/** Contacts that look like this business, the strongest reason first (the same name, then a name inside the other, a near-miss spelling, an
 *  email or website that spells it, its website or email domain, the same uncommon first word). */
export function lookalikes(name: string, website: string, ix: DeskIndex): Lookalike[] {
  const core = coreKey(name);
  const firstWord = (v: unknown) => wordsOf(v).find((w) => !LEGAL_WORDS.has(w)) || "";
  const first = firstWord(name);
  const own = first.length >= 4 && (ix.wordCount.get(first) || 0) <= 3 ? first : ""; // the business's own word, if few others carry it
  const site = hostOf(website);
  const onSite = (v: string) => !!site && !!v && (v === site || v.endsWith(`.${site}`));
  const out: (Lookalike & { rank: number })[] = [];
  for (const c of ix.all) {
    if (c.id === TEST_CONTACT_ID) continue;
    const company = String(c.companyName || c.businessName || "").trim();
    const companyCore = coreKey(company);
    const host = hostOf(c.website); const domain = String(c.email || "").split("@")[1]?.toLowerCase() || "";
    let why = ""; let rank = 0;
    // The very same name counts however short it is ("CDM", "ICG"): the exact-name match above only trusts names of four letters or more.
    if (core.length >= 2 && (companyCore === core || coreKey(contactDisplayName(c)) === core)) { why = "the same name apart from Inc, LLC, The and the like"; rank = 1; }
    else if ((core.length >= 5 && companyCore.includes(core)) || (companyCore.length >= 8 && core.includes(companyCore))) { why = "one business name contains the other"; rank = 2; }
    else if (nearlySame(core, companyCore)) { why = "the two business names are a letter or two apart"; rank = 3; }
    else if (core.length >= 8 && [host, String(c.email || "")].some((v) => lettersOf(v).includes(core))) { why = "its email or website spells this business name"; rank = 4; }
    else if (onSite(host) || onSite(domain)) { why = `the same website or email domain (${site})`; rank = 5; }
    else if (own && firstWord(company) === own) { why = `its business name starts with the same uncommon word, "${own}"`; rank = 6; }
    if (why) out.push({ id: c.id, name: [company, contactDisplayName(c)].filter(Boolean).join(" — ") || c.email || c.id, why, rank });
  }
  return out.sort((a, b) => a.rank - b.rank).map(({ id, name: n, why }) => ({ id, name: n, why }));
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
export type Plan = { values: DeskValues; native: Omit<GhlContactPatch, "customFields" | "tags">; tags: string[]; salesLeadId: string; warnings: string[];
  /** Reasons this row must NOT be written as planned (a real run refuses it; a dry run shows them). */
  blockers: string[];
  /** Clients only: this contact is (or after this run will be) marked a legacy client. */
  legacy?: boolean };
const option = (f: DeskFields, key: DeskFieldKey, value: string, warnings: string[], what: string): string => {
  if (!value) return "";
  const live = f[key]?.options || []; const options = live.length ? live : DESK_FIELDS[key].options || [];
  if (options.includes(value)) return value;
  warnings.push(`${what} "${value}" is not an option on ${DESK_FIELDS[key].name} — left blank`);
  return "";
};
const put = (values: DeskValues, key: DeskFieldKey, value: string | number | string[] | null | undefined) => { if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && !value.length)) values[key] = value; };
function packagesOf(row: MondayRow, colId: string, f: DeskFields, warnings: string[], blockers: string[]): string[] {
  const live = f.packages?.options || []; const options = live.length ? live : DESK_FIELDS.packages.options || [];
  const all = splitPackages(text(row, colId));
  for (const p of all.filter((x) => !options.includes(x))) {
    // A winner must never arrive without the label: on GoHighLevel that label is the only thing that stops the package builder billing them.
    if (p === GIVEAWAY_WINNER) blockers.push(`"${GIVEAWAY_WINNER}" is not an option on Desk Packages in GoHighLevel — add it there (Settings → Custom Fields) before importing this row`);
    else warnings.push(`package "${p}" is not an option on Desk Packages — skipped`);
  }
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
  const warnings: string[] = []; const blockers: string[] = [];
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
  put(values, "packages", packagesOf(row, COL.package, f, warnings, blockers));
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
  return { values, native, tags: [DESK_TAGS.onboarding], salesLeadId: MONDAY_ID.test(leadId) ? leadId : "", warnings, blockers };
}

/**
 * `keep`: the row was pinned (map) to a contact that is ALREADY a client on the desk and did not come from this row. Nothing it holds is
 * replaced — the row only fills what is blank, adds its packages and notes, and leaves the legacy marker to an owner.
 */
export function planClient(row: MondayRow, existing: GhlContact | null, f: DeskFields, opts: { keep?: boolean } = {}): Plan {
  const warnings: string[] = []; const blockers: string[] = [];
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
  const packages = packagesOf(row, CCOL.package, f, warnings, blockers);
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
  if (opts.keep && existing) {
    // Everything the contact already holds stays: status, health, payment, manager, dates, GBP. Packages were added to and notes appended above.
    const kept = (Object.keys(values) as DeskFieldKey[]).filter((k) => !["mondayClientId", "packages", "notes"].includes(k) && had(k));
    for (const k of kept) delete values[k];
    warnings.push(`this contact is already a client on the desk: what it holds is kept${kept.length ? ` (${kept.map((k) => f[k]?.name || DESK_FIELDS[k].name).join(", ")})` : ""}; the row only fills what was blank`);
  }
  // A row that never had "Team desk" ticked is a legacy client. The marker is only ever SET where the contact has none: an
  // owner's own Yes or No (the panel always writes one of the two) is left alone, even by force.
  let legacy = had("legacy").trim().toLowerCase() === "yes";
  if (!col(row, CCOL.teamDesk)) {
    // Monday did not hand back the checkbox at all: "not ticked" cannot be told from "not sent", and a desk client must never be marked legacy by accident.
    blockers.push(`the row came back from the board without its "Team desk" column, so the import cannot tell a desk client from a legacy one — run it again; if it keeps happening the column was removed from the board`);
  } else if (!checked(row, CCOL.teamDesk)) {
    const options = f.legacy?.options || [];
    if (opts.keep) { if (!legacy) warnings.push("not marked a legacy client: it is already a client on the desk — an owner marks it from its panel if that is what it is"); }
    else if (!f.legacy) blockers.push(`"${DESK_FIELDS.legacy.name}" does not exist in GoHighLevel yet, so this row cannot be marked a legacy client — an owner runs the desk field setup first (POST /api/team/ghl/setup with scope "desk")`);
    else if (options.length && !options.includes("Yes")) blockers.push(`"${f.legacy.name}" in GoHighLevel has no option "Yes" — add it there (Settings → Custom Fields) before importing this row`);
    else if (!had("legacy")) { values.legacy = "Yes"; legacy = true; }
    else if (!legacy) warnings.push(`this contact was un-marked as a legacy client on the desk ("${f.legacy.name}" says ${had("legacy")}) — left as it is`);
  }
  const native = nativeFor(row, existing, text(row, CCOL.contact), text(row, CCOL.email), text(row, CCOL.phone), link(row, CCOL.website), "", warnings);
  return { values, native, tags: [DESK_TAGS.client], salesLeadId: "", warnings, blockers, legacy };
}

// ───────────────────────────── the import's own records (private storage) ─────────────────────────────
// A contact with no email and no phone is the one kind GoHighLevel will happily create twice, and its search — which is how a
// re-run finds "already imported" — runs a few seconds behind writes. So the import does not rely on that search for a contact it
// makes from a name alone. For every such contact it keeps two small records, written BEFORE the create and completed after it:
//   onboarding/import/<kind>-<monday row id>.json   this row is getting / got contact <id>
//   onboarding/import/name-<business name>.json     a contact with this business name is being / was created (for row …)
// A later run (a dry run too) reads them first:
//   - a finished record → the contact is read by id, fresh, and the row is "imported" instead of created again;
//   - an UNFINISHED record (the create was sent and its answer never came back — a timeout, a 5xx) → the contact may exist, so the
//     row is held for ten minutes: by then GoHighLevel's search lists the contact if it was created, and the row reads "imported";
//   - storage that cannot be read → the row is refused rather than created blind.
// A real run also takes a lock, so two runs posted at once (a double submit, a retry while the first is still going) cannot both
// reach the same row before either has written its record.
const IMPORT_DIR = "onboarding/import";
const ROW_RECORD = (kind: "onboarding" | "client", mondayId: string) => `${IMPORT_DIR}/${kind}-${mondayId}.json`;
const NAME_RECORD = (key: string) => `${IMPORT_DIR}/name-${key}.json`;
const LOCK_PATH = `${IMPORT_DIR}/lock.json`;
const PENDING_MS = 10 * 60_000; // how long an unfinished create counts as "it may have happened" — GoHighLevel's search catches up in seconds
const LOCK_MS = 6 * 60_000; // a run cannot outlive the route's five minutes
type CreateRecord = { kind: "onboarding" | "client"; mondayId: string; name: string; contactId: string; startedAt: string; createdAt?: string };
type Remembered = { state: "none" } | { state: "contact"; contact: GhlContact; record: CreateRecord } | { state: "pending"; record: CreateRecord; until: string };
/** A GoHighLevel answer that means "this contact is not there any more" — and nothing else (a refusal or an outage is not "gone"). */
const isGone = (e: unknown): boolean =>
  (e instanceof GhlError && (e.ghlStatus === 404 || ([400, 422].includes(e.ghlStatus) && /not found|no contact|no such|does not exist|deleted|invalid/i.test(e.body)))) || (!(e instanceof GhlError) && e instanceof CallDeskError && e.status === 404);
/** What the import remembers at a record path. Throws when storage cannot be read, or when GoHighLevel will not say whether the contact is still there. */
async function rememberedAt(path: string): Promise<Remembered> {
  const record = await readJson<CreateRecord>(path);
  if (!record) return { state: "none" };
  if (!record.contactId) {
    const started = Date.parse(record.startedAt);
    return Number.isFinite(started) && Date.now() - started < PENDING_MS ? { state: "pending", record, until: new Date(started + PENDING_MS).toISOString() } : { state: "none" };
  }
  if (!isGhlRecordId(record.contactId)) return { state: "none" };
  try { return { state: "contact", contact: await getContact(record.contactId), record }; }
  catch (e) { if (isGone(e)) return { state: "none" }; throw e; } // deleted or merged away since: the record is stale and a new contact is the right answer
}

let runningSince = 0; // one real run at a time on this server (a run the platform cut off frees itself like the stored lock does); the lock in storage covers other servers
/** Take the import lock for a real run. Refuses while another run holds it; returns the release. */
async function takeLock(settleMs: number): Promise<() => Promise<void>> {
  if (Date.now() - runningSince < LOCK_MS) throw new CallDeskError("Another import run is going right now. Wait for it to finish, then do a dry run before anything else.", 409);
  runningSince = Date.now();
  try {
    const mine = { id: crypto.randomUUID(), startedAt: new Date().toISOString() };
    const held = await readJson<{ id: string; startedAt: string }>(LOCK_PATH); // storage unreadable → no run: the records above are what keeps a contact from being made twice
    if (held && Date.now() - Date.parse(held.startedAt) < LOCK_MS) throw new CallDeskError(`Another import run started at ${held.startedAt} and has not finished (a run that stopped without finishing frees itself six minutes after it started). Wait, then do a dry run before anything else.`, 409);
    await writeJson(LOCK_PATH, mine);
    if (settleMs) await pause(settleMs);
    // Two runs posted in the same instant both see no lock and both write one: the last writer keeps it, the other stops here, before any row.
    if ((await readJson<{ id: string }>(LOCK_PATH))?.id !== mine.id) throw new CallDeskError("Another import run started at the same moment. This one stopped before it wrote anything; do a dry run in a minute.", 409);
    return async () => { runningSince = 0; await deletePath(LOCK_PATH); };
  } catch (e) { runningSince = 0; throw e; }
}

// ───────────────────────────── the run ─────────────────────────────
export type MigrateOptions = { dryRun: boolean; offset?: number; limit?: number; force?: boolean; onlyIds?: string[]; map?: Record<string, string>; boards?: ("onboarding" | "clients")[]; includeOffDesk?: boolean; createNameOnly?: boolean; origin?: string;
  /** Only for a contact created from a name alone: also put the business name in the contact's own (person's) name. Off by default — the desk does not
   *  invent a person. It exists for one case: GoHighLevel refusing a contact that has a company name and nobody's name. */
  businessAsContactName?: boolean;
  /** Pause between writes, in ms (default 120 — well inside GoHighLevel's rate limit). Tests pass 0; the route never sets it. */
  pauseMs?: number };
/**
 * The request body of the import, checked strictly. A filter that is malformed must never quietly become "no filter": `onlyIds` given as
 * anything but a list of item ids, a `map` entry that is not an id → an id, a mistyped key — each is refused (400) instead of running the
 * whole board. With createNameOnly, "the whole board" means a new contact for every unmatched row.
 *
 * A REAL run is asked for with `apply: true`. (`dryRun: false` still means the same, for the cutover runbook.) The reason for the second
 * word: a build of the site from before these safeguards does not know `apply`, so it answers such a request with a dry run. On Oct 2 2026
 * a deployment made by hand from a stale checkout took production over for a few minutes — with `dryRun: false` that build would have
 * created contacts with no legacy marker, no records and no lock. Every report also carries `build`, the commit that answered.
 */
const BODY_KEYS = ["dryRun", "apply", "offset", "limit", "force", "overwriteLiveDesk", "onlyIds", "map", "boards", "includeOffDesk", "createNameOnly", "businessAsContactName"];
export function parseMigrateBody(input: unknown): Omit<MigrateOptions, "origin" | "pauseMs"> & { overwriteLiveDesk: boolean } {
  const bad = (m: string) => new CallDeskError(m, 400);
  if (input === null || typeof input !== "object" || Array.isArray(input)) throw bad("Send the import a JSON object (an empty one is a dry run of everything).");
  const body = input as Record<string, unknown>;
  const unknown = Object.keys(body).filter((k) => !BODY_KEYS.includes(k));
  if (unknown.length) throw bad(`Unknown import option${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}. Nothing was run. The options are ${BODY_KEYS.join(", ")}.`);
  const flag = (k: string): boolean => { if (body[k] !== undefined && typeof body[k] !== "boolean") throw bad(`${k} must be true or false. Nothing was run.`); return body[k] === true; };
  const count = (k: string, fallback: number): number => { const v = body[k]; if (v === undefined) return fallback; if (typeof v !== "number" || !Number.isInteger(v) || v < 0) throw bad(`${k} must be a whole number. Nothing was run.`); return v; };
  if (body.dryRun !== undefined && typeof body.dryRun !== "boolean") throw bad("dryRun must be true or false. Nothing was run.");
  const apply = flag("apply");
  if (body.apply !== undefined && body.dryRun !== undefined && body.dryRun === apply) throw bad("apply and dryRun say opposite things. Nothing was run — send apply: true for a real run, or neither for a dry run.");
  let onlyIds: string[] | undefined;
  if (body.onlyIds !== undefined) {
    const list = Array.isArray(body.onlyIds) ? body.onlyIds.map((v) => (typeof v === "number" && Number.isSafeInteger(v) ? String(v) : v)) : null;
    if (!list || !list.length || list.length > 100 || !list.every((v): v is string => typeof v === "string" && MONDAY_ID.test(v))) throw bad("onlyIds must be a list of 1 to 100 Monday item ids, each a string of digits. Nothing was run — leave onlyIds out to run every row.");
    onlyIds = [...new Set(list)];
  }
  const map: Record<string, string> = {};
  if (body.map !== undefined) {
    if (body.map === null || typeof body.map !== "object" || Array.isArray(body.map)) throw bad("map must be an object of Monday item id to GoHighLevel contact id. Nothing was run.");
    const entries = Object.entries(body.map as Record<string, unknown>);
    if (entries.length > 100) throw bad("map takes at most 100 rows. Nothing was run.");
    for (const [k, v] of entries) {
      if (!MONDAY_ID.test(k) || typeof v !== "string" || !isGhlRecordId(v)) throw bad(`map entry ${JSON.stringify(k).slice(0, 40)} is not a Monday item id pointing at a GoHighLevel contact id (the id alone — not a link). Nothing was run.`);
      map[k] = v;
    }
  }
  let boards: ("onboarding" | "clients")[] | undefined;
  if (body.boards !== undefined) {
    if (!Array.isArray(body.boards) || !body.boards.length || !body.boards.every((b) => b === "onboarding" || b === "clients")) throw bad('boards must be a list holding "onboarding", "clients" or both. Nothing was run.');
    boards = [...new Set(body.boards as ("onboarding" | "clients")[])];
  }
  return {
    dryRun: !(apply || body.dryRun === false), offset: count("offset", 0), limit: count("limit", 25), force: flag("force"), overwriteLiveDesk: flag("overwriteLiveDesk"), onlyIds, map, boards,
    includeOffDesk: flag("includeOffDesk"), createNameOnly: flag("createNameOnly"), businessAsContactName: flag("businessAsContactName"),
  };
}

export type DeskMigrateRow = { board: "onboarding" | "clients"; mondayId: string; name: string; match: MatchKind; ghlId: string; ghlName: string; state: string; fields: string[]; contactFields: string[]; owner: boolean; tags: string[]; updates: number; checklist: number; storage: string[]; warnings: string[]; candidates?: { id: string; name: string }[]; detail?: string; done?: boolean; error?: string;
  /** Exactly what the row writes: every desk field with its value (long text is cut, with its full length), and the contact's own details it fills or — for a new contact — is created with. */
  values?: Record<string, unknown>; contact?: Record<string, unknown>;
  /** Clients: the contact is (or will be) marked a legacy client. */
  legacy?: boolean;
  /** Only on a row that creates a contact: contacts already in GoHighLevel that look like this business (first five). A hint — check them, and pin the row with `map` if one is the same business. */
  similar?: Lookalike[] };
export type DeskMigrateReport = {
  /** The commit of the build that answered (Vercel's own variable; "unknown" where it is not set) — so a report can be told from one a stale deployment wrote. */
  build: string;
  dryRun: boolean; total: number; offset: number; processed: number; nextOffset: number | null; ghlContacts: number; counts: Record<MatchKind, number> & { written: number; finished: number; failed: number }; rows: DeskMigrateRow[];
  skipped: { template: number; offDesk: { mondayId: string; name: string }[] };
  /** Every row on either board tagged Giveaway Winner: `imported` = it is on a GoHighLevel contact; `protected` = that contact's Desk Packages carries
   *  Giveaway Winner. After the flip the billing guard reads GoHighLevel only, so every winner must be `protected` before then. */
  winners: { board: "onboarding" | "clients"; mondayId: string; name: string; imported: boolean; protected: boolean }[];
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
/** A value as the report shows it: whole, unless it is long text (a checklist, a notes block) — then its start and its full length. */
const shown = (v: unknown): unknown => (typeof v === "string" && v.length > 600 ? `${v.slice(0, 600)}… (${v.length} characters in all)` : v);
/** Error text for a report: nothing shaped like a query string (the browser tool that reads these reports redacts it). */
const plain = (e: unknown): string => (e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 300);

export async function migrateDesk(opts: MigrateOptions): Promise<DeskMigrateReport> {
  if (opts.dryRun) return runMigration(opts);
  // A real run: one at a time. (Tests pass pauseMs 0, which also skips the moment the lock waits to see whether another run took it.)
  const release = await takeLock(opts.pauseMs === 0 ? 0 : 1200);
  try { return await runMigration(opts); } finally { await release(); }
}

async function runMigration(opts: MigrateOptions): Promise<DeskMigrateReport> {
  const f = await allDeskFields(true); // fresh definitions: an option someone just added in GoHighLevel (Giveaway Winner, a business type) counts at once
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
    build: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || "unknown",
    dryRun: opts.dryRun, total: all.length, offset, processed: slice.length, nextOffset: offset + limit < all.length ? offset + limit : null, ghlContacts: ix.total,
    counts: { imported: 0, mapped: 0, "onboarding-record": 0, "ghl-link": 0, lead: 0, stripe: 0, email: 0, phone: 0, "company-name": 0, create: 0, "create-name-only": 0, unmatched: 0, written: 0, finished: 0, failed: 0 },
    rows: [], skipped: { template: pipeline.length - pipeline.filter((r) => r.group?.id !== TEMPLATE_GROUP_ID).length, offDesk: opts.includeOffDesk ? [] : offDesk.filter(keep).map((r) => ({ mondayId: r.id, name: r.name })) },
    winners: [],
  };
  const gap = opts.pauseMs ?? 120;
  const linked = new Map<string, string>(); // onboarding item id → contact id, as this run goes
  const pending = new Set<string>(); // onboarding items whose contact this run creates (dry run: would create)
  // One contact cannot be two onboarding records (or two clients): the second row would overwrite the first. `claimed` catches two
  // rows of one board landing on the same contact inside a run; `creating` does the same for two rows that would each create a
  // contact with the same email, phone or business name (a dry run creates nothing, so the first row's contact is not there to find).
  const claimed = { onboarding: new Map<string, string>(), client: new Map<string, string>() };
  const creating = new Map<string, { row: string; kind: "onboarding" | "client" }>();
  const what = (kind: "onboarding" | "client") => (kind === "onboarding" ? "onboarding record" : "client");
  const conflictOn = (kind: "onboarding" | "client", row: MondayRow, c: GhlContact): string => {
    const holds = deskText(c, f, kind === "onboarding" ? "mondayOnboardingId" : "mondayClientId").trim();
    const inRun = claimed[kind].get(c.id) || "";
    // A client row may carry its (gone) onboarding item's id for its files; that is not a second onboarding record unless the contact is one.
    const other = holds && holds !== row.id && (kind === "client" || !!deskText(c, f, "obStage") || (c.tags || []).includes(DESK_TAGS.onboarding)) ? holds : inRun && inRun !== row.id ? inRun : "";
    return other ? `contact ${c.id} (${(c.companyName || contactDisplayName(c) || "no name").trim()}) already carries ${what(kind)} item ${other} from the old board, and one contact cannot be two ${what(kind)}s. Two businesses that share an email or phone need a contact each: make one in GoHighLevel for this business and pass map: { "${row.id}": "<contact id>" }. The same business listed twice on the board: import only one of the rows.` : "";
  };
  const planFor = (kind: "onboarding" | "client", row: MondayRow, c: GhlContact | null, keepClient = false): Plan => {
    const plan = kind === "onboarding" ? planOnboarding(row, c, f, c && opts.origin ? deskUrl(opts.origin, { tab: "onboarding", client: c.id }) : "") : planClient(row, c, f, { keep: keepClient });
    // A phone that is not a whole number is not written: GoHighLevel would refuse the contact, or keep a number nobody can dial.
    if (plan.native.phone && plan.native.phone.replace(/\D/g, "").length < 10) { plan.warnings.push(`the board's phone (${plan.native.phone}) is not a whole number — left off`); delete plan.native.phone; }
    // GoHighLevel refuses an email or phone another contact already holds, and that refusal would fail the whole write:
    // leave this contact's blank as it is and say so (the dry run shows it too).
    if (c) {
      const emailOwner = plan.native.email ? ix.byEmail.get(plan.native.email) : undefined;
      if (emailOwner && emailOwner.id !== c.id) { plan.warnings.push(`the board's email is already on another contact (${emailOwner.id}) — not added to this one; if that is the same business, merge the two in GoHighLevel`); delete plan.native.email; }
      const phoneOwner = plan.native.phone ? ix.byPhone.get(plan.native.phone) : undefined;
      if (phoneOwner && phoneOwner.id !== c.id) { plan.warnings.push(`the board's phone is already on another contact (${phoneOwner.id}) — not added to this one; if that is the same business, merge the two in GoHighLevel`); delete plan.native.phone; }
    }
    if ((row.updates || []).length >= UPDATES_PER_ITEM) plan.warnings.push(`this item has ${UPDATES_PER_ITEM} or more updates — only the newest ${UPDATES_PER_ITEM} are copied as notes`);
    return plan;
  };
  /**
   * Everything after the field write: the desk tag(s), one note per Monday update (the marker is the update id, so never twice),
   * and the storage link. Run for every written row — and for a row that is already imported, so a run that stopped after the
   * fields were written is finished by the next one instead of being skipped as "imported". `apply: false` only reports.
   */
  const finish = async (kind: "onboarding" | "client", row: MondayRow, c: GhlContact, tags: string[], out: DeskMigrateRow, apply: boolean, marker = false): Promise<{ did: string[]; left: string[]; copied: number }> => {
    const did: string[] = []; const left: string[] = [];
    // The legacy marker belongs to "imported" too: a row without "Team desk" whose contact has no marker at all (GoHighLevel did not keep it
    // the first time) gets it now — and is read back. Only ever where the field is blank; an owner's own Yes or No never reaches here.
    if (marker) {
      if (apply) {
        await updateContact(c.id, { customFields: deskWrites(f, { legacy: "Yes" }) });
        if (!isLegacyClient(await getContact(c.id), f)) throw new Error(`GoHighLevel did not keep "Yes" in ${f.legacy?.name || DESK_FIELDS.legacy.name} on ${c.id}, so this client does not show as a legacy client. Fix that field in GoHighLevel (Settings → Custom Fields) and run this row again, or mark the client from its panel.`);
        did.push("marked a legacy client");
      } else left.push("mark as a legacy client");
    }
    const missingTags = tags.filter((t) => !(c.tags || []).includes(t));
    if (missingTags.length) { if (apply) { await addTags(c.id, tags); did.push(`tag ${missingTags.join(", ")}`); } else left.push(`tag ${missingTags.join(", ")}`); }
    const have = await listNotes(c.id);
    let copied = 0; let waiting = 0;
    for (const u of [...(row.updates || [])].reverse()) {
      const body = (u.text_body || "").trim();
      if (!body || have.some((n) => (n.body || "").includes(importMarker(u.id)))) continue;
      if (!apply) { waiting++; continue; }
      const handoff = /\[CC-HANDOFF:([^\]]+)\]/.exec(body)?.[1];
      // The markers ride on the first line: if GoHighLevel ever cuts a long note short, "already copied" still holds.
      await addNote(c.id, `From the old board (${u.creator?.name || "Team"}, ${u.created_at.slice(0, 10)}): ${importMarker(u.id)}${handoff ? ` ${summaryMarker(handoff)}` : ""} [CC-SRC:${kind === "onboarding" ? "onboarding" : "client"}]\n${body}`);
      copied++; await pause(gap);
    }
    if (copied) did.push(`${copied} update${copied === 1 ? "" : "s"} copied as notes`);
    if (waiting) left.push(`${waiting} update${waiting === 1 ? "" : "s"} to copy as notes`);
    // Storage: the client's intake / file record stays under its Monday-era key and learns which contact it belongs to.
    const onboardingScope = kind === "client" ? text(row, CCOL.onboardingItem) : "";
    for (const scope of kind === "onboarding" ? [row.id] : [`c${row.id}`, ...(MONDAY_ID.test(onboardingScope) ? [onboardingScope] : [])]) {
      const intake = await readIntake(scope).catch(() => null);
      if (intake && intake.contactId !== c.id) {
        if (apply) { await writeIntake({ ...intake, contactId: c.id }); out.storage.push(`intake/${scope}: contactId set`); did.push(`storage link intake/${scope}`); }
        else left.push(`storage link intake/${scope}`);
      } else if (intake) out.storage.push(`intake/${scope}: already linked`);
    }
    return { did, left, copied };
  };

  for (const { kind, row } of slice) {
    const board = kind === "onboarding" ? "onboarding" as const : "clients" as const;
    const out: DeskMigrateRow = { board, mondayId: row.id, name: row.name, match: "unmatched", ghlId: "", ghlName: "", state: row.group?.title || "", fields: [], contactFields: [], owner: false, tags: [], updates: (row.updates || []).filter((u) => (u.text_body || "").trim()).length, checklist: (row.subitems || []).length, storage: [], warnings: [] };
    try {
      const stripeCustomer = kind === "client" && /^cus_[A-Za-z0-9]+$/.test(text(row, CCOL.stripeCustomer)) ? text(row, CCOL.stripeCustomer) : "";
      let stripeEmail = "";
      if (stripeCustomer && stripeConnected()) stripeEmail = (await snapshot(stripeCustomer).catch(() => null))?.email?.toLowerCase() || "";
      const email = text(row, kind === "onboarding" ? COL.email : CCOL.email); const phone = text(row, kind === "onboarding" ? COL.phone : CCOL.phone);
      const found = matchRow({ row, kind, email, phone, leadId: kind === "onboarding" ? text(row, COL.leadId) : "", onboardingItem: kind === "client" ? text(row, CCOL.onboardingItem) : "", stripeCustomer, stripeEmail }, ix, { map: opts.map, createNameOnly: opts.createNameOnly, linked, pending });
      let match = found.match; let detail = found.detail; let candidates = found.candidates;
      // Plan from a FRESH read by id, never from the search copy: search results lag writes (an earlier row in this run may
      // have just written this contact) and can come without the name pair — and "fill only what is blank" must see the truth.
      let contact = found.contact ? await getContact(found.contact.id) : null;
      const mondayKey: DeskFieldKey = kind === "onboarding" ? "mondayOnboardingId" : "mondayClientId";
      const carries = (c: GhlContact) => deskText(c, f, mondayKey).trim() === row.id;
      const labelOf = (c: GhlContact) => (c.companyName || contactDisplayName(c) || c.id).trim();
      const pinned = opts.map?.[row.id] || "";
      const key = nameKey(row.name).slice(0, 120); // the business name as the records and the twin check know it
      const also: { warnings: string[]; blockers: string[] } = { warnings: [], blockers: [] }; // added to the plan once there is one
      if (pinned && match === "imported" && contact && contact.id !== pinned) also.warnings.push(`the map for this row was ignored: the row is already imported on ${contact.id}`);
      // The import's own records. Read for a row that would get a contact from its name alone (did an earlier run already make it,
      // or start to?) and for a pinned row (was it already imported onto another contact that the search does not list yet?).
      let remembered = false;
      if ((!contact && match === "create-name-only") || (pinned && match !== "imported")) {
        let own: Remembered = { state: "none" }; let named: Remembered = { state: "none" };
        try {
          own = await rememberedAt(ROW_RECORD(kind, row.id));
          if (own.state === "none" && match === "create-name-only" && key.length >= 2) named = await rememberedAt(NAME_RECORD(key));
        } catch (e) {
          // Without its records the import creates nothing from a name alone. A pinned row goes on (the pin is the operator's own word), and says what it could not check.
          if (match === "create-name-only") also.blockers.push(`the import's own records could not be read (${plain(e)}), so it cannot tell whether an earlier run already made this contact — nothing is created until they can be read`);
          else also.warnings.push(`the import's own record for this row could not be read (${plain(e)}), so it could not check whether the row was already imported onto another contact`);
        }
        const sameRow = (r: CreateRecord) => r.kind === kind && r.mondayId === row.id;
        if (pinned && own.state === "contact" && own.contact.id !== pinned) {
          candidates = [{ id: own.contact.id, name: labelOf(own.contact) }]; match = "unmatched"; contact = null;
          detail = `this row is already imported: the import created contact ${own.contact.id} for it. Pinning it to ${pinned} as well would put one board row on two contacts. To move it, clear ${f[mondayKey]?.name || DESK_FIELDS[mondayKey].name} on ${own.contact.id} in GoHighLevel first, then run this again.`;
        } else if (!contact && match === "create-name-only") {
          if (own.state === "contact" || (named.state === "contact" && sameRow(named.record))) {
            contact = own.state === "contact" ? own.contact : (named as Extract<Remembered, { state: "contact" }>).contact;
            remembered = true; match = carries(contact) ? "imported" : "mapped"; detail = undefined;
            also.warnings.push("found through the import's own record of the contact it created for this row — GoHighLevel's search does not list it yet");
          } else if (own.state === "pending" || (named.state === "pending" && sameRow(named.record))) {
            const p = own.state === "pending" ? own : (named as Extract<Remembered, { state: "pending" }>);
            also.blockers.push(`an earlier run started creating this contact at ${p.record.startedAt} and never recorded how that ended, so the contact may exist. If it does, GoHighLevel's search lists it within a minute or two and this row then reads imported; if it does not, the row is free again at ${p.until}`);
          } else if (named.state === "contact") {
            // Another row with the very same business name already got a contact: the same business, exactly as a name match against GoHighLevel would say.
            contact = named.contact; match = "company-name"; detail = undefined;
            also.warnings.push(`matched through the import's own record: row ${named.record.mondayId} created a contact with this business name`);
          } else if (named.state === "pending") {
            also.blockers.push(`row ${named.record.mondayId} started creating a contact with this very business name at ${named.record.startedAt}; this row waits until that is settled (free again at ${named.until})`);
          }
        }
      }
      let joins = ""; // dry run only: the row of the OTHER board whose new contact this row would land on
      if (contact) {
        const conflict = conflictOn(kind, row, contact);
        const refuse = (why: string) => { candidates = [{ id: contact!.id, name: labelOf(contact!) }]; match = "unmatched"; detail = why; contact = null; };
        if (conflict) refuse(conflict);
        else if (contact.id === TEST_CONTACT_ID) refuse("that is the designated test contact — nothing is ever imported onto it");
        // A contact that is ALREADY a client on the desk and did not come from this row: importing would put the board's status, health and
        // payment fields over a live record. Only an explicit pin goes on, and then nothing the contact holds is replaced (planClient, keep).
        else if (kind === "client" && !pinned && !remembered && isClientRecord(contact, f) && !carries(contact)) refuse(`contact ${contact.id} (${labelOf(contact)}) is already a client on the desk and did not come from this board row. Importing the row would put the board's status, health and payment fields over what the desk holds. If it is the same business, pass map: { "${row.id}": "${contact.id}" } — the row then keeps everything the contact already has and only fills what is blank.`);
      } else if (opts.dryRun && (match === "create" || match === "create-name-only")) {
        // A dry run creates nothing, so an earlier row's new contact is not there to find: rows that would each create a contact are compared
        // with each other instead. The business name counts too, exactly as it does against contacts GoHighLevel already has. (A real run
        // needs none of this: a contact it creates is in the index — and in the import's records — before the next row is looked at.)
        const keys = [email.trim() ? `e:${email.trim().toLowerCase()}` : "", phone && normalizePhone(phone).length >= 11 ? `p:${normalizePhone(phone)}` : "", key.length >= 2 ? `n:${key}` : ""].filter(Boolean);
        const twinKey = keys.find((k) => creating.has(k)); const twin = twinKey ? creating.get(twinKey) : undefined;
        const shared = twinKey?.startsWith("n:") ? "business name" : "email or phone";
        if (twin && twin.kind === kind) { match = "unmatched"; detail = `row ${twin.row} creates a contact with the same ${shared}, and one contact cannot be two ${what(kind)}s. ${twinKey?.startsWith("n:") ? "The same business listed twice on the board: import only one of the rows. Two different businesses with one name" : "Two businesses that share an email or phone"} need a contact each: make one in GoHighLevel for this business and pass map: { "${row.id}": "<contact id>" }.`; }
        else if (twin) { match = twinKey!.startsWith("e:") ? "email" : twinKey!.startsWith("p:") ? "phone" : "company-name"; joins = twin.row; }
        else for (const k of keys) creating.set(k, { row: row.id, kind });
      }
      if (contact) {
        // The winners list at the end reads these, so it too is decided on what the contact holds now — and only for a row that really is on this contact.
        ix.byId.set(contact.id, contact);
        if (remembered && carries(contact)) (kind === "onboarding" ? ix.byMondayOnboarding : ix.byMondayClient).set(row.id, contact);
      }
      out.match = match; out.candidates = candidates; out.detail = detail; report.counts[match]++;
      out.ghlId = contact?.id || ""; out.ghlName = contact ? (contact.companyName || contactDisplayName(contact) || "").trim() : joins ? `(the contact row ${joins} creates in this run)` : "";
      if (contact) { claimed[kind].set(contact.id, row.id); if (kind === "onboarding") linked.set(row.id, contact.id); }
      if (!contact && kind === "onboarding" && (match === "create" || match === "create-name-only")) pending.add(row.id);
      if (match === "unmatched") { report.rows.push(out); continue; }
      if (match === "onboarding-record" && !contact) { // a dry run (nothing is created yet), or a real run in which the onboarding row failed
        out.ghlName = "(the contact its onboarding record creates)";
        if (!opts.dryRun) out.detail = "skipped: its onboarding record was not written in this run — fix that row and run this again";
        report.rows.push(out); continue;
      }
      let creates = !contact && (match === "create" || match === "create-name-only"); // false again if GoHighLevel turns out to hold the contact already
      const nameOnly = creates && match === "create-name-only"; // nothing but a business name: GoHighLevel has no way to refuse a second one
      // Pinned onto a contact that is already a client on the desk and did not come from this row: nothing it holds is replaced.
      const keepClient = kind === "client" && !!contact && !!pinned && !remembered && isClientRecord(contact, f) && !carries(contact);
      let plan = planFor(kind, row, contact, keepClient);
      plan.warnings.push(...also.warnings); plan.blockers.push(...also.blockers);
      // Asked for by hand, and only for a contact made from a name alone: the business name also goes in the contact's own name.
      if (nameOnly && opts.businessAsContactName && !plan.native.firstName && row.name.trim()) plan.native.firstName = row.name.trim().slice(0, 100);
      if (kind === "client" && contact && stillOnboarding(contact, f)) plan.warnings.push("this contact is still in onboarding, so the client shows on the Onboarding tab — not on the Clients tab — until it is launched");
      if (kind === "client") {
        // The Monday desk kept an unlinked client's files under "c" + its row id. If this contact's files live under another key
        // (its onboarding record's), those would no longer show: say so now rather than after the switch.
        const scope = (contact ? deskText(contact, f, "mondayOnboardingId").trim() : "") || (typeof plan.values.mondayOnboardingId === "string" ? plan.values.mondayOnboardingId : "") || `c${row.id}`;
        const own = scope === `c${row.id}` ? null : await readIntake(`c${row.id}`).catch(() => null);
        if (own?.files.length) plan.warnings.push(`${own.files.length} file${own.files.length === 1 ? "" : "s"} added on the Clients tab ${own.files.length === 1 ? "is" : "are"} stored under c${row.id}, but this contact's files live under ${scope} — ${own.files.length === 1 ? "it" : "they"} will not show on the desk after the switch unless moved`);
      }
      // A contact the import made itself is tagged monday-import — also when a second run finishes what the first one left
      // (it knows its own contacts by the record it kept, or by the source it gave them).
      const ours = remembered || (contact?.source || "").trim().toLowerCase() === IMPORT_SOURCE.toLowerCase();
      const tagsFor = (pl: Plan) => (creates || ours ? [...pl.tags, DESK_TAGS.imported] : pl.tags);
      const describe = () => {
        out.fields = fieldNames(f, plan.values); out.contactFields = Object.keys(plan.native).filter((k) => k !== "assignedTo"); out.owner = "assignedTo" in plan.native; out.tags = tagsFor(plan); out.warnings = plan.warnings;
        // The desk link is a web address with a query string; a report says what it is instead (the browser tool that reads reports redacts anything shaped like one).
        out.values = Object.fromEntries((Object.keys(plan.values) as DeskFieldKey[]).map((k) => [f[k]?.name || DESK_FIELDS[k].name, k === "deskLink" ? "the link that opens this record on the desk" : shown(plan.values[k])]));
        out.contact = Object.fromEntries(Object.entries(plan.native).filter(([k]) => k !== "assignedTo").map(([k, v]) => [k, shown(v)]));
        if (kind === "client") out.legacy = !!plan.legacy;
      };
      describe();
      if (creates) {
        // Before a contact is created: does GoHighLevel already hold this business under a slightly different name? (Rows earlier in this run count too.)
        const site = link(row, kind === "onboarding" ? COL.siteUrl : CCOL.website);
        const alike = lookalikes(row.name, site, ix);
        out.similar = alike.slice(0, 5);
        if (alike.length) plan.warnings.push(`${alike.length} contact${alike.length === 1 ? "" : "s"} already in GoHighLevel look${alike.length === 1 ? "s" : ""} like this business (see similar${alike.length > 5 ? ", which lists the five closest" : ""}) — if one is the same business, pin this row to it with map instead of creating a second contact`);
        out.detail = nameOnly ? "creates a new contact from the business name alone (the row has no email or phone)" : "creates a new contact";
        // A dry run creates nothing, so the next rows could not see this one: stand it in the list they are compared with.
        if (opts.dryRun) ix.all.push({ id: `row ${row.id} of this run (not created yet)`, companyName: row.name, website: site });
      }
      if (plan.blockers.length) {
        if (!opts.dryRun) throw new Error(`not imported: ${plan.blockers.join("; ")}`);
        out.detail = `BLOCKED — a real run will refuse this row: ${plan.blockers.join("; ")}`; report.rows.push(out); continue;
      }
      if (match === "imported" && !opts.force) {
        // Imported means FINISHED: fields, tags, notes and the storage link. A run that stopped part-way is completed here.
        // No field is written on this path, so the report does not list any as "what this row writes".
        out.values = undefined; out.contact = undefined;
        // …and what it says about the record is what the CONTACT holds, not what the row would have written.
        const marker = kind === "client" && plan.values.legacy === "Yes"; // a row without "Team desk" on a contact that has no marker at all
        if (kind === "client") out.legacy = isLegacyClient(contact!, f);
        const lacking = (Array.isArray(plan.values.packages) ? plan.values.packages : []).filter((p) => !deskList(contact!, f, "packages").includes(p));
        if (lacking.includes(GIVEAWAY_WINNER)) plan.warnings.push(`NOT PROTECTED: the board row is a ${GIVEAWAY_WINNER} and the contact's Desk Packages does not carry that label, so the billing guard would let this client be billed. Add ${GIVEAWAY_WINNER} to Desk Packages on the contact, unless it was taken off on purpose`);
        if (lacking.some((p) => p !== GIVEAWAY_WINNER)) plan.warnings.push(`the board row carries ${lacking.filter((p) => p !== GIVEAWAY_WINNER).join(", ")} and the contact does not — nothing was changed (force re-writes a row's fields from the board)`);
        const rest = await finish(kind, row, contact!, tagsFor(plan), out, !opts.dryRun, marker);
        if (rest.did.includes("marked a legacy client")) out.legacy = true;
        if (rest.did.length) { out.detail = `already imported — finished what an earlier run left: ${rest.did.join(", ")}`; out.done = true; report.counts.finished++; }
        else if (rest.left.length) out.detail = `already imported, but an earlier run did not finish: ${rest.left.join(", ")} — the next real run completes it`;
        else out.detail = "already imported — skipped (force re-writes it)";
        report.rows.push(out); continue;
      }
      if (opts.dryRun) { report.rows.push(out); continue; }

      // The lead this onboarding record was handed off from: keep its Monday lead id on the contact so the stored handoff is found.
      const fieldsFor = (c: GhlContact | null) => [...deskWrites(f, plan.values), ...(plan.salesLeadId && sales.mondayLeadId && !(c && fieldText(c, sales.mondayLeadId.id)) ? [{ id: sales.mondayLeadId.id, field_value: plan.salesLeadId as unknown }] : [])];
      let customFields = fieldsFor(contact);
      let created = false;
      // A contact made from a name alone: the import says so in its own records BEFORE the create is sent (see "the import's own records").
      const record: CreateRecord = { kind, mondayId: row.id, name: row.name, contactId: "", startedAt: new Date().toISOString() };
      const records = nameOnly ? [ROW_RECORD(kind, row.id), ...(key.length >= 2 ? [NAME_RECORD(key)] : [])] : [];
      if (!contact) {
        for (const path of records) await writeJson(path, record); // storage will not take it → the row fails here, and nothing was sent to GoHighLevel
        // A plain create, never an upsert: if GoHighLevel already has this email or phone (its search had not caught up with a
        // brand-new contact) it refuses and names the contact, and that contact is then treated as what it is — an existing one.
        try { contact = await createContact({ locationId: ghlLocationId(), ...plan.native, customFields, source: IMPORT_SOURCE }); created = true; }
        catch (e) {
          const dup = e instanceof GhlError ? /"contactId"\s*:\s*"([A-Za-z0-9]+)"/.exec(e.body)?.[1] : undefined;
          // GoHighLevel said no (a 4xx): nothing was created, so the records come away and the row can be run again at once. Anything else — no
          // answer, a 5xx, an answer that is not JSON — and the contact MAY exist: the records stay, and they hold the row until the search can say.
          const refused = e instanceof GhlError && e.ghlStatus >= 400 && e.ghlStatus < 500 && e.ghlStatus !== 408;
          if (refused) for (const path of records) await deletePath(path);
          if (!dup) {
            if (nameOnly && refused && e instanceof GhlError && [400, 422].includes(e.ghlStatus)) throw new Error(`GoHighLevel would not create a contact from the business name alone (${e.ghlStatus}): ${e.body.slice(0, 200)}. Nothing was created. If it is asking for a person's name, run this row again with businessAsContactName: true; otherwise make the contact by hand in GoHighLevel and pin the row to it with map.`);
            if (nameOnly && !refused) throw new Error(`${plain(e)} — the contact may or may not have been created. The import has noted that a create was started for this row: it is held until GoHighLevel's search can say (ten minutes at most). Do a dry run before anything else.`);
            throw e;
          }
          contact = await getContact(dup);
          const conflict = conflictOn(kind, row, contact);
          if (conflict) throw new Error(conflict);
          if (contact.id === TEST_CONTACT_ID) throw new Error("GoHighLevel matched this row to the designated test contact by its email or phone — nothing is ever imported onto it.");
          if (kind === "client" && isClientRecord(contact, f) && !carries(contact)) throw new Error(`GoHighLevel already has a contact with this email or phone (${contact.id}), and it is already a client on the desk that did not come from this board row. Nothing was written. If it is the same business, pass map: { "${row.id}": "${contact.id}" } — the row then keeps everything the contact already has and only fills what is blank.`);
          creates = false; out.similar = undefined;
          plan = planFor(kind, row, contact); describe();
          if (plan.blockers.length) throw new Error(`not imported: ${plan.blockers.join("; ")}`);
          customFields = fieldsFor(contact);
          out.warnings.push(`GoHighLevel already had a contact with this email or phone (${contact.id}) that its search did not show yet — matched to it instead of creating one; only its blank details were filled`);
        }
      }
      if (created) {
        out.tags = [...plan.tags, DESK_TAGS.imported];
        // Finish the records with the contact's id before anything else is done with it.
        if (records.length) {
          const done: CreateRecord = { ...record, contactId: contact.id, createdAt: new Date().toISOString() };
          try { for (const path of records) await writeJson(path, done); out.storage.push(`import record: this row created contact ${contact.id}`); }
          catch { out.warnings.push("the import could not finish its own record of the new contact, so this row is held for ten minutes — by then GoHighLevel's search lists the contact and the row reads imported"); }
        }
        // The staff link back to the desk needs the new contact's id, so it is written once the contact exists.
        if (kind === "onboarding" && opts.origin) {
          const link = deskWrites(f, { deskLink: deskUrl(opts.origin, { tab: "onboarding", client: contact.id }) });
          await updateContact(contact.id, { customFields: link });
          customFields.push(...link);
        }
      } else await updateContact(contact.id, { ...plan.native, customFields });
      const contactId = contact.id;
      out.ghlId = contactId; if (!out.ghlName || created) out.ghlName = created ? row.name : (contact.companyName || contactDisplayName(contact) || "").trim();
      // Read the contact back and prove the two things that must never be lost quietly before calling this record imported:
      // the checklist (one large-text field — every row, whole) and the packages (a dropped Giveaway Winner label would let a winner be billed).
      const merged = await getContact(contactId);
      if (typeof plan.values.checklist === "string" && serializeChecklist(parseChecklist(deskText(merged, f, "checklist"))) !== plan.values.checklist) {
        throw new Error(`GoHighLevel kept ${parseChecklist(deskText(merged, f, "checklist")).length} of ${out.checklist} checklist rows whole — the Desk Checklist field is too small for this record. The other fields were written; fix the field and re-run this row with force.`);
      }
      const lost = (Array.isArray(plan.values.packages) ? plan.values.packages : []).filter((p) => !deskList(merged, f, "packages").includes(p));
      if (lost.length) throw new Error(`GoHighLevel did not keep ${lost.map((p) => `"${p}"`).join(", ")} in Desk Packages on ${contactId}. The other fields were written; fix the Desk Packages field (or set the packages on the contact by hand) and re-run this row with force.`);
      if (plan.values.legacy === "Yes" && deskText(merged, f, "legacy").trim().toLowerCase() !== "yes") throw new Error(`GoHighLevel did not keep "Yes" in ${f.legacy?.name || DESK_FIELDS.legacy.name} on ${contactId}, so this client would not show as a legacy client. The other fields were written; fix that field in GoHighLevel (Settings → Custom Fields) and mark the client from its panel, or re-run this row with force.`);
      // A later row for the same business (its Active Clients row) is matched against what GoHighLevel holds now.
      ix.byId.set(contactId, merged);
      const company = nameKey(merged.companyName || "");
      if (created && company.length >= 4 && !(ix.byCompany.get(company) || []).some((c) => c.id === contactId)) ix.byCompany.set(company, [...(ix.byCompany.get(company) || []), merged]);
      if (created) ix.all.push(merged); // …and listed as a look-alike for the rows after it
      (kind === "onboarding" ? ix.byMondayOnboarding : ix.byMondayClient).set(row.id, merged);
      if (merged.email && !ix.byEmail.has(merged.email.toLowerCase())) ix.byEmail.set(merged.email.toLowerCase(), merged);
      if (merged.phone && !ix.byPhone.has(normalizePhone(merged.phone))) ix.byPhone.set(normalizePhone(merged.phone), merged);
      claimed[kind].set(contactId, row.id);
      if (kind === "onboarding") linked.set(row.id, contactId);
      const rest = await finish(kind, row, merged, out.tags, out, true);
      out.detail = `wrote ${customFields.length} fields, ${rest.copied} of ${out.updates} updates copied as notes`; out.done = true;
      report.counts.written++;
      await pause(gap);
    } catch (e) { out.error = (e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 600); report.counts.failed++; } // no query-string shapes: the browser tool that reads this report redacts them
    report.rows.push(out);
  }
  const winnerRow = (r: MondayRow, boardName: "onboarding" | "clients", index: Map<string, GhlContact>) => {
    const hit = index.get(r.id); const c = hit ? ix.byId.get(hit.id) || hit : undefined;
    return { board: boardName, mondayId: r.id, name: r.name, imported: !!c, protected: !!c && isGiveawayWinner(deskList(c, f, "packages")) };
  };
  const isWinner = (r: MondayRow, colId: string) => isGiveawayWinner(splitPackages(text(r, colId)));
  report.winners = [
    ...pipeline.filter((r) => r.group?.id !== TEMPLATE_GROUP_ID && isWinner(r, COL.package)).map((r) => winnerRow(r, "onboarding", ix.byMondayOnboarding)),
    ...clients.filter((r) => isWinner(r, CCOL.package)).map((r) => winnerRow(r, "clients", ix.byMondayClient)),
  ];
  return report;
}
