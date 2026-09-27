import { NextResponse } from "next/server";
import { teamSession } from "@/lib/team-auth";
import { feedKey, repByEmail, REPS } from "@/lib/calls/followups";
import { teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The signed-in rep's own subscribe link (owners also get everyone's, for setup help). */
export async function GET(req: Request) {
  const session = await teamSession();
  if (!session) return unauthorized();
  const origin = new URL(req.url).origin;
  const mine = repByEmail(session.email);
  const url = (slug: string) => `${origin}/api/team/followups/${slug}.ics?key=${feedKey(slug)}`;
  const isOwner = ["dave@creativecowboys.co", "josh@creativecowboys.co"].includes(session.email);
  return NextResponse.json({
    me: mine ? { name: mine.name, slug: mine.slug, url: url(mine.slug), webcal: url(mine.slug).replace(/^https?:/, "webcal:") } : null,
    all: isOwner ? REPS.map((r) => ({ name: r.name, slug: r.slug, url: url(r.slug), webcal: url(r.slug).replace(/^https?:/, "webcal:") })) : [],
  }, { headers: teamHeaders });
}
