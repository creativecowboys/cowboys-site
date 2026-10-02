import { CallDeskError } from "@/lib/calls/validation";
import { monday } from "@/lib/onboarding/api";
import { GIVEAWAY_BOARD_ID, mapLead as mapMondayLead } from "@/lib/calls/monday";
import type { CallLead } from "@/app/leads/types";
import { addNote, addTags, contactDisplayName, fieldText, getContact, ghlConfigured, listNotes, listUsers, listWorkflows, normalizePhone, searchContacts, splitName, updateContact, upsertContact, type GhlContact, type GhlContactPatch } from "./client";
import { ensureSalesFields, LEAD_SOURCE, OUTREACH_OPTIONS, INTEREST_OPTIONS, requireField, SALES_FIELDS, salesFields, type SalesFieldKey, type SalesFields } from "./fields";
import { ghlRepIds, MONDAY_IDS, REP_NAMES, type RepName } from "./reps";
import { LEAD_TAGS, rosterFilters, rosterTags, WON_TAG } from "@/lib/calls/ghl";
import { importMarker } from "@/lib/calls/markers";

// One-time / operator tooling behind the owner-only /api/team/ghl/* routes (Oct 1 2026):
//   diag     — read-only probe of what the token can do and whether the desk's fields exist
//   setup    — ensureSalesFields (dry-run by default)
//   backfill — Lead Source for contacts already in GHL (giveaway-entrant → The Big Giveaway, playbook-lead → Ebook download, website-form → Website form)
//   migrate  — the Monday Giveaway Leads board → GHL contacts (owner, status, interest, notes, follow-up, quote, audit, call history)
// Every write path takes dryRun (default true) and a batch limit, and is idempotent so a re-run finishes what a timeout left.
export const TEST_CONTACT_ID = "C8FHl1LIfXEMI9isByB2"; // the GHL test contact used by the package-builder checks (Sep 30 2026)
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────────── diag ─────────────────────────────
export type Probe = { ok: boolean; detail: string };
export async function diagnose(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { configured: ghlConfigured(), leadsBackend: process.env.LEADS_BACKEND === "ghl" ? "ghl" : "monday", repIds: ghlRepIds(), leadTags: LEAD_TAGS, rosterTags: rosterTags() };
  if (!ghlConfigured()) return { ...out, note: "GHL_API_TOKEN / GHL_LOCATION_ID not set on this deployment." };
  const probe = async (name: string, fn: () => Promise<string>) => { try { out[name] = { ok: true, detail: await fn() } satisfies Probe; } catch (e) { out[name] = { ok: false, detail: e instanceof Error ? e.message : String(e) } satisfies Probe; } };
  let fields: SalesFields = {};
  await probe("customFieldsRead", async () => { fields = await salesFields(true); const keys = Object.keys(SALES_FIELDS) as SalesFieldKey[]; const have = keys.filter((k) => fields[k]); const missing = keys.filter((k) => !fields[k]).map((k) => SALES_FIELDS[k].name); return `${have.length}/${keys.length} desk fields present${missing.length ? `; missing: ${missing.join(", ")}` : ""}`; });
  out.fields = Object.fromEntries((Object.keys(fields) as SalesFieldKey[]).map((k) => [k, { id: fields[k]!.id, name: fields[k]!.name, dataType: fields[k]!.dataType, options: fields[k]!.options }]));
  await probe("allContacts", async () => { const r = await searchContacts({ pageLimit: 1 }); return `${r.total} contacts in the location`; });
  await probe("searchTags", async () => { const r = await searchContacts({ filters: rosterFilters(undefined), pageLimit: 1 }); return `${r.total} contacts carry a lead tag`; });
  if (fields.leadSource) await probe("searchLeadSourceExists", async () => { const r = await searchContacts({ filters: [{ field: `customFields.${fields.leadSource!.id}`, operator: "exists" }], pageLimit: 1 }); return `${r.total} contacts have a Lead Source`; });
  await probe("searchRoster", async () => { const r = await searchContacts({ filters: rosterFilters(fields.leadSource?.id), pageLimit: 1 }); return `${r.total} leads would show on the desk`; });
  for (const tag of LEAD_TAGS) await probe(`tag:${tag}`, async () => { const r = await searchContacts({ filters: [{ field: "tags", operator: "eq", value: tag }], pageLimit: 1 }); return `${r.total}`; });
  await probe("testContact", async () => { const c = await getContact(TEST_CONTACT_ID); return `${contactDisplayName(c) || c.id} · dateUpdated ${c.dateUpdated || "?"} · ${(await listNotes(c.id)).length} notes`; });
  // Names + status only — GHL's API does not say what triggers a workflow. Listed so a person can check that nothing published fires on plain "Contact Created".
  await probe("workflows", async () => { const w = await listWorkflows(); const live = w.filter((x) => x.status === "published"); return `${w.length} workflows, ${live.length} published: ${live.map((x) => x.name).join(" · ")}`; });
  await probe("usersScope", async () => { const u = await listUsers(); return `${u.length} users (${u.map((x) => `${x.name || x.email}:${x.id}`).join(", ")})`; });
  return out;
}

