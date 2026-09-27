import { NextResponse } from "next/server";
import { buildFeed, feedKeyMatches, repBySlug } from "@/lib/calls/followups";
import { getCallsPage } from "@/lib/calls/monday";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Private iCalendar feed: /api/team/followups/<rep>.ics?key=<feed key>. No cookie (calendar apps can't
// sign in); the key is the credential. Reads the Giveaway Leads board and emits one event per owned
// lead with a Next Follow-up. Calendar apps poll this on their own schedule.
export async function GET(req: Request, context: { params: Promise<{ rep: string }> }) {
  const slugRaw = (await context.params).rep;
  const slug = slugRaw.replace(/\.ics$/i, "").toLowerCase();
  const rep = repBySlug(slug);
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!rep || !feedKeyMatches(slug, key)) return new NextResponse("Not found", { status: 404 });
  try {
    const leads = [];
    let cursor: string | null = null;
    for (let page = 0; page < 4; page++) {
      const data = await getCallsPage(cursor);
      leads.push(...data.leads.filter((l) => (l.ownerIds || []).includes(rep.mondayId)));
      cursor = data.cursor; if (!cursor) break;
    }
    const body = buildFeed(rep, leads, new URL(req.url).origin);
    return new NextResponse(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `inline; filename="followups-${slug}.ics"`, "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" } });
  } catch {
    // Keep the calendar app from wiping the subscription on a Monday hiccup: it retries later.
    return new NextResponse("Temporarily unavailable", { status: 503, headers: { "Retry-After": "600" } });
  }
}
