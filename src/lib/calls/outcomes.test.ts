import assert from "node:assert/strict";
import { test } from "node:test";
import { CALL_OUTCOMES, isCallOutcome, mondayOutcome, outreachStatus } from "./outcomes";
import { OUTREACH_OPTIONS, WRITTEN_OPTIONS } from "@/lib/ghl/fields";

// The Outreach Status labels on the Monday Giveaway Leads board, read off the board on Oct 1 2026. The board has been frozen
// since the desk moved to GoHighLevel: the rollback path may set one of these, and must never write a label outside the list.
const MONDAY_BOARD_LABELS = ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won"];

test("the wrap-up step offers five outcomes, with In progress first because it is the common case", () => {
  assert.deepEqual([...CALL_OUTCOMES], ["In progress", "No answer / left voicemail", "Booked followup", "Not interested", "Bad contact number"]);
  assert.equal(new Set(CALL_OUTCOMES).size, CALL_OUTCOMES.length);
});
test("only the five outcomes are outcomes: statuses set by hand, retired outcomes and near spellings are not", () => {
  for (const outcome of CALL_OUTCOMES) assert.equal(isCallOutcome(outcome), true);
  for (const not of ["", "in progress", "In Progress", "Contacted", "Call Held", "Call Booked", "Not Interested", "Won", "Replied"]) assert.equal(isCallOutcome(not), false, `"${not}" is not offered`);
});
test("GoHighLevel: each outcome sets a status the Outreach Status catalog has, in the outcome's own words", () => {
  assert.deepEqual(CALL_OUTCOMES.map(outreachStatus), ["In progress", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number"]);
  for (const outcome of CALL_OUTCOMES) assert.ok((OUTREACH_OPTIONS as readonly string[]).includes(outreachStatus(outcome)), `${outreachStatus(outcome)} is an option a freshly created field has`);
  // ...and each is on the list of options the setup's option step adds to a live field that lacks it (plus Won, which a handoff writes).
  assert.deepEqual([...WRITTEN_OPTIONS.outreach].sort(), [...CALL_OUTCOMES.map(outreachStatus), "Won"].sort());
});
test("Monday (the rollback path): no outcome writes a label the frozen board lacks; In progress is recorded as Contacted", () => {
  assert.equal(mondayOutcome("In progress"), "Contacted");
  assert.deepEqual(CALL_OUTCOMES.map(mondayOutcome), ["Contacted", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number"]);
  for (const outcome of CALL_OUTCOMES) assert.ok(MONDAY_BOARD_LABELS.includes(mondayOutcome(outcome)), `${mondayOutcome(outcome)} already exists on the board`);
  assert.equal(MONDAY_BOARD_LABELS.includes("In progress"), false); // and the catalog's own In progress is not one of them
  // Apart from In progress the two systems get the same words.
  for (const outcome of CALL_OUTCOMES.filter((o) => o !== "In progress")) assert.equal(mondayOutcome(outcome), outreachStatus(outcome));
});
