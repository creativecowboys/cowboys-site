import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { addDeskTask, deskTaskSelfTest, listDeskTasks, setDeskTaskDone, taskAssignees, tasksFor, toDeskTask } from "./tasks";
import { dueFromIso, dueIsoFor, dueLabel, easternDay, formatTaskBody, isDueDay, isDeskTaskBody, NO_DUE_DATE, plusDays, splitTasks, taskAddedBy, taskCount, taskMeta, taskNote, taskState, type DeskTask } from "./task-text";
import { validateTaskAdd, validateTaskDone } from "./validation";
import { onboardingDetailGhl } from "./onboarding";
import { clientDetailGhl } from "./clients";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, LEAD, MADISON, reps, setUp, tearDown } from "./testing/harness";

// The client's running task list (Oct 4 2026): native GoHighLevel tasks on the contact, added and ticked off from the
// Onboarding and Clients panels. Every test ends on the Phase-2 promise (only desk fields / desk tags, never Monday) and,
// for tasks, on a stronger one: adding or ticking a task writes NOTHING to the contact itself — no field, no tag.
let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const REQ = "4c9e2a1b-7d3f-4e8a-9b6c-0f1e2d3c4b5a";
const add = (over: Partial<Parameters<typeof addDeskTask>[1]> = {}, actor = DAVE, id = LEAD) => addDeskTask(id, { title: "Ask Chad to set up a Stripe account", due: "", assignee: "", requestId: REQ, source: "onboarding", ...over }, actor);
const contactWrites = () => ghl.requests.filter((r) => r.method !== "GET" && (/^\/contacts\/[^/]+$/.test(r.path) || /\/tags$/.test(r.path)));
const taskWrites = () => ghl.requests.filter((r) => r.method !== "GET" && /\/tasks/.test(r.path));

test("due dates: a day is 5 pm Eastern that day; no due date is the Dec 31 2099 stand-in and reads back as none", () => {
  assert.equal(dueIsoFor("2026-10-09"), "2026-10-09T21:00:00.000Z", "October is daylight time: 5 pm EDT is 21:00 UTC");
  assert.equal(dueIsoFor("2026-12-01"), "2026-12-01T22:00:00.000Z", "December is standard time: 5 pm EST is 22:00 UTC");
  assert.equal(dueIsoFor(""), "2099-12-31T22:00:00.000Z");
  assert.equal(NO_DUE_DATE, "2099-12-31");
  for (const day of ["2026-10-09", "2026-12-01", "2027-03-14", "2026-11-01", "2027-01-01"]) assert.equal(dueFromIso(dueIsoFor(day)), day, `round trip ${day}`);
  assert.equal(dueFromIso(dueIsoFor("")), "", "the stand-in is no due date");
  assert.equal(dueFromIso("2099-12-31T05:00:00.000Z"), "", "any time in 2099 is the stand-in");
  assert.equal(dueFromIso("2150-01-01T00:00:00Z"), "");
  // A time GoHighLevel's own screen may have set: shown as the Eastern day it falls on.
  assert.equal(dueFromIso("2026-10-10T02:30:00.000Z"), "2026-10-09", "10:30 pm Eastern on the 9th");
  assert.equal(dueFromIso("2026-10-09"), "2026-10-09", "a bare day is that day (never shifted to the evening before)");
  for (const bad of [undefined, null, "", "soon", 5, "2026-02-30"]) assert.equal(dueFromIso(bad), "", String(bad));
  assert.ok(isDueDay("2026-10-09")); assert.ok(isDueDay("2098-12-31"));
  for (const bad of ["2099-01-01", "1999-12-31", "2026-02-30", "2026-1-9", "tomorrow", ""]) assert.ok(!isDueDay(bad), bad);
  assert.equal(plusDays("2026-12-28", 7), "2027-01-04");
  assert.match(easternDay(), /^\d{4}-\d{2}-\d{2}$/);
});

