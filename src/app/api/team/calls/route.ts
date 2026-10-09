import { NextResponse } from "next/server";
import { teamSession } from "@/lib/team-auth";
import { signedInAs } from "@/lib/desk/team";
import { getCallsPage, leadsBackend } from "@/lib/calls/backend";
import { CallDeskError } from "@/lib/calls/validation";
import { deskBackend } from "@/lib/desk/switch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // a full-board page (up to 500 leads) can take a few seconds
const headers = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    // LEADS_BACKEND decides the roster; `?backend=ghl` lets an owner preview the GHL desk before the flip. With the Onboarding and
    // Clients tabs on GoHighLevel too (DESK_BACKEND, or `?desk=` on the request), the businesses on those tabs are left off the list.
    const data = await getCallsPage(new URL(req.url).searchParams.get("cursor"), leadsBackend(req), { hideDeskRecords: deskBackend(req) === "ghl" });
    // `me` is who this sign-in is, for the desk's top bar (the name beside Sign out). The roster is the one request the desk
    // makes on every load, so the name rides along with it; it is not part of either lead system's answer.
    return NextResponse.json({ ...data, me: signedInAs(session.email) }, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CallDeskError ? error.message : "The lead list could not be loaded. Please try again." }, { status: error instanceof CallDeskError ? error.status : 500, headers });
  }
}
