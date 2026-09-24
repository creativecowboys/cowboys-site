import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { failure, unauthorized } from "@/lib/onboarding/http";
import { listOnboarding } from "@/lib/onboarding/pipeline";
import { startOnboarding } from "@/lib/onboarding/handoff";
import { validateHandoff } from "@/lib/onboarding/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const headers = { "Cache-Control": "private, no-store" };


/** Onboarding overview: every client on the Onboarding Pipeline board (template row excluded), 50 per page. */
export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    return NextResponse.json(await listOnboarding(new URL(req.url).searchParams.get("cursor")), { headers });
  } catch (error) { return failure(error); }
}

/** Start onboarding for a giveaway lead. Idempotent on (leadId, handoffId); partial failures come back as `pending`. */
export async function POST(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const form = validateHandoff(await readCallBody(req));
    const result = await startOnboarding(form);
    return NextResponse.json(result, { status: result.pending.length ? 202 : 201, headers });
  } catch (error) { return failure(error); }
}
