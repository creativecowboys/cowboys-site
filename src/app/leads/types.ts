import type { CallOutcome } from "@/lib/calls/outcomes";
import type { RepName } from "@/lib/ghl/reps";

export type LeadsBackend = "monday" | "ghl";

export type CallLead = {
  id: string; name: string; contact: string; email: string; phone: string;
  website: string; city: string; owner: string; ownerId: string; ownerIds?: string[];
  ownerName: RepName | ""; // Dave / Josh / Keaton when the owner is a desk rep, else "" (computed server-side, never from ids in the browser)
  outreach: string; interest: string;
  notes: string; lastContact: string; nextFollowup: string; nextFollowupTime: string; quotedMonthly: string;
  interestedIn: string; auditScore: string; auditReport: string; group: string;
  leadSource: string; // GHL "Lead Source" dropdown ("" on the Monday backend)
  updatedAt: string; recordUrl: string; // link to the record in whichever system holds it
};
export type CallHistory = { id: string; text: string; createdAt: string; author: string; isCallNote?: boolean };
export type CallDraft = {
  callId: string; leadId: string; expectedUpdatedAt: string;
  rep: RepName;
  goal: string; currentMarketing: string; challenge: string; budget: string;
  timing: string; recommendation: string; notes: string; nextStep: string;
  outcome: CallOutcome | "";
  interest: "" | "Cold" | "Warm" | "Hot";
  followupDate: string; followupTime: string; quotedMonthly: string;
};
export type CallsPageData = {
  leads: CallLead[]; cursor: string | null; boardName: string;
  system: LeadsBackend; systemName: string; // "Monday" | "GoHighLevel" — for UI copy
  owners: { id: string; name: RepName }[]; // the three reps with their ids in this backend
  leadSources: string[]; // Lead Source options read from GHL ([] on Monday)
};
export type SaveCallResult = { saved: true; updateId: string; recordUrl: string; warning?: string };
