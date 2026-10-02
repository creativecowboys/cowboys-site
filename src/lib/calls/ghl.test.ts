import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { assignOwner, callFields, formatCallNote, getCallLead, getCallsPage, isoDate, LEAD_TAGS, mapLead, markSourceLead, outcomeOption, readLeadVersion, rosterFilters, rosterTags, saveCall, setLeadSource, statusConfirm, unwrapCursor, WON_TAG } from "./ghl";
import { validateAssign, validateCallDraft, validateLeadId } from "./validation";
import { contactStage, filterRoster, isOffCallList, OFF_LIST_VIEW, offListReasons } from "./roster";
import { forgetCustomFields } from "@/lib/ghl/client";
import { resolveFromDefs } from "@/lib/ghl/fields";
import { ghlRepIds } from "@/lib/ghl/reps";
import type { CallDraft } from "@/app/leads/types";

// The GHL twin of owner.test.ts: same guarantees (version check, readback confirmation, idempotent saves),
// against a mocked GoHighLevel. Field ids below are fictional; the desk resolves real ones by name.
const F = { ls: "fLeadSource", os: "fOutreach", it: "fInterest", lc: "fLastContact", nf: "fNextFollowup", nt: "fNextFollowupTime", qm: "fQuoted", ii: "fInterestedIn", sn: "fSalesNotes", ml: "fMondayId", as: "fAuditScore", ar: "fAuditReport" };
const DEFS = { customFields: [
  { id: F.ls, name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] },
  { id: F.os, name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["Not Contacted", "Call Booked", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number", "Won", "In progress"] },
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
  requests = []; queue = []; forgetCustomFields(); statusConfirm.retryMs = 0;
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
/** The contact as GoHighLevel returns it when the desk reads the status back after a save. */
const holds = (status: string, over: Record<string, unknown> = {}) => got(contact({ dateUpdated: v2, customFields: [{ id: F.os, value: status }], ...over }));
const paths = () => requests.map((r) => `${r.method} ${r.path.split("?")[0]}`);

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
test("date fields read as YYYY-MM-DD whether GHL returns an ISO string, an ISO timestamp or an epoch", () => {
  assert.equal(isoDate("2026-10-07"), "2026-10-07"); assert.equal(isoDate("2026-10-07T00:00:00.000Z"), "2026-10-07");
  assert.equal(isoDate(String(Date.UTC(2026, 9, 7))), "2026-10-07"); // midnight UTC, ms
  assert.equal(isoDate(String(Date.UTC(2026, 9, 7) / 1000)), "2026-10-07"); // seconds
  assert.equal(isoDate(String(Date.UTC(2026, 9, 7, 4, 0, 0))), "2026-10-07"); // midnight Eastern (EDT) stored as a moment
  assert.equal(isoDate(String(Date.UTC(2026, 9, 8, 2, 30, 0))), "2026-10-07"); // 10:30pm Eastern on the 7th
  assert.equal(isoDate(""), ""); assert.equal(isoDate("soon"), "");
  assert.equal(mapLead(contact({ customFields: [{ id: F.lc, value: Date.UTC(2026, 8, 28) }, { id: F.nf, value: "2026-10-03T00:00:00.000Z" }] }), fields).lastContact, "2026-09-28");
});
test("roster filters: an OR of the lead tags plus 'has a Lead Source'", () => {
  assert.deepEqual(rosterFilters("fLeadSource"), [{ group: "OR", filters: [...LEAD_TAGS.map((t) => ({ field: "tags", operator: "eq", value: t })), { field: "customFields.fLeadSource", operator: "exists" }] }]);
  assert.equal((rosterFilters(undefined)[0] as { filters: unknown[] }).filters.length, LEAD_TAGS.length);
});
test("LEADS_GHL_TAGS narrows the roster to exactly those tags (no Lead Source clause); junk entries are ignored", () => {
  assert.deepEqual(rosterTags("sales-lead, playbook-lead ,,"), { tags: ["sales-lead", "playbook-lead"], custom: true });
  assert.deepEqual(rosterTags(""), { tags: [...LEAD_TAGS], custom: false });
  assert.deepEqual(rosterTags("<script>"), { tags: [...LEAD_TAGS], custom: false });
  assert.deepEqual(rosterFilters("fLeadSource", "sales-lead,website-form"), [{ group: "OR", filters: [{ field: "tags", operator: "eq", value: "sales-lead" }, { field: "tags", operator: "eq", value: "website-form" }] }]);
});
test("getCallsPage: one request for a small roster, owners and lead-source options come back with it", async () => {
  queue.push(defs(), { status: 200, body: { contacts: [contact(), contact({ id: "second00000000000000", companyName: "Second" })], total: 2 } });
  const page = await getCallsPage(null);
  assert.equal(page.system, "ghl"); assert.equal(page.leads.length, 2); assert.equal(page.cursor, null); assert.equal(page.noCallTagsRead, true);
  assert.deepEqual(page.owners.map((o) => o.name), ["Dave", "Josh", "Keaton"]); assert.deepEqual(page.leadSources, DEFS.customFields[0].picklistOptions);
  assert.deepEqual((requests[1].body as { sort: unknown }).sort, [{ field: "dateAdded", direction: "desc" }]);
  assert.equal((requests[1].body as { pageLimit: number }).pageLimit, 500);
});
test("getCallsPage never lists the designated test contact", async () => {
  queue.push(defs(), { status: 200, body: { contacts: [contact(), contact({ id: "C8FHl1LIfXEMI9isByB2", companyName: "Test — Claude" })], total: 2 } });
  assert.deepEqual((await getCallsPage(null)).leads.map((l) => l.id), [ID]);
});
test("mapLead carries the contact's no-call tags (and only those) for the desk", () => {
  assert.deepEqual(mapLead(contact(), fields).noCallTags, []);
  assert.deepEqual(mapLead(contact({ tags: ["giveaway-entrant", "do-not-contact", "concept-not-interested", "Fake-Lead"] }), fields).noCallTags, ["do-not-contact", "fake-lead"]);
  assert.deepEqual(mapLead(contact({ tags: undefined }), fields).noCallTags, []);
});
test("off the call list: the roster search is unchanged and read-only, off-list leads still come back, and the desk's views split them", async () => {
  const notInterested = contact({ id: "notint00000000000000", companyName: "Said No Co", customFields: [{ id: F.os, value: "Not Interested" }] });
  const doNotContact = contact({ id: "dnc00000000000000000", companyName: "Do Not Contact Co", tags: ["giveaway-entrant", "do-not-contact"] });
  const fake = contact({ id: "fake0000000000000000", companyName: "Fake Co", tags: ["sales-lead", "fake-lead"], customFields: [{ id: F.os, value: "Not Interested" }] });
  const concept = contact({ id: "concept0000000000000", companyName: "Concept Co", tags: ["giveaway-entrant", "concept-not-interested", "spoke-to-ai"] });
  queue.push(defs(), { status: 200, body: { contacts: [contact(), notInterested, doNotContact, fake, concept], total: 5 } });
  const page = await getCallsPage(null);
  assert.equal(page.leads.length, 5);
  assert.deepEqual((requests[1].body as { filters: unknown }).filters, rosterFilters(F.ls)); // nothing about status or these tags is sent to GHL
  assert.deepEqual(requests.map((r) => `${r.method} ${r.path.split("?")[0]}`), ["GET /locations/LOCtest000000000000/customFields", "POST /contacts/search"]); // a search, no write
  const ids = (v: string) => filterRoster(page.leads, { view: v, owner: "", status: "", source: "", search: "" }).map((l) => l.id).sort();
  assert.deepEqual(ids("all"), [ID, "concept0000000000000"].sort());
  assert.deepEqual(ids(OFF_LIST_VIEW), ["dnc00000000000000000", "fake0000000000000000", "notint00000000000000"]);
  assert.deepEqual(Object.fromEntries(page.leads.map((l) => [l.name, offListReasons(l)])), { "Juniper & Co.": [], "Said No Co": ["not-interested"], "Do Not Contact Co": ["do-not-contact"], "Fake Co": ["not-interested", "fake-lead"], "Concept Co": [] });
});
test("getCallsPage says so when the search hands the roster back with no tags at all", async () => {
  queue.push(defs(), { status: 200, body: { contacts: [contact({ tags: undefined }), contact({ id: "second00000000000000", tags: [] })], total: 2 } });
  const blind = await getCallsPage(null);
  assert.equal(blind.leads.length, 2); assert.equal(blind.noCallTagsRead, false);
  queue.push({ status: 200, body: { contacts: [contact({ tags: undefined }), contact({ id: "second00000000000000", tags: ["sales-lead"] })], total: 2 } });
  assert.equal((await getCallsPage(null)).noCallTagsRead, true); // one tagged contact is proof the tags are coming through
  queue.push({ status: 200, body: { contacts: [], total: 0 } });
  assert.equal((await getCallsPage(null)).noCallTagsRead, true); // an empty roster is not a warning
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
test("saveCall: note first, then the fields, then the status is read back; the version is checked before anything is written", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("Booked followup"));
  const r = await saveCall(draft());
  assert.deepEqual(r, { saved: true, updateId: "n9", recordUrl: `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${ID}` });
  assert.deepEqual(paths(), ["GET /locations/LOCtest000000000000/customFields", `GET /contacts/${ID}`, `GET /contacts/${ID}/notes`, `POST /contacts/${ID}/notes`, `GET /contacts/${ID}`, `PUT /contacts/${ID}`, `GET /contacts/${ID}`]);
  const writes = requests.filter((x) => x.method !== "GET");
  assert.equal(writes[0].path, `/contacts/${ID}/notes`); assert.ok(String((writes[0].body as { body: string }).body).includes("[CC-CALL:6f1c2a4e"));
  assert.equal(writes[1].method, "PUT"); assert.deepEqual((writes[1].body as { customFields: unknown[] }).customFields, callFields(draft(), new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()), fields));
});
test("saveCall as Not interested writes one note and the status + last-contact fields — no tag, no DND, nothing removed", async () => {
  const tagged = contact({ tags: ["giveaway-entrant", "newsletter"] });
  queue.push(defs(), got(tagged), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(tagged), put(tagged), holds("Not Interested", { tags: tagged.tags }));
  const r = await saveCall(draft({ outcome: "Not interested", interest: "", followupDate: "", followupTime: "", quotedMonthly: "" }));
  assert.equal(r.saved, true); assert.equal(r.warning, undefined);
  const writes = requests.filter((x) => x.method !== "GET");
  assert.deepEqual(writes.map((w) => `${w.method} ${w.path}`), [`POST /contacts/${ID}/notes`, `PUT /contacts/${ID}`]);
  assert.deepEqual(writes[1].body, { customFields: [{ id: F.os, field_value: "Not Interested" }, { id: F.lc, field_value: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()) }] });
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

// ── "In progress" (Dave, Oct 2 2026): a lead the rep talked to and is still working ──
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
/** The field definitions with a different option list on Outreach Status (undefined = GoHighLevel sends no list at all). */
const defsWithOutreach = (options: string[] | undefined) => ({ status: 200, body: { customFields: DEFS.customFields.map((d) => (d.id === F.os ? { ...d, picklistOptions: options } : d)) } });
const BEFORE_SETUP = ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won"]; // the live field on Oct 2 2026, before the option was added
const working = (over: Partial<CallDraft> = {}) => draft({ outcome: "In progress", interest: "", followupDate: "", followupTime: "", quotedMonthly: "", ...over });

test("In progress: a valid outcome with or without a follow-up date; the date is never required", () => {
  assert.equal(validateCallDraft(working(), ID).outcome, "In progress");
  assert.equal(validateCallDraft(working({ followupDate: "2026-10-09", followupTime: "09:30" }), ID).followupDate, "2026-10-09");
  assert.throws(() => validateCallDraft(working({ followupTime: "09:30" }), ID), { status: 400 }); // a time still needs its date, as for every outcome
  for (const near of ["in progress", "In Progress", "Inprogress", "Contacted"]) assert.throws(() => validateCallDraft({ ...working(), outcome: near }, ID), { status: 400 });
});
test("In progress: sets Outreach Status and Last Contact; the follow-up date and time ride along only when given", () => {
  assert.deepEqual(callFields(working(), "2026-10-02", fields), [{ id: F.os, field_value: "In progress" }, { id: F.lc, field_value: "2026-10-02" }]);
  assert.deepEqual(callFields(working({ followupDate: "2026-10-09", followupTime: "14:00", interest: "Warm" }), "2026-10-02", fields),
    [{ id: F.os, field_value: "In progress" }, { id: F.lc, field_value: "2026-10-02" }, { id: F.it, field_value: "Warm" }, { id: F.nf, field_value: "2026-10-09" }, { id: F.nt, field_value: "14:00" }]);
  assert.deepEqual(callFields(working({ followupDate: "2026-10-09" }), "2026-10-02", fields).slice(2), [{ id: F.nf, field_value: "2026-10-09" }, { id: F.nt, field_value: "" }]); // a date with no time is an all-day follow-up
  assert.match(formatCallNote(working({ followupDate: "2026-10-09", followupTime: "14:00" })), /\nOutcome: In progress\n[\s\S]*Follow-up date: 2026-10-09 around 2:00 pm\n/);
  assert.doesNotMatch(formatCallNote(working()), /Follow-up date/);
});
test("saveCall as In progress: one note, then status + last contact; the lead stays on the call list as a working lead", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("In progress"));
  const r = await saveCall(working());
  assert.equal(r.saved, true); assert.equal(r.warning, undefined);
  const writes = requests.filter((x) => x.method !== "GET");
  assert.deepEqual(writes.map((w) => `${w.method} ${w.path}`), [`POST /contacts/${ID}/notes`, `PUT /contacts/${ID}`]); // no tag, nothing else
  assert.match(String((writes[0].body as { body: string }).body), /\nOutcome: In progress\n/);
  assert.deepEqual(writes[1].body, { customFields: [{ id: F.os, field_value: "In progress" }, { id: F.lc, field_value: today() }] });
  assert.equal(requests.filter((x) => x.path.includes("/customFields")).length, 1); // the option is there: no second look at the definitions
  const after = mapLead(contact({ customFields: [{ id: F.os, value: "In progress" }, { id: F.lc, value: today() }, { id: F.nf, value: "2026-10-09" }] }), fields);
  assert.equal(after.outreach, "In progress"); assert.equal(contactStage(after), "active"); assert.equal(isOffCallList(after), false);
  assert.deepEqual(filterRoster([after], { view: "active", owner: "", status: "In progress", source: "", search: "" }).map((l) => l.id), [ID]);
});
test("saveCall as In progress with a follow-up writes the date and time the same way a booked followup does", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("In progress"));
  assert.equal((await saveCall(working({ followupDate: "2026-10-09", followupTime: "14:00" }))).warning, undefined);
  const fieldWrite = requests.find((x) => x.method === "PUT")!.body as { customFields: { id: string; field_value: unknown }[] };
  assert.deepEqual(fieldWrite.customFields, [{ id: F.os, field_value: "In progress" }, { id: F.lc, field_value: today() }, { id: F.nf, field_value: "2026-10-09" }, { id: F.nt, field_value: "14:00" }]);
});
test("outcomeOption: ok when GoHighLevel has the option (any capitalisation), missing when its list lacks it, unknown when it sends no list", () => {
  const withOptions = (options: string[] | undefined) => resolveFromDefs(defsWithOutreach(options).body.customFields);
  assert.equal(outcomeOption(fields, "In progress"), "ok"); assert.equal(outcomeOption(fields, "Not interested"), "ok"); // "Not interested" is the "Not Interested" option
  assert.equal(outcomeOption(withOptions(BEFORE_SETUP), "In progress"), "missing"); assert.equal(outcomeOption(withOptions(BEFORE_SETUP), "Booked followup"), "ok");
  assert.equal(outcomeOption(withOptions([...BEFORE_SETUP, "In Progress"]), "In progress"), "ok");
  assert.equal(outcomeOption(withOptions(undefined), "In progress"), "unknown"); assert.equal(outcomeOption(withOptions([]), "Booked followup"), "unknown");
  assert.equal(outcomeOption(withOptions([{ label: "Booked followup" }] as unknown as string[]), "Booked followup"), "unknown"); // a list the desk cannot read never refuses a save
  assert.throws(() => outcomeOption(resolveFromDefs([]), "In progress"), { status: 503 }); // no Outreach Status field at all: the existing "run the field setup" refusal
});
test("until GoHighLevel has the option, an In progress save is refused in plain words before anything is written", async () => {
  queue.push(defsWithOutreach(BEFORE_SETUP), got(contact()), notes([]), defsWithOutreach(BEFORE_SETUP));
  await assert.rejects(saveCall(working()), (e: unknown) => {
    const err = e as { status?: number; message?: string };
    assert.equal(err.status, 503); // not a 409: the desk must not offer "load the latest record" for this
    assert.match(err.message || "", /^"In progress" is not an option on the "Outreach Status" field in GoHighLevel yet, so nothing was saved\. An owner needs to add it: run the GoHighLevel field setup/);
    assert.match(err.message || "", /Until then, choose a different outcome\.$/);
    return true;
  });
  assert.equal(requests.filter((x) => x.method !== "GET").length, 0); // no note, no field write, no tag
  assert.equal(requests.filter((x) => x.path.includes("/customFields")).length, 2); // it looked once more before refusing
  // The other outcomes are unaffected on the same field, and the same refusal would catch any option removed in GoHighLevel by mistake.
  queue.push(got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("Booked followup"));
  assert.equal((await saveCall(draft({ callId: "7f1c2a4e-3b7d-4c8e-9f01-23456789abcd" }))).warning, undefined);
  forgetCustomFields();
  const without = defsWithOutreach(BEFORE_SETUP.filter((o) => o !== "Booked followup"));
  queue.push(without, got(contact()), notes([]), without);
  await assert.rejects(saveCall(draft({ callId: "8f1c2a4e-3b7d-4c8e-9f01-23456789abcd" })), { status: 503, message: /^"Booked followup" is not an option on the "Outreach Status" field/ });
  assert.equal(requests.filter((x) => x.method === "POST" && x.path.endsWith("/notes")).length, 1); // only the one good save wrote a note
});
test("an option added a moment ago is found without waiting for the 10-minute definitions cache", async () => {
  queue.push(defsWithOutreach(BEFORE_SETUP), { status: 200, body: { contacts: [], total: 0 } });
  await getCallsPage(null); // this instance now holds the old option list
  queue.push(got(contact()), notes([]), defs(), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("In progress"));
  const r = await saveCall(working());
  assert.equal(r.saved, true); assert.equal(r.warning, undefined);
  assert.deepEqual((requests.find((x) => x.method === "PUT")!.body as { customFields: unknown[] }).customFields[0], { id: F.os, field_value: "In progress" });
});
test("an option an owner typed by hand as 'In Progress' is the same option: the save writes GoHighLevel's spelling", async () => {
  queue.push(defsWithOutreach([...BEFORE_SETUP, "In Progress"]), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("In Progress"));
  assert.equal((await saveCall(working())).warning, undefined);
  assert.deepEqual((requests.find((x) => x.method === "PUT")!.body as { customFields: unknown[] }).customFields[0], { id: F.os, field_value: "In Progress" });
  const held = mapLead(contact({ customFields: [{ id: F.os, value: "In Progress" }, { id: F.lc, value: today() }] }), fields);
  assert.equal(contactStage(held), "active"); assert.equal(isOffCallList(held), false);
});
test("when GoHighLevel sends no option list the save goes ahead, and the read-back says whether the status was kept", async () => {
  queue.push(defsWithOutreach(undefined), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("In progress"));
  const kept = await saveCall(working());
  assert.equal(kept.saved, true); assert.equal(kept.warning, undefined);
  queue.push(defsWithOutreach(undefined), got(contact()), notes([]), { status: 201, body: { note: { id: "n10" } } }, got(contact()), put(contact()), got(contact({ dateUpdated: v2 })), got(contact({ dateUpdated: v2 }))); // the status did not stick: still Call Booked, on both looks
  forgetCustomFields();
  const dropped = await saveCall(working({ callId: "9f1c2a4e-3b7d-4c8e-9f01-23456789abcd" }));
  assert.equal(dropped.saved, true);
  assert.equal(dropped.warning, 'Your call note is saved, but GoHighLevel did not keep the status "In progress" (the contact still says "Call Booked"). Check the Outreach Status options in GoHighLevel (Settings, Custom Fields) and set the status on the contact there.');
});
test("an option removed in GoHighLevel after this instance cached the list: the save is not reported clean, and the next one is refused", async () => {
  queue.push(defs(), { status: 200, body: { contacts: [], total: 0 } });
  await getCallsPage(null); // the cache now says In progress exists
  // ...and it has since been deleted in GoHighLevel, which keeps the old status when sent a value it has no option for.
  queue.push(got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), got(contact({ dateUpdated: v2 })), got(contact({ dateUpdated: v2 })));
  const first = await saveCall(working());
  assert.equal(first.saved, true); assert.match(first.warning || "", /^Your call note is saved, but GoHighLevel did not keep the status "In progress" \(the contact still says "Call Booked"\)\./);
  assert.equal(requests.filter((x) => x.path.includes("/customFields")).length, 1); // it trusted the cache once...
  queue.push(defsWithOutreach(BEFORE_SETUP), got(contact({ dateUpdated: v2 })), notes([]), defsWithOutreach(BEFORE_SETUP));
  await assert.rejects(saveCall(working({ callId: "af1c2a4e-3b7d-4c8e-9f01-23456789abcd", expectedUpdatedAt: v2 })), { status: 503 }); // ...and not again
  assert.equal(requests.filter((x) => x.method === "POST" && x.path.endsWith("/notes")).length, 1);
});
test("the read-back is not fooled by capitalisation or by a read that trails the write, and a read-back that fails is a warning, not a clean save", async () => {
  queue.push(defs(), got(contact()), notes([]), { status: 201, body: { note: { id: "n9" } } }, got(contact()), put(contact()), holds("IN PROGRESS"));
  assert.equal((await saveCall(working())).warning, undefined);
  queue.push(got(contact()), notes([]), { status: 201, body: { note: { id: "n11" } } }, got(contact()), put(contact()), got(contact({ dateUpdated: v2 })), holds("In progress")); // the first look is early, the second has it
  assert.equal((await saveCall(working({ callId: "cf1c2a4e-3b7d-4c8e-9f01-23456789abcd" }))).warning, undefined);
  assert.equal(requests.filter((x) => x.method === "GET" && x.path === `/contacts/${ID}`).length, 7); // 3 for the first save, 4 for the second
  queue.push(got(contact()), notes([]), { status: 201, body: { note: { id: "n10" } } }, got(contact()), put(contact()), { status: 404, body: { message: "gone" } });
  const unread = await saveCall(working({ callId: "bf1c2a4e-3b7d-4c8e-9f01-23456789abcd" }));
  assert.equal(unread.saved, true); assert.match(unread.warning || "", /^Your call note is saved\. GoHighLevel did not confirm all field updates\./);
});
test("a stale draft is told to reload first, as before, even when the option or the whole field is missing", async () => {
  queue.push(defsWithOutreach(BEFORE_SETUP), got(contact({ dateUpdated: v2 })), notes([]));
  await assert.rejects(saveCall(working()), { status: 409 });
  forgetCustomFields();
  queue.push({ status: 200, body: { customFields: DEFS.customFields.filter((d) => d.id !== F.os) } }, got(contact({ dateUpdated: v2 })), notes([]));
  await assert.rejects(saveCall(working()), { status: 409 });
  assert.equal(requests.filter((x) => x.method !== "GET").length, 0); assert.equal(requests.filter((x) => x.path.includes("/customFields")).length, 2); // no second look at the definitions for a draft that has to reload anyway
});
