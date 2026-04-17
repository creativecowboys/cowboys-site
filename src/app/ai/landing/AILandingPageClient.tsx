"use client";

import { useState, useEffect, useRef } from "react";
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
          className="lp-faq-question"
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
          className="lp-faq-answer"
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
        className="lp-status-card"
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
        className="lp-status-card"
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
      className="lp-lead-form"
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

/* ── Chat Mockup (Animated Live Demo) ───────────────────── */

function ChatMockup({ content }: { content: IndustryContent }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [showTyping, setShowTyping] = useState(false);
  const [loopKey, setLoopKey] = useState(0);
  const total = content.chatMessages.length;

  useEffect(() => {
    setVisibleCount(1);
    setShowTyping(false);
    let cancelled = false;

    const showNext = (idx: number) => {
      if (cancelled || idx >= total) {
        // Pause 4s at the end then restart
        if (!cancelled && idx >= total) {
          setTimeout(() => {
            if (!cancelled) {
              setVisibleCount(1);
              setShowTyping(false);
              setLoopKey((k) => k + 1);
            }
          }, 4000);
        }
        return;
      }

      const msg = content.chatMessages[idx];
      const isAI = msg.role === "ai";

      if (isAI) {
        // Show typing indicator before AI message
        setShowTyping(true);
        setTimeout(() => {
          if (cancelled) return;
          setShowTyping(false);
          setVisibleCount(idx + 1);
          // Next message after a read pause
          setTimeout(() => showNext(idx + 1), 1200);
        }, 1500);
      } else {
        // Customer message appears after a shorter pause
        setVisibleCount(idx + 1);
        setTimeout(() => showNext(idx + 1), 1400);
      }
    };

    // Start from message index 1 (first message is already visible)
    const startTimer = setTimeout(() => showNext(1), 800);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [loopKey, total, content.chatMessages]);

  // Auto-scroll chat container to bottom as messages appear (without moving the page)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleCount, showTyping]);

  return (
    <div
      className="lp-chat-mockup"
      style={{
        background: CARD,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        maxWidth: "500px",
        width: "100%",
        height: "580px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="lp-chat-header"
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}
      >
        <span className="lp-chat-header-icon" style={{ fontSize: "28px" }}>{content.chatHeader.icon}</span>
        <div style={{ flex: 1 }}>
          <p
            className="lp-chat-header-name"
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}
          >
            {content.chatHeader.name}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.40)",
              margin: "3px 0 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(34,197,94,0.5)",
              }}
            />
            {content.chatHeader.status}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="lp-chat-messages"
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "16px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {content.chatMessages.slice(0, visibleCount).map((msg, i) => (
          <div
            key={`${loopKey}-${i}`}
            className="chat-msg-in"
            style={{
              display: "flex",
              justifyContent: msg.role === "customer" ? "flex-start" : "flex-end",
            }}
          >
            <div
              className="lp-chat-bubble"
              style={{
                maxWidth: "82%",
                padding: "14px 18px",
                borderRadius:
                  msg.role === "customer"
                    ? "4px 20px 20px 20px"
                    : "20px 4px 20px 20px",
                background:
                  msg.role === "customer"
                    ? "rgba(255,255,255,0.06)"
                    : `${content.accent}22`,
                border:
                  msg.role === "customer"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : `1px solid ${content.accent}35`,
                fontSize: "15px",
                lineHeight: 1.65,
                color:
                  msg.role === "customer"
                    ? "rgba(255,255,255,0.80)"
                    : content.accent,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <div
            className="chat-msg-in"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                padding: "14px 22px",
                borderRadius: "20px 4px 20px 20px",
                background: `${content.accent}22`,
                border: `1px solid ${content.accent}35`,
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              <span className="typing-dot typing-dot-1" style={{ width: "7px", height: "7px", borderRadius: "50%", background: content.accent, opacity: 0.5 }} />
              <span className="typing-dot typing-dot-2" style={{ width: "7px", height: "7px", borderRadius: "50%", background: content.accent, opacity: 0.5 }} />
              <span className="typing-dot typing-dot-3" style={{ width: "7px", height: "7px", borderRadius: "50%", background: content.accent, opacity: 0.5 }} />
            </div>
          </div>
        )}


      </div>

      {/* Footer */}
      <div
        className="lp-chat-footer"
        style={{
          padding: "14px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "12px",
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

        .pricing-card {
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms ease;
        }
        .pricing-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.50), 0 0 60px ${accent}20;
        }
        .pricing-cta-btn {
          transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
        }
        .pricing-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px ${accent}55;
          filter: brightness(1.1);
        }
        .pricing-cta-btn:active {
          transform: translateY(0);
        }
        @keyframes pricePulse {
          0%, 100% { box-shadow: 0 0 0 0 ${accent}40; }
          50% { box-shadow: 0 0 0 8px ${accent}00; }
        }
        .pricing-badge-pulse {
          animation: pricePulse 2.5s ease-in-out infinite;
        }

        @media (max-width: 900px) {
          .hero-split { grid-template-columns: 1fr !important; gap: 48px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .hiw-split { grid-template-columns: 1fr !important; gap: 40px !important; }
          .testimonial-3col { grid-template-columns: 1fr !important; }
          .cta-split { grid-template-columns: 1fr !important; gap: 48px !important; }
        }

        /* ═══════ MOBILE OPTIMIZATIONS (≤ 600px) ═══════ */
        @media (max-width: 600px) {
          .pain-grid { grid-template-columns: 1fr !important; }

          /* ── Header ── */
          .lp-header-nav { padding: 0 16px !important; }
          .lp-header-inner { height: 56px !important; }
          .lp-header-link { display: none !important; }
          .lp-header-cta {
            padding: 8px 16px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }
          .lp-header-logo { width: 115px !important; }

          /* ── Hero Section ── */
          .lp-hero-section { padding: 48px 16px 56px !important; }
          .hero-split { gap: 32px !important; }
          .lp-hero-eyebrow { font-size: 10px !important; margin-bottom: 14px !important; }
          .lp-hero-headline { font-size: clamp(28px, 8vw, 40px) !important; margin-bottom: 16px !important; letter-spacing: -0.025em !important; }
          .lp-hero-subhead { font-size: 15px !important; margin-bottom: 24px !important; line-height: 1.65 !important; }
          .lp-hero-stats { gap: 20px !important; margin-bottom: 28px !important; }
          .lp-stat-number { font-size: 24px !important; }
          .lp-stat-label { font-size: 10px !important; letter-spacing: 0.06em !important; }

          /* ── Lead Form ── */
          .lp-lead-form { padding: 24px 20px !important; border-radius: 18px !important; gap: 12px !important; }
          .lp-lead-form h3 { font-size: 16px !important; }
          .lp-lead-form p { font-size: 12px !important; }
          .landing-input { padding: 12px 14px !important; font-size: 14px !important; border-radius: 10px !important; }
          .landing-submit { padding: 14px 20px !important; font-size: 14px !important; border-radius: 10px !important; }

          /* ── Chat Mockup ── */
          .lp-chat-mockup {
            height: 420px !important;
            border-radius: 18px !important;
            max-width: 100% !important;
          }
          .lp-chat-header { padding: 14px 16px !important; }
          .lp-chat-header-icon { font-size: 22px !important; }
          .lp-chat-header-name { font-size: 14px !important; }
          .lp-chat-messages { padding: 16px !important; gap: 12px !important; }
          .lp-chat-bubble { padding: 11px 14px !important; font-size: 13px !important; line-height: 1.55 !important; }
          .lp-chat-footer { padding: 10px 16px !important; }
          .lp-chat-footer p { font-size: 11px !important; }
          .lp-chat-caption { font-size: 10px !important; margin-top: 14px !important; }

          /* ── Offer Banner ── */
          .lp-offer-banner { padding: 16px !important; }
          .lp-offer-banner-inner { flex-direction: column !important; gap: 10px !important; }
          .lp-offer-banner-text { font-size: 13px !important; text-align: center !important; line-height: 1.45 !important; }
          .lp-offer-banner-tag { font-size: 10px !important; }

          /* ── Pain Points Section ── */
          .lp-pain-section { padding: 56px 16px !important; }
          .lp-pain-header { margin-bottom: 40px !important; }
          .lp-section-eyebrow { font-size: 10px !important; margin-bottom: 10px !important; }
          .lp-section-heading { font-size: clamp(22px, 6vw, 32px) !important; }
          .lp-section-subtext { font-size: 15px !important; line-height: 1.65 !important; }
          .pain-card { padding: 24px !important; border-radius: 16px !important; gap: 12px !important; }
          .pain-card span:first-child { font-size: 26px !important; }
          .pain-card h3 { font-size: 14px !important; }
          .pain-card p { font-size: 13px !important; }
          .pain-grid { gap: 16px !important; }

          /* ── How It Works Section ── */
          .lp-hiw-section { padding: 56px 16px !important; }
          .lp-hiw-header { margin-bottom: 40px !important; }
          .lp-step-card { padding: 20px !important; border-radius: 16px !important; gap: 14px !important; }
          .lp-step-num {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .lp-step-num span { font-size: 12px !important; }
          .lp-step-card h3 { font-size: 14px !important; }
          .lp-step-card p { font-size: 13px !important; }
          .lp-steps-list { gap: 16px !important; }

          /* ── Offer Box ── */
          .lp-offer-box {
            padding: 28px 20px !important;
            border-radius: 18px !important;
            position: static !important;
          }
          .lp-offer-box h3 { font-size: 20px !important; margin-bottom: 20px !important; }
          .lp-offer-items { gap: 16px !important; }
          .lp-offer-item { gap: 10px !important; }
          .lp-offer-item p:first-child { font-size: 13px !important; }
          .lp-offer-item p:last-of-type { font-size: 12px !important; }
          .lp-offer-price-row { margin-top: 20px !important; padding-top: 16px !important; }
          .lp-offer-price { font-size: 16px !important; }

          /* ── Pricing Section ── */
          .lp-pricing-section { padding: 56px 16px !important; }
          .lp-pricing-header { margin-bottom: 36px !important; }
          .lp-pricing-card {
            padding: 28px 20px !important;
            border-radius: 20px !important;
            max-width: 100% !important;
          }
          .lp-pricing-price { font-size: 48px !important; }
          .lp-pricing-period { font-size: 16px !important; }
          .lp-pricing-website-banner {
            padding: 14px 16px !important;
            border-radius: 12px !important;
            flex-direction: column !important;
            text-align: center !important;
          }
          .lp-pricing-website-banner .lp-pricing-old-price { font-size: 18px !important; }
          .lp-pricing-website-banner .lp-pricing-free-label { font-size: 18px !important; }
          .lp-pricing-guarantee {
            padding: 16px !important;
            border-radius: 12px !important;
            flex-direction: column !important;
            text-align: center !important;
          }

          /* ── Testimonials Section ── */
          .lp-testimonials-section { padding: 56px 16px !important; }
          .lp-testimonials-header { margin-bottom: 40px !important; }
          .testimonial-3col { gap: 16px !important; }
          .lp-testimonial-card { padding: 24px !important; border-radius: 16px !important; }
          .lp-testimonial-card p { font-size: 14px !important; line-height: 1.7 !important; margin-bottom: 20px !important; }

          /* ── FAQ Section ── */
          .lp-faq-section { padding: 56px 16px !important; }
          .lp-faq-header { margin-bottom: 36px !important; }
          .lp-faq-question { font-size: 15px !important; padding: 18px 0 !important; }
          .lp-faq-answer { font-size: 14px !important; padding-right: 16px !important; }

          /* ── CTA Section ── */
          .lp-cta-section { padding: 56px 16px !important; }
          .cta-split { gap: 32px !important; }
          .lp-cta-headline { font-size: clamp(24px, 7vw, 36px) !important; }
          .lp-cta-body { font-size: 15px !important; margin-bottom: 16px !important; }
          .lp-cta-note { font-size: 13px !important; }

          /* ── Footer ── */
          .lp-footer { padding: 24px 16px !important; }
          .lp-footer-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 12px !important;
          }
          .lp-footer-logo { width: 100px !important; }
          .lp-footer-copy { font-size: 11px !important; }
          .lp-footer-link { font-size: 12px !important; }

          /* ── Success / Error states ── */
          .lp-status-card { padding: 32px 20px !important; border-radius: 18px !important; }
          .lp-status-card h3 { font-size: 19px !important; }
          .lp-status-card p { font-size: 14px !important; }
        }

        /* ── Chat animation ── */
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-msg-in {
          animation: chatMsgIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dot-1 { animation: typingBounce 1.2s ease-in-out infinite 0s; }
        .typing-dot-2 { animation: typingBounce 1.2s ease-in-out infinite 0.15s; }
        .typing-dot-3 { animation: typingBounce 1.2s ease-in-out infinite 0.3s; }

        @media (prefers-reduced-motion: reduce) {
          .chat-msg-in { animation: none; }
          .typing-dot-1,.typing-dot-2,.typing-dot-3 { animation: none; }
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
          className="lp-header-nav"
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
            className="lp-header-inner"
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
                className="lp-header-logo"
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
                className="header-link lp-header-link"
              >
                Talk to Our Team
              </Link>
              <a
                href="#get-started"
                className="lp-header-cta"
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
          className="lp-hero-section"
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
                className="lp-fu-1 lp-hero-eyebrow"
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
                className="lp-fu-2 lp-hero-headline"
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
                className="lp-fu-3 lp-hero-subhead"
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
                className="lp-fu-4 lp-hero-stats"
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
                      className="lp-stat-number"
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
                      className="lp-stat-label"
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
                  className="lp-chat-caption"
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
          className="lp-offer-banner"
          style={{
            background: accent,
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <div
            className="lp-offer-banner-inner"
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
              className="lp-offer-banner-text"
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
              className="lp-offer-banner-tag"
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
        <section className="lp-pain-section" style={{ padding: "100px 24px", background: CARD, position: "relative", overflow: "hidden" }}>
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
            <div className="lp-pain-header" style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                className="lp-section-eyebrow"
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
                className="lp-section-heading"
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
                className="lp-section-subtext"
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
        <section className="lp-hiw-section" style={{ padding: "100px 24px", background: DARK }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="lp-hiw-header" style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                className="lp-section-eyebrow"
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
                className="lp-section-heading"
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
              <div className="lp-steps-list" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {content.steps.map((step) => (
                  <div
                    key={step.num}
                    className="lp-step-card"
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
                      className="lp-step-num"
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
                className="lp-offer-box"
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

                <div className="lp-offer-items" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {content.offerItems.map((item) => (
                    <div
                      key={item.item}
                      className="lp-offer-item"
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
                  className="lp-offer-price-row"
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
                    className="lp-offer-price"
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

        {/* ═══════ 5.5  PRICING SECTION ═══════ */}
        <section
          className="lp-pricing-section"
          style={{
            padding: "100px 24px",
            background: CARD,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent glow behind pricing */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "800px",
              height: "600px",
              background: `radial-gradient(ellipse, ${accent}12 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Section header */}
            <div
              className="lp-pricing-header"
              style={{ textAlign: "center", marginBottom: "56px" }}
            >
              <p
                className="lp-section-eyebrow"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: "14px",
                }}
              >
                {content.pricingEyebrow}
              </p>
              <h2
                className="lp-section-heading"
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: "0 0 16px",
                  lineHeight: 1.15,
                }}
              >
                {content.pricingHeadline}
              </h2>
              <p
                className="lp-section-subtext"
                style={{
                  fontSize: "17px",
                  color: "rgba(255,255,255,0.45)",
                  maxWidth: "600px",
                  marginInline: "auto",
                  lineHeight: 1.75,
                }}
              >
                {content.pricingSubhead}
              </p>
            </div>

            {/* Pricing Card */}
            <div
              className="pricing-card lp-pricing-card"
              style={{
                maxWidth: "560px",
                margin: "0 auto",
                background: DARK,
                border: `2px solid ${accent}50`,
                borderRadius: "28px",
                padding: "44px 40px",
                position: "relative",
                boxShadow: `0 24px 80px rgba(0,0,0,0.40), 0 0 40px ${accent}10`,
              }}
            >
              {/* "Everything You Need" badge */}
              <div
                className="pricing-badge-pulse"
                style={{
                  position: "absolute",
                  top: "-14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: `linear-gradient(135deg, ${accent} 0%, ${accent === "#C9A84C" ? "#E8C44A" : "#EA51FF"} 100%)`,
                  color: accent === "#C9A84C" ? "#09090C" : "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "7px 24px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                }}
              >
                ✦ Everything You Need
              </div>

              {/* Price */}
              <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                  <span
                    className="lp-pricing-price"
                    style={{
                      fontSize: "64px",
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {content.pricingPrice}
                  </span>
                  <span
                    className="lp-pricing-period"
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.40)",
                    }}
                  >
                    {content.pricingPeriod}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "8px 0 0",
                  }}
                >
                  per month · billed monthly
                </p>
              </div>

              {/* FREE WEBSITE banner — the hero moment */}
              <div
                className="lp-pricing-website-banner"
                style={{
                  background: `${accent}12`,
                  border: `1px solid ${accent}35`,
                  borderRadius: "16px",
                  padding: "18px 24px",
                  marginBottom: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "24px" }}>🎁</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <span
                    className="lp-pricing-old-price"
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.30)",
                      textDecoration: "line-through",
                      textDecorationColor: "rgba(255,60,60,0.6)",
                      textDecorationThickness: "2px",
                    }}
                  >
                    {content.pricingWebsiteValue} Website
                  </span>
                  <span
                    className="lp-pricing-free-label"
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: accent,
                    }}
                  >
                    FREE
                  </span>
                </div>
              </div>

              {/* Feature list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginBottom: "32px",
                }}
              >
                {content.pricingIncludes.map((feature) => (
                  <div
                    key={feature.item}
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
                    <span
                      style={{
                        fontSize: "15px",
                        lineHeight: 1.6,
                        color: feature.highlight
                          ? "#fff"
                          : "rgba(255,255,255,0.55)",
                        fontWeight: feature.highlight ? 700 : 400,
                      }}
                    >
                      {feature.item}
                      {feature.highlight && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            fontWeight: 800,
                            color: accent === "#C9A84C" ? "#09090C" : "#fff",
                            background: accent,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {content.pricingWebsiteValue} value
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="#get-started"
                className="pricing-cta-btn"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "18px 24px",
                  background: accent,
                  color: accent === "#C9A84C" ? "#09090C" : "#fff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "17px",
                  fontWeight: 800,
                  fontFamily: "inherit",
                  textDecoration: "none",
                  textAlign: "center",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                {content.pricingCta}
              </a>

              {/* No contract micro-copy */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.32)",
                  marginTop: "14px",
                }}
              >
                {content.pricingGuarantee}
              </p>
            </div>

            {/* Guarantee / Risk Reversal Banner */}
            <div
              className="lp-pricing-guarantee"
              style={{
                maxWidth: "560px",
                margin: "28px auto 0",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "24px" }}>🛡️</span>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.50)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "#fff" }}>Zero risk.</strong>{" "}
                No long-term contracts, no setup fees, no hidden charges. Start today and cancel anytime — your website stays yours.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ 6. TESTIMONIALS ═══════ */}
        <section className="lp-testimonials-section" style={{ padding: "100px 24px", background: CARD }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="lp-testimonials-header" style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                className="lp-section-eyebrow"
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
                className="lp-section-heading"
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
                  className="lp-testimonial-card"
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
        <section className="lp-faq-section" style={{ padding: "100px 24px", background: DARK }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div className="lp-faq-header" style={{ textAlign: "center", marginBottom: "56px" }}>
              <p
                className="lp-section-eyebrow"
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
                className="lp-section-heading"
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
        <section className="lp-cta-section" style={{ padding: "100px 24px", background: CARD }}>
          <div className="cta-split" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Left: Copy */}
            <div>
              <p
                className="lp-section-eyebrow"
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
                className="lp-cta-headline"
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
                className="lp-cta-body"
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
                className="lp-cta-note"
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
          className="lp-footer"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 24px",
            background: DARK,
          }}
        >
          <div
            className="lp-footer-inner"
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
                className="lp-footer-logo"
                style={{ width: "120px", height: "auto" }}
              />
            </Link>
            <p
              className="lp-footer-copy"
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
              className="lp-footer-link"
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
