import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Palette, MessageSquare, Compass, BookOpen, Layers, RefreshCw } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Brand Strategy & Identity for West Georgia Small Businesses | Creative Cowboys",
    description:
        "Creative Cowboys builds cohesive brand identities for West Georgia small businesses — from logo to launch. Stand out, connect with customers & grow with confidence.",
    alternates: { canonical: "/brand-strategy" },
    openGraph: {
        title: "Brand Strategy & Identity for West Georgia Small Businesses | Creative Cowboys",
        description: "Logo design, brand voice, visual identity and competitive positioning for West Georgia small businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const GOLD = "#F7B731";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Brand Strategy & Identity",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Brand strategy, logo design, visual identity, brand voice, and competitive positioning for small businesses in West Georgia.",
    url: "https://creativecowboys.co/brand-strategy",
};

const offerings = [
    { icon: Palette, label: "Logo Design & Visual Identity", color: GOLD, desc: "A logo that captures your brand's personality and works across every touchpoint — print, digital, signage, and social." },
    { icon: MessageSquare, label: "Brand Voice & Messaging", color: PINK, desc: "How you sound is just as important as how you look. We define your brand's tone, tagline, and core messaging." },
    { icon: Compass, label: "Competitive Brand Positioning", color: ORANGE, desc: "We research your market and competitors to find the positioning that makes you the obvious choice for your ideal customer." },
    { icon: BookOpen, label: "Brand Guidelines", color: "#56CCF2", desc: "A complete brand standards guide so your team, contractors, and partners always represent your brand consistently." },
    { icon: Layers, label: "Visual Design System", color: "#2ED573", desc: "Color palette, typography, iconography, and layout patterns that create a cohesive, professional look across all materials." },
    { icon: RefreshCw, label: "Rebranding Services", color: "#FF6B6B", desc: "If your current brand no longer reflects your business, we'll rethink and rebuild it — while preserving the equity you've built." },
];

export default function BrandStrategyPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }
        .offer-card { transition: transform 240ms ease, box-shadow 240ms ease; }
        .offer-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.40); }
        .cta-primary { background: ${GOLD}; transition: background 180ms ease, transform 180ms ease; }
        .cta-primary:hover { background: #d9980e; transform: translateY(-1px); }
        .cta-ghost { transition: background 180ms ease; }
        .cta-ghost:hover { background: rgba(255,255,255,0.09); }
        .offers-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 1024px) { .offers-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .offers-grid { grid-template-columns: 1fr; } }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(247,183,49,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, marginBottom: "20px" }}>Brand Strategy — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Brand Strategy & Identity for{" "}
                        <span style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>West Georgia Small Businesses.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        From logo design to brand voice, we build the visual and strategic foundation that makes your business look professional, feel trustworthy, and stand out from the competition.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Start Your Brand Project <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See Our Work
                        </Link>
                    </div>
                </section>

                {/* ── What Is Brand Strategy ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", background: CARD }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>What Is Brand Strategy & Why Does It Matter</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Brand strategy is the plan behind how your business presents itself to the world. It covers who you are, what you stand for, who you serve, and how you communicate — consistently, across every touchpoint.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Without a clear brand strategy, your marketing efforts pull in different directions. With one, every ad, every social post, and every client interaction reinforces the same message — building recognition, trust, and loyalty over time.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            For West Georgia small businesses competing against larger brands and agencies, a strong brand identity is one of the most powerful advantages you can build.
                        </p>
                    </div>
                </section>

                {/* ── Offerings Grid ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>What&rsquo;s Included in Brand Strategy</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>Everything you need to build a brand that commands attention.</p>
                        </div>
                        <div className="offers-grid">
                            {offerings.map(({ icon: Icon, label, color, desc }) => (
                                <div key={label} className="offer-card" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "32px", position: "relative", overflow: "hidden" }}>
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

                {/* ── CTA ── */}
                <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(247,183,49,0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to build a brand that{" "}
                            <span style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${ORANGE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>actually stands out?</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>Free consultation. We&rsquo;ll review your current brand and tell you exactly what we&rsquo;d do differently.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Start a Conversation <ArrowRight size={18} />
                            </Link>
                            <Link href="/results" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                See Our Work
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
