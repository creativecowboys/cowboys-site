"use client";

import Link from "next/link";

interface ServiceCardProps {
    label: string;
    emoji: string;
    description: string;
    color: string;
    href: string;
}

export default function ServiceCard({ label, emoji, description, color, href }: ServiceCardProps) {
    return (
        <Link href={href} style={{ textDecoration: "none" }}>
            <div
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "border-color 200ms ease, background 200ms ease, transform 150ms ease",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget).style.borderColor = `${color}40`;
                    (e.currentTarget).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget).style.transform = "translateY(0)";
                }}
            >
                <div
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: `${color}18`,
                        border: `1px solid ${color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        marginBottom: "16px",
                    }}
                >
                    {emoji}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                    {label}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "0 0 16px", lineHeight: 1.5 }}>
                    {description}
                </p>
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: color,
                        letterSpacing: "0.04em",
                    }}
                >
                    View Report →
                </span>
            </div>
        </Link>
    );
}
