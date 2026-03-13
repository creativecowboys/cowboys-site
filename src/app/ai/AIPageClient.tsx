"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    MessageSquareText,
    Phone,
    Wrench,
    Star,
    ChevronDown,
    CheckCircle2,
} from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";
import AnimatedChatDemo from "./AnimatedChatDemo";

const ORANGE = "#F15F2A";
const TEAL = "#56CCF2";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const faqs = [
    {
        q: "Does it sound robotic?",
        a: "Not at all — and that's the part most people are surprised by. Your AI is trained to sound like your business: friendly, knowledgeable, and natural. We write all the responses in plain, conversational language that matches your tone. Most people who chat or talk with it don't even realize it's automated until they're already booking an appointment.",
    },
    {
        q: "How long does setup take?",
        a: "Most of our clients are live within 5 business days. Our onboarding call takes about 30 minutes. After that, we do the build and send it to you for review. You give us feedback, we make tweaks, and we launch it. Simple as that.",
    },
    {
        q: "What if I already have a receptionist?",
        a: "Your receptionist becomes more effective, not replaced. Your AI handles the after-hours calls, the repetitive FAQ questions, and the initial lead capture — freeing up your real staff to focus on higher-value work during business hours. Think of it as adding a night-shift team member who never calls in sick.",
    },
    {
        q: "Does it work for my industry?",
        a: "If your business depends on answering questions and booking appointments, yes. We've built AI assistants for law offices, roofing companies, medical practices, insurance agencies, restaurants, event venues, churches, and schools. If you're not sure if it's a fit, book the free demo and we'll tell you honestly.",
    },
    {
        q: "What does it cost?",
        a: "We keep our pricing straightforward and small-business friendly. There are no setup fees, no contracts, and no surprises. Exact pricing is discussed after the demo once we understand what you need. What we can tell you: it costs a fraction of hiring even a part-time receptionist.",
    },
    {
        q: "Can I cancel?",
        a: "Yes. We don't do long-term contracts. If it's not working for you, you can cancel anytime. We'd rather earn your business month after month because the results speak for themselves — not because you're locked in.",
    },
    {
        q: "How does it handle complex questions it doesn't know the answer to?",
        a: "Smart question. When someone asks something outside your AI's knowledge base, it doesn't guess — it collects the person's contact info and flags it for your team to follow up personally. You always stay in control of the nuanced conversations. Your AI handles the volume; you handle the exceptions.",
    },
    {
        q: "Is it really customized to my business, or is it a generic template?",
        a: "It's built for your business specifically. During onboarding, we learn your services, your FAQs, your hours, your booking process, and how you like to talk to customers. Every response is written from scratch based on what you tell us. It's your AI — we just build and manage it for you.",
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "22px 0",
                    gap: "16px",
                }}
            >
                <span style={{ fontSize: "17px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    {q}
                </span>
                <ChevronDown
                    size={20}
                    color="rgba(255,255,255,0.40)"
                    style={{
                        flexShrink: 0,
                        transition: "transform 240ms ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                />
            </button>
            {open && (
                <p
                    style={{
                        fontSize: "15px",
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.50)",
                        margin: "0 0 22px",
                        paddingRight: "32px",
                    }}
                >
                    {a}
                </p>
            )}
        </div>
    );
}

function Stars() {
    return (
        <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} color="#F7B731" fill="#F7B731" />
            ))}
        </div>
    );
}

