"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Star, CheckCircle2 } from "lucide-react";
import type { IndustryContent } from "./content";

const DARK = "#0D0D0F";
const CARD = "#15181e";

/* ── Reusable sub-components ────────────────────────────────── */

function FaqItem({
  q,
  a,
  accent,
}: {
  q: string;
  a: string;
  accent: string;
}) {
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
        <span
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.4,
          }}
        >
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
      <div
        style={{
          maxHeight: open ? "600px" : "0px",
          overflow: "hidden",
          transition: "max-height 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
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
      </div>
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

function LeadForm({
  content,
  id,
  titleOverride,
  subtitleOverride,
}: {
  content: IndustryContent;
  id: string;
  titleOverride?: string;
  subtitleOverride?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          industry: content.formHiddenIndustry,
          source: `AI Landing — ${content.formHiddenIndustry}`,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 250ms ease, background 250ms ease",
    boxSizing: "border-box",
  };

  if (status === "success") {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${content.accent}40`,
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          {content.successEmoji}
        </div>
        <h3
          style={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: 800,
            margin: "0 0 12px",
          }}
        >
          {content.successTitle}
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: "15px",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {content.successMessage}
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,60,60,0.30)",
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: 800,
            margin: "0 0 12px",
          }}
        >
          Something went wrong
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: "15px",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          Please try again or call us directly at (470) 243-7517
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{
            padding: "12px 28px",
            background: content.accent,
            border: "none",
            borderRadius: "10px",
            color: content.accent === "#C9A84C" ? "#09090C" : "#fff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "36px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 4px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {titleOverride || content.formTitle}
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 8px",
          lineHeight: 1.5,
        }}
      >
        {subtitleOverride || content.formSubtitle}
      </p>

      <input type="hidden" name="industry" value={content.formHiddenIndustry} />

      <input
        name="name"
        type="text"
        required
        placeholder={content.formPlaceholders.name}
        value={form.name}
        onChange={handleChange}
        className="landing-input"
        style={inputStyle}
      />
      <input
        name="business"
        type="text"
        required
        placeholder={content.formPlaceholders.business}
        value={form.business}
        onChange={handleChange}
        className="landing-input"
        style={inputStyle}
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder={content.formPlaceholders.phone}
        value={form.phone}
        onChange={handleChange}
        className="landing-input"
        style={inputStyle}
      />
      <input
        name="email"
        type="email"
        required
        placeholder={content.formPlaceholders.email}
        value={form.email}
        onChange={handleChange}
        className="landing-input"
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="landing-submit"
        style={{
          padding: "16px 24px",
          background: content.accent,
          color: content.accent === "#C9A84C" ? "#09090C" : "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          transition:
            "background 180ms ease, transform 180ms ease, box-shadow 180ms ease",
          letterSpacing: "0.01em",
        }}
      >
        {status === "loading" ? "Sending..." : content.formButton}
      </button>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          margin: 0,
        }}
      >
        {content.formNote}
      </p>
    </form>
  );
}

/* ── Chat Mockup ─────────────────────────────────────────── */

function ChatMockup({ content }: { content: IndustryContent }) {
  return (
    <div
      style={{
        background: CARD,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "24px" }}>{content.chatHeader.icon}</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}
          >
            {content.chatHeader.name}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.40)",
              margin: "2px 0 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            {content.chatHeader.status}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {content.chatMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "customer" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius:
                  msg.role === "customer"
                    ? "4px 18px 18px 18px"
                    : "18px 4px 18px 18px",
                background:
                  msg.role === "customer"
                    ? "rgba(255,255,255,0.06)"
                    : `${content.accent}22`,
                border:
                  msg.role === "customer"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : `1px solid ${content.accent}35`,
                fontSize: "13px",
                lineHeight: 1.6,
                color:
                  msg.role === "customer"
                    ? "rgba(255,255,255,0.75)"
                    : content.accent,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.30)",
            margin: 0,
          }}
        >
          {content.chatFooter}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function AILandingPageClient({
  content,
}: {
  content: IndustryContent;
}) {
  const accent = content.accent;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-fu-1 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .lp-fu-2 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .lp-fu-3 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        .lp-fu-4 { animation: fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.42s both; }
        @media (prefers-reduced-motion: reduce) {
          .lp-fu-1,.lp-fu-2,.lp-fu-3,.lp-fu-4 { animation: none; }
        }
        .landing-input:focus {
          border-color: ${accent}99 !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .landing-input::placeholder { color: rgba(255,255,255,0.20); }
        .landing-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px ${accent}55;
          filter: brightness(1.1);
        }
        .landing-submit:active:not(:disabled) { transform: translateY(0); }
        .landing-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hiw-split { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: start; }
        .testimonial-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .cta-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }

        @media (max-width: 900px) {
          .hero-split { grid-template-columns: 1fr !important; gap: 48px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .hiw-split { grid-template-columns: 1fr !important; gap: 40px !important; }
          .testimonial-3col { grid-template-columns: 1fr !important; }
          .cta-split { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 600px) {
          .pain-grid { grid-template-columns: 1fr !important; }
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
        {/* ═══════ 1. STICKY HEADER ═══════ */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: `${DARK}ee`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "64px",
            }}
          >
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image
                src="/Main%20logo%202.png"
                alt="Creative Cowboys Media"
                width={140}
                height={37}
                priority
                style={{ width: "140px", height: "auto" }}
              />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <Link
                href="https://creativecowboys.co/contact"
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 200ms ease",
                }}
                className="header-link"
              >
                Talk to Our Team
              </Link>
              <a
                href="#get-started"
                style={{
                  padding: "10px 22px",
                  background: accent,
                  color: accent === "#C9A84C" ? "#09090C" : "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "background 180ms ease, transform 180ms ease",
                }}
              >
                {accent === "#C9A84C" ? "Schedule a Demo" : "Claim Free Website"}
              </a>
            </div>
          </div>
        </header>

        {/* ═══════ 2. HERO SECTION ═══════ */}
        <section
          style={{
            padding: "80px 24px 100px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background hero image */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
            }}
          >
            <Image
              src={content.heroImage}
              alt=""
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
              quality={80}
            />
            {/* Dark overlay for readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${DARK}f0 0%, ${DARK}e8 40%, ${DARK}d0 100%)`,
              }}
            />
          </div>

          {/* Accent glow on top of image */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "800px",
              height: "400px",
              background: `radial-gradient(ellipse, ${accent}20 0%, transparent 70%)`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div className="hero-split" style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
            {/* Left: Headline + Form */}
            <div>
              <p
                className="lp-fu-1"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "20px",
                }}
              >
                {content.eyebrow}
              </p>
              <h1
                className="lp-fu-2"
                style={{
                  fontSize: "clamp(36px, 5.5vw, 66px)",
                  fontWeight: 900,
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                  margin: "0 0 24px",
                  textTransform: "uppercase",
                }}
              >
                {content.headlineParts.map((part, i) =>
                  part.accent ? (
                    <span key={i} style={{ color: accent }}>
                      {part.text}
                    </span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </h1>
              <p
                className="lp-fu-3"
                style={{
                  fontSize: "clamp(15px, 1.8vw, 18px)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.48)",
                  marginBottom: "32px",
                  maxWidth: "520px",
                }}
              >
                {content.subheadline}
              </p>

              {/* Proof Stats */}
              <div
                className="lp-fu-4"
                style={{
                  display: "flex",
                  gap: "32px",
                  marginBottom: "40px",
                  flexWrap: "wrap",
                }}
              >
                {content.stats.map((stat) => (
                  <div key={stat.label}>
                    <p
                      style={{
                        fontSize: "28px",
                        fontWeight: 900,
                        color: accent,
                        margin: "0 0 4px",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {stat.number}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.40)",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hero Form */}
              <LeadForm content={content} id="get-started" />
            </div>

            {/* Right: Chat Mockup */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div>
                <ChatMockup content={content} />
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    color: accent,
                    marginTop: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  {content.chatCaption}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 3. OFFER BANNER ═══════ */}
        <section
          style={{
            background: accent,
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: accent === "#C9A84C" ? "#09090C" : "#fff",
                margin: 0,
              }}
            >
              {content.offerBanner}
            </p>
            <span
              style={{
                padding: "4px 14px",
                background: accent === "#C9A84C" ? "rgba(9,9,12,0.15)" : "rgba(255,255,255,0.20)",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                color: accent === "#C9A84C" ? "#09090C" : "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {content.offerTag}
            </span>
          </div>
        </section>

        {/* ═══════ 4. PAIN POINTS ═══════ */}
        <section style={{ padding: "100px 24px", background: CARD, position: "relative", overflow: "hidden" }}>
          {/* Subtle background image */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "100%",
              zIndex: 0,
            }}
          >
            <Image
              src={content.heroImage}
              alt=""
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              quality={60}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(90deg, ${CARD} 0%, ${CARD}f5 30%, ${CARD}c0 70%, ${CARD}e0 100%)`,
              }}
            />
          </div>
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "14px",
                }}
              >
                THE PROBLEM
              </p>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: "0 0 16px",
                  lineHeight: 1.15,
                }}
              >
                {content.painHeadline}
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "rgba(255,255,255,0.45)",
                  maxWidth: "640px",
                  marginInline: "auto",
                  lineHeight: 1.75,
                }}
              >
                {content.painSubhead}
              </p>
            </div>

            <div className="pain-grid">
              {content.painPoints.map((point) => (
                <div
                  key={point.title}
                  style={{
                    background: DARK,
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px",
                    padding: "36px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    transition: "transform 240ms ease, box-shadow 240ms ease",
                  }}
                  className="pain-card"
                >
                  <span style={{ fontSize: "32px" }}>{point.icon}</span>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {point.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: "rgba(255,255,255,0.45)",
                      margin: 0,
                    }}
                  >
                    {point.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "auto",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <CheckCircle2 size={14} color={accent} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: accent,
                      }}
                    >
                      {point.solution}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 5. HOW IT WORKS ═══════ */}
        <section style={{ padding: "100px 24px", background: DARK }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "14px",
                }}
              >
                HOW IT WORKS
              </p>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                {content.howItWorksHeadline}
              </h2>
            </div>

            <div className="hiw-split">
              {/* Left: Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {content.steps.map((step) => (
                  <div
                    key={step.num}
                    style={{
                      background: CARD,
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: "28px 32px",
                      display: "flex",
                      gap: "20px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: `${accent}18`,
                        border: `1px solid ${accent}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: accent,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#fff",
                          margin: "0 0 8px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.75,
                          color: "rgba(255,255,255,0.45)",
                          margin: 0,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Offer Box */}
              <div
                style={{
                  background: CARD,
                  borderRadius: "24px",
                  border: `1px solid ${accent}30`,
                  padding: "36px",
                  position: "sticky",
                  top: "88px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: "8px",
                  }}
                >
                  WHAT YOU GET
                </p>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 28px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {content.offerBoxTitle}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {content.offerItems.map((item) => (
                    <div
                      key={item.item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <CheckCircle2
                        size={18}
                        color={accent}
                        style={{ flexShrink: 0, marginTop: "2px" }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#fff",
                            margin: "0 0 4px",
                          }}
                        >
                          {item.item}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            lineHeight: 1.6,
                            color: "rgba(255,255,255,0.40)",
                            margin: "0 0 2px",
                          }}
                        >
                          {item.description}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "28px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    YOUR INVESTMENT
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {content.offerPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 6. TESTIMONIALS ═══════ */}
        <section style={{ padding: "100px 24px", background: CARD }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "14px",
                }}
              >
                REAL RESULTS
              </p>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                {content.testimonialsHeadline}
              </h2>
            </div>

            <div className="testimonial-3col">
              {content.testimonials.map((t) => (
                <div
                  key={t.name}
                  style={{
                    background: DARK,
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px",
                    padding: "32px",
                  }}
                >
                  <Stars />
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.8,
                      color: "rgba(255,255,255,0.62)",
                      margin: "0 0 24px",
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#fff",
                        margin: "0 0 4px",
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.35)",
                        margin: 0,
                      }}
                    >
                      {t.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 7. FAQ ACCORDION ═══════ */}
        <section style={{ padding: "100px 24px", background: DARK }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "14px",
                }}
              >
                QUESTIONS
              </p>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                COMMON QUESTIONS
              </h2>
            </div>

            {content.faqs.map((faq) => (
              <FaqItem
                key={faq.question}
                q={faq.question}
                a={faq.answer}
                accent={accent}
              />
            ))}
          </div>
        </section>

        {/* ═══════ 8. FINAL CTA ═══════ */}
        <section style={{ padding: "100px 24px", background: CARD }}>
          <div className="cta-split" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Left: Copy */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "16px",
                }}
              >
                {content.ctaLabel}
              </p>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: "0 0 20px",
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                }}
              >
                {content.ctaHeadline.split(content.ctaAccentWord).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span style={{ color: accent }}>{content.ctaAccentWord}</span>
                    )}
                  </span>
                ))}
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.48)",
                  marginBottom: "20px",
                  maxWidth: "480px",
                }}
              >
                {content.ctaBody}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.35)",
                  margin: 0,
                }}
              >
                {content.ctaNote}
              </p>
            </div>

            {/* Right: Form */}
            <LeadForm
              content={content}
              id="cta-form"
              titleOverride={content.ctaFormTitle}
              subtitleOverride={content.ctaFormSubtitle}
            />
          </div>
        </section>

        {/* ═══════ 9. FOOTER ═══════ */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 24px",
            background: DARK,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <Link href="/" style={{ display: "inline-flex" }}>
              <Image
                src="/Main%20logo%202.png"
                alt="Creative Cowboys Media"
                width={120}
                height={32}
                style={{ width: "120px", height: "auto" }}
              />
            </Link>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.30)",
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} Creative Cowboys Media · West
              Georgia&apos;s AI Marketing Agency
            </p>
            <Link
              href="https://creativecowboys.co"
              style={{
                fontSize: "13px",
                color: accent,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              creativecowboys.co
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
