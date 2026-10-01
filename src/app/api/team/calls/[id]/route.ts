import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assignOwner, getCallLead, saveCall, setLeadSource } from "@/lib/calls/backend";
import { assertSameOrigin, CallDeskError, readCallBody, validateAssign, validateCallDraft, validateLeadId } from "@/lib/calls/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };

function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof CallDeskError ? error.message : "This request could not be completed. Keep your draft and try again." }, { status: error instanceof CallDeskError ? error.status : 500, headers });
}

export async function GET(_req: Request, context: Context) {
  try {
    if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    const id = validateLeadId((await context.params).id);
    return NextResponse.json(await getCallLead(id), { headers });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    assertSameOrigin(req);
    const id = validateLeadId((await context.params).id);
    const draft = validateCallDraft(await readCallBody(req), id);
    return NextResponse.json(await saveCall(draft), { headers });
  } catch (error) { return failure(error); }
}

/** Assign the lead to Dave, Josh, or Keaton (or clear it): { owner: "Josh", expectedUpdatedAt } — or change its
 *  Lead Source (GHL leads only): { leadSource: "Facebook", expectedUpdatedAt }. */
export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers });
    assertSameOrigin(req);
    const id = validateLeadId((await context.params).id);
    const patch = validateAssign(await readCallBody(req));
    const lead = "leadSource" in patch ? await setLeadSource(id, patch.leadSource, patch.expectedUpdatedAt) : await assignOwner(id, patch.owner, patch.expectedUpdatedAt);
    return NextResponse.json({ lead }, { headers });
  } catch (error) { return failure(error); }
}
