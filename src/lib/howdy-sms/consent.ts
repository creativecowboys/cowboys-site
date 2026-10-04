import { CallDeskError } from "@/lib/calls/validation";
import { listFiles, readJson, writeJson } from "@/lib/onboarding/store";
import { CONSENT_PURPOSE, CONSENT_TEXT, CONSENT_VERSION } from "./consent-text";

// Howdy update texts — the written consent a client gives on /sms-optin.
//
// A record here is evidence, not an enrolment: it proves one person, at one moment, read one exact
// sentence and ticked a box. Nothing in this file turns texting on. Matching a record to a real client
// and switching the Howdy platform's send flags on are separate, human steps (see ROLLOUT in the
// howdy-platform work tree). Records live in the site's private Vercel Blob store, never public.

export { CONSENT_PURPOSE, CONSENT_TEXT, CONSENT_VERSION };

const PREFIX = "howdy-sms-consent";
export const CONSENT_PATH = (id: string) => `${PREFIX}/pending/${id}.json`;
export const CONSENT_PREFIX = `${PREFIX}/pending/`;

/** Where the record came from. A fixture can never be mistaken for a person. */
export type ConsentOrigin = "website-form" | "test-fixture";

export type ConsentForm = {
  name: string;
  business: string;
  email: string;
  mobile: string; // E.164, +1XXXXXXXXXX
  mobileEntered: string; // exactly what they typed, kept as evidence
};

export type ConsentRecord = ConsentForm & {
  id: string;
  /** Always pending: a web form proves consent, it does not prove who the client is. */
  status: "pending_review";
  origin: ConsentOrigin;
  source: string;
  purpose: string;
  consentVersion: string;
  consentText: string;
  consentGiven: true;
  receivedAt: string;
  remoteIp: string;
  userAgent: string;
};

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 120, business: 200, email: 200, mobile: 40 } as const;

function str(raw: Record<string, unknown>, key: keyof typeof LIMITS, label: string): string {
  const v = raw[key];
  if (v === undefined || v === null) return "";
  if (typeof v !== "string" || v.length > LIMITS[key] || CONTROL.test(v)) {
    throw new CallDeskError(`Enter a valid ${label}.`, 400);
  }
  return v.trim();
}

/**
 * A US mobile, written any way a person writes one, as E.164. Area code and exchange cannot start
 * with 0 or 1, so typos and made-up numbers are refused rather than stored as consent.
 */
export function normalizeUsMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10 || !/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) {
    throw new CallDeskError("Enter a 10-digit US mobile number, like (470) 243-7517.", 400);
  }
  return `+1${ten}`;
}

/** Validates one submission. Throws CallDeskError(400) with a sentence the visitor can act on. */
export function validateConsent(input: unknown): ConsentForm {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CallDeskError("Invalid submission.", 400);
  }
  const raw = input as Record<string, unknown>;
  const name = str(raw, "name", "name");
  const business = str(raw, "business", "business name");
  const email = str(raw, "email", "email address");
  const mobileEntered = str(raw, "mobile", "mobile number");

  if (!name) throw new CallDeskError("Enter your name.", 400);
  if (!business) throw new CallDeskError("Enter your business name so we can match you to your account.", 400);
  if (!email || !EMAIL.test(email)) throw new CallDeskError("Enter a valid email address.", 400);
  if (raw.consent !== true) {
    throw new CallDeskError("Tick the consent box if you want Howdy to text you. It is optional.", 400);
  }
  return { name, business, email, mobile: normalizeUsMobile(mobileEntered), mobileEntered };
}

/**
 * One record per submission, keyed by number + instant, so a second consent never overwrites the
 * first — the history is the audit trail.
 */
export function consentId(mobile: string, receivedAt: string): string {
  return `${mobile.replace(/\D/g, "")}-${receivedAt.replace(/[-:.]/g, "")}`;
}

export function buildConsentRecord(
  form: ConsentForm,
  meta: { receivedAt: string; origin: ConsentOrigin; source: string; remoteIp?: string; userAgent?: string },
): ConsentRecord {
  return {
    ...form,
    id: consentId(form.mobile, meta.receivedAt),
    status: "pending_review",
    origin: meta.origin,
    source: meta.source,
    purpose: CONSENT_PURPOSE,
    consentVersion: CONSENT_VERSION,
    consentText: CONSENT_TEXT,
    consentGiven: true,
    receivedAt: meta.receivedAt,
    remoteIp: (meta.remoteIp || "").slice(0, 60),
    userAgent: (meta.userAgent || "").slice(0, 300),
  };
}

export async function saveConsent(record: ConsentRecord): Promise<void> {
  await writeJson(CONSENT_PATH(record.id), record);
}

/** For identity/registry review by the team. Server-only; nothing on the site reads this publicly. */
export async function listConsentRecords(): Promise<ConsentRecord[]> {
  const files = await listFiles(CONSENT_PREFIX);
  const records: ConsentRecord[] = [];
  for (const file of files) {
    const record = await readJson<ConsentRecord>(file.pathname);
    if (record) records.push(record);
  }
  return records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}
