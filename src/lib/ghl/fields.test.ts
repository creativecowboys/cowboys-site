import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { forgetCustomFields, GhlError } from "./client";
import { CODE_OWNED_DROPDOWNS, ensureSalesFields, ensureSalesOptions, INTEREST_OPTIONS, LEAD_SOURCE_OPTIONS, leadSourceOptions, liveOption, matchField, missingOptionMessage, OUTREACH_OPTIONS, requireField, resolveFromDefs, SALES_FIELDS, WRITTEN_OPTIONS } from "./fields";

type Req = { method: string; path: string; body: unknown };
let requests: Req[];
let queue: ({ status: number; body: unknown; headers?: Record<string, string> } | Error)[];
const originalFetch = global.fetch;
beforeEach(() => {
  requests = []; queue = []; forgetCustomFields();
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ method: init?.method || "GET", path: String(url).replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${url}`);
    if (next instanceof Error) throw next;
    return new Response(JSON.stringify(next.body), { status: next.status, headers: next.headers });
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
const LIVE_11: string[] = OUTREACH_OPTIONS.filter((o) => o !== "In progress"); // what GoHighLevel had on Oct 2 2026: the 11 Monday labels
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
const accepted = (options: string[] = []) => ({ status: 200, body: { customField: { id: "os", name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: options } } });
const writes = () => requests.filter((r) => r.method !== "GET");
const run = (dryRun: boolean, settleMs = 0) => ensureSalesOptions(dryRun, { settleMs });
const outreachRow = (report: Awaited<ReturnType<typeof ensureSalesOptions>>) => report.fields.find((f) => f.key === "outreach")!;
const interestRow = (report: Awaited<ReturnType<typeof ensureSalesOptions>>) => report.fields.find((f) => f.key === "interest")!;
const BY_HAND = 'GoHighLevel, Settings, Custom Fields, Outreach Status, Edit, add "In progress" spelled exactly like that, Save. The desk reads the option list from GoHighLevel, so no deploy is needed.';

test("the catalog carries In progress on Outreach Status, after the 11 Monday labels and without disturbing them", () => {
  assert.deepEqual([...OUTREACH_OPTIONS], ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won", "In progress"]);
  assert.deepEqual(SALES_FIELDS.outreach.options, [...OUTREACH_OPTIONS]);
  assert.deepEqual([...CODE_OWNED_DROPDOWNS], ["outreach", "interest"]); // Lead Source is Dave's to edit in GoHighLevel: never in this list
});
test("the options the desk writes are a subset of each dropdown's catalog: the only ones the option step may add", () => {
  assert.deepEqual([...WRITTEN_OPTIONS.outreach], ["In progress", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number", "Won"]);
  assert.deepEqual([...WRITTEN_OPTIONS.interest], [...INTEREST_OPTIONS]); assert.deepEqual([...INTEREST_OPTIONS], ["Cold", "Warm", "Hot"]);
  for (const key of CODE_OWNED_DROPDOWNS) for (const o of WRITTEN_OPTIONS[key]) assert.ok(SALES_FIELDS[key].options!.includes(o), `${o} is in the ${key} catalog, so a field created fresh has it`);
  for (const handSet of ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "Proposal Sent"]) assert.equal(WRITTEN_OPTIONS.outreach.includes(handSet), false, `${handSet} is set by hand in GoHighLevel, never added back`);
});
test("liveOption finds an option whatever its capitalisation, prefers the exact spelling, and matches nothing that merely looks similar", () => {
  assert.equal(liveOption(["Won", "In Progress "], "In progress"), "In Progress ");
  assert.equal(liveOption(LIVE_11, "not interested"), "Not Interested");
  assert.equal(liveOption(["Not interested", "Won", "Not Interested"], "Not Interested"), "Not Interested"); // both spellings live: the exact one, not the first
  assert.equal(liveOption(["In Progress", "In progress"], "In progress"), "In progress");
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
  const report = await run(true);
  assert.equal(report.dryRun, true); assert.equal(report.scope, "sales-options");
  assert.deepEqual(report.fields.map((f) => [f.key, f.name, f.id, f.status, f.add]), [["outreach", "Outreach Status", "os", "would-add", ["In progress"]], ["interest", "Interest", "it", "complete", []]]);
  assert.deepEqual(outreachRow(report).live, LIVE_11); assert.deepEqual(outreachRow(report).after, [...LIVE_11, "In progress"]);
  assert.deepEqual(report.summary, ['Would add "In progress" to "Outreach Status" (11 options now, 12 after). Nothing is renamed, reordered or removed.', '"Interest" already has every option the desk writes (3 options).']);
  assert.match(report.untouched, /^Only Outreach Status and Interest are looked at, and only for the options the desk itself writes\. Lead Source is never changed from here/);
  assert.equal(requests.length, 1); assert.equal(requests[0].method, "GET"); assert.equal(writes().length, 0);
});
test("options real run: one PUT to Outreach Status carrying every option it had, in its order, plus the new one; then it is read back", async () => {
  queue.push(list(liveDefs()), accepted([...LIVE_11, "In progress"]), withOutreach([...LIVE_11, "In progress"]));
  const report = await run(false);
  assert.deepEqual(requests.map((r) => `${r.method} ${r.path.split("?")[0]}`), [`GET ${LOC}`, `PUT ${LOC}/os`, `GET ${LOC}`]);
  assert.deepEqual(writes()[0].body, { name: "Outreach Status", model: "contact", options: [...LIVE_11, "In progress"], position: 202 }); // its own name and position go back unchanged
  const row = outreachRow(report);
  assert.equal(row.status, "added"); assert.deepEqual(row.add, ["In progress"]); assert.deepEqual(row.after, [...LIVE_11, "In progress"]); assert.equal(row.lost, undefined);
  assert.equal(row.detail, 'Added "In progress" to "Outreach Status". GoHighLevel now lists 12 options; the 11 it had are unchanged and in the same order.');
  assert.equal(interestRow(report).status, "complete");
  // Lead Source lacks four of its seed options and still nothing is sent to it; nor to an LSE or a Desk field.
  assert.ok(writes().every((w) => w.path === `${LOC}/os`)); assert.equal(report.fields.some((f) => f.name === "Lead Source"), false);
});
test("options real run keeps whatever GoHighLevel has: its order, its spelling of the field name and options added there by hand", async () => {
  const theirs = ["Won", "Ghosted", "Not Contacted", "Bad contact number", "Call Held", "Contacted", "Replied", "Call Booked", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested"];
  queue.push(list(liveDefs({ os: { name: "outreach status", picklistOptions: theirs, position: undefined, placeholder: "Pick one" } })), accepted(), list(liveDefs({ os: { name: "outreach status", picklistOptions: [...theirs, "In progress"], position: undefined } })));
  const report = await run(false);
  assert.deepEqual(writes()[0].body, { name: "outreach status", model: "contact", options: [...theirs, "In progress"], placeholder: "Pick one" }); // no position was returned, so none is sent
  assert.equal(outreachRow(report).status, "added");
});
test("only what the desk writes is ever added: a hand-set label an owner removed stays removed", async () => {
  const trimmed = LIVE_11.filter((o) => o !== "Proposal Sent" && o !== "Call Held" && o !== "Booked followup"); // two hand-set labels and one the desk writes are gone
  queue.push(withOutreach(trimmed));
  const dry = outreachRow(await run(true));
  assert.deepEqual(dry.add, ["In progress", "Booked followup"]); assert.deepEqual(dry.after, [...trimmed, "In progress", "Booked followup"]);
  queue.push(withOutreach(trimmed), accepted(), withOutreach([...trimmed, "In progress", "Booked followup"]));
  const real = outreachRow(await run(false));
  assert.equal(real.status, "added"); assert.deepEqual((writes()[0].body as { options: string[] }).options, [...trimmed, "In progress", "Booked followup"]);
  assert.equal(real.detail, 'Added "In progress", "Booked followup" to "Outreach Status". GoHighLevel now lists 10 options; the 8 it had are unchanged and in the same order.');
});
test("an option GoHighLevel already has under another capitalisation is not added a second time", async () => {
  queue.push(withOutreach([...LIVE_11, "In Progress"]));
  const report = await run(false);
  assert.equal(outreachRow(report).status, "complete"); assert.deepEqual(outreachRow(report).add, []);
  assert.deepEqual(outreachRow(report).spelled, [{ want: "In progress", live: "In Progress" }]);
  assert.equal(writes().length, 0);
});
test("nothing missing means nothing is sent, dry run or not", async () => {
  for (const dryRun of [true, false]) {
    queue.push(withOutreach([...OUTREACH_OPTIONS]));
    const report = await run(dryRun);
    assert.deepEqual(report.fields.map((f) => f.status), ["complete", "complete"]);
    assert.equal(outreachRow(report).detail, '"Outreach Status" already has every option the desk writes (12 options).');
  }
  assert.equal(writes().length, 0); assert.equal(requests.length, 2);
});
test("a refused PUT is reported with GoHighLevel's words and the by-hand steps; it is not retried and not thrown", async () => {
  queue.push(list(liveDefs()), { status: 422, body: { message: ["property options should not exist"], error: "Unprocessable Entity", trace: "a=1&b=2?c" } }, list(liveDefs()));
  const report = await run(false, 5); // a refusal is final: no second look, even with a settle time
  const row = outreachRow(report);
  assert.equal(row.status, "failed"); assert.deepEqual(row.after, LIVE_11); assert.equal(row.lost, undefined);
  assert.match(row.detail, /^Could not add "In progress" to "Outreach Status": GoHighLevel answered: GoHighLevel error 422 on PUT .*property options should not exist/);
  assert.ok(row.detail.endsWith(`. The 11 options it had are all still there. Add it by hand instead: ${BY_HAND}`), row.detail);
  assert.doesNotMatch(row.detail, /[=?&]/); assert.doesNotMatch(row.detail, /\.\./); // the owner reads this through a browser tool that blanks query-string shapes
  assert.equal(writes().length, 1); assert.equal(requests.length, 3);
});
test("a PUT GoHighLevel accepts but does not apply is a failure, after one more look", async () => {
  queue.push(list(liveDefs()), accepted(LIVE_11), list(liveDefs()));
  const still = outreachRow(await run(false));
  assert.equal(still.status, "failed"); assert.match(still.detail, /GoHighLevel accepted the call but the option is not on the field\. The 11 options it had are all still there\. Add it by hand instead: /);
  queue.push(list(liveDefs()), accepted(LIVE_11), list(liveDefs()), withOutreach([...LIVE_11, "In progress"])); // the first read-back was early
  const later = outreachRow(await run(false, 1));
  assert.equal(later.status, "added"); assert.equal(writes().length, 2); // one PUT per run, never a second try
});
test("a PUT that gets no answer is judged by what GoHighLevel holds afterwards, with a second look because it may land late", async () => {
  queue.push(list(liveDefs()), new Error("socket hang up"), withOutreach([...LIVE_11, "In progress"]));
  assert.equal(outreachRow(await run(false)).status, "added");
  queue.push(list(liveDefs()), new Error("socket hang up"), list(liveDefs()), withOutreach([...LIVE_11, "In progress"])); // applied between the two looks
  assert.equal(outreachRow(await run(false, 1)).status, "added");
  queue.push(list(liveDefs()), new Error("socket hang up"), list(liveDefs()), list(liveDefs()));
  const never = outreachRow(await run(false, 1));
  assert.equal(never.status, "failed");
  assert.match(never.detail, /^Could not add "In progress" to "Outreach Status": GoHighLevel did not answer the request \(.*may or may not have been applied.*\), and the option is not on the field\. The 11 options it had are all still there\. It may still be applied: run the dry run again in a minute\. If it is still missing then, add it by hand: /);
  assert.doesNotMatch(never.detail, /\.\./);
});
test("a 429 or a 5xx says try again, not add it by hand first", async () => {
  queue.push(list(liveDefs()), { status: 429, body: {}, headers: { "retry-after": "0" } }, { status: 429, body: {}, headers: { "retry-after": "0" } }, list(liveDefs()));
  const limited = outreachRow(await run(false));
  assert.equal(limited.status, "failed"); assert.match(limited.detail, /rate-limiting the site right now.*The 11 options it had are all still there\. Try the call again in a minute\. If it keeps failing, add it by hand: /);
  queue.push(list(liveDefs()), { status: 502, body: { message: "upstream" } }, list(liveDefs()));
  assert.match(outreachRow(await run(false)).detail, /GoHighLevel error 502 on PUT .* Try the call again in a minute\./);
});
test("an option that disappears is the loudest failure: the report names it and the list to restore", async () => {
  const shrunk = [...LIVE_11.filter((o) => o !== "Won"), "In progress"];
  queue.push(list(liveDefs()), accepted(shrunk), withOutreach(shrunk));
  const row = outreachRow(await run(false));
  assert.equal(row.status, "failed"); assert.deepEqual(row.lost, ["Won"]);
  assert.match(row.detail, /^"Outreach Status" lost "Won" in this call\. Put it back by hand now/); assert.match(row.detail, /It had: "Not Contacted", /);
});
test("duplicates, a changed order, or a field that came back renamed or moved are flagged for a person, not called a clean add", async () => {
  queue.push(list(liveDefs()), accepted(), withOutreach([...LIVE_11, ...LIVE_11, "In progress"]));
  const twice = outreachRow(await run(false));
  assert.equal(twice.status, "check"); assert.match(twice.detail, /^Added "In progress" to "Outreach Status", and nothing was lost, but GoHighLevel now lists "Not Contacted", .* more than once\. Put that right by hand/);
  queue.push(list(liveDefs()), accepted(), withOutreach(["In progress", ...LIVE_11].reverse()));
  const moved = outreachRow(await run(false));
  assert.equal(moved.status, "check"); assert.match(moved.detail, /the options are in a different order than before/);
  queue.push(list(liveDefs()), accepted(), list(liveDefs({ os: { name: "Outreach", position: 0, picklistOptions: [...LIVE_11, "In progress"] } })));
  const renamed = outreachRow(await run(false));
  assert.equal(renamed.status, "check"); assert.match(renamed.detail, /but it is now called "Outreach"; its position went from 202 to 0\./);
});
test("a field that is not a dropdown, or came back with no options, is never sent a list", async () => {
  queue.push(list(liveDefs({ os: { dataType: "TEXT", picklistOptions: undefined } })));
  const text = outreachRow(await run(false));
  assert.equal(text.status, "skipped"); assert.match(text.detail, /is a TEXT field in GoHighLevel, not a dropdown; not touched/); assert.deepEqual(text.add, []);
  queue.push(list(liveDefs({ os: { picklistOptions: undefined } })));
  const blind = outreachRow(await run(false));
  assert.equal(blind.status, "skipped"); assert.match(blind.detail, /returned no options for "Outreach Status"\. Sending a list would replace options this call cannot see/); assert.deepEqual(blind.add, []);
  assert.equal(writes().length, 0);
});
test("options that do not come back as plain text are never sent back: the field is left alone", async () => {
  const shapes: unknown[] = [[{ label: "Not Contacted", value: "not_contacted" }, { label: "Won", value: "won" }], ["Not Contacted", 7, "Won"], ["Not Contacted", null], "Not Contacted,Won", { 0: "Not Contacted" }];
  for (const odd of shapes) {
    queue.push(list(liveDefs({ os: { picklistOptions: odd as string[] } })));
    const row = outreachRow(await run(false));
    assert.equal(row.status, "skipped", JSON.stringify(odd)); assert.match(row.detail, /in a form this call does not understand, so it was not touched\. Look at the field in GoHighLevel/);
    assert.deepEqual([row.live, row.add, row.after], [[], [], []]); // nothing is claimed about a list it could not read
  }
  assert.equal(writes().length, 0);
});
test("a field that carries the sales key but is no longer named as the catalog names it is not the desk's to change", async () => {
  queue.push(list(liveDefs({ os: { name: "LSE Outreach Stage" } }))); // matched by its key contact.outreach_status, renamed in GoHighLevel
  const row = outreachRow(await run(false));
  assert.equal(row.status, "skipped"); assert.match(row.detail, /^The field GoHighLevel holds under the key of "Outreach Status" is called "LSE Outreach Stage" now; it is not the desk's to change/);
  assert.equal(writes().length, 0);
});
test("a dropdown that does not exist yet is reported, not created here", async () => {
  queue.push(list(liveDefs().filter((d) => d.id !== "os")));
  const report = await run(false);
  assert.deepEqual(report.missingFields, ["Outreach Status"]); assert.deepEqual(report.fields.map((f) => f.key), ["interest"]);
  assert.match(report.summary[0], /"Outreach Status" does not exist in GoHighLevel yet\. Create it first with the plain field setup/);
  assert.equal(writes().length, 0);
});
test("a read-back that cannot be read is 'check', with nothing claimed about what the field holds", async () => {
  queue.push(list(liveDefs()), accepted([...LIVE_11, "In progress"]), list(liveDefs().filter((d) => d.id !== "os")));
  const gone = outreachRow(await run(false));
  assert.equal(gone.status, "check"); assert.deepEqual(gone.after, []);
  assert.equal(gone.detail, 'Sent "In progress" to "Outreach Status" and the field could not be read back afterwards (the field was not in the list GoHighLevel returned). What it holds now is not known: run the dry run again to see.');
  queue.push(list(liveDefs()), accepted(), { status: 500, body: {} }, { status: 500, body: {} }, { status: 500, body: {} }); // the read is tried three times by the client
  const down = outreachRow(await run(false));
  assert.equal(down.status, "check"); assert.match(down.detail, /could not be read back afterwards \(GoHighLevel error 500 on GET .*\)\. What it holds now is not known/); assert.doesNotMatch(down.detail, /[=?&]/);
});
test("Interest gets the same treatment; the second field's list is read again right before it is changed", async () => {
  const interest = { picklistOptions: ["Warm", "Hot"] };
  queue.push(
    list(liveDefs({ it: interest })), accepted(), list(liveDefs({ os: { picklistOptions: [...OUTREACH_OPTIONS] }, it: interest })), // Outreach Status: PUT, read back
    list(liveDefs({ os: { picklistOptions: [...OUTREACH_OPTIONS] }, it: { picklistOptions: ["Warm", "Hot", "Lukewarm"] } })), // read again: someone added "Lukewarm" by hand meanwhile
    { status: 200, body: { customField: { id: "it" } } }, list(liveDefs({ os: { picklistOptions: [...OUTREACH_OPTIONS] }, it: { picklistOptions: ["Warm", "Hot", "Lukewarm", "Cold"] } })),
  );
  const report = await run(false);
  assert.deepEqual(requests.map((r) => `${r.method} ${r.path.split("?")[0]}`), [`GET ${LOC}`, `PUT ${LOC}/os`, `GET ${LOC}`, `GET ${LOC}`, `PUT ${LOC}/it`, `GET ${LOC}`]);
  assert.deepEqual(report.fields.map((f) => [f.key, f.status, f.add]), [["outreach", "added", ["In progress"]], ["interest", "added", ["Cold"]]]);
  assert.deepEqual(writes().map((w) => [w.path, (w.body as { options: string[] }).options]), [[`${LOC}/os`, [...LIVE_11, "In progress"]], [`${LOC}/it`, ["Warm", "Hot", "Lukewarm", "Cold"]]]); // Lukewarm goes back with the rest
  assert.deepEqual(interestRow(report).live, ["Warm", "Hot", "Lukewarm"]); assert.equal(interestRow(report).lost, undefined);
});
test("after a result that is not a clean add, nothing further is sent in that run", async () => {
  const interest = { picklistOptions: ["Warm", "Hot"] };
  for (const firstResult of [{ status: 422, body: { message: ["property options should not exist"] } }, accepted()]) { // refused; or accepted and then an option is lost
    requests.length = 0;
    queue.push(list(liveDefs({ it: interest })), firstResult, firstResult.status === 422 ? list(liveDefs({ it: interest })) : list(liveDefs({ os: { picklistOptions: ["In progress"] }, it: interest })));
    const report = await run(false);
    assert.equal(outreachRow(report).status, "failed");
    assert.equal(interestRow(report).status, "skipped"); assert.deepEqual(interestRow(report).after, ["Warm", "Hot"]);
    assert.equal(interestRow(report).detail, 'Not attempted: the change to "Outreach Status" did not go cleanly. "Cold" is still missing from "Interest".');
    assert.deepEqual(writes().map((w) => w.path), [`${LOC}/os`]); // one PUT, and it was not to Interest
  }
  // A second field that needs nothing is still reported as complete after a failure: looking is not changing.
  queue.push(list(liveDefs()), { status: 422, body: {} }, list(liveDefs()));
  assert.deepEqual((await run(false)).fields.map((f) => f.status), ["failed", "complete"]);
});
test("when the field list cannot be read at all, the call says so plainly and nothing is sent", async () => {
  queue.push({ status: 401, body: { message: "The token is not authorized for this scope." } });
  await assert.rejects(run(false), (e: unknown) => {
    const err = e as { status?: number; message?: string };
    assert.equal(err.status, 502); assert.match(err.message || "", /^GoHighLevel's custom fields could not be read \(GoHighLevel refused GET .*\)\. Nothing was changed\.$/);
    assert.doesNotMatch(err.message || "", /[=?&]/); // the path's query string is gone
    return !(e instanceof GhlError);
  });
  assert.equal(writes().length, 0);
});
test("names and options GoHighLevel sends are shown without the characters a browser tool would blank", async () => {
  const odd = [...LIVE_11.filter((o) => o !== "Won"), "Q&A booked?"];
  queue.push(withOutreach(odd), accepted(), withOutreach([...LIVE_11.filter((o) => o !== "Won"), "In progress"])); // the odd option is lost by the PUT
  const row = outreachRow(await run(false));
  assert.equal(row.status, "failed"); assert.deepEqual(row.lost, ["Q&A booked?"]); // the data keeps the real label
  assert.match(row.detail, /lost "Q A booked" in this call/); assert.doesNotMatch(row.detail, /[=?&]/);
});
test("the plain field setup points at a dropdown that lacks an option the desk writes, and still changes nothing about it", async () => {
  queue.push(list(liveDefs()));
  const lacking = await ensureSalesFields(true);
  assert.deepEqual(lacking.present.find((p) => p.key === "outreach"), { key: "outreach", name: "Outreach Status", id: "os", missingOptions: ["In progress"] });
  assert.deepEqual(lacking.present.find((p) => p.key === "interest"), { key: "interest", name: "Interest", id: "it" });
  assert.deepEqual(lacking.present.find((p) => p.key === "leadSource"), { key: "leadSource", name: "Lead Source", id: "ls" }); // its seed list is not a rule: nothing is reported as missing
  queue.push(withOutreach([...OUTREACH_OPTIONS]));
  assert.equal((await ensureSalesFields(true)).present.find((p) => p.key === "outreach")!.missingOptions, undefined);
  queue.push(withOutreach([...LIVE_11.filter((o) => o !== "Proposal Sent"), "In progress"])); // a hand-set label removed in GoHighLevel is not "missing"
  assert.equal((await ensureSalesFields(true)).present.find((p) => p.key === "outreach")!.missingOptions, undefined);
  for (const unreadable of [undefined, [], [{ label: "Won" }]]) { // no list, or one the desk cannot read, says nothing about what is missing
    queue.push(list(liveDefs({ os: { picklistOptions: unreadable as string[] | undefined } })));
    assert.equal((await ensureSalesFields(true)).present.find((p) => p.key === "outreach")!.missingOptions, undefined);
  }
  assert.equal(writes().length, 0);
});
test("option lists resolve as plain text only: anything else GoHighLevel sends in the list is ignored, never stringified", () => {
  const odd = resolveFromDefs([{ id: "os", name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["Won", { label: "Lost" }, 7, null, "In progress"] as unknown as string[] }, { id: "it", name: "Interest", dataType: "SINGLE_OPTIONS", picklistOptions: "Cold,Warm" as unknown as string[] }]);
  assert.deepEqual(odd.outreach?.options, ["Won", "In progress"]); assert.deepEqual(odd.interest?.options, []);
});
