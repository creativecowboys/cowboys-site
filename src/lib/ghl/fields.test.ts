import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { forgetCustomFields } from "./client";
import { ensureSalesFields, LEAD_SOURCE_OPTIONS, leadSourceOptions, matchField, OUTREACH_OPTIONS, requireField, resolveFromDefs, SALES_FIELDS } from "./fields";

type Req = { method: string; path: string; body: unknown };
let requests: Req[];
let queue: { status: number; body: unknown }[];
const originalFetch = global.fetch;
beforeEach(() => {
  requests = []; queue = []; forgetCustomFields();
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ method: init?.method || "GET", path: String(url).replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${url}`);
    return new Response(JSON.stringify(next.body), { status: next.status });
  }) as typeof fetch;
});
afterEach(() => { global.fetch = originalFetch; });

const defs = [
  { id: "ls", name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Facebook", "Big Giveaway 2"] },
  { id: "os", name: "outreach status", fieldKey: "contact.outreach_status", dataType: "SINGLE_OPTIONS", picklistOptions: [...OUTREACH_OPTIONS] },
  { id: "as", name: "Audit Score", fieldKey: "contact.audit_score", dataType: "NUMERICAL" },
  { id: "ar", name: "Audit Report URL", fieldKey: "contact.audit_report_url", dataType: "TEXT" },
  { id: "nf", name: "Next Follow-up", fieldKey: "contact.next_followup", dataType: "DATE" },
];
test("definitions resolve by field key, then by normalized name; options come from GHL, not the code", () => {
  const r = resolveFromDefs(defs);
  assert.equal(r.leadSource?.id, "ls"); assert.equal(r.outreach?.id, "os"); assert.equal(r.auditScore?.id, "as"); assert.equal(r.auditReport?.id, "ar"); assert.equal(r.nextFollowup?.id, "nf");
  assert.equal(r.interest, undefined);
  assert.deepEqual(leadSourceOptions(r), ["The Big Giveaway", "Facebook", "Big Giveaway 2"]); // "Big Giveaway 2" exists only in GHL — the desk still sees it
  assert.notDeepEqual(leadSourceOptions(r), [...LEAD_SOURCE_OPTIONS]);
  assert.equal(matchField([{ id: "x", name: "Next follow up", dataType: "DATE" }], "nextFollowup")?.id, "x"); // punctuation/case-insensitive name match
  assert.throws(() => requireField(r, "interest"), { status: 503 });
});
test("dry-run setup lists what is missing and creates nothing", async () => {
  queue.push({ status: 200, body: { customFields: defs } });
  const report = await ensureSalesFields(true);
  assert.equal(report.dryRun, true); assert.equal(report.created.length, 0);
  assert.deepEqual(report.present.map((p) => p.key).sort(), ["auditReport", "auditScore", "leadSource", "nextFollowup", "outreach"]);
  assert.equal(report.missing.length, Object.keys(SALES_FIELDS).length - 5);
  assert.ok(report.missing.some((m) => m.name === "Interest" && m.dataType === "SINGLE_OPTIONS" && m.options?.join() === "Cold,Warm,Hot"));
  assert.equal(requests.length, 1);
});
test("real setup creates only the missing fields, in catalog order, and never touches existing ones", async () => {
  queue.push({ status: 200, body: { customFields: defs } });
  const missing = (Object.keys(SALES_FIELDS) as (keyof typeof SALES_FIELDS)[]).filter((k) => !["leadSource", "outreach", "auditScore", "auditReport", "nextFollowup"].includes(k));
  for (const k of missing) queue.push({ status: 201, body: { customField: { id: `new-${k}`, name: SALES_FIELDS[k].name, dataType: SALES_FIELDS[k].dataType } } });
  const report = await ensureSalesFields(false);
  assert.equal(report.failed.length, 0); assert.equal(report.missing.length, 0);
  assert.deepEqual(report.created.map((c) => c.key), missing);
  const posts = requests.filter((r) => r.method === "POST");
  assert.equal(posts.length, missing.length);
  assert.ok(posts.every((p) => p.path === "/locations/LOCtest000000000000/customFields" && (p.body as { model: string }).model === "contact"));
  assert.deepEqual((posts.find((p) => (p.body as { name: string }).name === "Interest")!.body as { options: string[] }).options, ["Cold", "Warm", "Hot"]);
  assert.ok(!posts.some((p) => (p.body as { name: string }).name === "Lead Source"));
});
test("a failed create is reported, not thrown, so the rest of the setup still runs", async () => {
  queue.push({ status: 200, body: { customFields: [] } });
  queue.push({ status: 422, body: { message: "duplicate" } });
  for (let i = 1; i < Object.keys(SALES_FIELDS).length; i++) queue.push({ status: 201, body: { customField: { id: `n${i}`, name: "x", dataType: "TEXT" } } });
  const report = await ensureSalesFields(false);
  assert.equal(report.failed.length, 1); assert.equal(report.failed[0].key, "leadSource");
  assert.equal(report.created.length, Object.keys(SALES_FIELDS).length - 1);
});
