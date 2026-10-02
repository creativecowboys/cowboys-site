import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { easternDay, formNotes, parseFormNote, prettyDay, shortBusinessType, tierLine, toldChip, toldFromContact, toldView, type LeadTold } from "./told";
import { getCallLead, getCallsPage, mapLead } from "./ghl";
import { forgetCustomFields } from "@/lib/ghl/client";
import { ensureSalesFields, INTAKE_FIELDS, matchField, resolveFromDefs, SALES_FIELDS } from "@/lib/ghl/fields";
import { websiteFormNote } from "@/lib/ghl-website-form";
import type { CallHistory, CallLead } from "@/app/leads/types";

// "What they told us" (Oct 2 2026). Every person and business below is made up; the shapes are the ones the intake routes
// write (src/lib/ghl-playbook.ts, src/lib/ghl-giveaway.ts, src/lib/ghl-website-form.ts).
const YEAR = 2026;
const lead = (told: LeadTold | undefined, over: Partial<CallLead> = {}): Pick<CallLead, "told" | "leadSource" | "city" | "website" | "auditScore" | "auditReport" | "interestedIn"> =>
  ({ told, leadSource: "", city: "", website: "", auditScore: "", auditReport: "", interestedIn: "", ...over });
const view = (l: ReturnType<typeof lead>, h: CallHistory[] = []) => toldView(l, h, YEAR);
const factLine = (v: ReturnType<typeof toldView>, i = 0) => v!.sections[i].facts.map((f) => `${f.label}: ${f.value}`).join(" · ");

// ── reading a contact ──
const ebookContact = { tags: ["playbook-lead", "playbook-hvac-gbp", "pb-tier-c"], source: "Playbook: HVAC GBP Fix (direct)", dateAdded: "2026-09-30T19:12:00.000Z",
  values: { playbookTrade: "HVAC", playbookCrew: "Just me", playbookJob: "Under $500", playbookHasWebsite: "No", playbookTier: "C", playbookCity: "Sample City" } };

