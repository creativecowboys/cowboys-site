import assert from "node:assert/strict";
import { test } from "node:test";
import { accessFromCard, cardFromDetail, cardFromSummary, cardUnavailable, mapLocation, mapLocationSummary, mapPost, mapReview, mapReviewStats, parseListingId, searchAtlasLocationUrl } from "./state";

// Payload shapes below are copied from live Search Atlas reads on Sep 30 2026 (Squirrel Made 94266, Defoor 94742).
const summaryRaw = { id: 94266, name: "Squirrel Made Products", city: null, primary_category: "Food Producer", profile_completeness: 40, stats: { heatmap: null, reviews: { count: 1, avg_rating: 5, last_review_date: "2026-05-15T16:59:58.442333Z", replied: 0, pending_reply: 1 }, posts: { count: 2, by_status: { Published: 2 } }, profile: { gbp_score: 42, profile_score: 40 } }, verified: true, locked: false, has_pending_sync_fields: false };
const detailRaw = { id: 94742, business_name: "Defoor Plumbing", business_address: "902 McBrayer Road, Temple, United States", phone_numbers: ["(770) 562-0406"], website_uri: "https://www.d4plumbing.com/", place_id: "ChIJp9mav9fTiogRzNeXPQTCX0g", categories: [{ key: "categories/gcid:plumber", label: "Plumber", category_type: "primary" }], is_verified: false, is_deleted: false, profile_completeness: 23.81, pending_sync_fields: [], open_status: "OPEN" };
const statsRaw = { location_id: 94266, total: 1, avg_rating: 5, replied: 0, unreplied: 1, reply_rate: 0, distribution: [{ stars: 5, count: 1, pct: 100 }, { stars: 4, count: 0, pct: 0 }] };

test("listing id column parses only plain positive integers", () => {
  assert.equal(parseListingId("94266"), 94266);
  assert.equal(parseListingId(" 94266 "), 94266);
  assert.equal(parseListingId(""), null);
  assert.equal(parseListingId(undefined), null);
  assert.equal(parseListingId("0"), null);
  assert.equal(parseListingId("94266abc"), null);
  assert.equal(parseListingId("-1"), null);
  assert.equal(parseListingId("1e5"), null);
});

test("location summary maps stats and verification", () => {
  const s = mapLocationSummary(summaryRaw)!;
  assert.equal(s.id, 94266); assert.equal(s.name, "Squirrel Made Products"); assert.equal(s.city, ""); assert.equal(s.verified, true); assert.equal(s.locked, false);
  assert.deepEqual(s.reviews, { count: 1, avgRating: 5, lastReviewDate: "2026-05-15", replied: 0, pendingReply: 1 });
  assert.deepEqual(s.posts, { count: 2, published: 2, lastPostDate: "" });
  assert.equal(mapLocationSummary({ name: "no id" }), null);
  assert.equal(mapLocationSummary(null), null);
  assert.equal(mapLocationSummary({ id: "94266" })!.id, 94266, "string ids are tolerated");
  assert.equal(mapLocationSummary({ id: 5 })!.reviews, null, "no stats block → null, not zeros");
});

test("location detail maps the basic view", () => {
  const l = mapLocation(detailRaw)!;
  assert.equal(l.id, 94742); assert.equal(l.name, "Defoor Plumbing"); assert.equal(l.phone, "(770) 562-0406"); assert.equal(l.website, "https://www.d4plumbing.com/");
  assert.equal(l.verified, false); assert.equal(l.deleted, false); assert.equal(l.category, "Plumber"); assert.equal(l.placeId, "ChIJp9mav9fTiogRzNeXPQTCX0g");
  assert.equal(mapLocation({}), null);
});

