"use client";

import React from "react";
import Image from "next/image";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
} from "react-icons/fa";

/* ── Types ──────────────────────────────────────────────────── */
interface Footer7Props {
    sections?: Array<{
        title: string;
        links: Array<{ name: string; href: string }>;
    }>;
    description?: string;
    socialLinks?: Array<{
        icon: React.ReactElement;
        href: string;
        label: string;
    }>;
    copyright?: string;
    legalLinks?: Array<{ name: string; href: string }>;
}

/* ── Default data — placeholder links as requested ─────────── */
const defaultSections: Footer7Props["sections"] = [
    {
        title: "Services",
        links: [
            { name: "Web Design", href: "/web-design" },
            { name: "SEO", href: "#" },
            { name: "PPC Advertising", href: "#" },
            { name: "Social Media Ads", href: "#" },
            { name: "Media Creation", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About Us", href: "#" },
            { name: "Our Work", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Careers", href: "#" },
        ],
    },
    {
        title: "Contact",
        links: [
            { name: "Get In Touch", href: "#" },
            { name: "Free Consultation", href: "#" },
            { name: "Support", href: "#" },
            { name: "FAQs", href: "#" },
        ],
    },
];

const defaultSocialLinks: Footer7Props["socialLinks"] = [
    { icon: <FaInstagram size={18} />, href: "#", label: "Instagram" },
    { icon: <FaFacebook size={18} />, href: "#", label: "Facebook" },
    { icon: <FaTwitter size={18} />, href: "#", label: "Twitter" },
    { icon: <FaLinkedin size={18} />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks: Footer7Props["legalLinks"] = [
    { name: "Terms and Conditions", href: "#" },
    { name: "Privacy Policy", href: "#" },
];

const ORANGE = "#F15F2A";

/* ── Component ──────────────────────────────────────────────── */
export const Footer7 = ({
    sections = defaultSections,
    description = "Creative Cowboys Media is a full-service digital agency helping brands grow online through stunning design, smart strategy, and relentless execution.",
    socialLinks = defaultSocialLinks,
    copyright = `© ${new Date().getFullYear()} Creative Cowboys Media. All rights reserved.`,
    legalLinks = defaultLegalLinks,
}: Footer7Props) => {
    return (
        <footer
            style={{
                backgroundColor: "#F8F7F4",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                width: "100%",
                color: "#1a1a1a",
                fontFamily: "var(--font-geist-sans, sans-serif)",
            }}
        >
            <div
                style={{
                    maxWidth: "1160px",
                    margin: "0 auto",
                    padding: "72px 24px 0",
                }}
            >
                {/* ── Top row: brand + nav columns ── */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "48px",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Brand column */}
                    <div style={{ flex: "1 1 260px", maxWidth: "320px" }}>
                        {/* Logo — same PNG as hero, no filter so orange stays orange */}
                        <a href="/" style={{ display: "inline-block", marginBottom: "20px" }}>
                            <Image
                                src="/logo.png"
                                alt="Creative Cowboys Media"
                                width={180}
                                height={48}
                                style={{
                                    width: "180px",
                                    height: "auto",
                                }}
                            />
                        </a>

                        {/* Description */}
                        <p
                            style={{
                                fontSize: "14px",
                                lineHeight: 1.75,
                                color: "rgba(0,0,0,0.50)",
                                marginBottom: "28px",
                            }}
                        >
                            {description}
                        </p>

                        {/* Address */}
                        <p
                            style={{
                                fontSize: "13px",
                                color: "rgba(0,0,0,0.38)",
                                lineHeight: 1.6,
                                marginBottom: "24px",
                            }}
                        >
                            222 West Montgomery St.<br />
                            Villa Rica, GA 30180
                        </p>

                        {/* Social icons */}
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            {socialLinks!.map((social, idx) => (
                                <SocialIcon key={idx} {...social} />
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    <div
                        style={{
                            flex: "2 1 500px",
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "32px",
                        }}
                    >
                        {sections!.map((section, si) => (
                            <div key={si}>
                                <h3
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        color: ORANGE,
                                        marginBottom: "20px",
                                    }}
                                >
                                    {section.title}
                                </h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {section.links.map((link, li) => (
                                        <NavLink key={li} {...link} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bottom legal row ── */}
                <div
                    style={{
                        marginTop: "64px",
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        padding: "24px 0",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.35)", margin: 0 }}>
                        {copyright}
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: "24px" }}>
                        {legalLinks!.map((link, idx) => (
                            <li key={idx}>
                                <a
                                    href={link.href}
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(0,0,0,0.35)",
                                        textDecoration: "none",
                                        transition: "color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = ORANGE)}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,0,0,0.35)")}
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

/* ── Sub-components ─────────────────────────────────────────── */
function NavLink({ name, href }: { name: string; href: string }) {
    const [hovered, setHovered] = React.useState(false);
    return (
        <li>
            <a
                href={href}
                style={{
                    fontSize: "14px",
                    color: hovered ? ORANGE : "rgba(0,0,0,0.50)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {name}
            </a>
        </li>
    );
}

function SocialIcon({
    icon,
    href,
    label,
}: {
    icon: React.ReactElement;
    href: string;
    label: string;
}) {
    const [hovered, setHovered] = React.useState(false);
    return (
        <a
            href={href}
            aria-label={label}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: `1px solid ${hovered ? ORANGE : "rgba(0,0,0,0.15)"}`,
                color: hovered ? ORANGE : "rgba(0,0,0,0.45)",
                background: hovered ? ORANGE + "12" : "transparent",
                transition: "all 0.2s ease",
                textDecoration: "none",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {icon}
        </a>
    );
}