// ───────────────────────────── setup ─────────────────────────────
export const setupFields = (dryRun: boolean) => ensureSalesFields(dryRun);

// ───────────────────────────── backfill ─────────────────────────────
const BACKFILL: { tag: string; source: string; unless: string[] }[] = [
  { tag: "giveaway-entrant", source: LEAD_SOURCE.giveaway, unless: [] },
  { tag: "playbook-lead", source: LEAD_SOURCE.ebook, unless: ["giveaway-entrant"] },
  { tag: "website-form", source: LEAD_SOURCE.website, unless: ["giveaway-entrant", "playbook-lead"] },
];
export type BackfillReport = { dryRun: boolean; perSource: { tag: string; source: string; tagged: number; alreadySet: number; skippedOtherTag: number; toSet: number; set: number; failed: number; sample: string[] }[]; remaining: number };
async function allWithTag(tag: string): Promise<GhlContact[]> {
  const all: GhlContact[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await searchContacts({ filters: [{ field: "tags", operator: "eq", value: tag }], page, pageLimit: 500, sort: [{ field: "dateAdded", direction: "asc" }] }, { timeoutMs: 25000 });
    all.push(...r.contacts);
    if (r.contacts.length < 500) break;
  }
  return all;
}
/** Sets Lead Source only where it is empty. `limit` caps the writes per call; `remaining` says whether to call again. */
export async function backfillLeadSource(dryRun: boolean, limit = 150): Promise<BackfillReport> {
  const fields = await salesFields(true);
  const ls = requireField(fields, "leadSource");
  const report: BackfillReport = { dryRun, perSource: [], remaining: 0 };
  let budget = limit;
  for (const rule of BACKFILL) {
    if (!ls.options.includes(rule.source)) throw new CallDeskError(`Lead Source has no "${rule.source}" option in GoHighLevel — add it before backfilling.`, 409);
    const contacts = await allWithTag(rule.tag);
    const row = { tag: rule.tag, source: rule.source, tagged: contacts.length, alreadySet: 0, skippedOtherTag: 0, toSet: 0, set: 0, failed: 0, sample: [] as string[] };
    for (const c of contacts) {
      if (fieldText(c, ls.id)) { row.alreadySet++; continue; }
      if (rule.unless.some((t) => (c.tags || []).includes(t))) { row.skippedOtherTag++; continue; }
      row.toSet++;
      if (row.sample.length < 5) row.sample.push(`${contactDisplayName(c) || c.email || c.id} (${c.id})`);
      if (dryRun) continue;
      if (budget <= 0) { report.remaining++; continue; }
      try { await updateContact(c.id, { customFields: [{ id: ls.id, field_value: rule.source }] }); row.set++; budget--; await pause(120); }
      catch (e) { row.failed++; console.error(`backfill ${c.id}: ${e instanceof Error ? e.message : e}`); }
    }
    report.perSource.push(row);
  }
  return report;
}

