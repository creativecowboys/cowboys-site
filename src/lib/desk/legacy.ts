import type { ClientRow } from "@/lib/clients/types";

// Legacy clients (Dave, Oct 2 2026: "our old clients.. we can call them legacy clients. We can bring them into the
// active clients tab on the leads page.").
//
// A legacy client is a long-standing client that was never onboarded through the desk and is billed outside
// GoHighLevel (QuickBooks). On the contact it is one desk-owned field, "Desk Legacy Client" = Yes; No or blank is a
// normal desk client. An owner sets or clears it from the client's panel; the Monday import sets it for an Active
// Clients row that never had "Team desk" ticked.
//
// What the marker changes — and nothing else:
//   - the Clients tab shows a Legacy badge, a kind filter and "N on the desk · M legacy" in the header;
//   - problem flags only fire for what the record actually tracks (the rules live in flagsFor, src/lib/clients/board.ts);
//   - the desk does not go looking in Stripe for the client by email (stripeFollowed below).
// It never changes money: a legacy client's packages and Custom $/mo count in the owners' monthly total like anyone's.
//
// Pure and client-safe (no node imports): the Clients tab imports this file.
export type ClientKind = "" | "desk" | "legacy";
type Kinded = Pick<ClientRow, "legacy">;

export const isLegacyRow = (row: Kinded): boolean => row.legacy === true;

/** How many rows are on the desk, and how many of them are legacy. */
export function kindCounts(rows: readonly Kinded[]): { total: number; desk: number; legacy: number } {
  const legacy = rows.filter(isLegacyRow).length;
  return { total: rows.length, desk: rows.length - legacy, legacy };
}

/** The kind filter: "" = everyone, "desk" = clients run on the desk, "legacy" = legacy clients. */
export const isKind = (row: Kinded, kind: ClientKind): boolean => !kind || (kind === "legacy") === isLegacyRow(row);

/**
 * The order of the list: problems first, as always (a payment issue, then the most flags) — then, among rows with the same
 * flags, the clients run on the desk before the legacy ones, each by name. So with nothing flagged the tab reads as it did
 * before legacy clients existed, with the legacy clients after. With no legacy client the order is exactly the old one.
 */
export function clientOrder(a: Pick<ClientRow, "flags" | "name" | "legacy">, b: Pick<ClientRow, "flags" | "name" | "legacy">): number {
  return Number(b.flags.includes("payment")) - Number(a.flags.includes("payment")) || b.flags.length - a.flags.length || Number(isLegacyRow(a)) - Number(isLegacyRow(b)) || a.name.localeCompare(b.name);
}

/** The filter the list really applies: a "desk" / "legacy" choice only means something while there is a legacy client to tell apart. */
export const effectiveKind = (kind: ClientKind, rows: readonly Kinded[]): ClientKind => (rows.some(isLegacyRow) ? kind : "");

/** Header count: "18 on the desk · 17 legacy". With no legacy client it reads exactly as it always did ("1 on the desk"). */
export function deskCountLabel(rows: readonly Kinded[]): string {
  const { total, legacy } = kindCounts(rows);
  return `${total} on the desk${legacy ? ` · ${legacy} legacy` : ""}`;
}

/**
 * Does the desk follow this client in Stripe on its own — the nightly reconcile, and matching a Stripe event to a client
 * by email? Always for a desk client. For a legacy client only once Stripe is really part of its record: a customer id is
 * stored, or the payment method is Stripe. Otherwise a legacy client billed by QuickBooks invoice whose email also
 * happens to be a Stripe customer would be flipped to "Stripe via GHL" and given a payment status nobody set.
 * (The "Sync from Stripe" call itself is unchanged: someone asking for it by hand still gets it.)
 */
export const stripeFollowed = (row: Pick<ClientRow, "legacy" | "stripeCustomer" | "payMethod">): boolean =>
  !isLegacyRow(row) || !!row.stripeCustomer || row.payMethod.startsWith("Stripe");

/**
 * A legacy client billed outside GoHighLevel whose payment status nobody has set here: the board's default
 * ("No Billing Set Up", or nothing) says nothing about a client that is invoiced from QuickBooks, so the tab shows how it
 * IS billed instead of a status that reads like a to-do. The stored value is not changed, and any status someone does set
 * (Paid / Current, Overdue, …) shows as it is.
 */
export const billedOutside = (row: Pick<ClientRow, "legacy" | "stripeCustomer" | "payMethod" | "payStatus">): boolean =>
  isLegacyRow(row) && !stripeFollowed(row) && (!row.payStatus || row.payStatus === "No Billing Set Up");

/**
 * Is Google Business Profile tracked on this record? Always for a desk client (a blank there means "Not Requested" and
 * is a problem). For a legacy client only once something says so: a linked Search Atlas listing, a stamped check, or an
 * access state other than blank / Not Requested. The list shows "Not tracked" instead of a warning chip until then.
 */
export const gbpTracked = (row: Pick<ClientRow, "legacy" | "gbpAccess" | "gbpChecked" | "searchAtlasListing" | "gbpLive">): boolean =>
  !isLegacyRow(row) || !!row.searchAtlasListing || !!row.gbpLive || !!row.gbpChecked || (!!row.gbpAccess && row.gbpAccess !== "Not Requested");
