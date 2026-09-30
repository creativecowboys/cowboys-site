import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { flagsFor } from "./board";
import { paymentFromSnapshot, verifyStripeSignature } from "./stripe";
import type { ClientRow, StripeSnapshot } from "./types";
import type { GbpCard } from "@/lib/gbp/types";

const base = (): Omit<ClientRow, "flags"> => ({
  id: "1", name: "Test Co", url: "", updatedAt: "2026-09-24T00:00:00Z", group: "active", groupTitle: "Active", health: "Green", packages: "Local Growth", mrr: "497", customMonthly: "",
  accountManager: "Dave", accountManagerIds: ["39848115"], contact: "", email: "a@b.co", phone: "", website: "", gbpUrl: "", ghlContact: "", driveFolder: "", notes: "",
  payStatus: "Paid / Current", payMethod: "Stripe via GHL", billingDay: "", nextBill: "", lastPayment: "", clientSince: "", termEnds: "", lastReport: "2026-09-20",
  gbpAccess: "Verified", gbpChecked: "2026-09-01", stripeCustomer: "cus_123", onboardingItem: "", teamDesk: true,
  searchAtlasListing: "", gbpLive: null,
});
const live = (verified: boolean): GbpCard => ({ ok: true, listingId: 94266, name: "Test Co", verified, connected: true, rating: 5, reviewCount: 1, unanswered: 1, lastReviewDate: "", lastPostDate: "", profileCompleteness: 40, searchAtlasUrl: "", fetchedAt: "2026-09-30T00:00:00Z" });

test("flags surface exactly the problems the tab cares about", () => {
  assert.deepEqual(flagsFor(base(), "2026-09-24"), []);
  assert.deepEqual(flagsFor({ ...base(), payStatus: "Card Failed" }, "2026-09-24"), ["payment"]);
  assert.deepEqual(flagsFor({ ...base(), gbpAccess: "Requested" }, "2026-09-24"), ["gbp"]);
  assert.deepEqual(flagsFor({ ...base(), gbpChecked: "2026-01-01" }, "2026-09-24"), ["gbp-recheck"]);
  assert.deepEqual(flagsFor({ ...base(), lastReport: "" }, "2026-09-24"), ["report"]);
  assert.deepEqual(flagsFor({ ...base(), termEnds: "2026-10-10" }, "2026-09-24"), ["term"]);
  assert.deepEqual(flagsFor({ ...base(), stripeCustomer: "" }, "2026-09-24"), ["no-stripe"]);
  assert.deepEqual(flagsFor({ ...base(), group: "churned", lastReport: "" }, "2026-09-24"), [], "churned clients do not nag for reports");
});

test("a live Search Atlas read overrides the hand-set GBP state", () => {
  assert.deepEqual(flagsFor({ ...base(), gbpAccess: "Requested", gbpLive: live(true) }, "2026-09-24"), [], "verified live → no gbp flag even if Monday still says Requested");
  assert.deepEqual(flagsFor({ ...base(), gbpChecked: "2026-01-01", gbpLive: live(true) }, "2026-09-24"), [], "verified live → the 90-day recheck does not apply");
  assert.deepEqual(flagsFor({ ...base(), gbpAccess: "Verified", gbpLive: live(false) }, "2026-09-24"), ["gbp"], "unverified live → gbp flag even if Monday says Verified");
  assert.deepEqual(flagsFor({ ...base(), gbpAccess: "Verified", gbpChecked: "2026-01-01", gbpLive: { ok: false, listingId: 94266, connected: false, reason: "down", fetchedAt: "" } }, "2026-09-24"), ["gbp-recheck"], "a failed live read falls back to the Monday state");
});

const snap = (over: Partial<StripeSnapshot>): StripeSnapshot => ({ customerId: "cus_1", email: "a@b.co", name: "Test", subscription: { id: "sub_1", status: "active", currentPeriodEnd: "2026-10-15", cancelAt: "", amount: 297, interval: "month" }, latestInvoice: { id: "in_1", status: "paid", amountDue: 297, paidAt: "2026-09-15", dueDate: "", attempted: true, hostedUrl: "" }, fetchedAt: "", ...over });

test("stripe snapshot maps to board payment labels", () => {
  assert.deepEqual(paymentFromSnapshot(snap({}), "2026-09-24"), { payStatus: "Paid / Current", group: "active", lastPayment: "2026-09-15", nextBill: "2026-10-15" });
  assert.equal(paymentFromSnapshot(snap({ latestInvoice: { id: "in_2", status: "open", amountDue: 297, paidAt: "", dueDate: "2026-09-20", attempted: true, hostedUrl: "" } }), "2026-09-24").payStatus, "Card Failed");
  assert.equal(paymentFromSnapshot(snap({ subscription: { id: "s", status: "past_due", currentPeriodEnd: "2026-10-01", cancelAt: "", amount: 297, interval: "month" }, latestInvoice: null }), "2026-09-24").payStatus, "Overdue");
  const churn = paymentFromSnapshot(snap({ subscription: { id: "s", status: "canceled", currentPeriodEnd: "2026-09-01", cancelAt: "", amount: 297, interval: "month" } }), "2026-09-24");
  assert.equal(churn.group, "churned"); assert.equal(churn.nextBill, "");
  assert.equal(paymentFromSnapshot(snap({ subscription: null, latestInvoice: null }), "2026-09-24").payStatus, "No Billing Set Up");
  assert.equal(paymentFromSnapshot(snap({ latestInvoice: { id: "in_3", status: "open", amountDue: 297, paidAt: "", dueDate: "2026-09-30", attempted: false, hostedUrl: "" } }), "2026-09-24").payStatus, "Due Soon");
});

test("webhook signature verification", () => {
  const secret = "whsec_test"; const payload = '{"id":"evt_1"}'; const t = 1_790_000_000;
  const v1 = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${v1}`, secret, 300, t + 10), true);
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${v1}`, secret, 300, t + 1000), false, "outside tolerance");
  assert.equal(verifyStripeSignature(payload + " ", `t=${t},v1=${v1}`, secret, 300, t), false, "payload tampered");
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${v1}`, "other", 300, t), false, "wrong secret");
  assert.equal(verifyStripeSignature(payload, null, secret), false);
});
