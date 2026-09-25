import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { listClients, syncClientFromStripe } from "@/lib/clients/board";
import { stripeConnected } from "@/lib/clients/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Nightly reconcile (vercel.json cron). Vercel sends `Authorization: Bearer <CRON_SECRET>`; anything else is refused.
// Re-reads every Team-desk client that has a Stripe customer id (or an email to find one) so a missed
// webhook cannot leave a stale "Paid / Current" on the board.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization") || "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const a = Buffer.from(header.slice(7)); const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!stripeConnected()) return NextResponse.json({ skipped: "stripe not connected" });
  const results: { id: string; name: string; changed?: string[]; error?: string }[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data = await listClients(cursor);
    for (const row of data.rows) {
      if (!row.stripeCustomer && !row.email) continue;
      try { const r = await syncClientFromStripe(row.id); results.push({ id: row.id, name: row.name, changed: r.changed }); }
      catch (e) { results.push({ id: row.id, name: row.name, error: e instanceof Error ? e.message : "failed" }); }
    }
    cursor = data.cursor; if (!cursor) break;
  }
  return NextResponse.json({ at: new Date().toISOString(), results });
}
