import assert from "node:assert/strict";
import { test } from "node:test";
import { safeFilename, validateHandoff, validateIntakeForm, validatePatch, validateToken } from "./validation";

const good = () => ({
  handoffId: "6f1c2a4e-3b7d-4c8e-9f01-23456789abcd", leadId: "13052279909", expectedUpdatedAt: "2026-09-24T12:00:00Z",
  business: "Test Plumbing Co", contact: "Pat Example", email: "pat@example.com", phone: "770-555-0100", website: "example.com", city: "Villa Rica, GA",
  businessType: "Plumbing", salesOwner: "Keaton", packages: ["Local Growth — First Year $297"], monthlyAgreed: "297", setupAgreed: "",
  scope: "Local Growth for plumbing in Villa Rica", exclusions: "", goals: "", context: "", startDate: "2026-10-01", agreement: "Unknown", payment: "Unknown",
  nextAction: "", nextOwner: "Madison", nextDue: "",
});

test("a complete handoff validates and dedupes packages", () => {
  const form = validateHandoff({ ...good(), packages: ["Local Growth", "Local Growth"] });
  assert.deepEqual(form.packages, ["Local Growth"]);
  assert.equal(form.agreement, "Unknown");
});

test("handoff refuses invented or malformed money, unknown packages and missing scope", () => {
  assert.throws(() => validateHandoff({ ...good(), monthlyAgreed: "about 300" }), /agreed amounts/);
  assert.throws(() => validateHandoff({ ...good(), packages: ["Free website"] }), /pricing list/);
  assert.throws(() => validateHandoff({ ...good(), scope: "" }), /scope/);
  assert.throws(() => validateHandoff({ ...good(), agreement: "Signed and paid" }), /agreement/);
  assert.throws(() => validateHandoff({ ...good(), extra: "x" }), /Unexpected/);
  assert.throws(() => validateHandoff({ ...good(), handoffId: "not-a-uuid" }), /handoff reference/);
  assert.throws(() => validateHandoff(good(), "999"), /does not match/);
});

test("patch actions are closed-world and carry the record version", () => {
  const v = "2026-09-24T12:00:00Z";
  assert.equal(validatePatch({ action: "stage", stage: "collecting", expectedUpdatedAt: v }).action, "stage");
  assert.throws(() => validatePatch({ action: "stage", stage: "template", expectedUpdatedAt: v }), /valid stage/);
  assert.throws(() => validatePatch({ action: "owner", ownerId: "424242", expectedUpdatedAt: v }), /Monday seat/);
  assert.throws(() => validatePatch({ action: "delete", expectedUpdatedAt: v }), /Unknown/);
  assert.throws(() => validatePatch({ action: "note", text: "hi" }), /Reload/);
  assert.throws(() => validatePatch({ action: "checklist", subitemId: "abc", status: "Done", expectedUpdatedAt: v }), /checklist item/);
  const gbp = validatePatch({ action: "gbp", value: "Verified", expectedUpdatedAt: v });
  assert.equal(gbp.action === "gbp" && gbp.value, "Verified");
});

test("client intake form is bounded and boolean-safe", () => {
  const form = validateIntakeForm({ business: "X", gbpInviteSent: true });
  assert.equal(form.gbpInviteSent, true);
  assert.equal(form.gbpNoProfile, false);
  assert.throws(() => validateIntakeForm({ business: "X", price: "1" }), /Unexpected/);
  assert.throws(() => validateIntakeForm({ gbpInviteSent: "yes" }), /Invalid/);
  assert.throws(() => validateIntakeForm({ email: "nope" }), /email/);
});

test("tokens and filenames are constrained", () => {
  assert.throws(() => validateToken("short"), /not valid/);
  assert.equal(validateToken("a".repeat(43)), "a".repeat(43));
  assert.equal(safeFilename("../../etc/passwd"), "passwd");
  assert.equal(safeFilename("My Logo (final).svg"), "My Logo (final).svg");
  assert.equal(safeFilename(""), "file");
});
