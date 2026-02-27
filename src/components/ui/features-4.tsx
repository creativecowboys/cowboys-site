"use client";

/* ─────────────────────────────────────────────────────────────
   features-4.tsx  —  Creative Cowboys  |  UI/UX Pro Max skill
   Style: Agency Dark + Glassmorphism cards
   Pattern: Services grid — 3-col desktop, 2-col tablet, 1-col mobile
   Responsive: 375 / 768 / 1024 / 1440 px
   Accessibility: WCAG AA contrast, focus-visible rings, reduced-motion
───────────────────────────────────────────────────────────── */

import React from "react";
import Link from "next/link";
import {
    Paintbrush,
    Search,
    Target,
    Megaphone,
    Video,
    Sparkles,
} from "lucide-react";

/* ── Design tokens ────────────────────────────────────────── */
const BRAND = {
    orange: "#F15F2A",
    blue: "#2A9CF1",
    gold: "#DBC792",
    pink: "#EA51FF",
    lavender: "#92A6DB",
    coral: "#FCD9C1",
};

const services = [
    {
        Icon: Paintbrush,
        label: "Web Design",
        color: BRAND.orange,
        href: "/web-design",
        description:
            "Custom websites built to look incredible and convert visitors into customers. No templates, no shortcuts.",
    },
    {
        Icon: Search,
        label: "SEO",
        color: BRAND.blue,
        href: "/seo",
        description:
            "Get found by the people searching for what you offer. Data-driven strategies that build real organic traffic.",
    },
    {
        Icon: Target,
        label: "PPC Advertising",
        color: BRAND.orange,
        href: "/ppc",
        description:
            "Google Ads that actually make money. Every dollar tracked, every click optimized for maximum ROI.",
    },
    {
        Icon: Megaphone,
        label: "Social Media Ads",
        color: BRAND.blue,
        href: "/social-media-ads",
        description:
            "Scroll-stopping ads on Facebook, Instagram, and TikTok that drive real engagement and sales.",
    },
    {
        Icon: Video,
        label: "Media Creation",
        color: BRAND.orange,
        href: "/media-creation",
        description:
            "Video, photography, and graphics that tell your story and make people care about your brand.",
    },
    {
        Icon: Sparkles,
        label: "Brand Strategy",
        color: BRAND.gold,
        href: "/brand-strategy",
        description:
            "From logo to launch, we build cohesive brand identities that stand out and connect with your audience.",
    },
];

/* ── Card component ───────────────────────────────────────── */
function ServiceCard({
    Icon,
    label,
    color,
    description,
    href,
}: {
    Icon: React.ElementType;
    label: string;
    color: string;
    description: string;
    href?: string;
}) {
    const [hovered, setHovered] = React.useState(false);

    const cardStyle = {
        /* Glassmorphism base */
        background: hovered
            ? "rgba(255, 255, 255, 0.07)"
            : "rgba(255, 255, 255, 0.04)",
        border: `1px solid ${hovered ? color + "55" : "rgba(255,255,255,0.10)"}`,
        borderRadius: "16px",
        padding: "36px 32px 32px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        /* Hover lift */
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
            ? `0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px ${color}33`
            : "0 4px 16px rgba(0,0,0,0.2)",
        transition:
            "transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1), border-color 200ms, background 200ms",
        cursor: href ? "pointer" : "default",
        outline: "none",
        position: "relative" as const,
        overflow: "hidden" as const,
        textDecoration: "none",
        display: "block",
    };

    const inner = (
        <div
            role="article"
            aria-label={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            tabIndex={href ? -1 : 0}
            style={cardStyle}
        >
            {/* Soft glow orb behind icon */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: "-30px",
                    left: "-30px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
                    pointerEvents: "none",
                    transition: "opacity 200ms",
                    opacity: hovered ? 1 : 0.5,
                }}
            />

            {/* Icon pill */}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    borderRadius: "999px",
                    padding: "8px 14px 8px 10px",
                    marginBottom: "20px",
                    transition: "background 200ms, border-color 200ms",
                }}
            >
                <Icon
                    size={16}
                    color={color}
                    strokeWidth={2}
                    aria-hidden="true"
                />
                <span
                    style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: color,
                        letterSpacing: "0.01em",
                        lineHeight: 1,
                    }}
                >
                    {label}
                </span>
            </div>

            {/* Description — WCAG AA: white on dark ~7:1 contrast */}
            <p
                style={{
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.68)",
                    margin: 0,
                    fontWeight: 400,
                }}
            >
                {description}
            </p>

            {/* Bottom accent bar */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "2px",
                    width: hovered ? "100%" : "0%",
                    background: `linear-gradient(90deg, ${color}, transparent)`,
                    borderRadius: "0 0 16px 16px",
                    transition: "width 250ms cubic-bezier(0.4,0,0.2,1)",
                }}
            />
        </div>
    );

    if (href) {
        return (
            <Link href={href} style={{ textDecoration: "none", display: "block" }}>
                {inner}
            </Link>
        );
    }
    return inner;
}

/* ── Section ──────────────────────────────────────────────── */
export function Features() {
    return (
        <>
            {/* Reduced-motion override */}
            <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-features-card] {
            transition: none !important;
          }
        }
        /* Focus ring for keyboard nav */
        [role="article"]:focus-visible {
          outline: 2px solid #F15F2A;
          outline-offset: 4px;
        }
        /* Responsive grid */
        .features-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

            <section
                aria-labelledby="features-heading"
                style={{
                    /* Dark section — contrasts cleanly with the pastel hero above */
                    background: "#0D0D0F",
                    width: "100%",
                    padding: "96px 24px 200px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background texture — large soft orbs for depth */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background:
                            "radial-gradient(ellipse 60% 55% at 15% 50%, rgba(241,95,42,0.06) 0%, transparent 70%)," +
                            "radial-gradient(ellipse 50% 50% at 85% 30%, rgba(42,156,241,0.06) 0%, transparent 70%)",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        maxWidth: "1160px",
                        margin: "0 auto",
                    }}
                >
                    {/* ── Header ── */}
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "72px",
                            maxWidth: "640px",
                            margin: "0 auto 72px",
                        }}
                    >
                        {/* Eyebrow */}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                color: BRAND.orange,
                                marginBottom: "20px",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "20px",
                                    height: "1px",
                                    background: BRAND.orange,
                                    opacity: 0.7,
                                }}
                            />
                            Our Services
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "20px",
                                    height: "1px",
                                    background: BRAND.orange,
                                    opacity: 0.7,
                                }}
                            />
                        </span>

                        {/* Headline — bold agency tone */}
                        <h2
                            id="features-heading"
                            style={{
                                fontSize: "clamp(32px, 5vw, 52px)",
                                fontWeight: 800,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                color: "#FFFFFF",
                                margin: "0 0 20px",
                            }}
                        >
                            Everything your brand{" "}
                            <span
                                style={{
                                    background: `linear-gradient(135deg, ${BRAND.orange} 0%, ${BRAND.pink} 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                needs to win online
                            </span>
                        </h2>

                        {/* Sub-copy — WCAG AA contrast on dark bg */}
                        <p
                            style={{
                                fontSize: "17px",
                                lineHeight: 1.7,
                                color: "rgba(255,255,255,0.55)",
                                margin: 0,
                                fontWeight: 400,
                            }}
                        >
                            We combine creative firepower with data-driven strategy to build
                            brands that actually move the needle. No fluff, no filler —
                            just results.
                        </p>
                    </div>

                    {/* ── Grid ── */}
                    <div className="features-grid">
                        {services.map((svc) => (
                            <ServiceCard key={svc.label} {...svc} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
