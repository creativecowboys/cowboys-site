import { CallDeskError } from "@/lib/calls/validation";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { addNote, deleteNote, listNotes, updateNote, type GhlNote } from "@/lib/ghl/client";
import { memberByGhlUser, type Actor } from "./team";

// Notes and comments on a client (Dave, Oct 1 2026: "we need the ability to add notes and comments in the
// active state"). On GoHighLevel a desk note is a plain contact note, so it shows in GoHighLevel too, and the
// desk's timeline is simply the contact's notes, newest first — the WHOLE history of the business on one
// record: sales calls, the handoff, onboarding notes, client notes, billing, and anything typed in GoHighLevel.
//
// A note written from the desk ends with three markers (stripped before anyone sees them):
//   [CC-NOTE:<id>]   idempotency — a retry with the same id finds the note instead of posting it twice
//   [CC-SRC:<tab>]   where it was written: onboarding | client | sales | system
//   [CC-BY:<name>]   who wrote it — also set as the GoHighLevel author when that person has a GoHighLevel user
// A note changed from the desk (Oct 4 2026) keeps every marker it had and gains two:
//   [CC-KIND:<label>]               what it was before the edit (Billing, Sales call, Handoff…), so an edit never changes
//                                   how it is labelled — or who may see it (billing notes are owners-only on the Clients tab)
//   [CC-EDITED:<when>|<name>]       when it was last changed, and by whom (the panel shows "edited")
export type NoteSource = "onboarding" | "client" | "sales" | "system";
export type TimelineItem = { id: string; text: string; createdAt: string; author: string; source: string; edited?: string; editedBy?: string };

const MARKER = /\[CC-[A-Z-]+:[^\]\n]*\]/g;
const SOURCE_LABEL: Record<NoteSource, string> = { onboarding: "Onboarding", client: "Client", sales: "Sales", system: "Desk" };
export const noteMarker = (noteId: string) => `[CC-NOTE:${noteId}]`;
const NOTE_ID = /^[A-Za-z0-9][A-Za-z0-9-]{7,79}$/;
export const isNoteId = (v: unknown): v is string => typeof v === "string" && NOTE_ID.test(v);
/** Everything machine-readable removed — what a person reads. */
export const readableNote = (body: string): string => body.replace(MARKER, "").replace(/[ \t]+\n/g, "\n").trim();

const KINDS = ["Onboarding", "Client", "Sales", "Desk", "Sales call", "Handoff", "Billing", "Imported", "GoHighLevel"] as const;
/** When and by whom a note was last changed from the desk ([CC-EDITED]), if it was. */
export function noteEdited(body: string): { edited: string; editedBy: string } | null {
  const m = /\[CC-EDITED:([^\]|\n]{1,40})\|([^\]\n]{1,40})\]/.exec(body);
  return m ? { edited: m[1].trim(), editedBy: m[2].trim() } : null;
}
/** Which part of the business's life a note belongs to, and who wrote it, from the note alone. */
export function classifyNote(note: Pick<GhlNote, "body" | "userId">): { source: string; author: string } {
  const body = note.body || "";
  const kind = /\[CC-KIND:([^\]\n]{1,20})\]/.exec(body)?.[1]?.trim();
  if (kind && (KINDS as readonly string[]).includes(kind)) return { source: kind, author: classifyByContent(body, note.userId).author };
  return classifyByContent(body, note.userId);
}
function classifyByContent(body: string, userId: string | undefined): { source: string; author: string } {
  const by = /\[CC-BY:([^\]\n]{1,40})\]/.exec(body)?.[1]?.trim();
  const src = /\[CC-SRC:([a-z]+)\]/.exec(body)?.[1] as NoteSource | undefined;
  // Notes copied over by the imports start with who wrote them: "From Monday (Josh Pack, …)" (Phase 1) or "From the old board (…)" (Phase 2).
  const imported = /^From (?:Monday|the old board) \(([^,)]+)/.exec(body.trim())?.[1]?.trim();
  const author = by || memberByGhlUser(userId)?.name || imported || "Team";
  if (body.includes("[CC-MONDAY-UPDATE:")) return { source: "Imported", author };
  if (body.includes("[CC-NOTE:")) return { source: (src && SOURCE_LABEL[src]) || "Desk", author };
  if (body.includes("[CC-CALL:")) return { source: "Sales call", author: /^Rep: (\w+)/m.exec(body)?.[1] || author };
  if (body.includes("[CC-HANDOFF:")) return { source: "Handoff", author };
  if (/^Package builder \(call desk\)/.test(body.trim())) return { source: "Billing", author };
  return { source: "GoHighLevel", author };
}

