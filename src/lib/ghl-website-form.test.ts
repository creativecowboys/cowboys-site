import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { pushWebsiteFormToGHL, websiteFormNote, websiteFormPayload, websiteFormsToGhl } from "./ghl-website-form";
import { forgetCustomFields } from "./ghl/client";
import { resetIntakeLookup } from "./ghl/fields";

type Req = { method: string; path: string; body: unknown };
let requests: Req[];
let queue: { status: number; body: unknown }[];
const originalFetch = global.fetch;
beforeEach(() => {
  requests = []; queue = []; forgetCustomFields(); resetIntakeLookup();
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  process.env.WEBSITE_FORMS_TO_GHL = "on"; delete process.env.LEADS_BACKEND;
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ method: init?.method || "GET", path: String(url).replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${url}`);
    return new Response(JSON.stringify(next.body), { status: next.status });
  }) as typeof fetch;
});
afterEach(() => { global.fetch = originalFetch; });

test("website forms stay out of GHL until the desk is on GHL, with an explicit override either way", async () => {
  assert.equal(websiteFormsToGhl({}), false); assert.equal(websiteFormsToGhl({ LEADS_BACKEND: "monday" }), false);
  assert.equal(websiteFormsToGhl({ LEADS_BACKEND: "ghl" }), true);
  assert.equal(websiteFormsToGhl({ LEADS_BACKEND: "ghl", WEBSITE_FORMS_TO_GHL: "off" }), false);
  assert.equal(websiteFormsToGhl({ WEBSITE_FORMS_TO_GHL: "ON" }), true);
  delete process.env.WEBSITE_FORMS_TO_GHL; // default: off while LEADS_BACKEND is unset
  assert.equal(await pushWebsiteFormToGHL({ name: "A B", email: "a@b.co", message: "hi" }), "");
  assert.equal(requests.length, 0); // not one request to GHL
});
test("website form payload: split name, E.164 phone, form name as GHL source, website-form tag, Lead Source = Website form", () => {
  const p = websiteFormPayload({ name: "Jane Q Public", email: "Jane@Example.com", phone: "(770) 555-0199", company: "Public Plumbing", source: "Homepage Popup", service: "Local SEO", message: "Need more calls" }, "LOC", "fLS");
  assert.deepEqual(p, { locationId: "LOC", firstName: "Jane", lastName: "Q Public", email: "jane@example.com", phone: "+17705550199", companyName: "Public Plumbing", source: "Website form: Homepage Popup", tags: ["website-form"], customFields: [{ id: "fLS", field_value: "Website form" }] });
  assert.equal(websiteFormPayload({ name: "Solo", email: "s@x.co" }, "LOC").source, "Website form: Contact form");
  assert.deepEqual(websiteFormPayload({ name: "Solo", email: "s@x.co" }, "LOC").customFields, []);
  assert.equal(websiteFormNote({ name: "x", email: "y", source: "Contact page", service: "Select a service...", industry: "Roofing", message: "Hi" }), "Website form: Contact page\nIndustry: Roofing\nMessage: Hi");
});
test("push: resolves Lead Source by name, upserts, then adds the note; the contact id comes back", async () => {
  queue.push({ status: 200, body: { customFields: [{ id: "fLS", name: "Lead Source", dataType: "SINGLE_OPTIONS", picklistOptions: ["Website form"] }] } });
  queue.push({ status: 200, body: { new: true, contact: { id: "newContact0000000000" } } });
  queue.push({ status: 201, body: { note: { id: "n1" } } });
  const id = await pushWebsiteFormToGHL({ name: "Jane Public", email: "jane@example.com", message: "Need more calls", source: "Contact page" });
  assert.equal(id, "newContact0000000000");
  assert.equal(requests[1].path, "/contacts/upsert"); assert.deepEqual((requests[1].body as { customFields: unknown[] }).customFields, [{ id: "fLS", field_value: "Website form" }]);
  assert.equal(requests[2].path, "/contacts/newContact0000000000/notes");
});
test("push never throws: a failed field read is ONE attempt, still upserts (without Lead Source), and is not asked again for a minute", async () => {
  queue.push({ status: 500, body: {} }); // the intake lookup does not retry
  queue.push({ status: 200, body: { new: false, contact: { id: "existing000000000000" } } });
  assert.equal(await pushWebsiteFormToGHL({ name: "A B", email: "a@b.co" }), "existing000000000000");
  assert.equal(requests.length, 2);
  assert.deepEqual((requests.at(-1)!.body as { customFields: unknown[] }).customFields, []);
  queue.push({ status: 200, body: { new: false, contact: { id: "existing000000000000" } } }); // second submission: no field read at all
  await pushWebsiteFormToGHL({ name: "A B", email: "a@b.co" });
  assert.equal(requests.length, 3); assert.equal(requests[2].path, "/contacts/upsert");
});
test("push never throws: a failed upsert returns empty", async () => {
  queue.push({ status: 200, body: { customFields: [] } }, { status: 422, body: { message: "bad" } });
  assert.equal(await pushWebsiteFormToGHL({ name: "A B", email: "a@b.co" }), "");
});
