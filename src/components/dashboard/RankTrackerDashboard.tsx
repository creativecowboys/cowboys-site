"use client";

import { useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

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
    type: string | null;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankColor(rank: number | null): string {
    if (rank === null) return "rgba(255,255,255,0.2)";
    if (rank <= 3) return "#22c55e";
    if (rank <= 10) return "#2A9CF1";
    if (rank <= 20) return "#f59e0b";
    if (rank <= 50) return "rgba(255,255,255,0.55)";
    return "rgba(255,255,255,0.3)";
}

function RankCell({ rank, prev, change }: { rank: number | null; prev: number | null; change: number | null }) {
    return (
        <td style={{ padding: "10px 12px", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <span style={{
                    fontWeight: 800, fontSize: "16px",
                    color: rankColor(rank),
                    fontVariantNumeric: "tabular-nums",
                }}>
                    {rank !== null ? rank : "—"}
                </span>
                {change !== null && change !== 0 && (
                    <span style={{
                        fontSize: "10px", fontWeight: 700,
                        color: change > 0 ? "#22c55e" : "#f87171",
                    }}>
                        {change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
                    </span>
                )}
                {change === null && prev !== null && (
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>new</span>
                )}
            </div>
        </td>
    );
}

function StatCard({ label, value, sublabel, color }: {
    label: string; value: string | number; sublabel?: string; color: string;
}) {
    return (
        <div style={{
            flex: 1, minWidth: "110px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${color}25`,
            borderRadius: "14px",
            padding: "18px 20px",
        }}>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontSize: "26px", fontWeight: 900, color, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{value}</p>
            {sublabel && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{sublabel}</p>}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface RankTrackerDashboardProps {
    lrtReportId: number;
    businessName: string;
}

type SortKey = "keyword" | "google" | "mobile" | "local";
type FilterMode = "all" | "ranking" | "not-ranking" | "top10";

export default function RankTrackerDashboard({ lrtReportId, businessName }: RankTrackerDashboardProps) {
    const [data, setData] = useState<LRTData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey>("google");
    const [filter, setFilter] = useState<FilterMode>("all");

    useEffect(() => {
        fetch(`/api/brightlocal-lrt/${lrtReportId}`)
            .then((r) => {
                if (!r.ok) return r.json().then((e) => Promise.reject(e.error ?? "Error"));
                return r.json();
            })
            .then(setData)
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false));
    }, [lrtReportId]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
                <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    border: "3px solid rgba(42,156,241,0.2)", borderTopColor: "#2A9CF1",
                    animation: "spin 0.8s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading Rank Tracker data…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "12px", padding: "20px", fontSize: "13px", color: "rgba(255,255,255,0.5)",
            }}>
                ⚠️ Could not load Rank Tracker data: {error}
            </div>
        );
    }

    if (!data) return null;

    // Filter keywords
    const filtered = data.keywords.filter((k) => {
        if (filter === "ranking") return k.googleRank !== null || k.mobileRank !== null || k.localPackRank !== null;
        if (filter === "not-ranking") return k.googleRank === null && k.mobileRank === null && k.localPackRank === null;
        if (filter === "top10") return (k.googleRank !== null && k.googleRank <= 10) || (k.localPackRank !== null && k.localPackRank <= 10);
        return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === "keyword") return a.keyword.localeCompare(b.keyword);
        const rankField: Record<SortKey, keyof LRTKeyword> = {
            google: "googleRank",
            mobile: "mobileRank",
            local: "localPackRank",
            keyword: "keyword",
        };
        const fieldA = a[rankField[sortKey]] as number | null;
        const fieldB = b[rankField[sortKey]] as number | null;
        if (fieldA === null && fieldB === null) return 0;
        if (fieldA === null) return 1;
        if (fieldB === null) return -1;
        return fieldA - fieldB;
    });

    const rankingAny = data.keywords.filter((k) => k.googleRank !== null || k.mobileRank !== null || k.localPackRank !== null).length;
    const notRanking = data.keywords.length - rankingAny;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                        📊 <strong style={{ color: "rgba(255,255,255,0.5)" }}>{data.reportName}</strong> · BrightLocal Rank Tracker
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                        📍 {data.location} · {data.schedule} scans · Last run: {data.lastProcessedAt
                            ? new Date(data.lastProcessedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "N/A"}
                    </p>
                </div>
                {data.website && (
                    <a href={data.website} target="_blank" rel="noreferrer" style={{
                        fontSize: "12px", color: "rgba(42,156,241,0.7)", textDecoration: "none",
                    }}>
                        🔗 {new URL(data.website).hostname}
                    </a>
                )}
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <StatCard
                    label="Avg Google Rank"
                    value={data.avgGoogleRank !== null ? `#${data.avgGoogleRank}` : "—"}
                    sublabel="organic desktop"
                    color="#2A9CF1"
                />
                <StatCard
                    label="Avg Mobile Rank"
                    value={data.avgMobileRank !== null ? `#${data.avgMobileRank}` : "—"}
                    sublabel="organic mobile"
                    color="#92A6DB"
                />
                <StatCard
                    label="Keywords"
                    value={data.keywords.length}
                    sublabel={`${data.rankingKeywords} ranking on Google`}
                    color="rgba(255,255,255,0.6)"
                />
                <StatCard
                    label="Top 3"
                    value={data.top3Keywords}
                    sublabel="Google desktop"
                    color="#22c55e"
                />
                <StatCard
                    label="Top 10"
                    value={data.top10Keywords}
                    sublabel="Google desktop"
                    color="#2A9CF1"
                />
                <StatCard
                    label="Top 20"
                    value={data.top20Keywords}
                    sublabel="Google desktop"
                    color="#f59e0b"
                />
            </div>

            {/* ── Competitors ── */}
            {data.competitors.length > 0 && (
                <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px", padding: "14px 18px",
                }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 10px" }}>
                        Tracked Competitors
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {data.competitors.map((c, i) => (
                            <a key={i} href={c.url} target="_blank" rel="noreferrer" style={{
                                fontSize: "12px", fontWeight: 500,
                                padding: "4px 12px", borderRadius: "99px",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.55)",
                                textDecoration: "none",
                            }}>
                                {c.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Keywords Table ── */}
            <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px", overflow: "hidden",
            }}>
                {/* Table header + controls */}
                <div style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
                }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                        Keywords ({sorted.length})
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {(["all", "ranking", "top10", "not-ranking"] as FilterMode[]).map((f) => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: "4px 12px", borderRadius: "99px", border: "1px solid",
                                fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 150ms",
                                borderColor: filter === f ? "#2A9CF1" : "rgba(255,255,255,0.12)",
                                background: filter === f ? "rgba(42,156,241,0.15)" : "transparent",
                                color: filter === f ? "#2A9CF1" : "rgba(255,255,255,0.4)",
                            }}>
                                {f === "all" ? `All (${data.keywords.length})` :
                                    f === "ranking" ? `Ranking (${rankingAny})` :
                                        f === "top10" ? `Top 10 (${data.top10Keywords})` :
                                            `Not Ranking (${notRanking})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                {[
                                    { key: "keyword", label: "Keyword" },
                                    { key: "google", label: "Desktop" },
                                    { key: "mobile", label: "Mobile" },
                                    { key: "local", label: "Local Pack" },
                                ].map(({ key, label }) => (
                                    <th key={key}
                                        onClick={() => setSortKey(key as SortKey)}
                                        style={{
                                            padding: "10px 12px",
                                            fontWeight: 600, fontSize: "10px", letterSpacing: "0.08em",
                                            textTransform: "uppercase", cursor: "pointer",
                                            color: sortKey === key ? "#2A9CF1" : "rgba(255,255,255,0.35)",
                                            textAlign: key === "keyword" ? "left" : "center",
                                            whiteSpace: "nowrap",
                                            userSelect: "none",
                                        }}>
                                        {label} {sortKey === key ? "▲" : ""}
                                    </th>
                                ))}
                                <th style={{ padding: "10px 12px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textAlign: "left" }}>
                                    URL / Type
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((kw, i) => {
                                const anyRanking = kw.googleRank !== null || kw.mobileRank !== null || kw.localPackRank !== null;
                                return (
                                    <tr key={`${kw.keyword}-${i}`} style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                        opacity: anyRanking ? 1 : 0.5,
                                    }}
                                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 500, color: "#fff", maxWidth: "300px" }}>
                                            {kw.keyword}
                                        </td>
                                        <RankCell rank={kw.googleRank} prev={kw.googlePrev} change={kw.googleChange} />
                                        <RankCell rank={kw.mobileRank} prev={kw.mobilePrev} change={kw.mobileChange} />
                                        <RankCell rank={kw.localPackRank} prev={kw.localPackPrev} change={kw.localPackChange} />
                                        <td style={{ padding: "10px 12px", maxWidth: "200px" }}>
                                            {kw.url ? (
                                                <a href={kw.url} target="_blank" rel="noreferrer"
                                                    style={{ fontSize: "11px", color: "rgba(42,156,241,0.65)", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                    title={kw.url}
                                                >
                                                    {kw.url.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 40)}
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>not ranking</span>
                                            )}
                                            {kw.type && (
                                                <span style={{
                                                    fontSize: "10px", fontWeight: 600, marginTop: "2px", display: "block",
                                                    color: kw.type === "Local" ? "#2A9CF1" : "rgba(255,255,255,0.3)",
                                                }}>
                                                    {kw.type}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {sorted.length === 0 && (
                        <p style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
                            No keywords match this filter.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
