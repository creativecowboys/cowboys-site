// Active Clients board (Josh's, creativecowboys.monday.com) — inspected Sep 24 2026. The five columns
// marked "added" were created by Claude on Sep 24 2026 for the /leads Clients tab. Never guess ids.
export const CLIENTS_BOARD_ID = "18432563557";
export const MONDAY_ORIGIN = "https://creativecowboys.monday.com";

export const CCOL = {
  package: "dropdown_mm7gbkj",
  mrr: "formula_mm7g9q7c",
  customMonthly: "numeric_mm7gcqqa",
  health: "color_mm7gv846",
  accountManager: "account_manager",
  contact: "primary_contact",
  email: "email",
  phone: "phone",
  billingDay: "billing_day",
  nextBill: "next_bill",
  lastPayment: "last_payment",
  clientSince: "client_since",
  termEnds: "term_ends",
  lastReport: "last_report",
  website: "website",
  gbpUrl: "gbp",
  ghlContact: "ghl_contact",
  driveFolder: "drive_folder",
  notes: "notes",
  payStatus: "pay_status",
  payMethod: "pay_method",
  teamDesk: "boolean_mm7hemnq", // added
  stripeCustomer: "text_mm7h51ps", // added
  gbpAccess: "color_mm7hxmhp", // added
  onboardingItem: "text_mm7he8kn", // added
  gbpChecked: "date_mm7hzkw", // added
} as const;

export const CLIENT_GROUPS = [
  { id: "issue", label: "Payment issue", group: "group_mm7g5gd3" },
  { id: "active", label: "Active", group: "group_mm7gghq6" },
  { id: "risk", label: "At risk", group: "group_mm7gtp8h" },
  { id: "paused", label: "Paused", group: "group_mm7g71qe" },
  { id: "churned", label: "Churned", group: "topics" },
] as const;
export type ClientGroupId = (typeof CLIENT_GROUPS)[number]["id"];
export const groupIdFor = (mondayGroup: string): ClientGroupId | "unknown" => CLIENT_GROUPS.find((g) => g.group === mondayGroup)?.id ?? "unknown";

export const CLIENT_HEALTH = ["Too New", "Green", "Yellow", "Red"] as const;
export const PAY_STATUS = ["No Billing Set Up", "Due Soon", "Paid / Current", "Overdue", "Card Failed", "Refunded"] as const;
export const PAY_METHOD = ["Stripe via GHL", "QuickBooks invoice", "ACH / bank transfer", "Check", "Card on file (other)", "Trade / barter"] as const;
export const CLIENT_GBP = ["Not Requested", "Requested", "Verified", "No GBP Exists", "Lost / recheck"] as const;
export const CLIENT_PACKAGES = [
  "Local Growth", "Max Growth", "Expanded Reach (+5 cities)", "Local Growth — First Year $297", "Social Ads $300", "Social Ads $600", "Social Ads $1,200", "Social Ads Custom",
  "Google Ads $500", "Google Ads $1,000", "Google Ads $1,500", "Google Ads Custom", "CRM (incl. AI Chat)", "AI Chat only", "Growth Strategy Session", "AI SEO", "Website hosting / care", "Custom retainer",
] as const;

/** Problem thresholds shown on the tab. */
export const GBP_RECHECK_DAYS = 90;
export const REPORT_STALE_DAYS = 35;
export const TERM_SOON_DAYS = 30;
