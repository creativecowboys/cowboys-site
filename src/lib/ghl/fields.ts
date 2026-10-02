import { CallDeskError } from "@/lib/calls/validation";
import { createCustomField, listCustomFields, type GhlFieldDef, type NewFieldDef } from "./client";

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
/** Outreach labels, byte-identical to the Monday Giveaway Leads "Outreach Status" labels so the migration maps 1:1. */
export const OUTREACH_OPTIONS = ["Not Contacted", "Call Booked", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number", "Won"] as const;
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

export type SetupReport = { present: { key: SalesFieldKey; name: string; id: string }[]; created: { key: SalesFieldKey; name: string; id: string }[]; missing: { key: SalesFieldKey; name: string; dataType: string; options?: string[] }[]; failed: { key: SalesFieldKey; name: string; error: string }[]; dryRun: boolean };
/** Idempotent: creates whatever is missing (unless dryRun), never edits an existing field or its options. */
export async function ensureSalesFields(dryRun = true): Promise<SetupReport> {
  const defs = await listCustomFields(true);
  const report: SetupReport = { present: [], created: [], missing: [], failed: [], dryRun };
  for (const key of Object.keys(SALES_FIELDS) as SalesFieldKey[]) {
    const def = SALES_FIELDS[key];
    const have = matchField(defs, key);
    if (have) { report.present.push({ key, name: have.name, id: have.id }); continue; }
    if (dryRun) { report.missing.push({ key, name: def.name, dataType: def.dataType, options: def.options }); continue; }
    try {
      const created = await createCustomField({ name: def.name, dataType: def.dataType, options: def.options, placeholder: def.placeholder, position: def.position });
      report.created.push({ key, name: created.name || def.name, id: created.id });
      await new Promise((r) => setTimeout(r, 150));
    } catch (e) { report.failed.push({ key, name: def.name, error: e instanceof Error ? e.message : String(e) }); }
  }
  return report;
}
