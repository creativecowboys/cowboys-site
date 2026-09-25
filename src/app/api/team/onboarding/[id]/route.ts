import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { onboardingOwners } from "@/lib/onboarding/config";
import { linkActive } from "@/lib/onboarding/intake";
import { applyPatch, getOnboarding } from "@/lib/onboarding/pipeline";
import { readHandoff, readIntake } from "@/lib/onboarding/store";
import type { OnboardingDetail } from "@/lib/onboarding/types";
import { validateItemId, validatePatch } from "@/lib/onboarding/validation";
import { failure, unauthorized } from "@/lib/onboarding/http";

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
    const id = validateItemId((await context.params).id);
    const { row, history } = await getOnboarding(id);
    const [record, intake] = await Promise.all([row.leadId ? readHandoff(row.leadId).catch(() => null) : Promise.resolve(null), readIntake(id).catch(() => null)]);
    const detail: OnboardingDetail = {
      row, history, record: record?.itemId === id ? record : null,
      intake: intake ? { ...stripToken(intake), linkActive: linkActive(intake) } : null,
      owners: onboardingOwners(),
    };
    return NextResponse.json(detail, { headers });
  } catch (error) { return failure(error); }
}

/** One change at a time, guarded by the record version the desk last saw. */
export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const id = validateItemId((await context.params).id);
    const patch = validatePatch(await readCallBody(req));
    return NextResponse.json({ row: await applyPatch(id, patch) }, { headers });
  } catch (error) { return failure(error); }
}
