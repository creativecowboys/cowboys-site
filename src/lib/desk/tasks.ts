import { CallDeskError } from "@/lib/calls/validation";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { createTask, deleteTask, getContact, ghl, GhlError, listTasks, setTaskCompleted, type GhlContact, type GhlTask } from "@/lib/ghl/client";
import { readContact, version } from "./record";
import { deskTeam, memberByGhlUser, memberByName, type Actor } from "./team";
import { dueFromIso, dueIsoFor, easternDay, formatTaskBody, isDeskTaskBody, isDueDay, isTaskRequestId, plusDays, taskAddedBy, taskMarker, taskNote, type DeskTask, type DeskTasks, type TaskSource } from "./task-text";

// The client's running task list (Oct 4 2026) on the Onboarding and Clients panels. A task is a native GoHighLevel
// contact task — the desk keeps no copy of its own — so it shows in GoHighLevel too, and anything typed there shows
// here. The rules for due dates and the markers a desk task carries are in ./task-text.ts.
//
// What the desk does with tasks: list them, add one, tick one off or open it again. Nothing else:
//   - it never deletes a task (only the owner-only self-test removes the tasks IT created on the test contact);
//   - it never edits a task's title, date or assignee (do that in GoHighLevel);
//   - adding a task sends nothing to the client and changes no field or tag, so no workflow keyed on those can start.
//     A task assigned to someone may get them GoHighLevel's own "task assigned" notice, if their GoHighLevel settings send one.
//
// Any contact on the location can carry tasks; the panels only show them for onboarding records and clients.

/** Everyone on the desk who has a GoHighLevel user can be given a task (Dave, Josh, Keaton — and anyone added with GHL_REP_IDS). */
export const taskAssignees = (): string[] => deskTeam().filter((m) => m.ghlUserId).map((m) => m.name);

export function toDeskTask(t: GhlTask): DeskTask {
  const body = typeof t.body === "string" ? t.body : "";
  const desk = isDeskTaskBody(body);
  const assignedTo = typeof t.assignedTo === "string" ? t.assignedTo.trim() : "";
  return {
    id: t.id,
    title: (typeof t.title === "string" ? t.title.trim() : "") || "(untitled task)",
    due: dueFromIso(t.dueDate),
    completed: t.completed === true,
    assignee: assignedTo ? memberByGhlUser(assignedTo)?.name || "someone in GoHighLevel" : "",
    addedBy: desk ? taskAddedBy(body) : "",
    fromDesk: desk,
    note: taskNote(body),
  };
}
// GoHighLevel lists a contact's tasks newest first (seen live Oct 4 2026: seven tasks added in order came back in reverse).
// The desk shows them oldest first, the order they were added; the panel then puts the dated ones ahead (src/lib/desk/task-text.ts).
const board = (newestFirst: GhlTask[]): DeskTasks => ({ items: [...newestFirst].reverse().map(toDeskTask), assignees: taskAssignees() });
/** `base` with whatever GoHighLevel answered laid over it — but a null or missing value in the answer never wipes a known one. */
const overlay = (base: GhlTask, answer: GhlTask | null): GhlTask => ({ ...base, ...Object.fromEntries(Object.entries(answer || {}).filter(([, v]) => v !== null && v !== undefined)) }) as GhlTask;

/** The contact's tasks. Throws when GoHighLevel cannot be read (the tasks route says so; the panel offers Try again). */
export async function listDeskTasks(contactId: string): Promise<DeskTasks> {
  return board(await listTasks(contactId));
}
/**
 * For a panel's first load: never throws, and never waits long, so a GoHighLevel hiccup on the task list never hides the
 * client (the panel's own request has 60 seconds; the default read policy alone could spend that on a hanging endpoint).
 */
export async function tasksFor(contactId: string): Promise<DeskTasks> {
  try { return board(await listTasks(contactId, { timeoutMs: 8000, retries: 1 })); }
  catch (e) {
    console.error(`desk tasks: could not read the tasks of ${contactId}: ${e instanceof Error ? e.message : e}`);
    return { items: [], assignees: taskAssignees(), error: "Could not read this client's tasks from GoHighLevel." };
  }
}