/** The contact's notes as the desk timeline: newest first, markers stripped, each with its author, date and source label. */
export function toTimeline(notes: GhlNote[]): TimelineItem[] {
  return notes
    .map((n) => ({ id: n.id, text: readableNote(n.body || ""), createdAt: n.dateAdded || "", ...classifyNote(n), ...(noteEdited(n.body || "") || {}) }))
    .filter((n) => n.text)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const timelineFor = async (contactId: string): Promise<TimelineItem[]> => toTimeline(await listNotes(contactId));

/** The exact note body the desk saves. User text can never smuggle a marker in. */
export function formatDeskNote(text: string, noteId: string, source: NoteSource, authorName: string): string {
  const clean = text.replace(/\r/g, "").replace(MARKER, "").trim();
  if (!clean) throw new CallDeskError("Write a note first.", 400);
  return `${clean}\n\n${noteMarker(noteId)} [CC-SRC:${source}] [CC-BY:${authorName.replace(/[\]\n\r]/g, "").slice(0, 40) || "Team"}]`;
}

// A process-local guard against a double click on the same warm instance. The marker is what makes a retry safe.
const posting = new Set<string>();
/**
 * Add a note to the contact, once. `noteId` comes from the browser (one per composed note, reused on retry):
 * if a note with that id is already on the contact it is returned instead of posting a second copy.
 */
export async function addDeskNote(contactId: string, input: { text: string; noteId: string; source: NoteSource; actor: Actor }): Promise<{ id: string; existed: boolean }> {
  if (!isNoteId(input.noteId)) throw new CallDeskError("Invalid note reference. Reload and try again.", 400);
  const body = formatDeskNote(input.text, input.noteId, input.source, input.actor.name);
  const key = `${contactId}:${input.noteId}`;
  if (posting.has(key)) throw new CallDeskError("That note is already saving. Give it a moment.", 409);
  posting.add(key);
  try {
    const prior = (await listNotes(contactId)).find((n) => (n.body || "").includes(noteMarker(input.noteId)));
    if (prior) return { id: prior.id, existed: true };
    // Authored as the signed-in team member when they have a GoHighLevel user; otherwise by the integration, still carrying their name.
    const note = await addNote(contactId, body, input.actor.ghlUserId || undefined);
    return { id: note.id, existed: false };
  } finally { posting.delete(key); }
}

// Deleting a note (Dave, Oct 4 2026: team members need to be able to delete notes in the client panel). The panel asks
// "Delete this note?" first; here the note is deleted in GoHighLevel itself (DELETE /contacts/{id}/notes/{noteId}), so it is
// gone from the contact there too, not just hidden. Same rule as adding one: anyone on the team once the desk is on
// GoHighLevel. Only a note that is on THIS contact can be deleted through it. Permanent: GoHighLevel keeps no copy.
const GHL_NOTE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{5,79}$/;
export const isGhlNoteId = (v: unknown): v is string => typeof v === "string" && GHL_NOTE_ID.test(v);
export async function deleteDeskNote(contactId: string, noteId: string, opts: { mayTouchBilling?: boolean } = {}): Promise<void> {
  if (!isGhlNoteId(noteId)) throw new CallDeskError("Invalid note. Reload and try again.", 400);
  const note = (await listNotes(contactId)).find((n) => n.id === noteId);
  if (!note) throw new CallDeskError("That note is not on this client any more (it may already have been deleted). Reload to see the latest.", 404);
  if (opts.mayTouchBilling === false && classifyNote(note).source === "Billing") throw new CallDeskError("Only an owner can delete a billing note.", 403);
  await deleteNote(contactId, noteId);
  // Read back: the answer to a delete says little, and a note that is still there must not look deleted on the desk.
  if ((await listNotes(contactId)).some((n) => n.id === noteId)) throw new CallDeskError("GoHighLevel did not delete that note. Reload and try again.", 502);
}

// Changing a note's text (Dave, Oct 4 2026: "make notes editable"). PUT /contacts/{id}/notes/{noteId} with the new body
// only, so GoHighLevel keeps the note's author and date. Every machine marker the note carried is kept (they make retries
// safe and say what the note is); the desk adds [CC-KIND] (what it was) and [CC-EDITED] (when, by whom). Same rule as
// adding one: anyone on the team once the desk is on GoHighLevel. Only a note on THIS contact can be changed through it.
const notePosting = new Set<string>();
export async function editDeskNote(contactId: string, noteId: string, text: string, actor: Actor, opts: { mayTouchBilling?: boolean } = {}): Promise<void> {
  if (!isGhlNoteId(noteId)) throw new CallDeskError("Invalid note. Reload and try again.", 400);
  const clean = text.replace(/\r/g, "").replace(MARKER, "").trim();
  if (!clean) throw new CallDeskError("A note cannot be empty. To remove it, delete it.", 400);
  if (clean.length > 6000) throw new CallDeskError("Keep a note under 6,000 characters.", 400);
  const key = `${contactId}:${noteId}`;
  if (notePosting.has(key)) throw new CallDeskError("That note is already being saved. Give it a moment.", 409);
  notePosting.add(key);
  try {
    const note = (await listNotes(contactId)).find((n) => n.id === noteId);
    if (!note) throw new CallDeskError("That note is not on this client any more (it may have been deleted). Reload to see the latest.", 404);
    const was = classifyNote(note);
    if (was.source === "Billing" && opts.mayTouchBilling === false) throw new CallDeskError("Only an owner can change a billing note.", 403);
    const body = note.body || "";
    const kept = (body.match(MARKER) || []).filter((m) => !/^\[CC-(?:KIND|EDITED):/.test(m));
    const name = (s: string) => s.replace(/[[\]|\n\r]/g, "").trim().slice(0, 40) || "Team";
    const extra = [`[CC-KIND:${was.source}]`, ...(kept.some((m) => m.startsWith("[CC-BY:")) ? [] : [`[CC-BY:${name(was.author)}]`]), `[CC-EDITED:${new Date().toISOString()}|${name(actor.name)}]`];
    const next = `${clean}\n\n${[...kept, ...extra].join(" ")}`;
    const expected = readableNote(next);
    if (readableNote(body) === expected) return; // nothing changed: nothing is written, and it is not marked edited
    await updateNote(contactId, noteId, next);
    // Read back: the note must hold the new text now (an answer alone says little).
    const saved = (await listNotes(contactId)).find((n) => n.id === noteId);
    if (!saved || readableNote(saved.body || "") !== expected) throw new CallDeskError("GoHighLevel did not keep the change to that note. Reload and try again.", 502);
  } finally { notePosting.delete(key); }
}

// ───────────────────────────── self-test for note edit + delete (test contact only, owner-only route) ─────────────────────────────
export type NoteSelfTestReport = { dryRun: boolean; contact: string; plan?: string[]; steps?: string[]; passed?: number; failed?: string[]; cleanup?: string; error?: string };
const plainText = (e: unknown): string => (e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 300);
/**
 * Proves note edit and note delete against the real GoHighLevel API on the designated TEST CONTACT only, never a client: adds
 * one labelled note, changes its text the way the panel does (it must read back changed, still by the same author and with the
 * same date, marked edited), deletes it the way the panel does (it must be gone, and every other note still there), and checks
 * that deleting it a second time is refused. A note it added and could not delete is removed again at the end.
 */
export async function deskNoteSelfTest(dryRun: boolean, actor: Actor): Promise<NoteSelfTestReport> {
  const report: NoteSelfTestReport = { dryRun, contact: TEST_CONTACT_ID };
  if (dryRun) return { ...report, plan: [
    "add one labelled note to the test contact",
    "change its text the way the panel does: it must read back changed, with the same author and date, and marked edited",
    "delete it the way the panel does (only a note that is on that contact)",
    "read the notes back: it must be gone in GoHighLevel, and every other note must still be there",
    "delete it again: must be refused, because it is no longer on the contact",
  ] };
  const steps: string[] = []; const failed: string[] = [];
  const check = (name: string, ok: boolean, detail = "") => { steps.push(`${ok ? "ok" : "FAILED"}: ${name}${detail ? ` (${detail.replace(/[=?&]/g, " ")})` : ""}`); if (!ok) failed.push(name); };
  let left = "";
  try {
    const before = await listNotes(TEST_CONTACT_ID);
    const saved = await addDeskNote(TEST_CONTACT_ID, { text: "Back Office note self-test: added, edited and deleted again by the self-test. Safe to ignore.", noteId: `selftest-note-${Date.now().toString(36)}`, source: "system", actor });
    left = saved.existed ? "" : saved.id;
    const original = (await listNotes(TEST_CONTACT_ID)).find((n) => n.id === saved.id);
    check("add a labelled note", !saved.existed && !!original);
    const edited = "Back Office note self-test, EDITED: this text was changed by the self-test. Safe to ignore.";
    await editDeskNote(TEST_CONTACT_ID, saved.id, edited, actor);
    const changed = (await listNotes(TEST_CONTACT_ID)).find((n) => n.id === saved.id);
    const line = changed ? toTimeline([changed])[0] : undefined;
    check("edit it: GoHighLevel holds the new text", !!line && line.text === edited, line ? `${line.text.length} characters` : "not found");
    check("edit it: same author and date", !!changed && !!original && (changed.userId || "") === (original.userId || "") && (changed.dateAdded || "") === (original.dateAdded || ""), changed && original ? `author ${changed.userId ? (changed.userId === original.userId ? "kept" : "CHANGED") : "none before or after"}, date ${changed.dateAdded === original.dateAdded ? "kept" : "CHANGED"}` : "");
    check("edit it: shown as edited, by whom, with its label kept", !!line && !!line.edited && line.editedBy === actor.name && line.source === "Desk", line ? `label ${line.source}, edited by ${line.editedBy || "nobody"}` : "");
    await deleteDeskNote(TEST_CONTACT_ID, saved.id);
    left = "";
    const after = await listNotes(TEST_CONTACT_ID);
    check("delete it: gone in GoHighLevel", !after.some((n) => n.id === saved.id));
    check("every other note is still there", before.every((n) => after.some((a) => a.id === n.id)), `${before.length} before, ${after.length} after`);
    try { await deleteDeskNote(TEST_CONTACT_ID, saved.id); check("deleting it again is refused", false, "it was not refused"); }
    catch (e) { check("deleting it again is refused", e instanceof CallDeskError && e.status === 404, plainText(e)); }
  } catch (e) { report.error = plainText(e); }
  finally {
    if (left) { try { await deleteNote(TEST_CONTACT_ID, left); report.cleanup = "the self-test note was removed at the end"; } catch (e) { report.cleanup = `the self-test note ${left} is still on the test contact: ${plainText(e)}`; } }
    else report.cleanup = "nothing left behind";
  }
  report.steps = steps; report.passed = steps.length - failed.length; report.failed = failed;
  return report;
}
