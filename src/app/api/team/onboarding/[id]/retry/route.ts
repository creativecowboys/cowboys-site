import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { CallDeskError } from "@/lib/calls/validation";
import { retryOnboarding } from "@/lib/onboarding/handoff";
import { getOnboarding } from "@/lib/onboarding/pipeline";
import { validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const headers = { "Cache-Control": "private, no-store" };

/** Re-run only the handoff steps that did not complete (summary note, checklist, source lead, intake record). */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const id = validateItemId((await context.params).id);
    const { row } = await getOnboarding(id);
    if (!row.leadId) throw new CallDeskError("This client was not created from a giveaway lead, so there is nothing to retry.", 400);
    const result = await retryOnboarding(row.leadId);
    if (result.itemId !== id) throw new CallDeskError("The stored handoff points at a different Monday record. Check the Onboarding Pipeline board.", 409);
    return NextResponse.json(result, { status: result.pending.length ? 202 : 200, headers });
  } catch (error) { return failure(error); }
}
