import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { listClients } from "@/lib/clients/board";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Clients tab: Active Clients rows with "Team desk" checked, with problem flags computed server-side. */
export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    return NextResponse.json(await listClients(new URL(req.url).searchParams.get("cursor")), { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
