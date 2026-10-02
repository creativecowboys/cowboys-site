import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { deskSelfTest } from "@/lib/desk/admin";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Owner-only. Proves the desk's value shapes against the real GoHighLevel API on the designated TEST CONTACT only:
 * POST { dryRun: true } (the default) lists the sample each "Desk …" field would get; { dryRun: false } writes them, reads
 * them back, clears them, restores what was there, round-trips a desk tag and leaves one labelled note (once a day).
 * Run it after the field setup and before importing anything. It never touches a client.
 */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the desk self-test.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as { dryRun?: unknown };
    return NextResponse.json(await deskSelfTest(body?.dryRun !== false, actorFor(session.email)), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