export default function AIPageClient() {
    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.90; }
        }
        .fu-1 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        .fu-4 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.42s both; }
        @media (prefers-reduced-motion: reduce) {
          .fu-1,.fu-2,.fu-3,.fu-4 { animation: none; }
        }
        .cta-primary {
          background: ${ORANGE};
          transition: background 180ms ease, transform 180ms ease;
        }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
        .cta-ghost { transition: background 180ms ease; }
        .cta-ghost:hover { background: rgba(255,255,255,0.09); }
        .feature-card { transition: transform 240ms ease, box-shadow 240ms ease; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 24px 64px rgba(0,0,0,0.45); }
        .trust-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        @media (max-width: 900px) { .trust-bar { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .trust-bar { grid-template-columns: 1fr; } }
        .industry-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 16px;
        }
        @media (max-width: 600px) { .industry-grid { grid-template-columns: 1fr; } }
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 24px;
        }
        @media (max-width: 700px) { .testimonial-grid { grid-template-columns: 1fr; } }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
        }
        @media (max-width: 900px) { .feature-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 580px) { .feature-grid { grid-template-columns: 1fr; } }
        .steps-row {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 32px;
          position: relative;
        }
        @media (max-width: 760px) {
          .steps-row { grid-template-columns: 1fr; gap: 24px; }
          .steps-connector { display: none !important; }
        }
        .offer-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
      `}</style>

            <div
                style={{
                    background: DARK,
                    minHeight: "100vh",
                    color: "#d1d5db",
                    fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image
                        src="/Main%20logo%202.png"
                        alt="Creative Cowboys Media"
                        width={160}
                        height={42}
                        priority
                        style={{ width: "160px", height: "auto" }}
                    />
                </Link>

                {/* ── HERO ── */}
                <section
                    style={{
                        maxWidth: "920px",
                        margin: "0 auto",
                        padding: "160px 24px 100px",
                        textAlign: "center",
                        position: "relative",
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: "50px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "720px",
                            height: "340px",
                            background: `radial-gradient(ellipse, rgba(86,204,242,0.13) 0%, rgba(241,95,42,0.07) 50%, transparent 70%)`,
                            pointerEvents: "none",
                            animation: "pulse-glow 4s ease-in-out infinite",
                        }}
                    />
                    <p
                        className="fu-1"
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: TEAL,
                            marginBottom: "20px",
                        }}
                    >
                        AI Chat &amp; Voice — Creative Cowboys
                    </p>
                    <h1
                        className="fu-2"
                        style={{
                            fontSize: "clamp(34px, 5.5vw, 66px)",
                            fontWeight: 900,
                            lineHeight: 1.04,
                            letterSpacing: "-0.035em",
                            color: "#ffffff",
                            margin: "0 0 28px",
                        }}
                    >
                        Your Business{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, ${TEAL} 0%, ${ORANGE} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Never Closes.
                        </span>
                    </h1>
                    <p
                        className="fu-3"
                        style={{
                            fontSize: "clamp(16px, 2vw, 20px)",
                            lineHeight: 1.7,
                            color: "rgba(255,255,255,0.48)",
                            marginBottom: "16px",
                            maxWidth: "660px",
                            marginInline: "auto",
                        }}
                    >
                        Your AI is always on — answering questions, booking appointments, and
                        capturing leads 24/7 while you focus on the work that pays.
                    </p>
                    <p
                        className="fu-3"
                        style={{
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.30)",
                            marginBottom: "44px",
                        }}
                    >
                        Creative Cowboys builds custom AI Chat &amp; Voice assistants for small
                        businesses across West Georgia and the Atlanta metro.
                    </p>
                    <div
                        className="fu-4"
                        style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}
                    >
                        <Link
                            href="/ai/demo"
                            className="cta-primary"
                            style={{
                                padding: "15px 34px",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "15px",
                                borderRadius: "10px",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            Book Your Free 15-Minute Demo <ArrowRight size={17} />
                        </Link>
                    </div>
                    <p
                        className="fu-4"
                        style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "16px" }}
                    >
                        No contracts. No tech headaches. Setup in under a week.
                    </p>
                </section>

                {/* ── SOCIAL PROOF BAR ── */}
                <section
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: CARD,
                    }}
                >
                    <div className="trust-bar" style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        {[
                            { icon: "✅", text: "Trusted by 20+ West Georgia businesses" },
                            { icon: "⚡", text: "Setup complete in 5 business days or less" },
                            { icon: "📞", text: "Handles hundreds of calls & chats — without hiring anyone" },
                            { icon: "🤝", text: "Built and managed by a local West Georgia team" },
                        ].map(({ icon, text }) => (
                            <div
                                key={text}
                                style={{
                                    padding: "24px 28px",
                                    borderRight: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <span style={{ fontSize: "22px", flexShrink: 0 }}>{icon}</span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.60)", lineHeight: 1.45 }}>
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── PROBLEM ── */}
                <section style={{ padding: "100px 24px", background: DARK }}>
                    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                        <h2
                            style={{
                                fontSize: "clamp(26px, 4vw, 44px)",
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                color: "#fff",
                                margin: "0 0 28px",
                                lineHeight: 1.15,
                            }}
                        >
                            You&rsquo;re losing leads while you sleep.{" "}
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>(And probably while you eat lunch, too.)</span>
                        </h2>
                        <p style={{ fontSize: "17px", lineHeight: 1.85, color: "rgba(255,255,255,0.48)", marginBottom: "18px" }}>
                            Here&rsquo;s the thing nobody talks about: most small businesses don&rsquo;t lose leads because their product is bad or their price is wrong. They lose leads because nobody answered.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.85, color: "rgba(255,255,255,0.48)", marginBottom: "18px" }}>
                            A potential customer called at 7pm on a Tuesday. You were finishing up a job. Your receptionist had already gone home. That call went to voicemail — and by 9am the next morning, they&rsquo;d already hired your competitor. That&rsquo;s not a sales problem. That&rsquo;s a coverage problem.
                        </p>
                        <p style={{ fontSize: "17px", lineHeight: 1.85, color: "rgba(255,255,255,0.48)", marginBottom: "36px" }}>
                            The good news? There&rsquo;s a smarter way to stay in front of every lead — without hiring another employee or being glued to your phone.
                        </p>
                        <div
                            style={{
                                background: CARD,
                                borderRadius: "20px",
                                border: "1px solid rgba(255,255,255,0.07)",
                                padding: "32px 36px",
                            }}
                        >
                            {[
                                { e: "📵", t: "Calls going to voicemail after hours (and not getting called back in time)" },
                                { e: "💬", t: "Website chat bubbles that nobody's manning — leads slipping through" },
                                { e: "📋", t: "Spending time answering the same 10 questions over and over" },
                                { e: "🗓️", t: "Appointment no-shows because follow-up never happened" },
                                { e: "😤", t: "Competitors getting the job because they responded first" },
                                { e: "🔄", t: "Paying a receptionist to do tasks AI could handle in seconds" },
                            ].map(({ e, t }) => (
                                <div
                                    key={t}
                                    style={{
                                        display: "flex",
                                        gap: "14px",
                                        alignItems: "flex-start",
                                        padding: "12px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1.5 }}>{e}</span>
                                    <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>{t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SOLUTION / FEATURES ── */}
                <section
                    style={{
                        background: CARD,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        padding: "100px 24px",
                    }}
                >
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL, marginBottom: "14px" }}>
                                The Solution
                            </p>
                            <h2
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    color: "#fff",
                                    margin: "0 0 20px",
                                }}
                            >
                                Meet your new always-on team member.
                            </h2>
                            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", maxWidth: "640px", marginInline: "auto", lineHeight: 1.75 }}>
                                Creative Cowboys builds AI Chat and Voice assistants that are custom-built for your business — trained on your services, your FAQs, your tone — and powered by the same platform trusted by agencies nationwide.
                            </p>
                        </div>
                        <div className="feature-grid">
                            {[
                                {
                                    icon: MessageSquareText,
                                    color: TEAL,
                                    title: "AI Chat Widget",
                                    desc: "A smart chat window lives on your website, ready to greet every visitor the moment they land. It answers questions, collects contact info, and can even book appointments directly into your calendar — all without you lifting a finger. Visitors get a response in seconds. You get a qualified lead in your inbox.",
                                },
                                {
                                    icon: Phone,
                                    color: ORANGE,
                                    title: "AI Voice Assistant",
                                    desc: "When someone calls your business after hours — or when you're just too busy to answer — your AI Voice Assistant picks up. It sounds natural, handles common questions, and can schedule callbacks or appointments on the spot. No more voicemail. No more missed opportunities. Your phone is answered, every time.",
                                },
                                {
                                    icon: Wrench,
                                    color: "#EA51FF",
                                    title: "Fully Customized Setup",
                                    desc: "We don't hand you a template and wish you luck. Our team learns your business — your services, your hours, your most common questions — and builds your AI from scratch. Every response is written in your voice, for your customers. You review it, we refine it, and we handle the launch.",
                                },
                            ].map(({ icon: Icon, color, title, desc }) => (
                                <div
                                    key={title}
                                    className="feature-card"
                                    style={{
                                        background: DARK,
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: "20px",
                                        padding: "36px",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            top: "-30px",
                                            right: "-30px",
                                            width: "140px",
                                            height: "140px",
                                            background: `${color}18`,
                                            filter: "blur(40px)",
                                            borderRadius: "50%",
                                            pointerEvents: "none",
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: "52px",
                                            height: "52px",
                                            borderRadius: "14px",
                                            background: `${color}18`,
                                            border: `1px solid ${color}40`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <Icon size={24} color={color} />
                                    </div>
                                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                                        {title}
                                    </h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section style={{ padding: "100px 24px", background: DARK }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "72px" }}>
                            <h2
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    color: "#fff",
                                    margin: "0 0 16px",
                                }}
                            >
                                From sign-up to always-on in less than a week.
                            </h2>
                            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.38)", maxWidth: "480px", marginInline: "auto", lineHeight: 1.7 }}>
                                Three simple steps. No homework. No technical setup on your end.
                            </p>
                        </div>
                        <div className="steps-row">
                            <div
                                className="steps-connector"
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: "42px",
                                    left: "calc(16.66% + 24px)",
                                    right: "calc(16.66% + 24px)",
                                    height: "1px",
                                    background: `linear-gradient(90deg, ${TEAL}60 0%, ${ORANGE}60 100%)`,
                                    pointerEvents: "none",
                                    zIndex: 0,
                                }}
                            />
                            {[
                                {
                                    num: "01",
                                    title: "We Learn Your Business",
                                    color: TEAL,
                                    desc: "We start with a simple onboarding call — usually 30 minutes. You tell us about your services, your most common customer questions, your hours, and how you like to communicate. We take notes so your AI sounds like you, not like a generic bot. No homework, no technical setup on your end.",
                                },
                                {
                                    num: "02",
                                    title: "We Build Your AI",
                                    color: ORANGE,
                                    desc: "Our team gets to work configuring your AI Chat Widget and/or Voice Assistant. We write all the responses, train the system on your business specifics, and connect it to your calendar or booking system. Before anything goes live, you review it and approve it. We make edits until it's exactly right.",
                                },
                                {
                                    num: "03",
                                    title: "You Never Miss a Lead",
                                    color: "#EA51FF",
                                    desc: "Once your AI is live, it's working for you 24/7 — no weekends off, no sick days, no overtime pay. Every chat, every call, every inquiry gets handled. Leads land in your pipeline automatically. You get notified when something needs your personal attention. The rest? Handled.",
                                },
                            ].map(({ num, title, color, desc }) => (
                                <div
                                    key={num}
                                    style={{
                                        background: CARD,
                                        borderRadius: "20px",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        padding: "36px 32px",
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            borderRadius: "50%",
                                            background: `${color}18`,
                                            border: `2px solid ${color}50`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "24px",
                                        }}
                                    >
                                        <span style={{ fontSize: "14px", fontWeight: 800, color: color, letterSpacing: "0.05em" }}>
                                            {num}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                                        {title}
                                    </h3>
                                    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ANIMATED CHAT DEMO ── */}
                <section
                    style={{
                        background: DARK,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        padding: "100px 24px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "1100px",
                            margin: "0 auto",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "80px",
                            alignItems: "center",
                        }}
                        className="chat-demo-grid"
                    >
                        {/* Left: copy */}
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL, marginBottom: "16px" }}>
                                See It In Action
                            </p>
                            <h2
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    color: "#fff",
                                    margin: "0 0 20px",
                                    lineHeight: 1.1,
                                }}
                            >
                                This is what your customers experience — at 2am on a Sunday.
                            </h2>
                            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.48)", marginBottom: "16px" }}>
                                Watch a real AI chat play out between a homeowner and Peak Plumbing&rsquo;s AI assistant. It answers the question, qualifies the lead, and books the appointment — without a single human involved.
                            </p>
                            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.48)", marginBottom: "32px" }}>
                                Your business gets one just like this — trained on your services, written in your voice, live in under a week.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[
                                    { e: "⚡", t: "Responds in seconds — day or night" },
                                    { e: "📅", t: "Books appointments directly into your calendar" },
                                    { e: "🎯", t: "Qualifies leads before they ever reach you" },
                                    { e: "🤝", t: "Sounds like your business, not a generic bot" },
                                ].map(({ e, t }) => (
                                    <div key={t} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        <span style={{ fontSize: "20px", flexShrink: 0 }}>{e}</span>
                                        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: animated chat */}
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <AnimatedChatDemo />
                        </div>
                    </div>
                    <style>{`
                        @media (max-width: 860px) {
                            .chat-demo-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                        }
                    `}</style>
                </section>

                {/* ── WHO IT'S FOR ── */}
                <section
                    style={{
                        background: CARD,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        padding: "100px 24px",
                    }}
                >
                    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "56px" }}>
                            <h2
                                style={{
                                    fontSize: "clamp(26px, 4vw, 44px)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    color: "#fff",
                                    margin: "0 0 16px",
                                    lineHeight: 1.2,
                                }}
                            >
                                If your phone rings and your business has hours, this is for you.
                            </h2>
                            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.42)", maxWidth: "560px", marginInline: "auto", lineHeight: 1.7 }}>
                                We work with small and mid-size businesses across West Georgia and the Atlanta metro. If you rely on leads, appointments, or customer inquiries to keep the doors open — AI can help you capture more of them.
                            </p>
                        </div>
                        <div className="industry-grid">
                            {[
                                { e: "🏛️", name: "Law Offices", desc: "Never miss a prospective client call — even outside office hours. Your AI gathers intake info and schedules consultations automatically." },
                                { e: "🔨", name: "Roofing & Contractors", desc: "Be the first to respond to every estimate request. Your AI collects job details and books site visits while you're still on the last job." },
                                { e: "🏥", name: "Medical & Dental Practices", desc: "Handle appointment requests, insurance questions, and after-hours inquiries without adding to your front desk's workload." },
                                { e: "🛡️", name: "Insurance Agencies", desc: "Qualify leads, answer policy questions, and schedule reviews — all before you've had your morning coffee." },
                                { e: "🍽️", name: "Restaurants & Catering", desc: "Answer questions about menus, hours, and availability. Capture catering inquiries and private event leads around the clock." },
                                { e: "🎉", name: "Event Venues", desc: "Keep your booking pipeline moving 24/7. Your AI handles availability questions, pricing inquiries, and tour scheduling — even on weekends." },
                                { e: "⛪", name: "Churches & Schools", desc: "Welcome new families, answer program questions, and route inquiries to the right staff member — with warmth and professionalism." },
                            ].map(({ e, name, desc }) => (
                                <div
                                    key={name}
                                    style={{
                                        background: DARK,
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: "16px",
                                        padding: "24px",
                                        display: "flex",
                                        gap: "16px",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <span style={{ fontSize: "28px", flexShrink: 0, lineHeight: 1.3 }}>{e}</span>
                                    <div>
                                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{name}</p>
                                        <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0 }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section style={{ padding: "100px 24px", background: DARK }}>
                    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "56px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "14px" }}>
                                What Our Clients Say
                            </p>
                            <h2
                                style={{
                                    fontSize: "clamp(26px, 4vw, 44px)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    color: "#fff",
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}
                            >
                                West Georgia businesses are already picking up the phone — without picking up the phone.
                            </h2>
                        </div>
                        <div className="testimonial-grid">
                            {[
                                {
                                    quote: "Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.",
                                    name: "Rob Goldin",
                                    detail: "Creative Cowboys Client",
                                },
                                {
                                    quote: "Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to any questions or concerns we had. Professionalism and performance is what you will get with Creative Cowboys!",
                                    name: "Ryan Coffey",
                                    detail: "Creative Cowboys Client",
                                },
                                {
                                    quote: "These guys are incredible. I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and effort into my personal project.",
                                    name: "Daniel Hooper",
                                    detail: "Creative Cowboys Client",
                                },
                                {
                                    quote: "Creative Cowboys is a great company to work with. They serve and work at the highest possible level and produce excellent quality. Our media has gone to another level while working with them. Best in the game!",
                                    name: "Victor James",
                                    detail: "Creative Cowboys Client",
                                },
                            ].map(({ quote, name, detail }) => (
                                <div
                                    key={name}
                                    style={{
                                        background: CARD,
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: "20px",
                                        padding: "32px",
                                    }}
                                >
                                    <Stars />
                                    <p style={{ fontSize: "15px", lineHeight: 1.8, color: "rgba(255,255,255,0.62)", margin: "0 0 24px", fontStyle: "italic" }}>
                                        &ldquo;{quote}&rdquo;
                                    </p>
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{name}</p>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: "center", marginTop: "48px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "3px" }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} color="#F7B731" fill="#F7B731" />
                                ))}
                            </div>
                            <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                                5.0 — 19 Google Reviews
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── OFFER / PRICING CTA ── */}
                <section
                    style={{
                        background: ORANGE,
                        padding: "100px 24px",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.10) 0%, transparent 60%)",
                            pointerEvents: "none",
                        }}
                    />
                    <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
                        <h2
                            style={{
                                fontSize: "clamp(28px, 4vw, 48px)",
                                fontWeight: 900,
                                letterSpacing: "-0.03em",
                                color: "#fff",
                                margin: "0 0 20px",
                                lineHeight: 1.1,
                            }}
                        >
                            Start with a free 15-minute demo. See it working on your business before you spend a dime.
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: "40px" }}>
                            We&rsquo;re not going to pitch you a complicated software package or lock you into a long-term contract. We&rsquo;re going to show you — live, in 15 minutes — what an AI assistant built for your business looks like.
                        </p>
                        <div style={{ textAlign: "left", display: "inline-block", marginBottom: "44px" }}>
                            {[
                                "A live walkthrough of AI Chat and Voice in action",
                                "A real example built around your industry",
                                "Honest answers to any questions you have",
                                "A custom recommendation for your business (if it's a fit)",
                                "Zero pressure. Zero commitment.",
                            ].map((item) => (
                                <div key={item} className="offer-list-item">
                                    <CheckCircle2 size={18} color="#fff" style={{ flexShrink: 0, marginTop: "2px" }} />
                                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.90)", fontWeight: 500 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <Link
                                href="/ai/demo"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "16px 40px",
                                    background: "#fff",
                                    color: ORANGE,
                                    fontWeight: 800,
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                }}
                            >
                                Book My Free Demo <ArrowRight size={17} />
                            </Link>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.60)", marginTop: "18px" }}>
                            No contracts. No setup fees. Simple monthly pricing that makes sense for small businesses.
                        </p>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section style={{ padding: "100px 24px", background: DARK }}>
                    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                        <h2
                            style={{
                                fontSize: "clamp(26px, 4vw, 44px)",
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                color: "#fff",
                                margin: "0 0 56px",
                                textAlign: "center",
                            }}
                        >
                            Got questions? We&rsquo;ve got straight answers.
                        </h2>
                        {faqs.map(({ q, a }) => (
                            <FaqItem key={q} q={q} a={a} />
                        ))}
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section
                    style={{
                        padding: "120px 24px",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                        background: CARD,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            bottom: "-60px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "700px",
                            height: "320px",
                            background: "rgba(241,95,42,0.14)",
                            filter: "blur(100px)",
                            borderRadius: "50%",
                            pointerEvents: "none",
                        }}
                    />
                    <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                        <h2
                            style={{
                                fontSize: "clamp(32px, 6vw, 62px)",
                                fontWeight: 900,
                                letterSpacing: "-0.035em",
                                color: "#fff",
                                lineHeight: 1.06,
                                margin: "0 0 24px",
                            }}
                        >
                            Every missed call is a lead your competitor is about to{" "}
                            <span
                                style={{
                                    background: `linear-gradient(135deg, ${TEAL} 0%, ${ORANGE} 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                answer.
                            </span>
                        </h2>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7, maxWidth: "620px", marginInline: "auto" }}>
                            Don&rsquo;t wait until busy season to fix a coverage problem. Book a free 15-minute demo today — we&rsquo;ll show you exactly what AI can do for your business and have you live in under a week if you&rsquo;re ready to move.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", marginBottom: "20px" }}>
                            <Link
                                href="/ai/demo"
                                className="cta-primary"
                                style={{
                                    padding: "16px 40px",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                Book My Free Demo — No Commitment <ArrowRight size={18} />
                            </Link>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)" }}>
                            No contracts. No tech headaches. Just more leads, more bookings, and one less thing to worry about.
                        </p>
                    </div>
                </section>

                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
