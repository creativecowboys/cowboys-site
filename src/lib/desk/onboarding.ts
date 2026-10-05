import { CallDeskError, MONDAY_ID } from "@/lib/calls/validation";
import { markSourceLead as markGhlLeadWon } from "@/lib/calls/ghl";
import { handoffMarker } from "@/lib/calls/markers";
import { addNote, contactUrl, createContact, fieldText, GhlError, ghlLocationId, listContacts, listNotes, normalizePhone, type GhlContact } from "@/lib/ghl/client";
import { salesFields } from "@/lib/ghl/fields";
import { todayEastern } from "@/lib/onboarding/api";
import { readinessProblems } from "@/lib/onboarding/checklist";
import { PAYMENT_NO_CHARGE, isGiveawayWinner } from "@/lib/onboarding/config";
import { emptyIntake, pendingSteps, recordKey } from "@/lib/onboarding/handoff";
import { readHandoff, readIntake, writeHandoff, writeIntake } from "@/lib/onboarding/store";
import type { HandoffForm, HandoffRecord, IntakeRecord, OnboardingDetail, OnboardingListData, OnboardingRow, StartResult, StepName } from "@/lib/onboarding/types";
import { accessFromCard, parseListingId } from "@/lib/gbp/state";
import { gbpCard, listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import type { GbpCard } from "@/lib/gbp/types";
import { mergeTemplates, parseChecklist, serializeChecklist, setItemStatus, type StoredItem } from "./checklist-text";
import { assertOption, DESK_TAGS, deskList, deskText, type DeskFields } from "./fields";
import { addDeskNote, deleteDeskNote, editDeskNote, toTimeline } from "./notes";
import { tasksFor } from "./tasks";
import { allDeskFields, businessName, fileScopeFor, groupLabel, handoffNative, handoffSummary, handoffValues, hasTag, isClientRecord, isOnboardingRecord, listRecords, mapOnboarding, nextDueOf, readContact, resolveRecordId, stageIdForLabel, stageLabel, ensureTag, version, writeRecord, type DeskValues } from "./record";
import { isGhlRecordId } from "./switch";
import { isTeamName, memberByName, teamOwners, type Actor } from "./team";
import type { DeskOnboardingPatch } from "./validation";
import { deskUrl } from "@/lib/desk-path";

// The Onboarding tab on GoHighLevel (Phase 2). Same behaviour as src/lib/onboarding/pipeline.ts +
// handoff.ts, against a contact instead of a Monday item. Nothing in this file talks to Monday.
const STALE = "Someone changed this client since you loaded it. Reload to see the latest before changing it.";
const now = () => new Date().toISOString();

export async function listOnboardingGhl(): Promise<OnboardingListData> {
  const f = await allDeskFields();
  const today = todayEastern();
  return { rows: (await listRecords("onboarding", f)).map((c) => mapOnboarding(c, f, today)), cursor: null, boardName: "GoHighLevel", system: "ghl", systemName: "GoHighLevel" };
}

async function onboardingContact(rawId: string, f: DeskFields): Promise<GhlContact> {
  const contact = await readContact(await resolveRecordId(rawId, "onboarding", f));
  if (!isOnboardingRecord(contact, f)) throw new CallDeskError("This contact has no onboarding record. Start one from the Sales tab, or with Add client.", 404);
  return contact;
}

/**
 * The stored handoff for this contact, wherever its key came from: the contact id (handed off on GoHighLevel),
 * the Monday lead id it was imported from (handed off in the Monday era), or manual-<handoff id> (Add client).
 */
export async function findHandoffRecord(c: GhlContact, f: DeskFields): Promise<HandoffRecord | null> {
  const legacyLead = fieldText(c, (await salesFields()).mondayLeadId?.id).trim();
  const handoffId = deskText(c, f, "handoffId").trim();
  const mondayItem = deskText(c, f, "mondayOnboardingId").trim();
  const keys = [c.id, ...(MONDAY_ID.test(legacyLead) ? [legacyLead] : []), ...(handoffId ? [`manual-${handoffId}`] : [])];
  for (const key of keys) {
    const record = await readHandoff(key).catch(() => null);
    if (record && (!record.itemId || record.itemId === c.id || (!!mondayItem && record.itemId === mondayItem))) return record;
  }
  return null;
}

/**
 * Save the checklist and prove GoHighLevel kept all of it. The whole list is one large-text field; if a length limit
 * ever cut it short, rows would vanish quietly — so the contact is read back and a short read is an error, not a save.
 */
async function writeChecklist(id: string, f: DeskFields, items: StoredItem[], previous: string, extra: DeskValues = {}): Promise<GhlContact> {
  await writeRecord(id, f, { ...extra, checklist: serializeChecklist(items) });
  const saved = await readContact(id);
  const back = parseChecklist(deskText(saved, f, "checklist"));
  const kept = back.length;
  // The same rows, whole: a cut inside the last row keeps the count and loses its owner or due date.
  if (serializeChecklist(back) !== serializeChecklist(items)) {
    // Put back what was there (it fit before), then say so.
    await writeRecord(id, f, { checklist: previous }).catch((e) => console.error(`desk checklist: could not restore ${id}: ${e instanceof Error ? e.message : e}`));
    throw new CallDeskError(`GoHighLevel kept ${kept} of ${items.length} checklist rows (the "Desk Checklist" field may be too small for this list). The checklist was put back as it was — tell an owner before changing it again.`, 502);
  }
  return saved;
}

/** Only a connected + verified listing changes the record on its own (→ Verified); anything else leaves the staff value alone. */
async function promoteFromLive(id: string, f: DeskFields, manual: string, card: GbpCard): Promise<boolean> {
  const live = accessFromCard(card, manual);
  if (!live.live || live.value !== "Verified" || !live.changed) return false;
  await writeRecord(id, f, { gbpAccess: "Verified", lastTouch: todayEastern() });
  return true;
}
async function liveGbp(row: OnboardingRow, f: DeskFields, opts: { fresh?: boolean; mayWrite?: boolean } = {}): Promise<{ card: GbpCard | null; row: OnboardingRow }> {
  const listing = parseListingId(row.searchAtlasListing);
  if (!listing) return { card: null, row };
  const card = await gbpCard(listing, { detail: true, fresh: !!opts.fresh });
  if (opts.mayWrite === false) return { card, row }; // a look at the preview by someone who may not change it: show the live card, write nothing
  let promoted = false;
  try { promoted = await promoteFromLive(row.id, f, row.gbpAccess, card); }
  catch (error) { console.error(`[gbp] could not write Verified to onboarding contact ${row.id}: ${error instanceof Error ? error.message : error}`); }
  return { card, row: promoted ? mapOnboarding(await readContact(row.id), f) : row };
}

function stripToken(record: IntakeRecord): Omit<IntakeRecord, "tokenHash"> { const copy = { ...record } as Partial<IntakeRecord>; delete copy.tokenHash; return copy as Omit<IntakeRecord, "tokenHash">; }
const linkActive = (r: IntakeRecord) => !!r.tokenHash && !r.revokedAt && !!r.tokenExpiresAt && Date.parse(r.tokenExpiresAt) > Date.now();

/** `mayWrite: false` (a non-owner looking at the preview before the flip) reads only: no auto-promotion, no status repair. */
export async function onboardingDetailGhl(rawId: string, opts: { mayWrite?: boolean } = {}): Promise<OnboardingDetail> {
  const mayWrite = opts.mayWrite !== false;
  const f = await allDeskFields();
  const contact = await onboardingContact(rawId, f);
  const scope = fileScopeFor(contact, f);
  const stored = mapOnboarding(contact, f);
  const [notes, record, intake, live, gbpLocations, tasks] = await Promise.all([
    listNotes(contact.id), findHandoffRecord(contact, f).catch(() => null), readIntake(scope).catch(() => null),
    liveGbp(stored, f, { mayWrite }), // Search Atlas read + auto-promotion to Verified; never throws for a Search Atlas failure
    searchAtlasConnected() ? listLocations().catch(() => []) : Promise.resolve([]),
    tasksFor(contact.id), // the running task list (GoHighLevel tasks on the contact); never throws
  ]);
  // The client's Submit is saved in storage first and the status on the contact second. If that second write was missed
  // (a GoHighLevel hiccup at that moment, or a submit that landed on the old board between the import and the switch),
  // storage is the truth: show it and put it on the contact.
  let row = live.row;
  if (intake?.submittedAt && ["", "Not sent", "Link issued"].includes(row.intake)) {
    if (!mayWrite) row = { ...row, intake: "Client submitted" };
    else {
      try { await writeRecord(contact.id, f, { intake: "Client submitted" }); row = mapOnboarding(await readContact(contact.id), f); }
      catch (e) { console.error(`desk intake: could not mark ${contact.id} Client submitted: ${e instanceof Error ? e.message : e}`); row = { ...row, intake: "Client submitted" }; }
    }
  }
  return {
    row, history: toTimeline(notes), record,
    intake: intake ? { ...stripToken(intake), linkActive: linkActive(intake) } : null,
    owners: teamOwners(), gbp: live.card, gbpLocations, searchAtlasConnected: searchAtlasConnected(),
    fileScope: scope, nextDue: nextDueOf(contact, f), system: "ghl", tasks,
  };
}

/** One change at a time, guarded by the contact version the desk last saw (a note is append-only and needs none). */
export async function patchOnboardingGhl(rawId: string, patch: DeskOnboardingPatch, actor: Actor): Promise<OnboardingRow> {
  const f = await allDeskFields();
  const contact = await onboardingContact(rawId, f);
  const id = contact.id;
  if (!["note", "deleteNote", "editNote"].includes(patch.action) && version(contact) !== patch.expectedUpdatedAt) throw new CallDeskError(STALE, 409);
  const before = mapOnboarding(contact, f);
  const touch: DeskValues = { lastTouch: todayEastern() };
  switch (patch.action) {
    case "stage": {
      if (patch.stage === "ready") {
        const problems = readinessProblems(before);
        if (problems.length) throw new CallDeskError(`Not ready for production yet: ${problems.join("; ")}.`, 409);
        await writeRecord(id, f, { ...touch, obStage: stageLabel("ready"), profileComplete: "Yes" });
      } else await writeRecord(id, f, { ...touch, obStage: stageLabel(patch.stage) });
      break;
    }
    case "ready": {
      const problems = readinessProblems(before);
      if (problems.length) throw new CallDeskError(`Not ready for production yet: ${problems.join("; ")}.`, 409);
      await writeRecord(id, f, { ...touch, obStage: stageLabel("ready"), profileComplete: "Yes", obHealth: "On Track" });
      break;
    }
    case "health": assertOption(f, "obHealth", patch.value); await writeRecord(id, f, { ...touch, obHealth: patch.value }); break;
    case "owner": await writeRecord(id, f, { ...touch, obOwner: patch.ownerId }); break;
    case "checklist": {
      const current = deskText(contact, f, "checklist");
      const next = setItemStatus(parseChecklist(current), deskList(contact, f, "packages"), patch.subitemId, patch.status || "Working on it");
      if (!next) throw new CallDeskError("That checklist item does not belong to this client.", 400);
      return mapOnboarding(await writeChecklist(id, f, next, current, touch), f);
    }
    case "gbp": assertOption(f, "gbpAccess", patch.value); await writeRecord(id, f, { ...touch, gbpAccess: patch.value, ...(patch.gbpUrl ? { gbpUrl: patch.gbpUrl } : {}) }); break;
    case "searchAtlasListing": {
      // Link (or unlink) the Search Atlas listing, then let the live read set GBP access if Google says verified.
      await writeRecord(id, f, { ...touch, searchAtlasListing: patch.listingId });
      const listing = parseListingId(patch.listingId);
      if (listing) await promoteFromLive(id, f, before.gbpAccess, await gbpCard(listing, { detail: true, fresh: true }));
      break;
    }
    case "agreement": assertOption(f, "agreement", patch.value); await writeRecord(id, f, { ...touch, agreement: patch.value }); break;
    case "payment": {
      if (patch.value === PAYMENT_NO_CHARGE && !isGiveawayWinner(before.packages)) throw new CallDeskError("No charge is only for Giveaway Winner clients.", 400);
      assertOption(f, "obPayment", patch.value);
      await writeRecord(id, f, { ...touch, obPayment: patch.value });
      break;
    }
    case "dns": if (patch.value) assertOption(f, "dnsPath", patch.value); await writeRecord(id, f, { ...touch, dnsPath: patch.value }); break;
    case "next": await writeRecord(id, f, { ...touch, nextAction: patch.nextAction, nextDue: patch.due }); break;
    case "intakeReviewed": await writeRecord(id, f, { ...touch, intake: "Reviewed" }); break;
    case "deleteNote": await deleteDeskNote(id, patch.id); break; // changes no field: the record's own values are untouched
    case "editNote": await editDeskNote(id, patch.id, patch.text, actor); break;
    case "note": {
      await addDeskNote(id, { text: patch.text, noteId: patch.noteId || crypto.randomUUID(), source: "onboarding", actor });
      await writeRecord(id, f, touch).catch((e) => console.error(`desk note: last-touch stamp failed for ${id}: ${e instanceof Error ? e.message : e}`)); // the note is saved; the stamp is advisory
      break;
    }
  }
  return mapOnboarding(await readContact(id), f);
}

// ───────────────────────────── handoff ─────────────────────────────
// Start onboarding = the contact becomes an onboarding record, then four follow-up steps, each recorded
// durably (Blob) so a retry only redoes what is missing — the same contract as the Monday desk. Duplicate
// protection is stronger here: "does this lead already have an onboarding record?" is answered by reading
// the contact itself, fresh, not by a search that can lag or miss.
const inflight = new Set<string>();
const STEPS: StepName[] = ["item", "summary", "checklist", "sourceLead", "intake"];
export const summaryMarker = (handoffId: string) => `[CC-HANDOFF-SUMMARY:${handoffId}]`;

function freshRecord(form: HandoffForm): HandoffRecord {
  const t = now();
  const pending = () => ({ state: "pending" as const });
  // A client added by hand has no lead to mark Won, so that step is done from the start.
  return { version: 1, leadId: form.leadId, handoffId: form.handoffId, itemId: null, itemUrl: null, createdAt: t, updatedAt: t, steps: { item: pending(), summary: pending(), checklist: pending(), sourceLead: form.manual ? { state: "done", at: t } : pending(), intake: pending() }, handoff: form };
}

/** Add client (no lead): reuse the contact GoHighLevel already has for this email or phone, else create one. */
async function contactForManual(form: HandoffForm): Promise<GhlContact> {
  const email = form.email.trim().toLowerCase();
  const phone = form.phone ? normalizePhone(form.phone) : "";
  if (email) {
    const hit = (await listContacts(email, 10)).find((c) => (c.email || "").toLowerCase() === email);
    if (hit) return readContact(hit.id);
  }
  if (phone.replace(/\D/g, "").length >= 10) {
    const hit = (await listContacts(phone.replace(/\D/g, "").slice(-10), 10)).find((c) => c.phone && normalizePhone(c.phone) === phone);
    if (hit) return readContact(hit.id);
  }
  try {
    return await createContact({ locationId: ghlLocationId(), ...handoffNative(form, null), source: "Team desk (added by hand)" });
  } catch (e) {
    // GoHighLevel refuses a duplicate email/phone and names the contact it clashes with — that contact is the one we want.
    const dup = e instanceof GhlError ? /"contactId"\s*:\s*"([A-Za-z0-9]+)"/.exec(e.body)?.[1] : undefined;
    if (dup) return readContact(dup);
    throw e;
  }
}

/**
 * A contact that already carries desk data (it is a client, or was onboarded before) keeps it: packages are added to —
 * so a Giveaway Winner stays one and is never billed by accident — notes are appended, and GBP access and the intake
 * status are never stepped back. Everything else is the new handoff's.
 */
export function keepShared(values: DeskValues, contact: GhlContact, f: DeskFields): DeskValues {
  const merged: DeskValues = { ...values };
  const have = deskList(contact, f, "packages");
  if (have.length && Array.isArray(merged.packages)) merged.packages = [...new Set([...have, ...merged.packages])];
  const notes = deskText(contact, f, "notes");
  if (notes && typeof merged.notes === "string") merged.notes = notes.includes(merged.notes) ? notes : `${notes}\n\n${merged.notes}`;
  if (deskText(contact, f, "gbpAccess")) delete merged.gbpAccess;
  if (deskText(contact, f, "intake")) delete merged.intake;
  return merged;
}
/** A package GoHighLevel's "Desk Packages" list does not have would be dropped on save — refuse the handoff instead of losing it (a lost Giveaway Winner label would let a winner be billed). */
async function assertPackagesKnown(f: DeskFields, packages: readonly string[]): Promise<void> {
  const missing = (fields: DeskFields) => { const options = fields.packages?.options || []; return options.length ? packages.filter((p) => !options.includes(p)) : []; };
  // The definitions are cached for ten minutes. Before refusing, look again: someone may have just added the option in GoHighLevel.
  const unknown = missing(f).length ? missing(await allDeskFields(true)) : [];
  if (unknown.length) throw new CallDeskError(`${unknown.map((p) => `"${p}"`).join(", ")} ${unknown.length === 1 ? "is" : "are"} not on the "Desk Packages" list in GoHighLevel, so nothing was saved. Add ${unknown.length === 1 ? "it" : "them"} there (Settings → Custom Fields → Desk Packages) and try again.`, 409);
}
/** After the write: GoHighLevel must actually hold every package of this handoff. A dropped label — above all Giveaway Winner — is an error, not a detail. */
async function assertPackagesKept(contactId: string, f: DeskFields, packages: readonly string[]): Promise<void> {
  const kept = deskList(await readContact(contactId), f, "packages");
  const lost = packages.filter((p) => !kept.includes(p));
  if (lost.length) throw new CallDeskError(`GoHighLevel did not keep ${lost.map((p) => `"${p}"`).join(", ")} in "Desk Packages" on this contact (it has: ${kept.join(", ") || "nothing"}). Set the packages on the contact in GoHighLevel, then press the button again — the handoff is not finished until they are there.`, 502);
}
/** The stored record's contact, when it still exists. A contact deleted in GoHighLevel is "none", not an error; anything else (GoHighLevel down) is. */
async function contactIfThere(id: string): Promise<GhlContact | null> {
  try { return await readContact(id); }
  catch (e) { if (e instanceof CallDeskError && !(e instanceof GhlError) && e.status === 404) return null; throw e; }
}

async function runSteps(record: HandoffRecord, contactId: string, f: DeskFields, actor: Actor): Promise<HandoffRecord> {
  const form = record.handoff;
  const run = async (name: StepName, fn: () => Promise<void>) => {
    if (record.steps[name].state === "done") return;
    try { await fn(); record.steps[name] = { state: "done", at: now() }; }
    catch (e) { record.steps[name] = { state: "failed", at: now(), error: e instanceof Error ? e.message : "failed" }; }
    record.updatedAt = now();
    await writeHandoff(record);
  };
  await run("summary", async () => {
    // Two markers: the Sales tab's "mark the lead Won" step looks for the first and then skips its own short note
    // (same contact, one note is enough); this step looks for the second, so the full summary is never skipped
    // just because that short note got there first on a retry.
    const marker = summaryMarker(record.handoffId);
    if ((await listNotes(contactId)).some((n) => (n.body || "").includes(marker))) return;
    const owner = memberByName(form.salesOwner);
    await addNote(contactId, `${handoffSummary(form)}\n\n${handoffMarker(record.handoffId)} ${marker} [CC-SRC:sales] [CC-BY:${form.salesOwner || actor.name}]`, owner?.ghlUserId || actor.ghlUserId || undefined);
  });
  await run("checklist", async () => {
    const contact = await readContact(contactId);
    const current = deskText(contact, f, "checklist");
    const merged = mergeTemplates(parseChecklist(current), form.packages);
    if (merged.added) await writeChecklist(contactId, f, merged.items, current);
  });
  // The lead IS this contact (a lead imported from Monday was imported onto this same contact), so "mark the lead Won"
  // always lands in GoHighLevel — never on the Monday board, whatever kind of id the stored record carries.
  await run("sourceLead", async () => { if (record.leadId) await markGhlLeadWon(isGhlRecordId(record.leadId) ? record.leadId : contactId, contactUrl(contactId), record.handoffId); });
  await run("intake", async () => {
    const scope = fileScopeFor(await readContact(contactId), f);
    if (!(await readIntake(scope))) await writeIntake({ ...emptyIntake(scope, record.leadId, form), contactId });
  });
  return record;
}

export async function startOnboardingGhl(form: HandoffForm, ctx: { origin: string; actor: Actor }): Promise<StartResult> {
  if (!form.manual && !isGhlRecordId(form.leadId)) throw new CallDeskError("This lead is on the old Monday board, and onboarding now lives in GoHighLevel. Find the same business on the Sales tab's GoHighLevel roster (every Monday lead was brought over) and hand it off from there.", 409);
  const key = recordKey(form);
  if (inflight.has(key)) throw new CallDeskError("This client is already being handed off. Wait a moment, then reload to see the record.", 409);
  inflight.add(key);
  try {
    const f = await allDeskFields();
    let record = await readHandoff(key);
    let contact: GhlContact | null = null;
    if (!form.manual) contact = await readContact(form.leadId);
    else if (record?.itemId && isGhlRecordId(record.itemId)) contact = await contactIfThere(record.itemId); // an earlier attempt already has (or made) the contact
    else {
      // A crash after the contact was written but before the record was: the handoff id on the contact finds it again.
      const prior = (await listRecords("onboarding", f)).find((c) => deskText(c, f, "handoffId").trim() === form.handoffId);
      contact = prior ? await readContact(prior.id) : null;
    }
    let adopted = false;
    // The same handoff again (a second click, a reload, a retry), or a different one while this client's onboarding is still
    // open: adopt the record, never write the fields twice. A different handoff for a client whose onboarding is FINISHED
    // (Launched) is new work — an upsell — and starts a new round on the same contact (below), adding to what is there.
    const sameHandoff = !!contact && (deskText(contact, f, "handoffId").trim() === form.handoffId || record?.handoffId === form.handoffId);
    const finished = !!contact && stageIdForLabel(deskText(contact, f, "obStage")) === "launched";
    if (contact && isOnboardingRecord(contact, f) && (sameHandoff || !finished)) {
      adopted = !sameHandoff;
      // A record handed off in the Monday era is stored under its old key: use it, so its finished steps are not run again.
      if (!record) record = await findHandoffRecord(contact, f);
      // An earlier attempt can stop between the field write and the tag, or before the record was marked: finish that here.
      await ensureTag(contact, DESK_TAGS.onboarding);
      if (sameHandoff) await assertPackagesKept(contact.id, f, form.packages); // a retry never papers over a package GoHighLevel dropped
      // A different draft adopting a record that has no stored handoff of its own (brought over from the old board, made by hand):
      // nothing of this draft is applied — no summary note, no checklist rows, no Won mark. There is nothing to run.
      if (!record && !sameHandoff) return { itemId: contact.id, itemUrl: contactUrl(contact.id), pending: [], adopted: true, system: "ghl" };
      if (!record) record = freshRecord(form);
      if (record.steps.item.state !== "done" || !record.itemId) { record.itemId = record.itemId || contact.id; record.itemUrl = record.itemUrl || contactUrl(contact.id); record.steps.item = { state: "done", at: now() }; record.updatedAt = now(); await writeHandoff(record); }
    } else {
      if (!form.manual && version(contact!) !== form.expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your handoff draft is safe. Reload the lead and review before handing it off.", 409);
      await assertPackagesKnown(f, form.packages);
      record = freshRecord(form);
      if (contact) { record.itemId = contact.id; record.itemUrl = contactUrl(contact.id); }
      await writeHandoff(record); // durable "in progress" marker before anything is written to GoHighLevel
      if (!contact) {
        contact = await contactForManual(form);
        // Before anything else: a retry must find THIS contact (a client added by name alone has no email or phone to find it by).
        record.itemId = contact.id; record.itemUrl = contactUrl(contact.id); record.updatedAt = now();
        await writeHandoff(record);
      }
      if (isOnboardingRecord(contact, f) && stageIdForLabel(deskText(contact, f, "obStage")) !== "launched") {
        // The email or phone belongs to a client whose onboarding is still open: adopt that record. NOTHING of this draft is
        // applied to it — no second summary note, no extra checklist rows — so "already has an onboarding record" is the whole truth.
        adopted = true;
        await ensureTag(contact, DESK_TAGS.onboarding);
        const t = now(); const done = { state: "done" as const, at: t };
        const closed: HandoffRecord = { ...record, itemId: contact.id, itemUrl: contactUrl(contact.id), updatedAt: t, steps: { item: done, summary: done, checklist: done, sourceLead: done, intake: done } };
        await writeHandoff(closed); // this draft's own marker: closed, nothing left to run
        record = (await findHandoffRecord(contact, f)) || closed; // the record's own handoff, whose unfinished steps (if any) are its to finish
      } else {
        const owner = memberByName(form.salesOwner);
        await writeRecord(contact.id, f, keepShared(handoffValues(form, todayEastern(), deskUrl(ctx.origin, { tab: "onboarding", client: contact.id })), contact, f), {
          ...handoffNative(form, contact),
          ...(!contact.assignedTo && owner?.ghlUserId ? { assignedTo: owner.ghlUserId } : {}), // never take a contact away from whoever GoHighLevel says owns it
        });
        await ensureTag(contact, DESK_TAGS.onboarding);
        await assertPackagesKept(contact.id, f, form.packages);
        record.itemId = contact.id; record.itemUrl = contactUrl(contact.id); record.steps.item = { state: "done", at: now() }; record.updatedAt = now();
        await writeHandoff(record);
      }
    }
    record = await runSteps(record, contact!.id, f, ctx.actor);
    return { itemId: contact!.id, itemUrl: contactUrl(contact!.id), pending: pendingSteps(record), adopted, system: "ghl" };
  } finally { inflight.delete(key); }
}

/** Re-run only the handoff steps that did not complete (summary note, checklist, lead marked Won, intake record). */
export async function retryOnboardingGhl(rawId: string, actor: Actor): Promise<StartResult> {
  const f = await allDeskFields();
  const contact = await onboardingContact(rawId, f);
  const record = await findHandoffRecord(contact, f);
  if (!record) throw new CallDeskError("This client was added without a handoff, so there is nothing to retry.", 400);
  const key = recordKey(record);
  if (inflight.has(key)) throw new CallDeskError("A retry is already running for this client.", 409);
  inflight.add(key);
  try {
    await ensureTag(contact, DESK_TAGS.onboarding); // a first attempt can stop right after the fields were written
    if (record.steps.item.state !== "done") { record.steps.item = { state: "done", at: now() }; if (!record.itemId) { record.itemId = contact.id; record.itemUrl = contactUrl(contact.id); } await writeHandoff(record); }
    const done = await runSteps(record, contact.id, f, actor);
    return { itemId: contact.id, itemUrl: contactUrl(contact.id), pending: STEPS.filter((s) => done.steps[s].state !== "done"), adopted: false, system: "ghl" };
  } finally { inflight.delete(key); }
}

// ───────────────────────────── graduation ─────────────────────────────
/**
 * "Mark launched → Clients". On GoHighLevel the client is the SAME contact, so graduating means: stage Launched,
 * and whatever client fields are still blank get their starting values. Safe to press twice; a client that was
 * already on the Clients tab (brought over from the old board) keeps every value it has.
 */
export async function graduateGhl(rawId: string, input: { managerId: string; expectedUpdatedAt: string }, actor: Actor): Promise<{ id: string; url: string; created: boolean }> {
  const f = await allDeskFields();
  const contact = await onboardingContact(rawId, f);
  const id = contact.id;
  if (input.expectedUpdatedAt && input.expectedUpdatedAt !== version(contact)) throw new CallDeskError("Someone changed this client since you loaded it. Reload before graduating it.", 409);
  const row = mapOnboarding(contact, f);
  if (row.stage === "new" || row.stage === "collecting") throw new CallDeskError("Mark the client ready for production first; graduation is for clients that are built or launching.", 409);
  const wasClient = isClientRecord(contact, f);
  const launched = wasClient && row.stage === "launched" && !!deskText(contact, f, "clientStatus");
  if (launched && hasTag(contact, DESK_TAGS.client)) return { id, url: contactUrl(id), created: false }; // nothing left to do
  const today = todayEastern();
  const blank = (key: Parameters<typeof deskText>[2]) => !deskText(contact, f, key);
  const manager = isTeamName(input.managerId) ? input.managerId : row.onboardingOwner;
  const values: DeskValues = { obStage: stageLabel("launched"), lastTouch: today, nextAction: `Graduated to the Clients tab ${today}`, nextDue: "" };
  if (blank("clientStatus")) values.clientStatus = groupLabel("active");
  if (blank("clientHealth")) values.clientHealth = "Too New";
  if (blank("payStatus")) values.payStatus = "No Billing Set Up";
  // Giveaway winners keep the Giveaway Winner package (so nobody bills them) and get no payment method.
  if (blank("payMethod") && !isGiveawayWinner(row.packages)) values.payMethod = "Stripe via GHL";
  if (blank("clientSince")) values.clientSince = row.signed || today;
  if (!["Verified", "No GBP Exists", "Requested", "Lost / recheck"].includes(row.gbpAccess)) values.gbpAccess = "Not Requested";
  if (row.gbpAccess === "Verified" && blank("gbpChecked")) values.gbpChecked = today;
  if (blank("accountManager") && manager) values.accountManager = manager;
  // `launched` without the tag = an earlier press wrote the fields and stopped before the tag: finish it, change no field.
  if (!launched) await writeRecord(id, f, values);
  await ensureTag(contact, DESK_TAGS.client);
  await addDeskNote(id, { text: `Launched. ${businessName(contact)} is now on the Clients tab.`, noteId: `graduated-${id}-${today}`, source: "system", actor })
    .catch((e) => console.error(`desk graduate: note failed for ${id}: ${e instanceof Error ? e.message : e}`)); // the client fields are the durable part
  return { id, url: contactUrl(id), created: !wasClient };
}
