import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { applyClientPatch, getClient, stripeWithoutMoney, withoutMoney } from "@/lib/clients/board";
import { snapshot, stripeConnected } from "@/lib/clients/stripe";
import type { ClientDetail } from "@/lib/clients/types";
import { validateClientId, validateClientPatch } from "@/lib/clients/validation";
import { onboardingOwners } from "@/lib/onboarding/config";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    const canSeeMoney = isOwnerEmail(session.email);
    const id = validateClientId((await context.params).id);
    const { row, history } = await getClient(id);
    // Live Stripe read when we know the customer; a Stripe hiccup never hides the Monday record.
    const stripe = stripeConnected() && row.stripeCustomer ? await snapshot(row.stripeCustomer).catch(() => null) : null;
    const detail: ClientDetail = { row: canSeeMoney ? row : withoutMoney(row), history, stripe: canSeeMoney ? stripe : stripeWithoutMoney(stripe), stripeConnected: stripeConnected(), owners: onboardingOwners(), canSeeMoney };
    return NextResponse.json(detail, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const id = validateClientId((await context.params).id);
    const session = await teamSession();
    const row = await applyClientPatch(id, validateClientPatch(await readCallBody(req)));
    return NextResponse.json({ row: isOwnerEmail(session?.email) ? row : withoutMoney(row) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