test("the description a desk task carries: readable in GoHighLevel, markers the desk reads back", () => {
  const body = formatTaskBody({ requestId: REQ, source: "onboarding", by: "Dave", addedOn: "2026-10-04", due: "" });
  assert.equal(body, `Added in the Back Office by Dave on Oct 4, 2026.\nNo due date. GoHighLevel needs one, so Dec 31, 2099 stands in.\n\n[CC-TASK:${REQ}] [CC-SRC:onboarding] [CC-BY:Dave]`);
  assert.ok(isDeskTaskBody(body)); assert.equal(taskAddedBy(body), "Dave"); assert.equal(taskNote(body), "", "the desk shows who and when itself; the boilerplate is not repeated");
  const dated = formatTaskBody({ requestId: REQ, source: "client", by: "Josh]\n[CC-TASK:x", addedOn: "2026-10-04", due: "2026-10-09" });
  assert.ok(!dated.includes("No due date"), "a dated task has no stand-in line");
  assert.equal(taskAddedBy(dated), "JoshCC-TASK:x", "a name cannot smuggle a marker in");
  assert.equal((dated.match(/\[CC-TASK:/g) || []).length, 1);
  // A task from somewhere else keeps its whole description, and is not mistaken for a desk task.
  const other = "Before then: renew at $297/mo for another 12 months.\nNo due date. GoHighLevel needs one — typed by hand";
  assert.ok(!isDeskTaskBody(other)); assert.equal(taskNote(other), other); assert.equal(taskAddedBy(other), "");
});

test("the list: open tasks by due day (no due date last), done ones apart; labels and counts", () => {
  const t = (id: string, due: string, completed = false, extra: Partial<DeskTask> = {}): DeskTask => ({ id, title: id, due, completed, assignee: "", addedBy: "Dave", fromDesk: true, note: "", ...extra });
  const items = [t("none-1", ""), t("later", "2026-10-20"), t("done", "2026-10-01", true), t("overdue", "2026-10-02"), t("none-2", ""), t("today", "2026-10-04")];
  const { open, done } = splitTasks(items);
  assert.deepEqual(open.map((x) => x.id), ["overdue", "today", "later", "none-1", "none-2"]);
  assert.deepEqual(done.map((x) => x.id), ["done"]);
  const today = "2026-10-04";
  assert.deepEqual(["overdue", "today", "later", "none-1", "done"].map((id) => taskState(items.find((x) => x.id === id)!, today)), ["overdue", "today", "upcoming", "none", "done"]);
  assert.equal(dueLabel("2026-10-02", today), "Overdue · Oct 2"); assert.equal(dueLabel(today, today), "Due today");
  assert.equal(dueLabel("2026-10-20", today), "Due Oct 20"); assert.equal(dueLabel("2027-01-04", today), "Due Jan 4, 2027"); assert.equal(dueLabel("", today), "No due date");
  assert.equal(taskMeta(t("x", "2026-10-09", false, { assignee: "Josh" }), today), "Due Oct 9 · for Josh · added by Dave");
  assert.equal(taskMeta(t("x", "2026-10-01", true), today), "Was due Oct 1 · added by Dave");
  assert.equal(taskMeta(t("x", "", false, { fromDesk: false, addedBy: "" }), today), "No due date · from GoHighLevel");
  assert.equal(taskCount(items), "5 open · 1 done"); assert.equal(taskCount([]), "none yet"); assert.equal(taskCount([t("a", "")]), "1 open");
});

test("add a task: a native GoHighLevel task on the contact — stand-in date, no assignee unless one is picked, nothing else written", async () => {
  addLead(ghl);
  const r = await add();
  assert.equal(ghl.tasks.length, 1);
  const saved = ghl.tasks[0];
  assert.equal(saved.contactId, LEAD); assert.equal(saved.title, "Ask Chad to set up a Stripe account"); assert.equal(saved.completed, false);
  assert.equal(saved.dueDate, "2099-12-31T22:00:00.000Z", "GoHighLevel needs a due date: the stand-in");
  assert.equal(saved.assignedTo, undefined, "no assignee unless someone is picked — so nobody gets GoHighLevel's task notice");
  assert.match(saved.body!, /^Added in the Back Office by Dave on [A-Z][a-z]{2} \d{1,2}, \d{4}\.\nNo due date\. /);
  assert.ok(saved.body!.endsWith(`[CC-TASK:${REQ}] [CC-SRC:onboarding] [CC-BY:Dave]`));
  const sent = taskWrites()[0].body as Record<string, unknown>;
  assert.deepEqual(Object.keys(sent).sort(), ["body", "completed", "dueDate", "title"], "no assignedTo key at all");
  assert.equal(r.existed, false);
  assert.deepEqual(r.task, { id: saved.id, title: "Ask Chad to set up a Stripe account", due: "", completed: false, assignee: "", addedBy: "Dave", fromDesk: true, note: "" });
  assert.deepEqual(r.tasks.items, [r.task]); assert.deepEqual(r.tasks.assignees, ["Dave", "Josh", "Keaton"]);
  assert.equal(r.before, r.after, "the fake does not move the contact's version on a task write");
  assert.equal(contactWrites().length, 0, "adding a task writes nothing to the contact: no field, no tag");
  // With a due date and an assignee.
  const r2 = await add({ title: "  Get   Chad's real cart\ninventory list ", due: "2026-10-09", assignee: "Josh", requestId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", source: "client" }, MADISON);
  assert.equal(ghl.tasks.length, 2);
  assert.equal(ghl.tasks[1].dueDate, "2026-10-09T21:00:00.000Z"); assert.equal(ghl.tasks[1].assignedTo, reps.Josh);
  assert.ok(!ghl.tasks[1].body!.includes("No due date"));
  assert.equal(r2.task?.assignee, "Josh"); assert.equal(r2.task?.due, "2026-10-09"); assert.equal(r2.task?.addedBy, "Madison", "Madison has no GoHighLevel user; the task still says who added it");
  assert.equal(r2.tasks.items.length, 2);
});

test("a retry with the same reference finds the task instead of adding a second one", async () => {
  addLead(ghl);
  const first = await add();
  const again = await add();
  assert.equal(again.existed, true); assert.equal(again.task?.id, first.task?.id);
  assert.equal(ghl.tasks.length, 1); assert.equal(taskWrites().length, 1);
  // A dropped answer: GoHighLevel saved the task but the desk never heard back (here: the task is already there, carrying the
  // reference). Sending it again adds nothing and answers with the task that is there.
  const other = "0f9e8d7c-6b5a-4f3e-8d2c-1b0a9f8e7d6c";
  ghl.tasks.push({ id: "taskSaved00000000001", contactId: LEAD, title: "Second", body: formatTaskBody({ requestId: other, source: "client", by: "Dave", addedOn: "2026-10-04", due: "" }), dueDate: dueIsoFor(""), completed: false });
  const posts = taskWrites().length;
  const retry = await add({ requestId: other, title: "Second" });
  assert.equal(retry.existed, true); assert.equal(retry.task?.id, "taskSaved00000000001");
  assert.equal(ghl.tasks.length, 2); assert.equal(taskWrites().length, posts, "the second send of the same task wrote nothing");
});

test("refusals happen before anything is written", async () => {
  addLead(ghl);
  await assert.rejects(add({ assignee: "Madison" }), { status: 400, message: /Madison has no GoHighLevel user/ });
  await assert.rejects(add({ requestId: "../../etc" }), { status: 400 });
  await assert.rejects(add({ due: "2099-06-01" }), { status: 400 }, "the library refuses a 2099 date too, not only the route's validator");
  await assert.rejects(add({ title: "   " }), { status: 400 });
  await assert.rejects(add({}, DAVE, "NoSuchContact0000001"), { status: 404 });
  assert.equal(taskWrites().length, 0);
  // GoHighLevel refusing the task itself surfaces as an error, not a silent success.
  ghl.failures.push({ match: /^POST \/contacts\/[^/]+\/tasks$/, status: 422, body: { message: ["title must be shorter"] } });
  await assert.rejects(add(), { status: 502 });
  assert.equal(ghl.tasks.length, 0);
});

test("tick a task off and open it again: only a task on THIS contact, and only when it changes", async () => {
  addLead(ghl);
  const other = ghl.addContact({ id: "OtherContact00000001", firstName: "Someone", companyName: "Elsewhere LLC" });
  const { task } = await add();
  const elsewhere = await addDeskTask(other.id, { title: "Not this client's", due: "", assignee: "", requestId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d", source: "client" }, DAVE);
  const done = await setDeskTaskDone(LEAD, task!.id, true);
  assert.equal(done.task?.completed, true); assert.equal(ghl.tasks.find((t) => t.id === task!.id)?.completed, true);
  assert.equal(done.tasks.items.find((t) => t.id === task!.id)?.completed, true);
  const puts = () => ghl.requests.filter((r) => r.method === "PUT" && r.path.endsWith("/completed")).length;
  assert.equal(puts(), 1);
  await setDeskTaskDone(LEAD, task!.id, true);
  assert.equal(puts(), 1, "already done: no second write");
  const open = await setDeskTaskDone(LEAD, task!.id, false);
  assert.equal(open.task?.completed, false); assert.equal(ghl.tasks.find((t) => t.id === task!.id)?.completed, false);
  await assert.rejects(setDeskTaskDone(LEAD, elsewhere.task!.id, true), { status: 404 }, "a task on another contact cannot be changed through this one");
  assert.equal(ghl.tasks.find((t) => t.id === elsewhere.task!.id)?.completed, false);
  await assert.rejects(setDeskTaskDone(LEAD, "NoSuchTask0000000001", true), { status: 404 });
  // GoHighLevel answering with the opposite state is an error, not a quiet success.
  ghl.failures.push({ match: /\/completed$/, status: 200, body: { task: { id: task!.id, completed: false } } });
  await assert.rejects(setDeskTaskDone(LEAD, task!.id, true), { status: 502 });
  assert.equal(contactWrites().length, 0, "ticking tasks writes nothing to the contact");
});

test("the version a panel may take: before and after the task write, so its next change is not refused as stale", async () => {
  addLead(ghl);
  ghl.tasksBumpContact = true; // in case the real GoHighLevel moves dateUpdated on a task write
  const v0 = String(ghl.get(LEAD).dateUpdated);
  const r = await add();
  assert.equal(r.before, v0); assert.notEqual(r.after, v0); assert.equal(r.after, String(ghl.get(LEAD).dateUpdated));
  const d = await setDeskTaskDone(LEAD, r.task!.id, true);
  assert.equal(d.before, r.after); assert.equal(d.after, String(ghl.get(LEAD).dateUpdated));
});

test("someone else's change during a task write is never folded into the version the panel takes", async () => {
  addLead(ghl);
  ghl.tasksBumpContact = true;
  const fake = ghl as unknown as { handle: (url: string, init?: RequestInit) => Promise<Response> };
  const real = fake.handle.bind(ghl);
  // While the task is being added, someone saves the record (a desk field changes and the version moves).
  fake.handle = async (url, init) => {
    const r = await real(url, init);
    if ((init?.method || "GET") === "POST" && /\/tasks$/.test(url)) {
      ghl.get(LEAD).customFields!.push({ id: ghl.fieldId("Desk Onboarding Health"), value: "Blocked" });
      ghl.get(LEAD).dateUpdated = ghl.tick();
    }
    return r;
  };
  try {
    const r = await add();
    assert.equal(r.after, r.before, "the panel keeps its old version, so its next change is refused as stale");
    assert.notEqual(String(ghl.get(LEAD).dateUpdated), r.before);
  } finally { fake.handle = real; }
  // Without anyone else, the version the task write moved to is the one the panel may take.
  const again = await add({ requestId: "c0ffee00-1111-4222-8333-444455556666", title: "Second" });
  assert.notEqual(again.after, again.before); assert.equal(again.after, String(ghl.get(LEAD).dateUpdated));
});

test("reading: tasks from GoHighLevel itself and the desk's own alerts show too, with who they are on", async () => {
  addLead(ghl);
  ghl.tasks.push(
    { id: "taskGhl0000000000001", contactId: LEAD, title: "Call back about the logo", body: "Typed in GoHighLevel", dueDate: "2026-10-06T14:00:00.000Z", completed: false, assignedTo: reps.Keaton },
    { id: "taskAndy000000000001", contactId: LEAD, title: "Andy's task", dueDate: "2026-10-07T14:00:00.000Z", completed: true, assignedTo: "hbLQYeyltkA25clVlVxy" },
    { id: "taskBare000000000001", contactId: LEAD, title: "", dueDate: "", completed: false },
  );
  const { items } = await listDeskTasks(LEAD);
  assert.deepEqual(items[0], { id: "taskGhl0000000000001", title: "Call back about the logo", due: "2026-10-06", completed: false, assignee: "Keaton", addedBy: "", fromDesk: false, note: "Typed in GoHighLevel" });
  assert.equal(items[1].assignee, "someone in GoHighLevel"); assert.equal(items[1].completed, true);
  assert.equal(items[2].title, "(untitled task)"); assert.equal(items[2].due, "");
  assert.deepEqual(toDeskTask({ id: "x", title: "t", completed: "true" as unknown as boolean }).completed, false, "only a real true is done");
});

test("a panel's first load never fails because of the task list, and never waits long for it", async () => {
  addLead(ghl);
  ghl.failures.push(...[0, 1].map(() => ({ match: /^GET \/contacts\/[^/]+\/tasks$/, status: 500 })));
  const t = await tasksFor(LEAD);
  assert.deepEqual(t.items, []); assert.match(t.error!, /Could not read this client's tasks/); assert.deepEqual(t.assignees, ["Dave", "Josh", "Keaton"]);
  assert.equal(ghl.requests.filter((r) => /\/tasks$/.test(r.path)).length, 2, "one retry, not the default two: a hanging endpoint must not use up the panel's time");
  await assert.rejects(listDeskTasks("NoSuchContact0000001"), (e: Error & { status?: number }) => e.status === 502 || e.status === 404);
});

test("the Onboarding and Clients panels carry the task list", async () => {
  addLead(ghl, { tags: ["giveaway-entrant", "sales-lead", "desk-onboarding", "desk-client"], fields: { "Desk Onboarding Stage": "New handoff", "Desk Client Status": "Active" } });
  await add();
  const ob = await onboardingDetailGhl(LEAD);
  assert.equal(ob.tasks?.items.length, 1); assert.equal(ob.tasks?.items[0].title, "Ask Chad to set up a Stripe account"); assert.equal(ob.tasks?.error, undefined);
  const cl = await clientDetailGhl(LEAD, false);
  assert.deepEqual(cl.tasks, ob.tasks);
  ghl.failures.push(...[0, 1].map(() => ({ match: /^GET \/contacts\/[^/]+\/tasks$/, status: 500 })));
  const still = await onboardingDetailGhl(LEAD);
  assert.equal(still.row.id, LEAD, "the panel still opens"); assert.match(still.tasks!.error!, /Could not read/);
});

test("who a task can be given to: everyone on the desk with a GoHighLevel user", () => {
  assert.deepEqual(taskAssignees(), ["Dave", "Josh", "Keaton"]);
  process.env.GHL_REP_IDS = "Madison:MadisonGhlUser000001";
  assert.deepEqual(taskAssignees(), ["Dave", "Josh", "Keaton", "Madison"]);
});

test("request checks: add and done", () => {
  const ok = { title: " Ask Chad\tabout shipping ", due: "", assignee: "", requestId: REQ, source: "client" };
  assert.deepEqual(validateTaskAdd(ok), { title: "Ask Chad about shipping", due: "", assignee: "", requestId: REQ, source: "client" });
  assert.equal(validateTaskAdd({ ...ok, due: "2026-10-09", assignee: "Keaton" }).assignee, "Keaton");
  for (const bad of [
    { ...ok, title: "   " }, { ...ok, title: "x".repeat(201) }, { ...ok, due: "2099-12-31" }, { ...ok, due: "10/09/2026" }, { ...ok, due: "2026-02-30" },
    { ...ok, assignee: "Andy" }, { ...ok, requestId: "short" }, { ...ok, title: "\u200B\u200B" }, { ...ok, source: "sales" }, { ...ok, extra: 1 }, { ...ok, title: "bad\u0007bell" }, null, [], "x",
  ]) assert.throws(() => validateTaskAdd(bad), { status: 400 }, JSON.stringify(bad));
  assert.deepEqual(validateTaskDone({ taskId: "lJpzYrWdpkC2hX6t2yue", completed: true }), { taskId: "lJpzYrWdpkC2hX6t2yue", completed: true });
  for (const bad of [{ taskId: "../x", completed: true }, { taskId: "lJpzYrWdpkC2hX6t2yue", completed: "yes" }, { taskId: "lJpzYrWdpkC2hX6t2yue" }, { taskId: "lJpzYrWdpkC2hX6t2yue", completed: true, title: "x" }]) assert.throws(() => validateTaskDone(bad), { status: 400 }, JSON.stringify(bad));
});

test("the task self-test: test contact only, proves every step, and removes exactly the tasks it made", async () => {
  ghl.addContact({ id: TEST_CONTACT_ID, firstName: "Test", lastName: "Claude", companyName: "Test — Claude" });
  addLead(ghl);
  ghl.tasks.push({ id: "taskKeep000000000001", contactId: TEST_CONTACT_ID, title: "An older task on the test contact", dueDate: "2026-09-30T21:00:00.000Z", completed: false });
  const dry = await deskTaskSelfTest(true, DAVE);
  assert.equal(dry.plan?.length, 5); assert.equal(ghl.requests.length, 0, "a dry run reads and writes nothing");
  const r = await deskTaskSelfTest(false, DAVE);
  assert.equal(r.error, undefined); assert.deepEqual(r.failed, []); assert.equal(r.passed, 8);
  assert.match(r.noDueDate!, /^refused, as its spec says: 422 /);
  assert.match(r.taskFields!, /assignedTo|body/); assert.match(r.version!, /did not move/);
  assert.match(r.cleanup!, /^removed 2 of 2 self-test tasks; the test contact has 1 tasks, as before the run$/);
  assert.deepEqual(ghl.tasks.map((t) => t.id), ["taskKeep000000000001"], "only the tasks the run made are gone");
  assert.ok(ghl.requests.every((x) => !x.path.startsWith("/contacts/") || x.path.startsWith(`/contacts/${TEST_CONTACT_ID}`)), "never touches another contact");
  for (const s of r.steps!) assert.ok(!/[=?&]/.test(s), `report text must not look like a query string: ${s}`);
  // An answer that names a task which was there before the run is never taken as the run's own (and never removed).
  const fake = ghl as unknown as { handle: (url: string, init?: RequestInit) => Promise<Response> };
  const real = fake.handle.bind(ghl);
  ghl.taskNeedsDueDate = false;
  let first = true;
  fake.handle = async (url, init) => {
    if (first && (init?.method || "GET") === "POST" && url.endsWith(`/contacts/${TEST_CONTACT_ID}/tasks`) && !String(init?.body || "").includes("dueDate")) {
      first = false;
      return new Response(JSON.stringify({ task: { id: "taskKeep000000000001", title: "odd answer" } }), { status: 201 });
    }
    return real(url, init);
  };
  try {
    const odd = await deskTaskSelfTest(false, DAVE);
    assert.match(odd.cleanup!, /^removed 2 of 2 /);
    assert.ok(ghl.tasks.some((t) => t.id === "taskKeep000000000001"), "the older task is still there");
  } finally { fake.handle = real; ghl.taskNeedsDueDate = true; }
  // If the "same task twice" step does add a second task, that one is removed with the rest.
  const listing = /^GET \/contacts\/C8FHl1LIfXEMI9isByB2\/tasks$/;
  let lists = 0;
  fake.handle = async (url, init) => {
    const r = await real(url, init);
    // The fourth list (start, A's look, B's look, then the retry's look for its own marker) comes back without descriptions,
    // so the retry cannot find the task and adds a second one.
    if ((init?.method || "GET") === "GET" && listing.test(`GET ${new URL(url).pathname}`) && ++lists === 4) {
      const body = await r.json() as { tasks: Record<string, unknown>[] };
      return new Response(JSON.stringify({ tasks: body.tasks.map(({ body: _b, ...t }) => t) }), { status: 200 });
    }
    return r;
  };
  try {
    const leak = await deskTaskSelfTest(false, DAVE);
    assert.deepEqual(leak.failed, ["the same task sent twice is added once"]);
    assert.match(leak.cleanup!, /^removed 3 of 3 self-test tasks; the test contact has 1 tasks, as before the run$/);
  } finally { fake.handle = real; }
  assert.deepEqual(ghl.tasks.map((t) => t.id), ["taskKeep000000000001"]);
  // If GoHighLevel ever takes a task with no due date, the report says so — and that probe task is removed too.
  ghl.taskNeedsDueDate = false;
  const r2 = await deskTaskSelfTest(false, DAVE);
  assert.match(r2.noDueDate!, /^ACCEPTED with no due date/); assert.match(r2.cleanup!, /^removed 3 of 3/);
  assert.deepEqual(ghl.tasks.map((t) => t.id), ["taskKeep000000000001"]);
});
