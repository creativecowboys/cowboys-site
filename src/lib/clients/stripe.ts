import { createHmac, timingSafeEqual } from "node:crypto";
import { CallDeskError } from "@/lib/calls/validation";
import type { StripeSnapshot } from "./types";

// Read-only Stripe access over REST (no SDK). STRIPE_SECRET_KEY should be a *restricted* key with read
// on customers, subscriptions and invoices. Never logged, never sent to the browser.
const API = "https://api.stripe.com/v1";
export const stripeConnected = () => !!process.env.STRIPE_SECRET_KEY;

async function stripe<T>(path: string): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new CallDeskError("Stripe is not connected to the desk yet. Add the restricted key in Vercel.", 503);
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new CallDeskError(res.status === 401 ? "Stripe rejected the key. Check the restricted key in Vercel." : `Stripe could not answer right now (${res.status}).`, 502);
  return res.json() as Promise<T>;
}
const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString().slice(0, 10) : "");

type Customer = { id: string; email: string | null; name: string | null; deleted?: boolean };
type Subscription = { id: string; status: string; current_period_end: number; cancel_at: number | null; items: { data: { price: { unit_amount: number | null; recurring: { interval: string } | null } }[] } };
type Invoice = { id: string; status: string | null; amount_due: number; due_date: number | null; attempted: boolean; hosted_invoice_url: string | null; status_transitions: { paid_at: number | null } };

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const data = await stripe<{ data: Customer[] }>(`/customers?email=${encodeURIComponent(email.toLowerCase())}&limit=3`);
  return data.data.find((c) => !c.deleted) || null;
}

export async function snapshot(customerId: string): Promise<StripeSnapshot> {
  if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) throw new CallDeskError("Invalid Stripe customer id.", 400);
  const [customer, subs, invoices] = await Promise.all([
    stripe<Customer>(`/customers/${customerId}`),
    stripe<{ data: Subscription[] }>(`/subscriptions?customer=${customerId}&status=all&limit=10`),
    stripe<{ data: Invoice[] }>(`/invoices?customer=${customerId}&limit=5`),
  ]);
  // Prefer a live subscription; otherwise the most recent one so a cancellation still shows.
  const rank = (s: Subscription) => (["active", "trialing", "past_due", "unpaid"].includes(s.status) ? 0 : 1);
  const sub = [...subs.data].sort((a, b) => rank(a) - rank(b) || b.current_period_end - a.current_period_end)[0] || null;
  const inv = invoices.data[0] || null;
  return {
    customerId, email: customer.email || "", name: customer.name || "",
    subscription: sub ? { id: sub.id, status: sub.status, currentPeriodEnd: iso(sub.current_period_end), cancelAt: iso(sub.cancel_at), amount: (sub.items.data[0]?.price.unit_amount || 0) / 100, interval: sub.items.data[0]?.price.recurring?.interval || "" } : null,
    latestInvoice: inv ? { id: inv.id, status: inv.status || "", amountDue: inv.amount_due / 100, paidAt: iso(inv.status_transitions.paid_at), dueDate: iso(inv.due_date), attempted: inv.attempted, hostedUrl: inv.hosted_invoice_url || "" } : null,
    fetchedAt: new Date().toISOString(),
  };
}

/** Board labels derived from a snapshot. Pure so it can be unit tested. */
export function paymentFromSnapshot(s: StripeSnapshot, today = new Date().toISOString().slice(0, 10)): { payStatus: string; group: "issue" | "active" | "churned" | null; lastPayment: string; nextBill: string } {
  const sub = s.subscription; const inv = s.latestInvoice;
  const lastPaidInvoice = inv?.status === "paid" ? inv.paidAt : "";
  const nextBill = sub && ["active", "trialing", "past_due"].includes(sub.status) ? sub.currentPeriodEnd : "";
  if (!sub && !inv) return { payStatus: "No Billing Set Up", group: null, lastPayment: "", nextBill: "" };
  if (sub && ["canceled", "incomplete_expired"].includes(sub.status)) return { payStatus: inv?.status === "paid" ? "Paid / Current" : "No Billing Set Up", group: "churned", lastPayment: lastPaidInvoice, nextBill: "" };
  if (inv && inv.status === "open" && inv.attempted) return { payStatus: "Card Failed", group: "issue", lastPayment: "", nextBill };
  if ((sub && ["past_due", "unpaid"].includes(sub.status)) || (inv && inv.status === "open" && inv.dueDate && inv.dueDate < today)) return { payStatus: "Overdue", group: "issue", lastPayment: "", nextBill };
  if (inv && inv.status === "open") return { payStatus: "Due Soon", group: "active", lastPayment: "", nextBill: inv.dueDate || nextBill };
  if (sub && ["active", "trialing"].includes(sub.status)) return { payStatus: "Paid / Current", group: "active", lastPayment: lastPaidInvoice, nextBill };
  return { payStatus: inv?.status === "paid" ? "Paid / Current" : "No Billing Set Up", group: null, lastPayment: lastPaidInvoice, nextBill };
}

/** Verify a Stripe webhook signature (t=…,v1=… header, HMAC-SHA256 over `${t}.${payload}`). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string | undefined, toleranceSeconds = 300, now = Math.floor(Date.now() / 1000)): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t); const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1 || Math.abs(now - t) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected); const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
