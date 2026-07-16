import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";

export const metadata: Metadata = {
    title: "SMS Opt-In",
    description:
        "How consumers and Creative Cowboys clients opt in to receive text messages from Creative Cowboys Media, LLC — the opt-in flow, consent language, and program details.",
    alternates: { canonical: "/sms-optin" },
    openGraph: {
        title: "SMS Opt-In | Creative Cowboys",
        description:
            "How you opt in to receive text messages from Creative Cowboys Media, LLC — opt-in flow, consent language, and program details.",
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

/* ─── Sub-heading ───────────────────────────────────────────────── */
function SubHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3
            style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#F15F2A",
                margin: "32px 0 12px",
                letterSpacing: "0.01em",
            }}
        >
            {children}
        </h3>
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

/* ─── Captioned opt-in screenshot figure ───────────────────────── */
function OptInFigure({
    src,
    alt,
    width,
    height,
    caption,
}: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
}) {
    return (
        <figure style={{ margin: "16px 0 8px" }}>
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#ffffff",
                }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    style={{ width: "100%", height: "auto", display: "block" }}
                />
            </div>
            <figcaption
                style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.45)",
                    margin: "10px 2px 0",
                    lineHeight: 1.6,
                }}
            >
                {caption}
            </figcaption>
        </figure>
    );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
   Client Lead Alerts opt-in documented with real onboarding screenshots
   (public/images/sms/). Consumer "Inquiry Messages" opt-in described in
   text; add a screenshot there later if needed.
══════════════════════════════════════════════════════════════════ */
export default function SmsOptInPage() {
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
                            Opt-In
                        </span>
                    </h1>

                    <p style={{ ...bodyStyle, marginBottom: "48px" }}>
                        <strong style={{ color: "rgba(255,255,255,0.40)", fontWeight: 500 }}>
                            Creative Cowboys Media, LLC
                        </strong>
                    </p>

                    {/* ── Overview ── */}
                    <SectionHeading>How Opt-In Works</SectionHeading>
                    <p style={bodyStyle}>
                        Creative Cowboys Media, LLC operates two text message programs. Opt-in is always affirmative —
                        you provide your mobile number and give consent before we ever text you. This page documents how
                        each opt-in flow works.
                    </p>

                    <Divider />

                    {/* ── Program (a): Client Lead Alerts ── */}
                    <SectionHeading>Client Lead Alerts (for Creative Cowboys clients)</SectionHeading>
                    <p style={bodyStyle}>
                        If you are a Creative Cowboys client, you can opt in to receive a text alert whenever a lead
                        submits a web form on your website, so you can follow up quickly.
                    </p>

                    <SubHeading>Step 1 — Consent during onboarding</SubHeading>
                    <p style={bodyStyle}>
                        During account onboarding, the client enters their business details and a lead-alert phone number,
                        then checks a non-pre-checked box to agree to receive SMS lead alerts. The consent language is
                        shown directly next to the checkbox.
                    </p>
                    <OptInFigure
                        src="/images/sms/optin-onboarding-form.jpeg"
                        alt="Creative Cowboys client onboarding form with a lead-alert phone field and an unchecked SMS consent checkbox"
                        width={1600}
                        height={911}
                        caption="Onboarding form — the client provides their lead-alert phone number and checks the SMS consent box (unchecked by default). Consent text: “I agree to receive SMS text messages from Creative Cowboys about new leads and updates to my account. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe, HELP for help.”"
                    />

                    <SubHeading>Step 2 — Turning on SMS in Notifications</SubHeading>
                    <p style={bodyStyle}>
                        The client can also enable, confirm, or turn off SMS alerts anytime from the{" "}
                        <strong style={{ color: "#ffffff" }}>Notifications</strong> tab in their dashboard. They enter
                        their mobile number and tap <strong style={{ color: "#ffffff" }}>&ldquo;I agree — turn on&rdquo;</strong>{" "}
                        to confirm consent. Alerts stay <strong style={{ color: "#ffffff" }}>Off</strong> until the client
                        explicitly turns them on.
                    </p>
                    <OptInFigure
                        src="/images/sms/optin-notifications.jpeg"
                        alt="Client dashboard Notifications settings showing a Text messages (SMS) card set to Off with a phone field, consent language, and an 'I agree — turn on' button"
                        width={1600}
                        height={900}
                        caption="Notifications settings — SMS defaults to Off. The client enters their number and taps “I agree — turn on” to opt in. The same consent language and STOP/HELP instructions are shown."
                    />

                    <SubHeading>Consent language shown at opt-in</SubHeading>
                    <p style={bodyStyle}>
                        &ldquo;By providing your mobile number and checking the box, you agree to receive text messages
                        from Creative Cowboys Media, LLC alerting you when a lead submits a web form on your website.
                        Message frequency depends on your form volume. Message and data rates may apply. Reply STOP to opt
                        out, HELP for help. Consent is not a condition of any purchase or service.&rdquo;
                    </p>

                    <Divider />

                    {/* ── Program (b): Inquiry Messages ── */}
                    <SectionHeading>Inquiry Messages (for website visitors)</SectionHeading>
                    <p style={bodyStyle}>
                        When you provide your mobile number and opt in through our website, our AI chat/voice agent, or a
                        form, we send the informational messages you request — links, follow-ups, confirmations, and
                        appointment or demo reminders related to your inquiry.
                    </p>

                    <SubHeading>Opt-in steps</SubHeading>
                    <p style={bodyStyle}>
                        A website visitor opts in by entering their mobile number in a form on our website or by
                        confirming in our AI chat/voice agent, and giving affirmative consent (checking a non-pre-checked
                        box or confirming in the chat). We only send the messages the visitor requested. Opt-in is never a
                        condition of any purchase.
                    </p>

                    <SubHeading>Consent language shown at opt-in</SubHeading>
                    <p style={bodyStyle}>
                        &ldquo;By providing your mobile number and checking this box (or confirming in our chat), you
                        agree to receive text messages from Creative Cowboys Media, LLC related to your request or
                        inquiry. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP
                        for help. Consent is not a condition of any purchase.&rdquo;
                    </p>

                    <Divider />

                    {/* ── Frequency, rates, opt-out ── */}
                    <SectionHeading>Frequency, Rates &amp; Opt-Out</SectionHeading>
                    <p style={bodyStyle}>
                        Message frequency varies by program and your activity. Message and data rates may apply. You can
                        opt out at any time by replying <strong style={{ color: "#ffffff" }}>STOP</strong>, or get help by
                        replying <strong style={{ color: "#ffffff" }}>HELP</strong> — or contact us at{" "}
                        <a href="mailto:support@creativecowboys.co" style={{ color: "#F15F2A", textDecoration: "none" }}>
                            support@creativecowboys.co
                        </a>{" "}
                        /{" "}
                        <a href="tel:+14702437517" style={{ color: "#F15F2A", textDecoration: "none" }}>
                            470-243-7517
                        </a>
                        .
                    </p>
                    <p style={bodyStyle}>
                        For full details, see our <ILink href="/sms-terms">SMS Terms &amp; Conditions</ILink>,{" "}
                        <ILink href="/sms-consent">SMS Consent</ILink>, and{" "}
                        <ILink href="/privacy-policy">Privacy Policy</ILink>.
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