/**
 * What a change answers with: the whole list as it now stands, the task it touched, and the contact's version right
 * before and right after the change. If the panel's copy of the record was current before (its version equals `before`),
 * it may take `after` as its version — so a task that moves the contact's version never turns the panel's next change
 * into a "someone changed this client" refusal, while a change someone ELSE made still does. `after` is only ever a
 * NEW version when nothing the desk shows or writes on the contact changed in between (deskView): if someone else saved
 * the record during the task write, `after` equals `before` and the panel's next change is refused as stale, as it should be.
 */
export type TaskWrite = { tasks: DeskTasks; task: DeskTask | null; existed?: boolean; before: string; after: string };
export type TaskAdd = { title: string; due: string; assignee: string; requestId: string; source: TaskSource };

/** The parts of a contact the panels show and write: what the panel's version check protects. */
function deskView(c: GhlContact): string {
  const fields = (c.customFields || []).map((f) => [f.id, f.value !== undefined ? f.value : f.field_value ?? null] as const).sort((a, b) => a[0].localeCompare(b[0]));
  return JSON.stringify([fields, [...(c.tags || [])].sort(), c.firstName, c.lastName, c.companyName, c.email, c.phone, c.website, c.city, c.state, c.assignedTo].map((v) => v ?? ""));
}
/** The version a panel may move to after a task write (see TaskWrite). */
async function versionAfter(contactId: string, before: GhlContact): Promise<string> {
  const after = await getContact(contactId).catch(() => null);
  return after && deskView(after) === deskView(before) ? version(after) : version(before);
}

const adding = new Set<string>(); // a double click on the same warm instance; the marker is what makes a retry safe
export async function addDeskTask(contactId: string, input: TaskAdd, actor: Actor): Promise<TaskWrite> {
  if (!isTaskRequestId(input.requestId)) throw new CallDeskError("Invalid task reference. Reload and try again.", 400);
  if (!input.title.trim() || input.title.length > 200) throw new CallDeskError("Write the task first (under 200 characters).", 400);
  if (input.due && !isDueDay(input.due)) throw new CallDeskError("Choose a real due date, or leave it empty.", 400);
  const assignedTo = input.assignee ? memberByName(input.assignee)?.ghlUserId || "" : "";
  if (input.assignee && !assignedTo) throw new CallDeskError(`${input.assignee} has no GoHighLevel user, so the task cannot be put on them there. Leave it unassigned, or pick someone else.`, 400);
  const key = `${contactId}:${input.requestId}`;
  if (adding.has(key)) throw new CallDeskError("That task is already being added. Give it a moment.", 409);
  adding.add(key);
  try {
    const before = await readContact(contactId); // a contact GoHighLevel does not have is a 404 here, before anything is written
    const existing = await listTasks(contactId);
    const prior = existing.find((t) => typeof t.body === "string" && t.body.includes(taskMarker(input.requestId)));
    let task: GhlTask | undefined = prior;
    if (!prior) {
      const sent = { title: input.title, body: formatTaskBody({ requestId: input.requestId, source: input.source, by: actor.name, addedOn: easternDay(), due: input.due }), dueDate: dueIsoFor(input.due), completed: false, ...(assignedTo ? { assignedTo } : {}) };
      task = overlay({ id: "", ...sent }, await createTask(contactId, sent)); // what GoHighLevel answers wins; what was sent fills any gap
    }
    const items = prior ? existing : [task!, ...existing]; // the new task is the newest
    return { tasks: board(items), task: task ? toDeskTask(task) : null, existed: !!prior, before: version(before), after: await versionAfter(contactId, before) };
  } finally { adding.delete(key); }
}

