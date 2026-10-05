// TEST ONLY. An in-memory GoHighLevel for the desk tests: it replaces global.fetch and answers the handful of
// endpoints the desk uses (contacts, search, notes, tags, tasks, custom fields, location tags), plus canned
// Stripe reads and an optional Monday handler for the import tests. Every request is recorded, so a test can
// prove what was — and was not — written: no LSE field, no `lse:` tag, no call to Monday.
// Behaviour copied from what Phase 1 saw on the real API: PUT merges custom fields and bumps dateUpdated,
// PUT with locationId is a 422, search can lag behind writes, GET /users is a 401 for this token.
// Never imported by application code.
import { forgetCustomFields, type GhlContact, type GhlFieldDef } from "@/lib/ghl/client";
import { SALES_FIELDS } from "@/lib/ghl/fields";
import { DESK_FIELDS, DESK_FIELD_KEYS, resetDeskFieldCheck } from "../fields";

export type Recorded = { host: string; method: string; path: string; body: unknown };
export type FakeNote = { id: string; body: string; userId?: string; dateAdded: string; contactId: string };
export type FakeTask = { id: string; title: string; body?: string; dueDate: string; completed: boolean; assignedTo?: string; contactId: string };
type Filter = { field?: string; operator?: string; value?: unknown; group?: "AND" | "OR"; filters?: Filter[] };
type MondayHandler = (query: string, variables: Record<string, unknown>) => unknown;

export const GHL_HOST = "https://services.leadconnectorhq.com";
export const LOCATION = "LOCtest000000000000";
const snake = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

export class FakeGhl {
  defs: GhlFieldDef[] = [];
  contacts = new Map<string, GhlContact>();
  notes: FakeNote[] = [];
  tasks: FakeTask[] = [];
  locationTags = new Set<string>();
  requests: Recorded[] = [];
  /** Canned Stripe objects by path (after /v1), e.g. "/customers/cus_1". Anything missing is a 404. */
  stripe = new Map<string, unknown>();
  monday: MondayHandler | null = null;
  /** When true, /contacts/search answers from the last settle() snapshot — GoHighLevel's index lags writes by a few seconds. */
  lag = false;
  /** Field NAME → max characters GoHighLevel "keeps" — to prove the desk notices a field that is too small instead of losing rows quietly. */
  truncate = new Map<string, number>();
  /** Field NAME → option values GoHighLevel silently "drops" from a multi-select on save (an option the field does not have, a label it cannot hold). */
  drop = new Map<string, string[]>();
  /** When true, /contacts/search returns contacts the way the real API sometimes does: no firstName / lastName / contactName, only the lower-cased pair. */
  searchOmitsNames = false;
  /** Field NAMES GoHighLevel "refuses": any PUT that carries one is a 422 and changes nothing — a value shape the real API does not take. */
  refuse = new Set<string>();
  /** Tasks: GoHighLevel's spec makes dueDate required on create, so the fake refuses a task without one (set false to accept it). */
  taskNeedsDueDate = true;
  /** When true, a task write also moves the contact's dateUpdated (unknown on the real API; the self-test measures it). */
  tasksBumpContact = false;
  /** One-shot failures: the first request whose "METHOD path" matches gets this status. */
  failures: { match: RegExp; status: number; body?: unknown }[] = [];
  private snapshot: GhlContact[] = [];
  private clock = Date.parse("2026-10-01T12:00:00.000Z");
  private seq = 0;
  private original: typeof fetch | null = null;

  install(): this {
    this.original = global.fetch;
    process.env.GHL_API_TOKEN = "nonfunctional-test-token"; process.env.GHL_LOCATION_ID = LOCATION; delete process.env.GHL_API_BASE;
    forgetCustomFields(); resetDeskFieldCheck();
    global.fetch = (async (input: string | URL | Request, init?: RequestInit) => this.handle(String(input), init)) as typeof fetch;
    return this;
  }
  restore(): void { if (this.original) global.fetch = this.original; this.original = null; }

