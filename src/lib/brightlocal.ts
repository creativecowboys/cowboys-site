/**
 * BrightLocal GPW (Google Places Widget) API Helper
 * ---------------------------------------------------
 * Fetches Local Rank Tracker results via the GPW endpoint.
 * Server-side only — API key never reaches the browser.
 *
 * API: GET /gpw/{report_id}/results
 * Auth: x-api-key header
 *
 * ⚠️  The "brightLocalCampaignId" we store is the report_id from GET /gpw,
 *     NOT the location_id visible in the BrightLocal dashboard URL.
 */

const BRIGHTLOCAL_BASE = "https://tools.brightlocal.com/seo-tools/api/v4";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrightLocalCompetitor {
    rank: string;          // "A", "B", "C", etc.
    rankNum: number;       // 1, 2, 3, etc.
    businessName: string;
    isClient: boolean;
    numReviews: number;
    starRating: number;
    domainAuthority: number;
    backlinks: number;
    citationsCount: number;
    numPhotos: number;
    claimed: boolean;
    categories: string[];
    profileUrl: string;
}

export interface BrightLocalCitationEntry {
    domain: string;
    authority: number;
    clientHasCitation: boolean;   // true if client appears on this domain
    competitorCount: number;
}

export interface BrightLocalKeyword {
    keyword: string;
    searchEngine: string;
    /** Local pack position A=1, B=2, etc. Null = not in local pack */
    currentRank: number | null;
    rankLetter: string | null;    // "A", "B", "C" etc.
    previousRank: number | null;
    change: number | null;
    url: string | null;
    localPack: boolean;
    competitors: BrightLocalCompetitor[];
    topCitations: BrightLocalCitationEntry[];
}

export interface BrightLocalSEOData {
    campaignId: number;
    businessName: string;
    reportDate: string;
    address?: string;
    telephone?: string;
    starRating?: number;
    numReviews?: number;
    domainAuthority?: number;
    citationsCount?: number;
    numPhotos?: number;
    claimed?: boolean;
    avgPosition: number | null;
    keywordsTracked: number;
    keywordsRanking: number;
    inTop3: number;
    inTop10: number;
    inTop20: number;
    keywords: BrightLocalKeyword[];
    topMovers: BrightLocalKeyword[];
    topDroppers: BrightLocalKeyword[];
}

// ─── Fetch Helper ─────────────────────────────────────────────────────────────

export async function fetchCampaignResults(
    campaignId: number,
    apiKey: string
): Promise<BrightLocalSEOData> {
    const url = `${BRIGHTLOCAL_BASE}/gpw/${campaignId}/results`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`BrightLocal API error ${res.status}: ${text}`);
    }

    const raw = await res.json();

    if (!raw?.success) {
        const errMsg = JSON.stringify(raw?.errors ?? raw?.message ?? "Unknown error");
        throw new Error(`BrightLocal API returned failure: ${errMsg}`);
    }

    return shapeCampaignResults(campaignId, raw);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts A/B/C or numeric rank to a number (A=1, B=2, …) */
function parseRank(rank: string | number | null | undefined): number | null {
    if (rank == null) return null;
    if (typeof rank === "number") return rank;
    const letter = String(rank).trim().toUpperCase();
    if (/^[A-Z]$/.test(letter)) return letter.charCodeAt(0) - 64;
    const n = Number(letter);
    return isNaN(n) ? null : n;
}

/** Converts numeric rank back to letter (1=A, 2=B, …) for display */
function numToLetter(n: number | null): string | null {
    if (n == null || n < 1 || n > 26) return null;
    return String.fromCharCode(64 + n);
}

// ─── Data Shaping ─────────────────────────────────────────────────────────────

