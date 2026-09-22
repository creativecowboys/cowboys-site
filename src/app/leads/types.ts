import type { CallOutcome } from "@/lib/calls/outcomes";

export type CallLead = {
  id: string; name: string; contact: string; email: string; phone: string;
  website: string; city: string; owner: string; ownerId: string; outreach: string; interest: string;
  notes: string; lastContact: string; nextFollowup: string; quotedMonthly: string;
  interestedIn: string; auditScore: string; auditReport: string; group: string;
  updatedAt: string; mondayUrl: string;
};
export type CallHistory = { id: string; text: string; createdAt: string; author: string };
export type CallDraft = {
  callId: string; leadId: string; expectedUpdatedAt: string;
  rep: "Dave" | "Josh" | "Keaton";
  goal: string; currentMarketing: string; challenge: string; budget: string;
  timing: string; recommendation: string; notes: string; nextStep: string;
  outcome: CallOutcome | "";
  interest: "" | "Cold" | "Warm" | "Hot";
  followupDate: string; quotedMonthly: string;
};
export type CallsPageData = { leads: CallLead[]; cursor: string | null; boardName: string };
export type SaveCallResult = { saved: true; updateId: string; mondayUrl: string; warning?: string };
