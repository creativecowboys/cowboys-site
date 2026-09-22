import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { getCallsPage } from "@/lib/calls/monday";
import { CallDeskError } from "@/lib/calls/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    const data = await getCallsPage(new URL(req.url).searchParams.get("cursor"));
    return NextResponse.json(data, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CallDeskError ? error.message : "The lead list could not be loaded. Please try again." }, { status: error instanceof CallDeskError ? error.status : 500, headers });
  }
}
