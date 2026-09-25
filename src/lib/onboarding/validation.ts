import { CallDeskError, validateLeadId } from "@/lib/calls/validation";
import { AGREEMENT, BUSINESS_TYPES, CHECK_STATUS, FILE_CATEGORIES, GBP_ACCESS, HEALTH, PACKAGES, PAYMENT, STAGES, DNS_PATHS, onboardingOwners } from "./config";
import type { HandoffForm, IntakeForm } from "./types";

const UUID = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const money = (v: string) => v === "" || (/^\d{1,6}(?:\.\d{1,2})?$/.test(v) && Number(v) <= 100000);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;

function str(raw: Record<string, unknown>, key: string, limit: number): string {
  const v = raw[key];
  if (v === undefined || v === null) return "";
  if (typeof v !== "string" || v.length > limit || CONTROL.test(v)) throw new CallDeskError(`Invalid or oversized value for ${key}.`, 400);
  return v.trim();
}
function object(input: unknown, what: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new CallDeskError(`Invalid ${what}.`, 400);
  return input as Record<string, unknown>;
}

const HANDOFF_KEYS: (keyof HandoffForm)[] = ["handoffId", "leadId", "manual", "expectedUpdatedAt", "business", "contact", "email", "phone", "website", "city", "businessType", "salesOwner", "packages", "monthlyAgreed", "setupAgreed", "scope", "exclusions", "goals", "context", "startDate", "agreement", "payment", "nextAction", "nextOwner", "nextDue"];

export function validateHandoff(input: unknown, routeLeadId?: string): HandoffForm {
  const raw = object(input, "handoff");
  if (Object.keys(raw).some((k) => !(HANDOFF_KEYS as string[]).includes(k))) throw new CallDeskError("Unexpected handoff field.", 400);
  const s = (k: string, n: number) => str(raw, k, n);
  const form: HandoffForm = {
    handoffId: s("handoffId", 36), leadId: s("leadId", 20), expectedUpdatedAt: s("expectedUpdatedAt", 40),
    business: s("business", 200), contact: s("contact", 120), email: s("email", 200), phone: s("phone", 40), website: s("website", 300), city: s("city", 120),
    businessType: s("businessType", 40), salesOwner: s("salesOwner", 10) as HandoffForm["salesOwner"],
    packages: [], monthlyAgreed: s("monthlyAgreed", 12), setupAgreed: s("setupAgreed", 12),
    scope: s("scope", 4000), exclusions: s("exclusions", 2000), goals: s("goals", 2000), context: s("context", 4000),
    startDate: s("startDate", 10), agreement: s("agreement", 20) as HandoffForm["agreement"], payment: s("payment", 20) as HandoffForm["payment"],
    nextAction: s("nextAction", 500), nextOwner: s("nextOwner", 10) as HandoffForm["nextOwner"], nextDue: s("nextDue", 10),
  };
  if (!UUID.test(form.handoffId)) throw new CallDeskError("Invalid handoff reference. Reopen the lead.", 400);
  if (raw.manual !== undefined && typeof raw.manual !== "boolean") throw new CallDeskError("Invalid handoff.", 400);
  form.manual = raw.manual === true;
  if (form.manual) {
    // Added by hand on the Onboarding tab: no giveaway lead, no lead version to check.
    if (form.leadId) throw new CallDeskError("A manual client cannot also reference a lead.", 400);
    form.expectedUpdatedAt = "";
  } else {
    validateLeadId(form.leadId);
    if (routeLeadId && routeLeadId !== form.leadId) throw new CallDeskError("The selected lead does not match this handoff.", 400);
    if (!ISO.test(form.expectedUpdatedAt) || !Number.isFinite(Date.parse(form.expectedUpdatedAt))) throw new CallDeskError("Reload the lead before handing it off.", 400);
  }
  if (!form.business) throw new CallDeskError("Business name is required.", 400);
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new CallDeskError("Enter a valid email or leave it blank.", 400);
  if (form.businessType && !(BUSINESS_TYPES as readonly string[]).includes(form.businessType)) throw new CallDeskError("Choose a valid business type.", 400);
  if (!["Dave", "Josh", "Keaton"].includes(form.salesOwner)) throw new CallDeskError("Choose the sales owner.", 400);
  const packages = raw.packages;
  if (!Array.isArray(packages) || packages.length === 0 || packages.length > 8 || packages.some((p) => typeof p !== "string" || !(PACKAGES as readonly string[]).includes(p))) throw new CallDeskError("Choose at least one package that exists on the pricing list.", 400);
  form.packages = [...new Set(packages as HandoffForm["packages"])];
  if (!money(form.monthlyAgreed) || !money(form.setupAgreed)) throw new CallDeskError("Enter agreed amounts between 0 and 100,000, or leave them blank.", 400);
  if (form.startDate && !isDate(form.startDate)) throw new CallDeskError("Choose a valid start date.", 400);
  if (!(AGREEMENT as readonly string[]).includes(form.agreement)) throw new CallDeskError("Choose the agreement status (Unknown is allowed).", 400);
  if (!(PAYMENT as readonly string[]).includes(form.payment)) throw new CallDeskError("Choose the payment status (Unknown is allowed).", 400);
  if (form.nextOwner && !["Dave", "Josh", "Keaton", "Madison"].includes(form.nextOwner)) throw new CallDeskError("Choose a valid next-action owner.", 400);
  if (form.nextDue && !isDate(form.nextDue)) throw new CallDeskError("Choose a valid next-action date.", 400);
  if (!form.scope) throw new CallDeskError("Describe the agreed scope so onboarding knows what was sold.", 400);
  return form;
}

