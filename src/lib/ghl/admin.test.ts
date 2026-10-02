import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { backfillLeadSource, ghlIdFromLink, indexContacts, matchLead, migrationPatch } from "./admin";
import { forgetCustomFields, type GhlContact } from "./client";
import { resolveFromDefs } from "./fields";
import { ghlRepIds, MONDAY_IDS } from "./reps";
import { WON_TAG } from "@/lib/calls/ghl";
import type { CallLead } from "@/app/leads/types";

const F = { ls: "fLeadSource", os: "fOutreach", it: "fInterest", lc: "fLastContact", nf: "fNextFollowup", nt: "fNextFollowupTime", qm: "fQuoted", ii: "fInterestedIn", sn: "fSalesNotes", ml: "fMondayId", as: "fAuditScore", ar: "fAuditReport" };
const DEFS = [
  { id: F.ls, name: "Lead Source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] },
  { id: F.os, name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["Not Contacted", "Won"] }, { id: F.it, name: "Interest", dataType: "SINGLE_OPTIONS", picklistOptions: ["Cold", "Warm", "Hot"] },
  { id: F.lc, name: "Last Contact", dataType: "DATE" }, { id: F.nf, name: "Next Follow-up", dataType: "DATE" }, { id: F.nt, name: "Next Follow-up Time", dataType: "TEXT" }, { id: F.qm, name: "Quoted Monthly", dataType: "MONETORY" },
  { id: F.ii, name: "Interested In", dataType: "TEXT" }, { id: F.sn, name: "Sales Notes", dataType: "LARGE_TEXT" }, { id: F.ml, name: "Monday Lead ID", dataType: "TEXT" }, { id: F.as, name: "Audit Score", dataType: "NUMERICAL" }, { id: F.ar, name: "Audit Report URL", dataType: "TEXT" },
];
const fields = resolveFromDefs(DEFS);
const lead = (over: Partial<CallLead> = {}): CallLead => ({ id: "13149403716", name: "Bourbon Leather Company", contact: "Freddy Sumbay", email: "Freddy@Example.com", phone: "13865895606", website: "https://bourbon.example", city: "Villa Rica, GA", owner: "Dave Collum", ownerId: MONDAY_IDS.Dave, ownerIds: [MONDAY_IDS.Dave], ownerName: "Dave", outreach: "Call Booked", interest: "Hot", notes: "Josh's notes", lastContact: "2026-09-28", nextFollowup: "2026-09-30", nextFollowupTime: "13:30", quotedMonthly: "297", interestedIn: "Website, local search", auditScore: "62", auditReport: "https://audit.example/r", group: "Giveaway entries", leadSource: "", updatedAt: "2026-09-30T12:00:00Z", recordUrl: "", ...over });

test("migrationPatch: desk fields verbatim from Monday, owner mapped to the GHL user, contact blanks filled, nothing in GHL overwritten", () => {
  const p = migrationPatch(lead(), "Josh's notes", null, fields);
  const cf = Object.fromEntries((p.customFields || []).map((f) => [f.id, f.field_value]));
  assert.equal(cf[F.ml], "13149403716"); assert.equal(cf[F.os], undefined); // "Call Booked" is not an option on this (test) field list → left unset rather than guessed
  assert.equal(cf[F.it], "Hot"); assert.equal(cf[F.lc], "2026-09-28"); assert.equal(cf[F.nf], "2026-09-30"); assert.equal(cf[F.nt], "13:30"); assert.equal(cf[F.qm], 297);
  assert.equal(cf[F.ii], "Website, local search"); assert.equal(cf[F.sn], "Josh's notes"); assert.equal(cf[F.as], 62); assert.equal(cf[F.ar], "https://audit.example/r"); assert.equal(cf[F.ls], "The Big Giveaway");
  assert.equal(p.assignedTo, ghlRepIds().Dave);
  assert.equal(p.firstName, "Freddy"); assert.equal(p.lastName, "Sumbay"); assert.equal(p.companyName, "Bourbon Leather Company"); assert.equal(p.email, "freddy@example.com"); assert.equal(p.phone, "+13865895606"); assert.equal(p.city, "Villa Rica");
  assert.deepEqual(p.tags, ["sales-lead"]); // the curated Monday set stays addressable by one tag
  const existing: GhlContact = { id: "x", firstName: "F", companyName: "Keep me", email: "keep@example.com", phone: "+10000000000", website: "https://keep", city: "Keep", customFields: [{ id: F.ls, value: "Facebook" }, { id: F.as, value: 90 }] };
  const q = migrationPatch(lead({ group: "Won", outreach: "Won" }), "", existing, fields);
  const qf = Object.fromEntries((q.customFields || []).map((f) => [f.id, f.field_value]));
  assert.equal(qf[F.os], "Won"); assert.deepEqual(q.tags, ["sales-lead", WON_TAG]);
  assert.equal(qf[F.ls], undefined); assert.equal(qf[F.as], undefined); // existing GHL values win
  for (const k of ["firstName", "companyName", "email", "phone", "website", "city"] as const) assert.equal(q[k], undefined);
  const unowned = migrationPatch(lead({ ownerIds: [] }), "", null, fields);
  assert.equal(unowned.assignedTo, undefined);
});

const mondayItem = (id: string, link: { text?: string; url?: string } | null = null) => ({ id, name: "x", updated_at: "", board: { id: "18430997894" }, group: null, column_values: [{ id: "ghl_contact", text: link?.text || link?.url || null, value: link ? JSON.stringify(link) : null }] });
test("the Monday GHL Contact link yields a contact id from a URL or bare text, and nothing from junk", () => {
  assert.equal(ghlIdFromLink(mondayItem("1", { url: "https://app.gohighlevel.com/v2/location/LOC/contacts/detail/ocQHyuzHvysMo5N5VsXc", text: "GHL" })), "ocQHyuzHvysMo5N5VsXc");
  assert.equal(ghlIdFromLink(mondayItem("1", { text: "ocQHyuzHvysMo5N5VsXc" })), "ocQHyuzHvysMo5N5VsXc");
  assert.equal(ghlIdFromLink(mondayItem("1", { url: "https://example.com/somewhere", text: "link" })), "");
  assert.equal(ghlIdFromLink(mondayItem("1", null)), "");
});
test("matching: imported → GHL link → email → phone → create → unmatched; the oldest contact wins a duplicate", () => {
  const contacts: GhlContact[] = [
    { id: "aaaaaaaaaaaaaaaaaaaa", email: "First@Example.com", phone: "+13865550100" },
    { id: "bbbbbbbbbbbbbbbbbbbb", email: "first@example.com" }, // duplicate email, added later → loses
    { id: "cccccccccccccccccccc", phone: "(386) 555-0101" },
    { id: "dddddddddddddddddddd", customFields: [{ id: F.ml, value: "777" }] },
    { id: "ocQHyuzHvysMo5N5VsXc" },
  ];
  const ix = indexContacts(contacts, F.ml);
  assert.equal(ix.total, 5);
  const m = (id: string, over: Partial<CallLead>, link: { text?: string; url?: string } | null = null) => { const r = matchLead(mondayItem(id, link), lead({ email: "", phone: "", ...over }), ix); return [r.match, r.contact?.id || ""]; };
  assert.deepEqual(m("777", { email: "first@example.com" }), ["imported", "dddddddddddddddddddd"]);
  assert.deepEqual(m("1", { email: "first@example.com" }, { text: "ocQHyuzHvysMo5N5VsXc" }), ["ghl-link", "ocQHyuzHvysMo5N5VsXc"]);
  assert.deepEqual(m("2", { email: " FIRST@example.com " }), ["email", "aaaaaaaaaaaaaaaaaaaa"]);
  assert.deepEqual(m("3", { email: "nobody@example.com", phone: "13865550101" }), ["phone", "cccccccccccccccccccc"]);
  assert.deepEqual(m("4", { email: "new@example.com" }), ["create", ""]);
  assert.deepEqual(m("5", { phone: "555" }), ["unmatched", ""]);
  assert.deepEqual(m("6", { email: "x@y.co" }, { text: "zzzzzzzzzzzzzzzzzzzz" }), ["create", ""]); // a link to a contact that no longer exists is ignored
});

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
const c = (id: string, tags: string[], ls?: string): GhlContact => ({ id, contactName: id, tags, customFields: ls ? [{ id: F.ls, value: ls }] : [] });

test("backfill dry run counts per tag, skips contacts that already have a source or an earlier-priority tag, writes nothing", async () => {
  queue.push({ status: 200, body: { customFields: DEFS } });
  queue.push({ status: 200, body: { contacts: [c("g1", ["giveaway-entrant"]), c("g2", ["giveaway-entrant"], "Facebook"), c("gp", ["giveaway-entrant", "playbook-lead"])], total: 3 } }); // giveaway-entrant
  queue.push({ status: 200, body: { contacts: [c("p1", ["playbook-lead"]), c("gp", ["giveaway-entrant", "playbook-lead"])], total: 2 } }); // playbook-lead
  queue.push({ status: 200, body: { contacts: [], total: 0 } }); // website-form
  const r = await backfillLeadSource(true);
  assert.equal(r.dryRun, true);
  assert.deepEqual(r.perSource.map((x) => [x.tag, x.tagged, x.alreadySet, x.skippedOtherTag, x.toSet, x.set]), [["giveaway-entrant", 3, 1, 0, 2, 0], ["playbook-lead", 2, 0, 1, 1, 0], ["website-form", 0, 0, 0, 0, 0]]);
  assert.equal(requests.filter((x) => x.method === "PUT").length, 0);
});
test("backfill real run writes only where empty, respects the batch limit and reports the remainder", async () => {
  queue.push({ status: 200, body: { customFields: DEFS } });
  queue.push({ status: 200, body: { contacts: [c("g1", ["giveaway-entrant"]), c("g2", ["giveaway-entrant"]), c("g3", ["giveaway-entrant"], "Other")], total: 3 } });
  queue.push({ status: 200, body: { succeded: true, contact: { id: "g1" } } });
  queue.push({ status: 200, body: { contacts: [], total: 0 } }, { status: 200, body: { contacts: [], total: 0 } });
  const r = await backfillLeadSource(false, 1);
  assert.equal(r.perSource[0].set, 1); assert.equal(r.remaining, 1);
  const put = requests.find((x) => x.method === "PUT")!;
  assert.equal(put.path, "/contacts/g1"); assert.deepEqual(put.body, { customFields: [{ id: F.ls, field_value: "The Big Giveaway" }] });
});
test("backfill refuses to run when GHL's Lead Source is missing an option it would write", async () => {
  queue.push({ status: 200, body: { customFields: DEFS.map((d) => (d.id === F.ls ? { ...d, picklistOptions: ["Facebook"] } : d)) } });
  queue.push({ status: 200, body: { contacts: [], total: 0 } });
  await assert.rejects(backfillLeadSource(true), { status: 409 });
});
