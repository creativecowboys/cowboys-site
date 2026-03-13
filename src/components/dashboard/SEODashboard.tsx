"use client";

import { useEffect, useState } from "react";
import type {
    BrightLocalSEOData,
    BrightLocalKeyword,
    BrightLocalCompetitor,
} from "@/lib/brightlocal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankLabel(rank: number | null): string {
    if (rank === null) return "—";
    if (rank <= 26) return String.fromCharCode(64 + rank);
    return `#${rank}`;
}

function rankColor(rank: number | null): string {
    if (rank === null) return "rgba(255,255,255,0.25)";
    if (rank <= 3) return "#22c55e";
    if (rank <= 10) return "#2A9CF1";
    if (rank <= 20) return "#f59e0b";
    return "rgba(255,255,255,0.45)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label, value, sublabel, accentColor,
}: {
    label: string; value: string | number; sublabel?: string; accentColor: string;
}) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${accentColor}25`,
            borderRadius: "14px",
            padding: "20px 22px",
            flex: 1,
            minWidth: "120px",
        }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>
                {label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: 800, color: accentColor, margin: "0 0 2px", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {value}
            </p>
            {sublabel && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{sublabel}</p>
            )}
        </div>
    );
}

function ChangeBadge({ change }: { change: number | null }) {
    if (change === null || change === 0)
        return <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>—</span>;
    const up = change > 0;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "2px",
            fontSize: "11px", fontWeight: 600,
            color: up ? "#22c55e" : "#f87171",
            background: up ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${up ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
            borderRadius: "6px", padding: "2px 6px",
        }}>
            {up ? "▲" : "▼"} {Math.abs(change)}
        </span>
    );
}

// ─── Competitor Table ─────────────────────────────────────────────────────────

function CompetitorTable({ competitors, keyword }: { competitors: BrightLocalCompetitor[]; keyword: string }) {
    if (competitors.length === 0) {
        return (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: "12px 0 0" }}>
                No competitor data available for this keyword.
            </p>
        );
    }
    return (
        <div style={{ overflowX: "auto", marginTop: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {["Pack", "Business", "Reviews", "Rating", "DA", "Citations", "Photos"].map((h) => (
                            <th key={h} style={{
                                padding: "8px 12px", textAlign: "left",
                                fontSize: "10px", fontWeight: 600,
                                letterSpacing: "0.07em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap",
                            }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {competitors.map((c, i) => (
                        <tr
                            key={i}
                            style={{
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                background: c.isClient ? "rgba(42,156,241,0.06)" : "transparent",
                            }}
                        >
                            <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                                <span style={{
                                    display: "inline-block",
                                    width: "26px", height: "26px",
                                    lineHeight: "26px", textAlign: "center",
                                    borderRadius: "8px",
                                    fontSize: "12px", fontWeight: 800,
                                    background: c.rankNum <= 3 ? "rgba(34,197,94,0.15)" :
                                        c.rankNum <= 7 ? "rgba(42,156,241,0.12)" :
                                            "rgba(255,255,255,0.06)",
                                    color: c.rankNum <= 3 ? "#22c55e" :
                                        c.rankNum <= 7 ? "#2A9CF1" :
                                            "rgba(255,255,255,0.5)",
                                }}>
                                    {c.rank}
                                </span>
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                                <span style={{
                                    color: c.isClient ? "#2A9CF1" : "#fff",
                                    fontWeight: c.isClient ? 700 : 400,
                                }}>
                                    {c.businessName}
                                    {c.isClient && (
                                        <span style={{
                                            marginLeft: "8px", fontSize: "10px",
                                            background: "rgba(42,156,241,0.2)", color: "#2A9CF1",
                                            borderRadius: "4px", padding: "1px 5px", fontWeight: 700,
                                        }}>YOU</span>
                                    )}
                                </span>
                                {c.categories.length > 0 && (
                                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                                        {c.categories.slice(0, 2).join(" · ")}
                                    </p>
                                )}
                            </td>
                            <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
                                {c.numReviews.toLocaleString()}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#f59e0b", textAlign: "right", fontWeight: 600 }}>
                                {c.starRating > 0 ? `${c.starRating}★` : "—"}
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                <span style={{
                                    color: c.domainAuthority >= 50 ? "#22c55e" :
                                        c.domainAuthority >= 20 ? "#f59e0b" :
                                            "rgba(255,255,255,0.45)",
                                    fontWeight: 600,
                                }}>
                                    {c.domainAuthority > 0 ? c.domainAuthority : "—"}
                                </span>
                            </td>
                            <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                                {c.citationsCount > 0 ? c.citationsCount.toLocaleString() : "—"}
                            </td>
                            <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>
                                {c.numPhotos > 0 ? c.numPhotos : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Keyword Card (expandable) ────────────────────────────────────────────────

function KeywordCard({ kw }: { kw: BrightLocalKeyword }) {
    const [open, setOpen] = useState(false);
    const rank = kw.currentRank;
    const color = rankColor(rank);
    const isRanking = rank !== null;

    return (
        <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${isRanking ? color + "30" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "14px",
            overflow: "hidden",
            transition: "border-color 200ms ease",
        }}>
            {/* ── Header row ── */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: "100%", background: "transparent", border: "none",
                    cursor: "pointer", padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: "16px",
                    textAlign: "left",
                }}
            >
                {/* Pack position badge */}
                <div style={{
                    width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
                    background: isRanking ? color + "18" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${isRanking ? color + "40" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isRanking ? "20px" : "14px", fontWeight: 900, color,
                }}>
                    {isRanking ? rankLabel(rank) : "—"}
                </div>

                {/* Keyword + sub-info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {kw.keyword}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                        {isRanking
                            ? `Local pack position ${rankLabel(rank)} · Google Local`
                            : "Not in local pack · Google Local"}
                        {kw.competitors.length > 0 && ` · ${kw.competitors.length} competitors tracked`}
                    </p>
                </div>

                {/* Change badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <ChangeBadge change={kw.change} />
                    {kw.previousRank !== null && (
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                            prev: {rankLabel(kw.previousRank)}
                        </span>
                    )}
                </div>

                {/* Expand chevron */}
                <span style={{
                    fontSize: "14px", color: "rgba(255,255,255,0.3)",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms ease",
                    flexShrink: 0,
                }}>▼</span>
            </button>

            {/* ── Expanded section ── */}
            {open && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
                    <p style={{
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 8px",
                    }}>
                        Local Pack Results
                    </p>
                    <CompetitorTable competitors={kw.competitors} keyword={kw.keyword} />

                    {/* Top citation sources */}
                    {kw.topCitations.length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <p style={{
                                fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                                textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 10px",
                            }}>
                                Top Citation Directories (by authority)
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {kw.topCitations.slice(0, 15).map((c, i) => (
                                    <span key={i} style={{
                                        fontSize: "11px", fontWeight: 500,
                                        padding: "3px 10px", borderRadius: "99px",
                                        background: c.clientHasCitation
                                            ? "rgba(34,197,94,0.12)"
                                            : "rgba(255,255,255,0.05)",
                                        border: c.clientHasCitation
                                            ? "1px solid rgba(34,197,94,0.25)"
                                            : "1px solid rgba(255,255,255,0.08)",
                                        color: c.clientHasCitation
                                            ? "#22c55e"
                                            : "rgba(255,255,255,0.45)",
                                    }}>
                                        {c.domain} <span style={{ opacity: 0.5 }}>DA{c.authority}</span>
                                    </span>
                                ))}
                            </div>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "8px 0 0" }}>
                                🟢 Green = your business is listed on that directory
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface SEODashboardProps {
    campaignId: number;
    businessName: string;
}

export default function SEODashboard({ campaignId, businessName }: SEODashboardProps) {
    const [data, setData] = useState<BrightLocalSEOData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "ranking" | "not-ranking">("all");

    useEffect(() => {
        fetch(`/api/brightlocal/${campaignId}`)
            .then((r) => {
                if (!r.ok) return r.json().then((e) => Promise.reject(e.error ?? "API error"));
                return r.json();
            })
            .then(setData)
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false));
    }, [campaignId]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" }}>
                <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    border: "3px solid rgba(42,156,241,0.2)", borderTopColor: "#2A9CF1",
                    animation: "spin 0.8s linear infinite", flexShrink: 0,
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Loading SEO data from BrightLocal…</span>
            </div>
        );
    }

    if (error) {
        const notConfigured = error.includes("not configured");
        return (
            <div style={{
                background: notConfigured ? "rgba(241,95,42,0.06)" : "rgba(248,113,113,0.07)",
                border: `1px solid ${notConfigured ? "rgba(241,95,42,0.2)" : "rgba(248,113,113,0.2)"}`,
                borderRadius: "14px", padding: "28px 24px",
                display: "flex", flexDirection: "column", gap: "8px",
            }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>
                    {notConfigured ? "⚙️ BrightLocal API Key Not Configured" : "⚠️ Could not load SEO data"}
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                    {notConfigured
                        ? "Add your BrightLocal API key to .env.local as BRIGHTLOCAL_API_KEY and restart the server."
                        : error}
                </p>
            </div>
        );
    }

    if (!data) return null;

    const filteredKeywords = data.keywords.filter((k) => {
        if (filter === "ranking") return k.currentRank !== null;
        if (filter === "not-ranking") return k.currentRank === null;
        return true;
    });

    const rankingCount = data.keywords.filter((k) => k.currentRank !== null).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    📍 <strong style={{ color: "rgba(255,255,255,0.5)" }}>{data.businessName}</strong> · BrightLocal Local Pack Report
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                    Last fetched: {new Date(data.reportDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <StatCard
                    label="Avg. Pack Position"
                    value={data.avgPosition !== null ? rankLabel(data.avgPosition) : "—"}
                    sublabel={data.avgPosition !== null ? `Position ${data.avgPosition} across keywords` : "No rankings yet"}
                    accentColor="#2A9CF1"
                />
                <StatCard
                    label="Keywords"
                    value={data.keywordsTracked}
                    sublabel={`${rankingCount} in local pack`}
                    accentColor="#92A6DB"
                />
                <StatCard
                    label="In Pack (A–C)"
                    value={data.inTop3}
                    sublabel={`of ${data.keywordsTracked} keywords`}
                    accentColor="#22c55e"
                />
                {data.starRating !== undefined && (
                    <StatCard
                        label="Star Rating"
                        value={`${data.starRating}★`}
                        sublabel={`${data.numReviews ?? "—"} reviews`}
                        accentColor="#f59e0b"
                    />
                )}
                {data.citationsCount !== undefined && (
                    <StatCard
                        label="Citations"
                        value={data.citationsCount}
                        sublabel="across directories"
                        accentColor="#a855f7"
                    />
                )}
                {data.numPhotos !== undefined && (
                    <StatCard
                        label="Photos"
                        value={data.numPhotos}
                        sublabel="on Google profile"
                        accentColor="#06b6d4"
                    />
                )}
            </div>

            {/* ── Business Profile bar ── */}
            {(data.address || data.telephone) && (
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px", padding: "12px 18px",
                    display: "flex", gap: "24px", flexWrap: "wrap",
                    alignItems: "center",
                }}>
                    {data.address && (
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                            📍 {data.address}
                        </span>
                    )}
                    {data.telephone && (
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                            📞 {data.telephone}
                        </span>
                    )}
                    {data.claimed !== undefined && (
                        <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                            background: data.claimed ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
                            color: data.claimed ? "#22c55e" : "#f87171",
                        }}>
                            {data.claimed ? "✓ Profile Claimed" : "✗ Unclaimed"}
                        </span>
                    )}
                </div>
            )}

            {/* ── Keywords header + filter ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                    Tracked Keywords
                    <span style={{ marginLeft: "8px", fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
                        ({data.keywordsTracked} total · click any to see competitor data)
                    </span>
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                    {(["all", "ranking", "not-ranking"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: "5px 14px", borderRadius: "99px", border: "1px solid",
                                fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease",
                                borderColor: filter === f ? "#2A9CF1" : "rgba(255,255,255,0.12)",
                                background: filter === f ? "rgba(42,156,241,0.15)" : "transparent",
                                color: filter === f ? "#2A9CF1" : "rgba(255,255,255,0.45)",
                            }}
                        >
                            {f === "all" ? `All (${data.keywordsTracked})` : f === "ranking" ? `In Pack (${rankingCount})` : `Not Ranking (${data.keywordsTracked - rankingCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Keyword Cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredKeywords.map((kw, i) => (
                    <KeywordCard key={`${kw.keyword}-${i}`} kw={kw} />
                ))}
                {filteredKeywords.length === 0 && (
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "32px" }}>
                        No keywords match this filter.
                    </p>
                )}
            </div>

            {/* ── SEO Tip ── */}
            {rankingCount < data.keywordsTracked && (
                <div style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    borderRadius: "12px", padding: "14px 18px",
                    fontSize: "13px", color: "rgba(245,158,11,0.8)",
                }}>
                    💡 <strong>{data.keywordsTracked - rankingCount} keyword{data.keywordsTracked - rankingCount !== 1 ? "s are" : " is"}</strong> not yet ranking in the local pack. Expand each keyword card to see who is ranking and what their competitive advantage is.
                </div>
            )}
        </div>
    );
}
