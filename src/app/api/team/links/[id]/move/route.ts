import { NextResponse } from "next/server";
import { teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { moveLink } from "@/lib/desk/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
type Context = { params: Promise<{ id: string }> };

// Reorder on the Back Office Links tab (Oct 9 2026; src/lib/desk/links.ts → moveLink).
//   POST  { after: "<id of the link it now follows>" | null }   (null = to the top)
// One move, applied to the list as it is when it lands, so a reorder from a stale screen never undoes someone's
// add, edit or delete. Team sign-in; same-origin JSON only. The answer is the whole list, in its new order.
export async function POST(req: Request, context: Context) {
  try {
    if (!(await teamSession())) return unauthorized();
    assertSameOrigin(req);
    const { id } = await context.params;
    return NextResponse.json(await moveLink(id, await readCallBody(req)), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
