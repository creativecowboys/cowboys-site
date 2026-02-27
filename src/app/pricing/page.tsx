"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    IoGlobeOutline,
    IoSearchOutline,
    IoLogoInstagram,
    IoTrendingUpOutline,
    IoBrushOutline,
    IoVideocamOutline,
    IoCheckmarkCircle,
    IoArrowForward,
    IoSparklesOutline,
} from "react-icons/io5";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";
const CARD_BG = "#15181e";

// ── Service catalog ───────────────────────────────────────────────────────────
interface Service {
    id: string;
    name: string;
    tagline: string;
    priceLabel: string;
    billing: "monthly" | "one-time";
    icon: React.ElementType;
    bullets: string[];
    badge?: string;
}

const MONTHLY_SERVICES: Service[] = [
    {
        id: "website-monthly",
        name: "Website",
        tagline: "3–5 page custom site. No upfront fees. 12-month agreement.",
        priceLabel: "$497/mo",
        billing: "monthly",
        icon: IoGlobeOutline,
        badge: "Most Popular",
        bullets: [
            "Modern, mobile-first design",
            "SEO-optimized from day one",
            "No large upfront cost",
            "Managed & maintained for you",
        ],
    },
    {
        id: "seo-local",
        name: "SEO Local",
        tagline: "Local keyword targeting & Google Business Profile optimization.",
        priceLabel: "$497/mo",
        billing: "monthly",
        icon: IoSearchOutline,
        bullets: [
            "Google Business Profile audit & optimization",
            "Local keyword strategy",
            "Monthly rank tracking & reporting",
            "Review generation strategy",
        ],
    },
    {
        id: "seo-local-plus",
        name: "SEO Local Plus",
        tagline: "Enhanced local SEO with expanded keyword strategy.",
        priceLabel: "$997/mo",
        billing: "monthly",
        icon: IoSearchOutline,
        bullets: [
            "Everything in SEO Local",
            "Expanded keyword targeting",
            "Content creation included",
            "Competitor gap analysis",
        ],
    },
    {
        id: "seo-regional",
        name: "SEO Regional",
        tagline: "Regional market SEO for broader geographic reach.",
        priceLabel: "$1,797/mo",
        billing: "monthly",
        icon: IoSearchOutline,
        bullets: [
            "Multi-county keyword targeting",
            "Regional content strategy",
            "Advanced link building",
            "Full competitive monitoring",
        ],
    },
    {
        id: "digital-ads",
        name: "Digital Ads Management",
        tagline: "Google PPC campaign management & optimization.",
        priceLabel: "$250/mo",
        billing: "monthly",
        icon: IoTrendingUpOutline,
        bullets: [
            "Google Ads campaign setup & management",
            "Keyword bid optimization",
            "Monthly performance reporting",
            "Ad spend is separate from management fee",
        ],
    },
    {
        id: "social-starter",
        name: "Social Media — Starter",
        tagline: "4 posts per month. Custom content creation.",
        priceLabel: "$250/mo",
        billing: "monthly",
        icon: IoLogoInstagram,
        bullets: [
            "4 custom posts/month",
            "Caption & graphic creation",
            "Client approval before posting",
            "Instagram & Facebook",
        ],
    },
    {
        id: "social-growth",
        name: "Social Media — Growth",
        tagline: "8 posts per month. Custom content creation.",
        priceLabel: "$500/mo",
        billing: "monthly",
        icon: IoLogoInstagram,
        bullets: [
            "8 custom posts/month",
            "Short-form video strategy",
            "Client approval before posting",
            "Instagram, Facebook & TikTok",
        ],
    },
    {
        id: "social-pro",
        name: "Social Media — Pro",
        tagline: "16 posts per month. Premium content creation.",
        priceLabel: "$750/mo",
        billing: "monthly",
        icon: IoLogoInstagram,
        bullets: [
            "16 custom posts/month",
            "Full video production pipeline",
            "Paid social campaign management",
            "All platforms covered",
        ],
    },
    {
        id: "branding",
        name: "Graphic Design & Branding",
        tagline: "Ongoing brand design, graphics & visual content.",
        priceLabel: "$500/mo",
        billing: "monthly",
        icon: IoBrushOutline,
        bullets: [
            "Custom brand asset creation",
            "Social & ad graphic design",
            "Logo refinement & brand guide",
            "Unlimited revision rounds",
        ],
    },
];

