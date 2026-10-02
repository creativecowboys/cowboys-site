import type { ClientGroupId } from "./config";
import type { GbpCard, GbpLocationSummary } from "@/lib/gbp/types";

export type ClientFlag = "payment" | "gbp" | "gbp-recheck" | "report" | "term" | "no-stripe";
export type ClientRow = {
  id: string; name: string; url: string; updatedAt: string;
  group: ClientGroupId | "unknown"; groupTitle: string; health: string;
  packages: string; mrr: string; customMonthly: string;
  accountManager: string; accountManagerIds: string[];
  contact: string; email: string; phone: string; website: string; gbpUrl: string; ghlContact: string; driveFolder: string; notes: string;
  payStatus: string; payMethod: string; billingDay: string; nextBill: string; lastPayment: string; clientSince: string; termEnds: string; lastReport: string;
  gbpAccess: string; gbpChecked: string; stripeCustomer: string; onboardingItem: string; teamDesk: boolean;
  searchAtlasListing: string; // Search Atlas GBP location id (numeric text) or ""
  gbpLive: GbpCard | null; // live Search Atlas read when linked (list: from the account listing; detail: full read)
  /** GoHighLevel desk only (Oct 2 2026): a long-standing client that was never onboarded through the desk and is billed outside
   *  GoHighLevel ("Desk Legacy Client" = Yes). Shown with a Legacy badge and only flagged for what its record actually tracks. */
  legacy?: boolean;
  flags: ClientFlag[];
};
export type ClientsListData = { rows: ClientRow[]; cursor: string | null; boardName: string; stripeConnected: boolean; canSeeMoney: boolean; searchAtlasConnected: boolean; system?: "monday" | "ghl"; systemName?: string };
export type StripeSnapshot = {
  customerId: string; email: string; name: string;
  subscription: { id: string; status: string; currentPeriodEnd: string; cancelAt: string; amount: number; interval: string } | null;
  latestInvoice: { id: string; status: string; amountDue: number; paidAt: string; dueDate: string; attempted: boolean; hostedUrl: string } | null;
  fetchedAt: string;
};
export type ClientFile = { key: string; name: string; size: number; category: string; uploadedAt: string };
export type ClientDetail = { fileScope: string; files: ClientFile[]; row: ClientRow; history: { id: string; text: string; createdAt: string; author: string; source?: string }[]; stripe: StripeSnapshot | null; stripeConnected: boolean; owners: { id: string; name: string }[]; canSeeMoney: boolean; gbpLocations: GbpLocationSummary[]; searchAtlasConnected: boolean; system?: "monday" | "ghl" };
