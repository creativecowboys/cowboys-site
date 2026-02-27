import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Digital Marketing Agency for Newnan, GA Businesses | Creative Cowboys",
    description:
        "Creative Cowboys helps Newnan, GA small businesses grow with local SEO, Google Ads, web design & social media advertising. West Georgia digital marketing agency. Free consultation.",
    alternates: { canonical: "/digital-marketing-newnan-ga" },
    openGraph: {
        title: "Digital Marketing Agency for Newnan, GA Businesses | Creative Cowboys",
        description: "Local SEO, Google Ads, and web design for Newnan, GA small businesses. Creative Cowboys — West Georgia's digital marketing agency.",
    },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const localSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://creativecowboys.co/#organization",
    name: "Creative Cowboys Media",
    url: "https://creativecowboys.co",
    telephone: "+14702437517",
    address: { "@type": "PostalAddress", streetAddress: "222 West Montgomery St", addressLocality: "Villa Rica", addressRegion: "GA", postalCode: "30180", addressCountry: "US" },
    areaServed: { "@type": "City", name: "Newnan", containedIn: { "@type": "State", name: "Georgia" } },
};

const services = [
    { label: "Local SEO for Newnan Businesses", link: "/seo" },
    { label: "Google Ads & PPC Management", link: "/ppc" },
    { label: "Website Design & Development", link: "/web-design" },
    { label: "Social Media Advertising", link: "/social-media-ads" },
    { label: "Brand Strategy & Identity", link: "/brand-strategy" },
    { label: "Video & Photography Production", link: "/media-creation" },
];

const localSEOItems = [
    "Newnan & Coweta County keyword targeting",
    "Google Business Profile optimization",
    "On-page SEO for all service pages",
    "Schema markup & technical SEO",
    "Local citation & listing management",
    "Transparent monthly reporting",
];

const otherCities = [
    { label: "Villa Rica, GA", link: "/digital-marketing-villa-rica-ga" },
    { label: "Carrollton, GA", link: "/digital-marketing-carrollton-ga" },
    { label: "Douglasville, GA", link: "/digital-marketing-douglasville-ga" },
];

export default function NewnanPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} />
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }
        .svc-link { display:flex; align-items:center; gap:10px; padding:18px 22px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; text-decoration:none; color:rgba(255,255,255,0.65); font-size:15px; font-weight:600; transition:background 200ms ease,border-color 200ms ease,color 200ms ease; }
        .svc-link:hover { background:rgba(241,95,42,0.10); border-color:rgba(241,95,42,0.35); color:#fff; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease,transform 180ms ease; }
        .cta-primary:hover { background:#d04c1c; transform:translateY(-1px); }
        .cta-ghost { transition:background 180ms ease; }
        .cta-ghost:hover { background:rgba(255,255,255,0.09); }
        .svc-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:640px) { .svc-grid { grid-template-columns:1fr; } }
        .city-pill { padding:10px 20px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:999px; font-size:14px; color:rgba(255,255,255,0.55); text-decoration:none; font-weight:600; transition:background 180ms ease,border-color 180ms ease,color 180ms ease; }
        .city-pill:hover { background:rgba(241,95,42,0.10); border-color:rgba(241,95,42,0.30); color:#fff; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero (centered) ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(241,95,42,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <div className="fu-1" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(241,95,42,0.12)", border: "1px solid rgba(241,95,42,0.25)", borderRadius: "999px", marginBottom: "24px" }}>
                        <MapPin size={13} color={ORANGE} />
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE }}>Newnan, GA</span>
                    </div>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Digital Marketing for{" "}
                        <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Newnan, GA Businesses.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        Creative Cowboys helps Newnan small businesses get found on Google, generate leads through targeted advertising, and build websites that convert. West Georgia&rsquo;s no-fluff digital marketing agency.
                    </p>
                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get a Free Consultation <ArrowRight size={17} />
                        </Link>
                        <Link href="/results" className="cta-ghost" style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", textDecoration: "none" }}>
                            See Our Results
                        </Link>
                    </div>
                </section>

                {/* ── About (left-aligned) ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Digital Marketing Agency Serving Newnan, GA</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Newnan is one of Georgia&rsquo;s fastest-growing cities — and that growth has intensified local search competition significantly. Businesses that invest in local SEO and digital advertising now are building advantages that will compound for years. Those that wait are giving their competitors a head start.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            We work with Newnan businesses in legal, healthcare, home services, professional services, and retail. Our approach is built on measurable results — leads, keyword rankings, and ROI — not vanity metrics that look good on a report but don&rsquo;t show up in your bank account.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            Based in Villa Rica, we serve the entire West Georgia and Coweta County market. <Link href="/results" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>See our proven client results →</Link>
                        </p>
                    </div>
                </section>

                {/* ── Services (left-aligned) ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px" }}>Digital Marketing Services for Newnan, GA Businesses</h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.7 }}>From local SEO to paid advertising to brand strategy — everything your Newnan business needs to win online.</p>
                        <div className="svc-grid">
                            {services.map(({ label, link }) => (
                                <Link key={label} href={link} className="svc-link">
                                    <ArrowRight size={15} color={ORANGE} style={{ flexShrink: 0 }} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Local SEO (left-aligned) ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Local SEO for Newnan, GA Businesses</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "32px" }}>
                            Newnan is a high-growth market with increasing local search competition. Our local SEO work is built to get Newnan small businesses into the Google Map Pack and top organic results for their most valuable search terms — and keep them there.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                            {localSEOItems.map(item => (
                                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                    <CheckCircle2 size={16} color={ORANGE} style={{ flexShrink: 0, marginTop: "3px" }} />
                                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.60)" }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Other Cities (left-aligned) ── */}
                <section style={{ padding: "80px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Also Serving West Georgia</h2>
                        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginBottom: "24px" }}>We work with businesses across the entire West Georgia area:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                            {otherCities.map(({ label, link }) => (
                                <Link key={label} href={link} className="city-pill">{label}</Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA (centered) ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "120px 24px", textAlign: "center" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", margin: "0 0 20px" }}>Ready to grow your Newnan business?</h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.7 }}>Free consultation. We&rsquo;ll review your current digital presence and build a plan.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Get Your Free Consultation <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