const ONETIME_SERVICES: Service[] = [
    {
        id: "website-build",
        name: "Website (One-Time Build)",
        tagline: "Full custom website build. No recurring monthly fee.",
        priceLabel: "$5,900",
        billing: "one-time",
        icon: IoGlobeOutline,
        bullets: [
            "Complete custom design & development",
            "No ongoing monthly commitment",
            "SEO-optimized from day one",
            "Includes CMS so you can update it",
        ],
    },
    {
        id: "additional-pages",
        name: "Additional Pages",
        tagline: "Extra pages added during the initial website build.",
        priceLabel: "$175/page",
        billing: "one-time",
        icon: IoGlobeOutline,
        bullets: [
            "Per additional page beyond the base package",
            "Matched to your existing design system",
            "SEO-optimized & mobile-first",
            "Delivered with the main project",
        ],
    },
    {
        id: "strategy-meeting",
        name: "Business Growth Strategy",
        tagline: "1-hour focused strategy session with a senior strategist.",
        priceLabel: "$150",
        billing: "one-time",
        icon: IoSparklesOutline,
        bullets: [
            "1-on-1 with a senior strategist",
            "Competitive landscape analysis",
            "Custom growth roadmap",
            "Recorded & summarized for you",
        ],
    },
    {
        id: "media-production",
        name: "Media Production",
        tagline: "Professional photo & video production for your brand.",
        priceLabel: "Custom",
        billing: "one-time",
        icon: IoVideocamOutline,
        bullets: [
            "Brand photography sessions",
            "Promotional video production",
            "Social media content shoots",
            "Edited & ready to publish deliverables",
        ],
    },
];

