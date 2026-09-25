import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { syncClientFromStripe } from "@/lib/clients/board";
import { validateClientId } from "@/lib/clients/validation";
import { assertOrigin, failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** "Sync from Stripe": pull the customer's subscription and latest invoice and write the payment fields to Monday. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const id = validateClientId((await context.params).id);
    return NextResponse.json(await syncClientFromStripe(id), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
