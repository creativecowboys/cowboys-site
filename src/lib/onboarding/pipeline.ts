import { createHmac, timingSafeEqual } from "node:crypto";
import { CallDeskError } from "@/lib/calls/validation";
import { escapeHtml, monday, mondayToken, todayEastern } from "./api";
import { COL, GIVEAWAY_BOARD_ID, MONDAY_ORIGIN, PIPELINE_BOARD_ID, PIPELINE_CHECKLIST_BOARD_ID, STAGES, SUBITEM_COL, TEMPLATE_GROUP_ID, onboardingOwners, stageForGroup, STAFF } from "./config";
import { checklistFor, isRequiredName, missingRequired, readinessProblems } from "./checklist";
import type { ChecklistItem, HandoffForm, OnboardingListData, OnboardingRow } from "./types";
import type { PatchAction } from "./validation";

type Column = { id: string; text: string | null; value: string | null };
type Sub = { id: string; name: string; column_values: Column[] };
type Update = { id: string; text_body: string | null; created_at: string; creator: { name: string } | null };
type Item = { id: string; name: string; updated_at: string; board: { id: string }; group: { id: string; title: string } | null; column_values: Column[]; subitems?: Sub[] | null; updates?: Update[] };

const COLUMN_IDS = Object.values(COL);
const ITEM_FIELDS = `id name updated_at board { id } group { id title } column_values(ids: ${JSON.stringify(COLUMN_IDS)}) { id text value } subitems { id name column_values(ids: ${JSON.stringify(Object.values(SUBITEM_COL))}) { id text value } }`;
const UPDATE_FIELDS = "id text_body created_at creator { name }";
export const GIVEAWAY_WON_GROUP = "group_mm76aae3";

function requirePipeline(item: Item | undefined): Item {
  if (!item || item.board?.id !== PIPELINE_BOARD_ID) throw new CallDeskError("This client is not on the onboarding board.", 404);
  return item;
}
const parseJson = (value: string | null): unknown => { try { return JSON.parse(value || "null"); } catch { return null; } };
function people(cols: Column[], id: string): string[] {
  const raw = parseJson(cols.find((c) => c.id === id)?.value || null) as { personsAndTeams?: { id?: unknown; kind?: string }[] } | null;
  return (raw?.personsAndTeams || []).filter((p) => p?.kind === "person" && p.id != null).map((p) => String(p.id));
}
function link(cols: Column[], id: string): string {
  const raw = parseJson(cols.find((c) => c.id === id)?.value || null) as { url?: unknown } | null;
  return typeof raw?.url === "string" ? raw.url : cols.find((c) => c.id === id)?.text || "";
}
function checked(cols: Column[], id: string): boolean {
  const raw = parseJson(cols.find((c) => c.id === id)?.value || null) as { checked?: unknown } | null;
  return raw?.checked === true || raw?.checked === "true";
}
/** Next action text carries its due date as a "[due YYYY-MM-DD]" prefix so Monday users see it too. */
export function splitNextAction(text: string): { action: string; due: string } {
  const m = /^\[due (\d{4}-\d{2}-\d{2})\]\s*/.exec(text);
  return m ? { action: text.slice(m[0].length), due: m[1] } : { action: text, due: "" };
}
export const joinNextAction = (action: string, due: string) => (due ? `[due ${due}] ${action}` : action);

