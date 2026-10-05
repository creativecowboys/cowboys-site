"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { easternDay, missingStarterTitles, splitTasks, taskCount, taskMeta, taskState, type DeskTask, type DeskTasks, type TaskSource } from "@/lib/desk/task-text";

// The client's running task list (Dave, Oct 4 2026: "we need a running task list for each client, while onboarding.
// something we can add to.. like now, i have to ask Chad to setup stripe.. but not all clients need that.").
// Shared by the Onboarding and Clients panels on the GoHighLevel desk, laid out like the Notes section. Every task is a
// GoHighLevel task on the contact, so it shows there too; the server side is /api/team/tasks/<contact id>
// (src/lib/desk/tasks.ts). Add one (title, optional due date, optional assignee), tick it off or open it again, delete one
// (one click, like a note), and on the Onboarding panel add the starter tasks that are not on the list yet. Titles, dates
// and assignees are changed in GoHighLevel.
type TaskWrite = { tasks: DeskTasks; before: string; after: string; added?: string[] };

async function answer<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : "GoHighLevel could not complete that. Try again."));
  return data as T;
}

export function TaskList({ contactId, tasks, source, onTasks, onVersion }: {
  contactId: string;
  /** The task list that came with the panel's record (with `error` when GoHighLevel could not be read). */
  tasks: DeskTasks | null | undefined;
  source: TaskSource;
  onTasks: (tasks: DeskTasks) => void;
  /** After a change: the record's version right before it and right after it (the panel keeps its version current only if it was current before). */
  onVersion: (before: string, after: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState("");
  // One task request at a time (an add, a tick, or a reload): each answer replaces the whole list, so two in flight could
  // end with the older list on screen, and a task that is in GoHighLevel would seem to be missing.
  const [working, setWorking] = useState<"" | "add" | "load" | "starter" | `tick:${string}` | `delete:${string}`>("");
  const adding = working === "add";
  const [error, setError] = useState("");
  const [done, setDone] = useState(""); // a short line after "Add starter tasks"
  // One reference per task being added, kept for a retry of the same text, so a dropped answer can never add it twice.
  const pending = useRef({ key: "", id: "" });
  const today = easternDay();
  const items = tasks?.items || [];
  const { open, done: closed } = splitTasks(items);
  const url = `/api/team/tasks/${encodeURIComponent(contactId)}`;

  const write = async (method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) => {
    const r = await answer<TaskWrite>(await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
    onTasks(r.tasks);
    if (r.before && r.after) onVersion(r.before, r.after);
    return r;
  };
  // One click, no question (the same as a note's Delete). Small and at the far right of the row, away from the checkbox.
  const remove = async (task: DeskTask) => {
    if (working) return;
    setWorking(`delete:${task.id}`); setError(""); setDone("");
    try { await write("DELETE", { taskId: task.id }); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete the task."); }
    finally { setWorking(""); }
  };
  const missingStarter = source === "onboarding" ? missingStarterTitles(items) : [];
  const addStarter = async () => {
    if (working) return;
    setWorking("starter"); setError(""); setDone("");
    try { const r = await write("POST", { starter: true, source }); setDone(r.added?.length ? `Added ${r.added.length} starter task${r.added.length === 1 ? "" : "s"}.` : "Every starter task is already on the list."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not add the starter tasks."); }
    finally { setWorking(""); }
  };
  const add = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = title.replace(/\s+/g, " ").trim();
    if (!text || working) return;
    const key = JSON.stringify([text, due, assignee]);
    if (pending.current.key !== key) pending.current = { key, id: crypto.randomUUID() };
    setWorking("add"); setError("");
    try {
      await write("POST", { title: text, due, assignee, requestId: pending.current.id, source });
      setTitle(""); setDue(""); setAssignee(""); pending.current = { key: "", id: "" };
    } catch (err) { setError(err instanceof Error ? err.message : "Could not add the task."); }
    finally { setWorking(""); }
  };
  // Enter in the task box adds it (the form would too; this also covers browsers and tools that skip implicit submission).
  const enter = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); void add(); } };
  const toggle = async (task: DeskTask, completed: boolean) => {
    if (working) return;
    setWorking(`tick:${task.id}`); setError("");
    try { await write("PATCH", { taskId: task.id, completed }); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not change the task."); }
    finally { setWorking(""); }
  };
  const reload = async () => {
    if (working) return;
    setWorking("load"); setError("");
    try { onTasks((await answer<{ tasks: DeskTasks }>(await fetch(url, { cache: "no-store" }))).tasks); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load the tasks."); }
    finally { setWorking(""); }
  };

  const row = (t: DeskTask) => {
    const state = taskState(t, today);
    return <li key={t.id} className={`ob-task is-${state}`}>
      <div className="ob-task-main">
        <label><input type="checkbox" checked={t.completed} disabled={!!working} onChange={(e) => toggle(t, e.target.checked)} /><span>{t.title}</span></label>
        <small>{working === `tick:${t.id}` ? "Saving…" : working === `delete:${t.id}` ? "Deleting…" : taskMeta(t, today)}</small>
        {t.note && <p className="ob-task-note">{t.note}</p>}
      </div>
      <button type="button" className="ob-note-action ob-note-delete ob-task-delete" disabled={!!working} onClick={() => remove(t)} aria-label={`Delete the task: ${t.title}`}>Delete</button>
    </li>;
  };
  return <section className="ob-section ob-tasks" aria-label="Tasks"><h3>Tasks<small>{tasks ? taskCount(items) : ""}</small></h3>
    {tasks?.error && <div className="call-alert" role="alert">{tasks.error}<button type="button" className="call-secondary" disabled={!!working} onClick={reload}>{working === "load" ? "Loading…" : "Try again"}</button></div>}
    <form className="ob-task-add" onSubmit={add}>
      <input className="ob-task-title" value={title} maxLength={200} disabled={adding} placeholder="Add a task, e.g. ask the client to set up Stripe" aria-label="New task" onChange={(e) => setTitle(e.target.value)} onKeyDown={enter} />
      <input type="date" value={due} min="2000-01-01" max="2098-12-31" disabled={adding} aria-label="Due date (optional)" title="Due date (optional)" onChange={(e) => setDue(e.target.value)} />
      <select value={assignee} disabled={adding} aria-label="Assign to (optional)" onChange={(e) => setAssignee(e.target.value)}><option value="">Unassigned</option>{(tasks?.assignees || []).map((n) => <option key={n} value={n}>{n}</option>)}</select>
      <button type="submit" className="call-secondary" disabled={!!working || !title.trim()}>{adding ? "Adding…" : "Add task"}</button>
    </form>
    {error && <p className="ob-task-error" role="alert">{error}</p>}
    {open.length > 0 ? <ul className="ob-task-list">{open.map(row)}</ul> : !tasks?.error && <p className="call-muted ob-task-empty">{closed.length ? "Nothing open. Everything on the list is done." : "No tasks yet. Add the first one above."}</p>}
    {closed.length > 0 && <details className="ob-task-done"><summary>{closed.length} done</summary><ul className="ob-task-list">{closed.map(row)}</ul></details>}
    {missingStarter.length > 0 && !tasks?.error && <div className="ob-task-starter"><button type="button" className="call-secondary" disabled={!!working} onClick={addStarter}>{working === "starter" ? "Adding…" : "Add starter tasks"}</button><small>{missingStarter.length === 1 ? "Adds the one starter task this client does not have yet" : `Adds the ${missingStarter.length === 9 ? "nine" : missingStarter.length} starter tasks this client does not have yet`} (matched by title).</small></div>}
    {done && <p className="ob-ok ob-task-done-line" role="status">{done}</p>}
    <p className="call-muted ob-hint">Each task is saved on this contact in GoHighLevel, so it shows there too. GoHighLevel needs a due date, so a task with none carries Dec 31, 2099 there. Delete is immediate.</p>
  </section>;
}
