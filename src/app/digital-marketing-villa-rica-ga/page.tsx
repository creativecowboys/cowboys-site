import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Digital Marketing Agency in Villa Rica, GA | Creative Cowboys",
    description:
        "Creative Cowboys is a digital marketing agency based in Villa Rica, GA. We help Villa Rica small businesses grow with local SEO, Google Ads, web design & social media ads.",
    alternates: { canonical: "/digital-marketing-villa-rica-ga" },
    openGraph: {
        title: "Digital Marketing Agency in Villa Rica, GA | Creative Cowboys",
        description: "Villa Rica's own digital marketing agency. SEO, Google Ads, web design & social media advertising for Villa Rica small businesses.",
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
    areaServed: { "@type": "City", name: "Villa Rica", containedIn: { "@type": "State", name: "Georgia" } },
};

const services = [
    { label: "Local SEO for Villa Rica Businesses", link: "/seo" },
    { label: "Google Ads & PPC Management", link: "/ppc" },
    { label: "Website Design & Development", link: "/web-design" },
    { label: "Social Media Advertising", link: "/social-media-ads" },
    { label: "Brand Strategy & Identity", link: "/brand-strategy" },
    { label: "Video & Photography Production", link: "/media-creation" },
];

const localSEOItems = [
    "Local keyword strategy",
    "Google Business Profile optimization",
    "On-page SEO for every page",
    "Schema markup & technical SEO",
    "Review generation system",
    "Monthly transparent reporting",
];

const otherCities = [
    { label: "Carrollton, GA", link: "/digital-marketing-carrollton-ga" },
    { label: "Douglasville, GA", link: "/digital-marketing-douglasville-ga" },
    { label: "Newnan, GA", link: "/digital-marketing-newnan-ga" },
];

export default function VillaRicaPage() {
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
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE }}>Villa Rica, GA</span>
                    </div>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Digital Marketing Agency{" "}
                        <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in Villa Rica, GA.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto" }}>
                        Creative Cowboys is headquartered right here in Villa Rica. We help local small businesses get found on Google, run ads that convert, and build websites that actually drive growth.
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

                {/* ── About (left-aligned body content) ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Villa Rica&rsquo;s Digital Marketing Agency</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            Creative Cowboys was built in Villa Rica, GA. We&rsquo;re not a big-city agency that doesn&rsquo;t know your market — we live here, we know the local business landscape, and we understand what drives growth for Villa Rica small businesses.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            From dental practices to home service contractors to law firms, we&rsquo;ve helped Villa Rica area businesses rank on Google, generate consistent leads, and build the digital infrastructure they need to grow.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)" }}>
                            When you hire Creative Cowboys, you&rsquo;re working directly with the team that does the work — not a sales rep handing you off to a production house. <Link href="/results" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}>See our results for real clients →</Link>
                        </p>
                    </div>
                </section>

                {/* ── Services (left-aligned) ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px" }}>Digital Marketing Services for Villa Rica Businesses</h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.7 }}>
                            From local SEO to paid advertising to web design — integrated marketing systems that drive measurable growth.
                        </p>
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

                {/* ── Why Local Matters (left-aligned) ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>Why Villa Rica Businesses Need Local SEO</h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "16px" }}>
                            When someone in Villa Rica searches for a plumber, a dentist, or a marketing agency — Google shows them local results first. The businesses in that Map Pack get the majority of the calls. The question is whether your business shows up there or your competitor does.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.50)", marginBottom: "32px" }}>
                            We specialize in exactly this — local SEO for West Georgia small businesses. We&rsquo;ve helped clients in Villa Rica achieve #1 rankings for their most competitive local search terms, turning organic search into their primary lead source.
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

                {/* ── Other Local Pages (left-aligned) ── */}
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
                        <h2 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", margin: "0 0 20px" }}>
                            Ready to grow your Villa Rica business?
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.7 }}>Free consultation. We&rsquo;re local — let&rsquo;s meet, talk about your goals, and build a plan.</p>
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
