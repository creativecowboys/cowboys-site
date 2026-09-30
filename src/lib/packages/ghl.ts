import { CallDeskError } from "@/lib/calls/validation";

// GoHighLevel client for the package builder (ported from local-seo-engine's src/lib/ghl.ts).
// Token: GHL_API_TOKEN (this project's existing var; GHL_TOKEN accepted as a fallback). The token
// must carry contact + invoice scopes; a 401/403 from GHL is reported as a scope/token problem.
// Every GHL failure is logged (method, path, status, body) so Vercel runtime logs say what broke —
// before Sep 30 2026 the route returned a bare 502 and the desk could not tell why a send failed.
const BASE = "https://services.leadconnectorhq.com";
export const INVOICE_HOST = "https://link.fastpaydirect.com/invoice/";
export const GHL_APP = "https://app.gohighlevel.com/v2/location";

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

/** A GHL API error, with the status and response body GHL gave us (sliced), for logs and the desk. */
export class GhlError extends CallDeskError {
  constructor(public method: string, public path: string, public ghlStatus: number, public body: string) {
    super(
      ghlStatus === 401 || ghlStatus === 403
        ? `GoHighLevel refused ${method} ${path} (${ghlStatus}). The site's GHL token needs contact, invoice and user scopes.`
        : `GoHighLevel error ${ghlStatus} on ${method} ${path}: ${body.slice(0, 300)}`,
      502,
    );
  }
}

export async function ghl<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: { Authorization: `Bearer ${token()}`, Version: "2021-07-28", "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined, cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`ghl ${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    throw new GhlError(method, path, res.status, text);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

/** GHL's invoice "send" endpoint requires the id of a real user on the account (the sender). We use
 *  GHL_USER_ID when set; otherwise the first user on the location, looked up once per instance. An empty
 *  userId is what left the Sep 25 2026 Jeremy invoice sitting in Draft. */
let cachedUserId: string | undefined;
export async function ghlUserId(): Promise<string> {
  const fromEnv = (process.env.GHL_USER_ID || "").trim();
  if (fromEnv) return fromEnv;
  if (cachedUserId) return cachedUserId;
  type U = { id?: string; _id?: string; email?: string; role?: string; roles?: { role?: string; type?: string } };
  let users: U[] = [];
  try {
    const r = await ghl<{ users?: U[] }>("GET", `/users/?locationId=${ghlLocationId()}`);
    users = r.users ?? [];
  } catch (e) {
    console.error("ghlUserId lookup failed:", e instanceof Error ? e.message : e);
  }
  const preferred = (process.env.GHL_USER_EMAIL || "").trim().toLowerCase();
  const pick = users.find((u) => preferred && u.email?.toLowerCase() === preferred) || users.find((u) => u.roles?.role === "admin") || users[0];
  const id = pick?.id || pick?._id;
  if (!id) throw new CallDeskError("GoHighLevel needs a sender for invoice emails and the site has none. Set GHL_USER_ID on Vercel (GHL → Settings → Users shows each user's id).", 503);
  cachedUserId = id;
  return id;
}

export const addNote = (contactId: string, body: string) => ghl("POST", `/contacts/${contactId}/notes`, { body });
export function addTask(contactId: string, title: string, body: string, dueInDays = 1) {
  const dueDate = new Date(Date.now() + dueInDays * 86400000).toISOString();
  return ghl("POST", `/contacts/${contactId}/tasks`, { title, body, dueDate, completed: false });
}

export type GhlContact = { id: string; firstName?: string; lastName?: string; contactName?: string; email?: string; phone?: string; companyName?: string };
export const slimContact = (c: GhlContact) => ({ id: c.id, name: c.contactName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "(no name)", email: c.email || "", phone: c.phone || "", company: c.companyName || "" });
