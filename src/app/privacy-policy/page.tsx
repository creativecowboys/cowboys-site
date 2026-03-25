import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";

export const metadata: Metadata = {
    title: "Privacy Policy | Creative Cowboys",
    description:
        "Learn how Creative Cowboys collects, uses, and protects your personal information. We believe in plain-English transparency about our data practices.",
    alternates: { canonical: "/privacy-policy" },
    openGraph: {
        title: "Privacy Policy | Creative Cowboys",
        description:
            "How Creative Cowboys collects, uses, and protects your personal information.",
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

/* ─── Unordered list ────────────────────────────────────────────── */
function BulletList({ items }: { items: string[] }) {
    return (
        <ul style={{ margin: "0 0 16px", paddingLeft: "20px" }}>
            {items.map((item, i) => (
                <li key={i} style={{ ...bodyStyle, margin: "0 0 8px" }}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

/* ─── External link ─────────────────────────────────────────────── */
function XLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#F15F2A", textDecoration: "underline", textDecorationColor: "rgba(241,95,42,0.4)" }}
        >
            {children}
        </a>
    );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function PrivacyPolicyPage() {
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
                        Privacy{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Policy
                        </span>
                    </h1>

                    <p style={{ ...bodyStyle, marginBottom: "48px" }}>
                        <strong style={{ color: "rgba(255,255,255,0.40)", fontWeight: 500 }}>
                            Last Updated: March 25, 2026
                        </strong>
                    </p>

                    {/* ── 1. Introduction ── */}
                    <SectionHeading>1. Introduction</SectionHeading>
                    <p style={bodyStyle}>
                        Welcome to Creative Cowboys. We are a digital marketing agency based in West Georgia, USA,
                        offering services including digital marketing, AI Chat &amp; Voice services, web design, and
                        advertising management.
                    </p>
                    <p style={bodyStyle}>
                        This Privacy Policy explains what information we collect, how we use it, who we share it with,
                        and what rights you have over your data. We&rsquo;ve written it in plain English because we
                        believe you deserve to actually understand it.
                    </p>
                    <p style={bodyStyle}>
                        By visiting our website at{" "}
                        <XLink href="https://creativecowboys.co">creativecowboys.co</XLink> or submitting any form or
                        inquiry to us, you agree to the practices described in this policy.
                    </p>

                    <Divider />

                    {/* ── 2. Information We Collect ── */}
                    <SectionHeading>2. Information We Collect</SectionHeading>
                    <p style={bodyStyle}>
                        We collect information in two main ways: directly from you, and automatically through your use
                        of our website.
                    </p>

                    <SubHeading>Information You Give Us Directly</SubHeading>
                    <p style={bodyStyle}>
                        When you fill out a contact form, lead form, or inquiry on our website or through any of our
                        marketing funnels, we may collect:
                    </p>
                    <BulletList
                        items={[
                            "Your name",
                            "Email address",
                            "Phone number",
                            "Business name and industry",
                            "Any other details you include in your message",
                        ]}
                    />
                    <p style={bodyStyle}>
                        We only collect what&rsquo;s necessary to respond to your inquiry and provide our services.
                    </p>

                    <SubHeading>Information We Collect Automatically</SubHeading>
                    <p style={bodyStyle}>
                        When you visit our website, certain data is collected automatically through cookies, pixels, and
                        standard web analytics tools. This may include:
                    </p>
                    <BulletList
                        items={[
                            "IP address",
                            "Browser type and version",
                            "Device type and operating system",
                            "Pages visited and time spent on each page",
                            "Referring URL (how you found us)",
                            "Clicks and interactions on our site",
                        ]}
                    />
                    <p style={bodyStyle}>
                        This data is collected through tools including the Meta Pixel and Google Analytics (described in
                        more detail below).
                    </p>

                    <Divider />

                    {/* ── 3. How We Use Your Information ── */}
                    <SectionHeading>3. How We Use Your Information</SectionHeading>
                    <p style={bodyStyle}>We use the information we collect for the following purposes:</p>
                    <BulletList
                        items={[
                            "To respond to your inquiries — If you reach out to us, we'll use your contact details to get back to you.",
                            "To provide our services — If you become a client, we use your information to manage your account and deliver our marketing, web design, or AI services.",
                            "To run and optimize advertising campaigns — We use data collected through our website and tools like the Meta Pixel to run targeted ad campaigns on behalf of our clients and our own business.",
                            "To improve our website and services — Analytics data helps us understand what's working and what isn't so we can make things better.",
                            "To follow up with leads — If you've expressed interest in our services, we may contact you by email or phone to continue that conversation.",
                            "To comply with legal obligations — Where required by law, we may need to retain or disclose certain information.",
                        ]}
                    />
                    <p
                        style={{
                            ...bodyStyle,
                            color: "#F15F2A",
                            fontWeight: 600,
                        }}
                    >
                        We do not sell your personal information to third parties. Ever.
                    </p>

                    <Divider />

                    {/* ── 4. Meta / Facebook ── */}
                    <SectionHeading>4. Meta / Facebook Data Usage</SectionHeading>
                    <p style={bodyStyle}>
                        As a digital marketing agency, we work extensively with Meta&rsquo;s advertising platform
                        (Facebook and Instagram). Here&rsquo;s exactly how that works and what it means for your data.
                    </p>

                    <SubHeading>Meta Pixel</SubHeading>
                    <p style={bodyStyle}>
                        Our website uses the Meta Pixel, a tracking tool provided by Meta Platforms, Inc. The Meta
                        Pixel collects data about actions taken on our website — such as page views, button clicks, and
                        form submissions — and sends that data to Meta. This helps us:
                    </p>
                    <BulletList
                        items={[
                            "Measure the effectiveness of our Facebook and Instagram ads",
                            "Build custom audiences for retargeting",
                            "Optimize ad delivery to people most likely to be interested in our services",
                        ]}
                    />
                    <p style={bodyStyle}>
                        The Meta Pixel may set cookies on your device. You can learn more about how Meta uses this data
                        at{" "}
                        <XLink href="https://www.facebook.com/privacy/policy">
                            facebook.com/privacy/policy
                        </XLink>
                        .
                    </p>

                    <SubHeading>Meta Marketing API</SubHeading>
                    <p style={bodyStyle}>
                        We use the Meta Marketing API to manage and run advertising campaigns — both for Creative
                        Cowboys and on behalf of our clients. Through this API, we may access:
                    </p>
                    <BulletList
                        items={[
                            "Ad account data, campaign performance metrics, and audience insights tied to client ad accounts",
                            "Aggregated and anonymized audience data used to build and target ad audiences",
                        ]}
                    />
                    <p style={bodyStyle}>
                        We access this data only to the extent necessary to manage advertising campaigns. We do not use
                        client ad account data for any purpose outside of the services we&rsquo;ve been hired to
                        provide.
                    </p>
                    <p style={bodyStyle}>
                        We operate as a Meta Business Partner and handle all Meta platform data in compliance with
                        Meta&rsquo;s Platform Terms and Developer Policies.
                    </p>

                    <Divider />

                    {/* ── 5. Third-Party Services ── */}
                    <SectionHeading>5. Third-Party Services</SectionHeading>
                    <p style={bodyStyle}>
                        We use a small set of trusted third-party tools to run our business. Here&rsquo;s who they are
                        and what they do:
                    </p>

                    {/* Service cards */}
                    {[
                        {
                            name: "GoHighLevel",
                            desc: "We use GoHighLevel as our CRM and marketing automation platform. Contact information you submit through our forms may be stored and managed in GoHighLevel.",
                            url: "https://www.gohighlevel.com/privacy-policy",
                            urlLabel: "Privacy Policy",
                        },
                        {
                            name: "Meta (Facebook & Instagram)",
                            desc: "We use Meta's advertising tools and APIs. Meta may collect data through the Meta Pixel placed on our website.",
                            url: "https://www.facebook.com/privacy/policy",
                            urlLabel: "Privacy Policy",
                        },
                        {
                            name: "Google Analytics",
                            desc: "We use Google Analytics to understand how visitors use our website. This data is aggregated and does not identify you personally.",
                            url: "https://policies.google.com/privacy",
                            urlLabel: "Privacy Policy",
                        },
                    ].map((s) => (
                        <div
                            key={s.name}
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "12px",
                                padding: "20px 24px",
                                marginBottom: "12px",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#ffffff",
                                    margin: "0 0 6px",
                                }}
                            >
                                {s.name}
                            </p>
                            <p style={{ ...bodyStyle, margin: "0 0 8px", fontSize: "14px" }}>{s.desc}</p>
                            <XLink href={s.url}>{s.urlLabel} →</XLink>
                        </div>
                    ))}

                    <Divider />

                    {/* ── 6. Data Retention ── */}
                    <SectionHeading>6. Data Retention</SectionHeading>
                    <p style={bodyStyle}>
                        We retain your personal information only as long as necessary to fulfill the purposes described
                        in this policy or as required by law.
                    </p>
                    <BulletList
                        items={[
                            "Lead and contact information is retained for as long as there is an active relationship or legitimate business interest.",
                            "Website analytics data is retained according to the settings and policies of those respective platforms.",
                            "Client data is retained for the duration of the client relationship and for a reasonable period afterward.",
                        ]}
                    />
                    <p style={bodyStyle}>When data is no longer needed, we delete it securely.</p>

                    <Divider />

                    {/* ── 7. Your Rights ── */}
                    <SectionHeading>7. Your Rights</SectionHeading>
                    <p style={bodyStyle}>You have rights over your personal data:</p>
                    <BulletList
                        items={[
                            "Right to Access — Ask us what personal information we hold about you.",
                            "Right to Correction — Ask us to correct inaccurate or incomplete information.",
                            "Right to Deletion — Ask us to delete your personal data.",
                            "Right to Opt Out of Marketing — Let us know and we'll remove you from our contact list immediately.",
                            "Right to Data Portability — Request a copy of your data in a readable format.",
                        ]}
                    />
                    <p style={bodyStyle}>
                        To exercise any of these rights, contact us at{" "}
                        <a
                            href="mailto:support@creativecowboys.co"
                            style={{ color: "#F15F2A", textDecoration: "underline", textDecorationColor: "rgba(241,95,42,0.4)" }}
                        >
                            support@creativecowboys.co
                        </a>
                        . We&rsquo;ll respond within 30 days.
                    </p>
                    <p style={bodyStyle}>
                        California residents may have additional rights under the CCPA. We do not sell personal
                        information, which means many CCPA rights are satisfied by default.
                    </p>

                    <Divider />

                    {/* ── 8. Cookies ── */}
                    <SectionHeading>8. Cookies Policy</SectionHeading>
                    <p style={bodyStyle}>
                        Our website uses cookies to improve your experience and enable key features.
                    </p>

                    {/* Cookie table */}
                    <div
                        style={{
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            marginBottom: "20px",
                        }}
                    >
                        {[
                            {
                                type: "Essential Cookies",
                                purpose: "Required for the website to function. Cannot be disabled.",
                            },
                            {
                                type: "Analytics Cookies",
                                purpose: "Help us understand how visitors use the site (via Google Analytics).",
                            },
                            {
                                type: "Marketing / Tracking Cookies",
                                purpose: "Used by the Meta Pixel to support ad targeting and campaign measurement.",
                            },
                        ].map((row, i) => (
                            <div
                                key={row.type}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 2fr",
                                    padding: "14px 20px",
                                    borderBottom:
                                        i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                    background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                                    gap: "16px",
                                }}
                            >
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                                    {row.type}
                                </span>
                                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                                    {row.purpose}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p style={bodyStyle}>
                        You can control and delete cookies through your browser settings. You can also opt out of
                        interest-based advertising from Meta at{" "}
                        <XLink href="https://www.facebook.com/ads/preferences">
                            facebook.com/ads/preferences
                        </XLink>{" "}
                        and from Google at{" "}
                        <XLink href="https://adssettings.google.com">adssettings.google.com</XLink>.
                    </p>

                    <Divider />

                    {/* ── 9. Security ── */}
                    <SectionHeading>9. Security</SectionHeading>
                    <p style={bodyStyle}>
                        We take reasonable technical and organizational measures to protect your data from unauthorized
                        access, loss, or misuse. No method of transmission over the internet is 100% secure. If you
                        believe your data has been compromised, please contact us immediately.
                    </p>

                    <Divider />

                    {/* ── 10. Changes ── */}
                    <SectionHeading>10. Changes to This Policy</SectionHeading>
                    <p style={bodyStyle}>
                        We may update this Privacy Policy from time to time. When we do, we&rsquo;ll update the
                        &ldquo;Last Updated&rdquo; date at the top of this page. Continued use of our website after
                        changes are posted means you accept the updated terms.
                    </p>

                    <Divider />

                    {/* ── 11. Contact ── */}
                    <SectionHeading>11. Contact Us</SectionHeading>
                    <div
                        style={{
                            background: "rgba(241,95,42,0.06)",
                            border: "1px solid rgba(241,95,42,0.20)",
                            borderRadius: "12px",
                            padding: "24px 28px",
                        }}
                    >
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
                            Creative Cowboys
                        </p>
                        <p style={{ ...bodyStyle, margin: "0 0 4px" }}>West Georgia, USA</p>
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
                            Website:{" "}
                            <XLink href="https://creativecowboys.co">creativecowboys.co</XLink>
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
