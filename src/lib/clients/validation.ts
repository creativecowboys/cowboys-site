import { CallDeskError } from "@/lib/calls/validation";
import { onboardingOwners } from "@/lib/onboarding/config";
import { CLIENT_GBP, CLIENT_GROUPS, CLIENT_HEALTH, PAY_METHOD, PAY_STATUS, type ClientGroupId } from "./config";
import type { ClientPatch } from "./board";

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
function str(raw: Record<string, unknown>, key: string, limit: number): string {
  const v = raw[key];
  if (v === undefined || v === null) return "";
  if (typeof v !== "string" || v.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) throw new CallDeskError(`Invalid or oversized value for ${key}.`, 400);
  return v.trim();
}

export function validateClientId(id: string): string {
  if (!/^[1-9]\d{0,19}$/.test(id)) throw new CallDeskError("Invalid client.", 400);
  return id;
}

export function validateClientPatch(input: unknown): ClientPatch & { expectedUpdatedAt: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new CallDeskError("Invalid update.", 400);
  const raw = input as Record<string, unknown>;
  const expected = str(raw, "expectedUpdatedAt", 40);
  if (!ISO.test(expected)) throw new CallDeskError("Reload this client before changing it.", 400);
  const action = str(raw, "action", 20);
  const bad = (m: string) => new CallDeskError(m, 400);
  const only = (keys: string[]) => { if (Object.keys(raw).some((k) => !["action", "expectedUpdatedAt", ...keys].includes(k))) throw bad("Unexpected update field."); };
  const oneOf = (v: string, list: readonly string[], m: string) => { if (!list.includes(v)) throw bad(m); return v; };
  switch (action) {
    case "group": { only(["group"]); const group = str(raw, "group", 12); if (!CLIENT_GROUPS.some((g) => g.id === group)) throw bad("Choose a valid group."); return { action, group: group as ClientGroupId, expectedUpdatedAt: expected }; }
    case "health": only(["value"]); return { action, value: oneOf(str(raw, "value", 20), CLIENT_HEALTH, "Choose a valid health."), expectedUpdatedAt: expected };
    case "payStatus": only(["value"]); return { action, value: oneOf(str(raw, "value", 30), PAY_STATUS, "Choose a valid payment status."), expectedUpdatedAt: expected };
    case "payMethod": only(["value"]); return { action, value: oneOf(str(raw, "value", 30), PAY_METHOD, "Choose a valid payment method."), expectedUpdatedAt: expected };
    case "gbp": only(["value", "gbpUrl"]); return { action, value: oneOf(str(raw, "value", 30), CLIENT_GBP, "Choose a valid GBP state."), gbpUrl: str(raw, "gbpUrl", 300), expectedUpdatedAt: expected };
    case "gbpChecked": only([]); return { action, expectedUpdatedAt: expected };
    case "reportSent": only([]); return { action, expectedUpdatedAt: expected };
    case "manager": { only(["ownerId"]); const ownerId = str(raw, "ownerId", 12); if (ownerId && !onboardingOwners().some((o) => o.id === ownerId)) throw bad("Choose a team member who has a Monday seat."); return { action, ownerId, expectedUpdatedAt: expected }; }
    case "stripeCustomer": { only(["customerId"]); const customerId = str(raw, "customerId", 40); if (customerId && !/^cus_[A-Za-z0-9]+$/.test(customerId)) throw bad("A Stripe customer id looks like cus_…"); return { action, customerId, expectedUpdatedAt: expected }; }
    case "dates": { only(["nextBill", "termEnds", "billingDay"]); const nextBill = str(raw, "nextBill", 10); const termEnds = str(raw, "termEnds", 10); const billingDay = str(raw, "billingDay", 2); if ((nextBill && !isDate(nextBill)) || (termEnds && !isDate(termEnds))) throw bad("Choose valid dates."); if (billingDay && !/^([1-9]|[12]\d|3[01])$/.test(billingDay)) throw bad("Billing day is 1–31."); return { action, nextBill, termEnds, billingDay, expectedUpdatedAt: expected }; }
    case "contact": { only(["contact", "email", "phone", "website"]); const email = str(raw, "email", 200); if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad("Enter a valid email or leave it blank."); return { action, contact: str(raw, "contact", 120), email, phone: str(raw, "phone", 40), website: str(raw, "website", 300), expectedUpdatedAt: expected }; }
    case "note": { only(["text"]); const text = str(raw, "text", 6000); if (!text) throw bad("Write a note first."); return { action, text, expectedUpdatedAt: expected }; }
    default: throw bad("Unknown update.");
  }
}
