import type { ChecklistItem } from "./types";

// Package-driven checklist. Pure functions so they can be unit tested without Monday.
// "required" items must be Done before a client can be marked Ready for production.
// Access items are deliberately split: instructions sent ≠ client says they invited us ≠ we verified.
export type TemplateItem = { name: string; phase: "Onboard" | "Build" | "Launch"; required: boolean };

const BASE: TemplateItem[] = [
  { name: "Intake link delivered to client", phase: "Onboard", required: true },
  { name: "Client intake reviewed by staff", phase: "Onboard", required: true },
  { name: "Logo files received (vector preferred)", phase: "Onboard", required: true },
  { name: "Brand colors + fonts confirmed", phase: "Onboard", required: true },
  { name: "Photos received (team, work, location)", phase: "Onboard", required: false },
  { name: "Agreement status confirmed (signed / not required)", phase: "Onboard", required: true },
  { name: "Payment status confirmed (deposit or first payment)", phase: "Onboard", required: true },
  { name: "Kickoff call offered", phase: "Onboard", required: false },
];
const GBP: TemplateItem[] = [
  { name: "GBP access: instructions sent", phase: "Onboard", required: true },
  { name: "GBP access: client reports invitation sent", phase: "Onboard", required: true },
  { name: "GBP access: verified by staff (or No GBP Exists confirmed)", phase: "Onboard", required: true },
];
const WEBSITE: TemplateItem[] = [
  { name: "Domain / DNS path confirmed with client", phase: "Onboard", required: true },
  { name: "Existing website access confirmed (or none)", phase: "Onboard", required: true },
  { name: "Website Hosting & Support ($30/mo) confirmed", phase: "Onboard", required: true },
  { name: "Site built and QA passed", phase: "Build", required: false },
  { name: "DNS cutover / go-live", phase: "Launch", required: false },
];
const SEO: TemplateItem[] = [
  { name: "Service list + target cities confirmed", phase: "Onboard", required: true },
  { name: "Search Console / Analytics access confirmed", phase: "Onboard", required: false },
  { name: "Tracked keywords set", phase: "Build", required: false },
  { name: "Baseline snapshot captured (GBP, ranks, reviews)", phase: "Build", required: false },
  { name: "Citations submitted", phase: "Build", required: false },
];
const SOCIAL_ADS: TemplateItem[] = [
  { name: "Meta Business / ad account access confirmed", phase: "Onboard", required: true },
  { name: "Ad creative assets received", phase: "Onboard", required: true },
  { name: "Ad budget + billing method confirmed", phase: "Onboard", required: true },
];
const GOOGLE_ADS: TemplateItem[] = [
  { name: "Google Ads account access confirmed", phase: "Onboard", required: true },
  { name: "Conversion goals + landing page confirmed", phase: "Onboard", required: true },
  { name: "Ad budget + billing method confirmed", phase: "Onboard", required: true },
];
const CRM: TemplateItem[] = [
  { name: "Business phone forwarding + notification contacts confirmed", phase: "Onboard", required: true },
  { name: "Website chat placement confirmed", phase: "Onboard", required: true },
  { name: "CRM sub-account created", phase: "Build", required: false },
];
const STRATEGY: TemplateItem[] = [
  { name: "Strategy session scheduled", phase: "Onboard", required: true },
  { name: "Written growth plan delivered", phase: "Build", required: false },
];

export function checklistFor(packages: string[]): TemplateItem[] {
  const set = new Set(packages);
  const has = (test: (p: string) => boolean) => [...set].some(test);
  const groups: TemplateItem[][] = [BASE];
  const seo = has((p) => /Local Growth|Max Growth|Expanded Reach|AI SEO/.test(p));
  if (seo) groups.push(GBP, SEO);
  if (has((p) => /Website/i.test(p)) || seo) groups.push(WEBSITE);
  if (has((p) => /^Social Ads/.test(p))) groups.push(SOCIAL_ADS);
  if (has((p) => /^Google Ads/.test(p))) groups.push(GOOGLE_ADS);
  if (has((p) => /CRM|AI Chat/.test(p))) groups.push(CRM);
  if (has((p) => /Strategy/.test(p))) groups.push(STRATEGY);
  const seen = new Set<string>();
  return groups.flat().filter((item) => (seen.has(item.name) ? false : (seen.add(item.name), true)));
}

/** Names of required items that are not Done. Readiness is decided by staff review, never inferred here. */
export function missingRequired(items: ChecklistItem[]): string[] {
  return items.filter((i) => i.required && i.status !== "Done").map((i) => i.name);
}

export function isRequiredName(name: string, packages: string[]): boolean {
  return checklistFor(packages).some((t) => t.name === name && t.required);
}

export function readinessProblems(row: { checklist: ChecklistItem[]; gbpAccess: string; agreement: string; payment: string; intake: string; packages: string }): string[] {
  const problems = missingRequired(row.checklist).map((n) => `Checklist: ${n}`);
  const packages = row.packages.split(",").map((s) => s.trim()).filter(Boolean);
  const needsGbp = packages.some((p) => /Local Growth|Max Growth|Expanded Reach|AI SEO/.test(p));
  if (needsGbp && !["Verified", "No GBP Exists"].includes(row.gbpAccess)) problems.push("GBP access is not verified by staff");
  if (!["Signed", "Not required"].includes(row.agreement)) problems.push(`Agreement is ${row.agreement || "Unknown"}`);
  if (!["Deposit paid", "Paid"].includes(row.payment)) problems.push(`Payment is ${row.payment || "Unknown"}`);
  if (!["Client submitted", "Reviewed"].includes(row.intake)) problems.push("Client intake has not been submitted");
  return problems;
}
