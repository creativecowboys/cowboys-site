import type { CallOutcome } from "@/lib/calls/outcomes";
import type { LeadTold } from "@/lib/calls/told";
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
  /** GHL tags that take a lead off the call list (`do-not-contact`, `fake-lead` — see src/lib/calls/roster.ts). Computed server-side; absent on Monday leads. */
  noCallTags?: string[];
  /** What the person told us on the form that brought them in (ebook, Big Giveaway, website form), read from GoHighLevel. Display only.
   *  Built server-side by src/lib/calls/told.ts on every GHL lead (roster, detail and the lead a change returns); absent on Monday leads. */
  told?: LeadTold;
  updatedAt: string; recordUrl: string; // link to the record in whichever system holds it
  /** @deprecated alias of recordUrl on Monday leads, for desk tabs still running the pre-GHL build across the deploy. Remove after cutover. */
  mondayUrl?: string;
};
/** Who the team session belongs to: the desk name ("Dave") and the sign-in address. Shown beside Sign out in the desk's top bar. */
export type SignedIn = { name: string; email: string };
/**
 * How the shell and the Sales desk agree on leaving (signing out). The desk fills in `unsaved`: "saving" while a save or
 * an assignment is in flight, "notes" while a call draft is not saved, "" when nothing would be lost. The shell sets
 * `leaving` once the person has said yes to leaving unsaved notes, so the browser's own "leave site?" prompt stays quiet.
 */
export type DeskLeave = { unsaved: () => "" | "notes" | "saving"; leaving: boolean };
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
  /** GHL only: false when the roster search came back with no contact tags at all, i.e. the desk cannot see `do-not-contact` / `fake-lead` and says so. Absent on Monday. */
  noCallTagsRead?: boolean;
  /** Who is signed in. Added by the route to every roster answer (not by either lead system); null when the session carries no address. */
  me?: SignedIn | null;
};
export type SaveCallResult = { saved: true; updateId: string; recordUrl: string; warning?: string; /** @deprecated see CallLead.mondayUrl */ mondayUrl?: string };
