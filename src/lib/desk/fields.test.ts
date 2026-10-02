import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { assertOption, DESK_FIELDS, DESK_FIELD_KEYS, DESK_TAG_LIST, deskFields, deskList, deskNumber, deskText, deskWrites, ensureDeskFields, isDeskFieldName, LSE_OVERLAPS, OPTIONAL_DESK_FIELDS, REQUIRED_DESK_FIELD_KEYS, requireAllDeskFields, resolveDeskFields, STAGE_LABELS, toFieldValue } from "./fields";
import { SALES_FIELDS } from "@/lib/ghl/fields";
import { LEAD_TAGS, WON_TAG } from "@/lib/calls/ghl";
import { AGREEMENT, HEALTH, INTAKE, PAYMENT, STAGES } from "@/lib/onboarding/config";
import { CLIENT_GBP, CLIENT_GROUPS, CLIENT_HEALTH, PAY_METHOD, PAY_STATUS } from "@/lib/clients/config";
import { ALL_PACKAGE_LABELS } from "./money";
import { FakeGhl } from "./testing/fake-ghl";

// Josh's Local SEO Engine schema (creativecowboys/local-seo-engine ghl-setup/lse-schema.mjs, read Oct 1 2026).
// The desk must never share a name with any of these: several of them trigger client-facing automations.
const LSE_FIELDS = ["LSE Business Name", "LSE Business Type", "LSE Years In Business", "LSE Owner Name", "LSE Primary Phone", "LSE Public Email", "LSE Address", "LSE City", "LSE State", "LSE Zip", "LSE Service Area", "LSE Hours", "LSE Services", "LSE Top Service", "LSE Differentiators", "LSE Guarantees Licenses", "LSE Existing Website", "LSE Existing GBP URL", "LSE Social URLs", "LSE Brand Palette", "LSE Brand Notes", "LSE Brand Colors", "LSE Logo Colors", "LSE Logo URL", "LSE Photo Folder URL", "LSE Photo Count", "LSE Review Links", "LSE GBP Access", "LSE GBP Verified At", "LSE DNS Path", "LSE Domain", "LSE Registrar", "LSE Meta Partner Access", "LSE Profile Complete", "LSE Missing Items", "LSE Onboard Link", "LSE Build Week", "LSE Site Repo URL", "LSE Site Live URL", "LSE Site Live Date", "LSE Launch Loom URL", "LSE Client Subaccount ID", "LSE Tracking Number", "LSE Review Request Link", "LSE Chat Widget Installed", "LSE Keywords", "LSE Keywords Count", "LSE SA Project URL", "LSE Citations Submitted At", "LSE Base GBP Calls 90d", "LSE Base GBP Directions 90d", "LSE Base GBP Site Clicks 90d", "LSE Base Review Count", "LSE Base Review Rating", "LSE Base Avg Rank", "LSE Baseline Captured At", "LSE M GBP Calls", "LSE M GBP Directions", "LSE M GBP Site Clicks", "LSE M Tracked Calls", "LSE M Forms", "LSE M Reviews Gained", "LSE M Avg Rank", "LSE M Posts Published", "LSE Total Reviews", "LSE Adjacent City", "LSE Report URL", "LSE Last Report Sent", "LSE Plan", "LSE Term Start", "LSE Term End", "LSE Acquisition Source", "LSE Active Addons", "LSE Next Offer", "LSE Update Card Link", "LSE Prior Stage", "LSE Health", "LSE Health Reason", "LSE Last Client Reply", "LSE Review Requests 30d", "LSE Reports Unopened"];
const LSE_TAGS = ["lse:client", "lse:onboarding-overdue", "lse:build-overdue", "lse:baseline-missing", "lse:red", "lse:payment-failed", "lse:renewal-window", "lse:cancel-request", "lse:addon-lead-tracking", "lse:addon-google-ads", "lse:addon-ai-agent", "lse:addon-seo-pro", "lse:addon-social-ads", "lse:addon-extended-reach", "lse:addon-crm"];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

