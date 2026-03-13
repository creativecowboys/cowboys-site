import { NextRequest, NextResponse } from "next/server";

const BRIGHTLOCAL_MANAGE_BASE = "https://api.brightlocal.com/manage/v1";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    const apiKey = process.env.BRIGHTLOCAL_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "BrightLocal API key not configured" }, { status: 503 });
    }

    const { reportId } = await params;
    if (!reportId || isNaN(Number(reportId))) {
        return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `${BRIGHTLOCAL_MANAGE_BASE}/lrt/reports/${reportId}/result`,
            {
                headers: { "x-api-key": apiKey },
                next: { revalidate: 3600 },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error(`BrightLocal LRT API error ${res.status}:`, text);
            return NextResponse.json(
                { error: `BrightLocal API error: ${res.status}` },
                { status: res.status }
            );
        }

        const raw = await res.json();
        const shaped = shapeData(raw);
        return NextResponse.json(shaped);
    } catch (err) {
        console.error("LRT API fetch error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LRTKeyword {
    keyword: string;
    googleRank: number | null;
    googlePrev: number | null;
    googleChange: number | null;
    mobileRank: number | null;
    mobilePrev: number | null;
    mobileChange: number | null;
    localPackRank: number | null;
    localPackPrev: number | null;
    localPackChange: number | null;
    url: string | null;
    type: string | null;      // "Local", "Organic", etc.
    lastChecked: string | null;
    searchVolume: number | null;
}

interface LRTData {
    reportId: number;
    reportName: string;
    location: string;
    website: string | null;
    lastProcessedAt: string | null;
    schedule: string;
    keywords: LRTKeyword[];
    avgGoogleRank: number | null;
    avgMobileRank: number | null;
    rankingKeywords: number;
    top3Keywords: number;
    top10Keywords: number;
    top20Keywords: number;
    competitors: Array<{ name: string; url: string }>;
    fetchedAt: string;
}

// ─── Shape function ─────────────────────────────────────────────────────────────

function parseRank(raw: any): number | null {
    const n = Number(raw);
    return isNaN(n) || n === 0 ? null : n;
}

function calcChange(curr: number | null, prev: number | null): number | null {
    if (curr === null || prev === null) return null;
    return prev - curr; // positive = moved up
}

function shapeData(raw: any): LRTData {
    const details = raw?.details ?? {};
    const byKeyword: any[] = raw?.rankings?.by_keyword ?? [];
    const competitors: any[] = raw?.competitors ?? [];

    const keywords: LRTKeyword[] = byKeyword.map((kwEntry: any) => {
        const googleResults = kwEntry?.results?.["google"] ?? [];
        const mobileResults = kwEntry?.results?.["google-mobile"] ?? [];
        const localResults = kwEntry?.results?.["google-places"] ?? [];

        // Take best ranking result for each engine
        const gBest = googleResults.find((r: any) => r.rank > 0) ?? googleResults[0] ?? {};
        const mBest = mobileResults.find((r: any) => r.rank > 0) ?? mobileResults[0] ?? {};
        const lBest = localResults.find((r: any) => r.rank > 0) ?? localResults[0] ?? {};

        const gRank = parseRank(gBest.rank);
        const mRank = parseRank(mBest.rank);
        const lRank = parseRank(lBest.rank);
        const gPrev = parseRank(gBest.last);
        const mPrev = parseRank(mBest.last);
        const lPrev = parseRank(lBest.last);

        const url = gBest.url || mBest.url || lBest.url || null;
        const type = gBest.type || mBest.type || lBest.type || null;
        const lastChecked = gBest.date || mBest.date || lBest.date || null;

        return {
            keyword: kwEntry.keyword,
            googleRank: gRank,
            googlePrev: gPrev,
            googleChange: calcChange(gRank, gPrev),
            mobileRank: mRank,
            mobilePrev: mPrev,
            mobileChange: calcChange(mRank, mPrev),
            localPackRank: lRank,
            localPackPrev: lPrev,
            localPackChange: calcChange(lRank, lPrev),
            url: url || null,
            type,
            lastChecked,
            searchVolume: kwEntry.search_volume ?? null,
        };
    });

    // Compute aggregates (based on Google desktop rank)
    const ranked = keywords.filter((k) => k.googleRank !== null);
    const positions = ranked.map((k) => k.googleRank as number);
    const avgGoogle = positions.length > 0
        ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
        : null;

    const mobileRanked = keywords.filter((k) => k.mobileRank !== null);
    const mPositions = mobileRanked.map((k) => k.mobileRank as number);
    const avgMobile = mPositions.length > 0
        ? Math.round(mPositions.reduce((a, b) => a + b, 0) / mPositions.length)
        : null;

    const top3 = ranked.filter((k) => (k.googleRank ?? 999) <= 3).length;
    const top10 = ranked.filter((k) => (k.googleRank ?? 999) <= 10).length;
    const top20 = ranked.filter((k) => (k.googleRank ?? 999) <= 20).length;

    const website = (details.website_addresses ?? [])[0] ?? null;
    const searchEngines = details.search_engines ?? [];
    const location = details.search_location ?? "";

    return {
        reportId: details.report_id,
        reportName: details.report_name ?? `Report #${details.report_id}`,
        location,
        website,
        lastProcessedAt: details.last_processed_at ?? null,
        schedule: details.schedule ?? "weekly",
        keywords,
        avgGoogleRank: avgGoogle,
        avgMobileRank: avgMobile,
        rankingKeywords: ranked.length,
        top3Keywords: top3,
        top10Keywords: top10,
        top20Keywords: top20,
        competitors: competitors.map((c: any) => ({
            name: c.name ?? "",
            url: c.url ?? "",
        })),
        fetchedAt: new Date().toISOString(),
    };
}