test("an ebook lead: every answer from its fields, the playbook's title from the registry, 'direct' is not a campaign", () => {
  assert.deepEqual(toldFromContact(ebookContact), { added: "2026-09-30", ebook: { trade: "HVAC", playbook: "7-Day Google Business Profile Fix", crew: "Just me", job: "Under $500", website: "No", tier: "C", city: "Sample City" } });
});
test("an ebook lead whose fields are blank (an older contact): the trade and tier come from its tags, the campaign from the source line", () => {
  const told = toldFromContact({ tags: ["Playbook-Lead", "playbook-roofer-gbp", "pb-tier-a"], source: "Playbook: Roofing GBP Fix (facebook / fall-roofers)", values: { playbookTrade: "", playbookTier: " " } });
  assert.deepEqual(told.ebook, { trade: "Roofing", playbook: "7-Day Google Business Profile Fix", tier: "A", via: "facebook / fall-roofers" });
  assert.equal(told.added, undefined);
  // no tags at all: the source line alone still names the trade
  assert.deepEqual(toldFromContact({ source: "Playbook: Plumbing GBP Fix (google)" }).ebook, { trade: "Plumbing", playbook: "7-Day Google Business Profile Fix", via: "google" });
  // a playbook-lead tag and nothing else: a playbook, no trade invented
  assert.deepEqual(toldFromContact({ tags: ["playbook-lead"] }).ebook, {});
});
test("the field wins over the tag; a second playbook is listed; a trade we have no playbook for keeps its own name", () => {
  const told = toldFromContact({ tags: ["playbook-hvac-gbp", "playbook-plumber-gbp", "playbook-landscape-pros-gbp", "pb-tier-b"], values: { playbookTrade: "Plumbing", playbookTier: "c" } });
  assert.equal(told.ebook!.trade, "Plumbing"); assert.equal(told.ebook!.tier, "C");
  assert.deepEqual(told.ebook!.also, ["HVAC", "Landscape Pros"]);
  assert.equal(toldFromContact({ values: { playbookTrade: "Pool Service" } }).ebook!.playbook, undefined);
  assert.equal(toldFromContact({ values: { playbookTier: "Z" }, tags: ["playbook-lead"] }).ebook!.tier, undefined); // not a tier we know: left out
});
test("a giveaway entrant: business type, website yes/no from its tag, where it came from ('organic' is not a campaign)", () => {
  assert.deepEqual(toldFromContact({ tags: ["giveaway-entrant", "giveaway-no-site", "giveaway-trade"], source: "Big Giveaway", values: { giveawayBusinessType: "Home Services & Trades (plumbing, HVAC, roofing, etc.)", giveawaySource: "fb-reel-2" } }).giveaway,
    { businessType: "Home Services & Trades (plumbing, HVAC, roofing, etc.)", site: "no", via: "fb-reel-2" });
  assert.deepEqual(toldFromContact({ tags: ["giveaway-entrant", "giveaway-has-site"], values: { giveawaySource: "organic" } }).giveaway, { site: "yes" });
  assert.deepEqual(toldFromContact({ source: "Big Giveaway" }).giveaway, {}); // the source line alone says they entered
});
test("a website form: the form's name from the source line; the tag alone still says a form was sent", () => {
  assert.deepEqual(toldFromContact({ tags: ["website-form"], source: "Website form: Contact Page" }).form, { form: "Contact Page" });
  assert.deepEqual(toldFromContact({ tags: ["website-form"], source: "Playbook: HVAC GBP Fix (direct)" }).form, {}); // a later download replaced the source line
  assert.deepEqual(toldFromContact({ source: "Website form: Homepage Popup (Pricing)" }).form, { form: "Homepage Popup (Pricing)" });
});
test("a contact no form touched carries nothing but the day it came in", () => {
  assert.deepEqual(toldFromContact({ tags: ["sales-lead"], source: "manual", dateAdded: "2026-08-02T15:00:00.000Z" }), { added: "2026-08-02" });
  assert.deepEqual(toldFromContact({}), {});
  assert.deepEqual(toldFromContact({ tags: null, source: null, dateAdded: "soon" }), {});
});
test("days: the Eastern day of a moment, and a plain 'Sep 30' that never shifts a day", () => {
  assert.equal(easternDay("2026-10-01T02:34:26.952Z"), "2026-09-30"); // 10:34 pm Eastern on the 30th
  assert.equal(easternDay("2026-10-01T05:00:00.000Z"), "2026-10-01");
  assert.equal(easternDay(""), ""); assert.equal(easternDay(undefined), "");
  assert.equal(prettyDay("2026-09-30", YEAR), "Sep 30"); assert.equal(prettyDay("2025-12-01", YEAR), "Dec 1, 2025");
  assert.equal(prettyDay("2026-13-01", YEAR), ""); assert.equal(prettyDay("", YEAR), "");
});

// ── a website form's note ──
const formText = websiteFormNote({ name: "Pat Example", email: "pat@example.com", source: "Contact Page", service: "Local SEO", industry: "Roofing", message: "We need more calls.\nService: storm work only\nIndustry: we do metal too" });
test("the form note the intake writes is read back exactly: form, service, industry, and a message over several lines", () => {
  assert.deepEqual(parseFormNote(formText, "2026-10-02T14:00:00.000Z"), { form: "Contact Page", service: "Local SEO", industry: "Roofing", message: "We need more calls.\nService: storm work only\nIndustry: we do metal too", at: "2026-10-02T14:00:00.000Z" });
  assert.deepEqual(parseFormNote(websiteFormNote({ name: "P", email: "p@example.com", message: "Call me" })), { form: "Contact form", message: "Call me", at: "" });
  assert.deepEqual(parseFormNote(websiteFormNote({ name: "P", email: "p@example.com", source: "Homepage Popup (Hero)", service: "Website Design" })), { form: "Homepage Popup (Hero)", service: "Website Design", at: "" });
  for (const other of ["Call note — Creative Cowboys desk\nRep: Dave", "Handed off to onboarding.", "", "Imported from Monday: Website form: no"]) assert.equal(parseFormNote(other), null);
});
test("formNotes: only website form notes, newest first, never a call note", () => {
  const h: CallHistory[] = [
    { id: "n3", text: "Call note — Creative Cowboys desk\nRep: Josh\nOutcome: In progress", createdAt: "2026-10-03T10:00:00.000Z", author: "Josh", isCallNote: true },
    { id: "n2", text: websiteFormNote({ name: "P", email: "p@example.com", source: "AI Demo Page", message: "Second try" }), createdAt: "2026-10-02T10:00:00.000Z", author: "Team" },
    { id: "n1", text: formText, createdAt: "2026-09-29T10:00:00.000Z", author: "Team" },
  ];
  assert.deepEqual(formNotes(h).map((n) => n.form), ["AI Demo Page", "Contact Page"]);
  assert.deepEqual(formNotes([{ ...h[1], isCallNote: true }]), []);
});

