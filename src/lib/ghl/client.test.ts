import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { addNote, contactDisplayName, createCustomField, fieldText, forgetCustomFields, ghl, GhlError, listCustomFields, normalizePhone, searchContacts, setCustomFieldOptions, splitName, updateContact } from "./client";

// Mocked fetch: each test queues responses; every request (method, path, body) is recorded.
type Req = { method: string; path: string; body: unknown; headers: Record<string, string> };
let requests: Req[];
let queue: ({ status: number; body: unknown; headers?: Record<string, string> } | Error)[];
const originalFetch = global.fetch;
const env = { token: process.env.GHL_API_TOKEN, location: process.env.GHL_LOCATION_ID };
beforeEach(() => {
  requests = []; queue = [];
  process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = "LOCtest000000000000";
  forgetCustomFields();
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    requests.push({ method: init?.method || "GET", path: u.replace("https://services.leadconnectorhq.com", ""), body: init?.body ? JSON.parse(String(init.body)) : undefined, headers: (init?.headers || {}) as Record<string, string> });
    const next = queue.shift();
    if (!next) throw new Error(`Unexpected upstream request ${init?.method} ${u}`);
    if (next instanceof Error) throw next;
    return new Response(JSON.stringify(next.body), { status: next.status, headers: next.headers });
  }) as typeof fetch;
});
afterEach(() => {
  global.fetch = originalFetch;
  if (env.token === undefined) delete process.env.GHL_API_TOKEN; else process.env.GHL_API_TOKEN = env.token;
  if (env.location === undefined) delete process.env.GHL_LOCATION_ID; else process.env.GHL_LOCATION_ID = env.location;
});