function shapeCampaignResults(campaignId: number, raw: any): BrightLocalSEOData {
    const results = raw?.results ?? {};
    const keywordsData: Record<string, any> = results?.keywords ?? {};
    const summary: any = results?.summary ?? {};

    // ── Parse keywords ──────────────────────────────────────────────────────
    const keywords: BrightLocalKeyword[] = Object.entries(keywordsData).map(
        ([kwText, kwData]: [string, any]) => {
            const currentRank = parseRank(kwData?.client_rank);
            const previousRank = parseRank(kwData?.previous_rank ?? null);
            const change =
                currentRank !== null && previousRank !== null
                    ? previousRank - currentRank
                    : null;

            // Parse top 10 competitors
            const competitors: BrightLocalCompetitor[] = (kwData?.top_10 ?? []).map((c: any) => ({
                rank: String(c?.rank ?? ""),
                rankNum: parseRank(c?.rank) ?? 99,
                businessName: c?.business_name ?? "",
                isClient: c?.client_business === true,
                numReviews: c?.num_reviews ?? 0,
                starRating: c?.star_rating ?? 0,
                domainAuthority: c?.domain_authority ?? 0,
                backlinks: c?.backlinks ?? 0,
                citationsCount: c?.citations_count ?? 0,
                numPhotos: c?.num_photos ?? 0,
                claimed: c?.claimed === true,
                categories: Array.isArray(c?.categories) ? c.categories : [],
                profileUrl: c?.profile_url ?? "",
            }));

            // Parse citations matrix (top by authority, flag client presence)
            const citationsRaw: any[] = kwData?.citations_matrix ?? [];
            const topCitations: BrightLocalCitationEntry[] = citationsRaw
                .filter((c: any) => c?.authority > 0)
                .sort((a: any, b: any) => (b?.authority ?? 0) - (a?.authority ?? 0))
                .slice(0, 20)
                .map((c: any) => {
                    // Client has citation if businesses array is not empty (simplification)
                    // BrightLocal uses count to indicate presence
                    const clientHas = (c?.count ?? 0) > 0 &&
                        (Array.isArray(c?.businesses)
                            ? c.businesses.some((b: any) =>
                                (b?.business_name ?? "").toLowerCase().includes("leuco"))
                            : false);
                    return {
                        domain: c?.domain ?? "",
                        authority: c?.authority ?? 0,
                        clientHasCitation: clientHas,
                        competitorCount: c?.count ?? 0,
                    };
                });

            return {
                keyword: kwText,
                searchEngine: "google-local",
                currentRank,
                rankLetter: numToLetter(currentRank),
                previousRank,
                change,
                url: kwData?.client_url ?? null,
                localPack: true,
                competitors,
                topCitations,
            };
        }
    );

    // ── Compute aggregates ──────────────────────────────────────────────────
    const ranked = keywords.filter((k) => k.currentRank !== null);
    const positions = ranked.map((k) => k.currentRank as number);
    const avgPosition =
        positions.length > 0
            ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
            : null;

    const inTop3 = ranked.filter((k) => (k.currentRank ?? 999) <= 3).length;
    const inTop10 = ranked.filter((k) => (k.currentRank ?? 999) <= 10).length;
    const inTop20 = ranked.filter((k) => (k.currentRank ?? 999) <= 20).length;

    const movers = keywords
        .filter((k) => k.change !== null && k.change > 0)
        .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
        .slice(0, 5);

    const droppers = keywords
        .filter((k) => k.change !== null && k.change < 0)
        .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))
        .slice(0, 5);

    // ── Business profile ────────────────────────────────────────────────────
    const businessName =
        summary?.business_name ??
        (Object.values(keywordsData)[0] as any)?.nap_comparison?.[0]?.business_name ??
        `Campaign #${campaignId}`;

    return {
        campaignId,
        businessName,
        reportDate: new Date().toISOString(),
        address: summary?.address ?? undefined,
        telephone: summary?.telephone ?? undefined,
        starRating: summary?.star_rating ?? undefined,
        numReviews: summary?.num_reviews ?? undefined,
        domainAuthority: summary?.domain_authority ?? undefined,
        citationsCount: summary?.citations_count ?? undefined,
        numPhotos: summary?.num_photos ?? undefined,
        claimed: summary?.claimed ?? undefined,
        avgPosition,
        keywordsTracked: keywords.length,
        keywordsRanking: ranked.length,
        inTop3,
        inTop10,
        inTop20,
        keywords,
        topMovers: movers,
        topDroppers: droppers,
    };
}
