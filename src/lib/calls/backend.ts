import type { CallDraft, CallHistory, CallLead, CallsPageData, LeadsBackend, SaveCallResult } from "@/app/leads/types";
import { CallDeskError } from "./validation";
import * as monday from "./monday";
import * as ghl from "./ghl";
import { markSourceLead as markMondayLead, readLeadVersion as readMondayLeadVersion } from "@/lib/onboarding/pipeline";
import { backendForLeadId, defaultBackend } from "./switch";
import type { RepName } from "@/lib/ghl/reps";
export { backendForLeadId, defaultBackend, leadsBackend, repIdFor, systemName } from "./switch";

// Dispatch for the LEADS_BACKEND switch (Oct 1 2026) — see ./switch.ts for the rules. Routes and the
// onboarding handoff import from here, never from ./monday or ./ghl directly.
export const getCallsPage = (cursor: string | null, backend: LeadsBackend = defaultBackend()): Promise<CallsPageData> =>
  backend === "ghl" ? ghl.getCallsPage(cursor) : monday.getCallsPage(cursor);
export const getCallLead = (id: string): Promise<{ lead: CallLead; history: CallHistory[] }> =>
  backendForLeadId(id) === "ghl" ? ghl.getCallLead(id) : monday.getCallLead(id);
export const assignOwner = (id: string, owner: RepName | "", expectedUpdatedAt: string): Promise<CallLead> =>
  backendForLeadId(id) === "ghl" ? ghl.assignOwner(id, owner, expectedUpdatedAt) : monday.assignOwner(id, owner, expectedUpdatedAt);
export const saveCall = (draft: CallDraft): Promise<SaveCallResult> =>
  backendForLeadId(draft.leadId) === "ghl" ? ghl.saveCall(draft) : monday.saveCall(draft);
export async function setLeadSource(id: string, value: string, expectedUpdatedAt: string): Promise<CallLead> {
  if (backendForLeadId(id) !== "ghl") throw new CallDeskError("Lead Source lives in GoHighLevel; this lead is still on the Monday board.", 400);
  return ghl.setLeadSource(id, value, expectedUpdatedAt);
}
/** Handoff hooks (src/lib/onboarding/handoff.ts): the lead's own system gets the Won mark, whichever board the onboarding record lives on. */
export const readLeadVersion = (leadId: string): Promise<{ updatedAt: string; name: string }> =>
  backendForLeadId(leadId) === "ghl" ? ghl.readLeadVersion(leadId) : readMondayLeadVersion(leadId);
export const markSourceLead = (leadId: string, itemUrl: string, handoffId: string): Promise<void> =>
  backendForLeadId(leadId) === "ghl" ? ghl.markSourceLead(leadId, itemUrl, handoffId) : markMondayLead(leadId, itemUrl, handoffId);
