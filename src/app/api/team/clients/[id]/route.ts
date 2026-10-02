import { NextResponse } from "next/server";
import { isOwnerEmail, isTeam, teamSession } from "@/lib/team-auth";
import { assertSameOrigin, readCallBody } from "@/lib/calls/validation";
import { applyClientPatch, getClient, liveGbpForClient, stripeWithoutMoney, withoutMoney } from "@/lib/clients/board";
import { listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import { snapshot, stripeConnected } from "@/lib/clients/stripe";
import type { ClientDetail } from "@/lib/clients/types";
import { validateClientId, validateClientPatch } from "@/lib/clients/validation";
import { onboardingOwners } from "@/lib/onboarding/config";
import { readIntake } from "@/lib/onboarding/store";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { clientDetailGhl, patchClientGhl } from "@/lib/desk/clients";
import { assertMayWriteGhl, backendForRecordId, mayWriteGhl, validateRecordId } from "@/lib/desk/switch";
import { actorFor } from "@/lib/desk/team";
import { validateDeskClientPatch } from "@/lib/desk/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Context) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    const canSeeMoney = isOwnerEmail(session.email);
    const rawId = (await context.params).id;
    // A GoHighLevel contact id always goes to GoHighLevel; a Monday item id follows DESK_BACKEND (see src/lib/desk/switch.ts).
    // Before the flip a non-owner may look at the GoHighLevel preview but not change it — and opening a record must not change it either.
    if (backendForRecordId(rawId) === "ghl") return NextResponse.json(await clientDetailGhl(validateRecordId(rawId), canSeeMoney, { mayWrite: mayWriteGhl(isOwnerEmail(session.email)) }), { headers: teamHeaders });
    const id = validateClientId(rawId);
    const { row: stored, history } = await getClient(id);
    // Live Stripe read when we know the customer; a Stripe hiccup never hides the Monday record.
    const [stripe, live, gbpLocations] = await Promise.all([
      stripeConnected() && stored.stripeCustomer ? snapshot(stored.stripeCustomer).catch(() => null) : Promise.resolve(null),
      liveGbpForClient(stored), // Search Atlas read + auto-promotion to Verified; never throws for a Search Atlas failure
      searchAtlasConnected() ? listLocations().catch(() => []) : Promise.resolve([]),
    ]);
    const row = live.row;
    // Files live with the onboarding record when there is one; otherwise in a store keyed by this client row.
    const fileScope = row.onboardingItem || `c${row.id}`;
    const files = (await readIntake(fileScope).catch(() => null))?.files.map((f) => ({ key: f.key, name: f.name, size: f.size, category: f.category, uploadedAt: f.uploadedAt })) || [];
    const detail: ClientDetail = { fileScope, files, row: canSeeMoney ? row : withoutMoney(row), history, stripe: canSeeMoney ? stripe : stripeWithoutMoney(stripe), stripeConnected: stripeConnected(), owners: onboardingOwners(), canSeeMoney, gbpLocations, searchAtlasConnected: searchAtlasConnected() };
    return NextResponse.json(detail, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

export async function PATCH(req: Request, context: Context) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const rawId = (await context.params).id;
    const session = await teamSession();
    if (backendForRecordId(rawId) === "ghl") {
      assertMayWriteGhl(isOwnerEmail(session?.email));
      const patched = await patchClientGhl(validateRecordId(rawId), validateDeskClientPatch(await readCallBody(req)), actorFor(session?.email));
      return NextResponse.json({ row: isOwnerEmail(session?.email) ? patched : withoutMoney(patched) }, { headers: teamHeaders });
    }
    const id = validateClientId(rawId);
    const row = await applyClientPatch(id, validateClientPatch(await readCallBody(req)));
    return NextResponse.json({ row: isOwnerEmail(session?.email) ? row : withoutMoney(row) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
