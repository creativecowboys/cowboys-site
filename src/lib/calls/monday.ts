import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { CallDraft, CallHistory, CallLead, CallsPageData, SaveCallResult } from "@/app/leads/types";
import { CallDeskError, validateLeadId } from "./validation";
import { isCallOutcome, mondayOutcome } from "./outcomes";

// Server routes only. Never expose the token through NEXT_PUBLIC_ variables or client code.
// Ported from creativecowboys/local-seo-engine PR #1 (Codex, Sep 21 2026); assignment added.
export const GIVEAWAY_BOARD_ID = "18430997894";
const API_VERSION = "2026-07";
const COLUMN_IDS = ["contact", "email", "phone", "website", "city", "owner", "outreach", "interest", "notes", "last_contact", "next_followup", "quoted_monthly", "dropdown_mm77a9z5", "audit_score", "audit_report"];

// Monday user ids for the three people who work the desk (creativecowboys.monday.com, Sep 21 2026).
export const TEAM: Record<"Dave" | "Josh" | "Keaton", number> = { Dave: 39848115, Josh: 39848217, Keaton: 116679004 };

type Column = { id: string; text: string | null; value: string | null };
type Update = { id: string; text_body: string | null; created_at: string; creator: { name: string } | null };
type Item = { id: string; name: string; updated_at: string; board: { id: string }; group: { title: string } | null; column_values: Column[]; updates?: Update[] };
const ITEM_FIELDS = `id name updated_at board { id } group { title } column_values(ids: ${JSON.stringify(COLUMN_IDS)}) { id text value }`;
const UPDATE_FIELDS = "id text_body created_at creator { name }";

function token(): string {
  const value = process.env.MONDAY_API_TOKEN;
  if (!value) throw new CallDeskError("Monday is not connected to the call desk yet. Ask your administrator to finish the secure connection.", 503);
  return value;
}

async function monday<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const auth = token();
  try {
    // No automatic retries: a timed-out mutation may already have been applied by Monday.
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST", headers: { Authorization: auth, "Content-Type": "application/json", "API-Version": API_VERSION },
      body: JSON.stringify({ query, variables }), cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("upstream");
    const result = await response.json() as { data?: T; errors?: unknown[] };
    if (!result.data || result.errors?.length) throw new Error("upstream");
    return result.data;
  } catch {
    throw new CallDeskError("Monday could not complete this request. Your draft is still available; please try again.");
  }
}

function requireBoard(item: Item | undefined): Item {
  if (!item || item.board?.id !== GIVEAWAY_BOARD_ID) throw new CallDeskError("This lead is not available on the giveaway board.", 404);
  return item;
}

export function mapLead(item: Item): CallLead {
  requireBoard(item);
  const cols = Object.fromEntries(item.column_values.map((c) => [c.id, c.text || ""]));
  const link = (id: string): string => {
    try {
      const raw = JSON.parse(item.column_values.find((c) => c.id === id)?.value || "null");
      if (typeof raw?.url === "string") return raw.url;
    } catch { /* Text columns and empty links use their display value. */ }
    return cols[id] || "";
  };
  // The owner column's display text is whatever Monday shows ("Dave Collum, Josh Pack").
  // ownerId is the first assigned person, so the desk can pre-select the dropdown.
  let ownerId = "";
  let ownerIds: string[] = [];
  try {
    const raw = JSON.parse(item.column_values.find((c) => c.id === "owner")?.value || "null");
    ownerIds = (raw?.personsAndTeams || []).filter((p: { kind?: string; id?: unknown }) => p?.kind === "person" && p.id != null).map((p: { id: unknown }) => String(p.id));
    ownerId = ownerIds[0] || "";
  } catch { /* empty owner */ }
  return {
    id: item.id, name: item.name, contact: cols.contact || "", email: cols.email || "", phone: cols.phone || "",
    website: link("website"), city: cols.city || "", owner: cols.owner || "", ownerId, ownerIds, outreach: cols.outreach || "",
    interest: cols.interest || "", notes: cols.notes || "", lastContact: cols.last_contact || "", nextFollowup: cols.next_followup || "",
    quotedMonthly: cols.quoted_monthly || "", interestedIn: cols.dropdown_mm77a9z5 || "", auditScore: cols.audit_score || "",
    auditReport: link("audit_report"), group: item.group?.title || "", updatedAt: item.updated_at,
    mondayUrl: `https://creativecowboys.monday.com/boards/${GIVEAWAY_BOARD_ID}/pulses/${item.id}`,
  };
}