export type PatchAction =
  | { action: "stage"; stage: (typeof STAGES)[number]["id"] }
  | { action: "health"; value: (typeof HEALTH)[number] }
  | { action: "owner"; ownerId: string } // "" clears
  | { action: "checklist"; subitemId: string; status: (typeof CHECK_STATUS)[number] | "" }
  | { action: "gbp"; value: (typeof GBP_ACCESS)[number]; gbpUrl?: string }
  | { action: "agreement"; value: (typeof AGREEMENT)[number] }
  | { action: "payment"; value: (typeof PAYMENT)[number] }
  | { action: "dns"; value: (typeof DNS_PATHS)[number] | "" }
  | { action: "next"; nextAction: string; due: string }
  | { action: "intakeReviewed" }
  | { action: "ready" }
  | { action: "note"; text: string };

export function validatePatch(input: unknown): PatchAction & { expectedUpdatedAt: string } {
  const raw = object(input, "update");
  const expected = str(raw, "expectedUpdatedAt", 40);
  if (!ISO.test(expected)) throw new CallDeskError("Reload this client before changing it.", 400);
  const action = str(raw, "action", 20);
  const bad = (m: string) => new CallDeskError(m, 400);
  const allowKeys = (keys: string[]) => { if (Object.keys(raw).some((k) => !["action", "expectedUpdatedAt", ...keys].includes(k))) throw bad("Unexpected update field."); };
  switch (action) {
    case "stage": { allowKeys(["stage"]); const stage = str(raw, "stage", 20); if (!STAGES.some((s) => s.id === stage)) throw bad("Choose a valid stage."); return { action, stage: stage as (typeof STAGES)[number]["id"], expectedUpdatedAt: expected }; }
    case "health": { allowKeys(["value"]); const value = str(raw, "value", 30); if (!(HEALTH as readonly string[]).includes(value)) throw bad("Choose a valid health."); return { action, value: value as (typeof HEALTH)[number], expectedUpdatedAt: expected }; }
    case "owner": { allowKeys(["ownerId"]); const ownerId = str(raw, "ownerId", 12); if (ownerId && !onboardingOwners().some((o) => o.id === ownerId)) throw bad("Choose a team member who has a Monday seat."); return { action, ownerId, expectedUpdatedAt: expected }; }
    case "checklist": { allowKeys(["subitemId", "status"]); const subitemId = str(raw, "subitemId", 20); const status = str(raw, "status", 20); if (!/^[1-9]\d{0,19}$/.test(subitemId)) throw bad("Invalid checklist item."); if (status && !(CHECK_STATUS as readonly string[]).includes(status)) throw bad("Choose a valid checklist status."); return { action, subitemId, status: status as (typeof CHECK_STATUS)[number] | "", expectedUpdatedAt: expected }; }
    case "gbp": { allowKeys(["value", "gbpUrl"]); const value = str(raw, "value", 30); const gbpUrl = str(raw, "gbpUrl", 300); if (!(GBP_ACCESS as readonly string[]).includes(value)) throw bad("Choose a valid access state."); return { action, value: value as (typeof GBP_ACCESS)[number], gbpUrl, expectedUpdatedAt: expected }; }
    case "agreement": { allowKeys(["value"]); const value = str(raw, "value", 20); if (!(AGREEMENT as readonly string[]).includes(value)) throw bad("Choose a valid agreement status."); return { action, value: value as (typeof AGREEMENT)[number], expectedUpdatedAt: expected }; }
    case "payment": { allowKeys(["value"]); const value = str(raw, "value", 20); if (!(PAYMENT as readonly string[]).includes(value)) throw bad("Choose a valid payment status."); return { action, value: value as (typeof PAYMENT)[number], expectedUpdatedAt: expected }; }
    case "dns": { allowKeys(["value"]); const value = str(raw, "value", 40); if (value && !(DNS_PATHS as readonly string[]).includes(value)) throw bad("Choose a valid DNS path."); return { action, value: value as (typeof DNS_PATHS)[number] | "", expectedUpdatedAt: expected }; }
    case "next": { allowKeys(["nextAction", "due"]); const nextAction = str(raw, "nextAction", 500); const due = str(raw, "due", 10); if (due && !isDate(due)) throw bad("Choose a valid due date."); return { action, nextAction, due, expectedUpdatedAt: expected }; }
    case "intakeReviewed": allowKeys([]); return { action, expectedUpdatedAt: expected };
    case "ready": allowKeys([]); return { action, expectedUpdatedAt: expected };
    case "note": { allowKeys(["text"]); const text = str(raw, "text", 6000); if (!text) throw bad("Write a note first."); return { action, text, expectedUpdatedAt: expected }; }
    default: throw bad("Unknown update.");
  }
}

