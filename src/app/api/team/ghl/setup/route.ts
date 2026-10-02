import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { setupFields } from "@/lib/ghl/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Owner-only. POST { dryRun: true } lists the desk custom fields still missing in GHL; { dryRun: false } creates them. Never edits an existing field. */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can set up GoHighLevel fields.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as { dryRun?: unknown };
    const dryRun = body?.dryRun !== false;
    return NextResponse.json(await setupFields(dryRun), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
