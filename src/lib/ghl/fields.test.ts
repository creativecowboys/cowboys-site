import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { forgetCustomFields } from "./client";
import { CODE_OWNED_DROPDOWNS, ensureSalesFields, ensureSalesOptions, INTEREST_OPTIONS, LEAD_SOURCE_OPTIONS, leadSourceOptions, liveOption, matchField, missingOptionMessage, OUTREACH_OPTIONS, requireField, resolveFromDefs, SALES_FIELDS } from "./fields";

type Req = { method: string; path: string; body: unknown };
let requests: Req[];
let queue: ({ status: number; body: unknown } | Error)[];
const originalFetch = global.fetch;
beforeEach(() => {
  requests = []; queue = []; forgetCustomFields();
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ method: init?.method || "GET", path: String(url).replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${url}`);
    if (next instanceof Error) throw next;
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

// ── Adding options to the desk's own dropdowns (Dave, Oct 2 2026: the "In progress" call outcome needs its Outreach Status option) ──
const LOC = "/locations/LOCtest000000000000/customFields";
const LIVE_11 = OUTREACH_OPTIONS.filter((o) => o !== "In progress"); // what GoHighLevel had on Oct 2 2026: the 11 Monday labels
type Def = { id: string; name: string; fieldKey?: string; dataType: string; picklistOptions?: string[]; position?: number; model?: string; placeholder?: string };
const liveDefs = (over: { os?: Partial<Def>; it?: Partial<Def>; ls?: Partial<Def> } = {}): Def[] => [
  { id: "ls", name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Big Giveaway 2"], position: 201, ...over.ls }, // four seed options gone, one of Dave's own added
  { id: "os", name: "Outreach Status", fieldKey: "contact.outreach_status", dataType: "SINGLE_OPTIONS", picklistOptions: [...LIVE_11], position: 202, model: "contact", ...over.os },
  { id: "it", name: "Interest", fieldKey: "contact.interest", dataType: "SINGLE_OPTIONS", picklistOptions: ["Cold", "Warm", "Hot"], position: 203, ...over.it },
  { id: "lse", name: "LSE Health", fieldKey: "contact.lse_health", dataType: "SINGLE_OPTIONS", picklistOptions: ["green", "yellow", "red"] },
  { id: "dsk", name: "Desk Client Health", fieldKey: "contact.desk_client_health", dataType: "SINGLE_OPTIONS", picklistOptions: ["Good"] },
];
const list = (defs: Def[]) => ({ status: 200, body: { customFields: defs } });
const withOutreach = (options: string[]) => list(liveDefs({ os: { picklistOptions: options } }));
const accepted = (options: string[]) => ({ status: 200, body: { customField: { id: "os", name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: options } } });
const writes = () => requests.filter((r) => r.method !== "GET");
const outreachRow = (report: Awaited<ReturnType<typeof ensureSalesOptions>>) => report.fields.find((f) => f.key === "outreach")!;

test("the catalog carries In progress on Outreach Status, after the 11 Monday labels and without disturbing them", () => {
  assert.deepEqual([...OUTREACH_OPTIONS], ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won", "In progress"]);
  assert.deepEqual(SALES_FIELDS.outreach.options, [...OUTREACH_OPTIONS]);
  assert.deepEqual([...CODE_OWNED_DROPDOWNS], ["outreach", "interest"]); // Lead Source is Dave's to edit in GoHighLevel: never in this list
});
test("liveOption finds an option whatever its capitalisation, and nothing that merely looks similar", () => {
  assert.equal(liveOption(["Won", "In Progress "], "In progress"), "In Progress ");
  assert.equal(liveOption(LIVE_11, "not interested"), "Not Interested");
  for (const near of ["In progress?", "Inprogress", "In-progress", "Progress", ""]) assert.equal(liveOption(["In progress"], near), undefined);
  assert.equal(liveOption([], "In progress"), undefined);
});
test("the refusal a rep sees names the option, the field and both ways an owner can add it, with nothing a browser tool would blank", () => {
  const text = missingOptionMessage("Outreach Status", "In progress");
  assert.match(text, /"In progress" is not an option on the "Outreach Status" field in GoHighLevel yet, so nothing was saved\./);
  assert.match(text, /scope "sales-options"/); assert.match(text, /by hand in GoHighLevel under Settings, Custom Fields, Outreach Status/); assert.match(text, /choose a different outcome/);
  assert.doesNotMatch(text, /[=?&]/);
});
test("options dry run: says exactly which option it would add to which field, and writes nothing", async () => {
  queue.push(list(liveDefs()));
  const report = await ensureSalesOptions(true);
  assert.equal(report.dryRun, true); assert.equal(report.scope, "sales-options");
  assert.deepEqual(report.fields.map((f) => [f.key, f.name, f.id, f.status, f.add]), [["outreach", "Outreach Status", "os", "would-add", ["In progress"]], ["interest", "Interest", "it", "complete", []]]);
  assert.deepEqual(outreachRow(report).live, LIVE_11); assert.deepEqual(outreachRow(report).after, [...LIVE_11, "In progress"]);
  assert.deepEqual(report.summary, ['Would add "In progress" to "Outreach Status" (11 options now, 12 after). Nothing is renamed, reordered or removed.', '"Interest" already has every option the desk writes (3 options).']);
  assert.match(report.untouched, /Lead Source is never changed from here/);
  assert.equal(requests.length, 1); assert.equal(requests[0].method, "GET"); assert.equal(writes().length, 0);
});
test("options real run: one PUT to Outreach Status carrying every option it had, in its order, plus the new one; then it is read back", async () => {
  queue.push(list(liveDefs()), accepted([...LIVE_11, "In progress"]), withOutreach([...LIVE_11, "In progress"]));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  assert.deepEqual(requests.map((r) => `${r.method} ${r.path.split("?")[0]}`), [`GET ${LOC}`, `PUT ${LOC}/os`, `GET ${LOC}`]);
  assert.deepEqual(writes()[0].body, { name: "Outreach Status", model: "contact", options: [...LIVE_11, "In progress"], position: 202 }); // its own name and position go back unchanged
  const row = outreachRow(report);
  assert.equal(row.status, "added"); assert.deepEqual(row.add, ["In progress"]); assert.deepEqual(row.after, [...LIVE_11, "In progress"]); assert.equal(row.lost, undefined);
  assert.equal(row.detail, 'Added "In progress" to "Outreach Status". GoHighLevel now lists 12 options; the 11 it had are unchanged and in the same order.');
  assert.equal(report.fields.find((f) => f.key === "interest")!.status, "complete");
  // Lead Source lacks four of its seed options and still nothing is sent to it; nor to an LSE or a Desk field.
  assert.ok(writes().every((w) => w.path === `${LOC}/os`)); assert.equal(report.fields.some((f) => f.name === "Lead Source"), false);
});
test("options real run keeps whatever GoHighLevel has: its order, its spelling of the field name and options added there by hand", async () => {
  const theirs = ["Won", "Ghosted", "Not Contacted", "Bad contact number", "Call Held", "Contacted", "Replied", "Call Booked", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested"];
  queue.push(list(liveDefs({ os: { name: "outreach status", picklistOptions: theirs, position: undefined, placeholder: "Pick one" } })), accepted([...theirs, "In progress"]), list(liveDefs({ os: { name: "outreach status", picklistOptions: [...theirs, "In progress"] } })));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  assert.deepEqual(writes()[0].body, { name: "outreach status", model: "contact", options: [...theirs, "In progress"], placeholder: "Pick one" }); // no position was returned, so none is sent
  assert.equal(outreachRow(report).status, "added");
});
test("an option GoHighLevel already has under another capitalisation is not added a second time", async () => {
  queue.push(withOutreach([...LIVE_11, "In Progress"]));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  assert.equal(outreachRow(report).status, "complete"); assert.deepEqual(outreachRow(report).add, []);
  assert.deepEqual(outreachRow(report).spelled, [{ want: "In progress", live: "In Progress" }]);
  assert.equal(writes().length, 0);
});
test("nothing missing means nothing is sent, dry run or not", async () => {
  for (const dryRun of [true, false]) {
    queue.push(withOutreach([...OUTREACH_OPTIONS]));
    const report = await ensureSalesOptions(dryRun, { settleMs: 0 });
    assert.deepEqual(report.fields.map((f) => f.status), ["complete", "complete"]);
  }
  assert.equal(writes().length, 0); assert.equal(requests.length, 2);
});
test("a refused PUT is reported with GoHighLevel's words and the by-hand steps; it is not retried and not thrown", async () => {
  queue.push(list(liveDefs()), { status: 422, body: { message: ["property options should not exist"], error: "Unprocessable Entity", trace: "a=1&b=2?c" } }, list(liveDefs()));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  const row = outreachRow(report);
  assert.equal(row.status, "failed"); assert.deepEqual(row.after, LIVE_11); assert.equal(row.lost, undefined);
  assert.match(row.detail, /^Could not add "In progress" to "Outreach Status": GoHighLevel answered: .*property options should not exist/);
  assert.match(row.detail, /The 11 options it had are all still there\. Add it by hand instead: GoHighLevel, Settings, Custom Fields, Outreach Status, Edit, add "In progress" spelled exactly like that, Save\./);
  assert.doesNotMatch(row.detail, /[=?&]/); // the owner reads this through a browser tool that blanks query-string shapes
  assert.equal(writes().length, 1);
});
test("a PUT GoHighLevel accepts but does not apply is a failure, after one more look", async () => {
  queue.push(list(liveDefs()), accepted(LIVE_11), list(liveDefs()));
  const still = await ensureSalesOptions(false, { settleMs: 0 });
  assert.equal(outreachRow(still).status, "failed"); assert.match(outreachRow(still).detail, /GoHighLevel accepted the call but the option is not on the field/);
  queue.push(list(liveDefs()), accepted(LIVE_11), list(liveDefs()), withOutreach([...LIVE_11, "In progress"])); // the first read-back was early
  const later = await ensureSalesOptions(false, { settleMs: 1 });
  assert.equal(outreachRow(later).status, "added"); assert.equal(writes().length, 2); // one PUT per run, never a second try
});
test("a PUT that times out is judged by what GoHighLevel holds afterwards", async () => {
  queue.push(list(liveDefs()), new Error("socket hang up"), withOutreach([...LIVE_11, "In progress"]));
  assert.equal(outreachRow(await ensureSalesOptions(false, { settleMs: 0 })).status, "added");
  queue.push(list(liveDefs()), new Error("socket hang up"), list(liveDefs()));
  const lost = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(lost.status, "failed"); assert.match(lost.detail, /may or may not have been applied/);
});
test("an option that disappears is the loudest failure: the report names it and the list to restore", async () => {
  const shrunk = [...LIVE_11.filter((o) => o !== "Won"), "In progress"];
  queue.push(list(liveDefs()), accepted(shrunk), withOutreach(shrunk));
  const row = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(row.status, "failed"); assert.deepEqual(row.lost, ["Won"]);
  assert.match(row.detail, /^"Outreach Status" lost "Won" in this call\. Put it back by hand now/); assert.match(row.detail, /It had: "Not Contacted", /);
});
test("duplicates or a changed order after the PUT are flagged for a person, not called a clean add", async () => {
  queue.push(list(liveDefs()), accepted([]), withOutreach([...LIVE_11, ...LIVE_11, "In progress"]));
  const twice = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(twice.status, "check"); assert.match(twice.detail, /more than once/);
  queue.push(list(liveDefs()), accepted([]), withOutreach(["In progress", ...LIVE_11].reverse()));
  const moved = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(moved.status, "check"); assert.match(moved.detail, /different order/);
});
test("a field that is not a dropdown, or came back with no options, is never sent a list", async () => {
  queue.push(list(liveDefs({ os: { dataType: "TEXT", picklistOptions: undefined } })));
  const text = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(text.status, "skipped"); assert.match(text.detail, /is a TEXT field in GoHighLevel, not a dropdown; not touched/);
  queue.push(list(liveDefs({ os: { picklistOptions: undefined } })));
  const blind = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(blind.status, "skipped"); assert.match(blind.detail, /returned no options for "Outreach Status"\. Sending a list would replace options this call cannot see/);
  assert.equal(writes().length, 0);
});
test("a dropdown that does not exist yet is reported, not created here", async () => {
  queue.push(list(liveDefs().filter((d) => d.id !== "os")));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  assert.deepEqual(report.missingFields, ["Outreach Status"]); assert.deepEqual(report.fields.map((f) => f.key), ["interest"]);
  assert.match(report.summary[0], /"Outreach Status" does not exist in GoHighLevel yet\. Create it first with the plain field setup/);
  assert.equal(writes().length, 0);
});
test("an unreadable read-back says so instead of guessing", async () => {
  queue.push(list(liveDefs()), accepted([...LIVE_11, "In progress"]), list(liveDefs().filter((d) => d.id !== "os")));
  const row = outreachRow(await ensureSalesOptions(false, { settleMs: 0 }));
  assert.equal(row.status, "failed"); assert.match(row.detail, /could not be read back \(the field was not in the list GoHighLevel returned\)\. Run the dry run again/);
});
test("Interest gets the same treatment, and both dropdowns can be completed in one run", async () => {
  queue.push(list(liveDefs({ it: { picklistOptions: ["Warm", "Hot"] } })), accepted([]), withOutreach([...LIVE_11, "In progress"]), { status: 200, body: { customField: { id: "it" } } }, list(liveDefs({ os: { picklistOptions: [...OUTREACH_OPTIONS] }, it: { picklistOptions: ["Warm", "Hot", "Cold"] } })));
  const report = await ensureSalesOptions(false, { settleMs: 0 });
  assert.deepEqual(report.fields.map((f) => [f.key, f.status, f.add]), [["outreach", "added", ["In progress"]], ["interest", "added", ["Cold"]]]);
  assert.deepEqual(writes().map((w) => [w.path, (w.body as { options: string[] }).options]), [[`${LOC}/os`, [...LIVE_11, "In progress"]], [`${LOC}/it`, ["Warm", "Hot", "Cold"]]]);
  assert.deepEqual([...INTEREST_OPTIONS], ["Cold", "Warm", "Hot"]);
});
test("the plain field setup points at a dropdown that lacks an option the desk writes, and still changes nothing about it", async () => {
  queue.push(list(liveDefs()));
  const lacking = await ensureSalesFields(true);
  assert.deepEqual(lacking.present.find((p) => p.key === "outreach"), { key: "outreach", name: "Outreach Status", id: "os", missingOptions: ["In progress"] });
  assert.deepEqual(lacking.present.find((p) => p.key === "interest"), { key: "interest", name: "Interest", id: "it" });
  assert.deepEqual(lacking.present.find((p) => p.key === "leadSource"), { key: "leadSource", name: "Lead Source", id: "ls" }); // its seed list is not a rule: nothing is reported as missing
  queue.push(withOutreach([...OUTREACH_OPTIONS]));
  assert.equal((await ensureSalesFields(true)).present.find((p) => p.key === "outreach")!.missingOptions, undefined);
  assert.equal(writes().length, 0);
});
