import { CallDeskError } from "@/lib/calls/validation";
import { createCustomField, listCustomFields, type GhlContact, type GhlFieldDef, type NewFieldDef } from "@/lib/ghl/client";
import { AGREEMENT, BUSINESS_TYPES, DNS_PATHS, HEALTH, INTAKE, PAYMENT, STAGES } from "@/lib/onboarding/config";
import { CLIENT_GBP, CLIENT_GROUPS, CLIENT_HEALTH, PAY_METHOD, PAY_STATUS } from "@/lib/clients/config";
import { ALL_PACKAGE_LABELS, splitPackages } from "./money";

// The contact custom fields the Onboarding and Clients tabs live on (Oct 1 2026, Phase 2).
//
// EVERY ONE IS NEW AND DESK-OWNED: the name starts with "Desk " and the desk writes nothing else.
// The Creative Cowboys location already carries Josh's Local SEO Engine — 78 "LSE …" contact fields and
// eighteen published automations (LSE-01 … LSE-12 and companions) that EMAIL AND TEXT CLIENTS when certain
// LSE fields change (LSE Profile Complete, LSE Build Week, LSE Report URL, LSE Next Offer, LSE Health),
// when LSE Term End comes up, or when an `lse:` tag is added. So a desk concept that looks like an LSE one
// (health, payment state, term end, last report, profile complete, baseline, GBP access, DNS path, the
// onboarding link) gets its OWN "Desk …" field here and is never wired to the LSE field. Whether to connect
// any of them is Dave and Josh's decision, not something code does on its own.
//
// As with the Sales tab, no GoHighLevel field id is hard-coded: definitions are read from GoHighLevel
// (cached 10 min) and matched by name. Missing fields are created by ensureDeskFields() — POST
// /api/team/ghl/setup { scope: "desk" }, owner-only, dry-run by default — or by hand with exactly these names.
export type DeskFieldKey =
  // shared by onboarding and clients (one contact per business)
  | "packages" | "customMonthly" | "notes" | "gbpAccess" | "gbpChecked" | "gbpUrl" | "searchAtlasListing" | "driveFolder" | "lastTouch"
  // onboarding
  | "obStage" | "obHealth" | "obOwner" | "buildOwner" | "salesOwner" | "businessType" | "signed" | "targetLaunch" | "profileComplete" | "baseline"
  | "dnsPath" | "nextAction" | "nextDue" | "setup" | "agreement" | "obPayment" | "intake" | "handoffId" | "checklist" | "deskLink" | "mondayOnboardingId"
  // clients
  | "clientStatus" | "clientHealth" | "accountManager" | "payStatus" | "payMethod" | "billingDay" | "nextBill" | "lastPayment" | "clientSince" | "termEnds" | "lastReport"
  | "stripeCustomer" | "mondayClientId"
  // added Oct 2 2026, after the cutover: the marker for a legacy client (see OPTIONAL_DESK_FIELDS below)
  | "legacy";

export const DESK_PREFIX = "Desk ";
/** The write guard: a field the desk may write is named "Desk …" in GoHighLevel (whatever the capitalisation). */
export const isDeskFieldName = (name: string): boolean => /^desk\s/i.test(name.trim());
export const YES_NO = ["Yes", "No"] as const;
/** Stage and status options are the labels the desk shows (not the old Monday group titles). */
export const STAGE_LABELS: readonly string[] = STAGES.map((s) => s.label);
export const CLIENT_STATUS_LABELS: readonly string[] = CLIENT_GROUPS.map((g) => g.label);
/** One GBP access field for the whole life of the client: the Onboarding states plus the Clients-only "Lost / recheck". */
export const DESK_GBP_ACCESS: readonly string[] = CLIENT_GBP;

