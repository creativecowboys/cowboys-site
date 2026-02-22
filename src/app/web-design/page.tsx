"use client";

import { ArrowRight, CheckCircle2, BarChart3, Target, Zap, MonitorSmartphone, Search, TrendingUp, ShieldCheck } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";
import Image from "next/image";

/* ── Brand tokens ─────────────────────────────────────────── */
const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const PEACH = "#fce8d5";
const PEACH2 = "#f0ddd4";
const DARK_TEXT = "#1a1514";

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
          box-shadow: 0 16px 48px rgba(26,21,20,0.12);
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
          background: rgba(241,95,42,0.10);
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
          transition: background 180ms ease, border-color 180ms ease;
        }
        .wd-cta-btn-ghost:hover {
          background: rgba(26,21,20,0.06);
          border-color: rgba(26,21,20,0.25);
        }
      `}</style>

            <div style={{ background: PEACH, minHeight: "100vh", color: DARK_TEXT, fontFamily: "var(--font-geist-sans, sans-serif)" }}>

                {/* ── Logo ───────────────────────────────────────────────── */}
                <div style={{ position: "fixed", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image
                        src="/cactus_for_login_page_-_black.png"
                        alt="Creative Cowboys Media"
                        width={180}
                        height={48}
                        priority
                        style={{ width: "180px", height: "auto" }}
                    />
                </div>

                {/* ── HERO ───────────────────────────────────────────────── */}
                <section style={{
                    maxWidth: "860px",
                    margin: "0 auto",
                    padding: "160px 24px 120px",
                    textAlign: "center",
                }}>
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "24px" }}>
                        Web Design Services
                    </p>

                    <h1 className="fu-2" style={{
                        fontSize: "clamp(38px, 6vw, 72px)",
                        fontWeight: 800,
                        lineHeight: 1.06,
                        letterSpacing: "-0.03em",
                        color: DARK_TEXT,
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

                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.65, color: "rgba(26,21,20,0.60)", marginBottom: "12px" }}>
                        Your website shouldn&rsquo;t just look pretty. It should generate leads, close sales, and move your business forward.
                    </p>
                    <p className="fu-3" style={{ fontSize: "clamp(15px, 1.6vw, 17px)", lineHeight: 1.7, color: "rgba(26,21,20,0.45)", marginBottom: "48px", maxWidth: "640px", marginInline: "auto" }}>
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
                            style={{ padding: "14px 32px", color: DARK_TEXT, fontWeight: 600, fontSize: "15px", borderRadius: "10px", border: `1px solid rgba(26,21,20,0.18)`, background: "rgba(255,255,255,0.55)", cursor: "pointer" }}
                        >
                            Get a Free Strategy Call
                        </button>
                    </div>
                </section>

                {/* ── SECTION 1: The Problem ─────────────────────────────── */}
                <section style={{ background: "rgba(255,255,255,0.6)", borderTop: "1px solid rgba(26,21,20,0.08)", borderBottom: "1px solid rgba(26,21,20,0.08)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1060px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "64px", alignItems: "center" }}>
                        <div>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 20px" }}>
                                Most Websites Don&rsquo;t Work.
                            </h2>
                            <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(26,21,20,0.60)", marginBottom: "18px" }}>
                                They&rsquo;re slow. They&rsquo;re confusing. They look like every other template on the internet. And worst of all—they don&rsquo;t convert.
                            </p>
                            <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(26,21,20,0.60)" }}>
                                A pretty website without a strategy is just an expensive digital brochure. At Creative Cowboys, we don&rsquo;t just design; we engineer user journeys. Every pixel, every button, and every headline is strategically placed to turn visitors into paying customers.
                            </p>
                        </div>

                        {/* Pain-point card */}
                        <div style={{ background: PEACH2, padding: "36px", borderRadius: "20px", border: "1px solid rgba(26,21,20,0.08)", boxShadow: "0 12px 40px rgba(26,21,20,0.07)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(241,95,42,0.15)", filter: "blur(48px)", borderRadius: "50%", pointerEvents: "none" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "28px", position: "relative", zIndex: 1 }}>
                                {[
                                    { Icon: Zap, label: "Slow Load Times", text: "Losing 50% of visitors before they even see your offer." },
                                    { Icon: Target, label: "Unclear Messaging", text: "Users leave if they don't understand what you do in 3 seconds." },
                                    { Icon: BarChart3, label: "Zero Conversion Strategy", text: "Traffic means nothing if there's no clear path to purchase." },
                                ].map(({ Icon, label, text }) => (
                                    <div key={label} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={18} color="#ef4444" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, color: DARK_TEXT, margin: "0 0 4px", fontSize: "15px" }}>{label}</p>
                                            <p style={{ fontSize: "13px", color: "rgba(26,21,20,0.50)", margin: 0, lineHeight: 1.6 }}>{text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: What We Build ──────────────────────────── */}
                <section style={{ padding: "96px 24px", background: PEACH }}>
                    <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 18px" }}>
                                Custom Websites Built for Growth
                            </h2>
                            <p style={{ fontSize: "17px", color: "rgba(26,21,20,0.50)", maxWidth: "600px", marginInline: "auto", lineHeight: 1.7 }}>
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
                                <div key={title} className="wd-card" style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,21,20,0.08)", borderRadius: "18px", padding: "32px", backdropFilter: "blur(8px)" }}>
                                    <div className="wd-step-icon" style={{ width: "48px", height: "48px", background: "rgba(241,95,42,0.08)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                                        <Icon size={22} color={ORANGE} />
                                    </div>
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: DARK_TEXT, margin: "0 0 10px" }}>{title}</h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(26,21,20,0.50)", margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 3: Our Approach / Process ─────────────────── */}
                <section style={{ background: PEACH2, borderTop: "1px solid rgba(26,21,20,0.07)", borderBottom: "1px solid rgba(26,21,20,0.07)", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "350px", background: "rgba(241,95,42,0.10)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "1060px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 18px" }}>
                                Strategy First. Design Second.
                            </h2>
                            <p style={{ fontSize: "17px", color: "rgba(26,21,20,0.50)", maxWidth: "560px", marginInline: "auto", lineHeight: 1.7 }}>
                                We don&rsquo;t just start pushing pixels. We follow a battle-tested process to ensure your website actually achieves your business goals.
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
                            {[
                                { step: "01", title: "Discovery & Strategy", desc: "We dive deep into your business, audience, and competitors to find your unique edge." },
                                { step: "02", title: "Structure & Messaging", desc: "We map out the user journey and craft compelling copy that sells your value." },
                                { step: "03", title: "Design & Development", desc: "We bring the strategy to life with stunning, high-performance custom design." },
                                { step: "04", title: "Launch & Optimization", desc: "We deploy, test, and integrate analytics to ensure maximum ROI from day one." },
                            ].map(({ step, title, desc }) => (
                                <div key={step} style={{ position: "relative" }}>
                                    <p style={{ fontSize: "60px", fontWeight: 900, color: "rgba(26,21,20,0.07)", lineHeight: 1, margin: "0 0 12px" }}>{step}</p>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: DARK_TEXT, margin: "0 0 10px" }}>{title}</h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(26,21,20,0.50)", margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 4: Who It's For ───────────────────────────── */}
                <section style={{ padding: "96px 24px", textAlign: "center", background: PEACH }}>
                    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 18px" }}>
                            Built for Businesses That Want to Grow
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(26,21,20,0.50)", marginBottom: "48px", lineHeight: 1.7 }}>
                            We partner with ambitious companies that understand the value of a premium digital presence.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
                            {["Local Businesses", "Contractors & Trades", "Professional Firms", "E-Commerce Brands", "Scaling Startups", "B2B Services"].map((label) => (
                                <div key={label} className="wd-pill" style={{ padding: "10px 22px", background: "rgba(255,255,255,0.60)", border: "1px solid rgba(26,21,20,0.12)", borderRadius: "999px", color: DARK_TEXT, fontWeight: 500, fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "default" }}>
                                    <CheckCircle2 size={15} color={ORANGE} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 5: Why Creative Cowboys ──────────────────── */}
                <section style={{ background: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(26,21,20,0.07)", borderBottom: "1px solid rgba(26,21,20,0.07)", padding: "96px 24px" }}>
                    <div style={{ maxWidth: "1060px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "64px", alignItems: "center" }}>
                        {/* Bento grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {[
                                { Icon: BarChart3, color: ORANGE, title: "Marketers First", desc: "We design with conversion psychology at the forefront.", offset: false },
                                { Icon: Search, color: PINK, title: "SEO Native", desc: "Built from the ground up to rank on Google.", offset: true },
                                { Icon: Target, color: PINK, title: "Ad Ready", desc: "Perfectly structured landing pages for your paid traffic.", offset: false },
                                { Icon: TrendingUp, color: ORANGE, title: "Revenue Focus", desc: "We measure success by your bottom line, not just traffic.", offset: true },
                            ].map(({ Icon, color, title, desc, offset }) => (
                                <div key={title} style={{ background: PEACH, padding: "24px", borderRadius: "16px", border: "1px solid rgba(26,21,20,0.08)", transform: offset ? "translateY(28px)" : "none", boxShadow: "0 4px 16px rgba(26,21,20,0.06)" }}>
                                    <Icon size={28} color={color} style={{ marginBottom: "14px", display: "block" }} />
                                    <p style={{ fontWeight: 700, color: DARK_TEXT, fontSize: "14px", margin: "0 0 6px" }}>{title}</p>
                                    <p style={{ fontSize: "12px", color: "rgba(26,21,20,0.48)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Copy */}
                        <div>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 20px" }}>
                                Why Creative Cowboys?
                            </h2>
                            <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(26,21,20,0.55)", marginBottom: "18px" }}>
                                Most web designers are artists. We are marketers. We don&rsquo;t just want your website to look good—we want it to make you money.
                            </p>
                            <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(26,21,20,0.55)", marginBottom: "32px" }}>
                                We combine deep conversion psychology, technical SEO expertise, and seamless ad integration to build a digital machine that works for your business 24/7.
                            </p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                {[
                                    "Conversion-focused design psychology",
                                    "Technical SEO architecture built-in",
                                    "Seamless integration with your ad campaigns",
                                    "Advanced tracking and analytics setup",
                                ].map((item) => (
                                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", color: DARK_TEXT, fontWeight: 500, fontSize: "15px" }}>
                                        <CheckCircle2 size={18} color={ORANGE} style={{ flexShrink: 0 }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 6: Investment Framing ─────────────────────── */}
                <section style={{ padding: "96px 24px", background: PEACH }}>
                    <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
                        <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK_TEXT, margin: "0 0 48px" }}>
                            A Website Is an Investment —{" "}
                            <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                Not an Expense.
                            </span>
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", textAlign: "left" }}>
                            {/* Bad side */}
                            <div style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(26,21,20,0.10)", borderRadius: "18px", padding: "32px" }}>
                                <h3 style={{ fontSize: "17px", fontWeight: 700, color: DARK_TEXT, margin: "0 0 20px" }}>The Cost of a Bad Website</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {["High bounce rates wasting ad spend", "Lost trust from potential clients", "Invisible to search engines", "Competitors stealing your market share"].map((t) => (
                                        <li key={t} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "rgba(26,21,20,0.55)" }}>
                                            <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✕</span>{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Good side */}
                            <div style={{ background: `linear-gradient(135deg, rgba(241,95,42,0.10) 0%, rgba(234,81,255,0.08) 100%)`, border: "1px solid rgba(241,95,42,0.25)", borderRadius: "18px", padding: "32px" }}>
                                <h3 style={{ fontSize: "17px", fontWeight: 700, color: DARK_TEXT, margin: "0 0 20px" }}>The ROI of a Great Website</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {["Higher conversion rates on all traffic", "Lower customer acquisition costs", "Organic leads through better SEO", "Instant authority and brand trust"].map((t) => (
                                        <li key={t} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "rgba(26,21,20,0.65)" }}>
                                            <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ─────────────────────────────────────────── */}
                <section style={{ background: `linear-gradient(180deg, ${PEACH2} 0%, ${PEACH} 100%)`, borderTop: "1px solid rgba(26,21,20,0.07)", padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "280px", background: "rgba(241,95,42,0.14)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.035em", color: DARK_TEXT, lineHeight: 1.06, margin: "0 0 24px" }}>
                            Let&rsquo;s Build Something That{" "}
                            <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                Actually Converts.
                            </span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(26,21,20,0.55)", marginBottom: "48px", lineHeight: 1.7 }}>
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
                                style={{ padding: "16px 36px", color: DARK_TEXT, fontWeight: 600, fontSize: "16px", borderRadius: "10px", border: `1px solid rgba(26,21,20,0.18)`, background: "rgba(255,255,255,0.55)", cursor: "pointer" }}
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
