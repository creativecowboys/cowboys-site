import type { FileCategory, PackageLabel, StageId } from "./config";

export type HandoffForm = {
  handoffId: string; // uuid v4, minted by the desk when the panel opens; idempotency key
  leadId: string; // "" for a client added by hand (manual: true)
  manual?: boolean;
  expectedUpdatedAt: string; // Giveaway lead version at the time of handoff
  business: string; contact: string; email: string; phone: string; website: string; city: string;
  businessType: string; // one of BUSINESS_TYPES or ""
  salesOwner: "Dave" | "Josh" | "Keaton";
  packages: PackageLabel[];
  monthlyAgreed: string; // "" or number string — the amount actually agreed, never inferred
  setupAgreed: string;
  scope: string; exclusions: string; goals: string; context: string;
  startDate: string; // YYYY-MM-DD or ""
  agreement: "Unknown" | "Pending" | "Signed" | "Not required";
  payment: "Unknown" | "Pending" | "Deposit paid" | "Paid";
  nextAction: string; nextOwner: "Dave" | "Josh" | "Keaton" | "Madison" | ""; nextDue: string;
};

export type StepName = "item" | "summary" | "checklist" | "sourceLead" | "intake";
export type StepState = { state: "done" | "pending" | "failed"; at?: string; error?: string };
export type HandoffRecord = {
  version: 1;
  leadId: string; handoffId: string;
  itemId: string | null; itemUrl: string | null;
  createdAt: string; updatedAt: string;
  steps: Record<StepName, StepState>;
  handoff: HandoffForm;
};

export type IntakeFile = { key: string; name: string; size: number; type: string; category: FileCategory; uploadedAt: string };
export type IntakeForm = {
  business: string; contact: string; email: string; phone: string; address: string; serviceAreas: string;
  services: string; goals: string; brandColors: string; fonts: string; website: string; references: string; competitors: string;
  social: string; hours: string; gbpUrl: string; gbpInviteSent: boolean; gbpNoProfile: boolean; notes: string;
};
export type IntakeRecord = {
  version: 1;
  itemId: string; leadId: string; business: string;
  tokenHash: string | null; tokenIssuedAt: string | null; tokenExpiresAt: string | null; revokedAt: string | null;
  form: IntakeForm; lastSavedAt: string | null; submittedAt: string | null; reviewedAt: string | null;
  files: IntakeFile[];
  createdAt: string; updatedAt: string;
};

export type ChecklistItem = { id: string; name: string; status: string; owner: string; due: string; phase: string; required: boolean };
export type OnboardingRow = {
  id: string; name: string; url: string; updatedAt: string;
  stage: StageId | "unknown"; group: string; health: string;
  onboardingOwner: string; onboardingOwnerIds: string[]; salesOwner: string; salesOwnerIds: string[]; buildOwner: string;
  contact: string; email: string; phone: string; city: string; businessType: string;
  packages: string; monthly: string; setup: string; customMonthly: string;
  signed: string; targetLaunch: string; nextAction: string; lastTouch: string;
  gbpAccess: string; dnsPath: string; agreement: string; payment: string; intake: string;
  leadId: string; handoffId: string; siteUrl: string; gbpUrl: string; onboardingLink: string; driveFolder: string; notes: string;
  profileComplete: boolean; baseline: boolean;
  checklist: ChecklistItem[];
  missing: string[]; // required onboarding items still open (computed)
  overdue: boolean; // next action due date passed (from checklist due or nextDue in notes)
};
export type OnboardingListData = { rows: OnboardingRow[]; cursor: string | null; boardName: string };
export type OnboardingDetail = {
  row: OnboardingRow;
  history: { id: string; text: string; createdAt: string; author: string }[];
  record: HandoffRecord | null;
  intake: (Omit<IntakeRecord, "tokenHash"> & { linkActive: boolean }) | null;
  owners: { id: string; name: string }[];
};
export type StartResult = { itemId: string; itemUrl: string; pending: StepName[]; adopted: boolean };