// ── the panel's words ──
test("Dave's example: an ebook lead reads as one plain block", () => {
  const v = view(lead(toldFromContact(ebookContact), { leadSource: "Ebook download", city: "Sample City, TX" }));
  assert.equal(v!.cameIn, "Came in Sep 30");
  assert.equal(v!.sections.length, 1);
  assert.equal(v!.sections[0].title, "Downloaded the HVAC playbook (7-Day Google Business Profile Fix)");
  assert.equal(factLine(v), "Crew: Just me · Typical job: Under $500 · Website: No · Fit: Tier C (solo, small jobs)"); // the city is already on the lead
});
test("the tier in plain words, one line per tier", () => {
  assert.equal(tierLine("A"), "Tier A (best fit: a crew of 2 to 15, jobs of $2,000+, no website)");
  assert.equal(tierLine("B"), "Tier B (a crew, or jobs of $500+)");
  assert.equal(tierLine("C"), "Tier C (solo, small jobs)");
});
test("an ebook lead with a website, a campaign, a second playbook and a city the contact does not show", () => {
  const told = toldFromContact({ tags: ["playbook-lead", "playbook-plumber-gbp", "playbook-hvac-gbp", "pb-tier-b"], source: "Playbook: Plumbing GBP Fix (facebook / plumbers-oct)", values: { playbookTrade: "Plumbing", playbookCrew: "2 to 5", playbookJob: "$500 to $2,000", playbookHasWebsite: "Yes", playbookCity: "Elsewhere" } });
  const v = view(lead(told, { website: "https://www.pipes.example/home", city: "" }));
  assert.equal(v!.sections[0].title, "Downloaded the Plumbing playbook (7-Day Google Business Profile Fix)");
  assert.equal(factLine(v), "Also downloaded: the HVAC playbook · Crew: 2 to 5 · Typical job: $500 to $2,000 · Website: pipes.example · Fit: Tier B (a crew, or jobs of $500+) · City: Elsewhere · Came from: facebook / plumbers-oct");
  assert.equal(v!.sections[0].facts.find((f) => f.label === "Website")!.href, "https://www.pipes.example/home");
  assert.equal(view(lead(toldFromContact({ tags: ["playbook-lead"] })))!.sections[0].title, "Downloaded a playbook");
  assert.equal(view(lead(toldFromContact({ values: { playbookHasWebsite: "Yes" }, tags: ["playbook-lead"] })))!.sections[0].facts[0].value, "Yes"); // said yes, no address on file
});
test("a giveaway entrant: business type, website, campaign, the audit we sent and what they are interested in", () => {
  const told = toldFromContact({ tags: ["giveaway-entrant", "giveaway-has-site"], dateAdded: "2026-09-12T13:00:00.000Z", values: { giveawayBusinessType: "Beauty or Salon", giveawaySource: "ig-story" } });
  const v = view(lead(told, { leadSource: "The Big Giveaway", website: "glow.example", auditScore: "62", auditReport: "https://audit.example/r/1", interestedIn: "Website, local search" }));
  assert.equal(v!.cameIn, "Came in Sep 12");
  assert.equal(v!.sections[0].title, "Entered the Big Giveaway");
  assert.equal(factLine(v), "Business type: Beauty or Salon · Website: glow.example · Came from: ig-story · Site audit: 62/100 · Interested in: Website, local search");
  assert.equal(v!.sections[0].facts.find((f) => f.label === "Site audit")!.href, "https://audit.example/r/1");
  const noSite = view(lead(toldFromContact({ tags: ["giveaway-entrant", "giveaway-no-site"] })));
  assert.equal(factLine(noSite), "Website: None yet");
});
test("a website form lead: which form, the service, and their message from the note, with the day it was sent", () => {
  const told = toldFromContact({ tags: ["website-form"], source: "Website form: Contact Page", dateAdded: "2026-10-02T13:59:00.000Z" });
  const v = view(lead(told, { leadSource: "Website form" }), [{ id: "n1", text: formText, createdAt: "2026-10-02T14:00:00.000Z", author: "Team" }]);
  assert.equal(v!.sections[0].title, "Filled out a form on our website");
  assert.equal(factLine(v), "Form: Contact Page · Service: Local SEO · Industry: Roofing · Sent: Oct 2");
  assert.equal(v!.sections[0].message, "We need more calls.\nService: storm work only\nIndustry: we do metal too");
  // before the note is read (the roster) or when the form sent no message: the form's name only
  assert.equal(factLine(view(lead(told))), "Form: Contact Page");
  assert.deepEqual(view(lead(toldFromContact({ tags: ["website-form"] })))!.sections[0].facts, []);
  // a very long message is cut in the block (all of it stays in the history)
  const long = view(lead(told), [{ id: "n1", text: `Website form: Contact Page\nMessage: ${"x".repeat(2000)}`, createdAt: "2026-10-02T14:00:00.000Z", author: "Team" }]);
  assert.match(long!.sections[0].message!, /^x{1200}… \(the whole message is under Before you call\)$/);
});
test("a contact that came in more than one way: the Lead Source's section first, then ebook, website form, giveaway", () => {
  const told = toldFromContact({ tags: ["giveaway-entrant", "playbook-lead", "playbook-hvac-gbp", "website-form"], source: "Website form: Contact Page" });
  assert.deepEqual(view(lead(told, { leadSource: "The Big Giveaway" }))!.sections.map((s) => s.key), ["giveaway", "ebook", "form"]);
  assert.deepEqual(view(lead(told, { leadSource: "Website form" }))!.sections.map((s) => s.key), ["form", "ebook", "giveaway"]);
  assert.deepEqual(view(lead(told, { leadSource: "Referral" }))!.sections.map((s) => s.key), ["ebook", "form", "giveaway"]);
});
test("nothing to say, nothing shown: a Monday lead, a contact no form touched, or only the day it came in", () => {
  assert.equal(view(lead(undefined, { auditScore: "70", interestedIn: "SEO" })), null); // Monday lead: no block, whatever else it carries
  assert.equal(view(lead({})), null);
  assert.equal(view(lead({ added: "2026-09-01" }, { auditScore: "70", interestedIn: "SEO" })), null); // audit and interest show elsewhere on the lead
});
test("the roster chip: trade and tier for an ebook lead, a short business type and site for an entrant, nothing otherwise", () => {
  const chip = (told: LeadTold | undefined, leadSource = "") => toldChip({ told, leadSource });
  assert.equal(chip(toldFromContact(ebookContact), "Ebook download"), "HVAC · Tier C");
  assert.equal(chip(toldFromContact({ tags: ["playbook-roofer-gbp"] })), "Roofing");
  assert.equal(chip(toldFromContact({ tags: ["playbook-lead", "pb-tier-b"] })), "Tier B");
  assert.equal(chip(toldFromContact({ tags: ["giveaway-entrant", "giveaway-no-site"], values: { giveawayBusinessType: "Home Services & Trades (plumbing, HVAC, roofing, etc.)" } }), "The Big Giveaway"), "Trades · no site");
  assert.equal(chip(toldFromContact({ tags: ["giveaway-entrant", "giveaway-has-site"], values: { giveawayBusinessType: "Something Else" } }), "The Big Giveaway"), "has site");
  assert.equal(chip(toldFromContact({ tags: ["giveaway-entrant", "playbook-hvac-gbp", "pb-tier-a"], values: { giveawayBusinessType: "Automotive" } }), "The Big Giveaway"), "Automotive");
  assert.equal(chip(toldFromContact({ tags: ["giveaway-entrant", "playbook-hvac-gbp", "pb-tier-a"], values: { giveawayBusinessType: "Automotive" } }), "Ebook download"), "HVAC · Tier A");
  assert.equal(chip(toldFromContact({ tags: ["website-form"], source: "Website form: Contact Page" })), "");
  assert.equal(chip(toldFromContact({ tags: ["giveaway-entrant"] })), "");
  assert.equal(chip(undefined), "");
  assert.equal(shortBusinessType("Restaurant, Bar or Food"), "Food & drink"); assert.equal(shortBusinessType("Mobile pet grooming and boarding"), "Mobile pet grooming…"); assert.equal(shortBusinessType("Dog walking"), "Dog walking");
});

