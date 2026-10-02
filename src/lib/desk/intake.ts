import { createHash, randomBytes } from "node:crypto";
import { CallDeskError } from "@/lib/calls/validation";
import { contactDisplayName, type GhlContact } from "@/lib/ghl/client";
import { todayEastern } from "@/lib/onboarding/api";
import { INTAKE_TOKEN_DAYS } from "@/lib/onboarding/config";
import { emptyIntake } from "@/lib/onboarding/handoff";
import { deleteTokenIndex, readIntake, writeIntake, writeTokenIndex } from "@/lib/onboarding/store";
import type { HandoffForm, IntakeRecord } from "@/lib/onboarding/types";
import { deskText, type DeskFields } from "./fields";
import { findHandoffRecord } from "./onboarding";
import { allDeskFields, businessName, fileScopeFor, isClientRecord, isOnboardingRecord, listRecords, readContact, resolveRecordId, writeRecord } from "./record";
import { isGhlRecordId, isLegacyScope } from "./switch";
import { deskUrl } from "@/lib/desk-path";

// Client intake on the GoHighLevel desk. The intake record, the hashed token, the token → record index and the
// client's files all stay in the private Blob store exactly where they were — only the STATUS the desk shows
// ("Link issued", "Client submitted") moves from a Monday column to the contact's "Desk Intake" field.
//
// Storage keys ("scopes") do not change at the cutover: a client imported from Monday keeps its Monday-era
// scope, so a link a client was sent before the switch still opens the same record and the same files. The
// import stamps each of those records with `contactId`; a record created here is keyed by the contact id.
const now = () => new Date().toISOString();
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** The contact behind a storage scope: the contact id itself, or the imported record carrying that Monday id. Null when nothing matches. */
export async function contactIdForScope(scope: string, f: DeskFields): Promise<string | null> {
  if (isGhlRecordId(scope)) return scope;
  if (!isLegacyScope(scope)) return null;
  const client = scope.startsWith("c");
  const id = client ? scope.slice(1) : scope;
  const hit = (await listRecords(client ? "client" : "onboarding", f)).find((c) => deskText(c, f, client ? "mondayClientId" : "mondayOnboardingId").trim() === id);
  return hit?.id || null;
}

function seedForm(c: GhlContact): HandoffForm {
  return { handoffId: "", leadId: c.id, expectedUpdatedAt: "", business: businessName(c), contact: contactDisplayName(c), email: c.email || "", phone: c.phone || "", website: c.website || "", city: [c.city, c.state].filter(Boolean).join(", "), businessType: "", salesOwner: "Dave", packages: [], monthlyAgreed: "", setupAgreed: "", scope: "", exclusions: "", goals: "", context: "", startDate: "", agreement: "Unknown", payment: "Unknown", nextAction: "", nextOwner: "", nextDue: "" };
}

/** The intake / file record for a scope, created from the contact the first time a file is added or a link is issued. */
export async function ensureIntakeGhl(scope: string): Promise<IntakeRecord> {
  const existing = await readIntake(scope);
  if (existing) return existing;
  const f = await allDeskFields();
  const contactId = await contactIdForScope(scope, f);
  if (!contactId) throw new CallDeskError("No client on the desk owns that file store.", 404);
  const contact = await readContact(contactId);
  if (!isOnboardingRecord(contact, f) && !isClientRecord(contact, f)) throw new CallDeskError("No client on the desk owns that file store.", 404); // any other contact in GoHighLevel is not the desk's business
  if (fileScopeFor(contact, f) !== scope) throw new CallDeskError("That file store does not belong to this client.", 400);
  const handoff = await findHandoffRecord(contact, f).catch(() => null);
  const seed: IntakeRecord = { ...emptyIntake(scope, handoff?.leadId || contact.id, handoff?.handoff || seedForm(contact)), contactId };
  await writeIntake(seed);
  return seed;
}

/** Issue (or replace) the client's private intake link. The URL is returned once; only its hash is stored. */
export async function issueIntakeLinkGhl(rawId: string, origin: string): Promise<{ url: string; expiresAt: string }> {
  const f = await allDeskFields();
  const id = await resolveRecordId(rawId, "onboarding", f);
  const contact = await readContact(id);
  if (!isOnboardingRecord(contact, f)) throw new CallDeskError("This contact has no onboarding record, so there is no intake to send.", 404);
  const scope = fileScopeFor(contact, f);
  const record = await ensureIntakeGhl(scope);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const old = record.tokenHash;
  const issued = now();
  const expiresAt = new Date(Date.now() + INTAKE_TOKEN_DAYS * 86400000).toISOString();
  await writeTokenIndex(tokenHash, scope);
  record.tokenHash = tokenHash; record.tokenIssuedAt = issued; record.tokenExpiresAt = expiresAt; record.revokedAt = null; record.updatedAt = issued; record.contactId = id;
  await writeIntake(record);
  if (old && old !== tokenHash) await deleteTokenIndex(old);
  try { await writeRecord(id, f, { intake: record.submittedAt ? "Client submitted" : "Link issued", deskLink: deskUrl(origin, { tab: "onboarding", client: id }) }); }
  catch { /* the link works regardless; the status on the contact is advisory and shows on the next refresh */ }
  return { url: `${origin}/onboarding/${token}`, expiresAt };
}

/** The storage scope for a record id — what the intake-link and file routes key on. */
export async function scopeForRecord(rawId: string): Promise<string> {
  const f = await allDeskFields();
  return fileScopeFor(await readContact(await resolveRecordId(rawId, "onboarding", f)), f);
}

/** The client pressed Submit. The record is saved first; the status on the contact is advisory. */
export async function submitIntakeGhl(record: IntakeRecord): Promise<IntakeRecord> {
  record.submittedAt = record.submittedAt || now(); record.updatedAt = now();
  await writeIntake(record);
  try {
    const f = await allDeskFields();
    const contactId = record.contactId || (await contactIdForScope(record.itemId, f));
    if (contactId) await writeRecord(contactId, f, { intake: "Client submitted", lastTouch: todayEastern() });
  } catch { /* advisory */ }
  return record;
}