  // ── set-up helpers ──
  tick(): string { this.clock += 1000; return new Date(this.clock).toISOString(); }
  newId(prefix = "c"): string { this.seq += 1; return `${prefix}${String(this.seq).padStart(4, "0")}`.padEnd(20, "Z").slice(0, 20); }
  addField(name: string, dataType: string, options?: string[]): GhlFieldDef {
    const def: GhlFieldDef = { id: `f_${snake(name)}`, name, fieldKey: `contact.${snake(name)}`, dataType, picklistOptions: options, model: "contact" };
    this.defs.push(def);
    return def;
  }
  /** All Phase-1 sales fields and all desk fields, as the setup routes would have created them. */
  addAllFields(): this {
    for (const def of Object.values(SALES_FIELDS)) this.addField(def.name, def.dataType, def.options);
    for (const key of DESK_FIELD_KEYS) this.addField(DESK_FIELDS[key].name, DESK_FIELDS[key].dataType, DESK_FIELDS[key].options);
    return this;
  }
  /** A few of Josh's LSE fields, so tests can prove the desk never writes them. */
  addLseFields(): this {
    for (const [name, type] of [["LSE Health", "SINGLE_OPTIONS"], ["LSE Profile Complete", "CHECKBOX"], ["LSE Term End", "DATE"], ["LSE Report URL", "TEXT"], ["LSE Build Week", "DATE"], ["LSE Onboard Link", "TEXT"], ["LSE Last Report Sent", "DATE"], ["LSE Next Offer", "SINGLE_OPTIONS"]] as const) this.addField(name, type);
    for (const tag of ["lse:client", "lse:payment-failed", "lse:cancel-request", "lse:red"]) this.locationTags.add(tag);
    return this;
  }
  fieldId(name: string): string {
    const def = this.defs.find((d) => d.name === name);
    if (!def) throw new Error(`fake GHL has no field named ${name}`);
    return def.id;
  }
  addContact(partial: Partial<GhlContact> & { fields?: Record<string, unknown> } = {}): GhlContact {
    const { fields, ...rest } = partial;
    const now = this.tick();
    const contact: GhlContact = { id: rest.id || this.newId(), locationId: LOCATION, tags: [], assignedTo: null, dateAdded: now, dateUpdated: now, customFields: [], ...rest };
    for (const [name, value] of Object.entries(fields || {})) contact.customFields!.push({ id: this.fieldId(name), value });
    if (!contact.contactName) contact.contactName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    this.contacts.set(contact.id, contact);
    for (const t of contact.tags || []) this.locationTags.add(t);
    return contact;
  }
  get(id: string): GhlContact { const c = this.contacts.get(id); if (!c) throw new Error(`fake GHL has no contact ${id}`); return c; }
  /** Value of a custom field on a contact, by field NAME. */
  value(id: string, fieldName: string): unknown { return this.get(id).customFields?.find((f) => f.id === this.fieldId(fieldName))?.value; }
  notesFor(id: string): FakeNote[] { return this.notes.filter((n) => n.contactId === id); }
  settle(): void { this.snapshot = [...this.contacts.values()].map((c) => structuredClone(c)); }
  // ── assertions ──
  writes(): Recorded[] { return this.requests.filter((r) => r.host === GHL_HOST && r.method !== "GET" && r.path !== "/contacts/search"); }
  mondayCalls(): number { return this.requests.filter((r) => r.host.includes("monday.com")).length; }
  /** Names of every custom field any PUT / POST wrote, and every tag any request added. */
  written(): { fields: string[]; tags: string[] } {
    const fields = new Set<string>(); const tags = new Set<string>();
    for (const r of this.writes()) {
      const body = (r.body || {}) as { customFields?: { id: string }[]; tags?: string[] };
      for (const f of body.customFields || []) fields.add(this.defs.find((d) => d.id === f.id)?.name || `unknown:${f.id}`);
      if (r.method !== "DELETE") for (const t of body.tags || []) tags.add(t);
    }
    return { fields: [...fields].sort(), tags: [...tags].sort() };
  }

