import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { assignOwner, callFields, formatCallNote, getCallLead, getCallsPage, LEAD_TAGS, mapLead, markSourceLead, readLeadVersion, rosterFilters, saveCall, setLeadSource, unwrapCursor, WON_TAG } from "./ghl";
import { validateAssign, validateLeadId } from "./validation";
import { forgetCustomFields } from "@/lib/ghl/client";
import { resolveFromDefs } from "@/lib/ghl/fields";
import { ghlRepIds } from "@/lib/ghl/reps";
import type { CallDraft } from "@/app/leads/types";

// The GHL twin of owner.test.ts: same guarantees (version check, readback confirmation, idempotent saves),
// against a mocked GoHighLevel. Field ids below are fictional; the desk resolves real ones by name.
const F = { ls: "fLeadSource", os: "fOutreach", it: "fInterest", lc: "fLastContact", nf: "fNextFollowup", nt: "fNextFollowupTime", qm: "fQuoted", ii: "fInterestedIn", sn: "fSalesNotes", ml: "fMondayId", as: "fAuditScore", ar: "fAuditReport" };
const DEFS = { customFields: [
  { id: F.ls, name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] },
  { id: F.os, name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["Not Contacted", "Call Booked", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number", "Won"] },
  { id: F.it, name: "Interest", dataType: "SINGLE_OPTIONS", picklistOptions: ["Cold", "Warm", "Hot"] }, { id: F.lc, name: "Last Contact", dataType: "DATE" },
  { id: F.nf, name: "Next Follow-up", dataType: "DATE" }, { id: F.nt, name: "Next Follow-up Time", dataType: "TEXT" }, { id: F.qm, name: "Quoted Monthly", dataType: "MONETORY" },
  { id: F.ii, name: "Interested In", dataType: "TEXT" }, { id: F.sn, name: "Sales Notes", dataType: "LARGE_TEXT" }, { id: F.ml, name: "Monday Lead ID", dataType: "TEXT" },
  { id: F.as, name: "Audit Score", dataType: "NUMERICAL" }, { id: F.ar, name: "Audit Report URL", dataType: "TEXT" },
] };
const fields = resolveFromDefs(DEFS.customFields);
const ID = "ocQHyuzHvysMo5N5VsXc";
const v1 = "2026-10-01T14:00:00.000Z", v2 = "2026-10-01T14:01:00.000Z";
const reps = ghlRepIds();
const contact = (over: Record<string, unknown> = {}) => ({ id: ID, firstName: "Alex", lastName: "Example", contactName: "Alex Example", companyName: "Juniper & Co.", email: "alex@example.com", phone: "+13865550100", city: "Villa Rica", state: "GA", tags: ["giveaway-entrant"], assignedTo: null, dateAdded: "2026-09-25T10:00:00.000Z", dateUpdated: v1, customFields: [{ id: F.ls, value: "The Big Giveaway" }, { id: F.os, value: "Call Booked" }, { id: F.nf, value: "2026-10-03" }, { id: F.nt, value: "09:00" }, { id: F.qm, value: 297 }], ...over });

type Req = { method: string; path: string; body: unknown };
let requests: Req[];
let queue: { status: number; body: unknown }[];
const originalFetch = global.fetch;
beforeEach(() => {
  requests = []; queue = []; forgetCustomFields();
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000"; process.env.NEXTAUTH_SECRET = "test-secret";
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ method: init?.method || "GET", path: String(url).replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${url}`);
    return new Response(JSON.stringify(next.body), { status: next.status });
  }) as typeof fetch;
});
afterEach(() => { global.fetch = originalFetch; });
const defs = () => ({ status: 200, body: DEFS });
const got = (c: unknown) => ({ status: 200, body: { contact: c } });
const notes = (list: { id: string; body: string; userId?: string; dateAdded?: string }[]) => ({ status: 200, body: { notes: list } });
const put = (c: unknown) => ({ status: 200, body: { succeded: true, contact: c } });

test("ids: GHL contact ids and Monday item ids both validate; junk does not", () => {
  assert.equal(validateLeadId(ID), ID); assert.equal(validateLeadId("13149403716"), "13149403716");
  for (const bad of ["", "abc", "../x", "0123", "a".repeat(65), "has space"]) assert.throws(() => validateLeadId(bad), { status: 400 });
});
test("PATCH body: owner OR leadSource, never both, always a version", () => {
  assert.deepEqual(validateAssign({ leadSource: " Facebook ", expectedUpdatedAt: v1 }), { leadSource: "Facebook", expectedUpdatedAt: v1 });
  for (const bad of [{ leadSource: "", expectedUpdatedAt: v1 }, { leadSource: "x", owner: "Dave", expectedUpdatedAt: v1 }, { expectedUpdatedAt: v1 }, { leadSource: "x" }]) assert.throws(() => validateAssign(bad), { status: 400 });
});
test("mapLead: business name, person, owner by GHL user id, custom fields, group and link", () => {
  const lead = mapLead(contact({ assignedTo: reps.Josh }), fields);
  assert.equal(lead.name, "Juniper & Co."); assert.equal(lead.contact, "Alex Example"); assert.equal(lead.ownerName, "Josh"); assert.equal(lead.owner, "Josh"); assert.deepEqual(lead.ownerIds, [reps.Josh]);
  assert.equal(lead.leadSource, "The Big Giveaway"); assert.equal(lead.outreach, "Call Booked"); assert.equal(lead.nextFollowup, "2026-10-03"); assert.equal(lead.nextFollowupTime, "09:00"); assert.equal(lead.quotedMonthly, "297");
  assert.equal(lead.city, "Villa Rica, GA"); assert.equal(lead.group, "The Big Giveaway"); assert.equal(lead.updatedAt, v1); assert.equal(lead.recordUrl, `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${ID}`);
  const stranger = mapLead(contact({ assignedTo: "someoneElse00000000", customFields: [{ id: F.os, value: "Won" }] }), fields);
  assert.equal(stranger.ownerName, ""); assert.equal(stranger.owner, "Assigned in GHL"); assert.equal(stranger.group, "Won");
  assert.equal(mapLead(contact({ companyName: "", customFields: [], tags: [WON_TAG] }), fields).outreach, "Won");
});
test("roster filters: an OR of the lead tags plus 'has a Lead Source'", () => {
  assert.deepEqual(rosterFilters("fLeadSource"), [{ group: "OR", filters: [...LEAD_TAGS.map((t) => ({ field: "tags", operator: "eq", value: t })), { field: "customFields.fLeadSource", operator: "exists" }] }]);
  assert.equal((rosterFilters(undefined)[0] as { filters: unknown[] }).filters.length, LEAD_TAGS.length);
});
test("getCallsPage: one request for a small roster, owners and lead-source options come back with it", async () => {
  queue.push(defs(), { status: 200, body: { contacts: [contact(), contact({ id: "second00000000000000", companyName: "Second" })], total: 2 } });
  const page = await getCallsPage(null);
  assert.equal(page.system, "ghl"); assert.equal(page.leads.length, 2); assert.equal(page.cursor, null);
  assert.deepEqual(page.owners.map((o) => o.name), ["Dave", "Josh", "Keaton"]); assert.deepEqual(page.leadSources, DEFS.customFields[0].picklistOptions);
  assert.deepEqual((requests[1].body as { sort: unknown }).sort, [{ field: "dateAdded", direction: "desc" }]);
  assert.equal((requests[1].body as { pageLimit: number }).pageLimit, 500);
});
test("getCallsPage: a rejected custom-field clause falls back to tags only", async () => {
  queue.push(defs(), { status: 400, body: { message: "bad filter" } }, { status: 200, body: { contacts: [contact()], total: 1 } });
  const page = await getCallsPage(null);
  assert.equal(page.leads.length, 1);
  assert.equal(((requests[2].body as { filters: { filters: unknown[] }[] }).filters[0]).filters.length, LEAD_TAGS.length);
});
test("cursor: a full page yields a signed cursor for the next page; tampering is refused", async () => {
  const full = Array.from({ length: 500 }, (_, i) => contact({ id: `c${String(i).padStart(19, "0")}` }));
  queue.push(defs(), { status: 200, body: { contacts: full, total: 700 } }, { status: 200, body: { contacts: full, total: 700 } }, { status: 200, body: { contacts: full, total: 700 } }, { status: 200, body: { contacts: full, total: 700 } });
  const page = await getCallsPage(null);
  assert.equal(page.leads.length, 2000); assert.ok(page.cursor);
  assert.equal(unwrapCursor(page.cursor), 5);
  assert.throws(() => unwrapCursor(page.cursor!.slice(0, -2) + "zz"), { status: 400 });
  assert.throws(() => unwrapCursor("not-a-cursor"), { status: 400 });
});
test("getCallLead returns the lead plus its notes as history, markers stripped, call notes flagged", async () => {
  queue.push(defs(), got(contact()), notes([{ id: "n1", body: "Call note\nRep: Dave\n\n[CC-CALL:6f1c2a4e-3b7d-4c8e-9f01-23456789abcd] [CC-PAYLOAD:" + "a".repeat(64) + "]", userId: reps.Dave, dateAdded: "2026-09-30T10:00:00.000Z" }, { id: "n0", body: "Imported", dateAdded: "2026-09-29T10:00:00.000Z" }]));
  const { lead, history } = await getCallLead(ID);
  assert.equal(lead.id, ID); assert.equal(history[0].id, "n1"); assert.equal(history[0].text, "Call note\nRep: Dave"); assert.equal(history[0].author, "Dave"); assert.equal(history[0].isCallNote, true); assert.equal(history[1].author, "Team");
});
for (const owner of ["Dave", "Josh", "Keaton"] as const) test(`assigns ${owner} to the matching GHL user and returns the new version`, async () => {
  queue.push(defs(), got(contact()), put(contact({ assignedTo: reps[owner] })), got(contact({ assignedTo: reps[owner], dateUpdated: v2 })));
  const lead = await assignOwner(ID, owner, v1);
  assert.equal(lead.ownerId, reps[owner]); assert.equal(lead.ownerName, owner); assert.equal(lead.updatedAt, v2);
  assert.deepEqual(requests[2].body, { assignedTo: reps[owner] }); assert.equal(requests[2].method, "PUT");
});
test("clearing the owner is confirmed by readback", async () => {
  queue.push(defs(), got(contact({ assignedTo: reps.Dave })), put(contact({ assignedTo: null })), got(contact({ assignedTo: null, dateUpdated: v2 })));
  assert.equal((await assignOwner(ID, "", v1)).ownerId, "");
  assert.deepEqual(requests[2].body, { assignedTo: null });
});
test("stale draft cannot assign or silently rebase over a teammate change", async () => {
  queue.push(defs(), got(contact({ dateUpdated: v2 })));
  await assert.rejects(assignOwner(ID, "Dave", v1), { status: 409 });
  assert.equal(requests.filter((r) => r.method === "PUT").length, 0);
});
test("a different owner in readback cannot be reported as success", async () => {
  queue.push(defs(), got(contact()), put(contact({ assignedTo: reps.Dave })), got(contact({ assignedTo: reps.Josh, dateUpdated: v2 })));
  await assert.rejects(assignOwner(ID, "Dave", v1), { status: 409 });
});
test("lead source: only an option GHL has; written as a custom field and confirmed by readback", async () => {
  queue.push(defs(), got(contact()), put(contact()), got(contact({ dateUpdated: v2, customFields: [{ id: F.ls, value: "Facebook" }] })));
  const lead = await setLeadSource(ID, "Facebook", v1);
  assert.equal(lead.leadSource, "Facebook"); assert.equal(lead.updatedAt, v2);
  assert.deepEqual(requests[2].body, { customFields: [{ id: F.ls, field_value: "Facebook" }] });
  queue.push(defs());
  await assert.rejects(setLeadSource(ID, "Big Giveaway 2", v1), { status: 400 }); // not an option yet — Dave adds it in GHL, no deploy
  assert.equal(requests.filter((r) => r.method === "PUT").length, 1);
});

const draft = (over: Partial<CallDraft> = {}): CallDraft => ({ callId: "6f1c2a4e-3b7d-4c8e-9f01-23456789abcd", leadId: ID, expectedUpdatedAt: v1, rep: "Dave", goal: "More local jobs", currentMarketing: "", challenge: "", budget: "", timing: "", recommendation: "", notes: "Good call", nextStep: "Send proposal", outcome: "Booked followup", interest: "Warm", followupDate: "2026-10-07", followupTime: "09:30", quotedMonthly: "297", ...over });
test("callFields: outcome + today always; interest, follow-up date+time and quote only when given; blanks never erase", () => {
  const all = callFields(draft(), "2026-10-01", fields);
  assert.deepEqual(all, [{ id: F.os, field_value: "Booked followup" }, { id: F.lc, field_value: "2026-10-01" }, { id: F.it, field_value: "Warm" }, { id: F.nf, field_value: "2026-10-07" }, { id: F.nt, field_value: "09:30" }, { id: F.qm, field_value: 297 }]);
  const minimal = callFields(draft({ outcome: "Not interested", interest: "", followupDate: "", followupTime: "", quotedMonthly: "" }), "2026-10-01", fields);
  assert.deepEqual(minimal, [{ id: F.os, field_value: "Not Interested" }, { id: F.lc, field_value: "2026-10-01" }]);
  assert.deepEqual(callFields(draft({ followupTime: "" }), "2026-10-01", fields).find((f) => f.id === F.nt), { id: F.nt, field_value: "" }); // all-day clears the time
  assert.throws(() => callFields(draft({ outcome: "" }), "2026-10-01", fields), { status: 400 });
  assert.throws(() => callFields(draft(), "2026-10-01", resolveFromDefs([])), { status: 503 });
});
test("formatCallNote carries every answered field and both markers", () => {
  const text = formatCallNote(draft());
  assert.match(text, /^Call note — Creative Cowboys desk\nRep: Dave\nOutcome: Booked followup\n/);
  assert.match(text, /Follow-up date: 2026-10-07 around 9:30 am\n/); assert.match(text, /Monthly quote discussed: \$297/);
  assert.match(text, /\[CC-CALL:6f1c2a4e-3b7d-4c8e-9f01-23456789abcd\] \[CC-PAYLOAD:[0-9a-f]{64}\]$/);
  assert.doesNotMatch(text, /Budget discussed/);
});
test("saveCall: note first, then the fields, with the version checked before anything is written", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()));
  const r = await saveCall(draft());
  assert.deepEqual(r, { saved: true, updateId: "n9", recordUrl: `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${ID}` });
  const writes = requests.filter((x) => x.method !== "GET");
  assert.equal(writes[0].path, `/contacts/${ID}/notes`); assert.ok(String((writes[0].body as { body: string }).body).includes("[CC-CALL:6f1c2a4e"));
  assert.equal(writes[1].method, "PUT"); assert.deepEqual((writes[1].body as { customFields: unknown[] }).customFields, callFields(draft(), new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()), fields));
});
test("saveCall: a stale version is refused before the note is written", async () => {
  queue.push(defs(), got(contact({ dateUpdated: v2 })), notes([]));
  await assert.rejects(saveCall(draft()), { status: 409 });
  assert.equal(requests.filter((x) => x.method !== "GET").length, 0);
});
test("saveCall: a retry with the same call id and the same payload is a no-op with a warning; a changed payload is refused", async () => {
  const d = draft();
  queue.push(defs(), got(contact()), notes([{ id: "n1", body: formatCallNote(d) }]));
  const r = await saveCall(d);
  assert.equal(r.updateId, "n1"); assert.match(r.warning || "", /already saved/);
  assert.equal(requests.filter((x) => x.method !== "GET").length, 0);
  queue.push(got(contact()), notes([{ id: "n1", body: formatCallNote(d) }])); // field definitions are cached from the first call
  await assert.rejects(saveCall(draft({ notes: "Edited after the fact" })), { status: 409 });
});
test("saveCall: a field changed by someone else between the note and the field write leaves the fields alone, with a warning", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact({ customFields: [{ id: F.os, value: "Won" }] })));
  const r = await saveCall(draft());
  assert.equal(r.saved, true); assert.match(r.warning || "", /left unchanged/);
  assert.equal(requests.filter((x) => x.method === "PUT").length, 0);
});
test("saveCall: an unconfirmed note is a 502 that tells the rep to retry with the same call reference", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 500, body: {} });
  await assert.rejects(saveCall(draft()), { status: 502 });
});
test("handoff marks: Won + last contact + won tag, and the handoff note is written once", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "h1" } } }, put(contact()), { status: 201, body: { tags: [WON_TAG] } });
  await markSourceLead(ID, "https://creativecowboys.monday.com/boards/1/pulses/2", "hand-1");
  const writes = requests.filter((x) => x.method !== "GET");
  assert.ok(String((writes[0].body as { body: string }).body).includes("[CC-HANDOFF:hand-1]"));
  assert.deepEqual((writes[1].body as { customFields: { id: string; field_value: unknown }[] }).customFields.map((f) => f.id), [F.os, F.lc]);
  assert.deepEqual(writes[2].body, { tags: [WON_TAG] });
  queue.push(got(contact()), notes([{ id: "h1", body: "Handed off… [CC-HANDOFF:hand-1]" }]), put(contact()), { status: 201, body: { tags: [WON_TAG] } });
  await markSourceLead(ID, "https://x", "hand-1");
  assert.equal(requests.filter((x) => x.path.endsWith("/notes") && x.method === "POST").length, 1);
});
test("readLeadVersion uses dateUpdated and the business name", async () => {
  queue.push(got(contact()));
  assert.deepEqual(await readLeadVersion(ID), { updatedAt: v1, name: "Juniper & Co." });
  await assert.rejects(readLeadVersion("13149403716"), { status: 400 }); // a Monday id never reaches GHL
});