export const DESK_FIELDS: Record<DeskFieldKey, NewFieldDef> = {
  packages: { name: "Desk Packages", dataType: "MULTIPLE_OPTIONS", options: [...ALL_PACKAGE_LABELS], position: 301 },
  customMonthly: { name: "Desk Custom Monthly", dataType: "MONETORY", position: 302 },
  notes: { name: "Desk Notes", dataType: "LARGE_TEXT", position: 303 },
  gbpAccess: { name: "Desk GBP Access", dataType: "SINGLE_OPTIONS", options: [...DESK_GBP_ACCESS], position: 304 },
  gbpChecked: { name: "Desk GBP Last Checked", dataType: "DATE", position: 305 },
  gbpUrl: { name: "Desk GBP URL", dataType: "TEXT", position: 306 },
  searchAtlasListing: { name: "Desk Search Atlas Listing", dataType: "TEXT", placeholder: "Search Atlas location id (numbers only) — set from the desk", position: 307 },
  driveFolder: { name: "Desk Drive Folder", dataType: "TEXT", position: 308 },
  lastTouch: { name: "Desk Last Touch", dataType: "DATE", position: 309 },
  obStage: { name: "Desk Onboarding Stage", dataType: "SINGLE_OPTIONS", options: [...STAGE_LABELS], position: 311 },
  obHealth: { name: "Desk Onboarding Health", dataType: "SINGLE_OPTIONS", options: [...HEALTH], position: 312 },
  obOwner: { name: "Desk Onboarding Owner", dataType: "TEXT", position: 313 },
  buildOwner: { name: "Desk Build Owner", dataType: "TEXT", position: 314 },
  salesOwner: { name: "Desk Sales Owner", dataType: "TEXT", position: 315 },
  businessType: { name: "Desk Business Type", dataType: "SINGLE_OPTIONS", options: [...BUSINESS_TYPES], position: 316 },
  signed: { name: "Desk Signed", dataType: "DATE", position: 317 },
  targetLaunch: { name: "Desk Target Launch", dataType: "DATE", position: 318 },
  profileComplete: { name: "Desk Profile Complete", dataType: "SINGLE_OPTIONS", options: [...YES_NO], position: 319 },
  baseline: { name: "Desk Baseline Captured", dataType: "SINGLE_OPTIONS", options: [...YES_NO], position: 320 },
  dnsPath: { name: "Desk DNS Path", dataType: "SINGLE_OPTIONS", options: [...DNS_PATHS], position: 321 },
  nextAction: { name: "Desk Next Action", dataType: "TEXT", position: 322 },
  nextDue: { name: "Desk Next Action Due", dataType: "DATE", position: 323 },
  setup: { name: "Desk Setup Amount", dataType: "MONETORY", position: 324 },
  agreement: { name: "Desk Agreement", dataType: "SINGLE_OPTIONS", options: [...AGREEMENT], position: 325 },
  obPayment: { name: "Desk Onboarding Payment", dataType: "SINGLE_OPTIONS", options: [...PAYMENT], position: 326 },
  intake: { name: "Desk Intake", dataType: "SINGLE_OPTIONS", options: [...INTAKE], position: 327 },
  handoffId: { name: "Desk Handoff ID", dataType: "TEXT", placeholder: "Set by the desk — do not edit", position: 328 },
  checklist: { name: "Desk Checklist", dataType: "LARGE_TEXT", placeholder: "[x] done  [~] working on it  [!] stuck  [ ] not started — one item per line", position: 329 },
  deskLink: { name: "Desk Link", dataType: "TEXT", placeholder: "Opens this client on the team desk", position: 330 },
  mondayOnboardingId: { name: "Desk Monday Onboarding ID", dataType: "TEXT", placeholder: "Onboarding Pipeline item this record was imported from", position: 331 },
  clientStatus: { name: "Desk Client Status", dataType: "SINGLE_OPTIONS", options: [...CLIENT_STATUS_LABELS], position: 341 },
  clientHealth: { name: "Desk Client Health", dataType: "SINGLE_OPTIONS", options: [...CLIENT_HEALTH], position: 342 },
  accountManager: { name: "Desk Account Manager", dataType: "TEXT", position: 343 },
  payStatus: { name: "Desk Pay Status", dataType: "SINGLE_OPTIONS", options: [...PAY_STATUS], position: 344 },
  payMethod: { name: "Desk Pay Method", dataType: "SINGLE_OPTIONS", options: [...PAY_METHOD], position: 345 },
  billingDay: { name: "Desk Billing Day", dataType: "NUMERICAL", position: 346 },
  nextBill: { name: "Desk Next Bill", dataType: "DATE", position: 347 },
  lastPayment: { name: "Desk Last Payment", dataType: "DATE", position: 348 },
  clientSince: { name: "Desk Client Since", dataType: "DATE", position: 349 },
  termEnds: { name: "Desk Term Ends", dataType: "DATE", position: 350 },
  lastReport: { name: "Desk Last Report Sent", dataType: "DATE", position: 351 },
  stripeCustomer: { name: "Desk Stripe Customer ID", dataType: "TEXT", placeholder: "cus_… — set by the desk", position: 352 },
  mondayClientId: { name: "Desk Monday Client ID", dataType: "TEXT", placeholder: "Active Clients item this record was imported from", position: 353 },
  legacy: { name: "Desk Legacy Client", dataType: "SINGLE_OPTIONS", options: [...YES_NO], position: 354 },
};
export const DESK_FIELD_KEYS = Object.keys(DESK_FIELDS) as DeskFieldKey[];
/**
 * Fields added AFTER the desk went live on GoHighLevel. The desk must keep working in the minutes between a deploy that
 * knows such a field and the setup call that creates it, so these are not part of "every desk field must exist": a read
 * treats a missing one as unset, and only a write to that one field asks for it by name.
 *   legacy — "Desk Legacy Client" (Dave, Oct 2 2026): a long-standing client that was never onboarded through the desk and is
 *            billed outside GoHighLevel. Yes = legacy; No or blank = a normal desk client.
 */