  // ── the fake server ──
  private async handle(url: string, init?: RequestInit): Promise<Response> {
    const u = new URL(url);
    const method = (init?.method || "GET").toUpperCase();
    const host = `${u.protocol}//${u.host}`;
    let body: unknown;
    if (init?.body) { try { body = JSON.parse(String(init.body)); } catch { body = String(init.body); } }
    const path = u.pathname + u.search;
    this.requests.push({ host, method, path, body });
    const failure = this.failures.findIndex((f) => f.match.test(`${method} ${path}`));
    if (failure >= 0) { const [f] = this.failures.splice(failure, 1); return json(f.status, f.body ?? { message: "forced failure" }); }
    if (host === GHL_HOST) return this.ghl(method, u, body as Record<string, unknown> | undefined);
    if (host === "https://api.stripe.com") { const hit = this.stripe.get(path.replace(/^\/v1/, "")); return hit === undefined ? json(404, { error: { message: "No such object" } }) : json(200, hit); }
    if (host === "https://api.monday.com") {
      if (!this.monday) throw new Error(`The GoHighLevel desk must never call Monday (${method} ${url}).`);
      const b = body as { query: string; variables: Record<string, unknown> };
      return json(200, { data: this.monday(b.query, b.variables || {}) });
    }
    throw new Error(`Unexpected upstream request ${method} ${url}`);
  }

  private applyPatch(c: GhlContact, body: Record<string, unknown>): void {
    for (const key of ["firstName", "lastName", "email", "phone", "website", "city", "state", "source", "companyName", "assignedTo"] as const) {
      if (key in body) (c as Record<string, unknown>)[key] = body[key];
    }
    if ("firstName" in body || "lastName" in body) c.contactName = [c.firstName, c.lastName].filter(Boolean).join(" ");
    if (Array.isArray(body.tags)) { c.tags = [...new Set(body.tags as string[])]; for (const t of c.tags) this.locationTags.add(t); }
    for (const f of (body.customFields as { id: string; field_value: unknown }[] | undefined) || []) {
      if (!this.defs.some((d) => d.id === f.id)) throw new Error(`fake GHL: write to unknown custom field ${f.id}`);
      const list = (c.customFields ||= []);
      const hit = list.find((x) => x.id === f.id);
      const name = this.defs.find((d) => d.id === f.id)!.name;
      const max = this.truncate.get(name); const dropped = this.drop.get(name);
      const value = max !== undefined && typeof f.field_value === "string" ? f.field_value.slice(0, max) : dropped && Array.isArray(f.field_value) ? f.field_value.filter((v) => !dropped.includes(String(v))) : f.field_value;
      if (hit) hit.value = value; else list.push({ id: f.id, value });
    }
    c.dateUpdated = this.tick();
  }

  /** The real location refuses a second contact with the same email or phone, on create and on update, and names the one it clashes with. */
  private duplicate(body: Record<string, unknown> | undefined, selfId?: string): Response | null {
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : ""; const phone = typeof body?.phone === "string" ? body.phone : "";
    const hit = [...this.contacts.values()].find((c) => c.id !== selfId && ((!!email && (c.email || "").toLowerCase() === email) || (!!phone && c.phone === phone)));
    return hit ? json(400, { statusCode: 400, message: "This location does not allow duplicated contacts.", meta: { contactId: hit.id, matchingField: email && (hit.email || "").toLowerCase() === email ? "email" : "phone" } }) : null;
  }

  private matches(c: GhlContact, f: Filter): boolean {
    if (f.group) return f.group === "OR" ? (f.filters || []).some((x) => this.matches(c, x)) : (f.filters || []).every((x) => this.matches(c, x));
    const field = f.field || "";
    const actual: unknown = field === "tags" ? c.tags || [] : field.startsWith("customFields.") ? c.customFields?.find((x) => x.id === field.slice(13))?.value : (c as Record<string, unknown>)[field];
    const empty = actual === undefined || actual === null || actual === "" || (Array.isArray(actual) && !actual.length);
    switch (f.operator) {
      case "eq": return Array.isArray(actual) ? actual.map(String).includes(String(f.value)) : !empty && String(actual).toLowerCase() === String(f.value).toLowerCase();
      case "exists": return !empty;
      case "not_exists": return empty;
      case "contains": return !empty && JSON.stringify(actual).toLowerCase().includes(String(f.value).toLowerCase());
      default: throw new Error(`fake GHL: unsupported search operator ${f.operator}`);
    }
  }

