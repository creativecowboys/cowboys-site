import { CallDeskError } from "@/lib/calls/validation";
import { ghlContactUrl } from "./links";

// The ONE GoHighLevel client for the site (Oct 1 2026). Replaces the three separate fetch wrappers
// that lived in src/lib/packages/ghl.ts, src/lib/ghl-giveaway.ts and src/lib/ghl-playbook.ts.
//
// Server routes only — the token never reaches the browser. Env: GHL_API_TOKEN (GHL_TOKEN accepted),
// GHL_LOCATION_ID, GHL_USER_ID (optional sender for invoices), GHL_REP_IDS (optional override of the
// rep → user id table in src/lib/ghl/reps.ts).
//
// The token is the "LSE setup" Private Integration on the Creative Cowboys location (inspected in GHL
// Settings → Private Integrations, Oct 1 2026): contacts.*, locations/customFields.*, locations/tags.*,
// opportunities.*, invoices.*, products.*, locations.readonly. It has NO users.readonly scope, so
// GET /users 401s and the rep ids are a table, not a lookup.
// GHL_API_BASE exists for local end-to-end runs against a mock server (never set it on Vercel).
const BASE = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
export { GHL_APP } from "./links";
export const INVOICE_HOST = "https://link.fastpaydirect.com/invoice/";

export function ghlLocationId(): string {
  const v = process.env.GHL_LOCATION_ID;
  if (!v) throw new CallDeskError("GoHighLevel is not connected on this deployment (GHL_LOCATION_ID missing).", 503);
  return v;
}
function token(): string {
  const v = process.env.GHL_API_TOKEN || process.env.GHL_TOKEN;
  if (!v) throw new CallDeskError("GoHighLevel is not connected on this deployment (GHL_API_TOKEN missing).", 503);
  return v;
}
export const ghlConfigured = () => !!(process.env.GHL_API_TOKEN || process.env.GHL_TOKEN) && !!process.env.GHL_LOCATION_ID;

/** Link to a contact in the GHL app (what "Open in GoHighLevel" on the desk points at). */
export const contactUrl = (contactId: string) => ghlContactUrl(contactId);

/** A GHL API error, with the status and response body GHL gave us (sliced), for logs and the desk. */
export class GhlError extends CallDeskError {
  constructor(public method: string, public path: string, public ghlStatus: number, public body: string) {
    super(
      ghlStatus === 401 || ghlStatus === 403
        ? `GoHighLevel refused ${method} ${path} (${ghlStatus}). The site's GHL token is missing a scope for this call — check the Private Integration in GHL Settings.`
        : ghlStatus === 429
          ? "GoHighLevel is rate-limiting the site right now. Wait a few seconds and try again."
          : `GoHighLevel error ${ghlStatus} on ${method} ${path}: ${body.slice(0, 300)}`,
      ghlStatus === 429 ? 503 : 502,
    );
  }
  /** 401/403 = token scope problem (fix in GHL Settings → Private Integrations), not a bug. */
  get scopeProblem(): boolean { return this.ghlStatus === 401 || this.ghlStatus === 403; }
}

export type GhlOptions = { timeoutMs?: number; retries?: number };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One fetch with a timeout, typed errors and a 429 / 5xx backoff. GETs retry twice; writes retry ONLY on
 * 429 (GHL rejected the request before doing anything) and never on a timeout, because a timed-out write
 * may already have been applied — the callers verify by reading back instead.
 */
