import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Video, Camera, Layers, Smartphone, Play, Palette } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Video, Photography & Graphic Design for West Georgia Businesses | Creative Cowboys",
    description:
        "Creative Cowboys produces scroll-stopping video, photography & graphic design content for businesses across West Georgia. Tell your story. Build your brand.",
    alternates: { canonical: "/media-creation" },
    openGraph: {
        title: "Video, Photography & Graphic Design for West Georgia Businesses | Creative Cowboys",
        description: "Professional video production, business photography, and graphic design for West Georgia businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const CYAN = "#56CCF2";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Media Creation",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Video production, business photography, graphic design, and social media content creation for businesses in West Georgia.",
    url: "https://creativecowboys.co/media-creation",
};

const offerings = [
    { icon: Video, label: "Business Video Production", color: ORANGE, desc: "Brand videos, testimonials, product showcases, and explainer videos that tell your story and build trust with potential customers." },
    { icon: Camera, label: "Professional Business Photography", color: CYAN, desc: "High-quality photos of your team, facility, products, and work that make your business look polished and professional across every platform." },
    { icon: Palette, label: "Graphic Design for Marketing", color: PINK, desc: "Print and digital design for ads, brochures, signage, presentations, and brand materials — all consistent with your brand identity." },
    { icon: Smartphone, label: "Social Media Content", color: "#2ED573", desc: "Custom content sized and optimized for Instagram, Facebook, TikTok, and LinkedIn — ready to publish and built to perform." },
    { icon: Play, label: "Reels & Short-Form Video", color: "#F7B731", desc: "Short-form video content for Instagram Reels, TikTok, and YouTube Shorts — the highest-reach, lowest-cost content format available." },
    { icon: Layers, label: "Our Media Creation Process", color: "#FF6B6B", desc: "Discovery call → creative brief → production day(s) → editing and delivery → content calendar integration. Simple, professional, fast." },
];

export default function MediaCreationPage() {
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
        .cta-primary { background: ${ORANGE}; transition: background 180ms ease, transform 180ms ease; }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
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
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(86,204,242,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: CYAN, marginBottom: "20px" }}>Media Creation — West Georgia</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Video, Photography &{" "}
                        <span style={{ background: `linear-gradient(135deg, ${CYAN} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Graphic Design</span>{" "}
                        for West Georgia Businesses.
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        Tell your story with content that stops the scroll, builds trust, and converts browsers into buyers. Professional media production tailored for West Georgia businesses.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get a Quote <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See Our Work
                        </Link>
                    </div>
                </section>

                {/* ── Why Visual Content ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", background: CARD }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Why Visual Content Matters</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            People make buying decisions before they ever contact you. The quality of your photos, videos, and content signals whether your business is worth trusting. Low-quality visuals kill conversions — even when your service is excellent.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            We helped Harmonic Productions achieve a 300% increase in engagement by creating content that authentically represented their brand and spoke to their audience. The right visuals don&rsquo;t just look good — they work.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            Our media creation services integrate directly with our <Link href="/social-media-ads" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>social media advertising</Link> and <Link href="/brand-strategy" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>brand strategy</Link> work — so your content looks great and performs even better.
                        </p>
                    </div>
                </section>

                {/* ── Offerings ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px" }}>What We Create</h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>From brand video to social content — media that moves your business forward.</p>
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
                    <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(86,204,242,0.10)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Ready to tell your story?{" "}
                            <span style={{ background: `linear-gradient(135deg, ${CYAN} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Let&rsquo;s build your brand.</span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>Tell us about your business and we&rsquo;ll put together a media package that fits your goals.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                Get a Quote <ArrowRight size={18} />
                            </Link>
                            <Link href="/brand-strategy" className="cta-ghost" style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                                Explore Brand Strategy
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
