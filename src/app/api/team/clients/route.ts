import { NextResponse } from "next/server";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { listClients, withoutMoney } from "@/lib/clients/board";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Clients tab: Active Clients rows with "Team desk" checked, with problem flags computed server-side. */
export async function GET(req: Request) {
  try {
    const session = await teamSession();
    if (!session) return unauthorized();
    const canSeeMoney = isOwnerEmail(session.email);
    const data = await listClients(new URL(req.url).searchParams.get("cursor"));
    return NextResponse.json({ ...data, rows: canSeeMoney ? data.rows : data.rows.map(withoutMoney), canSeeMoney }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
