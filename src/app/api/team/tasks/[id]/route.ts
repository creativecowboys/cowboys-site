import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { addDeskTask, addStarterTasks, deleteDeskTask, listDeskTasks, setDeskTaskDone } from "@/lib/desk/tasks";
import { assertMayWriteGhl, isGhlRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";
import { validateTaskAdd, validateTaskDelete, validateTaskDone, validateTaskStarter } from "@/lib/desk/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
type Context = { params: Promise<{ id: string }> };

// A client's running task list (Oct 4 2026), kept as native GoHighLevel tasks on the contact (src/lib/desk/tasks.ts).
//   GET    the contact's tasks, plus who a task can be assigned to
//   POST   add one   { title, due: "YYYY-MM-DD" | "", assignee: "<desk name>" | "", requestId, source: "onboarding" | "client" }
//          or add the onboarding starter tasks that are not on the list yet   { starter: true, source }
//   PATCH  tick one off, or open it again   { taskId, completed }
//   DELETE delete one (one click on the desk, Oct 4 2026)   { taskId }
// Team sign-in for all four; changes follow the same rule as every other desk write (anyone on the team once the desk
// is on GoHighLevel, which it is).
async function contactId(context: Context): Promise<string> {
  const id = (await context.params).id;
  if (!isGhlRecordId(id)) throw new CallDeskError("Tasks live on the client's GoHighLevel contact. Open the client from the Onboarding or Clients tab.", 400);
  return id;
}

export async function GET(_req: Request, context: Context) {
  try {
    if (!(await teamSession())) return unauthorized();
    return NextResponse.json({ tasks: await listDeskTasks(await contactId(context)) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    assertSameOrigin(req);
    assertMayWriteGhl(isOwnerEmail(session.email));
    const id = await contactId(context);
    const body = await readCallBody(req);
    if (body && typeof body === "object" && !Array.isArray(body) && "starter" in body) {
      const { source } = validateTaskStarter(body);
      return NextResponse.json(await addStarterTasks(id, actorFor(session.email), source), { headers: teamHeaders });
    }
    return NextResponse.json(await addDeskTask(id, validateTaskAdd(body), actorFor(session.email)), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function PATCH(req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    assertSameOrigin(req);
    assertMayWriteGhl(isOwnerEmail(session.email));
    const id = await contactId(context);
    const { taskId, completed } = validateTaskDone(await readCallBody(req));
    return NextResponse.json(await setDeskTaskDone(id, taskId, completed), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    assertSameOrigin(req);
    assertMayWriteGhl(isOwnerEmail(session.email));
    const id = await contactId(context);
    const { taskId } = validateTaskDelete(await readCallBody(req));
    return NextResponse.json(await deleteDeskTask(id, taskId), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
