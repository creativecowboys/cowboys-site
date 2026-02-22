"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Globe, Megaphone, Search, Mail, BarChart3, Palette } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const services = [
    {
        icon: Globe,
        label: "Web Design",
        color: ORANGE,
        glow: "rgba(241,95,42,0.15)",
        border: "rgba(241,95,42,0.25)",
        href: "/web-design",
        tagline: "Sites that sell",
        description:
            "Custom-designed, conversion-focused websites built to turn visitors into customers. Fast, mobile-first, and SEO-ready from day one.",
        bullets: ["Custom design — no templates", "Mobile-first & lightning fast", "Built to convert, not just look good"],
    },
    {
        icon: Megaphone,
        label: "Digital Marketing",
        color: PINK,
        glow: "rgba(234,81,255,0.12)",
        border: "rgba(234,81,255,0.25)",
        href: "/contact",
        tagline: "More leads, more revenue",
        description:
            "Google Ads, social media campaigns, and paid traffic strategies designed to bring qualified buyers to your business — not just clicks.",
        bullets: ["Google & Meta Ads management", "ROI-focused strategy", "Transparent reporting"],
    },
    {
        icon: Search,
        label: "SEO",
        color: "#56CCF2",
        glow: "rgba(86,204,242,0.12)",
        border: "rgba(86,204,242,0.25)",
        href: "/contact",
        tagline: "Own your market",
        description:
            "Rank higher on Google and drive consistent organic traffic. We handle technical SEO, content strategy, and local search optimization.",
        bullets: ["Local SEO for Villa Rica & beyond", "Technical & on-page optimization", "Long-term sustainable growth"],
    },
    {
        icon: Palette,
        label: "Branding",
        color: "#F7B731",
        glow: "rgba(247,183,49,0.12)",
        border: "rgba(247,183,49,0.25)",
        href: "/contact",
        tagline: "Look the part",
        description:
            "Logo design, brand identity, and visual systems that make your business look professional and memorable from the first click.",
        bullets: ["Logo & identity design", "Brand guidelines & assets", "Cohesive look across all channels"],
    },
    {
        icon: Mail,
        label: "Email Marketing",
        color: "#2ED573",
        glow: "rgba(46,213,115,0.12)",
        border: "rgba(46,213,115,0.25)",
        href: "/contact",
        tagline: "Stay top of mind",
        description:
            "Automated email campaigns and nurture sequences that keep your brand in front of prospects and turn one-time buyers into loyal customers.",
        bullets: ["Email automation & sequences", "List building strategy", "Open-rate optimized copy"],
    },
    {
        icon: BarChart3,
        label: "Analytics & Strategy",
        color: "#FF6B6B",
        glow: "rgba(255,107,107,0.12)",
        border: "rgba(255,107,107,0.25)",
        href: "/contact",
        tagline: "Know your numbers",
        description:
            "Clear reporting dashboards and strategy sessions that translate data into decisions — so you always know what's working and what to do next.",
        bullets: ["Google Analytics setup & audit", "Monthly strategy reports", "Clear KPIs tied to revenue"],
    },
];

const stats = [
    { value: "2–4 wks", label: "Average launch time" },
    { value: "100%", label: "Custom builds, no templates" },
    { value: "Local", label: "Villa Rica based, nationally reaching" },
    { value: "Real", label: "Results tied to your revenue" },
];

