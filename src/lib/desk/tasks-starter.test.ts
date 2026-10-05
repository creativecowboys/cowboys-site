import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { validateHandoff } from "@/lib/onboarding/validation";
import { blobJson, blobSeed } from "./testing/blob-stub";
import type { HandoffRecord } from "@/lib/onboarding/types";
import { addStarterTasks, deleteDeskTask, listDeskTasks, addDeskTask } from "./tasks";
import { missingStarterTitles, STARTER_TASKS, starterRequestId, titleKey } from "./task-text";
import { validateTaskDelete, validateTaskStarter } from "./validation";
import { retryOnboardingGhl, startOnboardingGhl } from "./onboarding";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, handoffForm, LEAD, ORIGIN, setUp, tearDown } from "./testing/harness";

// Starter tasks (Dave, Oct 4 2026): nine unassigned GoHighLevel tasks on every client that ENTERS onboarding, and an
// "Add starter tasks" button for clients already there that adds only the titles not on the list yet. And Delete on a task.
let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const ctx = { origin: ORIGIN, actor: DAVE };
const contactWrites = () => ghl.requests.filter((r) => r.method !== "GET" && (/^\/contacts\/[^/]+$/.test(r.path) || /\/tags$/.test(r.path)));

test("the starter list: nine titles, matched ignoring case and spacing, each with its own reference", () => {
  assert.equal(STARTER_TASKS.length, 9);
  assert.equal(STARTER_TASKS[5], "Client added dave@creativecowboys.co as Owner on Google Business Profile (or confirm no GBP)");
  assert.equal(titleKey("  Review   CLIENT intake "), "review client intake");
  assert.deepEqual(missingStarterTitles([{ title: "review client intake" }, { title: "GBP ACCESS VERIFIED BY STAFF" }]).length, 7);
  assert.deepEqual(missingStarterTitles(STARTER_TASKS.map((title) => ({ title }))), []);
  const ids = STARTER_TASKS.map(starterRequestId);
  assert.equal(new Set(ids).size, 9); for (const id of ids) assert.match(id, /^starter-[a-z0-9-]{4,72}$/);
  assert.equal(ids[0], "starter-review-client-intake");
});

test("Add starter tasks: the nine, unassigned, no due date, nothing written to the contact; a second press adds nothing", async () => {
  addLead(ghl);
  const r = await addStarterTasks(LEAD, DAVE);
  assert.deepEqual(r.added, [...STARTER_TASKS]); assert.deepEqual(r.skipped, []);
  assert.equal(ghl.tasks.length, 9);
  for (const t of ghl.tasks) {
    assert.equal(t.assignedTo, undefined, "unassigned: nobody gets GoHighLevel's task notice");
    assert.equal(t.dueDate, "2099-12-31T22:00:00.000Z"); assert.equal(t.completed, false);
    assert.match(t.body!, /^Added in the Back Office by Dave on [A-Z][a-z]{2} \d{1,2}, \d{4}, as a starter task for onboarding\.\nNo due date\./);
  }
  assert.deepEqual(r.tasks.items.map((t) => t.title), [...STARTER_TASKS], "listed in the order of the starter list");
  assert.ok(r.tasks.items.every((t) => t.fromDesk && t.addedBy === "Dave" && t.note === "" && t.due === ""));
  assert.equal(contactWrites().length, 0, "no field, no tag: no workflow keyed on either can start");
  assert.deepEqual((await listDeskTasks(LEAD)).items.map((t) => t.title), [...STARTER_TASKS], "a fresh read gives the same order");
  const again = await addStarterTasks(LEAD, DAVE);
  assert.deepEqual(again.added, []); assert.equal(again.skipped.length, 9); assert.equal(ghl.tasks.length, 9);
});

