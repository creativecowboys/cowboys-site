import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Megaphone, Users, Video, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Social Media Advertising in West Georgia | Creative Cowboys",
    description:
        "Creative Cowboys creates and manages Facebook, Instagram & TikTok ad campaigns for small businesses across West Georgia. Real engagement, real leads, real ROI.",
    alternates: { canonical: "/social-media-ads" },
    openGraph: {
        title: "Social Media Advertising in West Georgia | Creative Cowboys",
        description: "Scroll-stopping social media ads that drive real results for West Georgia small businesses. Facebook, Instagram & TikTok advertising management.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Social Media Advertising",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Facebook, Instagram and TikTok ad campaign management for small businesses in West Georgia. Audience targeting, creative strategy, and ROI reporting.",
    url: "https://creativecowboys.co/social-media-ads",
};

const steps = [
    { icon: Users, label: "Audience Targeting", color: "#EA51FF", desc: "We build precise audiences based on demographics, interests, behaviors, and lookalikes of your best customers." },
    { icon: Video, label: "Creative That Converts", color: ORANGE, desc: "Scroll-stopping ad creative — video, image, and carousel — designed to stop the thumb and drive action." },
    { icon: Megaphone, label: "Facebook & Instagram Ads", color: "#56CCF2", desc: "The most powerful social advertising platforms for local businesses. We manage your full Meta ad account." },
    { icon: TrendingUp, label: "TikTok Advertising", color: "#2ED573", desc: "Reach younger demographics and expand your audience with TikTok ads that feel native to the platform." },
    { icon: DollarSign, label: "Budget Optimization", color: "#F7B731", desc: "We continuously optimize your ad spend allocation across campaigns, ad sets, and creative to maximize ROI." },
    { icon: BarChart3, label: "Reporting & Optimization", color: "#FF6B6B", desc: "Weekly performance snapshots and monthly deep-dives. You always know what your ads are producing." },
];

export default function SocialMediaAdsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
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
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(234,81,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: PINK, marginBottom: "20px" }}>Social Media Ads — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Scroll-Stopping Ads That{" "}
                        <span style={{ background: `linear-gradient(135deg, ${PINK} 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Drive Real Results.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        We create and manage Facebook, Instagram & TikTok ad campaigns that get your business in front of the right people — and turn that attention into leads and sales.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get a Free Social Ads Audit <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See Results
                        </Link>
                    </div>
                </section>

                {/* ── Why Social Ads ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", background: CARD }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Facebook & Instagram Ads for West Georgia Businesses</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Facebook and Instagram give you unmatched targeting power for local businesses. You can reach people within a specific zip code, age range, income level, or interest group — and retarget people who&rsquo;ve already visited your website or engaged with your content.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            We&rsquo;ve produced a 300% increase in engagement for clients through strategic social media advertising, with results tied directly to business outcomes — not just likes and impressions.
                        </p>
                    </div>
                </section>

                {/* ── Process ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>Our Social Media Ad Process</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>From creative strategy to optimization — we handle everything.</p>
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

                {/* ── Ad Budget Recommendations ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Ad Budget Recommendations</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            For most West Georgia local businesses, we recommend starting with $300–$1,000/month in Meta ad spend depending on your goals. Brand awareness campaigns can run effectively at lower budgets; lead generation and retargeting campaigns typically need more to gather data quickly.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            Our social media management fee starts at $497/month. We&rsquo;ll give you a specific recommendation after reviewing your market and goals. <Link href="/blog/facebook-ads-small-business" style={{ color: PINK, textDecoration: "none", fontWeight: 600 }}>Read our honest take on whether Facebook ads work for small businesses →</Link>
                        </p>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(234,81,255,0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to run ads that actually work?{" "}
                            <span style={{ background: `linear-gradient(135deg, ${PINK} 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Let&rsquo;s talk.</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>Free consultation. No contracts. Real engagement, real leads, real ROI.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Start a Conversation <ArrowRight size={18} />
                            </Link>
                            <Link href="/results" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                See Results
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