export const OPTIONAL_DESK_FIELDS: readonly DeskFieldKey[] = ["legacy"];
export const REQUIRED_DESK_FIELD_KEYS: DeskFieldKey[] = DESK_FIELD_KEYS.filter((k) => !OPTIONAL_DESK_FIELDS.includes(k));

/** The only tags the desk adds to a contact in Phase 2. Never an `lse:` tag, never a tag that already means something else.
 *  `monday-import` is the desk's own Phase-1 tag ("this contact was created by a Monday import") and keeps that one meaning. */
export const DESK_TAGS = { onboarding: "desk-onboarding", client: "desk-client", imported: "monday-import" } as const;
export const DESK_TAG_LIST: readonly string[] = Object.values(DESK_TAGS);

/** Desk concepts that look like something the LSE automations own. Listed so the overlap is visible in diag and the docs; never connected in code. */
export const LSE_OVERLAPS: { desk: string; lse: string; lseEffect: string }[] = [
  { desk: "Desk Client Health / Desk Onboarding Health", lse: "LSE Health", lseEffect: "LSE-08: red → tag lse:red, stage At risk, call task; yellow → Loom task; green → back to Active" },
  { desk: "Desk Pay Status (Card Failed / Overdue)", lse: "tag lse:payment-failed", lseEffect: "LSE-09: emails and texts the client about the card, then At risk / pause tasks" },
  { desk: "Desk Term Ends", lse: "LSE Term End", lseEffect: "LSE-10: 30 days before, moves to Renewal and emails the client" },
  { desk: "Desk Last Report Sent", lse: "LSE Last Report Sent / LSE Report URL", lseEffect: "LSE-06: a new report URL emails the monthly results to the client" },
  { desk: "Desk Profile Complete", lse: "LSE Profile Complete", lseEffect: "LSE-03: emails the client \"you're in the build queue\", moves to Ready to build" },
  { desk: "Desk Baseline Captured", lse: "LSE Baseline Captured At / LSE Base Review Count", lseEffect: "LSE-05: launch guard and the \"you're live\" emails" },
  { desk: "Desk Target Launch", lse: "LSE Build Week", lseEffect: "LSE-04: emails the client their build week" },
  { desk: "Desk GBP Access", lse: "LSE GBP Access", lseEffect: "none known (profile field)" },
  { desk: "Desk DNS Path", lse: "LSE DNS Path", lseEffect: "none known (profile field)" },
  { desk: "Desk Link (staff link to the desk) / the client intake link", lse: "LSE Onboard Link", lseEffect: "merged into the LSE welcome and reminder emails" },
  { desk: "Desk Packages", lse: "LSE Plan / LSE Active Addons", lseEffect: "none known (billing fields)" },
  { desk: "Desk Onboarding Stage / Desk Client Status", lse: "opportunity stage in pipeline Local SEO — Clients", lseEffect: "LSE-02, LSE-05, LSE-10x fire on stage changes — the desk never creates or moves an opportunity" },
];