// ───────────────────────────── migrate (Monday → GHL) ─────────────────────────────
type MondayColumn = { id: string; text: string | null; value: string | null };
type MondayUpdate = { id: string; text_body: string | null; created_at: string; creator: { name: string } | null };
type MondayItem = { id: string; name: string; updated_at: string; board: { id: string }; group: { title: string } | null; column_values: MondayColumn[]; updates?: MondayUpdate[] };
const MONDAY_COLUMNS = ["contact", "email", "phone", "website", "city", "owner", "outreach", "interest", "notes", "last_contact", "next_followup", "quoted_monthly", "dropdown_mm77a9z5", "audit_score", "audit_report", "ghl_contact"];
async function readGiveawayBoard(): Promise<MondayItem[]> {
  const items: MondayItem[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data: { boards: { items_page: { cursor: string | null; items: MondayItem[] } }[] } = await monday(
      `query MigrateLeads($board: [ID!]!, $cursor: String) { boards(ids: $board) { items_page(limit: 100, cursor: $cursor) { cursor items { id name updated_at board { id } group { title } column_values(ids: ${JSON.stringify(MONDAY_COLUMNS)}) { id text value } updates(limit: 50) { id text_body created_at creator { name } } } } } }`,
      { board: [GIVEAWAY_BOARD_ID], cursor }, 25000,
    );
    const pg = data.boards?.[0]?.items_page;
    if (!pg) throw new CallDeskError("The Giveaway Leads board is not available to this connection.", 502);
    items.push(...pg.items); cursor = pg.cursor;
    if (!cursor) break;
  }
  return items;
}
export type MigrateRow = { mondayId: string; name: string; match: "imported" | "ghl-link" | "email" | "phone" | "create" | "unmatched"; ghlId: string; owner: string; outreach: string; notes: number; detail?: string; done?: boolean; error?: string };
export type MigrateReport = { dryRun: boolean; total: number; offset: number; processed: number; nextOffset: number | null; ghlContacts: number; counts: Record<MigrateRow["match"], number> & { written: number; failed: number }; rows: MigrateRow[] };

