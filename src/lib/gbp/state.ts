// Pure mapping from raw Search Atlas payloads to the desk's shapes, plus the rules that turn a live listing read
// into a GBP access state. No network, no Monday — covered by gbp.test.ts.
import type { GbpCard, GbpLocation, GbpLocationSummary, GbpPost, GbpReview, GbpReviewStats } from "./types";

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : null);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : fallback);
const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const bool = (v: unknown): boolean => v === true || v === "true";
const day = (v: unknown): string => { const s = str(v); return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : ""; };

/** The Search Atlas location id stored on a Monday text column. Anything that is not a plain positive integer is "not linked". */
export function parseListingId(text: string | null | undefined): number | null {
  const s = (text || "").trim();
  return /^[1-9]\d{0,9}$/.test(s) ? Number(s) : null;
}

export function mapLocationSummary(raw: unknown): GbpLocationSummary | null {
  const r = obj(raw);
  const id = r ? num(r.id, 0) : 0;
  if (!r || id <= 0) return null;
  const stats = obj(r.stats);
  const rv = stats ? obj(stats.reviews) : null;
  const ps = stats ? obj(stats.posts) : null;
  const byStatus = ps ? obj(ps.by_status) : null;
  return {
    id, name: str(r.name ?? r.business_name), city: str(r.city ?? r.address_locality), category: str(r.primary_category),
    verified: bool(r.verified ?? r.is_verified), locked: bool(r.locked), profileCompleteness: num(r.profile_completeness),
    reviews: rv ? { count: num(rv.count), avgRating: num(rv.avg_rating), lastReviewDate: day(rv.last_review_date), replied: num(rv.replied), pendingReply: num(rv.pending_reply) } : null,
    posts: ps ? { count: num(ps.count), published: byStatus ? num(byStatus.Published) : 0, lastPostDate: day(ps.last_post_date ?? ps.last_published_at) } : null,
  };
}

export function mapLocation(raw: unknown): GbpLocation | null {
  const r = obj(raw);
  const id = r ? num(r.id, 0) : 0;
  if (!r || id <= 0) return null;
  const categories = Array.isArray(r.categories) ? r.categories.map(obj).filter((c): c is Raw => !!c) : [];
  const primary = categories.find((c) => c.category_type === "primary") || categories[0];
  const phones = Array.isArray(r.phone_numbers) ? r.phone_numbers.map(str).filter(Boolean) : [];
  return {
    id, name: str(r.business_name ?? r.name), address: str(r.business_address), phone: phones[0] || str(r.phone), website: str(r.website_uri ?? r.website),
    placeId: str(r.place_id), verified: bool(r.is_verified ?? r.verified), deleted: bool(r.is_deleted), profileCompleteness: num(r.profile_completeness),
    openStatus: str(r.open_status), category: primary ? str(primary.label) : "", pendingSyncFields: Array.isArray(r.pending_sync_fields) ? r.pending_sync_fields.map(str) : [],
  };
}

export function mapReviewStats(raw: unknown): GbpReviewStats | null {
  const r = obj(raw);
  if (!r) return null;
  const dist = Array.isArray(r.distribution) ? r.distribution.map(obj).filter((d): d is Raw => !!d).map((d) => ({ stars: num(d.stars), count: num(d.count) })) : [];
  return { total: num(r.total ?? r.count), avgRating: num(r.avg_rating), replied: num(r.replied), unreplied: num(r.unreplied ?? r.pending_reply), replyRate: num(r.reply_rate), distribution: dist };
}

export function mapReview(raw: unknown): GbpReview | null {
  const r = obj(raw);
  const id = r ? num(r.id, 0) : 0;
  if (!r || id <= 0) return null;
  const reviewer = obj(r.reviewer);
  const reply = obj(r.reply) || obj(r.review_reply);
  return {
    id, reviewer: str(r.reviewer_name ?? reviewer?.display_name ?? reviewer?.name ?? (typeof r.reviewer === "string" ? r.reviewer : "")),
    rating: num(r.star_rating ?? r.rating), comment: str(r.review_text ?? r.comment ?? r.content), publishedAt: day(r.review_date ?? r.published_at ?? r.create_time ?? r.created_at),
    replied: bool(r.is_replied) || !!str(r.reply_text).trim() || !!(reply && str(reply.comment ?? reply.content)) || !!str(r.reply_content),
  };
}

export function mapPost(raw: unknown): GbpPost | null {
  const r = obj(raw);
  const id = r ? num(r.id, 0) : 0;
  if (!r || id <= 0) return null;
  return { id, status: str(r.status), type: str(r.topic_type ?? r.type), publishedAt: day(r.published_at), scheduledFor: day(r.schedule_publishing_at), preview: str(r.content ?? r.summary).slice(0, 200) };
}

/** Deep link into the Search Atlas dashboard for one listing (override the base with SEARCH_ATLAS_LOCATION_URL, `{id}` is replaced). */
export function searchAtlasLocationUrl(id: number, template = process.env.SEARCH_ATLAS_LOCATION_URL || ""): string {
  const base = template || "https://dashboard.searchatlas.com/local-seo/{id}";
  return base.replace("{id}", String(id));
}

export function cardFromSummary(s: GbpLocationSummary, fetchedAt: string, url = searchAtlasLocationUrl(s.id)): GbpCard {
  return { ok: true, listingId: s.id, name: s.name, verified: s.verified, connected: true, rating: Math.round((s.reviews?.avgRating || 0) * 100) / 100, reviewCount: s.reviews?.count || 0, unanswered: s.reviews?.pendingReply || 0, lastReviewDate: s.reviews?.lastReviewDate || "", lastPostDate: s.posts?.lastPostDate || "", profileCompleteness: s.profileCompleteness, searchAtlasUrl: url, fetchedAt };
}
export function cardFromDetail(loc: GbpLocation, stats: GbpReviewStats | null, posts: GbpPost[], fetchedAt: string, url = searchAtlasLocationUrl(loc.id)): GbpCard {
  if (loc.deleted) return { ok: false, listingId: loc.id, connected: false, reason: "This listing was removed from Search Atlas.", fetchedAt };
  const lastPost = posts.filter((p) => p.status === "Published" && p.publishedAt).map((p) => p.publishedAt).sort().pop() || "";
  return { ok: true, listingId: loc.id, name: loc.name, verified: loc.verified, connected: true, rating: Math.round((stats?.avgRating || 0) * 100) / 100, reviewCount: stats?.total || 0, unanswered: stats?.unreplied || 0, lastReviewDate: "", lastPostDate: lastPost, profileCompleteness: loc.profileCompleteness, searchAtlasUrl: url, fetchedAt };
}
export const cardUnavailable = (listingId: number, reason: string, fetchedAt: string): GbpCard => ({ ok: false, listingId, connected: false, reason, fetchedAt });

/**
 * The access state a live read implies. Only a connected + verified listing promotes to "Verified" on its own;
 * a listing that is connected but unverified in Google is reported as "Requested" (we can see it, Google has not
 * verified it). A failed read never changes the staff-set value — the manual dropdown stays the override.
 */
export function accessFromCard(card: GbpCard | null, manual: string): { value: string; changed: boolean; live: boolean } {
  if (!card || !card.ok) return { value: manual, changed: false, live: false };
  if (card.verified) return { value: "Verified", changed: manual !== "Verified", live: true };
  const value = manual === "Verified" || !manual ? "Requested" : manual;
  return { value, changed: value !== manual, live: true };
}
