import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";
import { AnimatedCounter, ResultsMetricsChart, DonutChart } from "@/components/ui/animated-charts";

export const metadata: Metadata = {
    title: "Real Results for Real West Georgia Businesses | Creative Cowboys",
    description:
        "See the real results Creative Cowboys has delivered for West Georgia small businesses. Case studies in SEO, PPC, and web design. Transparent reporting. Measurable growth.",
    alternates: { canonical: "/results" },
    openGraph: {
        title: "Real Results for Real West Georgia Businesses | Creative Cowboys",
        description: "21 #1 Google rankings. 300% engagement increase. 2 years of consistent ROI. See what Creative Cowboys does for West Georgia small businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const caseStudies = [
    {
        icon: Trophy,
        color: ORANGE,
        glow: "rgba(241,95,42,0.15)",
        client: "John B. Jackson Law",
        industry: "Personal Injury Law — Georgia",
        result: "21 #1 Rankings",
        resultSub: "in competitive personal injury search terms",
        description: "Jackson Law came to us with a website that wasn't ranking and a marketing strategy relying entirely on referrals. We rebuilt their SEO strategy from the ground up — keyword research, on-page optimization, Google Business Profile optimization, and a content strategy targeting the most competitive personal injury terms in Georgia.",
        outcome: "Within 6 months, they held 21 #1 positions on Google for their target keywords. Organic leads became their primary acquisition channel, reducing dependence on referrals and paid advertising.",
        services: ["SEO", "Google Business Profile Optimization", "Content Strategy", "Web Design"],
        serviceLinks: ["/seo", "/seo", "/seo", "/web-design"],
    },
    {
        icon: TrendingUp,
        color: "#56CCF2",
        glow: "rgba(86,204,242,0.12)",
        client: "Commercial Insurance Agency",
        industry: "B2B Insurance — West Georgia",
        result: "2 Years of Great ROI",
        resultSub: "from consistent Google Ads management",
        description: "This commercial insurance agency needed a reliable, scalable lead generation system. Referrals alone couldn't fuel their growth goals. We built and manage a Google Ads campaign targeting commercial insurance buyers at the moment of highest intent — active search.",
        outcome: "Two consecutive years of positive ROI on ad spend, with every lead tracked back to specific campaigns. The client has visibility into their exact cost-per-lead and has scaled their ad budget confidently because the numbers are clear.",
        services: ["Google Ads (PPC)", "Conversion Tracking", "ROI Reporting"],
        serviceLinks: ["/ppc", "/ppc", "/ppc"],
    },
    {
        icon: Users,
        color: PINK,
        glow: "rgba(234,81,255,0.12)",
        client: "Harmonic Productions",
        industry: "Entertainment & Events — Georgia",
        result: "300% Engagement Increase",
        resultSub: "through targeted social media strategy",
        description: "Harmonic Productions had the talent but lacked the digital presence to match it. Their social channels were inconsistent and their content wasn't converting followers into bookings. We developed a content strategy and social media advertising approach that authentically represented their brand.",
        outcome: "A 300% increase in engagement within 90 days. Their social presence now drives consistent inquiries and their brand is recognized across the West Georgia events market.",
        services: ["Social Media Advertising", "Content Strategy", "Brand Strategy"],
        serviceLinks: ["/social-media-ads", "/social-media-ads", "/brand-strategy"],
    },
];

export default function ResultsPage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }
        .case-card { transition: transform 240ms ease, box-shadow 240ms ease; }
        .case-card:hover { transform: translateY(-3px); box-shadow: 0 24px 64px rgba(0,0,0,0.45); }
        .service-tag { display: inline-flex; align-items: center; padding: 5px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); border-radius: 999px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55); text-decoration: none; transition: background 180ms ease, border-color 180ms ease; }
        .service-tag:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.20); }
        .cta-primary { background: ${ORANGE}; transition: background 180ms ease, transform 180ms ease; }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
        .cta-ghost { transition: background 180ms ease; }
        .cta-ghost:hover { background: rgba(255,255,255,0.09); }
        .stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 768px) { .stat-grid { grid-template-columns: 1fr; } }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(241,95,42,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "20px" }}>Proof — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Real Results for Real{" "}
                        <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>West Georgia Businesses.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        We don&rsquo;t hide behind vague promises. Here&rsquo;s exactly what we&rsquo;ve done — with real numbers, real clients, and transparent reporting.
                    </p>
                </section>

                {/* ── Stats Strip — animated counters ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#15181e", padding: "64px 24px" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                        <div className="stat-grid">
                            <AnimatedCounter end={21} suffix="" label="#1 Rankings — Jackson Law" color={ORANGE} />
                            <AnimatedCounter end={300} suffix="%" label="Engagement increase — Harmonic" color={PINK} />
                            <AnimatedCounter end={2} suffix=" Yrs" label="Consistent ROI — Insurance" color="#56CCF2" duration={1200} />
                        </div>
                    </div>
                </section>

                {/* ── Case Studies ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>Our Approach to Transparent Reporting</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "600px", marginInline: "auto", lineHeight: 1.7 }}>
                                Every case study below includes what we did, why we did it, and what actually happened — not just the wins, but the strategy behind them.
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                            {caseStudies.map(({ icon: Icon, color, glow, client, industry, result, resultSub, description, outcome, services, serviceLinks }) => (
                                <div key={client} className="case-card" style={{ background: CARD, border: `1px solid ${color}28`, borderRadius: "24px", padding: "48px", position: "relative", overflow: "hidden" }}>
                                    <div aria-hidden style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: glow, filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />
                                    <div style={{ position: "relative", zIndex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
                                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Icon size={26} color={color} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color, margin: "0 0 4px" }}>{industry}</p>
                                                <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{client}</h3>
                                                <p style={{ fontSize: "28px", fontWeight: 900, color, margin: "4px 0 0", letterSpacing: "-0.02em" }}>
                                                    {result} <span style={{ fontSize: "15px", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>{resultSub}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>The Challenge</h4>
                                        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)", marginBottom: "28px" }}>{description}</p>

                                        <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>The Outcome</h4>
                                        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)", marginBottom: "28px" }}>{outcome}</p>

                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {services.map((svc, i) => (
                                                <Link key={svc} href={serviceLinks[i]} className="service-tag">{svc}</Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Performance Charts ── */}
                <section style={{ background: "#15181e", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 24px" }}>
                    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 14px" }}>By the Numbers</h2>
                            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.42)", maxWidth: "500px", marginInline: "auto", lineHeight: 1.7 }}>Real performance data across our active client portfolio.</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}>
                            <ResultsMetricsChart title="Client Outcomes at a Glance" />
                            <DonutChart title="Lead Source Attribution (Avg. Client)" />
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(241,95,42,0.15)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to be our next{" "}
                            <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>success story?</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>Get your free consultation. We&rsquo;ll review your current presence and tell you exactly what we&rsquo;d do.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Get Your Free Consultation <ArrowRight size={18} />
                            </Link>
                            <Link href="/seo" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                Explore SEO Services
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
