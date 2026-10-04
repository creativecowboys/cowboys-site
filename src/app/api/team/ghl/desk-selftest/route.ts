import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { deskSelfTest } from "@/lib/desk/admin";
import { deskTaskSelfTest } from "@/lib/desk/tasks";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Owner-only. Proves the desk's value shapes against the real GoHighLevel API on the designated TEST CONTACT only:
 * POST { dryRun: true } (the default) lists the sample each "Desk …" field would get; { dryRun: false } writes them, reads
 * them back, clears them, restores what was there, round-trips a desk tag and leaves one labelled note (once a day).
 * Run it after the field setup and before importing anything. It never touches a client.
 * { scope: "tasks", dryRun: false } (Oct 4 2026) proves the client task list instead, on the same test contact: adds, retries,
 * reads back, ticks off and reopens tasks, records what GoHighLevel does with a task that has no due date, and removes
 * every task it created (only those).
 */
export async function POST(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    if (!isOwnerEmail(session.email)) throw new CallDeskError("Only an owner can run the desk self-test.", 403);
    assertSameOrigin(req);
    const raw = await readCallBody(req);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CallDeskError("Send a JSON object.", 400);
    const body = raw as { dryRun?: unknown; scope?: unknown };
    // A typo must not run something else for real: only these two keys, and dryRun only as true or false.
    if (Object.keys(body).some((k) => k !== "dryRun" && k !== "scope")) throw new CallDeskError("Only dryRun and scope are accepted. Nothing was run.", 400);
    if (body.dryRun !== undefined && typeof body.dryRun !== "boolean") throw new CallDeskError("dryRun is true or false. Nothing was run.", 400);
    if (body.scope !== undefined && body.scope !== "tasks") throw new CallDeskError("scope is either left out (the field self-test) or \"tasks\". Nothing was run.", 400);
    const dryRun = body?.dryRun !== false;
    return NextResponse.json(body?.scope === "tasks" ? await deskTaskSelfTest(dryRun, actorFor(session.email)) : await deskSelfTest(dryRun, actorFor(session.email)), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
