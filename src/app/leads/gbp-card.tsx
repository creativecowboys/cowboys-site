"use client";

import { useState } from "react";
import type { GbpCard, GbpLocationSummary } from "@/lib/gbp/types";

// Shared by the Onboarding and Clients panels: pick the client's Search Atlas listing, then show what Search Atlas
// says about it right now. The link writes the listing id to Monday; the card is a live read (cached 10 minutes).
const fmt = (v: string) => (v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "never");
const ago = (iso: string) => { const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`; };

export function GbpLink({ listing, locations, connected, card, busy, onLink, onRefreshed }: {
  listing: string; locations: GbpLocationSummary[]; connected: boolean; card: GbpCard | null; busy: boolean;
  onLink: (listingId: string) => void; onRefreshed: () => Promise<void> | void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const linkedKnown = !listing || locations.some((l) => String(l.id) === listing);
  const refresh = async () => {
    if (!listing || refreshing) return;
    setRefreshing(true); setRefreshError("");
    try { const r = await fetch(`/api/team/gbp/card/${listing}?fresh=1`, { cache: "no-store" }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Refresh failed."); await onRefreshed(); }
    catch (e) { setRefreshError(e instanceof Error ? e.message : "Refresh failed."); }
    finally { setRefreshing(false); }
  };
  return <div className="ob-gbp">
    <div className="ob-controls">
      <label>Link to Search Atlas listing
        <select value={listing} disabled={busy || !connected} onChange={(e) => onLink(e.target.value)}>
          <option value="">{connected ? "Not linked" : "Search Atlas not connected"}</option>
          {!linkedKnown && <option value={listing}>Listing {listing} (not on our account)</option>}
          {locations.map((l) => <option key={l.id} value={String(l.id)}>{l.name}{l.city ? ` · ${l.city}` : ""}{l.verified ? "" : " · unverified"}</option>)}
        </select>
      </label>
    </div>
    {!connected && <p className="call-muted ob-hint">Add <code>SEARCH_ATLAS_API_KEY</code> on Vercel (Search Atlas → Settings → API Keys) to link listings and read live GBP state.</p>}
    {connected && !locations.length && <p className="call-muted ob-hint">No listings came back from Search Atlas. If the key is new, check it under Settings → API Keys and redeploy.</p>}
    {card && card.ok && <div className="ob-gbp-card">
      <div className="ob-gbp-head"><b>{card.name}</b><i className={`ob-stage ${card.verified ? "ob-stage-launched" : "ob-stage-hold"}`}>{card.verified ? "Connected · verified" : "Connected · not verified in Google"}</i></div>
      <div className="ob-grid">
        <div><span>Rating</span><b>{card.reviewCount ? `${card.rating.toFixed(1)} ★` : "—"}</b></div>
        <div><span>Reviews</span><b>{card.reviewCount}</b><small>last {fmt(card.lastReviewDate)}</small></div>
        <div><span>Unanswered</span><b className={card.unanswered ? "ob-overdue" : "ob-ok"}>{card.unanswered}</b></div>
        <div><span>Last post</span><b>{fmt(card.lastPostDate)}</b></div>
        <div><span>Profile complete</span><b>{Math.round(card.profileCompleteness)}%</b></div>
      </div>
      <div className="ob-buttons"><a className="call-secondary" href={card.searchAtlasUrl} target="_blank" rel="noreferrer">Open in Search Atlas ↗</a><button type="button" className="call-secondary" disabled={refreshing || busy} onClick={refresh}>{refreshing ? "Refreshing…" : "Refresh live"}</button></div>
      <p className="call-muted ob-hint">Read from Search Atlas {ago(card.fetchedAt)}. A verified listing sets GBP access to Verified on its own; the dropdown below still overrides.</p>
    </div>}
    {card && !card.ok && <div className="call-alert" role="status"><strong>Search Atlas could not read listing {card.listingId}.</strong> {card.reason} <button type="button" className="call-secondary" disabled={refreshing || busy} onClick={refresh}>{refreshing ? "Retrying…" : "Try again"}</button></div>}
    {refreshError && <p className="ob-overdue">{refreshError}</p>}
  </div>;
}
