import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { diagnose, repTable } from "@/lib/ghl/admin";
import { deskDiagnose } from "@/lib/desk/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Read-only: what the site's GHL token can do, which desk fields exist, how many leads would show. Never writes. */
export async function GET() {
  try {
    if (!(await isTeam())) return unauthorized();
    // `desk` = the Onboarding / Clients desk on GoHighLevel (Phase 2): its fields, every field and tag on the location by owner, what it writes.
    const [base, desk] = await Promise.all([diagnose(), deskDiagnose().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }))]);
    return NextResponse.json({ ...base, reps: repTable(), desk }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
