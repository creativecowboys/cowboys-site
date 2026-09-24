import { NextResponse } from "next/server";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { clientView, indexFile, removeFile, resolveToken } from "@/lib/onboarding/intake";
import { validateFileCategory, validateToken } from "@/lib/onboarding/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
type Context = { params: Promise<{ token: string }> };

function failure(error: unknown) {
  const known = error instanceof CallDeskError;
  return NextResponse.json({ error: known ? error.message : "Something went wrong on our side. Please try again." }, { status: known ? error.status : 500, headers });
}

/** Add a finished upload to the client's file list (idempotent). The blob must already exist under their prefix. */
export async function POST(req: Request, context: Context) {
  try {
    assertSameOrigin(req);
    const record = await resolveToken(validateToken((await context.params).token));
    const body = await readCallBody(req) as { pathname?: unknown; category?: unknown; name?: unknown };
    if (typeof body?.pathname !== "string" || body.pathname.length > 600) throw new CallDeskError("Upload details are missing.", 400);
    const updated = await indexFile(record.itemId, body.pathname, validateFileCategory(body.category), typeof body.name === "string" ? body.name : "");
    return NextResponse.json(clientView(updated), { headers });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || origin !== new URL(req.url).origin) throw new CallDeskError("This request must come from the intake page.", 403);
    const record = await resolveToken(validateToken((await context.params).token));
    const key = new URL(req.url).searchParams.get("key") || "";
    return NextResponse.json(clientView(await removeFile(record, key)), { headers });
  } catch (error) { return failure(error); }
}
