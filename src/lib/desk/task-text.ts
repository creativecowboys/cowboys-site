import { TZ, zonedToUtc } from "@/lib/calls/followup-time";

// A client's running task list (Dave, Oct 4 2026: "we need a running task list for each client, while onboarding.
// something we can add to.. like now, i have to ask Chad to setup stripe.. but not all clients need that.").
// A desk task IS a GoHighLevel contact task, the same object, so it lives in the CRM and shows in GoHighLevel too.
// This file is pure (no Node, no network): the Onboarding / Clients panels and the server both use it.
//
// Due dates. GoHighLevel will not save a task without one (its API lists dueDate as required), so:
//   - a task with a due date is saved for 5:00 pm Eastern on that day (the end of the working day, never overdue before then);
//   - a task with NO due date is saved with the stand-in Dec 31, 2099, 5:00 pm Eastern, and its description says so;
//   - read back, any date in 2099 or later is "no due date", and every other date is shown as its Eastern calendar day.
//
// A task added on the desk carries three markers at the end of its description, the same way desk notes do:
//   [CC-TASK:<id>]   idempotency: a retry with the same id finds the task instead of adding it twice
//   [CC-SRC:<tab>]   where it was added: onboarding | client
//   [CC-BY:<name>]   who added it (a task made through the API records no author in GoHighLevel)
export type DeskTask = {
  id: string;
  title: string;
  /** The Eastern calendar day it is due, YYYY-MM-DD; "" = no due date. */
  due: string;
  completed: boolean;
  /** Desk name of the person it is assigned to ("Josh"); "" = unassigned. */
  assignee: string;
  /** Who added it on the desk; "" when it came from somewhere else. */
  addedBy: string;
  /** Added on the desk (it carries the desk's marker). Tasks typed in GoHighLevel, the package builder's and the payment alerts are not. */
  fromDesk: boolean;
  /** The task's description as a person reads it: markers and the desk's own two boilerplate lines removed. */
  note: string;
};
/** What a panel holds: the contact's tasks, who a task can be assigned to, and why the list could not be read (when it could not). */
export type DeskTasks = { items: DeskTask[]; assignees: string[]; error?: string };
export type TaskSource = "onboarding" | "client";

export const NO_DUE_DATE = "2099-12-31";
/** A due date in this year or later is the stand-in, never a real date (the desk refuses to set one). */
export const NO_DUE_FROM_YEAR = 2099;
const DUE_TIME = "17:00";
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar day written YYYY-MM-DD. */
export function isCalendarDay(v: string): boolean {
  const m = DAY.exec(v);
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}
/** A due day the desk accepts: a real day from 2000 up to the end of 2098. */
export const isDueDay = (v: string): boolean => isCalendarDay(v) && v >= "2000-01-01" && Number(v.slice(0, 4)) < NO_DUE_FROM_YEAR;
/** The dueDate GoHighLevel gets for a desk task: 5:00 pm Eastern on the day, or the stand-in when there is no due date. */
export const dueIsoFor = (day: string): string => zonedToUtc(day || NO_DUE_DATE, DUE_TIME).toISOString();
/** The Eastern calendar day of an instant ("" when it is not a date). With no argument: today, Eastern. */
export function easternDay(at: Date | string | number = new Date()): string {
  const d = at instanceof Date ? at : new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
/** GoHighLevel's dueDate → the desk's due day. Missing, unreadable, or the 2099 stand-in → "" (no due date). */
export function dueFromIso(iso: unknown): string {
  if (typeof iso !== "string" || !iso.trim()) return "";
  const raw = iso.trim();
  // A bare day is a day (new Date("2026-10-09") would be UTC midnight, the evening before in Georgia).
  const day = DAY.test(raw) ? (isCalendarDay(raw) ? raw : "") : easternDay(raw);
  return day && Number(day.slice(0, 4)) < NO_DUE_FROM_YEAR ? day : "";
}
export function plusDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const MARKER = /\[CC-[A-Z-]+:[^\]\n]*\]/g;
export const taskMarker = (requestId: string) => `[CC-TASK:${requestId}]`;
const REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9-]{7,79}$/;
/** The browser mints one per task it is adding (and keeps it for a retry). Same shape as a desk note id. */
export const isTaskRequestId = (v: unknown): v is string => typeof v === "string" && REQUEST_ID.test(v);
const ADDED_LINE = /^Added in the Back Office by .*$/;
const NO_DUE_LINE = /^No due date\. GoHighLevel needs one.*$/;
const cleanName = (name: string) => name.replace(/[[\]\n\r]/g, "").trim().slice(0, 40) || "Team";
/** "2026-10-04" → "Oct 4, 2026" (written in UTC so the day never shifts). */
export function prettyDay(day: string, withYear = true): string {
  if (!isCalendarDay(day)) return day;
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });
}

