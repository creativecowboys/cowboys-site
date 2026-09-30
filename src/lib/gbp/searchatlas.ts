import { CallDeskError } from "@/lib/calls/validation";
import { cardFromDetail, cardFromSummary, cardUnavailable, mapLocation, mapLocationSummary, mapPost, mapReview, mapReviewStats, searchAtlasLocationUrl } from "./state";
import type { GbpCard, GbpLocation, GbpLocationSummary, GbpPost, GbpReview, GbpReviewStats } from "./types";

// Search Atlas public REST API (docs.searchatlas.com, OpenAPI; researched Sep 30 2026). Every call is
// `X-API-Key: <key>` against https://sa.searchatlas.com — the key comes from the dashboard, avatar → Settings →
// API Keys (https://dashboard.searchatlas.com/settings?active_section=api), and lives on Vercel as
// SEARCH_ATLAS_API_KEY. Never logged, never sent to the browser. Read-only: this module only GETs.
//
// Endpoints used (all documented):
//   GET /api/gbp/v2/locations/?page_size=100&search=          LocationV2 list (is_verified, profile_completeness, place_id …)
//   GET /api/gbp/v1/locations/all-available-locations/        Location list — fallback when v2 is unavailable
//   GET /api/gbp/v2/locations/{id}                             one location
//   GET /api/gbp/v1/reviews/star-rating-count/?location={id}  {"1":n … "5":n} → count + average
//   GET /api/gbp/v1/reviews/?location={id}&page_size=100      GBPReview rows (reply_text empty = unanswered)
//   GET /api/gbp/v1/posts/?location={id}&page_size=50         GBPPost rows (published_at)
// Failures are thrown as SearchAtlasError with the HTTP status and the first 300 bytes of the body, and logged.

const BASE = () => (process.env.SEARCH_ATLAS_API_BASE || "https://sa.searchatlas.com").replace(/\/+$/, "");
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 15000;

export const searchAtlasConnected = () => !!process.env.SEARCH_ATLAS_API_KEY;

export class SearchAtlasError extends CallDeskError {
  constructor(message: string, public readonly httpStatus: number, public readonly body: string, status = 502) { super(message, status); }
}

type Entry = { at: number; value: unknown };
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
export function clearSearchAtlasCache(): void { cache.clear(); inflight.clear(); }

async function cached<T>(key: string, fresh: boolean, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.value as T;
  const running = inflight.get(key);
  if (running && !fresh) return running as Promise<T>;
  const p = load().then((value) => { cache.set(key, { at: Date.now(), value }); return value; }).finally(() => { if (inflight.get(key) === p) inflight.delete(key); });
  inflight.set(key, p);
  return p;
}

