import type { ClientRow } from "@/lib/clients/types";
import { clientOrder, deskCountLabel, effectiveKind, isKind, kindCounts, type ClientKind } from "./legacy";

// What the Clients tab lists and counts (Oct 2 2026). Dave: "on the legacy list, we can remove CDM, we can remove
// Georgia Truck Parking." A client that has left is moved to the Churned group; from then on it is off the list, the
// same idea as a Not Interested lead leaving the call list on the Sales tab:
//   - the default view ("All groups") leaves churned clients out, and so does a search on it;
//   - they are not counted in "N on the desk", in the legacy count, or in the monthly total;
//   - the header says how many there are, only when there are any;
//   - choosing Churned in the group filter lists them, and changing a client's group in its panel brings it back;
//   - a churned client still opens by its link (the panel reads the record by id, whatever the list shows).
// Nothing is written and nothing is deleted: the record keeps everything it had.
//
// Pure and client-safe (no node imports): the Clients tab imports this file. With no churned client every function here
// gives exactly what the tab computed inline before.
export const CHURNED = "churned";
export type ClientFilters = { kind: ClientKind; manager: string; group: string; only: "" | "problems" | "payment" | "gbp"; search: string };
type Grouped = Pick<ClientRow, "group">;

export const isChurned = (row: Grouped): boolean => row.group === CHURNED;
/** The clients the tab lists by default and counts: everyone who has not churned. */
export const currentClients = <T extends Grouped>(rows: readonly T[]): T[] => rows.filter((r) => !isChurned(r));

/** Header and filter counts: current clients in total, split desk / legacy, and how many have churned (counted apart). */
export function clientCounts(rows: readonly (Grouped & Pick<ClientRow, "legacy">)[]): { total: number; desk: number; legacy: number; churned: number } {
  const current = currentClients(rows);
  return { ...kindCounts(current), churned: rows.length - current.length };
}

/** "16 on the desk · 15 legacy · 2 churned". With nobody churned it reads exactly as it did ("18 on the desk · 17 legacy", "1 on the desk"). */
export function clientCountLabel(rows: readonly (Grouped & Pick<ClientRow, "legacy">)[]): string {
  const current = currentClients(rows);
  const churned = rows.length - current.length;
  return `${deskCountLabel(current)}${churned ? ` · ${churned} churned` : ""}`;
}

/** The owners' monthly list total: every client still being billed. Churned and paused clients are not in it (they never were). */
export const monthlyTotal = (rows: readonly Pick<ClientRow, "group" | "mrr">[]): number =>
  rows.filter((r) => !isChurned(r) && r.group !== "paused").reduce((sum, r) => sum + (Number(r.mrr) || 0), 0);

/** The desk / legacy choice the list really applies: it only means something while a current client is legacy (see effectiveKind). */
export const appliedKind = (kind: ClientKind, rows: readonly (Grouped & Pick<ClientRow, "legacy">)[]): ClientKind => effectiveKind(kind, currentClients(rows));

/** Everything about a row except which group it is in: the kind, manager, "show only" and search filters. */
function matches(row: ClientRow, f: ClientFilters, kind: ClientKind): boolean {
  return isKind(row, kind) &&
    (!f.manager || (f.manager === "unassigned" ? row.accountManagerIds.length === 0 : row.accountManagerIds.includes(f.manager))) &&
    (f.only !== "problems" || row.flags.length > 0) && (f.only !== "payment" || row.flags.includes("payment")) && (f.only !== "gbp" || row.flags.includes("gbp") || row.flags.includes("gbp-recheck")) &&
    `${row.name} ${row.contact} ${row.email} ${row.packages}`.toLowerCase().includes(f.search.toLowerCase());
}

/**
 * The rows the list shows, in order (problems first, then desk clients ahead of legacy ones, by name). With no group
 * chosen that is every current client that passes the other filters, and never a churned one. A chosen group shows
 * that group only, so "churned" is the one way to see the clients that have left.
 */
export function filterClients<T extends ClientRow>(rows: readonly T[], f: ClientFilters): T[] {
  const kind = appliedKind(f.kind, rows);
  return rows.filter((r) => (f.group ? r.group === f.group : !isChurned(r)) && matches(r, f, kind)).sort(clientOrder);
}

/**
 * How many churned clients a search on the default view would have found. The list does not show them; it only says
 * that they exist, so nobody is left wondering where a client went. 0 whenever a group is chosen or nothing is typed.
 */
export function churnedMatches(rows: readonly ClientRow[], f: ClientFilters): number {
  if (f.group || !f.search.trim()) return 0;
  const kind = appliedKind(f.kind, rows);
  return rows.filter((r) => isChurned(r) && matches(r, f, kind)).length;
}
