import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { migrateDesk, parseMigrateBody } from "@/lib/desk/migrate";
import { assertForceAllowed } from "@/lib/desk/switch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Owner-only, one-time cutover tool (Phase 2): the Monday Onboarding Pipeline and Active Clients boards → GoHighLevel contacts.
 * POST { dryRun: true } (the default) reports how every row would match and what would be written; nothing is changed.
 * { dryRun: false, onlyIds: ["<monday item id>"] } imports one row as a trial; { dryRun: false, offset, limit } a batch —
 * repeat with the returned nextOffset until it is null. Safe to repeat: a row already imported is skipped unless `force`.
 * `map` pins a Monday row to a contact ({ "<monday item id>": "<contact id>" }) when the report says it is unmatched;
 * `boards` limits the run to ["onboarding"] or ["clients"]; `includeOffDesk` also takes Active Clients rows without
 * "Team desk" checked — the agency's long-standing clients, which come over marked as LEGACY clients (Oct 2 2026);
 * `createNameOnly` allows a new contact for a row with no email and no phone (the business name becomes the contact's
 * company name; `businessAsContactName` also puts it in the contact's own name, for the one case where GoHighLevel will
 * not take a contact with nobody's name). Every row of the report says exactly what it writes (`values`, `contact`, `tags`).
 * Once DESK_BACKEND=ghl, `force` is refused unless `overwriteLiveDesk: true` comes with it: it re-writes each contact's desk
 * fields from what the old boards say, over whatever the team has done on the GoHighLevel desk since.
 */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the Monday → GoHighLevel desk import.", 403);
    assertSameOrigin(req);
    // Checked strictly (parseMigrateBody): a malformed onlyIds / map / option name is refused, never quietly dropped — a filter that
    // silently became "no filter" would run, and with createNameOnly create contacts for, the whole board.
    const { overwriteLiveDesk, ...options } = parseMigrateBody(await readCallBody(req));
    assertForceAllowed({ dryRun: options.dryRun, force: !!options.force, overwriteLiveDesk });
    return NextResponse.json(await migrateDesk({ ...options, origin: new URL(req.url).origin }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
