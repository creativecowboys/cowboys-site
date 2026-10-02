import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { listClients, withoutMoney } from "@/lib/clients/board";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";
import { listClientsGhl } from "@/lib/desk/clients";
import { deskBackend } from "@/lib/desk/switch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Clients tab: Active Clients rows with "Team desk" checked, with problem flags computed server-side. */
export async function GET(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    const canSeeMoney = isOwnerEmail(session.email);
    // DESK_BACKEND decides the system; `?desk=ghl` previews the GoHighLevel desk before the flip. Money is stripped the same way on both.
    const data = deskBackend(req) === "ghl" ? await listClientsGhl() : await listClients(new URL(req.url).searchParams.get("cursor"));
    return NextResponse.json({ ...data, rows: canSeeMoney ? data.rows : data.rows.map(withoutMoney), canSeeMoney }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