export function validateItemId(id: string): string {
  if (!/^[1-9]\d{0,19}$/.test(id)) throw new CallDeskError("Invalid client.", 400);
  return id;
}

const INTAKE_LIMITS: Record<keyof IntakeForm, number> = { business: 200, contact: 120, email: 200, phone: 40, address: 300, serviceAreas: 1000, services: 3000, goals: 3000, brandColors: 500, fonts: 300, website: 300, references: 2000, competitors: 2000, social: 1000, hours: 500, gbpUrl: 300, gbpInviteSent: 1, gbpNoProfile: 1, notes: 4000 };
export function validateIntakeForm(input: unknown): IntakeForm {
  const raw = object(input, "form");
  if (Object.keys(raw).some((k) => !(k in INTAKE_LIMITS))) throw new CallDeskError("Unexpected form field.", 400);
  const out = {} as IntakeForm;
  for (const [key, limit] of Object.entries(INTAKE_LIMITS) as [keyof IntakeForm, number][]) {
    if (key === "gbpInviteSent" || key === "gbpNoProfile") { const v = raw[key]; if (v !== undefined && typeof v !== "boolean") throw new CallDeskError("Invalid form value.", 400); (out as Record<string, unknown>)[key] = v === true; continue; }
    (out as Record<string, unknown>)[key] = str(raw, key, limit);
  }
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new CallDeskError("Please enter a valid email address.", 400);
  return out;
}

export function validateToken(token: string): string {
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) throw new CallDeskError("This link is not valid.", 404);
  return token;
}

export function validateFileCategory(value: unknown): (typeof FILE_CATEGORIES)[number] {
  if (typeof value !== "string" || !(FILE_CATEGORIES as readonly string[]).includes(value)) throw new CallDeskError("Choose where this file belongs.", 400);
  return value as (typeof FILE_CATEGORIES)[number];
}

export function safeFilename(name: string): string {
  const base = name.replace(/^.*[\\/]/, "").replace(/[^\w.\- ()]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);
  return base && base !== "." && base !== ".." ? base : "file";
}

/** Where a client upload lands: onboarding/files/<folder>/<Category>/<safe name>. Shared by the intake page and the token route. */
export function uploadPath(folder: string, category: string, name: string): string {
  return `onboarding/files/${folder}/${category}/${safeFilename(name)}`;
}
