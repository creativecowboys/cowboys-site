// Where the team desk lives, and every link that points at it.
//
// The desk (Sales / Onboarding / Clients tabs) was served at /leads from Sep 21 2026 and is served at /admin since
// Oct 2 2026 (Dave: "this has become more of an admin setup than just calling new leads"). /leads and everything
// under it forwards to the same path under /admin with the query string kept (next.config.ts), so bookmarks, the
// Oct 2 team email, calendar events and the "Desk Link" values already stored on GoHighLevel contacts keep working.
// Nothing stored was rewritten.
//
// No imports, on purpose: the middleware (edge runtime), server modules, the browser shell and the unit tests all
// read this file.

export const DESK_PATH = "/admin";
export const DESK_LOGIN_PATH = "/admin/login";
/** The desk's address before the move. Only for recognising old links; build nothing new with it. */
export const OLD_DESK_PATH = "/leads";

/** What a desk link can carry. The URL keeps this order. */
export type DeskQuery = { tab?: "onboarding" | "clients" | ""; client?: string; lead?: string; desk?: string };

/** Path and query for a place on the desk: deskHref({ tab: "onboarding", client: id }) → /admin?tab=onboarding&client=<id>. */
export function deskHref(query: DeskQuery = {}): string {
  const q = new URLSearchParams();
  if (query.tab) q.set("tab", query.tab);
  if (query.client) q.set("client", query.client);
  if (query.lead) q.set("lead", query.lead);
  if (query.desk) q.set("desk", query.desk);
  const text = q.toString();
  return text ? `${DESK_PATH}?${text}` : DESK_PATH;
}

/** The same as an absolute link, for anything that leaves the site: emails, calendar feeds, CRM fields. */
export const deskUrl = (origin: string, query: DeskQuery = {}): string => `${origin}${deskHref(query)}`;

const under = (value: string, base: string) => value === base || value.startsWith(`${base}?`) || value.startsWith(`${base}/`);

/**
 * Where sign-in may send someone afterwards. Only a place on the desk is honoured: its new address or its old one,
 * with any sub-path or query string. Anything else lands on the desk's front page. (An old /leads… value is returned
 * as it came; the forward in next.config.ts takes it to /admin.)
 */
export function safeNext(value: string | null | undefined): string {
  if (!value || value.length > 200 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return DESK_PATH;
  return under(value, DESK_PATH) || under(value, OLD_DESK_PATH) ? value : DESK_PATH;
}

/**
 * The sign-in gate for /admin and everything under it. The middleware calls this; it is pure so it can be tested.
 * Returns where to send the request, or null to let it through:
 *   signed out, a desk page       → the sign-in page, carrying where they were going (path and query) as `next`
 *   signed out, the sign-in page  → through
 *   signed in, the sign-in page   → the desk: at `next` when the page was opened with one, else its front page
 *   signed in, a desk page        → through
 */
export function deskGate(pathname: string, search: string, signedIn: boolean): string | null {
  const onLogin = pathname === DESK_LOGIN_PATH;
  if (!signedIn) return onLogin ? null : `${DESK_LOGIN_PATH}?next=${encodeURIComponent(safeNext(pathname + cleanSearch(search)))}`;
  if (!onLogin) return null;
  const next = safeNext(new URLSearchParams(search).get("next"));
  return under(next, DESK_LOGIN_PATH) ? DESK_PATH : next; // never bounce a signed-in person back to the sign-in page
}

/** The query string without Next's own `_rsc` marker (present on in-app navigations), so it never ends up in a link. */
function cleanSearch(search: string): string {
  const q = new URLSearchParams(search);
  if (!q.has("_rsc")) return search;
  q.delete("_rsc");
  const text = q.toString();
  return text ? `?${text}` : "";
}
