import { NextResponse } from "next/server";
import { findClientByStripeCustomer, syncClientFromStripe } from "@/lib/clients/board";
import { verifyStripeSignature } from "@/lib/clients/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Stripe → Monday. Signature-verified with STRIPE_WEBHOOK_SECRET. We do not trust the event body for
// state: on any relevant event we re-read the customer from Stripe and write the result to the board
// (same code path as the desk's "Sync from Stripe"), so replays and out-of-order deliveries are harmless.
const RELEVANT = new Set(["invoice.paid", "invoice.payment_succeeded", "invoice.payment_failed", "invoice.marked_uncollectible", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.resumed", "charge.refunded"]);

export async function POST(req: Request) {
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  let event: { id?: string; type?: string; data?: { object?: { customer?: unknown; customer_email?: unknown; email?: unknown; id?: unknown; object?: string } } };
  try { event = JSON.parse(payload); } catch { return NextResponse.json({ error: "bad payload" }, { status: 400 }); }
  if (!event.type || !RELEVANT.has(event.type)) return NextResponse.json({ ignored: event.type || "unknown" });
  const obj = event.data?.object || {};
  const customerId = typeof obj.customer === "string" ? obj.customer : typeof obj.id === "string" && obj.object === "customer" ? obj.id : "";
  if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) return NextResponse.json({ ignored: "no customer" });
  const email = typeof obj.customer_email === "string" ? obj.customer_email : typeof obj.email === "string" ? obj.email : null;
  try {
    const client = await findClientByStripeCustomer(customerId, email);
    if (!client) return NextResponse.json({ ignored: "customer not on the Team desk board" });
    const r = await syncClientFromStripe(client.id);
    return NextResponse.json({ ok: true, client: client.id, changed: r.changed });
  } catch (e) {
    // 500 makes Stripe retry later — the right behaviour when Monday is briefly unavailable.
    return NextResponse.json({ error: e instanceof Error ? e.message : "sync failed" }, { status: 500 });
  }
}
