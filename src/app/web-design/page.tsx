"use client";

import { ArrowRight, CheckCircle2, BarChart3, Target, Zap, MonitorSmartphone, Search, TrendingUp, ShieldCheck, Telescope, LayoutTemplate, Paintbrush, Rocket } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";

/* ── Brand tokens (mirror features-4 / globals) ─────────────── */
const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

/* ── Process steps data ──────────────────────────────────────── */
const processSteps = [
    { step: "01", title: "Discovery & Strategy", icon: Telescope, description: "We dive deep into your business, audience, and competitors to find your unique edge." },
    { step: "02", title: "Structure & Messaging", icon: LayoutTemplate, description: "We map out the user journey and craft compelling copy that sells your value." },
    { step: "03", title: "Design & Development", icon: Paintbrush, description: "We bring the strategy to life with stunning, high-performance custom design." },
    { step: "04", title: "Launch & Optimization", icon: Rocket, description: "We deploy, test, and integrate analytics to ensure maximum ROI from day one." },
];

/* ── AnimatedContainer ───────────────────────────────────────── */
function AnimatedContainer({
    className,
    delay = 0.1,
    children,
}: {
    delay?: number;
    className?: string;
    children: React.ReactNode;
}) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) return <>{children}</>;
    return (
        <motion.div
            initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
            whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ── ProcessSection ──────────────────────────────────────────── */
function ProcessSection() {
    return (
        <div style={{ width: "100%" }}>
            <style>{`
                .process-card {
                    transition: transform 240ms cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 240ms ease,
                                background 240ms ease;
                }
                .process-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 48px rgba(241,95,42,0.16), 0 6px 16px rgba(26,21,20,0.10);
                    background: #ffffff !important;
                }
                .process-icon-badge {
                    transition: background 240ms ease, box-shadow 240ms ease, transform 240ms cubic-bezier(0.34,1.56,0.64,1);
                }
                .process-card:hover .process-icon-badge {
                    background: rgba(241,95,42,0.14) !important;
                    box-shadow: 0 0 0 6px rgba(241,95,42,0.08);
                    transform: scale(1.08);
                }
                .process-cta-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #F15F2A;
                    text-decoration: none;
                    border-bottom: 1.5px solid rgba(241,95,42,0.35);
                    padding-bottom: 2px;
                    transition: border-color 180ms ease;
                }
                .process-cta-link:hover {
                    border-color: #F15F2A;
                }
            `}</style>

            {/* ── Header ── */}
            <AnimatedContainer delay={0.05}>
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#F15F2A",
                        marginBottom: "18px",
                        fontFamily: "var(--font-geist-sans, sans-serif)",
                    }}>
                        Our Process
                    </span>
                    <h2 style={{
                        fontSize: "clamp(30px, 4.5vw, 52px)",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        color: "#1a1514",
                        margin: "0 0 18px",
                        lineHeight: 1.08,
                        fontFamily: "var(--font-geist-sans, sans-serif)",
                    }}>
                        Strategy First.{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            Design Second.
                        </span>
                    </h2>
                    <p style={{
                        fontSize: "17px",
                        color: "rgba(26,21,20,0.50)",
                        maxWidth: "520px",
                        marginInline: "auto",
                        lineHeight: 1.7,
                        fontFamily: "var(--font-geist-sans, sans-serif)",
                    }}>
                        We don&rsquo;t just start pushing pixels. We follow a battle-tested process to ensure your website actually achieves your business goals.
                    </p>
                </div>
            </AnimatedContainer>

            {/* ── Card Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", position: "relative" }}>

                {processSteps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.step}
                            className="process-card"
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                background: "rgba(255,255,255,0.92)",
                                border: "1px solid rgba(26,21,20,0.09)",
                                borderRadius: "20px",
                                padding: "28px 24px",
                                position: "relative",
                                overflow: "hidden",
                                zIndex: 1,
                                cursor: "default",
                            }}
                        >
                            {/* Watermark step number */}
                            <span style={{
                                position: "absolute",
                                top: "10px",
                                right: "14px",
                                fontSize: "64px",
                                fontWeight: 900,
                                color: "rgba(26,21,20,0.05)",
                                lineHeight: 1,
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                                pointerEvents: "none",
                                userSelect: "none",
                                letterSpacing: "-0.04em",
                            }}>
                                {step.step}
                            </span>

                            {/* Icon badge */}
                            <div
                                className="process-icon-badge"
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    background: "rgba(241,95,42,0.08)",
                                    border: "1px solid rgba(241,95,42,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "20px",
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <Icon size={20} color="#F15F2A" strokeWidth={1.5} />
                            </div>

                            {/* Step micro-label */}
                            <p style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "rgba(241,95,42,0.65)",
                                margin: "0 0 7px",
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                            }}>
                                Step {step.step}
                            </p>

                            <h3 style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#1a1514",
                                margin: "0 0 10px",
                                lineHeight: 1.3,
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                            }}>
                                {step.title}
                            </h3>

                            <p style={{
                                fontSize: "13px",
                                lineHeight: 1.75,
                                color: "rgba(26,21,20,0.50)",
                                margin: 0,
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                            }}>
                                {step.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Bottom micro-CTA ── */}
            <AnimatedContainer delay={0.65}>
                <div style={{ textAlign: "center", marginTop: "48px" }}>
                    <p style={{
                        fontSize: "14px",
                        color: "rgba(26,21,20,0.38)",
                        fontFamily: "var(--font-geist-sans, sans-serif)",
                        margin: "0 0 14px",
                    }}>
                        Ready to start your project?
                    </p>
                    <a href="/contact" className="process-cta-link">
                        Book a free strategy call <ArrowRight size={14} />
                    </a>
                </div>
            </AnimatedContainer>
        </div>
    );
}

