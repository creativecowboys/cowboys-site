import { NextRequest, NextResponse } from "next/server";
import { CallDeskError } from "@/lib/calls/validation";
import { buildConsentRecord, saveConsent, validateConsent } from "@/lib/howdy-sms/consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Writes one Howdy-update SMS consent record to the site's private Blob store. Write only:
// there is no GET, and nothing public can read a record back. The record is evidence for review,
// not an enrolment — no number is texted until a person matches it to a real client account and
// the Howdy platform's send flags are switched on.
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const raw = (body ?? {}) as Record<string, unknown>;

    // Spam bots get a fake success so they don't retry or adapt — and nothing is stored.
    // Same two traps the contact form uses: a hidden field no person can see, and a clock.
    const { website_url, elapsed_ms } = raw;
    if (typeof website_url === "string" && website_url.trim() !== "") {
      console.log("SMS consent spam blocked (honeypot)");
      return NextResponse.json({ success: true, status: "pending_review" });
    }
    if (typeof elapsed_ms === "number" && elapsed_ms >= 0 && elapsed_ms < 3000) {
      console.log(`SMS consent spam blocked (too fast): ${elapsed_ms}ms`);
      return NextResponse.json({ success: true, status: "pending_review" });
    }

    const form = validateConsent(raw);
    const record = buildConsentRecord(form, {
      receivedAt: new Date().toISOString(),
      origin: "website-form",
      source: "/sms-optin",
      remoteIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      userAgent: request.headers.get("user-agent") || "",
    });

    await saveConsent(record);
    // Never log the record itself: it holds a client's name, email and mobile number.
    console.log(`SMS consent stored for review (${record.consentVersion})`);

    return NextResponse.json({ success: true, status: "pending_review" });
  } catch (error) {
    if (error instanceof CallDeskError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("SMS consent API error:", error);
    return NextResponse.json({ error: "Server error. Nothing was saved — please try again." }, { status: 500 });
  }
}
