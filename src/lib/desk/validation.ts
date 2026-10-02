import { CallDeskError } from "@/lib/calls/validation";
import { validatePatch, type PatchAction } from "@/lib/onboarding/validation";
import { validateClientPatch } from "@/lib/clients/validation";
import type { ClientPatch } from "@/lib/clients/board";
import { CHECK_STATUS } from "@/lib/onboarding/config";
import { isNoteId } from "./notes";
import { isTeamName } from "./team";

// Request validation for the GoHighLevel desk. Every action the Monday desk accepts is accepted here with
// the same body; the three whose ids mean something different on GoHighLevel are checked here, and the
// rest go through the existing validators untouched:
//   owner / manager  — the id is a team NAME ("Madison"), not a Monday person id
//   checklist        — the item id is the hash id from the Desk Checklist field, not a Monday subitem id
//   note             — may carry `noteId` (a browser-minted id that makes a retry safe)
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const bad = (m: string) => new CallDeskError(m, 400);

function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw bad("Invalid update.");
  return input as Record<string, unknown>;
}
function str(raw: Record<string, unknown>, key: string, limit: number): string {
  const v = raw[key];
  if (v === undefined || v === null) return "";
  if (typeof v !== "string" || v.length > limit || CONTROL.test(v)) throw bad(`Invalid or oversized value for ${key}.`);
  return v.trim();
}
function only(raw: Record<string, unknown>, keys: string[]): void {
  if (Object.keys(raw).some((k) => !["action", "expectedUpdatedAt", ...keys].includes(k))) throw bad("Unexpected update field.");
}
function versionOf(raw: Record<string, unknown>, required: boolean): string {
  const expected = str(raw, "expectedUpdatedAt", 40);
  if (required ? !ISO.test(expected) : !!expected && !ISO.test(expected)) throw bad("Reload this client before changing it.");
  return expected;
}
function noteOf(raw: Record<string, unknown>): { text: string; noteId: string } {
  only(raw, ["text", "noteId"]);
  const text = str(raw, "text", 6000);
  if (!text) throw bad("Write a note first.");
  const noteId = raw.noteId === undefined ? "" : raw.noteId;
  if (noteId !== "" && !isNoteId(noteId)) throw bad("Invalid note reference. Reload and try again.");
  return { text, noteId: noteId as string };
}
function ownerOf(raw: Record<string, unknown>): string {
  only(raw, ["ownerId"]);
  const ownerId = str(raw, "ownerId", 40);
  if (ownerId && !isTeamName(ownerId)) throw bad("Choose someone on the team.");
  return ownerId;
}

export type DeskNote = { action: "note"; text: string; noteId: string };
export type DeskOnboardingPatch = (Exclude<PatchAction, { action: "note" }> | DeskNote) & { expectedUpdatedAt: string };
export function validateDeskPatch(input: unknown): DeskOnboardingPatch {
  const raw = object(input);
  const action = str(raw, "action", 20);
  if (action === "note") return { action, ...noteOf(raw), expectedUpdatedAt: versionOf(raw, false) }; // a note is append-only: no version needed
  if (action === "owner") return { action, ownerId: ownerOf(raw), expectedUpdatedAt: versionOf(raw, true) };
  if (action === "checklist") {
    only(raw, ["subitemId", "status"]);
    const subitemId = str(raw, "subitemId", 40); const status = str(raw, "status", 20);
    if (!/^c[0-9a-f]{12}(?:x\d{1,3})?$/.test(subitemId)) throw bad("Invalid checklist item.");
    if (status && !(CHECK_STATUS as readonly string[]).includes(status)) throw bad("Choose a valid checklist status.");
    return { action, subitemId, status: status as (typeof CHECK_STATUS)[number] | "", expectedUpdatedAt: versionOf(raw, true) };
  }
  return validatePatch(input) as DeskOnboardingPatch;
}

export type DeskClientPatch = (Exclude<ClientPatch, { action: "note" }> | DeskNote) & { expectedUpdatedAt: string };
export function validateDeskClientPatch(input: unknown): DeskClientPatch {
  const raw = object(input);
  const action = str(raw, "action", 20);
  if (action === "note") return { action, ...noteOf(raw), expectedUpdatedAt: versionOf(raw, false) };
  if (action === "manager") return { action, ownerId: ownerOf(raw), expectedUpdatedAt: versionOf(raw, true) };
  return validateClientPatch(input) as DeskClientPatch;
}
