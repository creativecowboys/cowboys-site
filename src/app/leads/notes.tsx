"use client";

import { useRef, useState } from "react";

// Notes and comments on a client (Dave, Oct 1 2026: "we need the ability to add notes and comments in the
// active state"). Shared by the Onboarding and Clients panels. On the GoHighLevel desk the list is the
// contact's whole history — sales calls, the handoff, onboarding notes, client notes, billing, anything typed
// in GoHighLevel — newest first, each with who wrote it, when, and a small label for where it came from.
// On the Monday desk it is the item's updates, exactly as before (no labels).
// On GoHighLevel each note also has a small Delete (Dave, Oct 4 2026): it asks "Delete this note?" first, then deletes the
// note in GoHighLevel itself (src/lib/desk/notes.ts deleteDeskNote), so it is gone there too.
export type TimelineEntry = { id: string; text: string; createdAt: string; author: string; source?: string };
export type DeskSystem = "monday" | "ghl";

const when = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); };
const sourceClass = (source: string) => `ob-note-source ob-note-source-${source.toLowerCase().replace(/[^a-z]+/g, "-")}`;

export function NotesTimeline({ history, busy, system, onAdd, onDelete }: {
  history: TimelineEntry[]; busy: boolean; system: DeskSystem;
  /** Save a note. `noteId` stays the same for the same text, so a retry after a dropped connection cannot post it twice. Resolves true when it saved. */
  onAdd: (text: string, noteId: string) => Promise<boolean>;
  /** Delete a note (GoHighLevel desk only), after the person confirms. Resolves true when it is gone. */
  onDelete?: (id: string) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const remove = async (id: string) => {
    if (!onDelete || deleting || busy || saving) return;
    if (!window.confirm("Delete this note?\n\nIt is deleted in GoHighLevel too, and cannot be brought back.")) return;
    setDeleting(id);
    try { await onDelete(id); } finally { setDeleting(""); }
  };
  const pending = useRef({ text: "", id: "" });
  const add = async () => {
    const text = note.trim();
    if (!text || saving || busy) return;
    if (pending.current.text !== text) pending.current = { text, id: crypto.randomUUID() };
    setSaving(true);
    try { if (await onAdd(text, pending.current.id)) { setNote(""); pending.current = { text: "", id: "" }; } }
    finally { setSaving(false); }
  };
  return <section className="ob-section"><h3>Notes{system === "ghl" && <small>{history.length ? `${history.length} on this contact · newest first` : "none yet"}</small>}</h3>
    <div className="ob-next"><textarea rows={2} value={note} disabled={busy || saving} placeholder={system === "ghl" ? "Add a note or comment — saved on the contact in GoHighLevel under your name" : "Append a note to the Monday record"} onChange={(e) => setNote(e.target.value)} maxLength={6000} /><button type="button" className="call-secondary" disabled={busy || saving || !note.trim()} onClick={add}>{saving ? "Saving…" : "Add note"}</button></div>
    {system === "ghl" && <p className="call-muted ob-hint">One history for the whole relationship: sales calls, the handoff, onboarding and client notes, and anything added in GoHighLevel.</p>}
    {history.map((h) => <article key={h.id} className="ob-history"><div className="ob-history-head"><small>{h.author} · {when(h.createdAt)}{h.source && <i className={sourceClass(h.source)}>{h.source}</i>}</small>{system === "ghl" && onDelete && <button type="button" className="ob-file-remove ob-note-delete" disabled={busy || saving || !!deleting} onClick={() => remove(h.id)} aria-label={`Delete the note from ${h.author}, ${when(h.createdAt)}`}>{deleting === h.id ? "Deleting…" : "Delete"}</button>}</div><p className="call-preserve">{h.text}</p></article>)}
  </section>;
}
