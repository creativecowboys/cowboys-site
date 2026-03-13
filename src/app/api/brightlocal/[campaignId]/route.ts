import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getClientBySlug } from "@/lib/clients";
import { fetchCampaignResults } from "@/lib/brightlocal";

/**
 * GET /api/brightlocal/[campaignId]
 *
 * Proxies a request to the BrightLocal API, protecting the API key server-side.
 * Auth: requires a valid NextAuth session whose slug owns this campaign.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    const campaignIdNum = parseInt(campaignId, 10);

    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify the authenticated client actually owns this campaign
    // @ts-ignore
    const sessionSlug = session?.user?.slug as string;
    const client = getClientBySlug(sessionSlug);

    if (!client || client.brightLocalCampaignId !== campaignIdNum) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. API key check
    const apiKey = process.env.BRIGHTLOCAL_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return NextResponse.json(
            { error: "BrightLocal API key not configured" },
            { status: 503 }
        );
    }

    // 4. Fetch from BrightLocal
    try {
        const data = await fetchCampaignResults(campaignIdNum, apiKey);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[BrightLocal proxy error]", err?.message);
        return NextResponse.json(
            { error: err?.message ?? "Failed to fetch BrightLocal data" },
            { status: 502 }
        );
    }
}
