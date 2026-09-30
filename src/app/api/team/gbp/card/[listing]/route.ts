import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { CallDeskError } from "@/lib/calls/validation";
import { gbpCard } from "@/lib/gbp/searchatlas";
import { parseListingId } from "@/lib/gbp/state";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Live card for one listing (full read: location, reviews, posts). ?fresh=1 bypasses the 10-minute cache. Read-only. */
export async function GET(req: Request, context: { params: Promise<{ listing: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    const id = parseListingId((await context.params).listing);
    if (!id) throw new CallDeskError("Invalid listing id.", 400);
    const fresh = new URL(req.url).searchParams.get("fresh") === "1";
    return NextResponse.json(await gbpCard(id, { detail: true, fresh }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
