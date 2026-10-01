import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { getCallsPage, leadsBackend } from "@/lib/calls/backend";
import { CallDeskError } from "@/lib/calls/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // a full-board page (up to 500 leads) can take a few seconds
const headers = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    // LEADS_BACKEND decides the roster; `?backend=ghl` lets an owner preview the GHL desk before the flip.
    const data = await getCallsPage(new URL(req.url).searchParams.get("cursor"), leadsBackend(req));
    return NextResponse.json(data, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CallDeskError ? error.message : "The lead list could not be loaded. Please try again." }, { status: error instanceof CallDeskError ? error.status : 500, headers });
  }
}
