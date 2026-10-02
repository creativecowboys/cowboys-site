import { createHmac, timingSafeEqual } from "node:crypto";
import { CallDeskError } from "@/lib/calls/validation";
import { escapeHtml, monday, mondayToken, todayEastern } from "@/lib/onboarding/api";
import { COL as OCOL, STAGES, onboardingOwners, PIPELINE_BOARD_ID, stageForGroup, isGiveawayWinner } from "@/lib/onboarding/config";
import type { OnboardingRow } from "@/lib/onboarding/types";
import { CCOL, CLIENTS_BOARD_ID, CLIENT_GROUPS, GBP_RECHECK_DAYS, MONDAY_ORIGIN, REPORT_STALE_DAYS, TERM_SOON_DAYS, groupIdFor } from "./config";
import { paymentFromSnapshot, snapshot, findCustomerByEmail, stripeConnected } from "./stripe";
import type { ClientFlag, ClientRow, ClientsListData, StripeSnapshot } from "./types";
import { accessFromCard, cardFromSummary, cardUnavailable, parseListingId, searchAtlasLocationUrl } from "@/lib/gbp/state";
import { gbpCard, listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import type { GbpCard } from "@/lib/gbp/types";

type Column = { id: string; text: string | null; value: string | null; display_value?: string | null }; // display_value: formula columns
type Update = { id: string; text_body: string | null; created_at: string; creator: { name: string } | null };
type Item = { id: string; name: string; updated_at: string; board: { id: string }; group: { id: string; title: string } | null; column_values: Column[]; updates?: Update[] };
const ITEM_FIELDS = `id name updated_at board { id } group { id title } column_values(ids: ${JSON.stringify(Object.values(CCOL))}) { id text value ... on FormulaValue { display_value } }`;
const UPDATE_FIELDS = "id text_body created_at creator { name }";

function requireBoard(item: Item | undefined): Item {
  if (!item || item.board?.id !== CLIENTS_BOARD_ID) throw new CallDeskError("This client is not on the Active Clients board.", 404);
  return item;
}
const parse = (v: string | null): unknown => { try { return JSON.parse(v || "null"); } catch { return null; } };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

export function flagsFor(row: Omit<ClientRow, "flags">, today = todayEastern()): ClientFlag[] {
  const flags: ClientFlag[] = [];
  // A legacy client (GoHighLevel desk, Oct 2 2026) was never onboarded through the desk and is billed outside GoHighLevel, so it is
  // only flagged for what its record actually tracks: a blank is "not tracked here", not a problem. For everyone else — every
  // Monday row and every desk client — `legacy` is not set and each rule below is exactly what it was.
  const legacy = row.legacy === true;
  if (row.group === "issue" || ["Overdue", "Card Failed"].includes(row.payStatus)) flags.push("payment");
  // A successful live Search Atlas read is the truth: verified → no GBP flags at all (the 90-day recheck is moot);
  // connected but unverified → "gbp". A failed read (or no link) falls back to the Monday state.
  // Legacy: GBP is tracked once the listing is linked (above) or someone set Requested / Lost / recheck; a blank or Not Requested is quiet.
  if (row.gbpLive?.ok) { if (!row.gbpLive.verified) flags.push("gbp"); }
  else if (legacy ? ["Requested", "Lost / recheck"].includes(row.gbpAccess) : !["Verified", "No GBP Exists"].includes(row.gbpAccess)) flags.push("gbp");
  // Legacy: a recheck is only asked for once a check has been stamped (and is then 90 days old); "never checked" is quiet.
  else if (row.gbpAccess === "Verified" && (row.gbpChecked ? daysBetween(row.gbpChecked, today) > GBP_RECHECK_DAYS : !legacy)) flags.push("gbp-recheck");
  // Legacy: a report is only "late" once one has been logged here; "never" is quiet.
  if (row.group !== "churned" && row.group !== "paused" && (row.lastReport ? daysBetween(row.lastReport, today) > REPORT_STALE_DAYS : !legacy)) flags.push("report");
  if (row.termEnds && daysBetween(today, row.termEnds) <= TERM_SOON_DAYS && daysBetween(today, row.termEnds) >= 0) flags.push("term");
  // Same for everyone: only a Stripe method with no customer id. A client billed by QuickBooks invoice (every legacy client today) never gets it.
  if (row.payMethod.startsWith("Stripe") && !row.stripeCustomer) flags.push("no-stripe");
  return flags;
}

export function mapClient(item: Item): ClientRow {
  requireBoard(item);
  const cols = item.column_values;
  const text = (id: string) => { const c = cols.find((x) => x.id === id); return (c?.display_value ?? c?.text) || ""; };
  const link = (id: string) => { const raw = parse(cols.find((c) => c.id === id)?.value || null) as { url?: unknown } | null; return typeof raw?.url === "string" ? raw.url : text(id); };
  const people = (id: string) => ((parse(cols.find((c) => c.id === id)?.value || null) as { personsAndTeams?: { id?: unknown; kind?: string }[] } | null)?.personsAndTeams || []).filter((p) => p?.kind === "person" && p.id != null).map((p) => String(p.id));
  const checked = (id: string) => { const raw = parse(cols.find((c) => c.id === id)?.value || null) as { checked?: unknown } | null; return raw?.checked === true || raw?.checked === "true"; };
  const base: Omit<ClientRow, "flags"> = {
    id: item.id, name: item.name, url: `${MONDAY_ORIGIN}/boards/${CLIENTS_BOARD_ID}/pulses/${item.id}`, updatedAt: item.updated_at,
    group: groupIdFor(item.group?.id || ""), groupTitle: item.group?.title || "", health: text(CCOL.health),
    packages: text(CCOL.package), mrr: text(CCOL.mrr), customMonthly: text(CCOL.customMonthly),
    accountManager: text(CCOL.accountManager), accountManagerIds: people(CCOL.accountManager),
    contact: text(CCOL.contact), email: text(CCOL.email), phone: text(CCOL.phone), website: link(CCOL.website), gbpUrl: link(CCOL.gbpUrl), ghlContact: link(CCOL.ghlContact), driveFolder: link(CCOL.driveFolder), notes: text(CCOL.notes),
    payStatus: text(CCOL.payStatus), payMethod: text(CCOL.payMethod), billingDay: text(CCOL.billingDay), nextBill: text(CCOL.nextBill), lastPayment: text(CCOL.lastPayment), clientSince: text(CCOL.clientSince), termEnds: text(CCOL.termEnds), lastReport: text(CCOL.lastReport),
    gbpAccess: text(CCOL.gbpAccess), gbpChecked: text(CCOL.gbpChecked), stripeCustomer: text(CCOL.stripeCustomer).trim(), onboardingItem: text(CCOL.onboardingItem).trim(), teamDesk: checked(CCOL.teamDesk),
    searchAtlasListing: text(CCOL.searchAtlasListing).trim(), gbpLive: null,
  };
  return { ...base, flags: flagsFor(base) };
}

/** Attach the live listing state to every linked row from ONE cached account listing; a Search Atlas failure never hides the list. */
export async function withLiveGbp(rows: ClientRow[]): Promise<ClientRow[]> {
  const linked = rows.filter((r) => parseListingId(r.searchAtlasListing));
  if (!linked.length || !searchAtlasConnected()) return rows;
  const fetchedAt = new Date().toISOString();
  let byId: Map<number, GbpCard> | null = null;
  let failure = "";
  try { byId = new Map((await listLocations()).map((l) => [l.id, cardFromSummary(l, fetchedAt, searchAtlasLocationUrl(l.id))])); }
  catch (error) { failure = error instanceof Error ? error.message : "Search Atlas read failed."; console.error(`[gbp] client list live read failed: ${failure}`); }
  return rows.map((r) => {
    const id = parseListingId(r.searchAtlasListing);
    if (!id) return r;
    const gbpLive = byId ? byId.get(id) || cardUnavailable(id, `Listing ${id} is not connected to our Search Atlas account.`, fetchedAt) : cardUnavailable(id, failure, fetchedAt);
    const next = { ...r, gbpLive };
    return { ...next, flags: flagsFor(next) };
  });
}

/** Only a connected + verified listing changes Monday on its own: GBP Access → Verified and the recheck stamp → today. */
async function promoteClientFromLive(row: ClientRow, card: GbpCard): Promise<boolean> {
  const live = accessFromCard(card, row.gbpAccess);
  const today = todayEastern();
  if (!live.live || live.value !== "Verified") return false;
  if (!live.changed && row.gbpChecked === today) return false;
  await setColumns(row.id, { [CCOL.gbpAccess]: { label: "Verified" }, [CCOL.gbpChecked]: { date: today } });
  return true;
}

/** Live GBP card for a client row plus the auto-promotion; returns the refreshed row when Monday changed. */
export async function liveGbpForClient(row: ClientRow, opts: { fresh?: boolean } = {}): Promise<{ card: GbpCard | null; row: ClientRow }> {
  const id = parseListingId(row.searchAtlasListing);
  if (!id) return { card: null, row };
  const card = await gbpCard(id, { detail: true, fresh: !!opts.fresh });
  let promoted = false;
  try { promoted = await promoteClientFromLive(row, card); }
  catch (error) { console.error(`[gbp] could not write Verified to client ${row.id}: ${error instanceof Error ? error.message : error}`); }
  const fresh = promoted ? mapClient(await readClient(row.id)) : row;
  const withLive = { ...fresh, gbpLive: card };
  return { card, row: { ...withLive, flags: flagsFor(withLive) } };
}

function signCursor(body: string): string { return createHmac("sha256", mondayToken()).update(`clients-cursor.${body}`).digest("base64url"); }
function wrapCursor(cursor: string | null): string | null {
  if (!cursor) return null;
  const body = Buffer.from(JSON.stringify({ board: CLIENTS_BOARD_ID, cursor, expires: Date.now() + 55 * 60000 })).toString("base64url");
  return `${body}.${signCursor(body)}`;
}
function unwrapCursor(value: string | null): string | null {
  if (value === null) return null;
  if (value.length > 12000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new CallDeskError("Invalid page. Reload the client list.", 400);
  const [body, signature] = value.split(".");
  const expected = Buffer.from(signCursor(body)); const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new CallDeskError("Invalid page. Reload the client list.", 400);
  try { const d = JSON.parse(Buffer.from(body, "base64url").toString("utf8")); if (d.board !== CLIENTS_BOARD_ID || typeof d.cursor !== "string" || d.expires <= Date.now()) throw new Error(); return d.cursor; }
  catch { throw new CallDeskError("This page has expired. Reload the client list.", 400); }
}

/** Only rows with "Team desk" checked — Dave, Sep 24 2026: start with Choice and Squirrel Made, grow via graduation. */
export async function listClients(cursor: string | null): Promise<ClientsListData> {
  const raw = unwrapCursor(cursor);
  const data = await monday<{ boards: { id: string; name: string; items_page: { cursor: string | null; items: Item[] } }[] }>(
    `query ClientsList($board: [ID!]!, $cursor: String) { boards(ids: $board) { id name items_page(limit: 100, cursor: $cursor) { cursor items { ${ITEM_FIELDS} } } } }`,
    { board: [CLIENTS_BOARD_ID], cursor: raw }, 25000,
  );
  const board = data.boards?.find((b) => b.id === CLIENTS_BOARD_ID);
  if (!board?.items_page) throw new CallDeskError("The Active Clients board is not available to this connection.", 502);
  const rows = board.items_page.items.map(mapClient).filter((r) => r.teamDesk);
  const stillOnboarding = await onboardingInProgress(rows.map((r) => r.onboardingItem).filter(Boolean));
  // One place at a time (Dave, Sep 25 2026): a client whose onboarding record is not Launched stays on the Onboarding tab.
  const shown = await withLiveGbp(rows.filter((r) => !stillOnboarding.has(r.onboardingItem)));
  return { rows: shown, cursor: wrapCursor(board.items_page.cursor), boardName: board.name, stripeConnected: stripeConnected(), canSeeMoney: false /* the route decides per session */, searchAtlasConnected: searchAtlasConnected() };
}

/** Which of these Onboarding Pipeline items are still before the Launched stage. Unknown/deleted items count as done. */
export async function onboardingInProgress(itemIds: string[]): Promise<Set<string>> {
  const ids = [...new Set(itemIds.filter((id) => /^[1-9]\d{0,19}$/.test(id)))];
  if (!ids.length) return new Set();
  const data = await monday<{ items: { id: string; board: { id: string }; group: { id: string } | null }[] }>("query OnboardingStages($ids: [ID!]!) { items(ids: $ids) { id board { id } group { id } } }", { ids });
  const busy = new Set<string>();
  for (const item of data.items || []) {
    if (item.board?.id !== PIPELINE_BOARD_ID) continue;
    const stage = stageForGroup(item.group?.id || "");
    if (stage !== "launched" && stage !== "template") busy.add(item.id);
  }
  return busy;
}

export async function readClient(id: string, withHistory = false): Promise<Item> {
  const data = await monday<{ items: Item[] }>(`query ClientItem($ids: [ID!]!) { items(ids: $ids) { ${ITEM_FIELDS} ${withHistory ? `updates(limit: 25) { ${UPDATE_FIELDS} }` : ""} } }`, { ids: [id] });
  return requireBoard(data.items?.find((i) => i.id === id));
}
export async function getClient(id: string): Promise<{ row: ClientRow; history: { id: string; text: string; createdAt: string; author: string }[] }> {
  const item = await readClient(id, true);
  return { row: mapClient(item), history: (item.updates || []).map((u) => ({ id: u.id, text: (u.text_body || "").trim(), createdAt: u.created_at, author: u.creator?.name || "Team" })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

async function setColumns(itemId: string, values: Record<string, unknown>): Promise<void> {
  const data = await monday<{ change_multiple_column_values: { id: string } }>("mutation ClientSet($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }", { board: CLIENTS_BOARD_ID, id: itemId, values: JSON.stringify(values) });
  if (data.change_multiple_column_values?.id !== itemId) throw new CallDeskError("Monday did not confirm the change. Reload and check the record.", 502);
}
async function moveTo(itemId: string, group: (typeof CLIENT_GROUPS)[number]["id"]): Promise<void> {
  await monday("mutation ClientMove($id: ID!, $group: String!) { move_item_to_group(item_id: $id, group_id: $group) { id } }", { id: itemId, group: CLIENT_GROUPS.find((g) => g.id === group)!.group });
}
export async function postClientNote(itemId: string, html: string): Promise<void> {
  const data = await monday<{ create_update: { id: string } }>("mutation ClientNote($id: ID!, $body: String!) { create_update(item_id: $id, body: $body) { id } }", { id: itemId, body: html });
  if (!data.create_update?.id) throw new CallDeskError("Monday did not confirm the note.", 502);
}

export type ClientPatch =
  | { action: "group"; group: (typeof CLIENT_GROUPS)[number]["id"] }
  | { action: "health"; value: string }
  | { action: "payStatus"; value: string }
  | { action: "payMethod"; value: string }
  | { action: "gbp"; value: string; gbpUrl: string }
  | { action: "gbpChecked" }
  | { action: "searchAtlasListing"; listingId: string } // "" unlinks
  | { action: "reportSent" }
  | { action: "manager"; ownerId: string }
  | { action: "stripeCustomer"; customerId: string }
  | { action: "dates"; nextBill: string; termEnds: string; billingDay: string }
  | { action: "contact"; contact: string; email: string; phone: string; website: string }
  | { action: "note"; text: string };

export async function applyClientPatch(itemId: string, patch: ClientPatch & { expectedUpdatedAt: string }): Promise<ClientRow> {
  const before = mapClient(await readClient(itemId));
  if (before.updatedAt !== patch.expectedUpdatedAt) throw new CallDeskError("Someone changed this client since you loaded it. Reload to see the latest before changing it.", 409);
  const today = todayEastern();
  switch (patch.action) {
    case "group": await moveTo(itemId, patch.group); break;
    case "health": await setColumns(itemId, { [CCOL.health]: { label: patch.value } }); break;
    case "payStatus": await setColumns(itemId, { [CCOL.payStatus]: { label: patch.value } }); if (["Overdue", "Card Failed"].includes(patch.value) && before.group !== "issue") await moveTo(itemId, "issue"); break;
    case "payMethod": await setColumns(itemId, { [CCOL.payMethod]: { labels: [patch.value] } }); break;
    case "gbp": await setColumns(itemId, { [CCOL.gbpAccess]: { label: patch.value }, ...(patch.value === "Verified" ? { [CCOL.gbpChecked]: { date: today } } : {}), ...(patch.gbpUrl ? { [CCOL.gbpUrl]: { url: patch.gbpUrl, text: patch.gbpUrl } } : {}) }); break;
    case "gbpChecked": await setColumns(itemId, { [CCOL.gbpChecked]: { date: today }, [CCOL.gbpAccess]: { label: "Verified" } }); break;
    case "searchAtlasListing": {
      await setColumns(itemId, { [CCOL.searchAtlasListing]: patch.listingId });
      const id = parseListingId(patch.listingId);
      if (id) { const linked = mapClient(await readClient(itemId)); return (await liveGbpForClient(linked, { fresh: true })).row; }
      break;
    }
    case "reportSent": await setColumns(itemId, { [CCOL.lastReport]: { date: today } }); break;
    case "manager": await setColumns(itemId, { [CCOL.accountManager]: patch.ownerId ? { personsAndTeams: [{ id: Number(patch.ownerId), kind: "person" }] } : { personsAndTeams: [] } }); break;
    case "stripeCustomer": await setColumns(itemId, { [CCOL.stripeCustomer]: patch.customerId }); break;
    case "dates": await setColumns(itemId, { [CCOL.nextBill]: patch.nextBill ? { date: patch.nextBill } : null, [CCOL.termEnds]: patch.termEnds ? { date: patch.termEnds } : null, [CCOL.billingDay]: patch.billingDay || "" }); break;
    case "contact": await setColumns(itemId, { [CCOL.contact]: patch.contact, [CCOL.email]: patch.email ? { email: patch.email, text: patch.email } : { email: "", text: "" }, [CCOL.phone]: patch.phone ? { phone: patch.phone.replace(/[^+\d]/g, ""), countryShortName: "US" } : { phone: "", countryShortName: "US" }, [CCOL.website]: patch.website ? { url: patch.website.includes(":") ? patch.website : `https://${patch.website}`, text: patch.website } : { url: "", text: "" } }); break;
    case "note": await postClientNote(itemId, `<p>${escapeHtml(patch.text)}</p>`); break;
  }
  return mapClient(await readClient(itemId));
}

/** Pull the client's Stripe state and write it to Monday. Finds the customer by email when no id is stored yet. */
export async function syncClientFromStripe(itemId: string): Promise<{ row: ClientRow; stripe: StripeSnapshot | null; changed: string[] }> {
  const row = mapClient(await readClient(itemId));
  let customerId = row.stripeCustomer;
  if (!customerId) {
    if (!row.email) throw new CallDeskError("No Stripe customer id and no email on this client. Add the email or the customer id first.", 400);
    const found = await findCustomerByEmail(row.email);
    if (!found) throw new CallDeskError(`No Stripe customer uses ${row.email}. Paste the customer id from Stripe instead.`, 404);
    customerId = found.id;
  }
  const snap = await snapshot(customerId);
  const pay = paymentFromSnapshot(snap);
  const values: Record<string, unknown> = { [CCOL.stripeCustomer]: customerId, [CCOL.payStatus]: { label: pay.payStatus } };
  const changed: string[] = [];
  if (row.stripeCustomer !== customerId) changed.push("customer id");
  if (row.payStatus !== pay.payStatus) changed.push(`payment → ${pay.payStatus}`);
  if (pay.lastPayment && pay.lastPayment !== row.lastPayment) { values[CCOL.lastPayment] = { date: pay.lastPayment }; changed.push(`last payment ${pay.lastPayment}`); }
  if (pay.nextBill && pay.nextBill !== row.nextBill) { values[CCOL.nextBill] = { date: pay.nextBill }; changed.push(`next bill ${pay.nextBill}`); }
  if (!row.payMethod.startsWith("Stripe")) { values[CCOL.payMethod] = { labels: ["Stripe via GHL"] }; changed.push("method → Stripe"); }
  await setColumns(itemId, values);
  if (pay.group && pay.group !== row.group && !(pay.group === "active" && ["risk", "paused"].includes(row.group))) { await moveTo(itemId, pay.group); changed.push(`group → ${pay.group}`); }
  return { row: mapClient(await readClient(itemId)), stripe: snap, changed };
}

/** Webhook / reconcile entry: which Team-desk client owns this Stripe customer? */
export async function findClientByStripeCustomer(customerId: string, email?: string | null): Promise<ClientRow | null> {
  const byId = await monday<{ items_page_by_column_values: { items: Item[] } }>(
    `query ClientByStripe($board: ID!, $columns: [ItemsPageByColumnValuesQuery!]) { items_page_by_column_values(board_id: $board, limit: 5, columns: $columns) { items { ${ITEM_FIELDS} } } }`,
    { board: CLIENTS_BOARD_ID, columns: [{ column_id: CCOL.stripeCustomer, column_values: [customerId] }] },
  );
  const hit = (byId.items_page_by_column_values?.items || []).map(mapClient).find((r) => r.teamDesk);
  if (hit) return hit;
  if (!email) return null;
  const list = await listClients(null);
  return list.rows.find((r) => r.email.toLowerCase() === email.toLowerCase() && !r.stripeCustomer) || null;
}

/** Graduate an onboarding record to Active Clients. Idempotent on the onboarding item id. */
export async function graduateFromOnboarding(ob: OnboardingRow, managerId: string): Promise<{ id: string; url: string; created: boolean }> {
  const existing = await monday<{ items_page_by_column_values: { items: Item[] } }>(
    `query ClientByOnboarding($board: ID!, $columns: [ItemsPageByColumnValuesQuery!]) { items_page_by_column_values(board_id: $board, limit: 5, columns: $columns) { items { ${ITEM_FIELDS} } } }`,
    { board: CLIENTS_BOARD_ID, columns: [{ column_id: CCOL.onboardingItem, column_values: [ob.id] }] },
  );
  const found = existing.items_page_by_column_values?.items?.[0];
  if (found) return { id: found.id, url: `${MONDAY_ORIGIN}/boards/${CLIENTS_BOARD_ID}/pulses/${found.id}`, created: false };
  const today = todayEastern();
  const packages = ob.packages.split(",").map((s) => s.trim()).filter(Boolean);
  // Giveaway winners keep the "Giveaway Winner" package label (so nobody bills them), no payment method, and say so in the notes.
  const winner = isGiveawayWinner(packages);
  const values: Record<string, unknown> = {
    [CCOL.contact]: ob.contact, [CCOL.health]: { label: "Too New" }, [CCOL.payStatus]: { label: "No Billing Set Up" }, ...(winner ? {} : { [CCOL.payMethod]: { labels: ["Stripe via GHL"] } }),
    [CCOL.clientSince]: { date: ob.signed || today }, [CCOL.teamDesk]: { checked: "true" }, [CCOL.onboardingItem]: ob.id,
    [CCOL.gbpAccess]: { label: ["Verified", "No GBP Exists", "Requested"].includes(ob.gbpAccess) ? ob.gbpAccess : "Not Requested" },
    [CCOL.notes]: `${winner ? "GIVEAWAY WINNER — NO CHARGE. Do not invoice. " : ""}Graduated from onboarding ${today}. Sales owner: ${ob.salesOwner || "—"}. ${ob.notes || ""}`.trim(),
  };
  if (ob.gbpAccess === "Verified") values[CCOL.gbpChecked] = { date: today };
  if (parseListingId(ob.searchAtlasListing)) values[CCOL.searchAtlasListing] = ob.searchAtlasListing;
  if (packages.length) values[CCOL.package] = { labels: packages };
  if (ob.email) values[CCOL.email] = { email: ob.email, text: ob.email };
  if (ob.phone) values[CCOL.phone] = { phone: ob.phone.replace(/[^+\d]/g, ""), countryShortName: "US" };
  if (ob.siteUrl) values[CCOL.website] = { url: ob.siteUrl, text: ob.siteUrl };
  if (ob.gbpUrl) values[CCOL.gbpUrl] = { url: ob.gbpUrl, text: ob.gbpUrl };
  if (ob.driveFolder) values[CCOL.driveFolder] = { url: ob.driveFolder, text: ob.driveFolder };
  // Carry the GHL contact link over (set by a handoff from a GoHighLevel lead) so the package builder's winner guard still matches.
  if (ob.ghlContact) values[CCOL.ghlContact] = { url: ob.ghlContact, text: ob.ghlContact.split("/").pop() || ob.ghlContact };
  if (managerId && onboardingOwners().some((o) => o.id === managerId)) values[CCOL.accountManager] = { personsAndTeams: [{ id: Number(managerId), kind: "person" }] };
  const data = await monday<{ create_item: { id: string } }>(
    "mutation ClientCreate($board: ID!, $group: String!, $name: String!, $values: JSON!) { create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $values, create_labels_if_missing: true) { id } }",
    { board: CLIENTS_BOARD_ID, group: CLIENT_GROUPS.find((g) => g.id === "active")!.group, name: ob.name.slice(0, 255), values: JSON.stringify(values) }, 25000,
  );
  const id = data.create_item?.id;
  if (!id) throw new CallDeskError("Monday did not confirm the new client row. Check the Active Clients board before retrying.", 502);
  const url = `${MONDAY_ORIGIN}/boards/${CLIENTS_BOARD_ID}/pulses/${id}`;
  // Reverse link + stage on the onboarding record (best effort; the client row is the durable part).
  try {
    await monday("mutation OnboardingLaunched($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }", { board: PIPELINE_BOARD_ID, id: ob.id, values: JSON.stringify({ [OCOL.lastTouch]: { date: today }, [OCOL.nextAction]: `Graduated to Active Clients ${today}` }) });
    await monday("mutation OnboardingLaunchedGroup($id: ID!, $group: String!) { move_item_to_group(item_id: $id, group_id: $group) { id } }", { id: ob.id, group: STAGES.find((s) => s.id === "launched")!.group });
    await monday("mutation OnboardingLaunchedNote($id: ID!, $body: String!) { create_update(item_id: $id, body: $body) { id } }", { id: ob.id, body: `<p><strong>Launched.</strong> Client row: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` });
  } catch { /* visible on the next refresh; the desk shows the client link regardless */ }
  return { id, url, created: true };
}

/** Non-owners get the same row without dollar amounts. */
export function withoutMoney(row: ClientRow): ClientRow {
  return { ...row, mrr: "", customMonthly: "" };
}
export function stripeWithoutMoney(s: StripeSnapshot | null): StripeSnapshot | null {
  if (!s) return s;
  return { ...s, subscription: s.subscription ? { ...s.subscription, amount: 0 } : null, latestInvoice: s.latestInvoice ? { ...s.latestInvoice, amountDue: 0 } : null };
}

