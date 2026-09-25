import { NextResponse } from "next/server";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { clientView, resolveToken, saveIntakeForm, submitIntake } from "@/lib/onboarding/intake";
import { validateIntakeForm, validateToken } from "@/lib/onboarding/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
type Context = { params: Promise<{ token: string }> };

function failure(error: unknown) {
  const known = error instanceof CallDeskError;
  return NextResponse.json({ error: known ? error.message : "Something went wrong on our side. Your answers are still on this page; please try again." }, { status: known ? error.status : 500, headers });
}

// Client intake. The token in the URL is the only credential; every handler resolves it fresh and the
// response never includes staff data. Tokens are hashed at rest and expire (see intake.ts).
export async function GET(_req: Request, context: Context) {
  try { return NextResponse.json(clientView(await resolveToken(validateToken((await context.params).token))), { headers }); }
  catch (error) { return failure(error); }
}

export async function PUT(req: Request, context: Context) {
  try {
    assertSameOrigin(req);
    const record = await resolveToken(validateToken((await context.params).token));
    const form = validateIntakeForm(await readCallBody(req));
    return NextResponse.json(clientView(await saveIntakeForm(record, form)), { headers });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request, context: Context) {
  try {
    assertSameOrigin(req);
    const record = await resolveToken(validateToken((await context.params).token));
    const body = await readCallBody(req) as { form?: unknown };
    if (body && typeof body === "object" && "form" in body) await saveIntakeForm(record, validateIntakeForm(body.form));
    return NextResponse.json(clientView(await submitIntake(record)), { headers });
  } catch (error) { return failure(error); }
}