/** Every contact in the location, read once per run (500 a page), indexed for matching — far cheaper than three searches per lead. */
export type ContactIndex = { byId: Map<string, GhlContact>; byMondayId: Map<string, GhlContact>; byEmail: Map<string, GhlContact>; byPhone: Map<string, GhlContact>; total: number };
export function indexContacts(contacts: GhlContact[], mondayFieldId: string): ContactIndex {
  const ix: ContactIndex = { byId: new Map(), byMondayId: new Map(), byEmail: new Map(), byPhone: new Map(), total: contacts.length };
  for (const c of contacts) { // oldest first, so the earliest contact wins a duplicate email/phone
    ix.byId.set(c.id, c);
    const m = fieldText(c, mondayFieldId); if (m && !ix.byMondayId.has(m)) ix.byMondayId.set(m, c);
    const e = (c.email || "").trim().toLowerCase(); if (e && !ix.byEmail.has(e)) ix.byEmail.set(e, c);
    const p = c.phone ? normalizePhone(c.phone) : ""; if (p.length >= 11 && !ix.byPhone.has(p)) ix.byPhone.set(p, c);
  }
  return ix;
}
async function readAllContacts(): Promise<GhlContact[]> {
  const all: GhlContact[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await searchContacts({ page, pageLimit: 500, sort: [{ field: "dateAdded", direction: "asc" }] }, { timeoutMs: 25000 });
    all.push(...r.contacts);
    if (r.contacts.length < 500) break;
  }
  return all;
}
/** The Monday item's own "GHL Contact" link column, when someone filled it: the contact id is the last path segment (or the bare text). */
export function ghlIdFromLink(item: { column_values: { id: string; text: string | null; value: string | null }[] }): string {
  const col = item.column_values.find((c) => c.id === "ghl_contact");
  let raw = col?.text || "";
  try { const v = JSON.parse(col?.value || "null") as { url?: string; text?: string } | null; raw = `${v?.url || ""} ${v?.text || ""} ${raw}`; } catch { /* text only */ }
  return /(?:contacts\/detail\/|^|\s)([A-Za-z0-9]{20})(?=$|[\s/?#])/.exec(raw.trim())?.[1] || "";
}
/** Match order: already imported (Monday Lead ID) → the board's GHL Contact link → email → phone → create → unmatched. */
export function matchLead(item: MondayItem, lead: CallLead, ix: ContactIndex): { match: MigrateRow["match"]; contact: GhlContact | null } {
  const imported = ix.byMondayId.get(item.id); if (imported) return { match: "imported", contact: imported };
  const linked = ix.byId.get(ghlIdFromLink(item)); if (linked) return { match: "ghl-link", contact: linked };
  const email = lead.email.trim().toLowerCase(); const byEmail = email ? ix.byEmail.get(email) : undefined; if (byEmail) return { match: "email", contact: byEmail };
  const phone = lead.phone ? normalizePhone(lead.phone) : ""; const byPhone = phone.length >= 11 ? ix.byPhone.get(phone) : undefined; if (byPhone) return { match: "phone", contact: byPhone };
  return { match: email || phone.length >= 11 ? "create" : "unmatched", contact: null };
}

/** Field + contact writes for one Monday lead. Only fills blank contact fields; desk fields are set from Monday verbatim. */
export function migrationPatch(lead: CallLead, mondayNotes: string, existing: GhlContact | null, fields: SalesFields): GhlContactPatch & { tags?: string[] } {
  const f = (key: SalesFieldKey) => requireField(fields, key).id;
  const custom: { id: string; field_value: unknown }[] = [{ id: f("mondayLeadId"), field_value: lead.id }];
  // Labels are validated against the options GHL actually has on the field (falling back to the catalog list) — never written blind.
  const allowed = (key: "outreach" | "interest", fallback: readonly string[]) => { const live = fields[key]?.options || []; return live.length ? live : fallback; };
  const wanted = lead.group.toLowerCase() === "won" ? "Won" : lead.outreach;
  const outreach = allowed("outreach", OUTREACH_OPTIONS).includes(wanted) ? wanted : "";
  if (outreach) custom.push({ id: f("outreach"), field_value: outreach });
  if (allowed("interest", INTEREST_OPTIONS).includes(lead.interest)) custom.push({ id: f("interest"), field_value: lead.interest });
  if (/^\d{4}-\d{2}-\d{2}$/.test(lead.lastContact)) custom.push({ id: f("lastContact"), field_value: lead.lastContact });
  if (/^\d{4}-\d{2}-\d{2}$/.test(lead.nextFollowup)) { custom.push({ id: f("nextFollowup"), field_value: lead.nextFollowup }); custom.push({ id: f("nextFollowupTime"), field_value: lead.nextFollowupTime || "" }); }
  if (lead.quotedMonthly && Number.isFinite(Number(lead.quotedMonthly))) custom.push({ id: f("quotedMonthly"), field_value: Number(lead.quotedMonthly) });
  if (lead.interestedIn) custom.push({ id: f("interestedIn"), field_value: lead.interestedIn });
  if (mondayNotes) custom.push({ id: f("salesNotes"), field_value: mondayNotes });
  if (lead.auditScore && Number.isFinite(Number(lead.auditScore)) && !fieldText(existing || { id: "" }, fields.auditScore?.id)) custom.push({ id: f("auditScore"), field_value: Number(lead.auditScore) });
  if (lead.auditReport && !fieldText(existing || { id: "" }, fields.auditReport?.id)) custom.push({ id: f("auditReport"), field_value: lead.auditReport });
  if (!existing || !fieldText(existing, fields.leadSource?.id)) custom.push({ id: f("leadSource"), field_value: LEAD_SOURCE.giveaway });
  const patch: GhlContactPatch & { tags?: string[] } = { customFields: custom };
  const ownerName = REP_NAMES.find((n) => (lead.ownerIds || []).includes(MONDAY_IDS[n]));
  if (ownerName) patch.assignedTo = ghlRepIds()[ownerName];
  const { firstName, lastName } = splitName(lead.contact);
  if (!existing?.firstName && firstName) { patch.firstName = firstName; if (lastName) patch.lastName = lastName; }
  if (!existing?.companyName && lead.name) patch.companyName = lead.name.slice(0, 200);
  if (!existing?.email && lead.email) patch.email = lead.email.toLowerCase();
  if (!existing?.phone && lead.phone) patch.phone = normalizePhone(lead.phone);
  if (!existing?.website && lead.website) patch.website = lead.website;
  if (!existing?.city && lead.city) patch.city = lead.city.split(",")[0].trim();
  // Every imported Monday lead gets `sales-lead`: the curated board stays one tag in GHL (and LEADS_GHL_TAGS can narrow the desk to it).
  patch.tags = outreach === "Won" ? ["sales-lead", WON_TAG] : ["sales-lead"];
  return patch;
}

/** Monday Giveaway Leads → GHL. Idempotent: a contact already carrying this Monday id is skipped unless `force`. */
export async function migrateFromMonday(opts: { dryRun: boolean; offset?: number; limit?: number; force?: boolean; onlyIds?: string[] }): Promise<MigrateReport> {
  const fields = await salesFields(true);
  for (const key of ["leadSource", "outreach", "interest", "lastContact", "nextFollowup", "nextFollowupTime", "quotedMonthly", "interestedIn", "salesNotes", "mondayLeadId"] as SalesFieldKey[]) requireField(fields, key);
  const all = (await readGiveawayBoard()).filter((i) => !opts.onlyIds?.length || opts.onlyIds.includes(i.id));
  const offset = Math.max(0, opts.offset || 0); const limit = Math.min(Math.max(opts.limit || 25, 1), 100);
  const slice = all.slice(offset, offset + limit);
  const report: MigrateReport = { dryRun: opts.dryRun, total: all.length, offset, processed: slice.length, nextOffset: offset + limit < all.length ? offset + limit : null, counts: { imported: 0, "ghl-link": 0, email: 0, phone: 0, create: 0, unmatched: 0, written: 0, failed: 0 }, rows: [], ghlContacts: 0 };
  const mondayLeadId = requireField(fields, "mondayLeadId");
  const ix = indexContacts(await readAllContacts(), mondayLeadId.id);
  report.ghlContacts = ix.total;
  for (const item of slice) {
    const lead = mapMondayLead(item);
    const ownerName = REP_NAMES.find((n) => (lead.ownerIds || []).includes(MONDAY_IDS[n])) || "";
    const row: MigrateRow = { mondayId: item.id, name: item.name, match: "unmatched", ghlId: "", owner: ownerName, outreach: lead.group.toLowerCase() === "won" ? "Won" : lead.outreach, notes: (item.updates || []).filter((u) => (u.text_body || "").trim()).length };
    try {
      const found = matchLead(item, lead, ix);
      const existing = found.contact;
      row.match = found.match; row.ghlId = existing?.id || "";
      report.counts[row.match]++;
      if (row.match === "unmatched") { row.detail = "no email or phone on the Monday item — nothing to match or create"; report.rows.push(row); continue; }
      if (row.match === "imported" && !opts.force) { report.rows.push(row); continue; }
      if (opts.dryRun) { report.rows.push(row); continue; }
      const patch = migrationPatch(lead, lead.notes, existing, fields);
      const { tags, ...contactPatch } = patch;
      let contactId = existing?.id || "";
      if (existing) await updateContact(existing.id, contactPatch);
      else {
        const { contact } = await upsertContact({ locationId: process.env.GHL_LOCATION_ID!, ...contactPatch, source: "Big Giveaway (Monday import)", tags: ["monday-import", ...(tags || [])] });
        contactId = contact.id; row.ghlId = contactId;
        ix.byId.set(contact.id, contact); ix.byMondayId.set(item.id, contact);
        if (contactPatch.email) ix.byEmail.set(contactPatch.email, contact);
        if (contactPatch.phone) ix.byPhone.set(contactPatch.phone, contact);
      }
      if (tags?.length) await addTags(contactId, tags).catch((e) => console.error(`migrate ${item.id}: tag failed: ${e instanceof Error ? e.message : e}`));
      // Call history: every Monday update becomes a GHL note once (marker = the Monday update id).
      const have = await listNotes(contactId);
      let copied = 0;
      for (const u of [...(item.updates || [])].reverse()) {
        const text = (u.text_body || "").trim();
        if (!text || have.some((n) => (n.body || "").includes(importMarker(u.id)))) continue;
        await addNote(contactId, `From Monday (${u.creator?.name || "Team"}, ${u.created_at.slice(0, 10)}):\n${text}\n\n${importMarker(u.id)}`);
        copied++; await pause(120);
      }
      row.detail = `wrote ${patch.customFields?.length || 0} fields${patch.assignedTo ? ", owner" : ""}, ${copied} notes copied`; row.done = true;
      report.counts.written++;
      await pause(150);
    } catch (e) { row.error = e instanceof Error ? e.message : String(e); report.counts.failed++; }
    report.rows.push(row);
  }
  return report;
}

export const repTable = () => REP_NAMES.map((n: RepName) => ({ name: n, monday: MONDAY_IDS[n], ghl: ghlRepIds()[n] }));
