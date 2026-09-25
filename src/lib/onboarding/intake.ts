import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { head } from "@vercel/blob";
import { CallDeskError } from "@/lib/calls/validation";
import { COL, INTAKE_TOKEN_DAYS } from "./config";
import { emptyIntake } from "./handoff";
import { readPipelineItem, setPipelineColumns, mapRow } from "./pipeline";
import { deletePath, deleteTokenIndex, FILE_PREFIX, readHandoff, readIntake, readTokenIndex, writeIntake, writeTokenIndex } from "./store";
import type { HandoffForm, IntakeFile, IntakeForm, IntakeRecord, OnboardingRow } from "./types";
import { safeFilename, uploadPath } from "./validation";

// Client intake links are opaque, revocable and expiring. The token itself is never stored:
// only its SHA-256 lives in the store, and the Monday board only ever sees a staff URL.
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const now = () => new Date().toISOString();

export function linkActive(record: IntakeRecord): boolean {
  return !!record.tokenHash && !record.revokedAt && !!record.tokenExpiresAt && Date.parse(record.tokenExpiresAt) > Date.now();
}

/** Minimal handoff shape for a client that never went through the Sales tab. */
function seedForm(row: OnboardingRow): HandoffForm {
  return { handoffId: "", leadId: row.leadId || "", expectedUpdatedAt: row.updatedAt, business: row.name, contact: row.contact, email: row.email, phone: row.phone, website: row.siteUrl, city: row.city, businessType: row.businessType, salesOwner: "Dave", packages: [], monthlyAgreed: "", setupAgreed: "", scope: "", exclusions: "", goals: "", context: "", startDate: "", agreement: "Unknown", payment: "Unknown", nextAction: "", nextOwner: "", nextDue: "" };
}

export async function ensureIntake(itemId: string): Promise<IntakeRecord> {
  const existing = await readIntake(itemId);
  if (existing) return existing;
  const row = mapRow(await readPipelineItem(itemId));
  const record = await readHandoff(row.leadId || (row.handoffId ? `manual-${row.handoffId}` : "none"));
  if (record?.itemId === itemId) { const fresh = emptyIntake(itemId, row.leadId, record.handoff); await writeIntake(fresh); return fresh; }
  // Client created in Monday by hand (e.g. Choice Pressure Washing): seed from the board row.
  const seed = emptyIntake(itemId, row.leadId || "", seedForm(row));
  await writeIntake(seed);
  return seed;
}

export async function issueIntakeLink(itemId: string, origin: string): Promise<{ url: string; expiresAt: string }> {
  const record = await ensureIntake(itemId);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const old = record.tokenHash;
  const issued = now();
  const expiresAt = new Date(Date.now() + INTAKE_TOKEN_DAYS * 86400000).toISOString();
  await writeTokenIndex(tokenHash, itemId);
  record.tokenHash = tokenHash; record.tokenIssuedAt = issued; record.tokenExpiresAt = expiresAt; record.revokedAt = null; record.updatedAt = issued;
  await writeIntake(record);
  if (old && old !== tokenHash) await deleteTokenIndex(old);
  try {
    const staffUrl = `${origin}/leads?tab=onboarding&client=${itemId}`;
    await setPipelineColumns(itemId, { [COL.intake]: { label: record.submittedAt ? "Client submitted" : "Link issued" }, [COL.onboardingLink]: { url: staffUrl, text: "Open in call desk" } });
  } catch { /* the link works regardless; Monday status is advisory and shows on the next refresh */ }
  return { url: `${origin}/onboarding/${token}`, expiresAt };
}

export async function revokeIntakeLink(itemId: string): Promise<void> {
  const record = await readIntake(itemId);
  if (!record) return;
  if (record.tokenHash) await deleteTokenIndex(record.tokenHash);
  record.revokedAt = now(); record.updatedAt = now();
  await writeIntake(record);
}

/** Resolve a client token to its record. Every client request goes through here; no caching. */
export async function resolveToken(token: string): Promise<IntakeRecord> {
  const tokenHash = hashToken(token);
  const index = await readTokenIndex(tokenHash);
  const invalid = () => new CallDeskError("This link is no longer active. Ask your Creative Cowboys contact for a new one.", 404);
  if (!index?.itemId || !/^[1-9]\d{0,19}$/.test(index.itemId)) throw invalid();
  const record = await readIntake(index.itemId);
  if (!record?.tokenHash) throw invalid();
  const a = Buffer.from(record.tokenHash); const b = Buffer.from(tokenHash);
  if (a.length !== b.length || !timingSafeEqual(a, b) || !linkActive(record)) throw invalid();
  return record;
}

export function clientView(record: IntakeRecord) {
  // The client only ever sees their own form and file list — never staff notes, prices or Monday ids.
  return { business: record.business, folder: record.itemId, form: record.form, files: record.files.map((f) => ({ key: f.key, name: f.name, size: f.size, category: f.category, uploadedAt: f.uploadedAt })), submittedAt: record.submittedAt, lastSavedAt: record.lastSavedAt, expiresAt: record.tokenExpiresAt };
}

export async function saveIntakeForm(record: IntakeRecord, form: IntakeForm): Promise<IntakeRecord> {
  record.form = form; record.lastSavedAt = now(); record.updatedAt = now();
  await writeIntake(record);
  return record;
}

export async function submitIntake(record: IntakeRecord): Promise<IntakeRecord> {
  record.submittedAt = record.submittedAt || now(); record.updatedAt = now();
  await writeIntake(record);
  try { await setPipelineColumns(record.itemId, { [COL.intake]: { label: "Client submitted" }, [COL.lastTouch]: { date: now().slice(0, 10) } }); } catch { /* advisory */ }
  return record;
}

export const filePathFor = (itemId: string, category: string, name: string): string => uploadPath(itemId, category, name);

/** Record an uploaded blob in the client's file index. Idempotent by pathname; verifies the blob exists under the client's prefix. */
export async function indexFile(itemId: string, pathname: string, category: IntakeFile["category"], declaredName: string): Promise<IntakeRecord> {
  if (!pathname.startsWith(`${FILE_PREFIX(itemId)}${category}/`) || pathname.includes("..")) throw new CallDeskError("That file does not belong to this client.", 400);
  let meta: { size: number; contentType: string; uploadedAt: Date };
  try { meta = await head(pathname); } catch { throw new CallDeskError("The upload did not finish. Please try that file again.", 400); }
  const record = await readIntake(itemId);
  if (!record) throw new CallDeskError("Client record is missing.", 404);
  if (!record.files.some((f) => f.key === pathname)) {
    record.files.push({ key: pathname, name: safeFilename(declaredName || pathname.split("/").pop() || "file"), size: meta.size, type: meta.contentType, category, uploadedAt: meta.uploadedAt.toISOString() });
    record.updatedAt = now(); await writeIntake(record);
  }
  return record;
}

export async function removeFile(record: IntakeRecord, key: string): Promise<IntakeRecord> {
  const file = record.files.find((f) => f.key === key);
  if (!file) throw new CallDeskError("File not found.", 404);
  await deletePath(key);
  record.files = record.files.filter((f) => f.key !== key); record.updatedAt = now();
  await writeIntake(record);
  return record;
}