export function mapRow(item: Item): OnboardingRow {
  requirePipeline(item);
  const cols = item.column_values;
  const text = (id: string) => cols.find((c) => c.id === id)?.text || "";
  const packages = text(COL.package);
  const packageList = packages.split(",").map((s) => s.trim()).filter(Boolean);
  const checklist: ChecklistItem[] = (item.subitems || []).map((s) => {
    const t = (id: string) => s.column_values.find((c) => c.id === id)?.text || "";
    return { id: s.id, name: s.name, status: t(SUBITEM_COL.status), owner: t(SUBITEM_COL.owner), due: t(SUBITEM_COL.due), phase: t(SUBITEM_COL.phase), required: isRequiredName(s.name, packageList) };
  });
  const next = splitNextAction(text(COL.nextAction));
  const today = todayEastern();
  const salesIds = people(cols, COL.salesOwner);
  const onboardingIds = people(cols, COL.onboardingOwner);
  const nameFor = (ids: string[]) => ids.map((id) => [...STAFF, ...onboardingOwners()].find((o) => o.id === id)?.name || id).join(", ");
  return {
    id: item.id, name: item.name, url: `${MONDAY_ORIGIN}/boards/${PIPELINE_BOARD_ID}/pulses/${item.id}`, updatedAt: item.updated_at,
    stage: (stageForGroup(item.group?.id || "") === "template" ? "unknown" : stageForGroup(item.group?.id || "")) as OnboardingRow["stage"], group: item.group?.title || "", health: text(COL.health),
    onboardingOwner: text(COL.onboardingOwner) || nameFor(onboardingIds), onboardingOwnerIds: onboardingIds, salesOwner: text(COL.salesOwner) || nameFor(salesIds), salesOwnerIds: salesIds, buildOwner: text(COL.buildOwner),
    contact: text(COL.contact), email: text(COL.email), phone: text(COL.phone), city: text(COL.city), businessType: text(COL.businessType),
    packages, monthly: text(COL.monthlyFormula), setup: text(COL.setup), customMonthly: text(COL.customMonthly),
    signed: text(COL.signed), targetLaunch: text(COL.targetLaunch), nextAction: next.action, lastTouch: text(COL.lastTouch),
    gbpAccess: text(COL.gbpAccess), dnsPath: text(COL.dnsPath), agreement: text(COL.agreement), payment: text(COL.payment), intake: text(COL.intake),
    leadId: text(COL.leadId), handoffId: text(COL.handoffId), siteUrl: link(cols, COL.siteUrl), gbpUrl: link(cols, COL.gbpUrl), onboardingLink: link(cols, COL.onboardingLink), driveFolder: link(cols, COL.driveFolder), notes: text(COL.notes),
    profileComplete: checked(cols, COL.profileComplete), baseline: checked(cols, COL.baseline),
    checklist, missing: missingRequired(checklist),
    overdue: !!next.due && next.due < today && stageForGroup(item.group?.id || "") !== "launched",
  };
}

function signCursor(body: string): string { return createHmac("sha256", mondayToken()).update(`onboarding-cursor.${body}`).digest("base64url"); }
function wrapCursor(cursor: string | null): string | null {
  if (!cursor) return null;
  const body = Buffer.from(JSON.stringify({ board: PIPELINE_BOARD_ID, cursor, expires: Date.now() + 55 * 60000 })).toString("base64url");
  return `${body}.${signCursor(body)}`;
}
function unwrapCursor(value: string | null): string | null {
  if (value === null) return null;
  if (value.length > 12000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new CallDeskError("Invalid page. Reload the client list.", 400);
  const [body, signature] = value.split(".");
  const expected = Buffer.from(signCursor(body)); const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new CallDeskError("Invalid page. Reload the client list.", 400);
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decoded.board !== PIPELINE_BOARD_ID || typeof decoded.cursor !== "string" || decoded.expires <= Date.now()) throw new Error("invalid");
    return decoded.cursor;
  } catch { throw new CallDeskError("This page has expired. Reload the client list.", 400); }
}

export async function listOnboarding(cursor: string | null): Promise<OnboardingListData> {
  const raw = unwrapCursor(cursor);
  const data = await monday<{ boards: { id: string; name: string; items_page: { cursor: string | null; items: Item[] } }[] }>(
    `query OnboardingList($board: [ID!]!, $cursor: String) { boards(ids: $board) { id name items_page(limit: 50, cursor: $cursor) { cursor items { ${ITEM_FIELDS} } } } }`,
    { board: [PIPELINE_BOARD_ID], cursor: raw }, 25000,
  );
  const board = data.boards?.find((b) => b.id === PIPELINE_BOARD_ID);
  if (!board?.items_page) throw new CallDeskError("The onboarding board is not available to this connection.", 502);
  return { rows: board.items_page.items.filter((i) => i.group?.id !== TEMPLATE_GROUP_ID).map(mapRow), cursor: wrapCursor(board.items_page.cursor), boardName: board.name };
}

export async function readPipelineItem(id: string, withHistory = false): Promise<Item> {
  const data = await monday<{ items: Item[] }>(`query OnboardingItem($ids: [ID!]!) { items(ids: $ids) { ${ITEM_FIELDS} ${withHistory ? `updates(limit: 25) { ${UPDATE_FIELDS} }` : ""} } }`, { ids: [id] });
  return requirePipeline(data.items?.find((i) => i.id === id));
}

