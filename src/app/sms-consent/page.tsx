import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";

export const metadata: Metadata = {
    title: "SMS Consent",
    description:
        "SMS consent disclosure for Creative Cowboys Media, LLC — what you agree to when you opt in to receive text messages related to your request or inquiry.",
    alternates: { canonical: "/sms-consent" },
    openGraph: {
        title: "SMS Consent | Creative Cowboys",
        description:
            "What you agree to when you opt in to receive text messages from Creative Cowboys Media, LLC.",
    },
};

/* ─── Reusable section divider ─────────────────────────────────── */
function Divider() {
    return (
        <hr
            style={{
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                margin: "48px 0",
            }}
        />
    );
}

/* ─── Section heading ───────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2
            style={{
                fontSize: "clamp(20px, 2.5vw, 26px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
            }}
        >
            {children}
        </h2>
    );
}

/* ─── Body text ─────────────────────────────────────────────────── */
const bodyStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 1.4vw, 16px)",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.8,
    margin: "0 0 16px",
};

/* ─── Internal link ─────────────────────────────────────────────── */
function ILink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            style={{ color: "#F15F2A", textDecoration: "underline", textDecorationColor: "rgba(241,95,42,0.4)" }}
        >
            {children}
        </Link>
    );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function SmsConsentPage() {
    return (
        <>
            <main
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #0a0908 0%, #140f0d 50%, #0a0908 100%)",
                    paddingTop: "36px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Grid texture */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                        pointerEvents: "none",
                    }}
                />

                {/* Glow orbs */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-10%",
                        left: "-5%",
                        width: "600px",
                        height: "600px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(241,95,42,0.10) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: "10%",
                        right: "-5%",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(234,81,255,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        maxWidth: "800px",
                        margin: "0 auto",
                        padding: "60px 24px 100px",
                    }}
                >
                    {/* Logo */}
                    <Link href="/" className="site-logo" style={{ display: "inline-block", marginBottom: "64px" }}>
                        <Image
                            src="/Main%20logo%202.png"
                            alt="Creative Cowboys"
                            width={160}
                            height={42}
                            priority
                            style={{ width: "160px", height: "auto" }}
                        />
                    </Link>

                    {/* Page header */}
                    <p
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#F15F2A",
                            marginBottom: "16px",
                        }}
                    >
                        Legal
                    </p>

                    <h1
                        style={{
                            fontSize: "clamp(36px, 5vw, 64px)",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.05,
                            color: "#ffffff",
                            margin: "0 0 16px",
                        }}
                    >
                        SMS{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Consent
                        </span>
                    </h1>

                    <p style={{ ...bodyStyle, marginBottom: "48px" }}>
                        <strong style={{ color: "rgba(255,255,255,0.40)", fontWeight: 500 }}>
                            Creative Cowboys Media, LLC
                        </strong>
                    </p>

                    {/* ── Consent statement ── */}
                    <SectionHeading>Consent to Receive Text Messages</SectionHeading>
                    <p style={bodyStyle}>
                        By providing your mobile number and checking this box (or confirming in our chat), you agree to
                        receive text messages from Creative Cowboys Media, LLC related to your request or inquiry —
                        including links, follow-ups, confirmations, and appointment or demo reminders. Message frequency
                        varies. Message and data rates may apply. Reply{" "}
                        <strong style={{ color: "#ffffff" }}>STOP</strong> to opt out,{" "}
                        <strong style={{ color: "#ffffff" }}>HELP</strong> for help (or contact{" "}
                        <a
                            href="mailto:support@creativecowboys.co"
                            style={{ color: "#F15F2A", textDecoration: "none" }}
                        >
                            support@creativecowboys.co
                        </a>{" "}
                        /{" "}
                        <a href="tel:+14702437517" style={{ color: "#F15F2A", textDecoration: "none" }}>
                            470-243-7517
                        </a>
                        ). Consent is not a condition of any purchase. See our{" "}
                        <ILink href="/privacy-policy">Privacy Policy</ILink> and{" "}
                        <ILink href="/sms-terms">SMS Terms</ILink>.
                    </p>

                    <Divider />

                    {/* ── Consent to Receive Client Lead Alerts ── */}
                    <SectionHeading>Consent to Receive Client Lead Alerts</SectionHeading>
                    <p style={bodyStyle}>
                        I agree to receive SMS text messages from Creative Cowboys about new leads and updates to my
                        account. Message and data rates may apply. Message frequency varies. Consent is not a condition of
                        any purchase or service. Reply <strong style={{ color: "#ffffff" }}>STOP</strong> to unsubscribe,{" "}
                        <strong style={{ color: "#ffffff" }}>HELP</strong> for help.
                    </p>

                    <Divider />

                    {/* ── Contact / Business Information ── */}
                    <SectionHeading>Contact &amp; Business Information</SectionHeading>
                    <div
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            padding: "24px",
                        }}
                    >
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
                            Creative Cowboys Media, LLC
                        </p>
                        <p style={{ ...bodyStyle, margin: "0 0 4px" }}>222 W Montgomery St, Villa Rica, GA 30180</p>
                        <p style={{ ...bodyStyle, margin: "0 0 4px" }}>
                            Email:{" "}
                            <a
                                href="mailto:support@creativecowboys.co"
                                style={{ color: "#F15F2A", textDecoration: "none" }}
                            >
                                support@creativecowboys.co
                            </a>
                        </p>
                        <p style={{ ...bodyStyle, margin: 0 }}>
                            Phone:{" "}
                            <a href="tel:+14702437517" style={{ color: "#F15F2A", textDecoration: "none" }}>
                                470-243-7517
                            </a>
                        </p>
                    </div>

                    <p
                        style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.25)",
                            marginTop: "48px",
                            textAlign: "center",
                        }}
                    >
                        © 2026 Creative Cowboys. All rights reserved.
                    </p>
                </div>

                <FloatingNav />
            </main>

            <Footer7 />
        </>
    );
}
