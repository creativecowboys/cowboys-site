import { CallDeskError, GHL_ID, MONDAY_ID } from "@/lib/calls/validation";

// The DESK_BACKEND switch (Oct 1 2026, Phase 2) — which system holds the Onboarding and Clients tabs.
// `monday` (default, and anything that is not exactly "ghl") = the Onboarding Pipeline and Active Clients
// boards; `ghl` = GoHighLevel contacts (one contact per business, desk-owned "Desk …" custom fields).
// Pure — no Monday / GHL imports — so it is unit-tested and safe to import anywhere on the server.
//
// One switch for both tabs on purpose: graduation, the "one place at a time" rule, the giveaway-winner
// billing guard and the Stripe sync all read across onboarding and clients, so a half-flipped desk would
// need cross-system code that nobody intends to run. LEADS_BACKEND (the Sales tab) stays its own switch.
//
// Rules:
//   - List routes follow the switch, or `?desk=ghl|monday` on a team request so an owner can preview
//     /leads?tab=onboarding&desk=ghl before the flip. The parameter is NOT `backend`: that one already means
//     "preview the Sales roster" (Phase 1), and someone on /leads?backend=ghl must still get the Monday boards
//     on the other two tabs until this switch is flipped.
//   - Record routes follow the id's SHAPE first: a GoHighLevel contact id (letters + digits) always goes
//     to GoHighLevel. An all-digit id is a Monday item id; it goes to Monday while the switch says Monday,
//     and once the switch says ghl it is looked up among the imported records (never sent to Monday).
export type DeskBackend = "monday" | "ghl";

export const deskDefault = (env = process.env.DESK_BACKEND): DeskBackend => (env === "ghl" ? "ghl" : "monday");
export function deskBackend(req?: Request | null, env = process.env.DESK_BACKEND): DeskBackend {
  const q = req ? new URL(req.url).searchParams.get("desk") : null;
  return q === "ghl" || q === "monday" ? q : deskDefault(env);
}
export const deskSystemName = (b: DeskBackend) => (b === "ghl" ? "GoHighLevel" : "Monday");

// A Monday-era file scope: `<pipeline item id>` or `c<client item id>` (see "file scopes" below).
const LEGACY_SCOPE = /^c?[1-9]\d{0,19}$/;
/** A GoHighLevel contact id: letters and digits, and not something that could be a Monday item id or a Monday-era scope ("c" + digits). */
export const isGhlRecordId = (id: string): boolean => GHL_ID.test(id) && !LEGACY_SCOPE.test(id);
export const isMondayRecordId = (id: string): boolean => MONDAY_ID.test(id);
export const backendForRecordId = (id: string, env = process.env.DESK_BACKEND): DeskBackend => (isGhlRecordId(id) ? "ghl" : deskDefault(env));

/** Record id on either system (digits = Monday item, letters + digits = GoHighLevel contact). */
export function validateRecordId(id: string): string {
  if (typeof id !== "string" || !(MONDAY_ID.test(id) || isGhlRecordId(id))) throw new CallDeskError("Invalid client.", 400);
  return id;
}

// A file store ("scope") belongs to an onboarding record or, for a client that never had one, to the client
// row: Monday-era scopes are `<pipeline item id>` or `c<client item id>`; GoHighLevel-era scopes are the
// contact id. Records imported from Monday keep their Monday-era scope so nothing in storage has to move.
export const isLegacyScope = (scope: string): boolean => LEGACY_SCOPE.test(scope);
export function validateScope(scope: string): string {
  if (typeof scope !== "string" || !(LEGACY_SCOPE.test(scope) || isGhlRecordId(scope))) throw new CallDeskError("Invalid client.", 400);
  return scope;
}
export const backendForScope = (scope: string, env = process.env.DESK_BACKEND): DeskBackend => (isGhlRecordId(scope) ? "ghl" : deskDefault(env));

/**
 * Once the switch says ghl the link to Monday is cut: `?desk=monday` still LISTS the old boards (a look back), but
 * nothing new is created there. Every other Monday write is already unreachable after the flip — a Monday item id on a
 * record route is resolved to the imported contact, never sent to Monday.
 */
export function assertMondayOpen(env = process.env.DESK_BACKEND): void {
  if (deskDefault(env) === "ghl") throw new CallDeskError("The desk is on GoHighLevel now, so nothing new is created on the Monday boards. Take “desk=monday” off the address and try again.", 409);
}

/**
 * While the switch still says Monday, GoHighLevel desk records are a preview: anyone on the team may look,
 * only an owner may change them (the import canary and the pre-flip checks). After the flip everyone works there.
 */
/**
 * The import's `force` re-writes each contact's desk fields from the old Monday boards. Before the flip that is how a
 * board change made after the first import is carried over; AFTER the flip it would put stale board values over work
 * done on the desk, so it then takes a second, explicit word.
 */
export function assertForceAllowed(opts: { dryRun: boolean; force: boolean; overwriteLiveDesk: boolean }, env = process.env.DESK_BACKEND): void {
  if (!opts.dryRun && opts.force && deskDefault(env) === "ghl" && !opts.overwriteLiveDesk) throw new CallDeskError("The desk is on GoHighLevel now. force would re-write each client's desk fields from the old Monday boards, over whatever was changed on the desk since the switch. If that is really what you want, send overwriteLiveDesk: true as well.", 409);
}
export const mayWriteGhl = (isOwner: boolean, env = process.env.DESK_BACKEND): boolean => deskDefault(env) === "ghl" || isOwner;
export function assertMayWriteGhl(isOwner: boolean, env = process.env.DESK_BACKEND): void {
  if (deskDefault(env) !== "ghl" && !isOwner) throw new CallDeskError("The GoHighLevel desk is still a preview. Only an owner can change records there until the desk is switched over.", 403);
}
