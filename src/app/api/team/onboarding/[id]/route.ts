import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { onboardingOwners } from "@/lib/onboarding/config";
import { linkActive } from "@/lib/onboarding/intake";
import { applyPatch, getOnboarding, liveGbpForOnboarding } from "@/lib/onboarding/pipeline";
import { listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import { readHandoff, readIntake } from "@/lib/onboarding/store";
import type { OnboardingDetail } from "@/lib/onboarding/types";
import { validateItemId, validatePatch } from "@/lib/onboarding/validation";
import { failure, unauthorized } from "@/lib/onboarding/http";
import { onboardingDetailGhl, patchOnboardingGhl } from "@/lib/desk/onboarding";
import { assertMayWriteGhl, backendForRecordId, validateRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";
import { validateDeskPatch } from "@/lib/desk/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };
/** Staff see the intake record minus the token hash (the hash is not secret-bearing, but it does not belong in the browser). */
function stripToken(record: NonNullable<Awaited<ReturnType<typeof readIntake>>>) { const copy = { ...record } as Partial<typeof record>; delete copy.tokenHash; return copy as Omit<typeof record, "tokenHash">; }

export async function GET(_req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    const rawId = (await context.params).id;
    // A GoHighLevel contact id always goes to GoHighLevel; a Monday item id follows DESK_BACKEND (see src/lib/desk/switch.ts).
    if (backendForRecordId(rawId) === "ghl") return NextResponse.json(await onboardingDetailGhl(validateRecordId(rawId)), { headers });
    const id = validateItemId(rawId);
    const { row: stored, history } = await getOnboarding(id);
    const key = stored.leadId || (stored.handoffId ? `manual-${stored.handoffId}` : "");
    const [record, intake, live, gbpLocations] = await Promise.all([
      key ? readHandoff(key).catch(() => null) : Promise.resolve(null), readIntake(id).catch(() => null),
      liveGbpForOnboarding(stored), // Search Atlas read + auto-promotion to Verified; never throws for a Search Atlas failure
      searchAtlasConnected() ? listLocations().catch(() => []) : Promise.resolve([]),
    ]);
    const row = live.row;
    const detail: OnboardingDetail = {
      row, history, record: record?.itemId === id ? record : null,
      intake: intake ? { ...stripToken(intake), linkActive: linkActive(intake) } : null,
      owners: onboardingOwners(),
      gbp: live.card, gbpLocations, searchAtlasConnected: searchAtlasConnected(),
    };
    return NextResponse.json(detail, { headers });
  } catch (error) { return failure(error); }
}

/** One change at a time, guarded by the record version the desk last saw. */
export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const rawId = (await context.params).id;
    if (backendForRecordId(rawId) === "ghl") {
      const session = await teamSession();
      assertMayWriteGhl(isOwnerEmail(session?.email));
      return NextResponse.json({ row: await patchOnboardingGhl(validateRecordId(rawId), validateDeskPatch(await readCallBody(req)), actorFor(session?.email)) }, { headers });
    }
    const id = validateItemId(rawId);
    const patch = validatePatch(await readCallBody(req));
    return NextResponse.json({ row: await applyPatch(id, patch) }, { headers });
  } catch (error) { return failure(error); }
}
