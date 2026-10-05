import { CallDeskError } from "@/lib/calls/validation";
import { validatePatch, type PatchAction } from "@/lib/onboarding/validation";
import { validateClientPatch } from "@/lib/clients/validation";
import type { ClientPatch } from "@/lib/clients/board";
import { CHECK_STATUS } from "@/lib/onboarding/config";
import { isGhlNoteId, isNoteId } from "./notes";
import { isTeamName } from "./team";
import { isDueDay, isTaskRequestId, type TaskSource } from "./task-text";

// Request validation for the GoHighLevel desk. Every action the Monday desk accepts is accepted here with
// the same body; the three whose ids mean something different on GoHighLevel are checked here, and the
// rest go through the existing validators untouched:
//   owner / manager  — the id is a team NAME ("Madison"), not a Monday person id
//   checklist        — the item id is the hash id from the Desk Checklist field, not a Monday subitem id
//   note             — may carry `noteId` (a browser-minted id that makes a retry safe)
// One action exists only here (the Monday desk has no such thing):
//   legacy           — `value: true | false` marks or un-marks a legacy client; the route lets only an owner send it
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
/** Delete one note, or change its text (Oct 4 2026). `id` is the GoHighLevel note id from the timeline. Like adding one, neither needs a record version. */
export type DeskNoteDelete = { action: "deleteNote"; id: string };
export type DeskNoteEdit = { action: "editNote"; id: string; text: string };
function noteDeleteOf(raw: Record<string, unknown>): { id: string } {
  only(raw, ["id"]);
  const id = str(raw, "id", 80);
  if (!isGhlNoteId(id)) throw bad("Invalid note. Reload and try again.");
  return { id };
}
function noteEditOf(raw: Record<string, unknown>): { id: string; text: string } {
  only(raw, ["id", "text"]);
  const id = str(raw, "id", 80);
  if (!isGhlNoteId(id)) throw bad("Invalid note. Reload and try again.");
  const text = str(raw, "text", 6000);
  if (!text) throw bad("A note cannot be empty. To remove it, delete it.");
  return { id, text };
}
export type DeskOnboardingPatch = (Exclude<PatchAction, { action: "note" }> | DeskNote | DeskNoteDelete | DeskNoteEdit) & { expectedUpdatedAt: string };
export function validateDeskPatch(input: unknown): DeskOnboardingPatch {
  const raw = object(input);
  const action = str(raw, "action", 20);
  if (action === "note") return { action, ...noteOf(raw), expectedUpdatedAt: versionOf(raw, false) }; // a note is append-only: no version needed
  if (action === "deleteNote") return { action, ...noteDeleteOf(raw), expectedUpdatedAt: versionOf(raw, false) };
  if (action === "editNote") return { action, ...noteEditOf(raw), expectedUpdatedAt: versionOf(raw, false) };
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

export type DeskLegacy = { action: "legacy"; value: boolean };
export type DeskClientPatch = (Exclude<ClientPatch, { action: "note" }> | DeskNote | DeskNoteDelete | DeskNoteEdit | DeskLegacy) & { expectedUpdatedAt: string };
export function validateDeskClientPatch(input: unknown): DeskClientPatch {
  const raw = object(input);
  const action = str(raw, "action", 20);
  if (action === "note") return { action, ...noteOf(raw), expectedUpdatedAt: versionOf(raw, false) };
  if (action === "deleteNote") return { action, ...noteDeleteOf(raw), expectedUpdatedAt: versionOf(raw, false) };
  if (action === "editNote") return { action, ...noteEditOf(raw), expectedUpdatedAt: versionOf(raw, false) };
  if (action === "manager") return { action, ownerId: ownerOf(raw), expectedUpdatedAt: versionOf(raw, true) };
  if (action === "legacy") {
    only(raw, ["value"]);
    if (typeof raw.value !== "boolean") throw bad("Say whether this is a legacy client.");
    return { action, value: raw.value, expectedUpdatedAt: versionOf(raw, true) };
  }
  return validateClientPatch(input) as DeskClientPatch;
}

// Tasks (Oct 4 2026): the client's running task list, on /api/team/tasks/<contact id>. A task is added (title, an optional
// due day, an optional assignee) or ticked off / opened again. Nothing else about a task is changed from the desk.
const TASK_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{5,79}$/; // a GoHighLevel task id; the route also checks it is on that contact
function onlyKeys(raw: Record<string, unknown>, keys: string[]): void {
  if (Object.keys(raw).some((k) => !keys.includes(k))) throw bad("Unexpected task field.");
}
export type TaskAddBody = { title: string; due: string; assignee: string; requestId: string; source: TaskSource };
export function validateTaskAdd(input: unknown): TaskAddBody {
  const raw = object(input);
  onlyKeys(raw, ["title", "due", "assignee", "requestId", "source"]);
  const title = str(raw, "title", 400).replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  if (!title) throw bad("Write the task first.");
  if (title.length > 200) throw bad("Keep a task under 200 characters. Put the detail in a note.");
  const due = str(raw, "due", 10);
  if (due && !isDueDay(due)) throw bad("Choose a real due date, or leave it empty.");
  const assignee = str(raw, "assignee", 40);
  if (assignee && !isTeamName(assignee)) throw bad("Give the task to someone on the team, or leave it unassigned.");
  if (!isTaskRequestId(raw.requestId)) throw bad("Invalid task reference. Reload and try again.");
  const source = str(raw, "source", 20);
  if (source !== "onboarding" && source !== "client") throw bad("Invalid task source.");
  return { title, due, assignee, requestId: raw.requestId, source };
}
export function validateTaskDone(input: unknown): { taskId: string; completed: boolean } {
  const raw = object(input);
  onlyKeys(raw, ["taskId", "completed"]);
  const taskId = str(raw, "taskId", 80);
  if (!TASK_ID.test(taskId)) throw bad("Invalid task.");
  if (typeof raw.completed !== "boolean") throw bad("Say whether the task is done.");
  return { taskId, completed: raw.completed };
}