let ghl: FakeGhl;
beforeEach(() => { ghl = new FakeGhl().install(); });
afterEach(() => { ghl.restore(); });

test("every desk field is named \"Desk …\", is unique, and collides with no LSE or sales field", () => {
  const names = DESK_FIELD_KEYS.map((k) => DESK_FIELDS[k].name);
  assert.equal(new Set(names.map(norm)).size, names.length, "unique");
  for (const name of names) {
    assert.ok(isDeskFieldName(name), name);
    assert.ok(!LSE_FIELDS.some((l) => norm(l) === norm(name)), `${name} collides with an LSE field`);
    assert.ok(!Object.values(SALES_FIELDS).some((s) => norm(s.name) === norm(name)), `${name} collides with a sales field`);
    assert.ok(!norm(name).startsWith("lse"), name);
  }
  assert.equal(names.length, 44);
  assert.equal(isDeskFieldName("LSE Health"), false); assert.equal(isDeskFieldName("desk notes"), true); assert.equal(isDeskFieldName("Desktop"), false);
});
test("desk tags are the desk's own: never an lse: tag, never one of the lead-intake tags", () => {
  assert.deepEqual([...DESK_TAG_LIST], ["desk-onboarding", "desk-client", "monday-import"]);
  for (const tag of DESK_TAG_LIST) { assert.ok(!tag.startsWith("lse:")); assert.ok(!LSE_TAGS.includes(tag)); assert.ok(!(LEAD_TAGS as readonly string[]).includes(tag)); assert.notEqual(tag, WON_TAG); }
  assert.ok(LSE_OVERLAPS.length >= 10, "every look-alike is written down for Dave and Josh");
});
test("option lists are the desk's labels, byte for byte", () => {
  const o = (k: keyof typeof DESK_FIELDS) => DESK_FIELDS[k].options;
  assert.deepEqual(o("obStage"), STAGES.map((s) => s.label)); assert.deepEqual(STAGE_LABELS, ["New handoff", "Collecting assets / access", "Ready for production", "In progress", "Launched", "Waiting / on hold"]);
  assert.deepEqual(o("clientStatus"), CLIENT_GROUPS.map((g) => g.label));
  assert.deepEqual(o("obHealth"), [...HEALTH]); assert.deepEqual(o("clientHealth"), [...CLIENT_HEALTH]);
  assert.deepEqual(o("agreement"), [...AGREEMENT]); assert.deepEqual(o("obPayment"), [...PAYMENT]); assert.deepEqual(o("intake"), [...INTAKE]);
  assert.deepEqual(o("payStatus"), [...PAY_STATUS]); assert.deepEqual(o("payMethod"), [...PAY_METHOD]); assert.deepEqual(o("gbpAccess"), [...CLIENT_GBP]);
  assert.deepEqual(o("packages"), [...ALL_PACKAGE_LABELS]);
  assert.ok(o("packages")!.includes("Local Growth — First Year $297"), "the label Dave has not renamed yet stays exactly as it is");
});

