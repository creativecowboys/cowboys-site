// Normalized Search Atlas GBP shapes used by the desk. The raw Search Atlas payloads are mapped into these in
// searchatlas.ts so the UI and Monday writers never depend on Search Atlas field names.

export type GbpLocationSummary = {
  id: number; name: string; city: string; category: string;
  verified: boolean; locked: boolean; profileCompleteness: number;
  reviews: { count: number; avgRating: number; lastReviewDate: string; replied: number; pendingReply: number } | null;
  posts: { count: number; published: number; lastPostDate: string } | null;
};
export type GbpLocation = {
  id: number; name: string; address: string; phone: string; website: string; placeId: string;
  verified: boolean; deleted: boolean; profileCompleteness: number; openStatus: string; category: string;
  pendingSyncFields: string[];
};
export type GbpReviewStats = { total: number; avgRating: number; replied: number; unreplied: number; replyRate: number; distribution: { stars: number; count: number }[] };
export type GbpReview = { id: number; reviewer: string; rating: number; comment: string; publishedAt: string; replied: boolean };
export type GbpPost = { id: number; status: string; type: string; publishedAt: string; scheduledFor: string; preview: string };

/** What the desk shows for a linked client. `ok:false` carries the reason so the UI can say why the live read failed. */
export type GbpCard =
  | { ok: true; listingId: number; name: string; verified: boolean; connected: true; rating: number; reviewCount: number; unanswered: number; lastReviewDate: string; lastPostDate: string; profileCompleteness: number; searchAtlasUrl: string; fetchedAt: string }
  | { ok: false; listingId: number; connected: false; reason: string; fetchedAt: string };