export default function WebDesignPage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu-1 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        .fu-4 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.42s both; }
        @media (prefers-reduced-motion: reduce) {
          .fu-1,.fu-2,.fu-3,.fu-4 { animation: none; }
        }
        .wd-card {
          transition: border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease;
        }
        .wd-card:hover {
          border-color: rgba(241,95,42,0.35) !important;
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }
        .wd-step-icon {
          transition: background 220ms ease;
        }
        .wd-card:hover .wd-step-icon {
          background: rgba(241,95,42,0.12);
        }
        .wd-pill {
          transition: background 200ms ease, border-color 200ms ease;
        }
        .wd-pill:hover {
          background: rgba(241,95,42,0.12);
          border-color: rgba(241,95,42,0.4);
        }
        .wd-cta-btn-primary {
          background: ${ORANGE};
          transition: background 180ms ease, transform 180ms ease;
        }
        .wd-cta-btn-primary:hover {
          background: #d44d1e;
          transform: translateY(-1px);
        }
        .wd-cta-btn-ghost {
          transition: background 180ms ease;
        }
        .wd-cta-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
        }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>

                {/* ── Logo ───────────────────────────────────────────────── */}
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image
                        src="/Main%20logo%202.png"
                        alt="Creative Cowboys Media — Home"
                        width={180}
                        height={48}
                        priority
                        style={{ width: "180px", height: "auto", display: "block" }}
                    />
                </Link>

                {/* ── HERO ───────────────────────────────────────────────── */}
                <section style={{ maxWidth: "860px", margin: "0 auto", padding: "160px 24px 120px", textAlign: "center" }}>
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "24px" }}>
                        Web Design Services
                    </p>

                    <h1 className="fu-2" style={{
                        fontSize: "clamp(38px, 6vw, 72px)",
                        fontWeight: 800,
                        lineHeight: 1.06,
                        letterSpacing: "-0.03em",
                        color: "#ffffff",
                        margin: "0 0 24px",
                    }}>
                        Web Design That{" "}
                        <span style={{
                            background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            Actually Converts.
                        </span>
                    </h1>

                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.65, color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>
                        Your website shouldn&rsquo;t just look pretty. It should generate leads, close sales, and move your business forward.
                    </p>
                    <p className="fu-3" style={{ fontSize: "clamp(15px, 1.6vw, 17px)", lineHeight: 1.7, color: "rgba(255,255,255,0.38)", marginBottom: "48px", maxWidth: "640px", marginInline: "auto" }}>
                        We build high-performance, revenue-generating websites for brands that are serious about growth. Stop losing customers to a confusing digital experience.
                    </p>

                    <div className="fu-4" style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                        <button
                            className="wd-cta-btn-primary"
                            style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
                        >
                            Start Your Project <ArrowRight size={18} />
                        </button>
                        <button
                            className="wd-cta-btn-ghost"
                            style={{ padding: "14px 32px", color: "#fff", fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", cursor: "pointer" }}
                        >
                            Get a Free Strategy Call
                        </button>
                    </div>
                </section>

                {/* ── SECTION 1: The Problem ─────────────────────────────── */}
                <section style={{ background: "linear-gradient(180deg, #fce8d5 0%, #f0ddd4 100%)", borderTop: "1px solid rgba(26,21,20,0.07)", borderBottom: "1px solid rgba(26,21,20,0.07)", padding: "96px 24px", position: "relative", overflow: "hidden" }}>

                    {/* Decorative glow blobs */}
                    <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "380px", height: "380px", background: "rgba(241,95,42,0.08)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "260px", height: "260px", background: "rgba(234,81,255,0.05)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />

                    <div style={{ maxWidth: "1060px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "72px", alignItems: "center", position: "relative", zIndex: 1 }}>

                        {/* ── Left copy ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* Eyebrow with dash */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                                <div style={{ width: "24px", height: "2px", background: "#F15F2A", borderRadius: "1px", flexShrink: 0 }} />
                                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F15F2A", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                    The Problem
                                </span>
                            </div>

                            {/* Headline */}
                            <h2 style={{ fontSize: "clamp(32px, 4.2vw, 52px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#1a1514", margin: "0 0 28px", lineHeight: 1.04, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                Most Websites<br />Don&rsquo;t Work.
                            </h2>

                            {/* Body copy */}
                            <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(26,21,20,0.58)", marginBottom: "20px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                They&rsquo;re slow. They&rsquo;re confusing. They look like every other template on the internet. And worst of all—they don&rsquo;t convert.
                            </p>
                            <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(26,21,20,0.58)", marginBottom: "36px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                A pretty website without a strategy is just an expensive digital brochure. At Creative Cowboys, we don&rsquo;t just design; we engineer user journeys.
                            </p>

                            {/* Pull-quote blockquote */}
                            <blockquote style={{ margin: "0 0 36px", borderLeft: "3px solid #F15F2A", paddingLeft: "18px" }}>
                                <p style={{ fontSize: "15px", fontStyle: "italic", lineHeight: 1.7, color: "rgba(26,21,20,0.65)", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                    &ldquo;Every pixel, button, and headline — strategically placed to turn visitors into paying customers.&rdquo;
                                </p>
                            </blockquote>

                            {/* Stat trust anchors */}
                            <div style={{ display: "flex", gap: "36px" }}>
                                {[
                                    { stat: "53%", label: "of visits abandoned if load > 3s" },
                                    { stat: "7s", label: "to make a first impression" },
                                ].map(({ stat, label }) => (
                                    <div key={stat}>
                                        <p style={{ fontSize: "30px", fontWeight: 800, color: "#F15F2A", margin: "0 0 4px", letterSpacing: "-0.04em", fontFamily: "var(--font-geist-sans, sans-serif)" }}>{stat}</p>
                                        <p style={{ fontSize: "12px", color: "rgba(26,21,20,0.48)", margin: 0, lineHeight: 1.5, maxWidth: "110px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── Pain-point glassmorphism card ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                background: "rgba(255,255,255,0.72)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                padding: "40px",
                                borderRadius: "28px",
                                border: "1px solid rgba(255,255,255,0.9)",
                                boxShadow: "0 24px 64px rgba(26,21,20,0.09), 0 4px 16px rgba(26,21,20,0.04), inset 0 1px 0 rgba(255,255,255,1)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Card glow */}
                            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", background: "rgba(241,95,42,0.10)", filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />

                            {/* Card label */}
                            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(26,21,20,0.30)", margin: "0 0 28px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                Common Pain Points
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
                                {[
                                    { Icon: Zap, label: "Slow Load Times", text: "Losing 50% of visitors before they even see your offer.", stat: "−50%" },
                                    { Icon: Target, label: "Unclear Messaging", text: "Users leave if they don't understand what you do in 3 seconds.", stat: "3 sec" },
                                    { Icon: BarChart3, label: "Zero Conversion Strategy", text: "Traffic means nothing if there's no clear path to purchase.", stat: "$0 ROI" },
                                ].map(({ Icon, label, text, stat }, i) => (
                                    <motion.div
                                        key={label}
                                        initial={{ opacity: 0, y: 14 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.32 + i * 0.12, duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        {i > 0 && <div style={{ height: "1px", background: "rgba(26,21,20,0.07)", margin: "20px 0" }} />}
                                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                            <div style={{
                                                width: "44px", height: "44px", borderRadius: "14px", flexShrink: 0,
                                                background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.13)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "box-shadow 250ms ease, transform 250ms ease",
                                            }}>
                                                <Icon size={18} color="#ef4444" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                                                    <p style={{ fontWeight: 700, color: "#1a1514", margin: 0, fontSize: "15px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>{label}</p>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", letterSpacing: "0.04em", fontFamily: "var(--font-geist-sans, sans-serif)", whiteSpace: "nowrap", marginLeft: "12px" }}>{stat}</span>
                                                </div>
                                                <p style={{ fontSize: "13px", color: "rgba(26,21,20,0.48)", margin: 0, lineHeight: 1.65, fontFamily: "var(--font-geist-sans, sans-serif)" }}>{text}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Card footer micro-CTA */}
                            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(26,21,20,0.07)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F15F2A", flexShrink: 0 }} />
                                <p style={{ fontSize: "12px", color: "rgba(26,21,20,0.45)", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                    Sound familiar? <a href="/contact" style={{ color: "#F15F2A", fontWeight: 600, textDecoration: "none" }}>Let&rsquo;s fix that →</a>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>


                {/* ── SECTION 2: What We Build ──────────────────────────── */}
                <section style={{ padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 18px" }}>
                                Custom Websites Built for Growth
                            </h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", maxWidth: "600px", marginInline: "auto", lineHeight: 1.7 }}>
                                We don&rsquo;t use cookie-cutter templates. We build bespoke digital assets designed to dominate your market and drive revenue.
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                            {[
                                { Icon: Target, title: "Conversion-Focused", desc: "Structured with clear calls-to-action and psychological triggers that guide users to buy." },
                                { Icon: Zap, title: "Lightning Fast", desc: "Optimized for speed. Because every second of delay costs you conversions and search rankings." },
                                { Icon: MonitorSmartphone, title: "Mobile-First", desc: "Flawless experience on every device. We design for where your customers actually are." },
                                { Icon: Search, title: "SEO-Ready", desc: "Built with clean code and proper structure so Google loves your site from day one." },
                                { Icon: ShieldCheck, title: "Secure & Scalable", desc: "Enterprise-grade security and architecture that grows as your business scales." },
                                { Icon: TrendingUp, title: "Data-Driven", desc: "Integrated with advanced analytics so you know exactly how your site is performing." },
                            ].map(({ Icon, title, desc }) => (
                                <div key={title} className="wd-card" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "32px" }}>
                                    <div className="wd-step-icon" style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                                        <Icon size={22} color={ORANGE} />
                                    </div>
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{title}</h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CAROUSEL: Work Showcase ───────────────────────────── */}
                <section style={{ background: "#0a0a0c", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "96px 0 80px", position: "relative", overflow: "hidden" }}>
                    {/* bg glow */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "400px", background: `radial-gradient(ellipse, rgba(241,95,42,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />

                    <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "0 24px 48px", position: "relative", zIndex: 1 }}>
                        {/* Eyebrow */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                            <div style={{ width: "24px", height: "2px", background: ORANGE, borderRadius: "1px", flexShrink: 0 }} />
                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                Our Work
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                            <h2 style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#ffffff", margin: 0, lineHeight: 1.02, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                Sites That{" "}
                                <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    Actually Convert.
                                </span>
                            </h2>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.32)", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "16px" }}>←</span> drag to explore <span style={{ fontSize: "16px" }}>→</span>
                            </p>
                        </div>
                    </div>

                    {/* 3D Carousel */}
                    <ThreeDPhotoCarousel />
                </section>


                <section style={{ background: "linear-gradient(180deg, #f0ddd4 0%, #fce8d5 60%, #f0ddd4 100%)", borderTop: "1px solid rgba(26,21,20,0.07)", borderBottom: "1px solid rgba(26,21,20,0.07)", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "350px", background: "rgba(241,95,42,0.10)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "1060px", margin: "0 auto", position: "relative", zIndex: 1 }}>

                        <ProcessSection />

                    </div>
                </section>

                {/* ── SECTION 4: Who It's For ───────────────────────────── */}
                <section style={{ background: "#0D0D0F", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
                    {/* Decorative glow */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "300px", background: "rgba(241,95,42,0.06)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <style>{`
                        .af-dark-card {
                            transition: transform 230ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 230ms ease, border-color 230ms ease;
                            cursor: default;
                        }
                        .af-dark-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 20px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(241,95,42,0.18);
                            border-color: rgba(241,95,42,0.22) !important;
                        }
                        .af-dark-card:hover .afd-icon {
                            color: #F15F2A !important;
                            transform: scale(1.12);
                        }
                        .afd-icon {
                            transition: transform 230ms cubic-bezier(0.34,1.56,0.64,1), color 200ms ease;
                        }
                    `}</style>
                    <div style={{ maxWidth: "1060px", margin: "0 auto", position: "relative", zIndex: 1 }}>

                        {/* Header */}
                        <AnimatedContainer delay={0.05}>
                            <div style={{ marginBottom: "56px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <div style={{ width: "24px", height: "2px", background: "#F15F2A", borderRadius: "1px", flexShrink: 0 }} />
                                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F15F2A", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                        Who We Work With
                                    </span>
                                </div>
                                <h2 style={{ fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#ffffff", margin: "0 0 20px", lineHeight: 1.02, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                    Built for Businesses<br />That Want to{" "}
                                    <span style={{ background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Grow</span>
                                </h2>
                                <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.58)", lineHeight: 1.75, maxWidth: "520px", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                    We partner with ambitious companies that understand the value of a premium digital presence.
                                </p>
                            </div>
                        </AnimatedContainer>

                        {/* April Ford dark individual cards — 3-column grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                            {[
                                { Icon: MonitorSmartphone, title: "Local Businesses", desc: "Service businesses and brick-and-mortar shops ready to dominate their local market online." },
                                { Icon: Zap, title: "Contractors & Trades", desc: "Builders, HVAC, electricians — companies that need leads flowing consistently." },
                                { Icon: TrendingUp, title: "Professional Firms", desc: "Law firms, accountants, consultants who need a site that commands authority." },
                                { Icon: ShieldCheck, title: "E-Commerce Brands", desc: "Stores that need a high-converting storefront, not just another Shopify theme." },
                                { Icon: Target, title: "Scaling Startups", desc: "Early-stage companies that need to establish credibility fast and attract investment." },
                                { Icon: BarChart3, title: "B2B Services", desc: "Companies selling to other businesses where trust and clarity drive every deal." },
                            ].map(({ Icon, title, desc }, i) => (
                                <motion.div
                                    key={title}
                                    className="af-dark-card"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.08 + i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                    style={{
                                        background: "#15181e",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: "18px",
                                        padding: "28px",
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        className="afd-icon"
                                        style={{ color: "rgba(255,255,255,0.25)", marginBottom: "20px", display: "block" }}
                                        strokeWidth={1.5}
                                    />
                                    <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", margin: "0 0 10px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                        {title}
                                    </p>
                                    <p style={{ fontSize: "14px", lineHeight: 1.72, color: "rgba(255,255,255,0.60)", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>




                {/* ── SECTION 5: Why Creative Cowboys — Editorial Manifesto ── */}
                <section style={{ background: CARD, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "120px 24px", position: "relative", overflow: "hidden" }}>

                    {/* bg glow */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "400px", background: `radial-gradient(ellipse, rgba(241,95,42,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />

                    <style>{`
                        @keyframes marqueeTicker {
                            from { transform: translateX(0); }
                            to   { transform: translateX(-50%); }
                        }
                        .why-ticker-track {
                            display: flex;
                            white-space: nowrap;
                            animation: marqueeTicker 22s linear infinite;
                            gap: 0;
                        }
                        .why-proof-bar {
                            transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), border-color 200ms ease;
                        }
                        .why-proof-bar:hover {
                            transform: translateX(6px);
                            border-color: rgba(241,95,42,0.40) !important;
                        }
                    `}</style>

                    <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

                        {/* ── Eyebrow ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}
                        >
                            <div style={{ width: "24px", height: "2px", background: ORANGE, borderRadius: "1px" }} />
                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                Why Creative Cowboys
                            </span>
                        </motion.div>

                        {/* ── GIANT display headline ── */}
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                fontSize: "clamp(52px, 9vw, 120px)",
                                fontWeight: 900,
                                letterSpacing: "-0.04em",
                                lineHeight: 0.96,
                                color: "#ffffff",
                                margin: "0 0 40px",
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                            }}
                        >
                            We Don&rsquo;t<br />
                            Build{" "}
                            <span style={{
                                background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                Websites.
                            </span><br />
                            We Build<br />
                            <span style={{ color: "rgba(255,255,255,0.22)", fontStyle: "italic" }}>Revenue Machines.</span>
                        </motion.h2>

                        {/* ── Bold italic pull quote ── */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                fontSize: "clamp(18px, 2.2vw, 24px)",
                                fontStyle: "italic",
                                lineHeight: 1.6,
                                color: "rgba(255,255,255,0.50)",
                                maxWidth: "680px",
                                marginBottom: "72px",
                                fontFamily: "var(--font-geist-sans, sans-serif)",
                                borderLeft: `3px solid ${ORANGE}`,
                                paddingLeft: "24px",
                            }}
                        >
                            Most web designers are artists. We are marketers. Every pixel we place has one job — turn your visitors into paying customers.
                        </motion.p>

                        {/* ── Proof point bars ── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "72px" }}>
                            {[
                                { num: "01", title: "Conversion-Focused Design", desc: "Psychological triggers, clear CTAs, and strategic layout that guide visitors to a decision." },
                                { num: "02", title: "Technical SEO Built-In", desc: "Your site launches ranking-ready. Clean code, proper structure, fast load times — from day one." },
                                { num: "03", title: "Ad Campaign Integration", desc: "Landing pages engineered for your paid traffic so every dollar you spend works harder." },
                                { num: "04", title: "Analytics & Revenue Tracking", desc: "Know exactly what's working. We set up advanced tracking tied directly to your revenue." },
                            ].map(({ num, title, desc }, i) => (
                                <motion.div
                                    key={num}
                                    className="why-proof-bar"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "56px 1fr",
                                        gap: "28px",
                                        alignItems: "start",
                                        padding: "24px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        cursor: "default",
                                    }}
                                >
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: ORANGE, letterSpacing: "0.06em", paddingTop: "3px", fontFamily: "var(--font-geist-sans, sans-serif)" }}>{num}</span>
                                    <div>
                                        <p style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.01em", fontFamily: "var(--font-geist-sans, sans-serif)" }}>{title}</p>
                                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>{desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── Inline CTA ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
                            style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}
                        >
                            <button
                                className="wd-cta-btn-primary"
                                style={{ padding: "16px 36px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
                            >
                                Start a Project <ArrowRight size={17} />
                            </button>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.32)", margin: 0, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                                No long-term contracts. No BS. Just results.
                            </p>
                        </motion.div>
                    </div>
                </section>




                {/* ── FINAL CTA ─────────────────────────────────────────── */}
                <section style={{ background: `linear-gradient(180deg, ${CARD} 0%, ${DARK} 100%)`, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(241,95,42,0.18)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.06, margin: "0 0 24px" }}>
                            Let&rsquo;s Build Something That{" "}
                            <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                Actually Converts.
                            </span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7 }}>
                            Stop settling for a website that just sits there. It&rsquo;s time to build a digital asset that drives real revenue for your business.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <button
                                className="wd-cta-btn-primary"
                                style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
                            >
                                Start My Website Project <ArrowRight size={18} />
                            </button>
                            <button
                                className="wd-cta-btn-ghost"
                                style={{ padding: "16px 36px", color: "#fff", fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", cursor: "pointer" }}
                            >
                                Schedule a Strategy Call
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Footer ────────────────────────────────────────────── */}
                <Footer7 />
            </div>

            {/* Floating Nav */}
            <FloatingNav />
        </>
    );
}