/** The description a desk task is saved with. A person reading it in GoHighLevel sees who added it, when, and why a 2099 date is there. */
export function formatTaskBody(o: { requestId: string; source: TaskSource; by: string; addedOn: string; due: string }): string {
  const by = cleanName(o.by);
  const lines = [`Added in the Back Office by ${by} on ${prettyDay(o.addedOn)}.`];
  if (!o.due) lines.push(`No due date. GoHighLevel needs one, so ${prettyDay(NO_DUE_DATE)} stands in.`);
  return `${lines.join("\n")}\n\n${taskMarker(o.requestId)} [CC-SRC:${o.source}] [CC-BY:${by}]`;
}
export const isDeskTaskBody = (body: string): boolean => /\[CC-TASK:[^\]\n]+\]/.test(body);
export const taskAddedBy = (body: string): string => /\[CC-BY:([^\]\n]{1,40})\]/.exec(body)?.[1]?.trim() || "";
/** What a person reads: markers removed, and on a desk task the two boilerplate lines too (the desk shows that information itself). */
export function taskNote(body: string): string {
  const desk = isDeskTaskBody(body);
  return body.replace(MARKER, "").split("\n")
    .filter((line) => !desk || !(ADDED_LINE.test(line.trim()) || NO_DUE_LINE.test(line.trim())))
    .join("\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type TaskState = "done" | "overdue" | "today" | "upcoming" | "none";
export function taskState(t: Pick<DeskTask, "completed" | "due">, today: string): TaskState {
  if (t.completed) return "done";
  if (!t.due) return "none";
  return t.due < today ? "overdue" : t.due === today ? "today" : "upcoming";
}
/** Open tasks by due day (no due date last; otherwise the order GoHighLevel gave them), and the done ones apart. */
export function splitTasks(items: DeskTask[]): { open: DeskTask[]; done: DeskTask[] } {
  const key = (t: DeskTask) => t.due || "9999-99-99";
  const open = items.map((t, i) => ({ t, i })).filter(({ t }) => !t.completed)
    .sort((a, b) => (key(a.t) < key(b.t) ? -1 : key(a.t) > key(b.t) ? 1 : a.i - b.i)).map(({ t }) => t);
  return { open, done: items.filter((t) => t.completed) };
}
/** "Overdue · Oct 2", "Due today", "Due Oct 9", "Due Jan 4, 2027", "No due date". */
export function dueLabel(due: string, today: string): string {
  if (!due) return "No due date";
  const label = prettyDay(due, due.slice(0, 4) !== today.slice(0, 4));
  return due < today ? `Overdue · ${label}` : due === today ? "Due today" : `Due ${label}`;
}
/** The small line under a task: due, who it is on, who added it, and where it came from. */
export function taskMeta(t: DeskTask, today: string): string {
  const due = t.completed ? (t.due ? `Was due ${prettyDay(t.due, t.due.slice(0, 4) !== today.slice(0, 4))}` : "") : dueLabel(t.due, today);
  return [due, t.assignee && `for ${t.assignee}`, t.fromDesk ? t.addedBy && `added by ${t.addedBy}` : "from GoHighLevel"].filter(Boolean).join(" · ");
}
export function taskCount(items: DeskTask[]): string {
  const open = items.filter((t) => !t.completed).length;
  const done = items.length - open;
  if (!items.length) return "none yet";
  return [`${open} open`, done && `${done} done`].filter(Boolean).join(" · ");
}