test("definitions resolve by field key, then by name; nothing else on the location is picked up", () => {
  ghl.addLseFields().addAllFields();
  const fields = resolveDeskFields(ghl.defs);
  assert.equal(Object.keys(fields).length, 44);
  assert.equal(fields.obStage!.id, ghl.fieldId("Desk Onboarding Stage")); assert.deepEqual(fields.obStage!.options, STAGE_LABELS);
  assert.doesNotThrow(() => requireAllDeskFields(fields));
  const renamed = resolveDeskFields([{ id: "x1", name: "desk  onboarding stage", dataType: "SINGLE_OPTIONS" }, { id: "x2", name: "Totally different", fieldKey: "contact.desk_client_status", dataType: "SINGLE_OPTIONS" }]);
  assert.equal(renamed.obStage!.id, "x1"); assert.equal(renamed.clientStatus!.id, "x2");
  assert.throws(() => requireAllDeskFields(renamed), { status: 503 });
  assert.equal(resolveDeskFields([{ id: "h", name: "LSE Health", fieldKey: "contact.lse_health", dataType: "SINGLE_OPTIONS" }]).clientHealth, undefined);
});
test("setup is a dry run by default, creates only what is missing, and never edits an existing field", async () => {
  ghl.addLseFields();
  ghl.addField("Desk Notes", "LARGE_TEXT"); ghl.addField("Desk Agreement", "SINGLE_OPTIONS", ["Unknown", "Signed"]);
  const dry = await ensureDeskFields();
  assert.equal(dry.dryRun, true); assert.equal(dry.missing.length, 42); assert.equal(dry.present.length, 2); assert.equal(ghl.writes().length, 0);
  assert.deepEqual(dry.present.find((p) => p.key === "agreement")!.missingOptions, ["Pending", "Not required"], "an existing field's missing options are reported, not changed");
  const real = await ensureDeskFields(false, 0);
  assert.equal(real.created.length, 42); assert.equal(real.failed.length, 0);
  const posts = ghl.writes();
  assert.equal(posts.length, 42);
  assert.ok(posts.every((r) => r.method === "POST" && /\/customFields$/.test(r.path) && isDeskFieldName(String((r.body as { name: string }).name)) && (r.body as { model: string }).model === "contact"));
  const again = await ensureDeskFields(false, 0);
  assert.equal(again.created.length, 0); assert.equal(again.present.length, 44);
  assert.doesNotThrow(async () => requireAllDeskFields(await deskFields(true)));
});
test("a field added after the cutover is optional: the live desk keeps working until setup creates it, and setup creates exactly that one", async () => {
  // GoHighLevel as it was on Oct 2 2026: the 43 fields the cutover created, and no "Desk Legacy Client" yet.
  assert.deepEqual([...OPTIONAL_DESK_FIELDS], ["legacy"]); assert.equal(REQUIRED_DESK_FIELD_KEYS.length, 43); assert.ok(!REQUIRED_DESK_FIELD_KEYS.includes("legacy"));
  assert.deepEqual(DESK_FIELDS.legacy, { name: "Desk Legacy Client", dataType: "SINGLE_OPTIONS", options: ["Yes", "No"], position: 354 });
  for (const key of REQUIRED_DESK_FIELD_KEYS) ghl.addField(DESK_FIELDS[key].name, DESK_FIELDS[key].dataType, DESK_FIELDS[key].options);
  const fields = await deskFields(true);
  assert.equal(fields.legacy, undefined);
  assert.doesNotThrow(() => requireAllDeskFields(fields), "every desk route still passes its all-fields check");
  assert.equal(deskText(ghl.addContact({ fields: { "Desk Client Status": "Active" } }), fields, "legacy"), "", "a read of the missing field is simply blank");
  assert.throws(() => deskWrites(fields, { legacy: "Yes" }), (e: Error & { status?: number }) => e.status === 503 && /"Desk Legacy Client" does not exist yet/.test(e.message), "only a write to that one field asks for it, by name");
  assert.doesNotThrow(() => deskWrites(fields, { clientHealth: "Green" }));
  // The setup call finds exactly one field missing and creates it; nothing that exists is touched.
  const dry = await ensureDeskFields();
  assert.deepEqual(dry.missing.map((m) => [m.name, m.dataType, m.options]), [["Desk Legacy Client", "SINGLE_OPTIONS", ["Yes", "No"]]]); assert.equal(dry.present.length, 43); assert.equal(ghl.writes().length, 0);
  const real = await ensureDeskFields(false, 0);
  assert.deepEqual(real.created.map((c) => c.name), ["Desk Legacy Client"]); assert.equal(ghl.writes().length, 1);
  assert.deepEqual((await deskFields(true)).legacy!.options, ["Yes", "No"]);
});

