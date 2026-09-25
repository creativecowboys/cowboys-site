import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { ensureIntake, indexFile, removeFile } from "@/lib/onboarding/intake";
import { validateFileCategory, validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

/** Staff: add a finished upload to the client's file list (idempotent). */
export async function POST(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const id = validateItemId((await context.params).id);
    const body = await readCallBody(req) as { pathname?: unknown; category?: unknown; name?: unknown };
    if (typeof body?.pathname !== "string" || body.pathname.length > 600) throw new CallDeskError("Upload details are missing.", 400);
    await ensureIntake(id);
    const record = await indexFile(id, body.pathname, validateFileCategory(body.category), typeof body.name === "string" ? body.name : "");
    return NextResponse.json({ files: record.files }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

/** Staff: remove a file from the client's store. */
export async function DELETE(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const id = validateItemId((await context.params).id);
    const record = await ensureIntake(id);
    const key = new URL(req.url).searchParams.get("key") || "";
    const updated = await removeFile(record, key);
    return NextResponse.json({ files: updated.files }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