function ServiceCard({ svc }: { svc: Service }) {
    const Icon = svc.icon;
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? "rgba(241,95,42,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${hovered ? "rgba(241,95,42,0.30)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "18px",
                padding: "28px",
                position: "relative",
                transition: "background 200ms ease, border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered ? "0 12px 40px rgba(241,95,42,0.12)" : "none",
                cursor: "default",
            }}
        >
            {svc.badge && (
                <div style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`,
                    color: "#fff", fontSize: "10px", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "4px 12px", borderRadius: "999px",
                }}>
                    {svc.badge}
                </div>
            )}

            {/* Icon + title */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
                <div style={{
                    width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                    background: hovered
                        ? `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`
                        : "rgba(241,95,42,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 200ms ease",
                }}>
                    <Icon size={20} color={hovered ? "#fff" : ORANGE} style={{ transition: "color 200ms ease" }} />
                </div>
                <div style={{ flex: 1, paddingRight: svc.badge ? "80px" : "0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
                        {svc.name}
                    </h3>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.5 }}>
                        {svc.tagline}
                    </p>
                </div>
            </div>

            {/* Bullets */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "9px" }}>
                {svc.bullets.map((b, i) => (
                    <li key={i} style={{ display: "flex", gap: "9px", fontSize: "13px", color: "rgba(255,255,255,0.50)", lineHeight: 1.5 }}>
                        <IoCheckmarkCircle size={14} color={hovered ? ORANGE : "rgba(255,255,255,0.20)"} style={{ flexShrink: 0, marginTop: "2px", transition: "color 200ms ease" }} />
                        {b}
                    </li>
                ))}
            </ul>

            {/* Price footer */}
            <div style={{
                paddingTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{
                    fontSize: "20px", fontWeight: 800, letterSpacing: "-0.03em",
                    background: hovered ? `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)` : "none",
                    WebkitBackgroundClip: hovered ? "text" : "unset",
                    WebkitTextFillColor: hovered ? "transparent" : "unset",
                    backgroundClip: hovered ? "text" : "unset",
                    color: hovered ? "transparent" : "#fff",
                    transition: "all 200ms ease",
                }}>
                    {svc.priceLabel}
                </span>
                <Link
                    href="/contact"
                    style={{
                        fontSize: "12px", fontWeight: 700, color: hovered ? ORANGE : "rgba(255,255,255,0.30)",
                        textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase",
                        transition: "color 200ms ease",
                        display: "flex", alignItems: "center", gap: "5px",
                    }}
                >
                    Get Started <IoArrowForward size={12} />
                </Link>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s both; }
        .fu-3 { animation: fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.28s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }

        .price-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .price-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .price-grid { grid-template-columns: 1fr; }
        }

        .onetime-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .onetime-grid { grid-template-columns: 1fr; }
        }

        .cta-btn {
          background: ${ORANGE};
          transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .cta-btn:hover {
          background: #d04c1c;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(241,95,42,0.35);
        }
        .ghost-btn {
          transition: background 180ms ease, border-color 180ms ease;
        }
        .ghost-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.25);
        }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>

                {/* Logo */}
                <Link href="/" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "860px", margin: "0 auto", padding: "160px 24px 100px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "700px", height: "320px", background: "radial-gradient(ellipse, rgba(241,95,42,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />

                    <div className="fu-1" style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "6px 16px",
                        background: "rgba(241,95,42,0.12)", border: "1px solid rgba(241,95,42,0.25)",
                        borderRadius: "999px", marginBottom: "28px",
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: ORANGE,
                    }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ORANGE, display: "inline-block" }} />
                        Transparent Pricing
                    </div>

                    <h1 className="fu-2" style={{
                        fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
                        lineHeight: 1.05, letterSpacing: "-0.035em",
                        color: "#fff", margin: "0 0 24px",
                    }}>
                        No surprises.{" "}
                        <span style={{
                            background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`,
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                            Just results.
                        </span>
                    </h1>

                    <p className="fu-3" style={{
                        fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7,
                        color: "rgba(255,255,255,0.48)", marginBottom: "44px",
                        maxWidth: "600px", marginInline: "auto",
                    }}>
                        Every service is priced clearly. No setup fees buried in the fine print, no long-term lock-ins on most services. Just straightforward marketing that works.
                    </p>

                    <div className="fu-3" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/contact" className="cta-btn" style={{
                            padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px",
                            borderRadius: "10px", textDecoration: "none",
                            display: "inline-flex", alignItems: "center", gap: "8px",
                        }}>
                            Get a Free Consultation <IoArrowForward size={17} />
                        </Link>
                        <Link href="/services" className="ghost-btn" style={{
                            padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px",
                            borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.04)", textDecoration: "none",
                        }}>
                            View Our Services
                        </Link>
                    </div>
                </section>

                {/* ── Monthly Services ── */}
                <section style={{ padding: "80px 24px 100px" }}>
                    <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

                        {/* Section header */}
                        <div style={{ textAlign: "center", marginBottom: "56px" }}>
                            <p style={{
                                fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em",
                                textTransform: "uppercase", color: ORANGE, marginBottom: "14px",
                            }}>
                                Monthly Services
                            </p>
                            <h2 style={{
                                fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
                                letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px",
                            }}>
                                Ongoing digital marketing
                            </h2>
                            <p style={{
                                fontSize: "16px", color: "rgba(255,255,255,0.45)",
                                maxWidth: "560px", margin: "0 auto", lineHeight: 1.7,
                            }}>
                                Recurring services that build compounding results over time. Mix and match — most clients combine 2–4 services into a custom package.
                            </p>
                        </div>

                        {/* Service cards grid */}
                        <div className="price-grid">
                            {MONTHLY_SERVICES.map(svc => (
                                <ServiceCard key={svc.id} svc={svc} />
                            ))}
                        </div>

                        {/* Bundle note */}
                        <div style={{
                            marginTop: "40px",
                            background: "rgba(241,95,42,0.06)",
                            border: "1px solid rgba(241,95,42,0.18)",
                            borderRadius: "14px",
                            padding: "24px 28px",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            textAlign: "center",
                        }}>
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                                    Bundle & Save
                                </p>
                                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                                    Combine 3+ services and ask us about package pricing. Many clients get their website included free when bundling SEO & Ads.
                                </p>
                            </div>
                            <Link href="/contact" style={{
                                flexShrink: 0,
                                padding: "10px 22px",
                                background: ORANGE, color: "#fff",
                                fontWeight: 700, fontSize: "13px",
                                borderRadius: "8px", textDecoration: "none",
                                whiteSpace: "nowrap",
                            }}>
                                Ask About Bundles
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── One-Time Services ── */}
                <section style={{ background: CARD_BG, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "100px 24px" }}>
                    <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

                        <div style={{ textAlign: "center", marginBottom: "56px" }}>
                            <p style={{
                                fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em",
                                textTransform: "uppercase", color: ORANGE, marginBottom: "14px",
                            }}>
                                One-Time Services
                            </p>
                            <h2 style={{
                                fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
                                letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px",
                            }}>
                                Build it once, own it forever
                            </h2>
                            <p style={{
                                fontSize: "16px", color: "rgba(255,255,255,0.45)",
                                maxWidth: "520px", margin: "0 auto", lineHeight: 1.7,
                            }}>
                                Project-based work with a flat fee. No surprise invoices, no recurring commitment.
                            </p>
                        </div>

                        <div className="onetime-grid">
                            {ONETIME_SERVICES.map(svc => (
                                <ServiceCard key={svc.id} svc={svc} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ / Pricing notes ── */}
                <section style={{ padding: "100px 24px" }}>
                    <div style={{ maxWidth: "740px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.03em" }}>
                            Common questions
                        </h2>
                        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginBottom: "56px", lineHeight: 1.7 }}>
                            Things people always ask before getting started.
                        </p>
                    </div>

                    <div style={{ maxWidth: "740px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                        {[
                            {
                                q: "Do I have to sign a long-term contract?",
                                a: "The Website monthly plan requires a 12-month agreement (since we cover design & setup costs). Most other services are month-to-month after an initial 3-month period so we have time to show results.",
                            },
                            {
                                q: "Is ad spend included in the Digital Ads fee?",
                                a: "No — the $250/mo Digital Ads Management fee covers our management and optimization work. Your Google Ads budget is billed directly to your account by Google and is separate.",
                            },
                            {
                                q: "Can I bundle services together?",
                                a: "Absolutely. Most clients bundle 2–4 services for a custom package rate. Ask us about bundles — we regularly include website services free when you combine SEO + Ads.",
                            },
                            {
                                q: "How long before I see results from SEO?",
                                a: "Local SEO typically shows meaningful movement in 60–90 days, with stronger results at 4–6 months. We track rankings, traffic, and leads every month so you can see the progress clearly.",
                            },
                            {
                                q: "Are pricing subject to change?",
                                a: "Yes — all pricing is subject to change. Existing clients are locked to their contracted rate for the duration of their agreement. Contact us for current custom package quotes.",
                            },
                        ].map(({ q, a }, i) => (
                            <FAQItem key={i} q={q} a={a} />
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ background: CARD_BG, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "120px 24px", textAlign: "center" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", margin: "0 0 20px" }}>
                            Ready to build your plan?
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "44px", lineHeight: 1.7 }}>
                            Free 30-minute consultation. We&rsquo;ll dig into your goals, review your current digital presence, and put together a clear plan with exact pricing.
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                            <Link href="/contact" className="cta-btn" style={{
                                padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px",
                                borderRadius: "10px", textDecoration: "none",
                                display: "inline-flex", alignItems: "center", gap: "8px",
                            }}>
                                Get Your Free Consultation <IoArrowForward size={18} />
                            </Link>
                            <Link href="/results" className="ghost-btn" style={{
                                padding: "16px 32px", color: "#fff", fontWeight: 600, fontSize: "15px",
                                borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.04)", textDecoration: "none",
                            }}>
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

// ── FAQ accordion item ──────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            style={{
                background: open ? "rgba(241,95,42,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${open ? "rgba(241,95,42,0.20)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px",
                marginBottom: "8px",
                transition: "background 200ms ease, border-color 200ms ease",
                overflow: "hidden",
            }}
        >
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: "100%", textAlign: "left", padding: "20px 24px",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                }}
            >
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{q}</span>
                <span style={{
                    flexShrink: 0, width: "22px", height: "22px",
                    borderRadius: "50%",
                    background: open ? ORANGE : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 200ms ease",
                    fontSize: "15px", color: open ? "#fff" : "rgba(255,255,255,0.40)",
                    fontWeight: 300,
                }}>
                    {open ? "−" : "+"}
                </span>
            </button>
            {open && (
                <div style={{ padding: "0 24px 20px" }}>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.50)", lineHeight: 1.75, margin: 0 }}>{a}</p>
                </div>
            )}
        </div>
    );
}