function signCursor(body: string): string { return createHmac("sha256", token()).update(`call-desk-cursor.${body}`).digest("base64url"); }
function wrapCursor(cursor: string | null): string | null {
  if (!cursor) return null;
  const body = Buffer.from(JSON.stringify({ board: GIVEAWAY_BOARD_ID, cursor, expires: Date.now() + 55 * 60000 })).toString("base64url");
  return `${body}.${signCursor(body)}`;
}
export function unwrapCursor(value: string | null): string | null {
  if (value === null) return null;
  if (value.length > 12000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new CallDeskError("Invalid page. Reload the lead list.", 400);
  const [body, signature] = value.split(".");
  const expected = Buffer.from(signCursor(body));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new CallDeskError("Invalid page. Reload the lead list.", 400);
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decoded.board !== GIVEAWAY_BOARD_ID || typeof decoded.cursor !== "string" || decoded.cursor.length > 8000 || !Number.isFinite(decoded.expires) || decoded.expires <= Date.now()) throw new Error("invalid");
    return decoded.cursor;
  } catch { throw new CallDeskError("This page has expired. Reload the lead list.", 400); }
}

export async function getCallsPage(cursor: string | null): Promise<CallsPageData> {
  const rawCursor = unwrapCursor(cursor);
  const data = await monday<{ boards: { id: string; name: string; items_page: { cursor: string | null; items: Item[] } }[] }>(
    `query CallDeskLeads($board: [ID!]!, $cursor: String) { boards(ids: $board) { id name items_page(limit: 50, cursor: $cursor) { cursor items { ${ITEM_FIELDS} } } } }`,
    { board: [GIVEAWAY_BOARD_ID], cursor: rawCursor },
  );
  const board = data.boards?.find((b) => b.id === GIVEAWAY_BOARD_ID);
  if (!board?.items_page) throw new CallDeskError("The giveaway board is not available to this connection.", 502);
  return { leads: board.items_page.items.map(mapLead), cursor: wrapCursor(board.items_page.cursor), boardName: board.name };
}

async function readItem(id: string, withHistory = false): Promise<Item> {
  validateLeadId(id);
  const data = await monday<{ items: Item[] }>(`query CallDeskLead($ids: [ID!]!) { items(ids: $ids) { ${ITEM_FIELDS} ${withHistory ? `updates(limit: 25) { ${UPDATE_FIELDS} }` : ""} } }`, { ids: [id] });
  return requireBoard(data.items?.find((i) => i.id === id));
}

