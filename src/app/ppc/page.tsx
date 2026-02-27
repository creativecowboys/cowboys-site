import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Target, Zap, BarChart3, MousePointer, DollarSign, RefreshCw } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Google Ads & PPC Management in West Georgia | Creative Cowboys",
    description:
        "Creative Cowboys manages ROI-focused Google Ads & PPC campaigns for small businesses in West Georgia. No wasted spend — just qualified leads. Villa Rica, GA digital marketing agency.",
    alternates: { canonical: "/ppc" },
    openGraph: {
        title: "Google Ads & PPC Management in West Georgia | Creative Cowboys",
        description: "Every dollar tracked, every click optimized. Creative Cowboys manages Google Ads campaigns that drive real leads for West Georgia small businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Google Ads & PPC Management",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://creativecowboys.co" },
    areaServed: "West Georgia",
    description: "ROI-focused Google Ads and PPC campaign management for small businesses in West Georgia. Campaign setup, keyword targeting, conversion tracking, and transparent reporting.",
    url: "https://creativecowboys.co/ppc",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "How much do Google Ads cost for a small business?", acceptedAnswer: { "@type": "Answer", text: "Ad spend varies by market and goals — most West Georgia small businesses start with $500–$1,500/month in ad budget. Our management fee starts at $497/month. We'll recommend a budget that makes sense for your goals after a free consultation." } },
        { "@type": "Question", name: "How quickly can I see results from Google Ads?", acceptedAnswer: { "@type": "Answer", text: "Unlike SEO, Google Ads can drive traffic within hours of launch. Most campaigns start showing meaningful lead volume in the first 2–4 weeks as we optimize targeting and bids." } },
        { "@type": "Question", name: "Do you require long-term contracts?", acceptedAnswer: { "@type": "Answer", text: "No contracts that trap you. We work month-to-month and earn your business by delivering results. If it's not working, you're not locked in." } },
    ],
};

const steps = [
    { icon: Target, label: "Campaign Strategy", color: ORANGE, desc: "We map out your target keywords, competitor landscape, and campaign structure before spending a single dollar." },
    { icon: MousePointer, label: "Search Ads Setup", color: "#56CCF2", desc: "Google Search Ads that appear when prospects are actively searching for your services — the highest-intent traffic available." },
    { icon: RefreshCw, label: "Display & Remarketing", color: PINK, desc: "Stay in front of visitors who didn't convert the first time with smart remarketing campaigns across the Google Display Network." },
    { icon: BarChart3, label: "Conversion Tracking", color: "#2ED573", desc: "We set up GA4 and Google Tag Manager to track every call, form fill, and purchase — so you know your exact ROI." },
    { icon: DollarSign, label: "Bid Optimization", color: "#F7B731", desc: "Ongoing bid adjustments to reduce cost-per-click and maximize your budget efficiency as campaign data accumulates." },
    { icon: Zap, label: "ROI Reporting", color: "#FF6B6B", desc: "Plain-English monthly reports: what we spent, what you got, and what we're doing next to improve results." },
];

export default function PPCPage() {
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
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(241,95,42,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "20px" }}>Google Ads & PPC — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(28px, 4.5vw, 56px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Google Ads & PPC Management in West Georgia —{" "}
                        <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Every Dollar Tracked, Every Click Optimized.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        We manage Google Ads campaigns that bring qualified buyers to your business — not just impressions. No wasted spend. Real results for West Georgia small businesses.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get a Free PPC Audit <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See PPC Results
                        </Link>
                    </div>
                </section>

                {/* ── Why Google Ads ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", background: CARD }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Why Google Ads Work for West Georgia Small Businesses</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Google Ads puts your business in front of people who are actively searching for what you offer — right now. Unlike social media ads that interrupt the scroll, Google Search Ads appear when someone types in your service keyword with intent to buy or hire.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            For West Georgia businesses, this means reaching buyers in Villa Rica, Carrollton, Douglasville, and the greater Atlanta area at the exact moment they&rsquo;re ready to make a decision. When managed correctly, Google Ads delivers some of the highest measurable ROI in digital marketing.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            One of our clients — a commercial insurance agency — has sustained 2 years of great ROI through our Google Ads management, with every lead tracked back to ad spend.
                        </p>
                    </div>
                </section>

                {/* ── Process ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>Our PPC Management Process</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>Built to maximize your ROI from day one.</p>
                        </div>
                        <div className="steps-grid">
                            {steps.map(({ icon: Icon, label, color, desc }) => (
                                <div key={label} className="step-card" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "32px", position: "relative", overflow: "hidden" }}>
                                    <div aria-hidden style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: `${color}18`, filter: "blur(30px)", borderRadius: "50%", pointerEvents: "none" }} />
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                                        <Icon size={22} color={color} />
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{label}</h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── How Much Does PPC Cost ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>How Much Does PPC Cost?</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            PPC costs have two components: your ad spend (paid directly to Google) and our management fee. Most West Georgia small businesses start with $500–$1,500/month in ad spend depending on their market and goals. Our management fee starts at $497/month.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            We&rsquo;ll recommend a budget that makes sense after reviewing your market. No inflated recommendations — just what&rsquo;s needed to compete effectively. <Link href="/blog/how-much-does-google-ads-cost" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>Read our transparent Google Ads cost breakdown →</Link>
                        </p>
                    </div>
                </section>

                {/* ── PPC vs SEO ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>PPC vs. SEO — Which Is Right for You?</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            PPC delivers immediate traffic; SEO builds long-term organic visibility. The best strategy for most West Georgia businesses is running both: PPC to generate leads now while SEO builds compounding results for the future.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            <Link href="/seo" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>Compare with our SEO services →</Link> or read our full guide: <Link href="/blog/google-ads-vs-seo-small-business" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>Google Ads vs. SEO for West Georgia businesses →</Link>
                        </p>
                    </div>
                </section>

                {/* ── Web Design Cross-link ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "64px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>Landing Pages That Convert</h2>
                        <p style={{ fontSize: "16px", lineHeight: 1.75, color: "rgba(255,255,255,0.48)", marginBottom: "24px" }}>
                            A great Google Ads campaign needs a great landing page to convert that traffic into leads. We build <Link href="/web-design" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>SEO-optimized landing pages</Link> designed specifically to maximize PPC conversion rates — so your ad spend works harder.
                        </p>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 48px", textAlign: "center" }}>Frequently Asked Questions About PPC</h2>
                        {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                            <div key={name} className="faq-item">
                                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{name}</h3>
                                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.50)", margin: 0 }}>{acceptedAnswer.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(241,95,42,0.15)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to put your ads to work?{" "}
                            <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Let&rsquo;s talk.</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>Free consultation. No contracts. No fluff. Just a clear plan to get you qualified leads.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Start a Conversation <ArrowRight size={18} />
                            </Link>
                            <Link href="/results" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                See PPC Results
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