test("Add starter tasks on a list that already has some (any case, open or done) adds only the rest, after what is there", async () => {
  addLead(ghl);
  await addDeskTask(LEAD, { title: "logo FILES received (vector preferred)", due: "", assignee: "", requestId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", source: "onboarding" }, DAVE);
  ghl.tasks.push({ id: "taskDoneGbp000000001", contactId: LEAD, title: "GBP access verified by staff", dueDate: "2026-10-01T21:00:00.000Z", completed: true });
  const r = await addStarterTasks(LEAD, DAVE);
  assert.equal(r.added.length, 7); assert.deepEqual(r.skipped, ["Logo files received (vector preferred)", "GBP access verified by staff"]);
  assert.equal(ghl.tasks.length, 9);
  assert.equal(r.tasks.items[0].title, "logo FILES received (vector preferred)", "what was there stays first");
});

test("a client entering onboarding gets the starter tasks with the handoff; the handoff says so if they could not be added", async () => {
  addLead(ghl);
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.deepEqual(r.pending, []);
  assert.deepEqual((await listDeskTasks(LEAD)).items.map((t) => t.title), [...STARTER_TASKS]);
  assert.ok(ghl.tasks.every((t) => !t.assignedTo));
  const stored = blobJson<HandoffRecord>(`onboarding/handoffs/${LEAD}.json`);
  assert.match(String(stored?.starterTasks), /^\d{4}-\d{2}-\d{2}T/, "the record remembers they were added");
  // Pressing the same handoff again adds nothing.
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.equal(ghl.tasks.length, 9);
});

test("starter tasks that failed at handoff stay due: the handoff reports it and Retry pending steps adds them", async () => {
  addLead(ghl);
  ghl.failures.push({ match: /^POST \/contacts\/[^/]+\/tasks$/, status: 422, body: { message: ["refused"] } });
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.deepEqual(r.pending, ["starter tasks"]);
  assert.equal(ghl.tasks.length, 0, "the first task was refused, so the run stopped there");
  const retried = await retryOnboardingGhl(LEAD, DAVE);
  assert.deepEqual(retried.pending, []);
  assert.equal(ghl.tasks.length, 9);
});

test("a client already in onboarding (a record from before Oct 4 2026) never gets them on its own", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  // Make it an old record: no starterTasks mark, and no tasks on the contact.
  const key = `onboarding/handoffs/${LEAD}.json`;
  const rec = blobJson<HandoffRecord>(key)!; delete rec.starterTasks;
  blobSeed(key, rec);
  ghl.tasks = [];
  await retryOnboardingGhl(LEAD, DAVE);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.equal(ghl.tasks.length, 0);
});

test("Delete a task: one call, only a task on THIS contact, read back; nothing else written", async () => {
  addLead(ghl);
  const other = ghl.addContact({ id: "OtherContact00000001", firstName: "Someone", companyName: "Elsewhere LLC" });
  const mine = await addStarterTasks(LEAD, DAVE);
  const theirs = await addDeskTask(other.id, { title: "Not this client's", due: "", assignee: "", requestId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d", source: "client" }, DAVE);
  const target = mine.tasks.items.find((t) => t.title === "Brand colors + fonts confirmed")!;
  const r = await deleteDeskTask(LEAD, target.id);
  assert.equal(r.tasks.items.length, 8); assert.ok(!r.tasks.items.some((t) => t.id === target.id));
  assert.ok(!ghl.tasks.some((t) => t.id === target.id));
  await assert.rejects(deleteDeskTask(LEAD, theirs.task!.id), { status: 404 }, "a task on another contact cannot be deleted through this one");
  assert.ok(ghl.tasks.some((t) => t.id === theirs.task!.id));
  // GoHighLevel says yes but keeps it: an error, never shown as deleted.
  const next = r.tasks.items[0];
  ghl.failures.push({ match: /^DELETE \/contacts\/[^/]+\/tasks\//, status: 200, body: { succeded: true } });
  await assert.rejects(deleteDeskTask(LEAD, next.id), { status: 502 });
  assert.ok(ghl.tasks.some((t) => t.id === next.id));
  // A deleted starter task comes back only when someone asks again.
  const back = await addStarterTasks(LEAD, DAVE);
  assert.deepEqual(back.added, ["Brand colors + fonts confirmed"]);
  assert.equal(contactWrites().length, 0);
});

test("request checks: starter and delete", () => {
  assert.deepEqual(validateTaskStarter({ starter: true, source: "onboarding" }), { source: "onboarding" });
  for (const bad of [{ starter: false, source: "onboarding" }, { starter: true }, { starter: true, source: "x" }, { starter: true, source: "onboarding", title: "x" }]) assert.throws(() => validateTaskStarter(bad), { status: 400 }, JSON.stringify(bad));
  assert.deepEqual(validateTaskDelete({ taskId: "lJpzYrWdpkC2hX6t2yue" }), { taskId: "lJpzYrWdpkC2hX6t2yue" });
  for (const bad of [{}, { taskId: "../x" }, { taskId: "lJpzYrWdpkC2hX6t2yue", completed: true }]) assert.throws(() => validateTaskDelete(bad), { status: 400 }, JSON.stringify(bad));
});
