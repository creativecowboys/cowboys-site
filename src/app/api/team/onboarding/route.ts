import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { failure, unauthorized } from "@/lib/onboarding/http";
import { listOnboarding } from "@/lib/onboarding/pipeline";
import { startOnboarding } from "@/lib/onboarding/handoff";
import { validateHandoff } from "@/lib/onboarding/validation";
import { listOnboardingGhl, startOnboardingGhl } from "@/lib/desk/onboarding";
import { assertMayWriteGhl, assertMondayOpen, deskBackend } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const headers = { "Cache-Control": "private, no-store" };


/** Onboarding overview: every client on the Onboarding Pipeline board (template row excluded), 50 per page. */
export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    // DESK_BACKEND decides the system; `?desk=ghl` lets the team preview the GoHighLevel desk before the flip.
    if (deskBackend(req) === "ghl") return NextResponse.json(await listOnboardingGhl(), { headers });
    return NextResponse.json(await listOnboarding(new URL(req.url).searchParams.get("cursor")), { headers });
  } catch (error) { return failure(error); }
}

/** Start onboarding for a giveaway lead. Idempotent on (leadId, handoffId); partial failures come back as `pending`. */
export async function POST(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const form = validateHandoff(await readCallBody(req));
    if (deskBackend(req) === "ghl") {
      const session = await teamSession();
      assertMayWriteGhl(isOwnerEmail(session?.email));
      const started = await startOnboardingGhl(form, { origin: new URL(req.url).origin, actor: actorFor(session?.email) });
      return NextResponse.json(started, { status: started.pending.length ? 202 : 201, headers });
    }
    assertMondayOpen(); // a no-op until DESK_BACKEND=ghl; after that `?desk=monday` cannot create a record on the old boards
    const result = await startOnboarding(form);
    return NextResponse.json(result, { status: result.pending.length ? 202 : 201, headers });
  } catch (error) { return failure(error); }
}