/** Tick a task off (or open it again). Only a task that is on THIS contact can be changed through this contact. */
export async function setDeskTaskDone(contactId: string, taskId: string, completed: boolean): Promise<TaskWrite> {
  const before = await readContact(contactId);
  const existing = await listTasks(contactId);
  const current = existing.find((t) => t.id === taskId);
  if (!current) throw new CallDeskError("That task is not on this client any more (it may have been removed in GoHighLevel). Reload to see the latest.", 404);
  let task: GhlTask = current;
  if ((current.completed === true) !== completed) {
    const back = await setTaskCompleted(contactId, taskId, completed);
    task = { ...overlay(current, back), completed: typeof back?.completed === "boolean" ? back.completed : completed };
    if (task.completed !== completed) throw new CallDeskError("GoHighLevel did not keep that change. Reload and try again.", 502);
  }
  return { tasks: board(existing.map((t) => (t.id === taskId ? task : t))), task: toDeskTask(task), before: version(before), after: await versionAfter(contactId, before) };
}

// ───────────────────────────── self-test (test contact only, owner-only route) ─────────────────────────────
export type TaskSelfTestReport = {
  dryRun: boolean; contact: string; plan?: string[]; steps?: string[]; passed?: number; failed?: string[];
  /** What GoHighLevel did with a task sent WITHOUT a due date (its spec says it needs one; the desk always sends one). */
  noDueDate?: string;
  /** The field names GoHighLevel returns on a task. */
  taskFields?: string;
  /** Whether the contact's dateUpdated (the desk's version token) moves when a task is added or ticked off. */
  version?: string;
  cleanup?: string; error?: string;
};
/** Report text: no "=", "?" or "&" (the browser tool that reads these reports redacts anything shaped like a query string). */
const plain = (e: unknown): string => (e instanceof GhlError ? `${e.ghlStatus} ${e.body}` : e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 300);

/**
 * Proves the task path against the real GoHighLevel API on the designated TEST CONTACT only, never a client: adds a task
 * with no due date and one with a due date (both unassigned, so nobody is notified), retries one (must not add a second),
 * reads both back, ticks one off and opens it again, and says whether the contact's version moved. It also sends one raw
 * task WITHOUT a due date to record what GoHighLevel does with that. Every task it created is removed again at the end
 * (by id, only those). dryRun (the default on the route) only describes this.
 */
