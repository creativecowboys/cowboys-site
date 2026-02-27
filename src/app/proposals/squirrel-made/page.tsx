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
    IoColorPaletteOutline,
} from "react-icons/io5";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";
import ProposalTracker from "@/components/ProposalTracker";

// ─── Brand tokens ──────────────────────────────────────────────────────────
const ORANGE = "#F15F2A";
const DARK = "#1a1514";
const PEACH_LIGHT = "#fce8d5";
const PEACH_MID = "#f0ddd4";
const MUTED = "rgba(26,21,20,0.55)";
const BORDER = "rgba(26,21,20,0.09)";

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
    badge?: string;
}

const SERVICES: Service[] = [
    // ── Monthly
    {
        id: "website-monthly",
        name: "Website",
        tagline: "3–5 page custom site. No upfront. 12-month agreement.",
        price: 497,
        priceLabel: "$497",
        billing: "monthly",
        icon: IoGlobeOutline,
        bullets: [
            "Modern, mobile-first design",
            "SEO-optimized from day one",
            "No large upfront cost",
            "Managed & maintained for you",
        ],
        badge: "Most Popular",
    },
    {
        id: "seo-local",
        name: "SEO Local",
        tagline: "Local keyword targeting & Google Business Profile optimization.",
        price: 497,
        priceLabel: "$497",
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
        price: 997,
        priceLabel: "$997",
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
        price: 1797,
        priceLabel: "$1,797",
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
        tagline: "Google & social PPC campaign management & optimization.",
        price: 250,
        priceLabel: "$250",
        billing: "monthly",
        icon: IoAddCircleOutline,
        bullets: [
            "Google & Facebook Ads setup & management",
            "Keyword & audience bid optimization",
            "Monthly performance reporting",
            "Ad spend is separate from management fee",
        ],
    },
    {
        id: "social-starter",
        name: "Social Media — Starter",
        tagline: "4 posts per month. Custom content creation.",
        price: 250,
        priceLabel: "$250",
        billing: "monthly",
        icon: IoLogoInstagram,
        bullets: [
            "4 custom posts/month",
            "Caption & graphic creation",
            "Brand approval before posting",
            "Instagram & Facebook",
        ],
    },
    {
        id: "social-growth",
        name: "Social Media — Growth",
        tagline: "8 posts per month. Custom content creation.",
        price: 500,
        priceLabel: "$500",
        billing: "monthly",
        icon: IoLogoInstagram,
        bullets: [
            "8 custom posts/month",
            "Short-form video strategy",
            "Brand approval before posting",
            "Instagram, Facebook & TikTok",
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
            "Product spotlight video series",
            "Paid social campaign management",
        ],
    },
    // ── One-time
    {
        id: "branding-design",
        name: "Branding & Graphic Design",
        tagline: "Logo, label design & brand identity package.",
        price: 500,
        priceLabel: "$500",
        billing: "one-time",
        icon: IoColorPaletteOutline,
        bullets: [
            "Logo design & brand mark",
            "Product label design",
            "Brand color palette & typography",
            "Print-ready & digital file delivery",
        ],
    },
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
            "Shopify e-commerce ready",
            "Product catalog & online store setup",
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
            "Customer source tracking",
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
            }}
        >
            <div className="mesh-gradient" style={{ position: "absolute", inset: 0 }} />

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
        .badge-dot { animation: pingDot 1.8s ease-in-out infinite; }
        @keyframes pingDot { 75%,100% { transform: scale(2.2); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .p1,.p2,.p3,.p4 { animation: none; } }

        .service-card { transition: box-shadow 220ms ease, transform 220ms ease; }
        .service-card:hover { box-shadow: 0 8px 40px rgba(241,95,42,0.14); transform: translateY(-2px); }
        .service-card.selected { box-shadow: 0 0 0 2px ${ORANGE}, 0 8px 40px rgba(241,95,42,0.18); }

        .checkout-toggle {
          width: 24px; height: 24px; border-radius: 6px;
          border: 2px solid rgba(26,21,20,0.20);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 220ms ease; flex-shrink: 0;
        }
        .checkout-toggle.checked {
          background: ${ORANGE}; border-color: ${ORANGE};
        }
        .checkout-toggle:hover { border-color: ${ORANGE}; }

        .submit-btn {
          transition: transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(241,95,42,0.38);
        }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .input-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.5);
          border: 1px solid ${BORDER};
          border-radius: 10px; color: ${DARK};
          font-size: 15px; font-family: inherit; outline: none;
          transition: border-color 200ms ease, background 200ms ease;
          box-sizing: border-box;
        }
        .input-field:focus { border-color: rgba(241,95,42,0.60); background: rgba(255,255,255,0.85); }
        .input-field::placeholder { color: rgba(26,21,20,0.30); }

        @media (max-width: 640px) {
          .service-grid { grid-template-columns: 1fr !important; }
          .total-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: "760px" }}>
                {/* Badge */}
                <div className="p1" style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(241,95,42,0.10)", border: "1px solid rgba(241,95,42,0.25)",
                    borderRadius: "999px", padding: "6px 16px", marginBottom: "28px",
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE,
                }}>
                    <span className="badge-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: ORANGE }} />
                    Marketing Proposal · February 26, 2026
                </div>

                <p className="p2" style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: "14px" }}>
                    Prepared for
                </p>

                <h1 className="p3" style={{
                    fontSize: "clamp(38px,6vw,72px)", fontWeight: 800, lineHeight: 1.06,
                    letterSpacing: "-0.035em", color: DARK, margin: "0 0 16px",
                }}>
                    Squirrel{" "}
                    <span style={{
                        background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                        Made Products
                    </span>
                </h1>

                <p className="p4" style={{ fontSize: "clamp(15px,1.8vw,18px)", color: MUTED, lineHeight: 1.55, margin: "0 0 36px" }}>
                    Three years of loyal farmers&rsquo; market customers. Real ingredients, nothing hidden. Now let&rsquo;s build the online presence that brings those customers to you — wherever they are.
                    Select the services below to build your plan.
                </p>

                {/* Stats pills */}
                <div className="p4" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { val: "3 Yrs", lbl: "Building Loyal Customers" },
                        { val: "Artisanal", lbl: "Food Products" },
                        { val: "West GA", lbl: "Based" },
                    ].map(s => (
                        <div key={s.val} style={{
                            background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.90)", borderRadius: "999px",
                            padding: "8px 20px", display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            <span style={{ fontSize: "15px", fontWeight: 800, color: ORANGE }}>{s.val}</span>
                            <span style={{ fontSize: "12px", color: MUTED, fontWeight: 500 }}>{s.lbl}</span>
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
            className={`service-card${selected ? " selected" : ""}`}
            onClick={onToggle}
            style={{
                background: "#fff",
                border: `1px solid ${selected ? ORANGE : BORDER}`,
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                position: "relative",
                userSelect: "none",
            }}
        >
            {/* Badge */}
            {svc.badge && (
                <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    background: selected ? ORANGE : `${ORANGE}15`,
                    color: selected ? "#fff" : ORANGE,
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "3px 10px", borderRadius: "999px",
                    transition: "all 200ms ease",
                }}>
                    {svc.badge}
                </div>
            )}

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                <div style={{
                    width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                    background: selected ? `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)` : `${ORANGE}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 200ms ease",
                }}>
                    <Icon size={20} color={selected ? "#fff" : ORANGE} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        fontSize: "15px", fontWeight: 700, color: DARK, margin: "0 0 3px",
                        letterSpacing: "-0.01em", paddingRight: svc.badge ? "148px" : "0",
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
                        <IoCheckmarkCircle size={13} color={selected ? ORANGE : "rgba(26,21,20,0.30)"} style={{ flexShrink: 0, marginTop: "2px", transition: "color 200ms ease" }} />
                        {b}
                    </li>
                ))}
            </ul>

            {/* Footer row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: `1px solid ${BORDER}` }}>
                <span style={{
                    fontSize: "18px", fontWeight: 800, letterSpacing: "-0.03em",
                    background: selected ? `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)` : "none",
                    WebkitBackgroundClip: selected ? "text" : "unset",
                    WebkitTextFillColor: selected ? "transparent" : "unset",
                    backgroundClip: selected ? "text" : "unset",
                    color: selected ? "transparent" : DARK,
                    transition: "all 200ms ease",
                }}>
                    {svc.priceLabel}
                    {svc.billing === "monthly" && svc.price > 0 && <span style={{ fontSize: "12px", fontWeight: 400, opacity: 0.7 }}>/mo</span>}
                </span>

                <div className={`checkout-toggle${selected ? " checked" : ""}`}>
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

// ─── Email HTML builder ────────────────────────────────────────────────────
function buildEmailHTML(
    selected: Service[],
    monthlyTotal: number,
    oneTimeTotal: number,
    contactName: string,
    contactEmail: string,
) {
    const monthly = selected.filter(s => s.billing === "monthly");
    const oneTime = selected.filter(s => s.billing === "one-time");
    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const rowStyle = `padding:14px 20px;border-bottom:1px solid #f0e8e4;`;
    const labelStyle = `font-size:13px;font-weight:600;color:#1a1514;`;
    const priceStyle = `font-size:13px;font-weight:700;color:#F15F2A;text-align:right;`;

    const renderRows = (svcs: Service[]) => svcs.map(s => `
    <tr>
      <td style="${rowStyle}${labelStyle}">${s.name}</td>
      <td style="${rowStyle}${priceStyle}">${s.priceLabel}${s.billing === "monthly" ? "/mo" : ""}</td>
    </tr>`).join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f7f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3f0;padding:40px 20px;">
<tr><td>
<table width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1a1514 0%,#2d1f1a 100%);padding:40px 40px 36px;text-align:center;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#F15F2A;margin:0 0 16px;">New Service Selection</p>
    <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-0.03em;">Squirrel Made Products</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.45);margin:0;">${dateStr}</p>
  </td></tr>

  <!-- Contact info -->
  <tr><td style="padding:28px 40px 0;background:#fff;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,20,0.40);margin:0 0 12px;">Submitted By</p>
    <p style="font-size:15px;font-weight:700;color:#1a1514;margin:0 0 4px;">${contactName}</p>
    <p style="font-size:14px;color:rgba(26,21,20,0.55);margin:0;"><a href="mailto:${contactEmail}" style="color:#F15F2A;text-decoration:none;">${contactEmail}</a></p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:24px 40px;"><div style="height:1px;background:#f0e8e4;"></div></td></tr>

  ${monthly.length > 0 ? `
  <!-- Monthly services -->
  <tr><td style="padding:0 40px 16px;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,20,0.40);margin:0 0 12px;">Monthly Services</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e4;border-radius:10px;overflow:hidden;">
      ${renderRows(monthly)}
      <tr><td colspan="2" style="padding:16px 20px;background:#fff8f5;">
        <table width="100%"><tr>
          <td style="font-size:14px;font-weight:700;color:#1a1514;">Monthly Total</td>
          <td style="font-size:20px;font-weight:800;color:#F15F2A;text-align:right;letter-spacing:-0.02em;">$${monthlyTotal.toLocaleString()}<span style="font-size:13px;font-weight:400;">/mo</span></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>` : ""}

  ${oneTime.length > 0 ? `
  <!-- One-time services -->
  <tr><td style="padding:0 40px 16px;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,20,0.40);margin:0 0 12px;">One-Time Services</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e4;border-radius:10px;overflow:hidden;">
      ${renderRows(oneTime)}
      ${oneTimeTotal > 0 ? `<tr><td colspan="2" style="padding:16px 20px;background:#fff8f5;">
        <table width="100%"><tr>
          <td style="font-size:14px;font-weight:700;color:#1a1514;">One-Time Total</td>
          <td style="font-size:20px;font-weight:800;color:#F15F2A;text-align:right;letter-spacing:-0.02em;">$${oneTimeTotal.toLocaleString()}</td>
        </tr></table>
      </td></tr>` : ""}
    </table>
  </td></tr>` : ""}

  <!-- CTA footer -->
  <tr><td style="padding:8px 40px 40px;">
    <div style="background:linear-gradient(135deg,#fce8d5 0%,#f0ddd4 100%);border-radius:12px;padding:24px 28px;text-align:center;">
      <p style="font-size:13px;color:rgba(26,21,20,0.55);margin:0 0 6px;">Ready to move forward?</p>
      <p style="font-size:16px;font-weight:700;color:#1a1514;margin:0;">Reach out to get started — <a href="mailto:${contactEmail}" style="color:#F15F2A;text-decoration:none;">${contactEmail}</a></p>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1a1514;padding:24px 40px;text-align:center;">
    <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:0 0 4px;">Creative Cowboys · creativecowboys.co</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.20);margin:0;">West Georgia's Digital Marketing Partner</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ─── Main checkout page ────────────────────────────────────────────────────
// Recommended package: Website ($497/mo) + Digital Ads (free) + SEO Local (free) + Branding (free)
const PACKAGE_IDS = ["website-monthly", "digital-ads", "seo-local", "branding-design"];
// Services that become FREE when the package is accepted
const PACKAGE_FREE_IDS = new Set(["digital-ads", "seo-local", "branding-design"]);

export default function SquirrelMadeProposal() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [packageAccepted, setPackageAccepted] = useState(false);
    const [contactName, setContactName] = useState("Squirrel Made Products");
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
    // When package accepted: digital-ads, seo-local, branding-design are free; website is paid at $497
    const monthlyTotal = selectedServices
        .filter(s => s.billing === "monthly")
        .reduce((sum, s) => sum + (packageAccepted && PACKAGE_FREE_IDS.has(s.id) ? 0 : s.price), 0);
    const oneTimeTotal = selectedServices
        .filter(s => s.billing === "one-time")
        .reduce((sum, s) => sum + (packageAccepted && PACKAGE_FREE_IDS.has(s.id) ? 0 : s.price), 0);

    const monthlyServices = SERVICES.filter(s => s.billing === "monthly");
    const oneTimeServices = SERVICES.filter(s => s.billing === "one-time");

    const canSubmit = selectedIds.size > 0 && contactName.trim() && contactEmail.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitState("loading");

        const emailBody = buildEmailHTML(selectedServices, monthlyTotal, oneTimeTotal, contactName, contactEmail);

        const servicesList = selectedServices.map(s =>
            `${s.name}: ${s.priceLabel}${s.billing === "monthly" ? "/mo" : ""}`
        ).join("\n");

        const payload = {
            access_key: "aeffe4bc-f0e5-45ed-a62b-b2f1f7ea9a07",
            subject: `[Squirrel Made Proposal] New Service Selection — ${new Date().toLocaleDateString()}`,
            from_name: contactName,
            email: contactEmail,
            replyto: contactEmail,
            message: `New proposal selection submitted by ${contactName} (${contactEmail}).\n\nSELECTED SERVICES:\n${servicesList}\n\nMonthly Total: $${monthlyTotal.toLocaleString()}/mo${oneTimeTotal > 0 ? `\nOne-Time Total: $${oneTimeTotal.toLocaleString()}` : ""}`,
        };

        try {
            const r = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await r.json();
            if (r.ok && data.success) {
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
                <ProposalTracker proposalName="Squirrel Made Products" />
                <Hero />
                <section style={{ background: "#fff", padding: "120px 24px", textAlign: "center" }}>
                    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
                        <div style={{
                            width: "80px", height: "80px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 28px", boxShadow: "0 12px 40px rgba(241,95,42,0.30)",
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
                            background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`,
                            color: "#fff", fontWeight: 700, fontSize: "14px", padding: "14px 28px",
                            borderRadius: "999px", textDecoration: "none",
                            boxShadow: "0 8px 32px rgba(241,95,42,0.28)",
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
            <ProposalTracker proposalName="Squirrel Made Products" />
            <Hero />

            {/* ── Recommended Package Section ── */}
            <section style={{ background: DARK, padding: "80px 24px", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ maxWidth: "1060px", margin: "0 auto" }}>

                    {/* Header */}
                    <div style={{ marginBottom: "40px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                            <span style={{
                                fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                                color: ORANGE,
                            }}>
                                Recommended Package
                            </span>
                            <span style={{
                                background: `linear-gradient(135deg, ${ORANGE} 0%, #EA51FF 100%)`,
                                color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                                textTransform: "uppercase", padding: "3px 12px", borderRadius: "999px",
                            }}>
                                Built for Squirrel Made Products
                            </span>
                        </div>
                        <h2 style={{
                            fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.03em",
                            color: "#fff", margin: "0 0 12px", lineHeight: 1.1,
                        }}>
                            Your custom plan,{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                                ready to go.
                            </span>
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65, margin: 0, maxWidth: "560px" }}>
                            Based on our conversations and the goals you outlined, we put together this package to get Squirrel Made selling online and growing its reach.
                        </p>
                    </div>

                    {/* Package card */}
                    <div style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "20px", overflow: "hidden",
                    }}>
                        {[
                            { name: "Website", desc: "3–5 page custom site, mobile-first, SEO-optimized, hosted & maintained", price: "$497", paid: true },
                            { name: "Digital Ads Management", desc: "Google & Facebook Ads setup, management & monthly reporting (ad spend billed separately)", price: "$250", freeMonthly: true },
                            { name: "SEO Local", desc: "Google Business Profile setup, local keyword targeting & monthly rank tracking", price: "$497", freeMonthly: true },
                            { name: "Branding & Graphic Design", desc: "Logo, product label design, brand palette & typography — print-ready file delivery", price: "$500", freeOnce: true },
                        ].map((item, i, arr) => (
                            <div key={item.name} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "20px 28px",
                                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                                gap: "16px", flexWrap: "wrap",
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "220px" }}>
                                    <IoCheckmarkCircle size={18} color={ORANGE} style={{ flexShrink: 0, marginTop: "2px" }} />
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>{item.name}</p>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                                    </div>
                                </div>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                    {item.paid ? (
                                        <span style={{ fontSize: "15px", fontWeight: 800, color: ORANGE }}>
                                            {item.price}<span style={{ fontSize: "12px", fontWeight: 400, opacity: 0.7 }}>/mo</span>
                                        </span>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.30)", textDecoration: "line-through" }}>
                                                {item.price}{item.freeMonthly ? "/mo" : ""}
                                            </span>
                                            <span style={{
                                                fontSize: "13px", fontWeight: 800, letterSpacing: "0.04em",
                                                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                                color: "#fff", padding: "3px 10px", borderRadius: "999px",
                                            }}>FREE</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        ))}

                        {/* Total row */}
                        <div style={{
                            background: "rgba(241,95,42,0.07)", borderTop: "1px solid rgba(241,95,42,0.20)",
                            padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
                            flexWrap: "wrap", gap: "16px",
                        }}>
                            <div>
                                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>
                                    Package Total
                                </p>
                                <p style={{
                                    fontSize: "clamp(30px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                                    background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                }}>
                                    $497<span style={{ fontSize: "18px", fontWeight: 400 }}>/mo</span>
                                </p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
                                <button
                                    onClick={acceptPackage}
                                    className="submit-btn"
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "10px",
                                        background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                        color: "#fff", fontWeight: 800, fontSize: "15px",
                                        padding: "14px 32px", borderRadius: "999px",
                                        border: "none", cursor: "pointer",
                                        boxShadow: "0 8px 32px rgba(241,95,42,0.35)",
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
            <section style={{ background: `linear-gradient(180deg, ${PEACH_LIGHT} 0%, ${PEACH_MID} 100%)`, padding: "80px 24px 80px", borderTop: `1px solid ${BORDER}` }}>
                <div style={{ maxWidth: "1060px", margin: "0 auto" }}>

                    {/* Section header */}
                    <div style={{ marginBottom: "48px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, display: "block", marginBottom: "12px" }}>
                            Or Build A Custom Plan
                        </span>
                        <h2 style={{
                            fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.03em",
                            color: DARK, margin: "0 0 10px", lineHeight: 1.1,
                        }}>
                            Select the services<br />you want to{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 55%, #5B8DEF 100%)",
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
                        <div className="service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
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
                        <div className="service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
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
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, display: "block", marginBottom: "12px" }}>
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
                                        <IoCheckmarkCircle size={15} color={ORANGE} style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.80)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 7px", flexShrink: 0 }}>
                                            {s.billing === "monthly" ? "monthly" : "one-time"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                                        {packageAccepted && PACKAGE_FREE_IDS.has(s.id) ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.30)", textDecoration: "line-through" }}>
                                                    {s.priceLabel}{s.billing === "monthly" ? "/mo" : ""}
                                                </span>
                                                <span style={{
                                                    fontSize: "12px", fontWeight: 800, letterSpacing: "0.04em",
                                                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                                    color: "#fff", padding: "2px 9px", borderRadius: "999px",
                                                }}>FREE</span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: "14px", fontWeight: 700, color: ORANGE }}>{s.priceLabel}{s.billing === "monthly" && s.price > 0 ? "/mo" : ""}</span>
                                        )}
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
                            <div className="total-grid" style={{
                                display: "grid", gridTemplateColumns: monthlyTotal > 0 && oneTimeTotal > 0 ? "1fr 1fr" : "1fr",
                                borderTop: "1px solid rgba(255,255,255,0.10)",
                            }}>
                                {monthlyTotal > 0 && (
                                    <div style={{ padding: "24px 24px", borderRight: monthlyTotal > 0 && oneTimeTotal > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                                        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 6px" }}>
                                            Monthly Total
                                        </p>
                                        <p style={{
                                            fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                                            background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                        }}>
                                            ${monthlyTotal.toLocaleString()}<span style={{ fontSize: "16px", fontWeight: 400 }}>/mo</span>
                                        </p>
                                    </div>
                                )}
                                {oneTimeTotal > 0 && (
                                    <div style={{ padding: "24px 24px" }}>
                                        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 6px" }}>
                                            One-Time Total
                                        </p>
                                        <p style={{
                                            fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0,
                                            background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }} className="form-row">
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
                                    className="input-field"
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
                                    className="input-field"
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
                            className="submit-btn"
                            style={{
                                width: "100%", padding: "18px 32px",
                                background: canSubmit ? "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)" : "rgba(255,255,255,0.08)",
                                border: "none", borderRadius: "12px",
                                color: canSubmit ? "#fff" : "rgba(255,255,255,0.30)",
                                fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                letterSpacing: "0.02em",
                                boxShadow: canSubmit ? "0 8px 32px rgba(241,95,42,0.28)" : "none",
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

            <style>{`
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr !important; } }
        .input-field:focus { border-color: rgba(241,95,42,0.60) !important; }
        .input-field::placeholder { color: rgba(255,255,255,0.20); }
      `}</style>

            <Footer7 />
        </>
    );
}
