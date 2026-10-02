import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { CallDeskError } from "@/lib/calls/validation";
import { retryOnboarding } from "@/lib/onboarding/handoff";
import { getOnboarding } from "@/lib/onboarding/pipeline";
import { validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, unauthorized } from "@/lib/onboarding/http";
import { retryOnboardingGhl } from "@/lib/desk/onboarding";
import { assertMayWriteGhl, backendForRecordId, validateRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const headers = { "Cache-Control": "private, no-store" };

/** Re-run only the handoff steps that did not complete (summary note, checklist, source lead, intake record). */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const rawId = (await context.params).id;
    if (backendForRecordId(rawId) === "ghl") {
      const session = await teamSession();
      assertMayWriteGhl(isOwnerEmail(session?.email));
      const retried = await retryOnboardingGhl(validateRecordId(rawId), actorFor(session?.email));
      return NextResponse.json(retried, { status: retried.pending.length ? 202 : 200, headers });
    }
    const id = validateItemId(rawId);
    const { row } = await getOnboarding(id);
    const key = row.leadId || (row.handoffId ? `manual-${row.handoffId}` : "");
    if (!key) throw new CallDeskError("This client was created in Monday by hand, so there is nothing to retry.", 400);
    const result = await retryOnboarding(key);
    if (result.itemId !== id) throw new CallDeskError("The stored handoff points at a different Monday record. Check the Onboarding Pipeline board.", 409);
    return NextResponse.json(result, { status: result.pending.length ? 202 : 200, headers });
  } catch (error) { return failure(error); }
}