  private ghl(method: string, u: URL, body: Record<string, unknown> | undefined): Response {
    const path = u.pathname;
    let m: RegExpExecArray | null;
    if ((m = /^\/locations\/([^/]+)\/customFields$/.exec(path))) {
      if (method === "GET") return json(200, { customFields: this.defs });
      if (method === "POST") { const def = this.addField(String(body?.name), String(body?.dataType), body?.options as string[] | undefined); return json(201, { customField: def }); }
    }
    if (/^\/locations\/[^/]+\/tags$/.test(path) && method === "GET") return json(200, { tags: [...this.locationTags].sort().map((name, i) => ({ id: `t${i}`, name, locationId: LOCATION })) });
    if (path === "/workflows/" && method === "GET") return json(200, { workflows: [] });
    if (path === "/users/" && method === "GET") return json(401, { message: "The token is not authorized for this scope." });
    if (path === "/contacts/search" && method === "POST") {
      const pool = (this.lag ? this.snapshot : [...this.contacts.values()]).filter((c) => ((body?.filters as Filter[] | undefined) || []).every((f) => this.matches(c, f)));
      const dir = ((body?.sort as { direction?: string }[] | undefined)?.[0]?.direction || "desc") === "asc" ? 1 : -1;
      pool.sort((a, b) => dir * String(a.dateAdded).localeCompare(String(b.dateAdded)));
      const limit = Number(body?.pageLimit) || 100; const page = Number(body?.page) || 1;
      const shape = (c: GhlContact): GhlContact => {
        const copy = structuredClone(c);
        if (this.searchOmitsNames) { copy.firstNameLowerCase = (copy.firstName || "").toLowerCase(); copy.lastNameLowerCase = (copy.lastName || "").toLowerCase(); delete copy.firstName; delete copy.lastName; delete copy.contactName; }
        return copy;
      };
      return json(200, { contacts: pool.slice((page - 1) * limit, page * limit).map(shape), total: pool.length });
    }
    if (path === "/contacts/" && method === "GET") { // the older free-text list endpoint (name, email, phone, company)
      const q = (u.searchParams.get("query") || "").toLowerCase(); const digits = q.replace(/\D/g, "");
      const hits = [...this.contacts.values()].filter((c) => [c.contactName, c.email, c.companyName].some((x) => (x || "").toLowerCase().includes(q)) || (digits.length >= 7 && (c.phone || "").replace(/\D/g, "").includes(digits)));
      return json(200, { contacts: hits.slice(0, Number(u.searchParams.get("limit")) || 20).map((c) => structuredClone(c)) });
    }
    if ((path === "/contacts/" || path === "/contacts/upsert") && method === "POST") {
      if (!body?.locationId) return json(422, { message: "locationId is required" });
      const email = String(body.email || "").toLowerCase(); const phone = String(body.phone || "");
      const existing = path === "/contacts/upsert" ? [...this.contacts.values()].find((c) => (email && (c.email || "").toLowerCase() === email) || (phone && c.phone === phone)) : undefined;
      if (existing) { this.applyPatch(existing, body); return json(200, { new: false, contact: structuredClone(existing) }); }
      if (path === "/contacts/") { const dup = this.duplicate(body); if (dup) return dup; }
      const c = this.addContact({ id: this.newId("n") });
      this.applyPatch(c, body);
      return json(201, { new: true, contact: structuredClone(c) });
    }
    if ((m = /^\/contacts\/([^/]+)$/.exec(path))) {
      const c = this.contacts.get(m[1]);
      if (!c) return json(400, { message: "Contact with id not found" });
      if (method === "GET") return json(200, { contact: structuredClone(c) });
      if (method === "PUT") {
        if (body && "locationId" in body) return json(422, { message: "property locationId should not exist" });
        const dup = this.duplicate(body, c.id); if (dup) return dup;
        const bad = ((body?.customFields as { id: string }[] | undefined) || []).map((x) => this.defs.find((d) => d.id === x.id)?.name || "").find((name) => this.refuse.has(name));
        if (bad) return json(422, { message: `Invalid value for custom field ${bad}` });
        this.applyPatch(c, body || {});
        return json(200, { succeded: true, contact: structuredClone(c) });
      }
    }
    if ((m = /^\/contacts\/([^/]+)\/notes$/.exec(path))) {
      if (!this.contacts.has(m[1])) return json(400, { message: "Contact with id not found" });
      if (method === "GET") return json(200, { notes: this.notesFor(m[1]) });
      if (method === "POST") {
        const note: FakeNote = { id: this.newId("note"), body: String(body?.body || ""), userId: body?.userId ? String(body.userId) : undefined, dateAdded: this.tick(), contactId: m[1] };
        this.notes.push(note);
        return json(201, { note });
      }
    }
    if ((m = /^\/contacts\/([^/]+)\/notes\/([^/]+)$/.exec(path)) && method === "DELETE") {
      const note = this.notes.find((n) => n.id === m![2] && n.contactId === m![1]);
      if (!note) return json(400, { message: "Note not found" });
      this.notes = this.notes.filter((n) => n !== note);
      return json(200, { succeded: true });
    }
    if ((m = /^\/contacts\/([^/]+)\/tags$/.exec(path))) {
      const c = this.contacts.get(m[1]);
      if (!c) return json(400, { message: "Contact with id not found" });
      const tags = (body?.tags as string[] | undefined) || [];
      if (method === "POST") { c.tags = [...new Set([...(c.tags || []), ...tags])]; for (const t of tags) this.locationTags.add(t); }
      else if (method === "DELETE") c.tags = (c.tags || []).filter((t) => !tags.includes(t));
      else return json(405, {});
      c.dateUpdated = this.tick();
      return json(201, { tags: c.tags });
    }
    if ((m = /^\/contacts\/([^/]+)\/tasks$/.exec(path)) && method === "GET") {
      if (!this.contacts.has(m[1])) return json(400, { message: "Contact with id not found" });
      // Newest first, the way the real API lists them (seen live Oct 4 2026).
      return json(200, { tasks: this.tasks.filter((t) => t.contactId === m![1]).map((t) => structuredClone(t)).reverse() });
    }
    if ((m = /^\/contacts\/([^/]+)\/tasks$/.exec(path)) && method === "POST") {
      if (!this.contacts.has(m[1])) return json(400, { message: "Contact with id not found" });
      if (this.taskNeedsDueDate && !body?.dueDate) return json(422, { statusCode: 422, message: ["dueDate must be a valid ISO 8601 date string"], error: "Unprocessable Entity" });
      if (body?.completed === undefined || !body?.title) return json(422, { statusCode: 422, message: ["title should not be empty", "completed must be a boolean value"] });
      const task: FakeTask = { id: this.newId("task"), title: String(body?.title || ""), body: body?.body ? String(body.body) : undefined, dueDate: String(body?.dueDate || ""), completed: !!body?.completed, assignedTo: body?.assignedTo ? String(body.assignedTo) : undefined, contactId: m[1] };
      this.tasks.push(task);
      if (this.tasksBumpContact) this.get(m[1]).dateUpdated = this.tick();
      return json(201, { task: structuredClone(task) });
    }
    if ((m = /^\/contacts\/([^/]+)\/tasks\/([^/]+)(\/completed)?$/.exec(path))) {
      const task = this.tasks.find((t) => t.id === m![2] && t.contactId === m![1]);
      if (!task) return json(400, { message: "Task not found" });
      if (method === "GET" && !m[3]) return json(200, { task: structuredClone(task) });
      if (method === "PUT" && m[3]) {
        if (typeof body?.completed !== "boolean") return json(422, { message: ["completed must be a boolean value"] });
        task.completed = body.completed;
        if (this.tasksBumpContact) this.get(m[1]).dateUpdated = this.tick();
        return json(200, { task: structuredClone(task) });
      }
      if (method === "DELETE" && !m[3]) { this.tasks = this.tasks.filter((t) => t !== task); return json(200, { succeded: true }); }
    }
    throw new Error(`fake GHL: no route for ${method} ${path}`);
  }
}
