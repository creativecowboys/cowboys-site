import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Search, TrendingUp, MapPin, FileText, Link2, BarChart3 } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";
import { KeywordRankingChart, TrafficSparkline } from "@/components/ui/animated-charts";

export const metadata: Metadata = {
    title: "SEO Services in West Georgia | Creative Cowboys",
    description:
        "Creative Cowboys offers results-driven SEO services for small businesses in West Georgia. Local SEO, keyword strategy & Google Business Profile optimization. Based in Villa Rica, GA.",
    alternates: { canonical: "/seo" },
    openGraph: {
        title: "SEO Services in West Georgia | Creative Cowboys",
        description: "Get found on Google. Creative Cowboys delivers local SEO, on-page optimization, and keyword strategy for West Georgia small businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "SEO Services",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Results-driven SEO services for small businesses in West Georgia including local SEO, keyword strategy, Google Business Profile optimization, and transparent reporting.",
    url: "https://creativecowboys.co/seo",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "How long does SEO take to show results?", acceptedAnswer: { "@type": "Answer", text: "Most businesses see meaningful movement in rankings within 3–6 months. Highly competitive markets may take 6–12 months. SEO is a long-term investment — but unlike paid ads, the results compound over time." } },
        { "@type": "Question", name: "Do I need local SEO or national SEO?", acceptedAnswer: { "@type": "Answer", text: "If your customers are primarily in West Georgia and the surrounding area, local SEO is the priority. It targets location-based searches like 'marketing agency Villa Rica GA' and helps you appear in Google Maps results." } },
        { "@type": "Question", name: "How much does SEO cost?", acceptedAnswer: { "@type": "Answer", text: "Our SEO packages start at $497/month. The right investment depends on your market competitiveness and goals. We'll give you a transparent quote after a free consultation." } },
    ],
};

const steps = [
    { icon: Search, label: "Keyword Research", color: "#56CCF2", desc: "We identify the exact terms your ideal customers are searching — high-intent, local, and ready to convert." },
    { icon: FileText, label: "On-Page Optimization", color: ORANGE, desc: "H1s, meta tags, content structure, image alt text — every page tuned to send clear signals to Google." },
    { icon: MapPin, label: "Google Business Profile", color: "#2ED573", desc: "Your GBP is your #1 local ranking factor. We optimize every element to get you into the map pack." },
    { icon: Link2, label: "Link Building", color: PINK, desc: "We build quality backlinks from relevant local and industry sources to grow your domain authority." },
    { icon: TrendingUp, label: "Technical SEO", color: "#F7B731", desc: "Site speed, Core Web Vitals, schema markup, sitemap, robots.txt — the technical foundation Google demands." },
    { icon: BarChart3, label: "Reporting & Transparency", color: "#FF6B6B", desc: "Monthly reports in plain English. Keyword rankings, traffic trends, and what we're doing next." },
];

