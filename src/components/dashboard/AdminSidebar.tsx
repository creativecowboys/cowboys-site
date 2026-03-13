"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    }

    const navLink = (href: string, label: string, icon: string) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
            <Link
                href={href}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                    background: active ? "rgba(42,156,241,0.14)" : "transparent",
                    border: `1px solid ${active ? "rgba(42,156,241,0.3)" : "transparent"}`,
                    textDecoration: "none",
                    transition: "all 150ms ease",
                }}
            >
                <span style={{ fontSize: "15px" }}>{icon}</span>
                {label}
            </Link>
        );
    };

    return (
        <div
            style={{
                width: "210px",
                flexShrink: 0,
                borderRight: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                padding: "20px 14px",
                gap: "6px",
                position: "sticky",
                top: 0,
                height: "100dvh",
                overflowY: "auto",
            }}
        >
            {/* Logo */}
            <div style={{ paddingBottom: "16px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Image src="/Main%20logo%202.png" alt="Creative Cowboys" width={130} height={36} style={{ width: "130px", height: "auto" }} />
                <span style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(42,156,241,0.6)", marginTop: "6px" }}>
                    Admin Panel
                </span>
            </div>

            {/* Nav */}
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "8px 0 4px", paddingLeft: "4px" }}>
                Manage
            </p>
            {navLink("/admin", "Clients", "👥")}
            {navLink("/admin/clients/new", "Add Client", "＋")}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Views link */}
            <a
                href="/clients/login"
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textDecoration: "none", marginBottom: "4px" }}
            >
                <span>🔗</span> Client Portal
            </a>

            {/* Sign out */}
            <button
                id="admin-signout"
                onClick={handleLogout}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.35)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                }}
            >
                <span>↩</span> Sign Out
            </button>
        </div>
    );
}
