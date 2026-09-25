import { CallDeskError } from "@/lib/calls/validation";
import { createPipelineItem, ensureChecklist, findByHandoffId, findByLeadId, findHandoffUpdate, formatHandoffSummary, markSourceLead, postUpdate, readLeadVersion } from "./pipeline";
import { readHandoff, readIntake, writeHandoff, writeIntake } from "./store";
import type { HandoffForm, HandoffRecord, IntakeRecord, StartResult, StepName } from "./types";

// Start onboarding = one Monday record + four follow-up steps, each recorded durably so a retry
// only redoes what is missing. Duplicate protection, in order: process-local lock, the stored
// handoff record, then a Monday-side search for the lead id. Monday has no atomic create-if-absent,
// so two people clicking on two warm instances within the same second can still race; the second
// arrival adopts the first record on its next retry instead of creating a third.
const inflight = new Set<string>();
const now = () => new Date().toISOString();
const STEP_ORDER: StepName[] = ["item", "summary", "checklist", "sourceLead", "intake"];
/** Storage key for a handoff record: the lead id, or manual-<handoffId> for clients added by hand. */
export const recordKey = (form: { leadId: string; handoffId: string }) => form.leadId || `manual-${form.handoffId}`;

function freshRecord(form: HandoffForm): HandoffRecord {
  const t = now();
  const pending = () => ({ state: "pending" as const });
  // A manual client has no giveaway lead to mark, so that step is done from the start.
  return { version: 1, leadId: form.leadId, handoffId: form.handoffId, itemId: null, itemUrl: null, createdAt: t, updatedAt: t, steps: { item: pending(), summary: pending(), checklist: pending(), sourceLead: form.manual ? { state: "done", at: t } : pending(), intake: pending() }, handoff: form };
}

export function emptyIntake(itemId: string, leadId: string, form: HandoffForm): IntakeRecord {
  const t = now();
  return {
    version: 1, itemId, leadId, business: form.business, tokenHash: null, tokenIssuedAt: null, tokenExpiresAt: null, revokedAt: null,
    form: { business: form.business, contact: form.contact, email: form.email, phone: form.phone, address: "", serviceAreas: form.city, services: "", goals: form.goals, brandColors: "", fonts: "", website: form.website, references: "", competitors: "", social: "", hours: "", gbpUrl: "", gbpInviteSent: false, gbpNoProfile: false, notes: "" },
    lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [], createdAt: t, updatedAt: t,
  };
}

async function runSteps(record: HandoffRecord): Promise<HandoffRecord> {
  const itemId = record.itemId!;
  const run = async (name: StepName, fn: () => Promise<void>) => {
    if (record.steps[name].state === "done") return;
    try { await fn(); record.steps[name] = { state: "done", at: now() }; }
    catch (e) { record.steps[name] = { state: "failed", at: now(), error: e instanceof Error ? e.message : "failed" }; }
    record.updatedAt = now();
    await writeHandoff(record);
  };
  await run("summary", async () => { if (!(await findHandoffUpdate(itemId, record.handoffId))) await postUpdate(itemId, formatHandoffSummary(record.handoff)); });
  await run("checklist", async () => { await ensureChecklist(itemId, record.handoff.packages); });
  await run("sourceLead", async () => { if (record.leadId) await markSourceLead(record.leadId, record.itemUrl!, record.handoffId); });
  await run("intake", async () => { if (!(await readIntake(itemId))) await writeIntake(emptyIntake(itemId, record.leadId, record.handoff)); });
  return record;
}

export const pendingSteps = (record: HandoffRecord): StepName[] => STEP_ORDER.filter((s) => record.steps[s].state !== "done");

export async function startOnboarding(form: HandoffForm): Promise<StartResult> {
  const key = recordKey(form);
  if (inflight.has(key)) throw new CallDeskError("This client is already being handed off. Wait a moment, then reload to see the record.", 409);
  inflight.add(key);
  try {
    let record = await readHandoff(key);
    let adopted = false;
    if (record?.itemId) {
      adopted = record.handoffId !== form.handoffId;
    } else {
      // Nothing durable yet (or a crash before the item id was stored): look on the board itself.
      const existing = form.manual ? await findByHandoffId(form.handoffId) : await findByLeadId(form.leadId);
      if (existing.length) {
        const row = existing[0];
        record = record ?? freshRecord(form);
        record.itemId = row.id; record.itemUrl = row.url; record.steps.item = { state: "done", at: now() };
        record.updatedAt = now(); await writeHandoff(record); adopted = true;
      } else {
        if (!form.manual) {
          const lead = await readLeadVersion(form.leadId);
          if (lead.updatedAt !== form.expectedUpdatedAt) throw new CallDeskError("Someone changed this lead since you opened it. Your handoff draft is safe. Reload the lead and review before handing it off.", 409);
        }
        record = freshRecord(form);
        await writeHandoff(record); // durable "in progress" marker before the Monday write
        const created = await createPipelineItem(form);
        record.itemId = created.id; record.itemUrl = created.url; record.steps.item = { state: "done", at: now() }; record.updatedAt = now();
        await writeHandoff(record);
      }
    }
    record = await runSteps(record);
    return { itemId: record.itemId!, itemUrl: record.itemUrl!, pending: pendingSteps(record), adopted };
  } finally { inflight.delete(key); }
}

export async function retryOnboarding(key: string): Promise<StartResult> {
  if (inflight.has(key)) throw new CallDeskError("A retry is already running for this client.", 409);
  inflight.add(key);
  try {
    const record = await readHandoff(key);
    if (!record) throw new CallDeskError("No handoff record exists for this client.", 404);
    if (!record.itemId) {
      const existing = record.leadId ? await findByLeadId(record.leadId) : await findByHandoffId(record.handoffId);
      if (!existing.length) throw new CallDeskError("The onboarding record was never created. Start the handoff again from the Sales tab.", 409);
      record.itemId = existing[0].id; record.itemUrl = existing[0].url; record.steps.item = { state: "done", at: now() }; await writeHandoff(record);
    }
    const done = await runSteps(record);
    return { itemId: done.itemId!, itemUrl: done.itemUrl!, pending: pendingSteps(done), adopted: false };
  } finally { inflight.delete(key); }
}
