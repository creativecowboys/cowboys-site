"use client";

import { useRef, useState } from "react";

// Notes and comments on a client (Dave, Oct 1 2026: "we need the ability to add notes and comments in the
// active state"). Shared by the Onboarding and Clients panels. On the GoHighLevel desk the list is the
// contact's whole history — sales calls, the handoff, onboarding notes, client notes, billing, anything typed
// in GoHighLevel — newest first, each with who wrote it, when, and a small label for where it came from.
// On the Monday desk it is the item's updates, exactly as before (no labels).
// On GoHighLevel each note can also be changed or deleted (Dave, Oct 4 2026), in GoHighLevel itself (src/lib/desk/notes.ts):
//   Edit   turns the text into a box with Save and Cancel; the note keeps its author and date and shows "edited".
//   Delete deletes it at once, with no question (Dave: "one click"). It is small and set apart at the far right of the
//          note's header line, away from Edit and from the Add note button, so it is hard to hit by accident.
export type TimelineEntry = { id: string; text: string; createdAt: string; author: string; source?: string; edited?: string; editedBy?: string };
export type DeskSystem = "monday" | "ghl";

const when = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); };
const sourceClass = (source: string) => `ob-note-source ob-note-source-${source.toLowerCase().replace(/[^a-z]+/g, "-")}`;

export function NotesTimeline({ history, busy, system, onAdd, onDelete, onEdit }: {
  history: TimelineEntry[]; busy: boolean; system: DeskSystem;
  /** Save a note. `noteId` stays the same for the same text, so a retry after a dropped connection cannot post it twice. Resolves true when it saved. */
  onAdd: (text: string, noteId: string) => Promise<boolean>;
  /** Delete a note (GoHighLevel desk only). Resolves true when it is gone. */
  onDelete?: (id: string) => Promise<boolean>;
  /** Change a note's text (GoHighLevel desk only). Resolves true when it saved. */
  onEdit?: (id: string, text: string) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(""); // the note being deleted or saved
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const locked = busy || saving || !!working;
  const remove = async (id: string) => {
    if (!onDelete || locked) return;
    setWorking(id);
    try { await onDelete(id); } finally { setWorking(""); }
  };
  const save = async () => {
    if (!onEdit || !editing || locked) return;
    const text = editing.text.trim();
    if (!text) return;
    setWorking(editing.id);
    try { if (await onEdit(editing.id, text)) setEditing(null); } finally { setWorking(""); }
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
  const actions = system === "ghl" && (!!onDelete || !!onEdit);
  return <section className="ob-section"><h3>Notes{system === "ghl" && <small>{history.length ? `${history.length} on this contact · newest first` : "none yet"}</small>}</h3>
    <div className="ob-next"><textarea rows={2} value={note} disabled={busy || saving} placeholder={system === "ghl" ? "Add a note or comment — saved on the contact in GoHighLevel under your name" : "Append a note to the Monday record"} onChange={(e) => setNote(e.target.value)} maxLength={6000} /><button type="button" className="call-secondary" disabled={busy || saving || !note.trim()} onClick={add}>{saving ? "Saving…" : "Add note"}</button></div>
    {system === "ghl" && <p className="call-muted ob-hint">One history for the whole relationship: sales calls, the handoff, onboarding and client notes, and anything added in GoHighLevel. Edit and Delete change the note in GoHighLevel too; Delete is immediate.</p>}
    {history.map((h) => {
      const isEditing = editing?.id === h.id;
      return <article key={h.id} className="ob-history">
        <div className="ob-history-head">
          <small>{h.author} · {when(h.createdAt)}{h.edited && <span className="ob-note-edited" title={`Edited ${when(h.edited)}${h.editedBy ? ` by ${h.editedBy}` : ""}`}> · edited</span>}{h.source && <i className={sourceClass(h.source)}>{h.source}</i>}</small>
          {actions && !isEditing && <span className="ob-note-actions">
            {onEdit && <button type="button" className="ob-note-action" disabled={locked} onClick={() => setEditing({ id: h.id, text: h.text })} aria-label={`Edit the note from ${h.author}, ${when(h.createdAt)}`}>Edit</button>}
            {onDelete && <button type="button" className="ob-note-action ob-note-delete" disabled={locked} onClick={() => remove(h.id)} aria-label={`Delete the note from ${h.author}, ${when(h.createdAt)}`}>{working === h.id ? "Deleting…" : "Delete"}</button>}
          </span>}
        </div>
        {isEditing
          ? <div className="ob-note-edit">
              <textarea rows={Math.min(12, Math.max(3, editing.text.split("\n").length + 1))} value={editing.text} maxLength={6000} disabled={!!working} onChange={(e) => setEditing({ id: h.id, text: e.target.value })} aria-label="Note text" autoFocus />
              <div className="ob-buttons"><button type="button" className="call-secondary" disabled={locked || !editing.text.trim()} onClick={save}>{working === h.id ? "Saving…" : "Save"}</button><button type="button" className="ob-note-action" disabled={!!working} onClick={() => setEditing(null)}>Cancel</button></div>
            </div>
          : <p className="call-preserve">{h.text}</p>}
      </article>;
    })}
  </section>;
}