test("every call carries the bearer token and the 2021-07-28 version header", async () => {
  queue.push({ status: 200, body: { ok: true } });
  await ghl("GET", "/ping");
  assert.equal(requests[0].headers.Authorization, "Bearer nonfunctional-test-token");
  assert.equal(requests[0].headers.Version, "2021-07-28");
});
test("a GET retries after a 429 and honours a small Retry-After", async () => {
  queue.push({ status: 429, body: { message: "slow down" }, headers: { "retry-after": "0" } }, { status: 200, body: { contact: { id: "abc" } } });
  const r = await ghl<{ contact: { id: string } }>("GET", "/contacts/abc");
  assert.equal(r.contact.id, "abc"); assert.equal(requests.length, 2);
});
test("a write is NOT retried on a 5xx (it may already have been applied) and surfaces a GhlError", async () => {
  queue.push({ status: 502, body: { message: "upstream" } });
  await assert.rejects(ghl("POST", "/contacts/abc/notes", { body: "x" }), (e: unknown) => e instanceof GhlError && e.ghlStatus === 502 && e.status === 502);
  assert.equal(requests.length, 1);
});
test("a write IS retried once on 429 (rejected before processing)", async () => {
  queue.push({ status: 429, body: {}, headers: { "retry-after": "0" } }, { status: 201, body: { note: { id: "n1" } } });
  const n = await addNote("abc", "hello");
  assert.equal(n.id, "n1"); assert.equal(requests.length, 2);
});
test("401/403 are reported as a scope problem, never retried", async () => {
  queue.push({ status: 401, body: { message: "The token is not authorized for this scope." } });
  await assert.rejects(ghl("GET", "/users/"), (e: unknown) => e instanceof GhlError && e.scopeProblem && /scope/.test(e.message));
  assert.equal(requests.length, 1);
});
test("a network failure on a write says the change may have landed", async () => {
  queue.push(new Error("socket hang up"));
  await assert.rejects(ghl("PUT", "/contacts/abc", {}), /may or may not have been applied/);
});
test("search sends locationId, clamps pageLimit to 500 and passes filters/sort through", async () => {
  queue.push({ status: 200, body: { contacts: [{ id: "c1" }], total: 1 } });
  const r = await searchContacts({ filters: [{ field: "tags", operator: "eq", value: "giveaway-entrant" }], pageLimit: 9999, page: 2, sort: [{ field: "dateAdded", direction: "desc" }] });
  assert.equal(r.total, 1);
  assert.deepEqual(requests[0].body, { locationId: "LOCtest000000000000", page: 2, pageLimit: 500, filters: [{ field: "tags", operator: "eq", value: "giveaway-entrant" }], sort: [{ field: "dateAdded", direction: "desc" }] });
});
test("updateContact never sends locationId and requires a contact back", async () => {
  queue.push({ status: 200, body: { succeded: true, contact: { id: "c1", assignedTo: "u1" } } });
  const c = await updateContact("c1", { assignedTo: "u1" });
  assert.equal(c.assignedTo, "u1");
  assert.equal(requests[0].method, "PUT"); assert.equal(requests[0].path, "/contacts/c1");
  assert.equal("locationId" in (requests[0].body as object), false);
  queue.push({ status: 200, body: { succeded: true } });
  await assert.rejects(updateContact("c1", { assignedTo: null }), /did not confirm/);
});
test("custom field definitions are cached until forgotten", async () => {
  queue.push({ status: 200, body: { customFields: [{ id: "f1", name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["A"] }] } });
  assert.equal((await listCustomFields()).length, 1);
  assert.equal((await listCustomFields()).length, 1);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].path, "/locations/LOCtest000000000000/customFields?model=contact");
  forgetCustomFields();
  queue.push({ status: 200, body: { customFields: [] } });
  assert.equal((await listCustomFields()).length, 0); assert.equal(requests.length, 2);
});
test("createCustomField posts the same shape the LSE setup script used (model contact + options)", async () => {
  queue.push({ status: 201, body: { customField: { id: "new1", name: "Lead Source", fieldKey: "contact.lead_source", dataType: "SINGLE_OPTIONS", picklistOptions: ["A", "B"] } } });
  const f = await createCustomField({ name: "Lead Source", dataType: "SINGLE_OPTIONS", options: ["A", "B"], position: 201 });
  assert.equal(f.id, "new1");
  assert.deepEqual(requests[0].body, { name: "Lead Source", dataType: "SINGLE_OPTIONS", model: "contact", position: 201, options: ["A", "B"] });
});
test("setCustomFieldOptions PUTs the field its own name and position back with the list it is given, and forgets the cached definitions", async () => {
  queue.push({ status: 200, body: { customFields: [{ id: "f1", name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["A"] }] } });
  await listCustomFields(); // warm the cache
  queue.push({ status: 200, body: { customField: { id: "f1", name: "Outreach Status", dataType: "SINGLE_OPTIONS", picklistOptions: ["A", "B"] } } });
  const f = await setCustomFieldOptions({ id: "f1", name: "Outreach Status", position: 202, placeholder: "Pick one" }, ["A", "B"]);
  assert.equal(f?.id, "f1");
  assert.equal(requests[1].method, "PUT"); assert.equal(requests[1].path, "/locations/LOCtest000000000000/customFields/f1");
  assert.deepEqual(requests[1].body, { name: "Outreach Status", model: "contact", options: ["A", "B"], position: 202, placeholder: "Pick one" });
  queue.push({ status: 200, body: { customFields: [] } });
  assert.equal((await listCustomFields()).length, 0); assert.equal(requests.length, 3); // read again from GoHighLevel, not from memory
  queue.push({ status: 200, body: {} });
  assert.equal(await setCustomFieldOptions({ id: "f1", name: "Outreach Status" }, ["A"]), null); // no field in the answer: the caller reads it back anyway
  assert.deepEqual(requests[3].body, { name: "Outreach Status", model: "contact", options: ["A"] }); // nothing invented for a position or placeholder it was not given
  queue.push({ status: 200, body: { customFields: [{ id: "f1", name: "Outreach Status", dataType: "SINGLE_OPTIONS" }] } });
  await listCustomFields();
  queue.push({ status: 422, body: { message: ["property options should not exist"] } });
  await assert.rejects(setCustomFieldOptions({ id: "f1", name: "Outreach Status" }, ["A"]), (e: unknown) => e instanceof GhlError && e.ghlStatus === 422);
  assert.equal(requests.filter((r) => r.method === "PUT").length, 3); // a refused write is not retried
  queue.push({ status: 200, body: { customFields: [] } });
  await listCustomFields(); assert.equal(requests.at(-1)!.method, "GET"); // a refusal also drops the cache
});
test("helpers: field values, names and phones", () => {
  const c = { id: "c", customFields: [{ id: "a", value: "x" }, { id: "b", field_value: 5 }, { id: "d", value: ["one", "two"] }, { id: "e", value: { nested: true } }] };
  assert.equal(fieldText(c, "a"), "x"); assert.equal(fieldText(c, "b"), "5"); assert.equal(fieldText(c, "d"), "one, two"); assert.equal(fieldText(c, "e"), ""); assert.equal(fieldText(c, "zzz"), ""); assert.equal(fieldText(c, undefined), "");
  assert.equal(contactDisplayName({ id: "c", contactName: "Jane Q" }), "Jane Q");
  assert.equal(contactDisplayName({ id: "c", firstName: "Jane", lastName: "Q" }), "Jane Q");
  assert.equal(contactDisplayName({ id: "c", firstNameLowerCase: "jane", lastNameLowerCase: "q" }), "jane q");
  assert.deepEqual(splitName("  Jane  Q Public "), { firstName: "Jane", lastName: "Q Public" });
  assert.equal(normalizePhone("(386) 589-5606"), "+13865895606"); assert.equal(normalizePhone("13865895606"), "+13865895606"); assert.equal(normalizePhone("+44 20 7946 0958"), "+442079460958");
});
test("missing configuration is a 503 before any request", async () => {
  delete process.env.GHL_API_TOKEN;
  await assert.rejects(ghl("GET", "/x"), { status: 503 });
  assert.equal(requests.length, 0);
});