async function get<T>(path: string): Promise<T> {
  const key = process.env.SEARCH_ATLAS_API_KEY;
  if (!key) throw new SearchAtlasError("Search Atlas is not connected to the desk yet. Add SEARCH_ATLAS_API_KEY in Vercel (dashboard → Settings → API Keys).", 0, "", 503);
  const url = `${BASE()}${path}`;
  let res: Response;
  try { res = await fetch(url, { headers: { "X-API-Key": key, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) }); }
  catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[searchatlas] GET ${path} network failure: ${reason}`);
    throw new SearchAtlasError(`Search Atlas did not answer (${reason}).`, 0, reason);
  }
  const text = await res.text();
  if (!res.ok) {
    const body = text.slice(0, 300);
    console.error(`[searchatlas] GET ${path} → ${res.status} ${body}`);
    const detail = (() => { try { const j = JSON.parse(text); return typeof j?.detail === "string" ? j.detail : ""; } catch { return ""; } })();
    if (res.status === 401 || res.status === 403) throw new SearchAtlasError(`Search Atlas rejected the API key (${res.status}${detail ? `: ${detail}` : ""}). Regenerate it in the dashboard (Settings → API Keys) and update SEARCH_ATLAS_API_KEY.`, res.status, body);
    if (res.status === 404) throw new SearchAtlasError(`Search Atlas has no such record (404${detail ? `: ${detail}` : ""}).`, res.status, body, 404);
    throw new SearchAtlasError(`Search Atlas answered ${res.status}${detail ? `: ${detail}` : ""}.`, res.status, body);
  }
  try { return JSON.parse(text) as T; }
  catch { console.error(`[searchatlas] GET ${path} → ${res.status} non-JSON body: ${text.slice(0, 300)}`); throw new SearchAtlasError("Search Atlas returned something that is not JSON.", res.status, text.slice(0, 300)); }
}

/** DRF `{count,next,previous,results}` or JSON:API `{data:[{id,attributes}]}` — both flattened to plain rows. */
function rows(payload: unknown): unknown[] {
  const p = payload as { results?: unknown; data?: unknown; items?: unknown } | unknown[] | null;
  const list = Array.isArray(p) ? p : Array.isArray(p?.results) ? p.results : Array.isArray(p?.data) ? p.data : Array.isArray(p?.items) ? p.items : [];
  return list.map(flatten);
}
function flatten(row: unknown): unknown {
  const r = row as { id?: unknown; attributes?: unknown } | null;
  if (r && typeof r === "object" && r.attributes && typeof r.attributes === "object") return { id: r.id, ...(r.attributes as object) };
  return row;
}
function nextPage(payload: unknown): boolean { const p = payload as { next?: unknown } | null; return !!(p && typeof p === "object" && p.next); }

/** Every GBP location connected to our Search Atlas account (v2 listing, v1 fallback). Cached 10 minutes. */
export function listLocations(fresh = false): Promise<GbpLocationSummary[]> {
  return cached("locations", fresh, async () => {
    const out: GbpLocationSummary[] = [];
    try {
      for (let page = 1; page <= 5; page++) {
        const payload = await get<unknown>(`/api/gbp/v2/locations/?page=${page}&page_size=100`);
        for (const raw of rows(payload)) { const s = mapLocationSummary(raw); if (s) out.push(s); }
        if (!nextPage(payload)) break;
      }
    } catch (error) {
      if (!(error instanceof SearchAtlasError) || error.httpStatus === 401 || error.httpStatus === 403 || error.httpStatus === 0) throw error;
      console.error(`[searchatlas] v2 listing failed (${error.httpStatus}); falling back to v1 all-available-locations`);
      out.length = 0;
      for (let page = 1; page <= 5; page++) {
        const payload = await get<unknown>(`/api/gbp/v1/locations/all-available-locations/?page=${page}&page_size=100`);
        for (const raw of rows(payload)) { const s = mapLocationSummary(raw); if (s) out.push(s); }
        if (!nextPage(payload)) break;
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  });
}

export function getLocation(id: number, fresh = false): Promise<GbpLocation> {
  return cached(`location:${id}`, fresh, async () => {
    const payload = await get<unknown>(`/api/gbp/v2/locations/${id}`);
    const loc = mapLocation(flatten((payload as { data?: unknown })?.data ?? payload));
    if (!loc) throw new SearchAtlasError(`Search Atlas returned no location for id ${id}.`, 200, JSON.stringify(payload).slice(0, 300), 404);
    return loc;
  });
}

/** Star distribution → total + average; replied/unreplied are counted from the review rows (reply_text empty = unanswered). */
export function getReviewStats(id: number, fresh = false): Promise<GbpReviewStats> {
  return cached(`stats:${id}`, fresh, async () => {
    const dist = await get<Record<string, unknown>>(`/api/gbp/v1/reviews/star-rating-count/?location=${id}`);
    const counts = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: Number(dist?.[String(stars)] ?? 0) || 0 }));
    const reviews = await listReviews(id, { limit: 300, fresh });
    const total = Math.max(counts.reduce((s, c) => s + c.count, 0), reviews.length);
    const avg = total ? (counts.reduce((s, c) => s + c.stars * c.count, 0) || reviews.reduce((s, r) => s + r.rating, 0)) / total : 0;
    const replied = reviews.filter((r) => r.replied).length;
    const unreplied = Math.max(0, total - replied);
    return mapReviewStats({ total, avg_rating: avg, replied, unreplied, reply_rate: total ? replied / total : 0, distribution: counts })!;
  });
}

export function listReviews(id: number, opts: { limit?: number; fresh?: boolean } = {}): Promise<GbpReview[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  return cached(`reviews:${id}:${limit}`, !!opts.fresh, async () => {
    const out: GbpReview[] = [];
    for (let page = 1; out.length < limit && page <= 5; page++) {
      const payload = await get<unknown>(`/api/gbp/v1/reviews/?location=${id}&page=${page}&page_size=100`);
      for (const raw of rows(payload)) { const r = mapReview(raw); if (r) out.push(r); }
      if (!nextPage(payload)) break;
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
  });
}

export function listPosts(id: number, opts: { limit?: number; fresh?: boolean } = {}): Promise<GbpPost[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  return cached(`posts:${id}:${limit}`, !!opts.fresh, async () => {
    const out: GbpPost[] = [];
    for (let page = 1; out.length < limit && page <= 3; page++) {
      const payload = await get<unknown>(`/api/gbp/v1/posts/?location=${id}&page=${page}&page_size=100`);
      for (const raw of rows(payload)) { const p = mapPost(raw); if (p) out.push(p); }
      if (!nextPage(payload)) break;
    }
    return out.sort((a, b) => (b.publishedAt || b.scheduledFor).localeCompare(a.publishedAt || a.scheduledFor)).slice(0, limit);
  });
}

/**
 * The desk card for one linked listing. Prefers the cheap listing row (one cached call for the whole account);
 * with `detail` it also pulls the location, review rows and posts so unanswered/last-post are exact.
 * Never throws for a Search Atlas failure — the card says why, and the caller keeps the Monday state.
 */
export async function gbpCard(listingId: number, opts: { detail?: boolean; fresh?: boolean } = {}): Promise<GbpCard> {
  const fetchedAt = new Date().toISOString();
  if (!searchAtlasConnected()) return cardUnavailable(listingId, "Search Atlas is not connected (SEARCH_ATLAS_API_KEY missing on Vercel).", fetchedAt);
  try {
    const summary = (await listLocations(!!opts.fresh)).find((l) => l.id === listingId);
    if (!opts.detail) {
      if (!summary) return cardUnavailable(listingId, `Listing ${listingId} is not connected to our Search Atlas account.`, fetchedAt);
      return cardFromSummary(summary, fetchedAt, searchAtlasLocationUrl(listingId));
    }
    const [loc, stats, posts] = await Promise.all([
      getLocation(listingId, !!opts.fresh).catch((e) => { if (e instanceof SearchAtlasError && e.status === 404) return null; throw e; }),
      getReviewStats(listingId, !!opts.fresh).catch((e) => { console.error(`[searchatlas] review stats for ${listingId} failed: ${e instanceof Error ? e.message : e}`); return null; }),
      listPosts(listingId, { limit: 50, fresh: !!opts.fresh }).catch((e) => { console.error(`[searchatlas] posts for ${listingId} failed: ${e instanceof Error ? e.message : e}`); return [] as GbpPost[]; }),
    ]);
    if (!loc && !summary) return cardUnavailable(listingId, `Listing ${listingId} is not connected to our Search Atlas account.`, fetchedAt);
    const card = loc ? cardFromDetail(loc, stats, posts, fetchedAt, searchAtlasLocationUrl(listingId)) : cardFromSummary(summary!, fetchedAt, searchAtlasLocationUrl(listingId));
    if (card.ok && summary) {
      // The listing row carries what the detail endpoints do not: last review date, and a stats-backed review count when the rows were capped.
      const reviews = await listReviews(listingId, { limit: 1, fresh: !!opts.fresh }).catch(() => [] as GbpReview[]);
      return { ...card, lastReviewDate: reviews[0]?.publishedAt || summary.reviews?.lastReviewDate || card.lastReviewDate, reviewCount: card.reviewCount || summary.reviews?.count || 0, rating: card.rating || summary.reviews?.avgRating || 0, unanswered: stats ? card.unanswered : summary.reviews?.pendingReply ?? card.unanswered };
    }
    return card;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Search Atlas read failed.";
    console.error(`[searchatlas] card for ${listingId} failed: ${reason}`);
    return cardUnavailable(listingId, reason, fetchedAt);
  }
}
