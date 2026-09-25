import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { applyClientPatch, getClient } from "@/lib/clients/board";
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
    if (!(await isTeam())) return unauthorized();
    const id = validateClientId((await context.params).id);
    const { row, history } = await getClient(id);
    // Live Stripe read when we know the customer; a Stripe hiccup never hides the Monday record.
    const stripe = stripeConnected() && row.stripeCustomer ? await snapshot(row.stripeCustomer).catch(() => null) : null;
    const detail: ClientDetail = { row, history, stripe, stripeConnected: stripeConnected(), owners: onboardingOwners() };
    return NextResponse.json(detail, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const id = validateClientId((await context.params).id);
    return NextResponse.json({ row: await applyClientPatch(id, validateClientPatch(await readCallBody(req))) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
