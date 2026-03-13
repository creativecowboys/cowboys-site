"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Incorrect username or password. Please try again.");
        } else {
            // If callbackUrl points to a /clients page, use it; otherwise derive from slug
            if (callbackUrl && callbackUrl.startsWith("/clients/")) {
                router.push(callbackUrl);
            } else {
                router.push(`/clients/${username}`);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
                <label
                    htmlFor="username"
                    style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}
                >
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-business-name"
                    required
                    autoComplete="username"
                    style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "15px",
                        color: "#fff",
                        outline: "none",
                        transition: "border-color 200ms ease",
                        boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(241,95,42,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "15px",
                        color: "#fff",
                        outline: "none",
                        transition: "border-color 200ms ease",
                        boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(241,95,42,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
            </div>

            {error && (
                <div
                    style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "13px",
                        color: "#fca5a5",
                        textAlign: "center",
                    }}
                >
                    {error}
                </div>
            )}

            <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "13px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: loading
                        ? "rgba(241,95,42,0.4)"
                        : "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    letterSpacing: "0.02em",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "opacity 200ms ease, transform 150ms ease",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(241,95,42,0.35)",
                }}
                onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.opacity = "0.88"; }}
                onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.opacity = "1"; }}
            >
                {loading ? "Signing in…" : "Sign In"}
            </button>
        </form>
    );
}

export default function ClientLoginPage() {
    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                background: "#0D0D0F",
                padding: "24px",
            }}
        >
            {/* Subtle glow effects */}
            <div
                style={{
                    position: "absolute",
                    top: "-20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "600px",
                    height: "500px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(241,95,42,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-10%",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(234,81,255,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            {/* Logo */}
            <a href="/" style={{ display: "block", marginBottom: "36px" }}>
                <Image
                    src="/Main%20logo%202.png"
                    alt="Creative Cowboys"
                    width={160}
                    height={44}
                    priority
                    style={{ width: "160px", height: "auto" }}
                />
            </a>

            {/* Login Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "20px",
                    padding: "36px",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 48px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
                }}
            >
                <div style={{ marginBottom: "28px", textAlign: "center" }}>
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#fff",
                            margin: "0 0 6px",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Client Portal
                    </h1>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                        Sign in to view your reports
                    </p>
                </div>

                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </div>

            {/* Footer note */}
            <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                Need help?{" "}
                <a
                    href="mailto:howdy@creativecowboys.co"
                    style={{ color: "rgba(241,95,42,0.7)", textDecoration: "none" }}
                >
                    howdy@creativecowboys.co
                </a>
            </p>
        </div>
    );
}
