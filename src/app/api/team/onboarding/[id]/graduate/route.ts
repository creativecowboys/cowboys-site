import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { CallDeskError, readCallBody } from "@/lib/calls/validation";
import { graduateFromOnboarding } from "@/lib/clients/board";
import { getOnboarding } from "@/lib/onboarding/pipeline";
import { validateItemId } from "@/lib/onboarding/validation";
import { assertOrigin, failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { graduateGhl } from "@/lib/desk/onboarding";
import { assertMayWriteGhl, backendForRecordId, validateRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Mark launched → create (or find) the Active Clients row for this onboarding record. Body: { managerId?, expectedUpdatedAt } */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const rawId = (await context.params).id;
    if (backendForRecordId(rawId) === "ghl") {
      const session = await teamSession();
      assertMayWriteGhl(isOwnerEmail(session?.email));
      // The desk's button sends no body; a body, when there is one, may name the account manager and the version it saw.
      const text = await req.text().catch(() => "");
      let sent: { managerId?: unknown; expectedUpdatedAt?: unknown } = {};
      if (text.trim()) { try { sent = JSON.parse(text.slice(0, 2000)); } catch { throw new CallDeskError("Invalid request.", 400); } }
      const graduated = await graduateGhl(validateRecordId(rawId), { managerId: typeof sent?.managerId === "string" ? sent.managerId.slice(0, 40) : "", expectedUpdatedAt: typeof sent?.expectedUpdatedAt === "string" ? sent.expectedUpdatedAt.slice(0, 40) : "" }, actorFor(session?.email));
      return NextResponse.json(graduated, { status: graduated.created ? 201 : 200, headers: teamHeaders });
    }
    const id = validateItemId(rawId);
    const body = (req.headers.get("content-type") || "").includes("application/json") ? (await readCallBody(req)) as { managerId?: unknown; expectedUpdatedAt?: unknown } : {};
    const managerId = typeof body.managerId === "string" && /^\d{1,12}$/.test(body.managerId) ? body.managerId : "";
    const { row } = await getOnboarding(id);
    if (typeof body.expectedUpdatedAt === "string" && body.expectedUpdatedAt !== row.updatedAt) throw new CallDeskError("Someone changed this client since you loaded it. Reload before graduating it.", 409);
    if (row.stage === "new" || row.stage === "collecting") throw new CallDeskError("Mark the client ready for production first; graduation is for clients that are built or launching.", 409);
    const result = await graduateFromOnboarding(row, managerId || row.onboardingOwnerIds[0] || "");
    return NextResponse.json(result, { status: result.created ? 201 : 200, headers: teamHeaders });
  } catch (error) { return failure(error); }
}
