// Onboarding Pipeline board — inspected Sep 24 2026 (Josh's board, creativecowboys.monday.com).
// Column ids were read from the live board; the seven marked "added" were created by Claude on
// Sep 24 2026 for the /leads Start onboarding action. Never guess ids — re-inspect if this drifts.
export const PIPELINE_BOARD_ID = "18431157561";
export const PIPELINE_CHECKLIST_BOARD_ID = "18431157564"; // subitems board
export const GIVEAWAY_BOARD_ID = "18430997894";
export const MONDAY_ORIGIN = "https://creativecowboys.monday.com";

export const COL = {
  health: "health",
  onboardingOwner: "onboarding_owner",
  buildOwner: "build_owner",
  contact: "contact",
  email: "email",
  phone: "phone",
  businessType: "business_type",
  city: "city",
  signed: "signed",
  targetLaunch: "target_launch",
  profileComplete: "profile_complete",
  gbpAccess: "gbp_access",
  dnsPath: "dns_path",
  baseline: "baseline",
  nextAction: "next_action",
  lastTouch: "last_touch",
  onboardingLink: "onboarding_link",
  ghlContact: "ghl_contact",
  driveFolder: "drive_folder",
  siteUrl: "site_url",
  gbpUrl: "gbp_url",
  notes: "notes",
  package: "dropdown_mm77eq07",
  customMonthly: "custom_monthly",
  monthlyFormula: "formula_mm77a739",
  leadId: "text_mm7gm53r", // added
  handoffId: "text_mm7g2d9k", // added
  salesOwner: "multiple_person_mm7g746w", // added
  setup: "numeric_mm7g28df", // added
  agreement: "color_mm7g32e6", // added
  payment: "color_mm7gz9ng", // added
  intake: "color_mm7gmf8r", // added
  searchAtlasListing: "text_mm7pjpc1", // added Sep 30 2026 — Search Atlas GBP location id (numeric) the desk links this client to
} as const;

export const SUBITEM_COL = { owner: "person", status: "status", due: "date0", phase: "phase" } as const;

/** Board groups double as the onboarding stage. The template group is never shown or written. */
export const STAGES = [
  { id: "new", label: "New handoff", group: "group_mm77bnv" },
  { id: "collecting", label: "Collecting assets / access", group: "group_mm77nsf5" },
  { id: "ready", label: "Ready for production", group: "group_mm776gzc" },
  { id: "building", label: "In progress", group: "group_mm779k27" },
  { id: "launched", label: "Launched", group: "group_mm77fzdt" },
  { id: "hold", label: "Waiting / on hold", group: "group_mm77jta" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];
export const TEMPLATE_GROUP_ID = "topics";
export const stageForGroup = (groupId: string): StageId | "template" | "unknown" =>
  groupId === TEMPLATE_GROUP_ID ? "template" : STAGES.find((s) => s.group === groupId)?.id ?? "unknown";

export const HEALTH = ["Not Started", "On Track", "Waiting on Client", "Blocked"] as const;
export const GBP_ACCESS = ["Not Requested", "Requested", "Verified", "No GBP Exists"] as const;
export const AGREEMENT = ["Unknown", "Pending", "Signed", "Not required"] as const;
/** "No charge" is only for Giveaway Winner records (added Oct 1 2026; created on the board on first use). */
export const PAYMENT = ["Unknown", "Pending", "Deposit paid", "Paid", "No charge"] as const;
export const PAYMENT_NO_CHARGE = "No charge";
export const INTAKE = ["Not sent", "Link issued", "Client submitted", "Reviewed"] as const;
export const CHECK_STATUS = ["Working on it", "Done", "Stuck"] as const;
export const BUSINESS_TYPES = ["Roofing", "Plumbing", "HVAC", "Concrete", "Law", "Landscaping", "Dental", "Auto Repair", "Ecommerce", "Other Local Service"] as const;
export const DNS_PATHS = ["We register a new domain", "Registrar access (secure link)", "Client adds our CNAME"] as const;

/** Package labels exactly as they exist on the Onboarding Pipeline "Package" dropdown. */
export const PACKAGES = [
  "Local Growth", "Local Growth — First Year $297", "Max Growth", "Expanded Reach (+5 cities)", "AI SEO",
  "Social Ads $300", "Social Ads $600", "Social Ads $1,200", "Social Ads Custom",
  "Google Ads $500", "Google Ads $1,000", "Google Ads $1,500", "Google Ads Custom",
  "CRM (incl. AI Chat)", "AI Chat only", "Growth Strategy Session", "Giveaway Winner",
] as const;
export type PackageLabel = (typeof PACKAGES)[number];

/** Giveaway winners (Dave, Oct 1 2026: "a winner tab, where we don't have to charge them"). The label rides
 *  alongside whatever they won (e.g. Giveaway Winner + Local Growth). Any record carrying it is never billed:
 *  amounts are $0, Payment is "No charge", and the package builder refuses to create a plan for them.
 *  Client-safe (no node imports) — the handoff form and the panels use it too. */
export const GIVEAWAY_WINNER = "Giveaway Winner";
export function isGiveawayWinner(packages: string | readonly string[] | null | undefined): boolean {
  const list = Array.isArray(packages) ? packages : String(packages || "").split(",");
  return list.some((p) => String(p).trim() === GIVEAWAY_WINNER);
}

/** Monday user ids (creativecowboys.monday.com, verified Sep 24 2026). Madison has no Monday seat yet —
 *  add her via ONBOARDING_EXTRA_OWNERS="Madison:<id>" once Josh invites her; do not guess an id. */
export const STAFF = [
  { id: "39848115", name: "Dave" },
  { id: "39848217", name: "Josh" },
  { id: "116679004", name: "Keaton" },
] as const;
export const SALES_OWNERS = STAFF;
export function onboardingOwners(): { id: string; name: string }[] {
  const extra = (process.env.ONBOARDING_EXTRA_OWNERS || "").split(",").map((s) => s.trim()).filter(Boolean)
    .map((pair) => { const [name, id] = pair.split(":").map((x) => x.trim()); return /^\d{1,12}$/.test(id || "") && name ? { id, name } : null; })
    .filter((x): x is { id: string; name: string } => !!x);
  return [...STAFF, ...extra];
}

/** Who the client invites to their Google Business Profile (as an Owner, per Dave Oct 4 2026). */
// Who clients add to their Google Business Profile. Dave, Oct 4 2026: add Dave as an Owner, then he adds anyone else.
// NEXT_PUBLIC_ so the client-side intake page sees it (a plain GBP_AGENCY_EMAIL never reached the browser, which is why
// the page kept showing the old howdy@ fallback even after GBP_AGENCY_EMAIL=dave@ was set on Vercel, Sep 24).
export const GBP_AGENCY_EMAIL = () => process.env.NEXT_PUBLIC_GBP_AGENCY_EMAIL || "dave@creativecowboys.co";

export const INTAKE_TOKEN_DAYS = 45;
export const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "image/heic", "application/pdf", "application/zip", "application/postscript", "image/vnd.adobe.photoshop", "application/illustrator", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
export const FILE_CATEGORIES = ["Brand", "Photos", "Content", "Reference"] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];
