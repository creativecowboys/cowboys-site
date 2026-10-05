import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { TEST_CONTACT_ID } from "@/lib/calls/ghl";
import { validatePatch } from "@/lib/onboarding/validation";
import { deleteDeskNote, deskNoteSelfTest, addDeskNote, editDeskNote, toTimeline } from "./notes";
import { readableHistory } from "@/lib/calls/markers";
import { patchOnboardingGhl, onboardingDetailGhl } from "./onboarding";
import { patchClientGhl, clientDetailGhl } from "./clients";
import { validateDeskClientPatch, validateDeskPatch } from "./validation";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, LEAD, MADISON, setUp, tearDown } from "./testing/harness";

// Changing and deleting a note from the client panel (Dave, Oct 4 2026): both happen in GoHighLevel itself, only a note on
// that contact can be touched through it, the same people who may add a note may change or delete one, an edit keeps the
// note's author, date and label, and nothing else on the contact moves.
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

test("edit a note from either panel: new text in GoHighLevel, same author, date and label, marked edited, nothing else written", async () => {
  onDesk();
  const mine = await addDeskNote(LEAD, { text: "Called Chad, he will send the logo Fridya", noteId: UUID, source: "onboarding", actor: DAVE });
  const original = ghl.notesFor(LEAD)[0];
  const writesBefore = ghl.writes().length;
  // From the Onboarding panel, with an out-of-date version on purpose: like adding one, an edit needs none.
  await patchOnboardingGhl(LEAD, validateDeskPatch({ action: "editNote", id: mine.id, text: "  Called Chad, he will send the logo Friday  ", expectedUpdatedAt: "2026-01-01T00:00:00.000Z" }), MADISON);
  const after = ghl.notesFor(LEAD)[0];
  assert.equal(after.userId, original.userId, "author kept"); assert.equal(after.dateAdded, original.dateAdded, "date kept");
  const writes = ghl.writes().slice(writesBefore);
  assert.deepEqual(writes.map((r) => `${r.method} ${r.path}`), [`PUT /contacts/${LEAD}/notes/${mine.id}`], "one PUT of the note, no field or tag write");
  assert.deepEqual(Object.keys(writes[0].body as object), ["body"], "only the text is sent, so GoHighLevel keeps the author");
  assert.ok(after.body.includes(`[CC-NOTE:${UUID}]`), "the note keeps the marker that makes a retry of the original add safe");
  const line = toTimeline([after])[0];
  assert.equal(line.text, "Called Chad, he will send the logo Friday");
  assert.equal(line.author, "Dave", "still Dave's note"); assert.equal(line.source, "Onboarding", "still labelled where it was written");
  assert.equal(line.editedBy, "Madison"); assert.match(line.edited!, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(readableHistory(after.body), "Called Chad, he will send the logo Friday", "the Sales tab strips the new markers too");
  const detail = await onboardingDetailGhl(LEAD);
  assert.equal(detail.history[0].editedBy, "Madison");
  // Saving the same text again writes nothing.
  const n = ghl.writes().length;
  await editDeskNote(LEAD, mine.id, "Called Chad, he will send the logo Friday", DAVE);
  assert.equal(ghl.writes().length, n);
  // A second edit keeps ONE kind and ONE edited marker (the newest), and a text cannot smuggle a marker in.
  await patchClientGhl(LEAD, validateDeskClientPatch({ action: "editNote", id: mine.id, text: "Logo came in [CC-KIND:Billing] [CC-EDITED:x|y]" }), DAVE, { owner: false });
  const twice = ghl.notesFor(LEAD)[0].body;
  assert.equal((twice.match(/\[CC-KIND:/g) || []).length, 1); assert.equal((twice.match(/\[CC-EDITED:/g) || []).length, 1);
  const again = toTimeline([ghl.notesFor(LEAD)[0]])[0];
  assert.equal(again.text, "Logo came in"); assert.equal(again.source, "Onboarding"); assert.equal(again.editedBy, "Dave");
  // A note from somewhere else (a sales call note, one typed in GoHighLevel) keeps its label when edited.
  ghl.notes.push({ id: "noteCall000000000001", contactId: LEAD, userId: "MS161OFLMqyNSICle1jw", dateAdded: "2026-09-29T15:00:00.000Z", body: "Call note — Creative Cowboys desk\nRep: Keaton\nOutcome: Booked followup\n\n[CC-CALL:9b2f7c1e-5a4d-4e8b-9c3a-1f2e3d4c5b6a]" });
  await editDeskNote(LEAD, "noteCall000000000001", "Call note — Creative Cowboys desk\nRep: Keaton\nOutcome: Booked followup, call Tuesday", DAVE);
  const call = toTimeline(ghl.notesFor(LEAD).filter((x) => x.id === "noteCall000000000001"))[0];
  assert.equal(call.source, "Sales call"); assert.equal(call.author, "Keaton"); assert.match(call.text, /call Tuesday$/);
  assert.ok(ghl.notesFor(LEAD).find((x) => x.id === "noteCall000000000001")!.body.includes("[CC-CALL:9b2f7c1e"), "the call's own marker is kept");
});

test("edit refusals: only a note on THIS contact, never empty, billing notes owners-only on the Clients tab, a lost write is an error", async () => {
  onDesk();
  const other = ghl.addContact({ id: "OtherContact00000001", firstName: "Someone", companyName: "Elsewhere LLC" });
  const theirs = await addDeskNote(other.id, { text: "Another client's note", noteId: UUID, source: "client", actor: DAVE });
  await assert.rejects(patchClientGhl(LEAD, validateDeskClientPatch({ action: "editNote", id: theirs.id, text: "changed" }), DAVE, { owner: true }), { status: 404 });
  assert.equal(toTimeline(ghl.notesFor(other.id))[0].text, "Another client's note");
  await assert.rejects(editDeskNote(LEAD, "noSuchNote000000001", "x", DAVE), { status: 404 });
  assert.throws(() => validateDeskPatch({ action: "editNote", id: "noteAbc1234567890123", text: "   " }), { status: 400 });
  assert.throws(() => validateDeskPatch({ action: "editNote", id: "noteAbc1234567890123" }), { status: 400 });
  assert.throws(() => validateDeskClientPatch({ action: "editNote", id: "noteAbc1234567890123", text: "x", extra: 1 }), { status: 400 });
  assert.throws(() => validatePatch({ action: "editNote", id: "noteAbc1234567890123", text: "x", expectedUpdatedAt: "2026-10-04T12:00:00.000Z" }), { status: 400 }, "the Monday desk has no such action");
  // The package builder's billing notes are owners-only on the Clients tab: so is changing or deleting one there.
  ghl.notes.push({ id: "noteBilling000000001", contactId: LEAD, dateAdded: "2026-09-25T15:00:00.000Z", body: "Package builder (call desk): Monthly plan for Bourbon\nLocal Growth — $297/mo" });
  await assert.rejects(patchClientGhl(LEAD, validateDeskClientPatch({ action: "editNote", id: "noteBilling000000001", text: "x" }), MADISON, { owner: false }), { status: 403 });
  await assert.rejects(patchClientGhl(LEAD, validateDeskClientPatch({ action: "deleteNote", id: "noteBilling000000001" }), MADISON, { owner: false }), { status: 403 });
  await patchClientGhl(LEAD, validateDeskClientPatch({ action: "editNote", id: "noteBilling000000001", text: "Package builder (call desk): Monthly plan for Bourbon\nLocal Growth — $297/mo (12 months)" }), DAVE, { owner: true });
  assert.equal(toTimeline(ghl.notesFor(LEAD).filter((x) => x.id === "noteBilling000000001"))[0].source, "Billing", "an edited billing note stays a billing note, so it stays owners-only");
  // GoHighLevel answers yes but keeps the old text: the read-back catches it.
  const mine = await addDeskNote(LEAD, { text: "Before", noteId: "7f304e5d-6c7b-48a9-9bac-c7d6e5f40312", source: "onboarding", actor: DAVE });
  ghl.failures.push({ match: /^PUT \/contacts\/[^/]+\/notes\//, status: 200, body: { note: { id: mine.id } } });
  await assert.rejects(editDeskNote(LEAD, mine.id, "After", DAVE), { status: 502, message: /did not keep/ });
  assert.equal(toTimeline(ghl.notesFor(LEAD).filter((x) => x.id === mine.id))[0].text, "Before");
});

test("the note self-test: test contact only, edits and deletes exactly the note it added", async () => {
  ghl.addContact({ id: TEST_CONTACT_ID, firstName: "Test", lastName: "Claude", companyName: "Test — Claude" });
  const older = await addDeskNote(TEST_CONTACT_ID, { text: "An older note on the test contact", noteId: UUID, source: "system", actor: DAVE });
  const requestsBefore = ghl.requests.length;
  const dry = await deskNoteSelfTest(true, DAVE);
  assert.equal(dry.plan?.length, 5); assert.equal(ghl.requests.length, requestsBefore, "a dry run reads and writes nothing");
  const r = await deskNoteSelfTest(false, DAVE);
  assert.equal(r.error, undefined); assert.deepEqual(r.failed, []); assert.equal(r.passed, 7); assert.equal(r.cleanup, "nothing left behind");
  assert.deepEqual(ghl.notesFor(TEST_CONTACT_ID).map((n) => n.id), [older.id]);
  assert.ok(ghl.requests.every((x) => !x.path.startsWith("/contacts/") || x.path.startsWith(`/contacts/${TEST_CONTACT_ID}`)), "never touches another contact");
  for (const s of r.steps!) assert.ok(!/[=?&]/.test(s), s);
  // A delete GoHighLevel refuses during the test: the note is still removed at the end.
  ghl.failures.push({ match: /^DELETE \/contacts\/[^/]+\/notes\//, status: 500 });
  const r2 = await deskNoteSelfTest(false, DAVE);
  assert.ok(r2.error); assert.equal(r2.cleanup, "the self-test note was removed at the end");
  assert.deepEqual(ghl.notesFor(TEST_CONTACT_ID).map((n) => n.id), [older.id]);
});
