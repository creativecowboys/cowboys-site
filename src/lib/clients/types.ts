import type { ClientGroupId } from "./config";

export type ClientFlag = "payment" | "gbp" | "gbp-recheck" | "report" | "term" | "no-stripe";
export type ClientRow = {
  id: string; name: string; url: string; updatedAt: string;
  group: ClientGroupId | "unknown"; groupTitle: string; health: string;
  packages: string; mrr: string; customMonthly: string;
  accountManager: string; accountManagerIds: string[];
  contact: string; email: string; phone: string; website: string; gbpUrl: string; ghlContact: string; driveFolder: string; notes: string;
  payStatus: string; payMethod: string; billingDay: string; nextBill: string; lastPayment: string; clientSince: string; termEnds: string; lastReport: string;
  gbpAccess: string; gbpChecked: string; stripeCustomer: string; onboardingItem: string; teamDesk: boolean;
  flags: ClientFlag[];
};
export type ClientsListData = { rows: ClientRow[]; cursor: string | null; boardName: string; stripeConnected: boolean };
export type StripeSnapshot = {
  customerId: string; email: string; name: string;
  subscription: { id: string; status: string; currentPeriodEnd: string; cancelAt: string; amount: number; interval: string } | null;
  latestInvoice: { id: string; status: string; amountDue: number; paidAt: string; dueDate: string; attempted: boolean; hostedUrl: string } | null;
  fetchedAt: string;
};
export type ClientDetail = { row: ClientRow; history: { id: string; text: string; createdAt: string; author: string }[]; stripe: StripeSnapshot | null; stripeConnected: boolean; owners: { id: string; name: string }[] };