export default function SEOPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }
        .step-card { transition: transform 240ms ease, box-shadow 240ms ease; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.40); }
        .cta-primary { background: ${ORANGE}; transition: background 180ms ease, transform 180ms ease; }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
        .cta-ghost { transition: background 180ms ease; }
        .cta-ghost:hover { background: rgba(255,255,255,0.09); }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 1024px) { .steps-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .steps-grid { grid-template-columns: 1fr; } }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 24px 0; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(86,204,242,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#56CCF2", marginBottom: "20px" }}>SEO Services — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        SEO Services in West Georgia —{" "}
                        <span style={{ background: `linear-gradient(135deg, #56CCF2 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Get Found. Get Leads. Get Results.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        We help West Georgia small businesses rank higher on Google, drive consistent organic traffic, and turn searchers into paying customers — with zero fluff and full transparency.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get a Free SEO Audit <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See SEO Results
                        </Link>
                    </div>
                </section>

                {/* ── What Is Local SEO ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", background: CARD }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>What Is Local SEO & Why It Matters for West Georgia Businesses</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Local SEO is the process of optimizing your online presence so your business appears when people in your area search for your services on Google. When someone types &ldquo;marketing agency near me&rdquo; or &ldquo;web design Villa Rica GA&rdquo; — local SEO determines whether you show up or your competitor does.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            For most small businesses in West Georgia, local search is the single highest-ROI marketing channel available. It brings in buyers who are already looking for exactly what you offer — no chasing, no cold outreach.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            Our local SEO work helped John B. Jackson Law achieve 21 #1 rankings in personal injury law search terms — driving consistent, qualified leads month after month, without a dollar spent on ads.
                        </p>
                    </div>
                </section>

                {/* ── Our Process ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>Our SEO Process: How We Get You Ranked</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>
                                Every step is built to produce measurable rankings — not vanity metrics.
                            </p>
                        </div>
                        <div className="steps-grid">
                            {steps.map(({ icon: Icon, label, color, desc }) => (
                                <div key={label} className="step-card" style={{ background: CARD, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: "20px", padding: "32px", position: "relative", overflow: "hidden" }}>
                                    <div aria-hidden style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: `${color}18`, filter: "blur(30px)", borderRadius: "50%", pointerEvents: "none" }} />
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                                        <Icon size={22} color={color} />
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{label}</h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Ranking Results — animated charts ── */}
                <section style={{ padding: "100px 24px" }}>
                    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F15F2A", marginBottom: "14px" }}>Proof it works</p>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>Real rankings. Real traffic.</h2>
                            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.42)", maxWidth: "500px", marginInline: "auto", lineHeight: 1.7 }}>
                                Here's what our SEO campaigns look like in practice — keyword positions and organic traffic growth from real client accounts.
                            </p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "start" }}>
                            <div style={{ background: "#15181e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px" }}>
                                <KeywordRankingChart />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                <div style={{ background: "#15181e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px" }}>
                                    <TrafficSparkline label="Organic Sessions (Jackson Law)" valueLabel="+340%" color="#F15F2A" />
                                </div>
                                <div style={{ background: "#15181e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px" }}>
                                    <TrafficSparkline
                                        label="Google Business Profile Clicks"
                                        valueLabel="+180%"
                                        color="#56CCF2"
                                        data={[80, 90, 85, 100, 115, 128, 140, 155, 168, 182, 200, 212]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Local vs National ── */}
                <section style={{ background: "#15181e", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Local SEO vs. National SEO — What You Need</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            If you serve customers in Villa Rica, Carrollton, Douglasville, or anywhere in West Georgia — local SEO is your primary focus. It gets you into the Google Map Pack (the 3 businesses that appear above organic results with a map) and targets people searching in your service area.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            National SEO competes for broad terms without location modifiers. It&rsquo;s valuable for e-commerce and brands serving customers nationwide — but for most West Georgia businesses, local SEO delivers a far faster return on investment. We build a strategy that prioritizes the approach that fits your business.
                        </p>
                    </div>
                </section>

                {/* ── SEO Reporting ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>SEO Reporting & Transparency</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            We believe you should always know exactly what we&rsquo;re doing and why. Every month you&rsquo;ll receive a clear report showing keyword ranking changes, organic traffic trends, and the specific work we completed — no jargon, no vanity metrics.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "40px" }}>
                            {["Keyword ranking tracker", "Organic traffic (GA4)", "Google Search Console data", "Backlink profile growth", "Technical health score", "Monthly action summary"].map(item => (
                                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                    <CheckCircle2 size={16} color={ORANGE} style={{ flexShrink: 0, marginTop: "3px" }} />
                                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.60)" }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PPC Cross-Link ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "64px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>SEO vs. PPC — Which Is Right for You?</h2>
                        <p style={{ fontSize: "16px", lineHeight: 1.75, color: "rgba(255,255,255,0.48)", marginBottom: "24px" }}>
                            SEO builds long-term organic visibility that compounds over time. PPC (Google Ads) delivers immediate traffic while your SEO gains traction. Many West Georgia businesses get the best results by running both together. <Link href="/ppc" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>Learn about our PPC management →</Link>
                        </p>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 48px", textAlign: "center" }}>Frequently Asked Questions About SEO</h2>
                        {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                            <div key={name} className="faq-item">
                                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{name}</h3>
                                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.50)", margin: 0 }}>{acceptedAnswer.text}</p>
                            </div>
                        ))}
                        <div className="faq-item">
                            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>How long does SEO take for a small business?</h3>
                            <p style={{ fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.50)", margin: 0 }}>Read our full breakdown: <Link href="/blog/how-long-does-seo-take" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>How long SEO takes for West Georgia businesses →</Link></p>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(86,204,242,0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to own your market?{" "}
                            <span style={{ background: `linear-gradient(135deg, #56CCF2 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Let&rsquo;s build your SEO strategy.</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>
                            Free consultation. No contracts. No fluff. Just a clear plan to get you ranking.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Get Your Free SEO Audit <ArrowRight size={18} />
                            </Link>
                            <Link href="/results" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                See Our Results
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
