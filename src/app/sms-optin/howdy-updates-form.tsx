"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONSENT_TEXT } from "@/lib/howdy-sms/consent-text";

/* The Howdy update-texts sign-up. Optional, unchecked by default, and it saves a real consent
   record — see src/app/api/sms-consent/route.ts. Signing up does not start texts: a person
   matches the record to a client account first. The copy here says exactly that. */

const label: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.75)",
    margin: "0 0 6px",
    letterSpacing: "0.01em",
};

const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "16px", // 16px keeps iOS from zooming the page on focus
    color: "#ffffff",
    fontFamily: "inherit",
    outline: "none",
};

const linkStyle: React.CSSProperties = {
    color: "#F15F2A",
    textDecoration: "underline",
    textDecorationColor: "rgba(241,95,42,0.4)",
};

type Status = { kind: "idle" | "sending" | "done" | "error"; message?: string };

export default function HowdyUpdatesForm() {
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    // When the form appeared, for the server's "no human fills this out in 3 seconds" check.
    const openedAt = useRef<number | null>(null);
    useEffect(() => {
        openedAt.current = Date.now();
    }, []);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status.kind === "sending") return;
        setStatus({ kind: "sending" });

        const data = new FormData(event.currentTarget);
        try {
            const res = await fetch("/api/sms-consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(data.get("name") || ""),
                    business: String(data.get("business") || ""),
                    email: String(data.get("email") || ""),
                    mobile: String(data.get("mobile") || ""),
                    consent: data.get("consent") === "on",
                    website_url: String(data.get("website_url") || ""),
                    elapsed_ms: openedAt.current === null ? undefined : Date.now() - openedAt.current,
                }),
            });
            const payload = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
                setStatus({ kind: "error", message: payload.error || "That didn't save. Please try again." });
                return;
            }
            setStatus({ kind: "done" });
        } catch {
            setStatus({ kind: "error", message: "We couldn't reach the server. Please try again." });
        }
    }

    if (status.kind === "done") {
        return (
            <div
                role="status"
                style={{
                    background: "rgba(241,95,42,0.07)",
                    border: "1px solid rgba(241,95,42,0.30)",
                    borderRadius: "12px",
                    padding: "24px",
                    margin: "16px 0 8px",
                }}
            >
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px" }}>
                    Consent saved. Thank you.
                </p>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, margin: 0 }}>
                    We recorded your consent, the exact wording you agreed to, and the time you gave it. Howdy texts
                    are coming soon — messages will start after the program launches and we match your signup to your
                    client account. To withdraw consent before then, email{" "}
                    <a href="mailto:support@creativecowboys.co" style={linkStyle}>
                        support@creativecowboys.co
                    </a>
                    . Once messages start, reply <strong style={{ color: "#ffffff" }}>STOP</strong> to opt out or{" "}
                    <strong style={{ color: "#ffffff" }}>HELP</strong> for help.
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            noValidate={false}
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "24px",
                margin: "16px 0 8px",
                display: "grid",
                gap: "18px",
            }}
        >
            {/* Honeypot — hidden from people, catnip for bots. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                <label htmlFor="hu-website-url">Website</label>
                <input id="hu-website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
                <label htmlFor="hu-name" style={label}>
                    Your name
                </label>
                <input id="hu-name" name="name" type="text" required autoComplete="name" maxLength={120} style={field} />
            </div>

            <div>
                <label htmlFor="hu-business" style={label}>
                    Business / client name
                </label>
                <input
                    id="hu-business"
                    name="business"
                    type="text"
                    required
                    autoComplete="organization"
                    maxLength={200}
                    aria-describedby="hu-business-help"
                    style={field}
                />
                <p id="hu-business-help" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "8px 2px 0", lineHeight: 1.6 }}>
                    So we can match you to the right account before anything is switched on.
                </p>
            </div>

            <div>
                <label htmlFor="hu-email" style={label}>
                    Email
                </label>
                <input id="hu-email" name="email" type="email" required autoComplete="email" maxLength={200} style={field} />
            </div>

            <div>
                <label htmlFor="hu-mobile" style={label}>
                    Mobile number
                </label>
                <input
                    id="hu-mobile"
                    name="mobile"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="(470) 243-7517"
                    style={field}
                />
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <input
                    id="hu-consent"
                    name="consent"
                    type="checkbox"
                    required
                    style={{ width: "20px", height: "20px", marginTop: "2px", flexShrink: 0, accentColor: "#F15F2A" }}
                />
                <label htmlFor="hu-consent" style={{ fontSize: "14px", color: "rgba(255,255,255,0.70)", lineHeight: 1.7 }}>
                    {CONSENT_TEXT}
                </label>
            </div>

            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.7 }}>
                See our{" "}
                <Link href="/sms-terms" style={linkStyle}>
                    SMS Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" style={linkStyle}>
                    Privacy Policy
                </Link>
                . Your mobile number is never shared with third parties for marketing.
            </p>

            <div aria-live="polite" style={{ minHeight: status.kind === "error" ? undefined : 0 }}>
                {status.kind === "error" && (
                    <p style={{ fontSize: "14px", color: "#FF8A6B", margin: 0, lineHeight: 1.7 }}>{status.message}</p>
                )}
            </div>

            <div>
                <button
                    type="submit"
                    disabled={status.kind === "sending"}
                    style={{
                        background: "#F15F2A",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "14px 28px",
                        fontSize: "15px",
                        fontWeight: 700,
                        fontFamily: "inherit",
                        cursor: status.kind === "sending" ? "default" : "pointer",
                        opacity: status.kind === "sending" ? 0.6 : 1,
                    }}
                >
                    {status.kind === "sending" ? "Saving…" : "Sign me up for Howdy texts"}
                </button>
            </div>
        </form>
    );
}