test("review stats, reviews and posts map defensively", () => {
  assert.deepEqual(mapReviewStats(statsRaw), { total: 1, avgRating: 5, replied: 0, unreplied: 1, replyRate: 0, distribution: [{ stars: 5, count: 1 }, { stars: 4, count: 0 }] });
  assert.equal(mapReviewStats("nope"), null);
  const r = mapReview({ id: 7, reviewer_name: "Ann", star_rating: 4, comment: "Great", published_at: "2026-09-01T10:00:00Z", is_replied: false })!;
  assert.deepEqual(r, { id: 7, reviewer: "Ann", rating: 4, comment: "Great", publishedAt: "2026-09-01", replied: false });
  assert.equal(mapReview({ id: 8, reviewer: { display_name: "Bo" }, rating: 5, reply: { comment: "Thanks" } })!.replied, true);
  assert.equal(mapReview({ id: 8, reviewer: { display_name: "Bo" } })!.reviewer, "Bo");
  const p = mapPost({ id: 3, status: "Published", topic_type: "STANDARD", published_at: "2026-09-20T01:02:03Z", content: "x".repeat(300) })!;
  assert.equal(p.publishedAt, "2026-09-20"); assert.equal(p.preview.length, 200);
  assert.equal(mapPost({ status: "Published" }), null);
});

test("cards carry what the desk shows", () => {
  const c = cardFromSummary(mapLocationSummary(summaryRaw)!, "2026-09-30T12:00:00Z", "https://x/94266");
  assert.ok(c.ok);
  if (c.ok) { assert.equal(c.rating, 5); assert.equal(c.reviewCount, 1); assert.equal(c.unanswered, 1); assert.equal(c.verified, true); assert.equal(c.searchAtlasUrl, "https://x/94266"); assert.equal(c.lastReviewDate, "2026-05-15"); }
  const d = cardFromDetail(mapLocation(detailRaw)!, mapReviewStats(statsRaw), [mapPost({ id: 1, status: "Published", published_at: "2026-08-01" })!, mapPost({ id: 2, status: "Published", published_at: "2026-09-10" })!, mapPost({ id: 3, status: "Scheduled", schedule_publishing_at: "2026-10-10" })!], "2026-09-30T12:00:00Z");
  assert.ok(d.ok);
  if (d.ok) { assert.equal(d.verified, false); assert.equal(d.lastPostDate, "2026-09-10", "scheduled posts do not count as the last post"); assert.equal(d.name, "Defoor Plumbing"); }
  const gone = cardFromDetail({ ...mapLocation(detailRaw)!, deleted: true }, null, [], "2026-09-30T12:00:00Z");
  assert.equal(gone.ok, false);
  assert.equal(cardUnavailable(1, "down", "t").ok, false);
  assert.equal(searchAtlasLocationUrl(94266, "https://example.com/gbp/{id}/overview"), "https://example.com/gbp/94266/overview");
  assert.ok(searchAtlasLocationUrl(94266, "").includes("94266"));
});

test("live access rules: only a verified listing promotes; a failed read never overrides staff", () => {
  const verified = cardFromSummary(mapLocationSummary(summaryRaw)!, "t");
  const unverified = cardFromSummary(mapLocationSummary({ ...summaryRaw, verified: false })!, "t");
  assert.deepEqual(accessFromCard(verified, "Requested"), { value: "Verified", changed: true, live: true });
  assert.deepEqual(accessFromCard(verified, "Verified"), { value: "Verified", changed: false, live: true });
  assert.deepEqual(accessFromCard(unverified, "Verified"), { value: "Requested", changed: true, live: true }, "Google says unverified → the desk shows Requested, whatever staff set");
  assert.deepEqual(accessFromCard(unverified, "Not Requested"), { value: "Not Requested", changed: false, live: true });
  assert.deepEqual(accessFromCard(unverified, ""), { value: "Requested", changed: true, live: true });
  assert.deepEqual(accessFromCard(cardUnavailable(1, "down", "t"), "Verified"), { value: "Verified", changed: false, live: false });
  assert.deepEqual(accessFromCard(null, "Requested"), { value: "Requested", changed: false, live: false });
});
