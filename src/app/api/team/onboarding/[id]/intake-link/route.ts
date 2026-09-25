import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin } from "@/lib/calls/validation";
import { issueIntakeLink, revokeIntakeLink } from "@/lib/onboarding/intake";
import { validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };

/** Issue (or replace) the client's private intake link. The URL is returned once; only its hash is stored. */
export async function POST(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const id = validateItemId((await context.params).id);
    const origin = new URL(req.url).origin;
    return NextResponse.json(await issueIntakeLink(id, origin), { headers });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const id = validateItemId((await context.params).id);
    await revokeIntakeLink(id);
    return NextResponse.json({ revoked: true }, { headers });
  } catch (error) { return failure(error); }
}