export async function ghl<T>(method: string, path: string, body?: unknown, opts: GhlOptions = {}): Promise<T> {
  const auth = token();
  const isRead = method === "GET";
  const retries = opts.retries ?? (isRead ? 2 : 1);
  let attempt = 0;
  for (;;) {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        method, headers: { Authorization: `Bearer ${auth}`, Version: VERSION, "Content-Type": "application/json", Accept: "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(opts.timeoutMs ?? 20000),
      });
    } catch (error) {
      if (isRead && attempt < retries) { attempt++; await sleep(400 * attempt); continue; }
      throw new CallDeskError(`GoHighLevel did not answer ${method} ${path} (${error instanceof Error ? error.name : "network"}).${isRead ? "" : " The change may or may not have been applied — reload before retrying."}`, 502);
    }
    const text = await res.text();
    if (res.ok) {
      try { return (text ? JSON.parse(text) : {}) as T; }
      catch { throw new CallDeskError(`GoHighLevel returned something that is not JSON for ${method} ${path}.`, 502); }
    }
    const retryable = res.status === 429 || (isRead && res.status >= 500);
    if (retryable && attempt < retries) {
      attempt++;
      const after = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(after) && after > 0 ? Math.min(after, 10) * 1000 : 800 * attempt);
      continue;
    }
    console.error(`ghl ${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    throw new GhlError(method, path, res.status, text);
  }
}

// ───────────────────────────── contacts ─────────────────────────────
export type GhlCustomFieldValue = { id: string; value?: unknown; field_value?: unknown };
export type GhlContact = {
  id: string; locationId?: string;
  firstName?: string; lastName?: string; contactName?: string; name?: string; firstNameLowerCase?: string; lastNameLowerCase?: string;
  companyName?: string; businessName?: string; email?: string; phone?: string; website?: string; city?: string; state?: string;
  source?: string; tags?: string[]; assignedTo?: string | null; dateAdded?: string; dateUpdated?: string;
  customFields?: GhlCustomFieldValue[];
};
/** Writable contact fields (PUT /contacts/{id}). locationId is NOT allowed here — GHL rejects it. */
export type GhlContactPatch = Partial<Pick<GhlContact, "firstName" | "lastName" | "email" | "phone" | "website" | "city" | "state" | "source" | "tags">> & {
  assignedTo?: string | null; companyName?: string; customFields?: { id: string; field_value: unknown }[];
};

export async function getContact(id: string, opts?: GhlOptions): Promise<GhlContact> {
  const r = await ghl<{ contact?: GhlContact }>("GET", `/contacts/${encodeURIComponent(id)}`, undefined, opts);
  if (!r.contact?.id) throw new CallDeskError("GoHighLevel returned no contact for that id.", 404);
  return r.contact;
}
export async function updateContact(id: string, patch: GhlContactPatch): Promise<GhlContact> {
  const r = await ghl<{ succeded?: boolean; succeeded?: boolean; contact?: GhlContact }>("PUT", `/contacts/${encodeURIComponent(id)}`, patch);
  if (!r.contact?.id) throw new CallDeskError("GoHighLevel did not confirm the contact update. Reload the lead before retrying.", 502);
  return r.contact;
}
export type GhlUpsertPayload = GhlContactPatch & { locationId: string; name?: string };
export async function upsertContact(payload: GhlUpsertPayload, opts?: GhlOptions): Promise<{ contact: GhlContact; isNew: boolean }> {
  const r = await ghl<{ new?: boolean; contact?: GhlContact }>("POST", "/contacts/upsert", payload, opts);
  if (!r.contact?.id) throw new CallDeskError("GoHighLevel did not confirm the contact upsert.", 502);
  return { contact: r.contact, isNew: !!r.new };
}
/** Plain create (POST /contacts/) — for a contact with no email or phone, which upsert cannot dedupe. The caller owns idempotency. */
export async function createContact(payload: GhlUpsertPayload): Promise<GhlContact> {
  const r = await ghl<{ contact?: GhlContact }>("POST", "/contacts/", payload);
  if (!r.contact?.id) throw new CallDeskError("GoHighLevel did not confirm the new contact.", 502);
  return r.contact;
}
export const addTags = (id: string, tags: string[]) => ghl<{ tags?: string[] }>("POST", `/contacts/${encodeURIComponent(id)}/tags`, { tags });
export const removeTags = (id: string, tags: string[]) => ghl<{ tags?: string[] }>("DELETE", `/contacts/${encodeURIComponent(id)}/tags`, { tags });

/** Advanced search (POST /contacts/search). Filters are ANDed; `{ group: "OR", filters: [...] }` nests. Max 500 per page. */
export type SearchFilter = { field: string; operator: "eq" | "not_eq" | "contains" | "not_contains" | "exists" | "not_exists" | "range"; value?: unknown } | { group: "AND" | "OR"; filters: SearchFilter[] };
export type SearchArgs = { filters?: SearchFilter[]; query?: string; page?: number; pageLimit?: number; sort?: { field: string; direction: "asc" | "desc" }[] };
export async function searchContacts(args: SearchArgs, opts?: GhlOptions): Promise<{ contacts: GhlContact[]; total: number }> {
  const body: Record<string, unknown> = { locationId: ghlLocationId(), page: args.page ?? 1, pageLimit: Math.min(Math.max(args.pageLimit ?? 100, 1), 500) };
  if (args.filters?.length) body.filters = args.filters;
  if (args.query) body.query = args.query.slice(0, 75);
  if (args.sort?.length) body.sort = args.sort;
  const r = await ghl<{ contacts?: GhlContact[]; total?: number }>("POST", "/contacts/search", body, opts);
  return { contacts: r.contacts ?? [], total: typeof r.total === "number" ? r.total : (r.contacts ?? []).length };
}
/** The older list endpoint (GET /contacts/?query=) — free-text only, used by the package builder's customer search. */
export async function listContacts(query: string, limit = 8): Promise<GhlContact[]> {
  const r = await ghl<{ contacts?: GhlContact[] }>("GET", `/contacts/?locationId=${encodeURIComponent(ghlLocationId())}&query=${encodeURIComponent(query)}&limit=${limit}`);
  return r.contacts ?? [];
}

// ───────────────────────────── notes & tasks ─────────────────────────────
export type GhlNote = { id: string; body?: string; userId?: string; dateAdded?: string; contactId?: string };
export async function listNotes(contactId: string): Promise<GhlNote[]> {
  const r = await ghl<{ notes?: GhlNote[] }>("GET", `/contacts/${encodeURIComponent(contactId)}/notes`);
  return r.notes ?? [];
}
export async function addNote(contactId: string, body: string, userId?: string): Promise<GhlNote> {
  const r = await ghl<{ note?: GhlNote }>("POST", `/contacts/${encodeURIComponent(contactId)}/notes`, userId ? { body, userId } : { body });
  if (!r.note?.id) throw new CallDeskError("GoHighLevel did not confirm the note. It may already be saved — reload before retrying.", 502);
  return r.note;
}
export function addTask(contactId: string, title: string, body: string, dueInDays = 1, assignedTo?: string) {
  const dueDate = new Date(Date.now() + dueInDays * 86400000).toISOString();
  return ghl("POST", `/contacts/${encodeURIComponent(contactId)}/tasks`, { title, body, dueDate, completed: false, ...(assignedTo ? { assignedTo } : {}) });
}

// ───────────────────────────── custom fields ─────────────────────────────
export type GhlFieldDef = { id: string; name: string; fieldKey?: string; dataType: string; picklistOptions?: string[]; model?: string; position?: number };
let fieldCache: { at: number; fields: GhlFieldDef[] } | null = null;
const FIELD_TTL_MS = 10 * 60 * 1000;
/** Contact custom-field definitions for the location (cached 10 min; `fresh` forces a read). Needs locations/customFields.readonly. */
export async function listCustomFields(fresh = false, opts?: GhlOptions): Promise<GhlFieldDef[]> {
  if (!fresh && fieldCache && Date.now() - fieldCache.at < FIELD_TTL_MS) return fieldCache.fields;
  const r = await ghl<{ customFields?: GhlFieldDef[] }>("GET", `/locations/${encodeURIComponent(ghlLocationId())}/customFields?model=contact`, undefined, opts);
  const fields = (r.customFields ?? []).filter((f) => !f.model || f.model === "contact");
  fieldCache = { at: Date.now(), fields };
  return fields;
}
export const forgetCustomFields = () => { fieldCache = null; };
export type NewFieldDef = { name: string; dataType: "TEXT" | "LARGE_TEXT" | "NUMERICAL" | "MONETORY" | "DATE" | "SINGLE_OPTIONS" | "MULTIPLE_OPTIONS" | "CHECKBOX"; options?: string[]; placeholder?: string; position?: number };
/** Create a contact custom field. Same call the LSE setup script used (verified: it made "LSE Acquisition Source" a dropdown). Needs locations/customFields.write. */
export async function createCustomField(def: NewFieldDef): Promise<GhlFieldDef> {
  const body: Record<string, unknown> = { name: def.name, dataType: def.dataType, model: "contact", position: def.position ?? 200 };
  if (def.placeholder) body.placeholder = def.placeholder;
  if (def.options) body.options = def.options;
  const r = await ghl<{ customField?: GhlFieldDef }>("POST", `/locations/${encodeURIComponent(ghlLocationId())}/customFields`, body);
  if (!r.customField?.id) throw new CallDeskError(`GoHighLevel did not confirm the custom field "${def.name}".`, 502);
  fieldCache = null;
  return r.customField;
}

// ───────────────────────────── workflows ─────────────────────────────
export type GhlWorkflow = { id: string; name?: string; status?: string };
/** Names and status only (the API does not expose triggers). Needs workflows.readonly. */
export async function listWorkflows(): Promise<GhlWorkflow[]> {
  const r = await ghl<{ workflows?: GhlWorkflow[] }>("GET", `/workflows/?locationId=${encodeURIComponent(ghlLocationId())}`);
  return r.workflows ?? [];
}

// ───────────────────────────── users ─────────────────────────────
export type GhlUser = { id: string; name?: string; firstName?: string; lastName?: string; email?: string };
/** Needs users.readonly — the current token does not have it (401). Kept for the diag route and the day the scope is added. */
export async function listUsers(): Promise<GhlUser[]> {
  const r = await ghl<{ users?: GhlUser[] }>("GET", `/users/?locationId=${encodeURIComponent(ghlLocationId())}`);
  return r.users ?? [];
}

/** GHL's invoice "send" endpoint requires the id of a real user on the account (the sender). An empty
 *  userId is what left the Sep 25 2026 Jeremy invoice sitting in Draft. GHL_USER_ID overrides; the
 *  default is Dave's user on the Creative Cowboys location. */
const DEFAULT_SENDER_USER_ID = "zqnRMqxrUZh0qBzF12Re"; // Dave Collum, dave@creativecowboys.co, Agency admin
export async function ghlUserId(): Promise<string> {
  const id = (process.env.GHL_USER_ID || "").trim() || DEFAULT_SENDER_USER_ID;
  if (!/^[A-Za-z0-9]{10,64}$/.test(id)) throw new CallDeskError("GHL_USER_ID on Vercel is not a valid GoHighLevel user id (GHL → Settings → Users shows each user's id).", 503);
  return id;
}

// ───────────────────────────── helpers ─────────────────────────────
/** Display name: GHL gives `contactName` on reads, sometimes only the lower-cased pair on search results. */
export function contactDisplayName(c: GhlContact): string {
  const joined = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return (c.contactName || c.name || joined || [c.firstNameLowerCase, c.lastNameLowerCase].filter(Boolean).join(" ")).trim();
}
export const slimContact = (c: GhlContact) => ({ id: c.id, name: contactDisplayName(c) || "(no name)", email: c.email || "", phone: c.phone || "", company: c.companyName || "" });
/** Value of a custom field on a contact as a string ("" when unset). Search results use `value`, some writes echo `field_value`. */
export function fieldText(c: GhlContact, fieldId: string | undefined): string {
  if (!fieldId) return "";
  const hit = (c.customFields || []).find((f) => f.id === fieldId);
  const raw = hit ? (hit.value !== undefined ? hit.value : hit.field_value) : undefined;
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return raw.map(String).join(", ");
  if (typeof raw === "object") return "";
  return String(raw);
}
/** Split "Jane Q Public" into GHL's firstName / lastName. */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}
/** E.164 for US numbers when we can; otherwise the digits we were given. GHL matches phones with the country code. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.trim().startsWith("+") ? `+${digits}` : digits;
}
