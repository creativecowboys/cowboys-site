import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { addDeskTask, listDeskTasks, setDeskTaskDone } from "@/lib/desk/tasks";
import { assertMayWriteGhl, isGhlRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";
import { validateTaskAdd, validateTaskDone } from "@/lib/desk/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
type Context = { params: Promise<{ id: string }> };

// A client's running task list (Oct 4 2026), kept as native GoHighLevel tasks on the contact (src/lib/desk/tasks.ts).
//   GET    the contact's tasks, plus who a task can be assigned to
//   POST   add one   { title, due: "YYYY-MM-DD" | "", assignee: "<desk name>" | "", requestId, source: "onboarding" | "client" }
//   PATCH  tick one off, or open it again   { taskId, completed }
// Team sign-in for all three; changes follow the same rule as every other desk write (anyone on the team once the desk
// is on GoHighLevel, which it is). Nothing is ever deleted here.
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
    return NextResponse.json(await addDeskTask(id, validateTaskAdd(await readCallBody(req)), actorFor(session.email)), { headers: teamHeaders });
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