export async function getOnboarding(id: string): Promise<{ row: OnboardingRow; history: { id: string; text: string; createdAt: string; author: string }[] }> {
  const item = await readPipelineItem(id, true);
  return { row: mapRow(item), history: (item.updates || []).map((u) => ({ id: u.id, text: (u.text_body || "").replace(/\[CC-HANDOFF:[^\]]+\]/g, "").trim(), createdAt: u.created_at, author: u.creator?.name || "Team" })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

/** Durable duplicate check: the board itself is searched for this lead before anything is created. */
export async function findByLeadId(leadId: string): Promise<OnboardingRow[]> {
  const data = await monday<{ items_page_by_column_values: { items: Item[] } }>(
    `query OnboardingByLead($board: ID!, $columns: [ItemsPageByColumnValuesQuery!]) { items_page_by_column_values(board_id: $board, limit: 10, columns: $columns) { items { ${ITEM_FIELDS} } } }`,
    { board: PIPELINE_BOARD_ID, columns: [{ column_id: COL.leadId, column_values: [leadId] }] },
  );
  return (data.items_page_by_column_values?.items || []).filter((i) => i.group?.id !== TEMPLATE_GROUP_ID).map(mapRow);
}

export function handoffColumns(form: HandoffForm): Record<string, unknown> {
  const today = todayEastern();
  const staff = STAFF.find((s) => s.name === form.salesOwner);
  const noteLines = [
    `Monthly agreed: ${form.monthlyAgreed ? `$${form.monthlyAgreed}` : "not recorded"} · Setup agreed: ${form.setupAgreed ? `$${form.setupAgreed}` : "not recorded"}`,
    `Scope: ${form.scope}`, form.exclusions && `Exclusions: ${form.exclusions}`, form.goals && `Goals: ${form.goals}`,
  ].filter(Boolean).join("\n");
  const columns: Record<string, unknown> = {
    [COL.contact]: form.contact, [COL.city]: form.city,
    [COL.signed]: { date: today }, [COL.lastTouch]: { date: today },
    [COL.health]: { label: "Not Started" }, [COL.gbpAccess]: { label: "Not Requested" }, [COL.intake]: { label: "Not sent" },
    [COL.agreement]: { label: form.agreement }, [COL.payment]: { label: form.payment },
    [COL.package]: { labels: form.packages }, [COL.leadId]: form.leadId, [COL.handoffId]: form.handoffId,
    [COL.notes]: noteLines,
    [COL.nextAction]: form.nextAction ? joinNextAction(`${form.nextOwner ? `${form.nextOwner}: ` : ""}${form.nextAction}`, form.nextDue) : joinNextAction("Madison: send the intake link and request assets", form.nextDue),
  };
  if (form.email) columns[COL.email] = { email: form.email, text: form.email };
  if (form.phone) columns[COL.phone] = { phone: form.phone.replace(/[^+\d]/g, ""), countryShortName: "US" };
  if (form.website) columns[COL.siteUrl] = { url: form.website.includes(":") ? form.website : `https://${form.website}`, text: form.website };
  if (form.businessType) columns[COL.businessType] = { labels: [form.businessType] };
  if (form.startDate) columns[COL.targetLaunch] = { date: form.startDate };
  if (form.setupAgreed) columns[COL.setup] = form.setupAgreed;
  if (staff) columns[COL.salesOwner] = { personsAndTeams: [{ id: Number(staff.id), kind: "person" }] };
  return columns;
}

export async function createPipelineItem(form: HandoffForm): Promise<{ id: string; url: string }> {
  const group = STAGES.find((s) => s.id === "new")!.group;
  const data = await monday<{ create_item: { id: string } }>(
    "mutation OnboardingCreate($board: ID!, $group: String!, $name: String!, $values: JSON!) { create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $values) { id } }",
    { board: PIPELINE_BOARD_ID, group, name: form.business.slice(0, 255), values: JSON.stringify(handoffColumns(form)) }, 25000,
  );
  const id = data.create_item?.id;
  if (!id) throw new CallDeskError("Monday did not confirm the new onboarding record. Check the Onboarding Pipeline board before retrying.", 502);
  return { id, url: `${MONDAY_ORIGIN}/boards/${PIPELINE_BOARD_ID}/pulses/${id}` };
}

export function formatHandoffSummary(form: HandoffForm): string {
  const rows: [string, string][] = [
    ["Business", form.business], ["Contact", [form.contact, form.email, form.phone].filter(Boolean).join(" · ")], ["Website", form.website], ["Location", form.city],
    ["Sales owner", form.salesOwner], ["Packages", form.packages.join(", ")], ["Monthly agreed", form.monthlyAgreed ? `$${form.monthlyAgreed}` : "Not recorded"], ["Setup agreed", form.setupAgreed ? `$${form.setupAgreed}` : "Not recorded"],
    ["Scope", form.scope], ["Exclusions", form.exclusions], ["Goals", form.goals], ["Promises / call context", form.context], ["Expected start", form.startDate],
    ["Agreement", form.agreement], ["Payment", form.payment], ["Next action", [form.nextOwner, form.nextAction, form.nextDue && `due ${form.nextDue}`].filter(Boolean).join(" — ")],
  ];
  return `<p><strong>Sales → onboarding handoff</strong></p>${rows.filter(([, v]) => v).map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join("")}<p>[CC-HANDOFF:${form.handoffId}]</p>`;
}

export async function findHandoffUpdate(itemId: string, handoffId: string): Promise<boolean> {
  const data = await monday<{ items: { updates: { text_body: string | null }[] }[] }>("query OnboardingUpdates($ids: [ID!]!) { items(ids: $ids) { updates(limit: 100) { text_body } } }", { ids: [itemId] });
  return (data.items?.[0]?.updates || []).some((u) => (u.text_body || "").includes(`[CC-HANDOFF:${handoffId}]`));
}

export async function postUpdate(itemId: string, body: string): Promise<string> {
  const data = await monday<{ create_update: { id: string } }>("mutation OnboardingNote($id: ID!, $body: String!) { create_update(item_id: $id, body: $body) { id } }", { id: itemId, body });
  if (!data.create_update?.id) throw new CallDeskError("Monday did not confirm the note.", 502);
  return data.create_update.id;
}

/** Idempotent: skips checklist rows whose name already exists on the item. */
export async function ensureChecklist(itemId: string, packages: string[]): Promise<number> {
  const item = await readPipelineItem(itemId);
  const existing = new Set((item.subitems || []).map((s) => s.name));
  let created = 0;
  for (const t of checklistFor(packages)) {
    if (existing.has(t.name)) continue;
    const data = await monday<{ create_subitem: { id: string } }>(
      "mutation OnboardingChecklist($parent: ID!, $name: String!, $values: JSON!) { create_subitem(parent_item_id: $parent, item_name: $name, column_values: $values) { id } }",
      { parent: itemId, name: t.name, values: JSON.stringify({ [SUBITEM_COL.phase]: { labels: [t.phase] } }) },
    );
    if (!data.create_subitem?.id) throw new CallDeskError("Monday did not confirm a checklist row.", 502);
    existing.add(t.name); created++;
  }
  return created;
}

/** Take the sold lead out of the calling queue: status Won, group Won, and an append-only note. */
export async function markSourceLead(leadId: string, itemUrl: string, handoffId: string): Promise<void> {
  const data = await monday<{ items: { id: string; board: { id: string }; group: { id: string } | null; updates: { text_body: string | null }[] }[] }>(
    "query LeadForHandoff($ids: [ID!]!) { items(ids: $ids) { id board { id } group { id } updates(limit: 50) { text_body } } }", { ids: [leadId] },
  );
  const lead = data.items?.find((i) => i.id === leadId);
  if (!lead || lead.board?.id !== GIVEAWAY_BOARD_ID) throw new CallDeskError("The source lead is not on the giveaway board.", 404);
  const marker = `[CC-HANDOFF:${handoffId}]`;
  if (!lead.updates.some((u) => (u.text_body || "").includes(marker))) {
    await postUpdate(leadId, `<p><strong>Handed off to onboarding.</strong> Record: <a href="${escapeHtml(itemUrl)}">${escapeHtml(itemUrl)}</a>. Call history stays here; onboarding work continues on the Onboarding Pipeline board.</p><p>${marker}</p>`);
  }
  await monday("mutation LeadWon($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }",
    { board: GIVEAWAY_BOARD_ID, id: leadId, values: JSON.stringify({ outreach: { label: "Won" }, last_contact: { date: todayEastern() } }) });
  if (lead.group?.id !== GIVEAWAY_WON_GROUP) {
    await monday("mutation LeadWonGroup($id: ID!, $group: String!) { move_item_to_group(item_id: $id, group_id: $group) { id } }", { id: leadId, group: GIVEAWAY_WON_GROUP });
  }
}

export async function readLeadVersion(leadId: string): Promise<{ updatedAt: string; name: string }> {
  const data = await monday<{ items: { id: string; name: string; updated_at: string; board: { id: string } }[] }>("query LeadVersion($ids: [ID!]!) { items(ids: $ids) { id name updated_at board { id } } }", { ids: [leadId] });
  const lead = data.items?.find((i) => i.id === leadId);
  if (!lead || lead.board?.id !== GIVEAWAY_BOARD_ID) throw new CallDeskError("This lead is not available on the giveaway board.", 404);
  return { updatedAt: lead.updated_at, name: lead.name };
}

async function setColumns(itemId: string, values: Record<string, unknown>, board = PIPELINE_BOARD_ID): Promise<void> {
  const data = await monday<{ change_multiple_column_values: { id: string } }>("mutation OnboardingSet($board: ID!, $id: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $id, column_values: $values) { id } }", { board, id: itemId, values: JSON.stringify(values) });
  if (data.change_multiple_column_values?.id !== itemId) throw new CallDeskError("Monday did not confirm the change. Reload and check the record.", 502);
}
export const setPipelineColumns = (itemId: string, values: Record<string, unknown>) => setColumns(itemId, values);

export async function applyPatch(itemId: string, patch: PatchAction & { expectedUpdatedAt: string }): Promise<OnboardingRow> {
  const before = mapRow(await readPipelineItem(itemId));
  if (before.updatedAt !== patch.expectedUpdatedAt) throw new CallDeskError("Someone changed this client since you loaded it. Reload to see the latest before changing it.", 409);
  const touch = { [COL.lastTouch]: { date: todayEastern() } };
  switch (patch.action) {
    case "stage": {
      if (patch.stage === "ready") {
        const problems = readinessProblems(before);
        if (problems.length) throw new CallDeskError(`Not ready for production yet: ${problems.join("; ")}.`, 409);
        await setColumns(itemId, { ...touch, [COL.profileComplete]: { checked: "true" } });
      } else await setColumns(itemId, touch);
      await monday("mutation OnboardingStage($id: ID!, $group: String!) { move_item_to_group(item_id: $id, group_id: $group) { id } }", { id: itemId, group: STAGES.find((s) => s.id === patch.stage)!.group });
      break;
    }
    case "ready": {
      const problems = readinessProblems(before);
      if (problems.length) throw new CallDeskError(`Not ready for production yet: ${problems.join("; ")}.`, 409);
      await setColumns(itemId, { ...touch, [COL.profileComplete]: { checked: "true" }, [COL.health]: { label: "On Track" } });
      await monday("mutation OnboardingReady($id: ID!, $group: String!) { move_item_to_group(item_id: $id, group_id: $group) { id } }", { id: itemId, group: STAGES.find((s) => s.id === "ready")!.group });
      break;
    }
    case "health": await setColumns(itemId, { ...touch, [COL.health]: { label: patch.value } }); break;
    case "owner": await setColumns(itemId, { ...touch, [COL.onboardingOwner]: patch.ownerId ? { personsAndTeams: [{ id: Number(patch.ownerId), kind: "person" }] } : { personsAndTeams: [] } }); break;
    case "checklist": {
      if (!before.checklist.some((c) => c.id === patch.subitemId)) throw new CallDeskError("That checklist item does not belong to this client.", 400);
      await setColumns(patch.subitemId, { [SUBITEM_COL.status]: { label: patch.status || "Working on it" } }, PIPELINE_CHECKLIST_BOARD_ID);
      await setColumns(itemId, touch);
      break;
    }
    case "gbp": await setColumns(itemId, { ...touch, [COL.gbpAccess]: { label: patch.value }, ...(patch.gbpUrl ? { [COL.gbpUrl]: { url: patch.gbpUrl, text: patch.gbpUrl } } : {}) }); break;
    case "agreement": await setColumns(itemId, { ...touch, [COL.agreement]: { label: patch.value } }); break;
    case "payment": await setColumns(itemId, { ...touch, [COL.payment]: { label: patch.value } }); break;
    case "dns": await setColumns(itemId, { ...touch, [COL.dnsPath]: patch.value ? { labels: [patch.value] } : { labels: [] } }); break;
    case "next": await setColumns(itemId, { ...touch, [COL.nextAction]: joinNextAction(patch.nextAction, patch.due) }); break;
    case "intakeReviewed": await setColumns(itemId, { ...touch, [COL.intake]: { label: "Reviewed" } }); break;
    case "note": await postUpdate(itemId, `<p>${escapeHtml(patch.text)}</p>`); await setColumns(itemId, touch); break;
  }
  return mapRow(await readPipelineItem(itemId));
}