export async function getCallLead(id: string): Promise<{ lead: CallLead; history: CallHistory[] }> {
  const item = await readItem(id, true);
  return { lead: mapLead(item), history: (item.updates || []).map((u) => ({ id: u.id, text: readableHistory(u.text_body || ""), createdAt: u.created_at, author: u.creator?.name || "Team", isCallNote: (u.text_body || "").includes("[CC-CALL:") })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

/** Assign (or clear) the Monday owner. Returns the refreshed lead so the desk can update in place. */
export async function assignOwner(id: string, owner: "Dave" | "Josh" | "Keaton" | "", expectedUpdatedAt: string): Promise<CallLead> {
  validateLeadId(id);
  const initial = await readItem(id); // 404s outside the giveaway board.
  if (initial.updated_at !== expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your notes are safe. Load the latest Monday record before assigning it.", 409);
  const value = owner ? { personsAndTeams: [{ id: TEAM[owner], kind: "person" }] } : { personsAndTeams: [] };
  const changed = await monday<{ change_multiple_column_values: { id: string } }>(
    "mutation AssignLead($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }",
    { board: GIVEAWAY_BOARD_ID, id, values: JSON.stringify({ owner: value }) },
  );
  if (changed.change_multiple_column_values?.id !== id) throw new CallDeskError("Monday did not confirm the assignment. Check the lead in Monday.");
  const confirmed = mapLead(await readItem(id));
  if (confirmed.ownerId !== (owner ? String(TEAM[owner]) : "")) throw new CallDeskError("The Monday owner changed before confirmation. Your notes are safe. Load the latest record to check the assignment.", 409);
  return confirmed;
}

function readableHistory(text: string): string {
  return text
    .replace(/\[CC-CALL:[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}\]/gi, "")
    .replace(/\[CC-PAYLOAD:[\da-f]{64}\]/gi, "")
    .trim();
}

const marker = (callId: string) => `[CC-CALL:${callId}]`;
// Exclude the optimistic version: a legitimate retry may follow a reload. Include
// every user-entered field so a reused call ID cannot silently discard changed notes.
function payloadMarker(draft: CallDraft): string {
  const content = Object.entries(draft).filter(([key]) => key !== "expectedUpdatedAt").sort(([a], [b]) => a.localeCompare(b));
  return `[CC-PAYLOAD:${createHash("sha256").update(JSON.stringify(content)).digest("hex")}]`;
}
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\n/g, "<br>");
export function formatCallSummary(draft: CallDraft): string {
  const fields: [string, string][] = [
    ["Rep", draft.rep], ["Outcome", draft.outcome], ["Business goal", draft.goal], ["Current marketing", draft.currentMarketing],
    ["Main challenge", draft.challenge], ["Budget discussed", draft.budget], ["Timing", draft.timing], ["Recommendation", draft.recommendation],
    ["Conversation notes", draft.notes], ["Next step", draft.nextStep], ["Interest", draft.interest], ["Follow-up date", draft.followupDate],
    ["Monthly quote discussed", draft.quotedMonthly ? `$${draft.quotedMonthly}` : ""],
  ];
  return `<p><strong>Christmas in September — follow-up call</strong></p>${fields.filter(([, value]) => value).map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("")}<p>${marker(draft.callId)} ${payloadMarker(draft)}</p>`;
}

async function findPriorCall(leadId: string, callId: string): Promise<Update | undefined> {
  // Exhaust pagination (up to 1,000 updates); fail closed if a full scan cannot finish.
  const started = Date.now();
  for (let page = 1; page <= 10; page++) {
    if (Date.now() - started > 25000) throw new CallDeskError("Could not finish verifying earlier saves. Keep your draft and check this lead in Monday before retrying.", 409);
    const data = await monday<{ items: Item[] }>(`query CallDeskRetry($ids: [ID!]!, $page: Int!) { items(ids: $ids) { id board { id } updates(limit: 100, page: $page) { ${UPDATE_FIELDS} } } }`, { ids: [leadId], page });
    const item = requireBoard(data.items?.find((i) => i.id === leadId));
    if (!item.updates) throw new CallDeskError("Could not verify earlier saves. Check this lead in Monday before retrying.");
    const match = item.updates.find((update) => (update.text_body || "").includes(marker(callId)));
    if (match) return match;
    if (item.updates.length < 100) return undefined;
  }
  throw new CallDeskError("This lead has too much history to verify a safe retry. Check its updates in Monday before saving.", 409);
}

/** Blank optional values mean leave Monday unchanged, never erase existing information. */
export function callColumns(draft: CallDraft, today: string): Record<string, unknown> {
  if (!isCallOutcome(draft.outcome)) throw new CallDeskError("Choose a valid call outcome.", 400);
  const columns: Record<string, unknown> = { outreach: { label: mondayOutcome(draft.outcome) }, last_contact: { date: today } };
  if (draft.interest) columns.interest = { label: draft.interest };
  if (draft.followupDate) columns.next_followup = { date: draft.followupDate };
  if (draft.quotedMonthly) columns.quoted_monthly = draft.quotedMonthly;
  return columns;
}

function sameColumns(before: Item, after: Item, keys: string[]): boolean {
  return keys.every((id) => {
    const a = before.column_values.find((c) => c.id === id);
    const b = after.column_values.find((c) => c.id === id);
    return a?.value === b?.value && a?.text === b?.text;
  });
}

// A process-local guard reduces double clicks on the same warm instance. It is NOT a
// distributed lock: Monday does not provide atomic compare-and-set or idempotency.
const savingLeads = new Set<string>();
export async function saveCall(draft: CallDraft): Promise<SaveCallResult> {
  if (savingLeads.has(draft.leadId)) throw new CallDeskError("A call for this lead is already saving. Keep your draft and retry in a moment.", 409);
  savingLeads.add(draft.leadId);
  try {
    const initial = await readItem(draft.leadId);
    const prior = await findPriorCall(draft.leadId, draft.callId);
    const mondayUrl = mapLead(initial).mondayUrl;
    if (prior) {
      if (!(prior.text_body || "").includes(payloadMarker(draft))) throw new CallDeskError("A different version of this call note is already in Monday. Your edited draft has not been saved. Review the existing note before starting a new call record.", 409);
      return { saved: true, updateId: prior.id, mondayUrl, warning: "This call note was already saved. Board-field completion could not be confirmed, so no fields were overwritten. Review the lead in Monday." };
    }
    const baseline = await readItem(draft.leadId);
    if (baseline.updated_at !== draft.expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your draft is safe. Reload the lead and review the changes before saving.", 409);
    let updateId: string;
    try {
      const created = await monday<{ create_update: { id: string } }>("mutation SaveCallNote($id: ID!, $body: String!) { create_update(item_id: $id, body: $body) { id } }", { id: draft.leadId, body: formatCallSummary(draft) });
      if (!created.create_update?.id) throw new Error("unknown result");
      updateId = created.create_update.id;
    } catch {
      throw new CallDeskError("Monday did not confirm the call note. It may already be saved. Keep this draft and retry with the same call reference; do not start a new call.", 502);
    }
    const saved = { saved: true as const, updateId, mondayUrl };
    try {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const columns = callColumns(draft, today);
      const fresh = await readItem(draft.leadId);
      if (!sameColumns(baseline, fresh, Object.keys(columns))) return { ...saved, warning: "Your call note is saved. Another change was detected, so board fields were left unchanged. Review them in Monday." };
      const changed = await monday<{ change_multiple_column_values: { id: string } }>("mutation SaveCallFields($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }", { board: GIVEAWAY_BOARD_ID, id: draft.leadId, values: JSON.stringify(columns) });
      if (changed.change_multiple_column_values?.id !== draft.leadId) throw new Error("unconfirmed");
      return saved;
    } catch {
      return { ...saved, warning: "Your call note is saved. Monday did not confirm all board-field updates. Check the status, follow-up date, and quote in Monday before making further changes." };
    }
  } finally { savingLeads.delete(draft.leadId); }
}
