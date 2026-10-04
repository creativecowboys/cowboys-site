import assert from "node:assert/strict";
import { test } from "node:test";
import { blobJson, blobKeys, blobReset } from "@/lib/desk/testing/blob-stub";
import {
  CONSENT_PATH,
  CONSENT_PURPOSE,
  CONSENT_TEXT,
  CONSENT_VERSION,
  buildConsentRecord,
  consentId,
  listConsentRecords,
  normalizeUsMobile,
  saveConsent,
  validateConsent,
  type ConsentRecord,
} from "./consent";

// Nothing here sends anything: "@vercel/blob" is the in-memory stub and no network is touched.
// Every record written below carries origin "test-fixture", which the website form never sets.

process.env.BLOB_READ_WRITE_TOKEN ||= "test-token";

const GOOD = { name: "Pat Rider", business: "Rider Feed & Seed", email: "pat@riderfeed.example", mobile: "(470) 555-0188", consent: true };

test("the exact approved sentence is what we show and what we store", () => {
  assert.equal(
    CONSENT_TEXT,
    "I agree to receive text messages from Creative Cowboys Media, LLC about my website update requests, including support replies and completion confirmations from Howdy. Message frequency varies. Message and data rates may apply. Consent is not a condition of purchasing any service. Reply STOP to unsubscribe or HELP for help.",
  );
  assert.equal(CONSENT_VERSION, "howdy-updates-2026-10-04");
});

test("a US mobile is stored as E.164 however the person wrote it", () => {
  for (const written of ["4705550188", "470-555-0188", "(470) 555-0188", " +1 470 555 0188 ", "1.470.555.0188"]) {
    assert.equal(normalizeUsMobile(written), "+14705550188", written);
  }
});

test("a number that cannot be a US mobile is refused, not stored", () => {
  for (const bad of ["", "555-0188", "470555018", "04705550188", "470-155-0188", "123", "+44 20 7946 0958", "not a number"]) {
    assert.throws(() => normalizeUsMobile(bad), /10-digit US mobile/, bad);
  }
});

test("consent must be ticked — an untouched box is not consent", () => {
  assert.throws(() => validateConsent({ ...GOOD, consent: false }), /Tick the consent box/);
  assert.throws(() => validateConsent({ ...GOOD, consent: undefined }), /Tick the consent box/);
  assert.throws(() => validateConsent({ ...GOOD, consent: "on" }), /Tick the consent box/);
  assert.throws(() => validateConsent({ ...GOOD, consent: 1 }), /Tick the consent box/);
});

test("identity and contact are required so a record can be matched to a real client", () => {
  assert.throws(() => validateConsent({ ...GOOD, name: "  " }), /Enter your name/);
  assert.throws(() => validateConsent({ ...GOOD, business: "" }), /business name/);
  assert.throws(() => validateConsent({ ...GOOD, email: "pat.at.riderfeed" }), /valid email/);
  assert.throws(() => validateConsent(null), /Invalid submission/);
  assert.throws(() => validateConsent([GOOD]), /Invalid submission/);
});

test("oversized and control-character input is refused before it reaches storage", () => {
  assert.throws(() => validateConsent({ ...GOOD, name: "a".repeat(121) }), /valid name/);
  assert.throws(() => validateConsent({ ...GOOD, business: "Rider\u0007Feed" }), /valid business name/);
  assert.throws(() => validateConsent({ ...GOOD, email: 42 }), /valid email address/);
});

test("a validated submission keeps both the typed number and the E.164 one", () => {
  const form = validateConsent(GOOD);
  assert.deepEqual(form, {
    name: "Pat Rider",
    business: "Rider Feed & Seed",
    email: "pat@riderfeed.example",
    mobile: "+14705550188",
    mobileEntered: "(470) 555-0188",
  });
});

test("the record carries who, what number, what for, the exact wording, when and where from", () => {
  const record = buildConsentRecord(validateConsent(GOOD), {
    receivedAt: "2026-10-04T23:45:00.000Z",
    origin: "test-fixture",
    source: "/sms-optin",
    remoteIp: "203.0.113.7",
    userAgent: "Mozilla/5.0 (fixture)",
  });
  assert.equal(record.name, "Pat Rider");
  assert.equal(record.business, "Rider Feed & Seed");
  assert.equal(record.email, "pat@riderfeed.example");
  assert.equal(record.mobile, "+14705550188");
  assert.equal(record.purpose, CONSENT_PURPOSE);
  assert.equal(record.consentText, CONSENT_TEXT);
  assert.equal(record.consentVersion, CONSENT_VERSION);
  assert.equal(record.consentGiven, true);
  assert.equal(record.receivedAt, "2026-10-04T23:45:00.000Z");
  assert.equal(record.source, "/sms-optin");
  assert.equal(record.remoteIp, "203.0.113.7");
  assert.equal(record.id, "14705550188-20261004T234500000Z");
});

test("consent is never an enrolment: a record from the website is always pending review", () => {
  const record = buildConsentRecord(validateConsent(GOOD), {
    receivedAt: "2026-10-04T23:45:00.000Z",
    origin: "website-form",
    source: "/sms-optin",
  });
  assert.equal(record.status, "pending_review");
  assert.equal(record.origin, "website-form");
});

test("a fixture can never be mistaken for a client who really consented", () => {
  const fixture = buildConsentRecord(validateConsent(GOOD), { receivedAt: "2026-10-04T23:45:00.000Z", origin: "test-fixture", source: "/sms-optin" });
  assert.equal(fixture.origin, "test-fixture");
  assert.notEqual(fixture.origin, "website-form");
});

test("saving puts the record under the private consent prefix, and nowhere public", async () => {
  blobReset();
  const record = buildConsentRecord(validateConsent(GOOD), { receivedAt: "2026-10-04T23:45:00.000Z", origin: "test-fixture", source: "/sms-optin" });
  await saveConsent(record);
  assert.deepEqual(blobKeys(), ["howdy-sms-consent/pending/14705550188-20261004T234500000Z.json"]);
  assert.equal(CONSENT_PATH(record.id), blobKeys()[0]);
  assert.deepEqual(blobJson<ConsentRecord>(blobKeys()[0]), record);
});

test("a second consent from the same number is kept, not overwritten", async () => {
  blobReset();
  const first = buildConsentRecord(validateConsent(GOOD), { receivedAt: "2026-10-04T23:45:00.000Z", origin: "test-fixture", source: "/sms-optin" });
  const second = buildConsentRecord(validateConsent(GOOD), { receivedAt: "2026-10-05T09:00:00.000Z", origin: "test-fixture", source: "/sms-optin" });
  await saveConsent(first);
  await saveConsent(second);
  assert.equal(blobKeys().length, 2, "both moments survive — the history is the audit trail");
  assert.notEqual(consentId("+14705550188", first.receivedAt), consentId("+14705550188", second.receivedAt));
});

test("review lists every pending record, newest first", async () => {
  blobReset();
  await saveConsent(buildConsentRecord(validateConsent(GOOD), { receivedAt: "2026-10-04T23:45:00.000Z", origin: "test-fixture", source: "/sms-optin" }));
  await saveConsent(buildConsentRecord(validateConsent({ ...GOOD, name: "Sam Cole", mobile: "770-555-0144" }), { receivedAt: "2026-10-05T09:00:00.000Z", origin: "test-fixture", source: "/sms-optin" }));
  const records = await listConsentRecords();
  assert.deepEqual(records.map((r) => r.name), ["Sam Cole", "Pat Rider"]);
  assert.ok(records.every((r) => r.status === "pending_review"), "review starts from pending, never from enrolled");
});
