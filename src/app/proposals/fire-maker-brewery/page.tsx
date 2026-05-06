"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IoGlobeOutline,
  IoSearchOutline,
  IoLogoInstagram,
  IoSettingsOutline,
  IoCheckmarkCircle,
  IoArrowForward,
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoFlameOutline,
} from "react-icons/io5";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";

// ─── Brand tokens ──────────────────────────────────────────────────────────
const ORANGE = "#F15F2A";
const AMBER  = "#E8960A";
const DARK   = "#1a1008";
const WARM_BG = "#fdf3e3";
const WARM_MID = "#f5e8cc";
const MUTED  = "rgba(26,16,8,0.55)";
const BORDER = "rgba(26,16,8,0.09)";

// ─── Service catalog ──────────────────────────────────────────────────────
type BillingType = "monthly" | "one-time";

interface Service {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  billing: BillingType;
  icon: React.ElementType;
  bullets: string[];
}

const SERVICES: Service[] = [
  // ── Monthly
  {
    id: "website-monthly",
    name: "Website Hosting & Updates",
    tagline: "Site hosting, maintenance & ongoing updates. Monthly.",
    price: 297,
    priceLabel: "$297",
    billing: "monthly",
    icon: IoGlobeOutline,
    bullets: [
      "Secure, fast-managed hosting",
      "Content & page updates included",
      "Performance monitoring",
      "No large upfront cost",
    ],
  },

  {
    id: "social-pro",
    name: "Social Media — Pro",
    tagline: "16 posts per month. Premium content creation.",
    price: 750,
    priceLabel: "$750",
    billing: "monthly",
    icon: IoLogoInstagram,
    bullets: [
      "16 custom posts/month",
      "Full video production pipeline",
      "Brewery spotlight series",
      "Paid social campaign management",
    ],
  },
  {
    id: "branding",
    name: "Graphic Design & Branding",
    tagline: "Ongoing brand asset creation & design support.",
    price: 500,
    priceLabel: "$500",
    billing: "monthly",
    icon: IoFlameOutline,
    bullets: [
      "Custom graphics & brand assets",
      "Menu & label design support",
      "Event flyer & promo materials",
      "Consistent visual identity",
    ],
  },
  // ── One-time
  {
    id: "website-build",
    name: "Website (One-Time Build)",
    tagline: "Full website build. No recurring monthly fee.",
    price: 5900,
    priceLabel: "$5,900",
    billing: "one-time",
    icon: IoGlobeOutline,
    bullets: [
      "Complete custom design & dev",
      "No ongoing monthly commitment",
      "Tap room & event pages",
      "Online menu & beer finder integration",
    ],
  },
  {
    id: "av-service-call",
    name: "A/V Service Call",
    tagline: "On-site audio/visual support. Priced per service call.",
    price: 300,
    priceLabel: "$300/call",
    billing: "one-time",
    icon: IoAddCircleOutline,
    bullets: [
      "On-site A/V troubleshooting & setup",
      "Live event audio/visual support",
      "Equipment configuration",
      "Priced per visit — not a monthly charge",
    ],
  },
  {
    id: "crm-setup",
    name: "CRM Setup & Onboarding",
    tagline: "Platform selection, setup, automation & staff training.",
    price: 0,
    priceLabel: "TBD",
    billing: "one-time",
    icon: IoSettingsOutline,
    bullets: [
      "CRM platform recommendation",
      "Setup & workflow automation",
      "Lead source tracking",
      "Staff training & onboarding",
    ],
  },
  {
    id: "strategy-meeting",
    name: "Business Growth Strategy Meeting",
    tagline: "1-hour focused strategy session.",
    price: 150,
    priceLabel: "$150",
    billing: "one-time",
    icon: IoAddCircleOutline,
    bullets: [
      "1-on-1 with senior strategist",
      "Competitive landscape analysis",
      "Custom growth roadmap",
      "Recorded & summarized for you",
    ],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "68vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "80px",
        paddingBottom: "64px",
        background: `linear-gradient(160deg, #1a0a02 0%, #2d1200 40%, #3d1f00 70%, #1a0a02 100%)`,
      }}
    >
      {/* Flame glow orbs */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", width: "600px", height: "600px",
          borderRadius: "50%", top: "-100px", left: "50%", transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(232,150,10,0.25) 0%, rgba(241,95,42,0.12) 50%, transparent 80%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          borderRadius: "50%", bottom: "-80px", right: "10%",
          background: "radial-gradient(circle, rgba(241,95,42,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
        <Image
          src="/Main%20logo%202.png"
          alt="Creative Cowboys Media"
          width={180}
          height={48}
          priority
          style={{ width: "180px", height: "auto" }}
        />
      </Link>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .p1 { animation: fadeUp .55s cubic-bezier(0.4,0,0.2,1) .05s both; }
        .p2 { animation: fadeUp .60s cubic-bezier(0.4,0,0.2,1) .18s both; }
        .p3 { animation: fadeUp .60s cubic-bezier(0.4,0,0.2,1) .32s both; }
        .p4 { animation: fadeUp .60s cubic-bezier(0.4,0,0.2,1) .46s both; }
        @keyframes flicker {
          0%,100% { opacity: 1; } 45% { opacity: 0.85; } 55% { opacity: 1; } 75% { opacity: 0.9; }
        }
        .flame-icon { animation: flicker 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .p1,.p2,.p3,.p4,.flame-icon { animation: none; } }

        .fmb-service-card { transition: box-shadow 220ms ease, transform 220ms ease; }
        .fmb-service-card:hover { box-shadow: 0 8px 40px rgba(232,150,10,0.18); transform: translateY(-2px); }
        .fmb-service-card.selected { box-shadow: 0 0 0 2px ${AMBER}, 0 8px 40px rgba(232,150,10,0.22); }

        .fmb-checkout-toggle {
          width: 24px; height: 24px; border-radius: 6px;
          border: 2px solid rgba(26,16,8,0.20);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 220ms ease; flex-shrink: 0;
        }
        .fmb-checkout-toggle.checked { background: ${AMBER}; border-color: ${AMBER}; }
        .fmb-checkout-toggle:hover { border-color: ${AMBER}; }

        .fmb-submit-btn { transition: transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease; }
        .fmb-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(232,150,10,0.40); }
        .fmb-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .fmb-submit-btn:active:not(:disabled) { transform: translateY(0); }

        .fmb-input-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.5);
          border: 1px solid ${BORDER};
          border-radius: 10px; color: ${DARK};
          font-size: 15px; font-family: inherit; outline: none;
          transition: border-color 200ms ease, background 200ms ease;
          box-sizing: border-box;
        }
        .fmb-input-field:focus { border-color: rgba(232,150,10,0.60); background: rgba(255,255,255,0.90); }
        .fmb-input-field::placeholder { color: rgba(26,16,8,0.30); }

        @media (max-width: 640px) {
          .fmb-service-grid { grid-template-columns: 1fr !important; }
          .fmb-total-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) { .fmb-form-row { grid-template-columns: 1fr !important; } }
        .fmb-input-field:focus { border-color: rgba(232,150,10,0.60) !important; }
        .fmb-input-field::placeholder { color: rgba(255,255,255,0.20); }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: "760px" }}>
        {/* Badge */}
        <div className="p1" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(232,150,10,0.15)", border: "1px solid rgba(232,150,10,0.30)",
          borderRadius: "999px", padding: "6px 16px", marginBottom: "28px",
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER,
        }}>
          <IoFlameOutline size={13} className="flame-icon" />
          Marketing Proposal · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>

        <p className="p2" style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "14px" }}>
          Prepared for
        </p>

        <h1 className="p3" style={{
          fontSize: "clamp(38px,6vw,72px)", fontWeight: 800, lineHeight: 1.06,
          letterSpacing: "-0.035em", color: "#fff", margin: "0 0 16px",
        }}>
          Fire Maker{" "}
          <span style={{
            background: "linear-gradient(135deg, #E8960A 0%, #F15F2A 55%, #ff3d00 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Brewery
          </span>
        </h1>

        <p className="p4" style={{ fontSize: "clamp(15px,1.8vw,18px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: "0 0 36px" }}>
          Craft beer deserves a craft digital presence. Select the services below to build your plan.
        </p>

        {/* Stats pills */}
        <div className="p4" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { val: "🍺", lbl: "Craft Brewery" },
            { val: "Local", lbl: "West Georgia" },
            { val: "100%", lbl: "Custom Strategy" },
          ].map(s => (
            <div key={s.val} style={{
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px",
              padding: "8px 20px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontSize: "15px", fontWeight: 800, color: AMBER }}>{s.val}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <FloatingNav />
    </section>
  );
}

interface ServiceCardProps {
  svc: Service;
  selected: boolean;
  onToggle: () => void;
}

function ServiceCard({ svc, selected, onToggle }: ServiceCardProps) {
  const Icon = svc.icon;
  return (
    <div
      className={`fmb-service-card${selected ? " selected" : ""}`}
      onClick={onToggle}
      style={{
        background: "#fff",
        border: `1px solid ${selected ? AMBER : BORDER}`,
        borderRadius: "16px",
        padding: "24px",
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
          background: selected ? `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)` : `${AMBER}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 200ms ease",
        }}>
          <Icon size={20} color={selected ? "#fff" : AMBER} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: "15px", fontWeight: 700, color: DARK, margin: "0 0 3px",
            letterSpacing: "-0.01em",
          }}>
            {svc.name}
          </h3>
          <p style={{ fontSize: "12px", color: MUTED, margin: 0, lineHeight: 1.5 }}>{svc.tagline}</p>
        </div>
      </div>

      {/* Bullets */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "7px" }}>
        {svc.bullets.map((b, i) => (
          <li key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: MUTED, lineHeight: 1.5 }}>
            <IoCheckmarkCircle size={13} color={selected ? AMBER : "rgba(26,16,8,0.28)"} style={{ flexShrink: 0, marginTop: "2px", transition: "color 200ms ease" }} />
            {b}
          </li>
        ))}
      </ul>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: `1px solid ${BORDER}` }}>
        <span style={{
          fontSize: "18px", fontWeight: 800, letterSpacing: "-0.03em",
          background: selected ? `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)` : "none",
          WebkitBackgroundClip: selected ? "text" : "unset",
          WebkitTextFillColor: selected ? "transparent" : "unset",
          backgroundClip: selected ? "text" : "unset",
          color: selected ? "transparent" : DARK,
          transition: "all 200ms ease",
        }}>
          {svc.priceLabel}
          {svc.billing === "monthly" && svc.price > 0 && <span style={{ fontSize: "12px", fontWeight: 400, opacity: 0.7 }}>/mo</span>}
        </span>

        <div className={`fmb-checkout-toggle${selected ? " checked" : ""}`}>
          {selected && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Recommended package ───────────────────────────────────────────────────
const PACKAGE_IDS = ["website-monthly"];

// Package pricing breakdown
const PACKAGE_ITEMS = [
  { name: "Website Hosting & Updates", desc: "Secure managed hosting, content updates & performance monitoring", price: "$297", billing: "monthly" as BillingType },
  { name: "Remote Technical Support", desc: "For Fire Maker A/V system (TV, security cameras, network)", price: "Included", billing: "monthly" as BillingType },
];
const PACKAGE_MONTHLY_TOTAL = 297;

// ─── Main checkout page ────────────────────────────────────────────────────
export default function FireMakerBreweryProposal() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [packageAccepted, setPackageAccepted] = useState(false);
  const [contactName, setContactName] = useState("Fire Maker Brewery");
  const [contactEmail, setContactEmail] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const totalRef = useRef<HTMLElement>(null);

  const toggleService = (id: string) => {
    setPackageAccepted(false);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const acceptPackage = () => {
    setSelectedIds(new Set(PACKAGE_IDS));
    setPackageAccepted(true);
    setTimeout(() => {
      totalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const selectedServices = SERVICES.filter(s => selectedIds.has(s.id));
  const monthlyTotal = selectedServices
    .filter(s => s.billing === "monthly")
    .reduce((sum, s) => sum + s.price, 0);
  const oneTimeTotal = selectedServices
    .filter(s => s.billing === "one-time")
    .reduce((sum, s) => sum + s.price, 0);

  const monthlyServices = SERVICES.filter(s => s.billing === "monthly");
  const oneTimeServices = SERVICES.filter(s => s.billing === "one-time");

  const canSubmit = selectedIds.size > 0 && contactName.trim() && contactEmail.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitState("loading");

    const servicesList = selectedServices.map(s =>
      `${s.name}: ${s.priceLabel}${s.billing === "monthly" ? "/mo" : ""}`
    ).join("\n");

    const payload = {
      access_key: "aeffe4bc-f0e5-45ed-a62b-b2f1f7ea9a07",
      subject: `[Fire Maker Brewery Proposal] New Service Selection — ${new Date().toLocaleDateString()}`,
      from_name: contactName,
      email: contactEmail,
      replyto: contactEmail,
      message: `New proposal selection submitted by ${contactName} (${contactEmail}).\n\nSELECTED SERVICES:\n${servicesList}\n\nMonthly Total: $${monthlyTotal.toLocaleString()}/mo${oneTimeTotal > 0 ? `\nOne-Time Total: $${oneTimeTotal.toLocaleString()}` : ""}`,
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitState("success");
      } else {
        console.error("Web3Forms error:", data);
        setSubmitState("error");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitState("error");
    }
  };

  if (submitState === "success") {
    return (
      <>
        <Hero />
        <section style={{ background: WARM_BG, padding: "120px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px", boxShadow: "0 12px 40px rgba(232,150,10,0.30)",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK, margin: "0 0 16px" }}>
              We&rsquo;ve got it!
            </h2>
            <p style={{ fontSize: "16px", color: MUTED, lineHeight: 1.7, margin: "0 0 8px" }}>
              Your selection has been sent to the Creative Cowboys team. We&rsquo;ll reach out within one business day to get everything rolling.
            </p>
            <p style={{ fontSize: "14px", color: MUTED, opacity: 0.7, margin: "0 0 36px" }}>
              Monthly total: <strong style={{ color: DARK }}>${monthlyTotal.toLocaleString()}/mo</strong>
              {oneTimeTotal > 0 && <> · One-time: <strong style={{ color: DARK }}>${oneTimeTotal.toLocaleString()}</strong></>}
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
              color: "#fff", fontWeight: 700, fontSize: "14px", padding: "14px 28px",
              borderRadius: "999px", textDecoration: "none",
              boxShadow: "0 8px 32px rgba(232,150,10,0.30)",
            }}>
              Back to Creative Cowboys <IoArrowForward size={15} />
            </Link>
          </div>
        </section>
        <Footer7 />
      </>
    );
  }

  return (
    <>
      <Hero />

      {/* ── Recommended Package ── */}
      <section style={{ background: DARK, padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER }}>
                Recommended Package
              </span>
              <span style={{
                background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "3px 12px", borderRadius: "999px",
              }}>
                Built for Fire Maker
              </span>
            </div>
            <h2 style={{
              fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.03em",
              color: "#fff", margin: "0 0 12px", lineHeight: 1.1,
            }}>
              Your custom plan,{" "}
              <span style={{
                background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                ready to go.
              </span>
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65, margin: 0, maxWidth: "560px" }}>
              Built around your brewery&rsquo;s goals — growing your local audience, ranking higher in local search, and keeping your community engaged on social.
            </p>
          </div>

          {/* Package card */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "20px", overflow: "hidden",
          }}>
            {PACKAGE_ITEMS.map((item, i, arr) => (
              <div key={item.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 28px",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                gap: "16px", flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "220px" }}>
                  <IoCheckmarkCircle size={18} color={AMBER} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>{item.name}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 800, color: item.price === "Included" ? "#22c55e" : AMBER, flexShrink: 0 }}>
                  {item.price}{item.price !== "Included" && <span style={{ fontSize: "12px", fontWeight: 400, opacity: 0.7 }}>/mo</span>}
                </span>
              </div>
            ))}

            {/* Total row */}
            <div style={{
              background: "rgba(232,150,10,0.07)", borderTop: "1px solid rgba(232,150,10,0.20)",
              padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>
                  Package Total
                </p>
                <p style={{
                  fontSize: "clamp(30px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                  background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  ${PACKAGE_MONTHLY_TOTAL.toLocaleString()}<span style={{ fontSize: "18px", fontWeight: 400 }}>/mo</span>
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
                <button
                  onClick={acceptPackage}
                  className="fmb-submit-btn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                    color: "#fff", fontWeight: 800, fontSize: "15px",
                    padding: "14px 32px", borderRadius: "999px",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(232,150,10,0.35)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Accept This Package <IoArrowForward size={16} />
                </button>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "right" }}>
                  Or scroll down to build a custom plan
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Service selector ── */}
      <section style={{ background: `linear-gradient(180deg, ${WARM_BG} 0%, ${WARM_MID} 100%)`, padding: "80px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: "48px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, display: "block", marginBottom: "12px" }}>
              Or Build A Custom Plan
            </span>
            <h2 style={{
              fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.03em",
              color: DARK, margin: "0 0 10px", lineHeight: 1.1,
            }}>
              Select the services<br />you want to{" "}
              <span style={{
                background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 55%, #ff3d00 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>move forward</span>{" "}with.
            </h2>
            <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.65, margin: 0 }}>
              Click any card to add it to your plan. Your running total updates below.
            </p>
          </div>

          {/* Monthly services */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>Monthly Services</span>
              <div style={{ flex: 1, height: "1px", background: BORDER }} />
            </div>
            <div className="fmb-service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {monthlyServices.map(svc => (
                <ServiceCard key={svc.id} svc={svc} selected={selectedIds.has(svc.id)} onToggle={() => toggleService(svc.id)} />
              ))}
            </div>
          </div>

          {/* One-time services */}
          <div style={{ marginBottom: "64px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>One-Time Services</span>
              <div style={{ flex: 1, height: "1px", background: BORDER }} />
            </div>
            <div className="fmb-service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {oneTimeServices.map(svc => (
                <ServiceCard key={svc.id} svc={svc} selected={selectedIds.has(svc.id)} onToggle={() => toggleService(svc.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Total + Submit ── */}
      <section ref={totalRef} style={{ background: DARK, padding: "80px 24px", borderTop: "none" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, display: "block", marginBottom: "12px" }}>
            Your Plan
          </span>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 40px", lineHeight: 1.1 }}>
            {selectedIds.size === 0
              ? "No services selected yet."
              : `${selectedIds.size} service${selectedIds.size > 1 ? "s" : ""} selected.`}
          </h2>

          {/* Summary card */}
          {selectedIds.size > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px", overflow: "hidden", marginBottom: "40px",
            }}>
              {selectedServices.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 24px", borderBottom: i < selectedServices.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  gap: "16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <IoCheckmarkCircle size={15} color={AMBER} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.80)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 7px", flexShrink: 0 }}>
                      {s.billing === "monthly" ? "monthly" : "one-time"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: AMBER }}>{s.priceLabel}{s.billing === "monthly" && s.price > 0 ? "/mo" : ""}</span>
                    <button
                      onClick={() => toggleService(s.id)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", lineHeight: 1 }}
                      title="Remove"
                    >
                      <IoRemoveCircleOutline size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="fmb-total-grid" style={{
                display: "grid", gridTemplateColumns: monthlyTotal > 0 && oneTimeTotal > 0 ? "1fr 1fr" : "1fr",
                borderTop: "1px solid rgba(255,255,255,0.10)",
              }}>
                {monthlyTotal > 0 && (
                  <div style={{ padding: "24px", borderRight: monthlyTotal > 0 && oneTimeTotal > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 6px" }}>Monthly Total</p>
                    <p style={{
                      fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                      background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      ${monthlyTotal.toLocaleString()}<span style={{ fontSize: "16px", fontWeight: 400 }}>/mo</span>
                    </p>
                  </div>
                )}
                {oneTimeTotal > 0 && (
                  <div style={{ padding: "24px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 6px" }}>One-Time Total</p>
                    <p style={{
                      fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                      background: `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      ${oneTimeTotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact fields + submit */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }} className="fmb-form-row">
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="fmb-input-field"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="fmb-input-field"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff" }}
                />
              </div>
            </div>

            {submitState === "error" && (
              <p style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "16px", background: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.20)", borderRadius: "8px", padding: "10px 16px" }}>
                Something went wrong. Please try again or email us directly at josh@creativecowboys.co
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitState === "loading"}
              className="fmb-submit-btn"
              style={{
                width: "100%", padding: "18px 32px",
                background: canSubmit ? `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)` : "rgba(255,255,255,0.08)",
                border: "none", borderRadius: "12px",
                color: canSubmit ? "#fff" : "rgba(255,255,255,0.30)",
                fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
                cursor: canSubmit ? "pointer" : "not-allowed",
                letterSpacing: "0.02em",
                boxShadow: canSubmit ? "0 8px 32px rgba(232,150,10,0.30)" : "none",
                transition: "all 220ms ease",
              }}
            >
              {submitState === "loading"
                ? "Sending your plan..."
                : selectedIds.size === 0
                  ? "Select at least one service to continue"
                  : `Submit Plan to Creative Cowboys →`}
            </button>

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", margin: "12px 0 0" }}>
              Your selection will be emailed to the Creative Cowboys team. We&rsquo;ll follow up within one business day.
            </p>
          </form>
        </div>
      </section>

      <Footer7 />
    </>
  );
}