test("values are shaped by the field's live type; empty clears", () => {
  const f = (dataType: string) => ({ id: "x", name: "Desk X", dataType, options: [] });
  assert.deepEqual(toFieldValue(f("MULTIPLE_OPTIONS"), ["Local Growth", "Social Ads $1,200"]), ["Local Growth", "Social Ads $1,200"]);
  assert.deepEqual(toFieldValue(f("MULTIPLE_OPTIONS"), ""), []); assert.deepEqual(toFieldValue(f("CHECKBOX"), "Yes"), ["Yes"]);
  assert.equal(toFieldValue(f("LARGE_TEXT"), ["Local Growth", "Social Ads $1,200"]), "Local Growth, Social Ads $1,200", "a packages field recreated as text still works");
  assert.equal(toFieldValue(f("MONETORY"), "297.50"), 297.5); assert.equal(toFieldValue(f("NUMERICAL"), 15), 15); assert.equal(toFieldValue(f("NUMERICAL"), ""), ""); assert.equal(toFieldValue(f("MONETORY"), "abc"), "");
  assert.equal(toFieldValue(f("DATE"), "2026-10-01"), "2026-10-01"); assert.equal(toFieldValue(f("SINGLE_OPTIONS"), null), ""); assert.equal(toFieldValue(f("TEXT"), 5), "5");
});
test("reads: text, list (real list or comma-joined), number", () => {
  ghl.addAllFields();
  const fields = resolveDeskFields(ghl.defs);
  const c = ghl.addContact({ fields: { "Desk Packages": ["Local Growth", "Social Ads $1,200"], "Desk Custom Monthly": 150, "Desk Notes": "line one\nline two", "Desk Billing Day": "15" } });
  assert.equal(deskText(c, fields, "packages"), "Local Growth, Social Ads $1,200"); assert.deepEqual(deskList(c, fields, "packages"), ["Local Growth", "Social Ads $1,200"]);
  assert.equal(deskNumber(c, fields, "customMonthly"), "150"); assert.equal(deskNumber(c, fields, "billingDay"), "15"); assert.equal(deskNumber(c, fields, "setup"), "");
  assert.equal(deskText(c, fields, "notes"), "line one\nline two"); assert.equal(deskText(c, fields, "obStage"), "");
  const asText = ghl.addContact({ fields: { "Desk Packages": "Giveaway Winner, Google Ads $1,500" } });
  assert.deepEqual(deskList(asText, fields, "packages"), ["Giveaway Winner", "Google Ads $1,500"]);
  assert.deepEqual(deskList(ghl.addContact({}), fields, "packages"), []);
});
test("writes go to desk fields only, and a single-select value must be an option GoHighLevel has", () => {
  ghl.addLseFields().addAllFields();
  const fields = resolveDeskFields(ghl.defs);
  const writes = deskWrites(fields, { obStage: "New handoff", packages: ["Local Growth"], setup: "497", nextDue: "", notes: undefined });
  assert.deepEqual(writes, [{ id: ghl.fieldId("Desk Onboarding Stage"), field_value: "New handoff" }, { id: ghl.fieldId("Desk Packages"), field_value: ["Local Growth"] }, { id: ghl.fieldId("Desk Setup Amount"), field_value: 497 }, { id: ghl.fieldId("Desk Next Action Due"), field_value: "" }]);
  assert.throws(() => deskWrites({ ...fields, obHealth: { id: ghl.fieldId("LSE Health"), name: "LSE Health", dataType: "SINGLE_OPTIONS", options: [] } }, { obHealth: "On Track" }), { status: 500 }, "a field that is not named Desk … is refused even if something resolved to it");
  assert.throws(() => deskWrites({}, { obStage: "New handoff" }), { status: 503 });
  assert.doesNotThrow(() => assertOption(fields, "obHealth", "On Track")); assert.doesNotThrow(() => assertOption(fields, "obHealth", ""));
  assert.throws(() => assertOption(fields, "obHealth", "Purple"), { status: 409 });
});
