import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { migrateFromMonday } from "@/lib/ghl/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Owner-only, one-time cutover tool. POST { dryRun: true } reports how each Monday Giveaway Leads item would match a GHL
 *  contact (by Monday id already imported, email, phone, or create). { dryRun: false, offset, limit } writes a batch;
 *  repeat with the returned nextOffset. `onlyIds` restricts to listed Monday item ids (for a trial on one lead). */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the Monday → GoHighLevel import.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as { dryRun?: unknown; offset?: unknown; limit?: unknown; force?: unknown; onlyIds?: unknown };
    const onlyIds = Array.isArray(body?.onlyIds) ? body.onlyIds.filter((x): x is string => typeof x === "string" && /^\d{1,20}$/.test(x)).slice(0, 50) : undefined;
    return NextResponse.json(await migrateFromMonday({
      dryRun: body?.dryRun !== false,
      offset: typeof body?.offset === "number" ? body.offset : 0,
      limit: typeof body?.limit === "number" ? body.limit : 25,
      force: body?.force === true, onlyIds,
    }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
