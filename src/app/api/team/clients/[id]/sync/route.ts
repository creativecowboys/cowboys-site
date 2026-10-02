import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { stripeWithoutMoney, syncClientFromStripe, withoutMoney } from "@/lib/clients/board";
import { validateClientId } from "@/lib/clients/validation";
import { assertOrigin, failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { syncClientFromStripeGhl } from "@/lib/desk/clients";
import { assertMayWriteGhl, backendForRecordId, validateRecordId } from "@/lib/desk/switch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** "Sync from Stripe": pull the customer's subscription and latest invoice and write the payment fields to Monday. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertOrigin(req);
    const rawId = (await context.params).id;
    const owner = isOwnerEmail((await teamSession())?.email);
    const ghl = backendForRecordId(rawId) === "ghl";
    if (ghl) assertMayWriteGhl(owner);
    const result = ghl ? await syncClientFromStripeGhl(validateRecordId(rawId)) : await syncClientFromStripe(validateClientId(rawId));
    return NextResponse.json(owner ? result : { ...result, row: withoutMoney(result.row), stripe: stripeWithoutMoney(result.stripe) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