export default function ServicesPage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) {
          .fu-1,.fu-2,.fu-3 { animation: none; }
        }

        .svc-card {
          transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
          cursor: default;
        }
        .svc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.40);
        }
        .svc-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: gap 200ms ease, opacity 200ms ease;
          margin-top: 20px;
        }
        .svc-link:hover { gap: 10px; opacity: 0.85; }

        .cta-primary {
          background: ${ORANGE};
          transition: background 180ms ease, transform 180ms ease;
        }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
        .cta-ghost {
          transition: background 180ms ease;
        }
        .cta-ghost:hover { background: rgba(255,255,255,0.09); }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>

                {/* ── Logo ── */}
                <div style={{ position: "fixed", top: "52px", left: "24px", zIndex: 50 }}>
                    <Link href="/">
                        <Image
                            src="/Main%20logo%202.png"
                            alt="Creative Cowboys Media"
                            width={160}
                            height={42}
                            priority
                            style={{ width: "160px", height: "auto" }}
                        />
                    </Link>
                </div>

                {/* ── Hero ── */}
                <section style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "160px 24px 100px",
                    textAlign: "center",
                    position: "relative",
                }}>
                    {/* Glow orb */}
                    <div aria-hidden style={{
                        position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)",
                        width: "600px", height: "300px",
                        background: "radial-gradient(ellipse, rgba(241,95,42,0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <p className="fu-1" style={{
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
                        textTransform: "uppercase", color: ORANGE, marginBottom: "20px",
                    }}>
                        What We Do
                    </p>

                    <h1 className="fu-2" style={{
                        fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 800,
                        lineHeight: 1.06, letterSpacing: "-0.03em",
                        color: "#ffffff", margin: "0 0 24px",
                    }}>
                        Everything your business needs{" "}
                        <span style={{
                            background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`,
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                            to grow online.
                        </span>
                    </h1>

                    <p className="fu-3" style={{
                        fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7,
                        color: "rgba(255,255,255,0.48)", marginBottom: "44px", maxWidth: "640px", marginInline: "auto",
                    }}>
                        We&rsquo;re a full-service digital agency based in Villa Rica, GA. From your first website to a fully automated marketing engine — we build what your business needs to compete and win.
                    </p>

                    <div className="fu-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/contact"
                            className="cta-primary"
                            style={{
                                padding: "14px 32px", color: "#fff", fontWeight: 700,
                                fontSize: "15px", borderRadius: "10px", border: "none",
                                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                            }}
                        >
                            Start a Project <ArrowRight size={17} />
                        </Link>
                        <Link href="/contact"
                            className="cta-ghost"
                            style={{
                                padding: "14px 32px", color: "#fff", fontWeight: 600,
                                fontSize: "15px", borderRadius: "10px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.04)",
                                textDecoration: "none",
                            }}
                        >
                            Get a Free Consultation
                        </Link>
                    </div>
                </section>

                {/* ── Stats strip ── */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px", background: CARD }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                        <div className="stats-grid">
                            {stats.map(({ value, label }) => (
                                <div key={label} style={{ textAlign: "center", padding: "12px" }}>
                                    <p style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                                        {value}
                                    </p>
                                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Services Grid ── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{
                                fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
                                letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px",
                            }}>
                                Our Services
                            </h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", maxWidth: "520px", marginInline: "auto", lineHeight: 1.7 }}>
                                Pick one or build out a full strategy — we can handle it all.
                            </p>
                        </div>

                        <div className="services-grid">
                            {services.map(({ icon: Icon, label, color, glow, border, href, tagline, description, bullets }) => (
                                <div
                                    key={label}
                                    className="svc-card"
                                    style={{
                                        background: CARD,
                                        border: `1px solid ${border}`,
                                        borderRadius: "20px",
                                        padding: "32px",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Glow */}
                                    <div aria-hidden style={{
                                        position: "absolute", top: "-30px", right: "-30px",
                                        width: "160px", height: "160px",
                                        background: glow, filter: "blur(40px)",
                                        borderRadius: "50%", pointerEvents: "none",
                                    }} />

                                    <div style={{ position: "relative", zIndex: 1 }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: "52px", height: "52px", borderRadius: "14px",
                                            background: `${glow}`, border: `1px solid ${border}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            marginBottom: "20px",
                                        }}>
                                            <Icon size={24} color={color} />
                                        </div>

                                        {/* Label + tagline */}
                                        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color, margin: "0 0 6px" }}>
                                            {label}
                                        </p>
                                        <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                                            {tagline}
                                        </h3>
                                        <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
                                            {description}
                                        </p>

                                        {/* Bullets */}
                                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 4px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {bullets.map(b => (
                                                <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                                                    <CheckCircle2 size={14} color={color} style={{ flexShrink: 0, marginTop: "2px" }} />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA link */}
                                        <Link href={href} className="svc-link" style={{ color }}>
                                            Learn more <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Why Cowboys ── */}
                <section style={{
                    background: "#f0ddd4",
                    borderTop: "1px solid rgba(26,21,20,0.08)",
                    borderBottom: "1px solid rgba(26,21,20,0.08)",
                    padding: "96px 24px",
                }}>
                    <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{
                            fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800,
                            letterSpacing: "-0.03em", color: "#1a1514", margin: "0 0 20px",
                        }}>
                            You talk directly with the people doing the work.
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(26,21,20,0.55)", lineHeight: 1.75, marginBottom: "20px", maxWidth: "640px", marginInline: "auto" }}>
                            No account managers playing telephone. No offshore teams you&rsquo;ll never meet. We&rsquo;re a small, focused crew based in Villa Rica, GA — fast-moving and obsessed with results you can actually measure.
                        </p>
                        <p style={{ fontSize: "17px", color: "rgba(26,21,20,0.55)", lineHeight: 1.75, marginBottom: "48px", maxWidth: "640px", marginInline: "auto" }}>
                            When you work with Creative Cowboys, you get a team that treats your business like their own — because your growth is how we grow.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                            {["Small & local businesses", "Contractors & trades", "Professional services", "E-commerce brands", "Scaling startups"].map(t => (
                                <span key={t} style={{
                                    padding: "8px 18px",
                                    background: "rgba(255,255,255,0.70)",
                                    border: "1px solid rgba(26,21,20,0.10)",
                                    borderRadius: "999px", color: "rgba(26,21,20,0.65)",
                                    fontSize: "13px", fontWeight: 500,
                                }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ── Final CTA ── */}
                <section style={{
                    padding: "120px 24px", textAlign: "center",
                    position: "relative", overflow: "hidden",
                }}>
                    <div aria-hidden style={{
                        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                        width: "600px", height: "280px",
                        background: "rgba(241,95,42,0.15)", filter: "blur(90px)",
                        borderRadius: "50%", pointerEvents: "none",
                    }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{
                            fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900,
                            letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px",
                        }}>
                            Ready to get started?{" "}
                            <span style={{
                                background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`,
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                                Let&rsquo;s talk.
                            </span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>
                            Tell us about your business and we&rsquo;ll put together a custom plan that fits your goals and your budget.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link href="/contact"
                                className="cta-primary"
                                style={{
                                    padding: "16px 40px", color: "#fff", fontWeight: 700,
                                    fontSize: "16px", borderRadius: "10px",
                                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                                }}
                            >
                                Start a Conversation <ArrowRight size={18} />
                            </Link>
                            <Link href="/contact"
                                className="cta-ghost"
                                style={{
                                    padding: "16px 36px", color: "#fff", fontWeight: 600,
                                    fontSize: "16px", borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    background: "rgba(255,255,255,0.04)",
                                    textDecoration: "none",
                                }}
                            >
                                Free Consultation
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
