import { CallDeskError } from "@/lib/calls/validation";
import { addNote, listNotes, type GhlNote } from "@/lib/ghl/client";
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
export type NoteSource = "onboarding" | "client" | "sales" | "system";
export type TimelineItem = { id: string; text: string; createdAt: string; author: string; source: string };

const MARKER = /\[CC-[A-Z-]+:[^\]\n]*\]/g;
const SOURCE_LABEL: Record<NoteSource, string> = { onboarding: "Onboarding", client: "Client", sales: "Sales", system: "Desk" };
export const noteMarker = (noteId: string) => `[CC-NOTE:${noteId}]`;
const NOTE_ID = /^[A-Za-z0-9][A-Za-z0-9-]{7,79}$/;
export const isNoteId = (v: unknown): v is string => typeof v === "string" && NOTE_ID.test(v);
/** Everything machine-readable removed — what a person reads. */
export const readableNote = (body: string): string => body.replace(MARKER, "").replace(/[ \t]+\n/g, "\n").trim();

/** Which part of the business's life a note belongs to, and who wrote it, from the note alone. */
export function classifyNote(note: Pick<GhlNote, "body" | "userId">): { source: string; author: string } {
  const body = note.body || "";
  const by = /\[CC-BY:([^\]\n]{1,40})\]/.exec(body)?.[1]?.trim();
  const src = /\[CC-SRC:([a-z]+)\]/.exec(body)?.[1] as NoteSource | undefined;
  // Notes copied over by the imports start with who wrote them: "From Monday (Josh Pack, …)" (Phase 1) or "From the old board (…)" (Phase 2).
  const imported = /^From (?:Monday|the old board) \(([^,)]+)/.exec(body.trim())?.[1]?.trim();
  const author = by || memberByGhlUser(note.userId)?.name || imported || "Team";
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
    .map((n) => ({ id: n.id, text: readableNote(n.body || ""), createdAt: n.dateAdded || "", ...classifyNote(n) }))
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
