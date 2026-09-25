"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
    return <Suspense fallback={null}><LoginCard /></Suspense>;
}

function LoginCard() {
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const expired = params.get("expired") === "1";

    // Email-only sign-in: the server emails a one-time link to team addresses. The reply is the same
    // whether or not the address is on the team, so nothing here confirms who is on the list.
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const next = params.get("next") || "";
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, next }),
        }).catch(() => null);
        setLoading(false);
        if (!res) { setError("Could not reach the site. Check your connection and try again."); return; }
        if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Could not send the sign-in link."); return; }
        setSent(true);
    }

    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0D0D0F",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Subtle glows */}
            <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "400px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(42,156,241,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(241,95,42,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Logo */}
            <Link href="/" style={{ display: "block", marginBottom: "36px" }}>
                <Image src="/Main%20logo%202.png" alt="Creative Cowboys" width={150} height={42} priority style={{ width: "150px", height: "auto" }} />
            </Link>

            {/* Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "20px",
                    padding: "32px",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
                }}
            >
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(42,156,241,0.8)", marginBottom: "6px" }}>
                        Admin Access
                    </span>
                    <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                        Control Panel
                    </h1>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                        Sales desk, onboarding &amp; client reporting
                    </p>
                </div>

                {sent ? (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6 }}>
                        <p style={{ margin: "0 0 8px", color: "#fff", fontWeight: 700 }}>Check your email</p>
                        <p style={{ margin: 0 }}>If <b>{email}</b> is on the team, a sign-in link is on its way. It works once and expires in 15 minutes.</p>
                        <button type="button" onClick={() => { setSent(false); setError(""); }} style={{ marginTop: "18px", background: "none", border: "none", color: "rgba(42,156,241,0.9)", fontSize: "13px", cursor: "pointer" }}>Use a different address</button>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {expired && !error && (
                        <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: "#fde68a", textAlign: "center" }}>
                            That link has expired or was already used. Request a new one.
                        </div>
                    )}
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>
                            Work email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@creativecowboys.co"
                            style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 200ms ease" }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(42,156,241,0.5)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                    </div>

                    {error && (
                        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: "#fca5a5", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <button
                        id="admin-login-submit"
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "12px 20px", borderRadius: "10px", border: "none", background: loading ? "rgba(42,156,241,0.3)" : "linear-gradient(135deg, #2A9CF1 0%, #92A6DB 100%)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(42,156,241,0.30)" }}
                    >
                        {loading ? "Sending…" : "Email me a sign-in link"}
                    </button>
                </form>
                )}
            </div>
        </div>
    );
}