export type ResolvedDeskField = { id: string; name: string; dataType: string; options: string[] };
export type DeskFields = Partial<Record<DeskFieldKey, ResolvedDeskField>>;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
/** Match a GoHighLevel definition to a catalog entry: by field key ("contact.desk_onboarding_stage"), then by normalized name. */
export function matchDeskField(defs: GhlFieldDef[], key: DeskFieldKey): GhlFieldDef | undefined {
  const want = norm(DESK_FIELDS[key].name);
  return defs.find((d) => d.fieldKey && norm(d.fieldKey) === `contact${want}`) || defs.find((d) => norm(d.name) === want);
}
export function resolveDeskFields(defs: GhlFieldDef[]): DeskFields {
  const out: DeskFields = {};
  for (const key of DESK_FIELD_KEYS) {
    const d = matchDeskField(defs, key);
    if (d) out[key] = { id: d.id, name: d.name, dataType: d.dataType, options: (d.picklistOptions || []).map(String) };
  }
  return out;
}

let lastFreshCheck = 0;
/** Live definitions. If a REQUIRED desk field is missing from the cached list (another instance may have just created it), re-read once a minute
 *  at most. A missing optional field never forces a re-read — the desk runs without it, and the ten-minute cache picks it up once it exists —
 *  so a location without one costs nothing extra and a failed re-read can never fail a request that did not need it. */
export async function deskFields(fresh = false): Promise<DeskFields> {
  let fields = resolveDeskFields(await listCustomFields(fresh));
  if (!fresh && REQUIRED_DESK_FIELD_KEYS.some((k) => !fields[k]) && Date.now() - lastFreshCheck > 60_000) {
    lastFreshCheck = Date.now();
    fields = resolveDeskFields(await listCustomFields(true));
  }
  return fields;
}
export const resetDeskFieldCheck = () => { lastFreshCheck = 0; };

export function requireDeskField(fields: DeskFields, key: DeskFieldKey): ResolvedDeskField {
  const f = fields[key];
  if (!f) throw new CallDeskError(`The GoHighLevel custom field "${DESK_FIELDS[key].name}" does not exist yet. An owner creates the desk fields first (POST /api/team/ghl/setup with scope "desk"), or adds it in GoHighLevel → Settings → Custom Fields with that exact name.`, 503);
  return f;
}
/** Every desk field must exist before the desk writes a record — a half-set-up location would save half a client.
 *  (Fields added after the cutover are the exception — see OPTIONAL_DESK_FIELDS.) */
export function requireAllDeskFields(fields: DeskFields): void {
  const missing = REQUIRED_DESK_FIELD_KEYS.filter((k) => !fields[k]).map((k) => DESK_FIELDS[k].name);
  if (missing.length) throw new CallDeskError(`GoHighLevel is missing ${missing.length} desk field${missing.length === 1 ? "" : "s"} (${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", …" : ""}). An owner runs the desk field setup first (POST /api/team/ghl/setup with scope "desk").`, 503);
}

// ───────────────────────────── values ─────────────────────────────
export type DeskValue = string | number | string[] | null;
const MULTI = new Set(["MULTIPLE_OPTIONS", "CHECKBOX"]);
const NUMERIC = new Set(["NUMERICAL", "MONETORY"]);

/**
 * Shape a value for GoHighLevel BY THE FIELD'S LIVE DATA TYPE, so the desk keeps working if someone
 * recreates a field with another type (e.g. Desk Packages as plain text): multi-select and checkbox take a
 * list, numbers take a number, everything else a string. Empty clears the field ("" / []).
 */
export function toFieldValue(field: ResolvedDeskField, value: DeskValue): unknown {
  if (MULTI.has(field.dataType)) return Array.isArray(value) ? value : value === null || value === "" ? [] : [String(value)];
  if (NUMERIC.has(field.dataType)) {
    if (value === null || value === "" || (Array.isArray(value) && !value.length)) return "";
    const n = Number(Array.isArray(value) ? value[0] : value);
    return Number.isFinite(n) ? n : "";
  }
  if (Array.isArray(value)) return value.join(", ");
  return value === null ? "" : String(value);
}

