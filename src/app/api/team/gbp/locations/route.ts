import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Every GBP listing connected to our Search Atlas account (cached 10 min; ?fresh=1 bypasses). Read-only. */
export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    if (!searchAtlasConnected()) return NextResponse.json({ connected: false, locations: [], error: "Search Atlas is not connected (SEARCH_ATLAS_API_KEY missing on Vercel)." }, { headers: teamHeaders });
    const fresh = new URL(req.url).searchParams.get("fresh") === "1";
    const locations = await listLocations(fresh);
    return NextResponse.json({ connected: true, locations }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
