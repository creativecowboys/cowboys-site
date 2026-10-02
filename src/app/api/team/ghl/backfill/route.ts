import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { backfillLeadSource } from "@/lib/ghl/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Owner-only. POST { dryRun: true } counts; { dryRun: false, limit: 150 } sets Lead Source where empty, `limit` contacts per call. Idempotent. */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the Lead Source backfill.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as { dryRun?: unknown; limit?: unknown };
    const dryRun = body?.dryRun !== false;
    const limit = typeof body?.limit === "number" && body.limit > 0 ? Math.min(body.limit, 400) : 150;
    return NextResponse.json(await backfillLeadSource(dryRun, limit), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