// ── the desk reads them by NAME from GoHighLevel, and only reads ──
const F = { ls: "fLeadSource", os: "fOutreach", it: "fInterest", lc: "fLastContact", nf: "fNextFollowup", nt: "fNextFollowupTime", qm: "fQuoted", ii: "fInterestedIn", sn: "fSalesNotes", ml: "fMondayId", as: "fAuditScore", ar: "fAuditReport",
  pt: "fPbTrade", pc: "fPbCrew", pj: "fPbJob", pw: "fPbSite", pr: "fPbTier", py: "fPbCity", gb: "fGwType", gs: "fGwSource" };
const SALES_DEFS = [
  { id: F.ls, name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] },
  { id: F.os, name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["Not Contacted", "In progress"] }, { id: F.it, name: "Interest", dataType: "SINGLE_OPTIONS", picklistOptions: ["Cold", "Warm", "Hot"] },
  { id: F.lc, name: "Last Contact", dataType: "DATE" }, { id: F.nf, name: "Next Follow-up", dataType: "DATE" }, { id: F.nt, name: "Next Follow-up Time", dataType: "TEXT" },
  { id: F.qm, name: "Quoted Monthly", dataType: "MONETORY" }, { id: F.ii, name: "Interested In", dataType: "TEXT" }, { id: F.sn, name: "Sales Notes", dataType: "LARGE_TEXT" },
  { id: F.ml, name: "Monday Lead ID", dataType: "TEXT" }, { id: F.as, name: "Audit Score", dataType: "NUMERICAL" }, { id: F.ar, name: "Audit Report URL", dataType: "TEXT" },
];
// As they are on the location: the playbook fields by their keys (contact.playbook_*), the giveaway ones found by name here.
const INTAKE_DEFS = [
  { id: F.pt, name: "Playbook Trade", fieldKey: "contact.playbook_trade", dataType: "TEXT" }, { id: F.pc, name: "Crew (renamed in GHL)", fieldKey: "contact.playbook_crew_size", dataType: "TEXT" },
  { id: F.pj, name: "Playbook Typical Job", fieldKey: "contact.playbook_typical_job", dataType: "TEXT" }, { id: F.pw, name: "Playbook Has Website", fieldKey: "contact.playbook_has_website", dataType: "TEXT" },
  { id: F.pr, name: "Playbook Tier", fieldKey: "contact.playbook_tier", dataType: "TEXT" }, { id: F.py, name: "Playbook City", fieldKey: "contact.playbook_city", dataType: "TEXT" },
  { id: F.gb, name: "Giveaway Business Type", dataType: "TEXT" }, { id: F.gs, name: "giveaway source", dataType: "TEXT" },
];
const ALL = { customFields: [...SALES_DEFS, ...INTAKE_DEFS] };
const ID = "TOLDtestContact00001";
const ebookGhl = (over: Record<string, unknown> = {}) => ({ id: ID, firstName: "Avery", contactName: "Avery", email: "avery@example.com", phone: "+13615550100", city: "Sample City", state: "TX",
  tags: ["playbook-lead", "playbook-hvac-gbp", "pb-tier-c"], source: "Playbook: HVAC GBP Fix (direct)", assignedTo: null, dateAdded: "2026-09-30T19:12:00.000Z", dateUpdated: "2026-10-02T17:42:45.781Z",
  customFields: [{ id: F.ls, value: "Ebook download" }, { id: F.pt, value: "HVAC" }, { id: F.pc, value: "Just me" }, { id: F.pj, value: "Under $500" }, { id: F.pw, value: "No" }, { id: F.pr, value: "C" }, { id: F.py, value: "Sample City" }], ...over });

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

