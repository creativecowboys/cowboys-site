"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    IoSearchOutline,
    IoLogOutOutline,
} from "react-icons/io5";

interface NavLink {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

function getNavLinks(slug: string): NavLink[] {
    return [
        { label: "SEO Report", href: `/clients/${slug}/seo`, icon: IoSearchOutline },
    ];
}

export default function DashboardSidebar({ slug }: { slug: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const navLinks = getNavLinks(slug);

    return (
        <aside
            style={{
                width: "240px",
                minHeight: "100dvh",
                background: "rgba(255,255,255,0.03)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                flexDirection: "column",
                padding: "24px 16px",
                flexShrink: 0,
                position: "sticky",
                top: 0,
                height: "100dvh",
                overflowY: "auto",
            }}
        >
            {/* Logo */}
            <a href="/" style={{ display: "block", marginBottom: "32px", paddingLeft: "8px" }}>
                <Image
                    src="/Main%20logo%202.png"
                    alt="Creative Cowboys"
                    width={130}
                    height={36}
                    style={{ width: "130px", height: "auto" }}
                />
            </a>

            {/* Client info */}
            <div
                style={{
                    background: "rgba(241,95,42,0.08)",
                    border: "1px solid rgba(241,95,42,0.18)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "28px",
                }}
            >
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(241,95,42,0.8)", margin: "0 0 2px" }}>
                    Client Portal
                </p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>
                    {session?.user?.name || "Client"}
                </p>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 8px", paddingLeft: "12px" }}>
                    Reports
                </p>
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                fontSize: "14px",
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                                background: isActive ? "rgba(241,95,42,0.15)" : "transparent",
                                border: isActive ? "1px solid rgba(241,95,42,0.25)" : "1px solid transparent",
                                textDecoration: "none",
                                transition: "all 180ms ease",
                            }}
                        >
                            <link.icon size={16} style={{ flexShrink: 0, color: isActive ? "#F15F2A" : "inherit" }} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out */}
            <button
                id="dashboard-signout"
                onClick={() => signOut({ callbackUrl: "/clients/login" })}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    transition: "all 180ms ease",
                    marginTop: "16px",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget).style.color = "rgba(255,255,255,0.7)";
                    (e.currentTarget).style.borderColor = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget).style.color = "rgba(255,255,255,0.35)";
                    (e.currentTarget).style.borderColor = "rgba(255,255,255,0.07)";
                }}
            >
                <IoLogOutOutline size={16} style={{ flexShrink: 0 }} />
                Sign Out
            </button>
        </aside>
    );
}
