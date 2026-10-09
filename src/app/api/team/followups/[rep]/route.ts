import { NextResponse } from "next/server";
import { buildFeed, feedKeyMatches, repBySlug } from "@/lib/calls/followups";
import { defaultBackend, getCallsPage, repIdFor } from "@/lib/calls/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Private iCalendar feed: /api/team/followups/<rep>.ics?key=<feed key>. No cookie (calendar apps can't
// sign in); the key is the credential. Reads the lead roster (Monday board or GHL contacts, per
// LEADS_BACKEND) and emits one event per owned lead with a Next Follow-up — except leads that are off the
// call list (Not Interested, or a do-not-contact / fake-lead tag in GHL), which buildFeed skips. Calendar apps poll this on
// their own schedule. Event UIDs carry the lead id, so a lead keeps its event across the cutover only
// if its id is the same — after the Monday → GHL import the events are re-issued under the GHL ids.
// Unlike the Sales tab, the feed keeps businesses that moved on to the Onboarding or Clients tab (it does not pass
// hideDeskRecords): a handed-off client's booked kickoff or check-in is a real appointment (Dave, Sep 28 2026). Its link
// opens the business on that tab.
export async function GET(req: Request, context: { params: Promise<{ rep: string }> }) {
  const slugRaw = (await context.params).rep;
  const slug = slugRaw.replace(/\.ics$/i, "").toLowerCase();
  const rep = repBySlug(slug);
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!rep || !feedKeyMatches(slug, key)) return new NextResponse("Not found", { status: 404 });
  try {
    const backend = defaultBackend();
    const mine = repIdFor(rep.name, backend);
    const leads = [];
    let cursor: string | null = null;
    for (let page = 0; page < 4; page++) {
      const data = await getCallsPage(cursor, backend);
      leads.push(...data.leads.filter((l) => (l.ownerIds || []).includes(mine)));
      cursor = data.cursor; if (!cursor) break;
    }
    const body = buildFeed(rep, leads, new URL(req.url).origin);
    return new NextResponse(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `inline; filename="followups-${slug}.ics"`, "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" } });
  } catch {
    // Keep the calendar app from wiping the subscription on a Monday hiccup: it retries later.
    return new NextResponse("Temporarily unavailable", { status: 503, headers: { "Retry-After": "600" } });
  }
}