test("the intake fields resolve by key or by name, beside the desk's own; the field setup still only knows the desk's fields", async () => {
  const fields = resolveFromDefs(ALL.customFields);
  for (const [key, id] of [["playbookTrade", F.pt], ["playbookCrew", F.pc], ["playbookJob", F.pj], ["playbookHasWebsite", F.pw], ["playbookTier", F.pr], ["playbookCity", F.py], ["giveawayBusinessType", F.gb], ["giveawaySource", F.gs]] as const) assert.equal(fields[key]?.id, id, key);
  assert.equal(fields.leadSource?.id, F.ls); assert.equal(matchField(ALL.customFields, "playbookCrew")?.id, F.pc); // renamed in GHL, still found by its key
  assert.ok(Object.values(INTAKE_FIELDS).every((name) => !Object.values(SALES_FIELDS).some((s) => s.name === name)));
  queue.push({ status: 200, body: { customFields: SALES_DEFS } }); // a location with none of the intake fields:
  const report = await ensureSalesFields(true);
  assert.deepEqual([...report.missing, ...report.created, ...report.failed], []); // ...is complete as far as the setup is concerned: it never creates them
});
test("mapLead: the ebook answers come with the lead, and a lead without the fields falls back to its tags and source line", () => {
  const withFields = mapLead(ebookGhl() as never, resolveFromDefs(ALL.customFields));
  assert.deepEqual(withFields.told, { added: "2026-09-30", ebook: { trade: "HVAC", playbook: "7-Day Google Business Profile Fix", crew: "Just me", job: "Under $500", website: "No", tier: "C", city: "Sample City" } });
  const without = mapLead(ebookGhl() as never, resolveFromDefs(SALES_DEFS));
  assert.deepEqual(without.told, { added: "2026-09-30", ebook: { trade: "HVAC", playbook: "7-Day Google Business Profile Fix", tier: "C" } });
  assert.equal(toldChip(withFields), "HVAC · Tier C");
});
test("roster and lead record: the same requests as before (one search, or one contact + its notes), nothing written", async () => {
  queue.push({ status: 200, body: ALL }, { status: 200, body: { contacts: [ebookGhl()], total: 1 } });
  const page = await getCallsPage(null);
  assert.equal(toldChip(page.leads[0]), "HVAC · Tier C");
  assert.deepEqual(requests.map((r) => `${r.method} ${r.path.split("?")[0]}`), ["GET /locations/LOCtest000000000000/customFields", "POST /contacts/search"]);
  const note = { id: "nForm", body: formText, dateAdded: "2026-10-02T14:00:00.000Z" }; // written by the intake with no user: shows as "Team"
  queue.push({ status: 200, body: { contact: ebookGhl({ tags: ["website-form"], source: "Website form: Contact Page", customFields: [{ id: F.ls, value: "Website form" }] }) } }, { status: 200, body: { notes: [note] } });
  const { lead: detail, history } = await getCallLead(ID);
  assert.deepEqual(requests.slice(2).map((r) => `${r.method} ${r.path}`), [`GET /contacts/${ID}`, `GET /contacts/${ID}/notes`]);
  assert.equal(requests.filter((r) => r.method !== "GET" && r.path !== "/contacts/search").length, 0);
  // the website form's note is in the lead's history, whole and readable, and the block reads it
  assert.deepEqual(history, [{ id: "nForm", text: formText, createdAt: "2026-10-02T14:00:00.000Z", author: "Team", isCallNote: false }]);
  const v = toldView(detail, history, YEAR);
  assert.equal(v!.sections[0].title, "Filled out a form on our website"); assert.equal(v!.sections[0].message, "We need more calls.\nService: storm work only\nIndustry: we do metal too");
});
