import { NextRequest, NextResponse } from "next/server";
import { issueMagicLink, normalizeEmail, safeNext } from "@/lib/team-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Email-only sign-in: POST { email, next? } → a one-time link is emailed if the address is on the team list.
// The response is the same whether or not the address is known, so the list cannot be probed.
export async function POST(req: NextRequest) {
  let body: { email?: unknown; next?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const email = normalizeEmail(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter your work email address." }, { status: 400 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Sign in from the site itself." }, { status: 403 });
  try {
    const result = await issueMagicLink(email, req.nextUrl.origin, safeNext(typeof body.next === "string" ? body.next : ""));
    if (result === "unconfigured") return NextResponse.json({ error: "Sign-in email is not configured on this deployment yet." }, { status: 503 });
    // "sent", "not-team" and "throttled" all read the same to the browser.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The sign-in email could not be sent right now. Try again in a minute." }, { status: 502 });
  }
}
