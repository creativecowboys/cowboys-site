import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { issueIntakeLink, revokeIntakeLink } from "@/lib/onboarding/intake";
import { validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, unauthorized } from "@/lib/onboarding/http";
import { issueIntakeLinkGhl, scopeForRecord } from "@/lib/desk/intake";
import { assertMayWriteGhl, backendForRecordId, validateRecordId } from "@/lib/desk/switch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };

/** Issue (or replace) the client's private intake link. The URL is returned once; only its hash is stored. */
export async function POST(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const rawId = (await context.params).id;
    const origin = new URL(req.url).origin;
    if (backendForRecordId(rawId) === "ghl") {
      assertMayWriteGhl(isOwnerEmail((await teamSession())?.email));
      return NextResponse.json(await issueIntakeLinkGhl(validateRecordId(rawId), origin), { headers });
    }
    const id = validateItemId(rawId);
    return NextResponse.json(await issueIntakeLink(id, origin), { headers });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const rawId = (await context.params).id;
    if (backendForRecordId(rawId) === "ghl") {
      assertMayWriteGhl(isOwnerEmail((await teamSession())?.email));
      await revokeIntakeLink(await scopeForRecord(validateRecordId(rawId))); // the link lives in storage under the client's file scope
      return NextResponse.json({ revoked: true }, { headers });
    }
    const id = validateItemId(rawId);
    await revokeIntakeLink(id);
    return NextResponse.json({ revoked: true }, { headers });
  } catch (error) { return failure(error); }
}
