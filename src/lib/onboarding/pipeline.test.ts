import assert from "node:assert/strict";
import { test } from "node:test";
import { COL, STAGES } from "./config";
import { handoffColumns, joinNextAction, mapRow, splitNextAction } from "./pipeline";
import type { HandoffForm } from "./types";

const form: HandoffForm = {
  handoffId: "6f1c2a4e-3b7d-4c8e-9f01-23456789abcd", leadId: "13052279909", expectedUpdatedAt: "2026-09-24T12:00:00Z",
  business: "Test Plumbing Co", contact: "Pat", email: "pat@example.com", phone: "(770) 555-0100", website: "example.com", city: "Villa Rica",
  businessType: "Plumbing", salesOwner: "Dave", packages: ["Local Growth"], monthlyAgreed: "450", setupAgreed: "497",
  scope: "Local SEO", exclusions: "", goals: "", context: "", startDate: "", agreement: "Pending", payment: "Unknown", nextAction: "", nextOwner: "Madison", nextDue: "2026-09-30",
};

test("handoff writes the source lead id, handoff id and sales owner, and never invents Monday prices", () => {
  const cols = handoffColumns(form);
  assert.equal(cols[COL.leadId], form.leadId);
  assert.equal(cols[COL.handoffId], form.handoffId);
  assert.deepEqual(cols[COL.salesOwner], { personsAndTeams: [{ id: 39848115, kind: "person" }] });
  assert.equal(cols[COL.customMonthly], undefined, "agreed monthly lives in notes, not in the formula input");
  assert.equal(cols[COL.setup], "497");
  assert.deepEqual(cols[COL.agreement], { label: "Pending" });
  assert.ok(String(cols[COL.notes]).includes("Monthly agreed: $450"));
  assert.equal(cols[COL.nextAction], "[due 2026-09-30] Madison: send the intake link and request assets");
  assert.deepEqual(cols[COL.phone], { phone: "7705550100", countryShortName: "US" });
});

test("a lead from GoHighLevel: its contact id goes in Lead ID and in the GHL Contact link; a Monday lead gets no GHL link", () => {
  const before = process.env.GHL_LOCATION_ID; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  try {
    const cols = handoffColumns({ ...form, leadId: "ocQHyuzHvysMo5N5VsXc" });
    assert.equal(cols[COL.leadId], "ocQHyuzHvysMo5N5VsXc");
    assert.deepEqual(cols[COL.ghlContact], { url: "https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/ocQHyuzHvysMo5N5VsXc", text: "ocQHyuzHvysMo5N5VsXc" });
    assert.equal(handoffColumns(form)[COL.ghlContact], undefined);
    assert.equal(handoffColumns({ ...form, leadId: "", manual: true })[COL.ghlContact], undefined);
  } finally { if (before === undefined) delete process.env.GHL_LOCATION_ID; else process.env.GHL_LOCATION_ID = before; }
});

test("next action round-trips its due date", () => {
  assert.deepEqual(splitNextAction(joinNextAction("Call Pat", "2026-10-02")), { action: "Call Pat", due: "2026-10-02" });
  assert.deepEqual(splitNextAction("Plain text"), { action: "Plain text", due: "" });
});

test("rows map stage from the board group and compute missing + overdue", () => {
  const col = (id: string, text: string, value: string | null = null) => ({ id, text, value });
  const item = {
    id: "1", name: "Test Co", updated_at: "2026-09-24T12:00:00Z", board: { id: "18431157561" }, group: { id: STAGES[1].group, title: "2 · Onboarding" },
    column_values: [col(COL.package, "Local Growth"), col(COL.nextAction, "[due 2000-01-01] Send link"), col(COL.gbpAccess, "Requested"), col(COL.salesOwner, "Dave Collum", JSON.stringify({ personsAndTeams: [{ id: 39848115, kind: "person" }] }))],
    subitems: [{ id: "s1", name: "Intake link delivered to client", column_values: [col("status", "Done")] }, { id: "s2", name: "Logo files received (vector preferred)", column_values: [col("status", "")] }, { id: "s3", name: "Kickoff call offered", column_values: [col("status", "")] }],
  };
  const row = mapRow(item);
  assert.equal(row.stage, "collecting");
  assert.deepEqual(row.missing, ["Logo files received (vector preferred)"]);
  assert.equal(row.overdue, true);
  assert.deepEqual(row.salesOwnerIds, ["39848115"]);
  assert.throws(() => mapRow({ ...item, board: { id: "18430997894" } }), /onboarding board/);
});

test("a giveaway winner lands on Monday with the Giveaway Winner label, $0 setup, No charge and a do-not-bill note", () => {
  const cols = handoffColumns({ ...form, packages: ["Giveaway Winner", "Local Growth"], monthlyAgreed: "0", setupAgreed: "0", payment: "No charge" });
  assert.deepEqual(cols[COL.package], { labels: ["Giveaway Winner", "Local Growth"] });
  assert.deepEqual(cols[COL.payment], { label: "No charge" });
  assert.equal(cols[COL.setup], "0");
  assert.match(String(cols[COL.notes]), /^GIVEAWAY WINNER — NO CHARGE/);
});