const rawValue = (c: GhlContact, id: string | undefined): unknown => {
  if (!id) return undefined;
  const hit = (c.customFields || []).find((f) => f.id === id);
  return hit ? (hit.value !== undefined ? hit.value : hit.field_value) : undefined;
};
/** A desk field on a contact as text ("" when unset; a list is joined with ", "). */
export function deskText(c: GhlContact, fields: DeskFields, key: DeskFieldKey): string {
  const raw = rawValue(c, fields[key]?.id);
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return raw.map(String).join(", ");
  if (typeof raw === "object") return "";
  return String(raw);
}
/** A desk field as a list: a real list from a multi-select, or a comma-joined string split on the known options (labels may contain commas). */
export function deskList(c: GhlContact, fields: DeskFields, key: DeskFieldKey, known: readonly string[] = ALL_PACKAGE_LABELS): string[] {
  const raw = rawValue(c, fields[key]?.id);
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string") return splitPackages(raw, known);
  return [];
}
/** A numeric desk field as a plain number string ("297", "297.5"); "" when unset or not a number. */
export function deskNumber(c: GhlContact, fields: DeskFields, key: DeskFieldKey): string {
  const text = deskText(c, fields, key).replace(/[^\d.-]/g, "");
  if (!text || !Number.isFinite(Number(text))) return "";
  return String(Number(text));
}

/** Field writes for PUT /contacts/{id}: only desk fields, each shaped for its live type. Throws 503 if a field is missing in GoHighLevel. */
export function deskWrites(fields: DeskFields, values: Partial<Record<DeskFieldKey, DeskValue>>): { id: string; field_value: unknown }[] {
  return (Object.keys(values) as DeskFieldKey[]).filter((k) => values[k] !== undefined).map((k) => {
    const field = requireDeskField(fields, k);
    if (!isDeskFieldName(field.name)) throw new CallDeskError(`Refusing to write "${field.name}": the desk only writes fields named "Desk …".`, 500);
    return { id: field.id, field_value: toFieldValue(field, values[k] as DeskValue) };
  });
}
/** A single-select value must be one of the options GoHighLevel has on the field right now; anything else is refused rather than written blind. */
export function assertOption(fields: DeskFields, key: DeskFieldKey, value: string): void {
  const field = requireDeskField(fields, key);
  if (value && field.options.length && !field.options.includes(value)) throw new CallDeskError(`"${value}" is not an option on "${field.name}" in GoHighLevel. Add it there (Settings → Custom Fields), or pick one of: ${field.options.join(", ")}.`, 409);
}

// ───────────────────────────── setup ─────────────────────────────
export type DeskSetupReport = {
  dryRun: boolean;
  present: { key: DeskFieldKey; name: string; id: string; dataType: string; missingOptions: string[] }[];
  created: { key: DeskFieldKey; name: string; id: string }[];
  missing: { key: DeskFieldKey; name: string; dataType: string; options?: string[] }[];
  failed: { key: DeskFieldKey; name: string; error: string }[];
};
/** Idempotent: creates whatever is missing (unless dryRun). Never edits an existing field or its options — it reports options that are missing instead. */
export async function ensureDeskFields(dryRun = true, pauseMs = 150): Promise<DeskSetupReport> {
  const defs = await listCustomFields(true);
  const report: DeskSetupReport = { dryRun, present: [], created: [], missing: [], failed: [] };
  for (const key of DESK_FIELD_KEYS) {
    const def = DESK_FIELDS[key];
    const have = matchDeskField(defs, key);
    if (have) {
      const options = (have.picklistOptions || []).map(String);
      report.present.push({ key, name: have.name, id: have.id, dataType: have.dataType, missingOptions: (def.options || []).filter((o) => !options.includes(o)) });
      continue;
    }
    if (dryRun) { report.missing.push({ key, name: def.name, dataType: def.dataType, options: def.options }); continue; }
    try {
      const created = await createCustomField({ name: def.name, dataType: def.dataType, options: def.options, placeholder: def.placeholder, position: def.position });
      report.created.push({ key, name: created.name || def.name, id: created.id });
      if (pauseMs) await new Promise((r) => setTimeout(r, pauseMs));
    } catch (e) { report.failed.push({ key, name: def.name, error: e instanceof Error ? e.message : String(e) }); }
  }
  return report;
}
