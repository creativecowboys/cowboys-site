import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { diagnose, repTable } from "@/lib/ghl/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Read-only: what the site's GHL token can do, which desk fields exist, how many leads would show. Never writes. */
export async function GET() {
  try {
    if (!(await isTeam())) return unauthorized();
    return NextResponse.json({ ...(await diagnose()), reps: repTable() }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
