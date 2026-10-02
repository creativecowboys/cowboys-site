import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { migrateDesk } from "@/lib/desk/migrate";

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
 * "Team desk" checked; `createNameOnly` allows a new contact for a row with no email and no phone.
 */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the Monday → GoHighLevel desk import.", 403);
    assertSameOrigin(req);
    const body = (await readCallBody(req)) as Record<string, unknown>;
    const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^\d{1,20}$/.test(x)).slice(0, 100) : undefined);
    const map: Record<string, string> = {};
    if (body?.map && typeof body.map === "object" && !Array.isArray(body.map)) {
      for (const [k, v] of Object.entries(body.map as Record<string, unknown>).slice(0, 100)) if (/^\d{1,20}$/.test(k) && typeof v === "string" && /^[A-Za-z0-9]{10,64}$/.test(v)) map[k] = v;
    }
    const boards = Array.isArray(body?.boards) ? body.boards.filter((b): b is "onboarding" | "clients" => b === "onboarding" || b === "clients") : undefined;
    return NextResponse.json(await migrateDesk({
      dryRun: body?.dryRun !== false,
      offset: typeof body?.offset === "number" ? body.offset : 0,
      limit: typeof body?.limit === "number" ? body.limit : 25,
      force: body?.force === true, onlyIds: ids(body?.onlyIds), map, boards,
      includeOffDesk: body?.includeOffDesk === true, createNameOnly: body?.createNameOnly === true,
      origin: new URL(req.url).origin,
    }), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
