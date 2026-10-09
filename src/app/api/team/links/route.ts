import { NextResponse } from "next/server";
import { teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { addLink, listLinks } from "@/lib/desk/links";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// The Back Office Links tab (Oct 9 2026): the team's shared list of saved links (src/lib/desk/links.ts).
//   GET   every saved link, A to Z
//   POST  add one   { id: "<uuid made by the browser>", name, url, note }
// Team sign-in for both (the middleware does not cover /api, so this route checks the cookie itself). Writes must come
// from the Back Office page itself (same origin, JSON). Every answer is the whole list, so the tab simply replaces it.
export async function GET() {
  try {
    if (!(await teamSession())) return unauthorized();
    return NextResponse.json(await listLinks(), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    assertSameOrigin(req);
    const actor = actorFor(session.email);
    return NextResponse.json(await addLink(await readCallBody(req), { name: actor.name, email: actor.email }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
