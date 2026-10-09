import { NextResponse } from "next/server";
import { teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { deleteLink, editLink } from "@/lib/desk/links";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
type Context = { params: Promise<{ id: string }> };

// One saved link on the Back Office Links tab (src/lib/desk/links.ts).
//   PATCH   change its name, address or note   { name, url, note, rev }   (rev = the version on screen; 409 if it moved)
//   DELETE  delete it at once (one click on the tab, like notes)   {}
// Team sign-in for both; same-origin JSON only. Every answer is the whole list.
export async function PATCH(req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    assertSameOrigin(req);
    const { id } = await context.params;
    const actor = actorFor(session.email);
    return NextResponse.json(await editLink(id, await readCallBody(req), { name: actor.name, email: actor.email }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request, context: Context) {
  try {
    if (!(await teamSession())) return unauthorized();
    assertSameOrigin(req);
    const { id } = await context.params;
    return NextResponse.json(await deleteLink(id), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