export async function deskTaskSelfTest(dryRun: boolean, actor: Actor): Promise<TaskSelfTestReport> {
  const report: TaskSelfTestReport = { dryRun, contact: TEST_CONTACT_ID };
  if (dryRun) return { ...report, plan: [
    "send one raw task with no due date, to see whether GoHighLevel takes it",
    "add a desk task with no due date (saved with the Dec 31 2099 stand-in) and one due a week from today, both unassigned",
    "send the second one again with the same reference: nothing new may appear",
    "read both back from GoHighLevel, tick the second one off, then open it again",
    "say whether the contact's version (dateUpdated) moved, then remove every task this run created, and only those",
  ] };
  const made: string[] = []; const steps: string[] = []; const failed: string[] = [];
  const check = (name: string, ok: boolean, detail = "") => { steps.push(`${ok ? "ok" : "FAILED"}: ${name}${detail ? ` (${detail.replace(/[=?&]/g, " ")})` : ""}`); if (!ok) failed.push(name); };
  const stamp = `${easternDay()}-${Date.now().toString(36)}`;
  let startCount = -1;
  const startIds = new Set<string>(); // never removed, whatever an answer says
  const keep = (id: string | undefined, existed = false) => { if (id && !existed && !startIds.has(id) && !made.includes(id)) made.push(id); };
  try {
    const before = await getContact(TEST_CONTACT_ID);
    const start = await listTasks(TEST_CONTACT_ID);
    startCount = start.length;
    for (const t of start) startIds.add(t.id);
    try {
      const r = await ghl<{ task?: GhlTask }>("POST", `/contacts/${TEST_CONTACT_ID}/tasks`, { title: "Back Office task self-test: no due date probe. Safe to ignore.", body: "Added and removed again by the Back Office task self-test.", completed: false }, { retries: 0 });
      keep(r.task?.id);
      report.noDueDate = r.task?.id ? `ACCEPTED with no due date. GoHighLevel kept dueDate as ${r.task.dueDate === undefined ? "(not in its answer)" : JSON.stringify(r.task.dueDate)}` : "answered without a task";
    } catch (e) { report.noDueDate = `refused, as its spec says: ${plain(e)}`; }
    const due = plusDays(easternDay(), 7);
    const a = await addDeskTask(TEST_CONTACT_ID, { title: "Back Office task self-test A, no due date. Safe to ignore.", due: "", assignee: "", requestId: `selftest-a-${stamp}`, source: "client" }, actor);
    keep(a.task?.id, a.existed);
    check("add a task with no due date", !!a.task && !a.existed && a.task.due === "" && a.task.fromDesk && a.task.addedBy === actor.name && !a.task.completed && !a.task.assignee, a.task ? `shown as ${a.task.due || "no due date"}, added by ${a.task.addedBy || "nobody"}` : "no task came back");
    const bInput = { title: "Back Office task self-test B, due in a week. Safe to ignore.", due, assignee: "", requestId: `selftest-b-${stamp}`, source: "onboarding" as const };
    const b = await addDeskTask(TEST_CONTACT_ID, bInput, actor);
    keep(b.task?.id, b.existed);
    check("add a task due in a week", !!b.task && b.task.due === due, b.task ? `shown as due ${b.task.due || "never"}` : "no task came back");
    const again = await addDeskTask(TEST_CONTACT_ID, bInput, actor);
    keep(again.task?.id, again.existed); // if the retry did add a second task, it is removed with the rest
    check("the same task sent twice is added once", again.existed === true && again.tasks.items.filter((t) => t.id === b.task?.id).length === 1);
    const read = await listTasks(TEST_CONTACT_ID);
    const ra = read.find((t) => t.id === a.task?.id); const rb = read.find((t) => t.id === b.task?.id);
    check("read back: the stand-in reads as no due date", !!ra && dueFromIso(ra.dueDate) === "", ra ? `GoHighLevel holds ${String(ra.dueDate)}` : "not in the list");
    check("read back: the due date", !!rb && dueFromIso(rb.dueDate) === due, rb ? `GoHighLevel holds ${String(rb.dueDate)}` : "not in the list");
    check("read back: unassigned and open", !!ra && !!rb && !ra.assignedTo && !rb.assignedTo && ra.completed !== true && rb.completed !== true);
    report.taskFields = ra ? Object.keys(ra).sort().join(", ") : "";
    if (b.task) {
      const done = await setDeskTaskDone(TEST_CONTACT_ID, b.task.id, true);
      check("tick it off", done.task?.completed === true && (await listTasks(TEST_CONTACT_ID)).find((t) => t.id === b.task!.id)?.completed === true);
      const open = await setDeskTaskDone(TEST_CONTACT_ID, b.task.id, false);
      check("open it again", open.task?.completed === false && (await listTasks(TEST_CONTACT_ID)).find((t) => t.id === b.task!.id)?.completed !== true);
    }
    const after = await getContact(TEST_CONTACT_ID);
    report.version = `the contact's dateUpdated ${before.dateUpdated && after.dateUpdated && before.dateUpdated !== after.dateUpdated ? "MOVED" : "did not move"} across the task writes`;
  } catch (e) { report.error = plain(e); }
  finally {
    // Remove exactly the tasks this run created, on the test contact, and nothing else (never one that was there before the run).
    const left: string[] = [];
    for (const id of made) { if (startIds.has(id)) continue; try { await deleteTask(TEST_CONTACT_ID, id); } catch { left.push(id); } }
    let now = "";
    try { const n = (await listTasks(TEST_CONTACT_ID)).length; now = startCount >= 0 ? `; the test contact has ${n} tasks, ${n === startCount ? "as before the run" : `it had ${startCount} before the run`}` : ""; } catch { /* the line above is a courtesy */ }
    report.cleanup = `removed ${made.length - left.length} of ${made.length} self-test tasks${left.length ? `, still on the test contact: ${left.join(", ")}` : ""}${now}`;
  }
  report.steps = steps; report.passed = steps.length - failed.length; report.failed = failed;
  return report;
}
