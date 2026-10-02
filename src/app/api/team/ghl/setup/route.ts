import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { setupFields, setupSalesOptions } from "@/lib/ghl/admin";
import { deskSetup } from "@/lib/desk/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // the desk scope creates 43 fields one at a time; a run that is cut short is safe to repeat (it only creates what is missing)

/** Owner-only. POST { dryRun: true } lists the desk custom fields still missing in GHL; { dryRun: false } creates them. Never edits an existing field.
 *  `scope: "desk"` does the same for the Onboarding / Clients desk's "Desk …" fields (Phase 2) and reports whether a desk tag name is already taken;
 *  without it the call is the Sales-tab setup, exactly as before.
 *  `scope: "sales-options"` (Oct 2 2026) is the one call that changes an existing field, and only by adding: it reports which option the Sales
 *  dropdowns the desk writes (Outreach Status, Interest) are missing, and with { dryRun: false } appends them — see ensureSalesOptions.
 *  Any other scope is refused, so a mistyped one cannot run a different setup than the one that was meant. */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can set up GoHighLevel fields.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as { dryRun?: unknown; scope?: unknown };
    const dryRun = body?.dryRun !== false;
    if (body?.scope === "desk") return NextResponse.json(await deskSetup(dryRun), { headers: teamHeaders });
    if (body?.scope === "sales-options") return NextResponse.json(await setupSalesOptions(dryRun), { headers: teamHeaders });
    if (body?.scope !== undefined && body.scope !== null) throw new CallDeskError('Unknown scope. Leave it out for the Sales fields, or send "desk" or "sales-options".', 400);
    return NextResponse.json(await setupFields(dryRun), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
