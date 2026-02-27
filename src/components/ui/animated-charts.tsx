"use client";

import React, { useEffect, useRef, useState } from "react";

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const BLUE = "#56CCF2";

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. KEYWORD RANKING BARS — shows before/after for SEO page
// ─────────────────────────────────────────────────────────────────────────────
interface RankingBar {
    keyword: string;
    before: number; // rank number (lower = better, e.g. 24 = pos 24)
    after: number;  // e.g. 1 = pos 1
}

interface KeywordRankingChartProps {
    data?: RankingBar[];
    title?: string;
    subtitle?: string;
}

export function KeywordRankingChart({
    data = [
        { keyword: "personal injury lawyer georgia", before: 24, after: 1 },
        { keyword: "car accident attorney villa rica", before: 18, after: 1 },
        { keyword: "slip and fall lawyer west georgia", before: 31, after: 2 },
        { keyword: "wrongful death attorney ga", before: 27, after: 3 },
        { keyword: "truck accident lawyer georgia", before: 22, after: 1 },
    ],
    title = "Keyword Ranking Improvement",
    subtitle = "Google position before → after SEO campaign",
}: KeywordRankingChartProps) {
    const { ref, inView } = useInView(0.15);
    const MAX = 35;

    return (
        <div ref={ref} style={{ width: "100%" }}>
            <div style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", margin: 0 }}>{subtitle}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {data.map(({ keyword, before, after }, i) => {
                    const delayBefore = 80 + i * 100;
                    const delayAfter = 300 + i * 100;
                    const beforeW = inView ? `${(before / MAX) * 100}%` : "0%";
                    const afterW = inView ? `${Math.max((after / MAX) * 100, 4)}%` : "0%";

                    return (
                        <div key={keyword}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{keyword}</span>
                                <span style={{ fontSize: "11px", color: ORANGE, fontWeight: 700, flexShrink: 0, marginLeft: "12px" }}>
                                    #{before} → <span style={{ color: "#4ade80" }}>#{after}</span>
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {/* Before bar */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", width: "30px", flexShrink: 0, textAlign: "right" }}>BEFORE</span>
                                    <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: "4px",
                                            background: "rgba(255,255,255,0.18)",
                                            width: beforeW,
                                            transition: `width 800ms cubic-bezier(0.4,0,0.2,1) ${delayBefore}ms`,
                                        }} />
                                    </div>
                                </div>
                                {/* After bar */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", width: "30px", flexShrink: 0, textAlign: "right" }}>AFTER</span>
                                    <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: "4px",
                                            background: `linear-gradient(90deg, #22c55e 0%, #16a34a 100%)`,
                                            width: afterW,
                                            transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${delayAfter}ms`,
                                            boxShadow: inView ? "0 0 8px rgba(34,197,94,0.40)" : "none",
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "20px", marginTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "12px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.18)" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Before</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "12px", height: "4px", borderRadius: "2px", background: "#22c55e" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>After</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRAFFIC SPARKLINE — organic traffic growth over 12 months
// ─────────────────────────────────────────────────────────────────────────────
interface SparklineProps {
    data?: number[];
    color?: string;
    height?: number;
    label?: string;
    valueLabel?: string;
}

export function TrafficSparkline({
    data = [120, 135, 128, 160, 195, 220, 248, 290, 342, 390, 455, 528],
    color = ORANGE,
    height = 80,
    label = "Organic Traffic",
    valueLabel = "+340%",
}: SparklineProps) {
    const { ref, inView } = useInView(0.2);
    const W = 300;
    const H = height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / (max - min)) * (H - 10) - 5;
        return `${x},${y}`;
    });
    const polyline = pts.join(" ");
    const areaPath = `M0,${H} L${pts.join(" L")} L${W},${H} Z`;

    return (
        <div ref={ref}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em" }}>{valueLabel}</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
                <defs>
                    <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.30" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.00" />
                    </linearGradient>
                    <clipPath id={`sc-${label}`}>
                        <rect
                            x="0" y="0" height={H + 10}
                            width={inView ? W : 0}
                            style={{ transition: "width 1400ms cubic-bezier(0.4,0,0.2,1) 200ms" }}
                        />
                    </clipPath>
                </defs>
                {/* Area fill */}
                <path d={areaPath} fill={`url(#sg-${label})`} clipPath={`url(#sc-${label})`} />
                {/* Line */}
                <polyline
                    points={polyline}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    clipPath={`url(#sc-${label})`}
                />
                {/* End dot */}
                {inView && (
                    <circle
                        cx={W} cy={pts[pts.length - 1].split(",")[1]}
                        r="4" fill={color}
                        style={{ opacity: inView ? 1 : 0, transition: "opacity 300ms ease 1500ms" }}
                    />
                )}
            </svg>
            {/* Month labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                {["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"].map(m => (
                    <span key={m} style={{ fontSize: "9px", color: "rgba(255,255,255,0.20)" }}>{m}</span>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RESULTS METRICS CHART — animated horizontal bars for Results page
// ─────────────────────────────────────────────────────────────────────────────
interface MetricBarProps {
    label: string;
    value: number;      // 0–100 display %
    displayValue: string;
    color: string;
    delay?: number;
}

function MetricBar({ label, value, displayValue, color, delay = 0 }: MetricBarProps) {
    const { ref, inView } = useInView(0.1);
    return (
        <div ref={ref}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{displayValue}</span>
            </div>
            <div style={{ height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    borderRadius: "5px",
                    background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
                    width: inView ? `${value}%` : "0%",
                    transition: `width 1000ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
                    boxShadow: inView ? `0 0 10px ${color}50` : "none",
                }} />
            </div>
        </div>
    );
}

interface ResultsMetricsChartProps {
    title?: string;
}

export function ResultsMetricsChart({ title = "Client Outcomes" }: ResultsMetricsChartProps) {
    const metrics = [
        { label: "Jackson Law — #1 Rankings achieved", value: 95, displayValue: "21 #1 positions", color: ORANGE, delay: 0 },
        { label: "Harmonic Productions — Engagement growth", value: 90, displayValue: "+300%", color: PINK, delay: 150 },
        { label: "Insurance Agency — Consistent lead ROI", value: 85, displayValue: "2+ Years", color: BLUE, delay: 300 },
        { label: "Avg. organic traffic increase (SEO clients)", value: 78, displayValue: "+220% avg", color: "#4ade80", delay: 450 },
        { label: "Client retention rate", value: 92, displayValue: "92%", color: "#a78bfa", delay: 600 },
    ];

    return (
        <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: "24px" }}>
                {title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {metrics.map(m => <MetricBar key={m.label} {...m} />)}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANIMATED COUNTER — counts up to a number on scroll
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedCounterProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    color?: string;
    label?: string;
}

export function AnimatedCounter({
    end,
    suffix = "",
    prefix = "",
    duration = 1800,
    color = "#fff",
    label = "",
}: AnimatedCounterProps) {
    const { ref, inView } = useInView(0.3);
    const [count, setCount] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        if (!inView || started.current) return;
        started.current = true;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, end, duration]);

    return (
        <div ref={ref} style={{ textAlign: "center" }}>
            <p style={{
                fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 900,
                color, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1,
            }}>
                {prefix}{count.toLocaleString()}{suffix}
            </p>
            {label && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HOMEPAGE DASHBOARD WIDGET — mini metrics dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardWidget() {
    const { ref, inView } = useInView(0.15);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const barData = [38, 45, 42, 58, 72, 80, 88, 95, 100, 107, 118, 132];
    const maxBar = Math.max(...barData);

    return (
        <div
            ref={ref}
            style={{
                background: "linear-gradient(145deg, #1a1d26 0%, #12141c 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "28px",
                width: "100%",
                fontFamily: "var(--font-geist-sans, monospace)",
            }}
        >
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>Organic Traffic</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                        12,847 <span style={{ fontSize: "13px", fontWeight: 400, color: "#4ade80" }}>↑ 340%</span>
                    </p>
                </div>
                <div style={{
                    padding: "6px 12px", borderRadius: "999px",
                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                    fontSize: "11px", fontWeight: 700, color: "#4ade80",
                }}>
                    vs last year
                </div>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "80px", marginBottom: "8px" }}>
                {barData.map((val, i) => {
                    const pct = (val / maxBar) * 100;
                    const isLast = i === barData.length - 1;
                    if (!inView) return <div key={i} style={{ flex: 1, height: "4px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", alignSelf: "flex-end" }} />;
                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: `${pct}%`,
                                minHeight: "4px",
                                borderRadius: "4px 4px 2px 2px",
                                background: isLast
                                    ? `linear-gradient(180deg, ${ORANGE} 0%, #c94a1a 100%)`
                                    : i >= 9
                                        ? "rgba(241,95,42,0.45)"
                                        : "rgba(255,255,255,0.12)",
                                transition: `height 700ms cubic-bezier(0.4,0,0.2,1) ${i * 60}ms`,
                                boxShadow: isLast ? `0 0 12px ${ORANGE}50` : "none",
                            }}
                        />
                    );
                })}
            </div>

            {/* Month labels */}
            <div style={{ display: "flex", gap: "5px" }}>
                {months.map((m, i) => (
                    <div key={i} style={{ flex: 1, fontSize: "7px", color: "rgba(255,255,255,0.20)", textAlign: "center" }}>{m[0]}</div>
                ))}
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                    { label: "Leads", value: inView ? "247" : "0", color: ORANGE },
                    { label: "Keywords #1", value: inView ? "21" : "0", color: "#4ade80" },
                    { label: "Avg. CPC", value: "$3.40", color: BLUE },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "16px", fontWeight: 800, color, margin: "0 0 3px", letterSpacing: "-0.02em" }}>{value}</p>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.30)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DONUT / PIE CHART — channel attribution (for stats section)
// ─────────────────────────────────────────────────────────────────────────────
interface DonutSlice {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data?: DonutSlice[];
    title?: string;
}

export function DonutChart({
    data = [
        { label: "Organic Search", value: 52, color: ORANGE },
        { label: "Google Ads", value: 24, color: BLUE },
        { label: "Social Media", value: 14, color: PINK },
        { label: "Direct / Other", value: 10, color: "#a78bfa" },
    ],
    title = "Lead Source Breakdown",
}: DonutChartProps) {
    const { ref, inView } = useInView(0.2);
    const R = 60;
    const CX = 80;
    const CY = 80;
    const circumference = 2 * Math.PI * R;

    let cumulativePercent = 0;
    const slices = data.map(d => {
        const start = cumulativePercent;
        cumulativePercent += d.value;
        return { ...d, start };
    });

    return (
        <div ref={ref}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: "20px" }}>
                {title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                    {slices.map(({ label, value, color, start }) => {
                        const startAngle = (start / 100) * circumference;
                        const segLength = inView ? (value / 100) * circumference : 0;
                        const gap = 3;
                        return (
                            <circle
                                key={label}
                                cx={CX} cy={CY} r={R}
                                fill="none"
                                stroke={color}
                                strokeWidth="22"
                                strokeDasharray={`${Math.max(segLength - gap, 0)} ${circumference}`}
                                strokeDashoffset={-startAngle + circumference * 0.25}
                                style={{
                                    transition: `stroke-dasharray 1000ms cubic-bezier(0.4,0,0.2,1) ${slices.indexOf(slices.find(s => s.label === label)!) * 150}ms`,
                                    transform: "rotate(0deg)",
                                    transformOrigin: "center",
                                }}
                            />
                        );
                    })}
                    {/* Center label */}
                    <text x={CX} y={CY - 6} textAnchor="middle" style={{ fontSize: "18px", fontWeight: 800, fill: "#fff" }}>Leads</text>
                    <text x={CX} y={CY + 12} textAnchor="middle" style={{ fontSize: "10px", fill: "rgba(255,255,255,0.40)" }}>by source</text>
                </svg>

                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    {data.map(({ label, value, color }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", flex: 1 }}>{label}</span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
