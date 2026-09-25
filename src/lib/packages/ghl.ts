import { CallDeskError } from "@/lib/calls/validation";

// GoHighLevel client for the package builder (ported from local-seo-engine's src/lib/ghl.ts).
// Token: GHL_API_TOKEN (this project's existing var; GHL_TOKEN accepted as a fallback). The token
// must carry contact + invoice scopes; a 401/403 from GHL is reported as a scope/token problem.
const BASE = "https://services.leadconnectorhq.com";
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

export async function ghl<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: { Authorization: `Bearer ${token()}`, Version: "2021-07-28", "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined, cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new CallDeskError("GoHighLevel refused the request. The site's GHL token needs contact and invoice scopes.", 502);
    throw new CallDeskError(`GoHighLevel error ${res.status}: ${text.slice(0, 200)}`, 502);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export const addNote = (contactId: string, body: string) => ghl("POST", `/contacts/${contactId}/notes`, { body });
export function addTask(contactId: string, title: string, body: string, dueInDays = 1) {
  const dueDate = new Date(Date.now() + dueInDays * 86400000).toISOString();
  return ghl("POST", `/contacts/${contactId}/tasks`, { title, body, dueDate, completed: false });
}

export type GhlContact = { id: string; firstName?: string; lastName?: string; contactName?: string; email?: string; phone?: string; companyName?: string };
export const slimContact = (c: GhlContact) => ({ id: c.id, name: c.contactName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "(no name)", email: c.email || "", phone: c.phone || "", company: c.companyName || "" });
