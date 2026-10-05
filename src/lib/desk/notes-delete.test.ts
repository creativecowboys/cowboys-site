import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { validatePatch } from "@/lib/onboarding/validation";
import { deleteDeskNote, deskNoteSelfTest, addDeskNote } from "./notes";
import { patchOnboardingGhl, onboardingDetailGhl } from "./onboarding";
import { patchClientGhl, clientDetailGhl } from "./clients";
import { validateDeskClientPatch, validateDeskPatch } from "./validation";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, LEAD, MADISON, setUp, tearDown } from "./testing/harness";

// Deleting a note from the client panel (Dave, Oct 4 2026): the note is deleted in GoHighLevel itself, only a note on that
// contact can be deleted through it, the same people who may add a note may delete one, and nothing else on the contact moves.
let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const onDesk = () => addLead(ghl, { tags: ["giveaway-entrant", "sales-lead", "desk-onboarding", "desk-client"], fields: { "Desk Onboarding Stage": "New handoff", "Desk Client Status": "Active" } });
const UUID = "5d1e2c3b-4a59-4687-8796-a5b4c3d2e1f0";

test("delete a note from either panel: gone in GoHighLevel, nothing else written, no record version needed", async () => {
  onDesk();
  const a = await addDeskNote(LEAD, { text: "Wrong client, delete me", noteId: UUID, source: "onboarding", actor: DAVE });
  const b = await addDeskNote(LEAD, { text: "Keep this one", noteId: "6e2f3d4c-5b6a-4798-8a9b-b6c5d4e3f201", source: "client", actor: MADISON });
  const writesBefore = ghl.writes().length;
  // From the Onboarding panel, with a version that is out of date on purpose: a delete, like an add, does not need one.
  const row = await patchOnboardingGhl(LEAD, validateDeskPatch({ action: "deleteNote", id: a.id, expectedUpdatedAt: "2026-01-01T00:00:00.000Z" }), DAVE);
  assert.equal(row.id, LEAD);
  assert.deepEqual(ghl.notesFor(LEAD).map((n) => n.id), [b.id]);
  const deletes = ghl.writes().slice(writesBefore);
  assert.deepEqual(deletes.map((r) => `${r.method} ${r.path}`), [`DELETE /contacts/${LEAD}/notes/${a.id}`], "one DELETE, no field or tag write");
  assert.ok(!(await onboardingDetailGhl(LEAD)).history.some((h) => h.id === a.id));
  // From the Clients panel.
  await patchClientGhl(LEAD, validateDeskClientPatch({ action: "deleteNote", id: b.id }), MADISON);
  assert.deepEqual(ghl.notesFor(LEAD), []);
  assert.deepEqual((await clientDetailGhl(LEAD, false)).history, []);
});

test("only a note on THIS contact, and a delete that did not happen is never shown as done", async () => {
  onDesk();
  const other = ghl.addContact({ id: "OtherContact00000001", firstName: "Someone", companyName: "Elsewhere LLC" });
  const theirs = await addDeskNote(other.id, { text: "Another client's note", noteId: UUID, source: "client", actor: DAVE });
  await assert.rejects(patchOnboardingGhl(LEAD, validateDeskPatch({ action: "deleteNote", id: theirs.id }), DAVE), { status: 404 });
  assert.equal(ghl.notesFor(other.id).length, 1, "a note on another contact cannot be deleted through this one");
  await assert.rejects(deleteDeskNote(LEAD, "noSuchNote000000001"), { status: 404 });
  const mine = await addDeskNote(LEAD, { text: "Mine", noteId: "7f304e5d-6c7b-48a9-9bac-c7d6e5f40312", source: "onboarding", actor: DAVE });
  // GoHighLevel refuses: an error, and the note is still there.
  ghl.failures.push({ match: /^DELETE \/contacts\/[^/]+\/notes\//, status: 500 });
  await assert.rejects(deleteDeskNote(LEAD, mine.id), { status: 502 });
  assert.equal(ghl.notesFor(LEAD).length, 1);
  // GoHighLevel says yes but keeps it: the read-back catches it.
  ghl.failures.push({ match: /^DELETE \/contacts\/[^/]+\/notes\//, status: 200, body: { succeded: true } });
  await assert.rejects(deleteDeskNote(LEAD, mine.id), { status: 502, message: /did not delete/ });
  assert.equal(ghl.notesFor(LEAD).length, 1);
  await deleteDeskNote(LEAD, mine.id);
  assert.equal(ghl.notesFor(LEAD).length, 0);
});

test("request checks: deleteNote needs a note id and nothing else; the Monday desk has no such action", () => {
  assert.deepEqual(validateDeskPatch({ action: "deleteNote", id: "noteAbc1234567890123" }), { action: "deleteNote", id: "noteAbc1234567890123", expectedUpdatedAt: "" });
  assert.deepEqual(validateDeskClientPatch({ action: "deleteNote", id: "noteAbc1234567890123", expectedUpdatedAt: "2026-10-04T12:00:00.000Z" }).action, "deleteNote");
  for (const bad of [{ action: "deleteNote" }, { action: "deleteNote", id: "../../x" }, { action: "deleteNote", id: "noteAbc1234567890123", text: "x" }, { action: "deleteNote", id: 5 }]) {
    assert.throws(() => validateDeskPatch(bad), { status: 400 }, JSON.stringify(bad));
    assert.throws(() => validateDeskClientPatch(bad), { status: 400 }, JSON.stringify(bad));
  }
  assert.throws(() => validatePatch({ action: "deleteNote", id: "noteAbc1234567890123", expectedUpdatedAt: "2026-10-04T12:00:00.000Z" }), { status: 400 });
});

test("the note-delete self-test: test contact only, deletes exactly the note it added", async () => {
  ghl.addContact({ id: TEST_CONTACT_ID, firstName: "Test", lastName: "Claude", companyName: "Test — Claude" });
  const older = await addDeskNote(TEST_CONTACT_ID, { text: "An older note on the test contact", noteId: UUID, source: "system", actor: DAVE });
  const requestsBefore = ghl.requests.length;
  const dry = await deskNoteSelfTest(true, DAVE);
  assert.equal(dry.plan?.length, 4); assert.equal(ghl.requests.length, requestsBefore, "a dry run reads and writes nothing");
  const r = await deskNoteSelfTest(false, DAVE);
  assert.equal(r.error, undefined); assert.deepEqual(r.failed, []); assert.equal(r.passed, 4); assert.equal(r.cleanup, "nothing left behind");
  assert.deepEqual(ghl.notesFor(TEST_CONTACT_ID).map((n) => n.id), [older.id]);
  assert.ok(ghl.requests.every((x) => !x.path.startsWith("/contacts/") || x.path.startsWith(`/contacts/${TEST_CONTACT_ID}`)), "never touches another contact");
  for (const s of r.steps!) assert.ok(!/[=?&]/.test(s), s);
  // A delete GoHighLevel refuses during the test: the note is still removed at the end.
  ghl.failures.push({ match: /^DELETE \/contacts\/[^/]+\/notes\//, status: 500 });
  const r2 = await deskNoteSelfTest(false, DAVE);
  assert.ok(r2.error); assert.equal(r2.cleanup, "the self-test note was removed at the end");
  assert.deepEqual(ghl.notesFor(TEST_CONTACT_ID).map((n) => n.id), [older.id]);
});
