"use client";

import React, { useEffect, useRef, useState } from "react";
import { BUSINESS_TYPES, SOURCE, type Phase } from "@/lib/giveaway";
import { validateEntry } from "@/lib/giveaway";
import { gaEvent, trackFb } from "@/lib/analytics";
import { GIVEAWAY_CLOSED_EVENT } from "./events";
import { markEntered, useHasEntered } from "./useEntered";

const SELECT_ARROW =
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const ERRORS: Record<string, string> = {
    name: "Please enter your name.",
    email: "Please enter a valid email — it's how we confirm your entry.",
    phone: "Please enter a phone number — we call the winner.",
    city_state: "Where's the business located?",
    business_name: "Please enter your business name.",
    business_type: "Pick the closest match.",
    consent: "Please check the box to enter.",
};

const EMPTY = {
    name: "",
    email: "",
    phone: "",
    city_state: "",
    business_name: "",
    business_type: "",
    website: "",
};

type Status = "idle" | "sending" | "done" | "already" | "closed" | "error";

export default function EntryForm({ phase, instagramUrl }: { phase: Phase; instagramUrl?: string }) {
    const [form, setForm] = useState(EMPTY);
    const [consent, setConsent] = useState(false);
    const [bad, setBad] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<Status>(phase === "open" ? "idle" : "closed");

    const [honeypot, setHoneypot] = useState("");
    const cardRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // A returning visitor who already entered sees the thank-you state rather
    // than a form whose submission the Sheet would only dedupe away (§5).
    const enteredBefore = useHasEntered();
    const view: Status = status === "idle" && enteredBefore && phase === "open" ? "already" : status;

    // The countdown hitting zero while someone reads the page.
    useEffect(() => {
        const onClosed = () => setStatus((s) => (s === "done" || s === "already" ? s : "closed"));
        window.addEventListener(GIVEAWAY_CLOSED_EVENT, onClosed);
        return () => window.removeEventListener(GIVEAWAY_CLOSED_EVENT, onClosed);
    }, []);

    const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setBad((p) => (p[name] ? { ...p, [name]: false } : p));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("idle");

        const invalid = validateEntry({ ...form, consent });
        setBad(invalid);
        if (Object.keys(invalid).length > 0) {
            const first = Object.keys(invalid)[0];
            formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
            return;
        }

        // Honeypot: pretend it worked, send nothing.
        if (honeypot.trim()) {
            setStatus("done");
            return;
        }

        setStatus("sending");
        const q = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);

        try {
            const res = await fetch("/api/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    consent: true,
                    company_fax: honeypot,
                    source: SOURCE,
                    utm_source: q.get("utm_source") ?? "",
                    utm_medium: q.get("utm_medium") ?? "",
                    utm_campaign: q.get("utm_campaign") ?? "",
                    referrer: document.referrer || "",
                }),
            });

            if (res.status === 410) {
                setStatus("closed");
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // Conversion fires on a confirmed write only (§8) — never on click,
            // and never when the Sheet rejected the entry.
            gaEvent("giveaway_entry_submit", { source: SOURCE });
            trackFb("Lead", { content_name: SOURCE });

            markEntered();
            setStatus("done");
            cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
            setStatus("error");
        }
    };

    const showForm = view === "idle" || view === "sending" || view === "error";
    const isThanks = view === "done" || view === "already";

    const badgeText = isThanks ? "ENTERED" : "FREE · NO PURCHASE NECESSARY";
    const badgeBg = isThanks ? "#2F6B3A" : "#B5330E";

    const label = "block font-anton text-[11px] tracking-[1.8px] mb-[7px]";
    const input =
        "w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-[13px_14px] font-inter text-sm text-[#0a0a0a] outline-none focus:bg-white transition-colors placeholder:text-[#0a0a0a]/35";
    const inputBad = "border-[#B5330E] shadow-[3px_3px_0px_#B5330E]";

    const field = (
        name: keyof typeof EMPTY,
        labelText: React.ReactNode,
        extra: React.InputHTMLAttributes<HTMLInputElement> = {},
    ) => (
        <div>
            <label className={label} htmlFor={`g-${name}`}>
                {labelText}
            </label>
            <input
                id={`g-${name}`}
                name={name}
                value={form[name]}
                onChange={change}
                className={`${input} ${bad[name] ? inputBad : ""}`}
                aria-invalid={bad[name] ? true : undefined}
                {...extra}
            />
            {bad[name] && (
                <div className="text-xs text-[#B5330E] font-bold mt-1.5">{ERRORS[name]}</div>
            )}
        </div>
    );

    return (
        <div
            ref={cardRef}
            className="bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] scroll-mt-24"
        >
            {/* Card header */}
            <div className="bg-[#0a0a0a] text-[#F2EBDA] px-5 sm:px-7 py-4 flex justify-between items-center gap-3">
                <div className="font-anton text-[15px] tracking-[2px]">OFFICIAL ENTRY FORM</div>
                <div
                    className="font-anton text-[10px] tracking-[1.5px] px-2.5 py-[5px] text-white whitespace-nowrap"
                    style={{ background: badgeBg }}
                >
                    {badgeText}
                </div>
            </div>

            {showForm && (
                <>
                    <form ref={formRef} onSubmit={submit} noValidate className="px-5 sm:px-7 py-7">
                        {view === "error" && (
                            <div className="bg-[#B5330E] text-white text-[13px] font-bold px-4 py-3 mb-4 border-[2.5px] border-[#0a0a0a]">
                                Something went wrong sending your entry. Please try again, or email{" "}
                                <a href="mailto:howdy@creativecowboys.co" className="underline">
                                    howdy@creativecowboys.co
                                </a>{" "}
                                and we&rsquo;ll enter you by hand.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-[18px]">
                            {field("name", "YOUR NAME", {
                                type: "text",
                                placeholder: "First and last name",
                                autoComplete: "name",
                            })}
                            {field("email", "EMAIL", {
                                type: "email",
                                placeholder: "you@business.com",
                                autoComplete: "email",
                            })}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-[18px]">
                            {field("phone", "PHONE", {
                                type: "tel",
                                placeholder: "(555) 555-5555",
                                autoComplete: "tel",
                            })}
                            {field("city_state", "CITY, STATE", {
                                type: "text",
                                placeholder: "Villa Rica, GA",
                                autoComplete: "address-level2",
                            })}
                        </div>

                        <div className="mb-[18px]">
                            {field("business_name", "BUSINESS NAME", {
                                type: "text",
                                placeholder: "Your business",
                                autoComplete: "organization",
                            })}
                        </div>

                        <div className="mb-[18px]">
                            <label className={label} htmlFor="g-business_type">
                                WHAT KIND OF BUSINESS?
                            </label>
                            <select
                                id="g-business_type"
                                name="business_type"
                                value={form.business_type}
                                onChange={change}
                                aria-invalid={bad.business_type ? true : undefined}
                                className={`${input} cursor-pointer appearance-none bg-no-repeat ${bad.business_type ? inputBad : ""}`}
                                style={{
                                    backgroundImage: SELECT_ARROW,
                                    backgroundPosition: "right 12px center",
                                    backgroundSize: "18px",
                                }}
                            >
                                <option value="">Select one...</option>
                                {BUSINESS_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            {bad.business_type && (
                                <div className="text-xs text-[#B5330E] font-bold mt-1.5">
                                    {ERRORS.business_type}
                                </div>
                            )}
                        </div>

                        <div className="mb-[18px]">
                            {field(
                                "website",
                                <>
                                    CURRENT WEBSITE{" "}
                                    <span className="text-[#5a5a5a] font-normal tracking-[1px]">
                                        (OR &ldquo;NONE YET&rdquo;)
                                    </span>
                                </>,
                                {
                                    type: "text",
                                    placeholder: "yourbusiness.com — or none yet",
                                    autoComplete: "url",
                                },
                            )}
                        </div>

                        {/* Honeypot — off-screen, never seen by a real entrant */}
                        <div
                            aria-hidden="true"
                            style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}
                        >
                            <label>
                                Leave this empty
                                <input
                                    name="company_fax"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                />
                            </label>
                        </div>

                        <div>
                            <label className="flex gap-3 items-start text-[12.5px] text-[#5a5a5a] leading-[1.55] mb-5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="consent"
                                    checked={consent}
                                    onChange={(e) => {
                                        setConsent(e.target.checked);
                                        setBad((p) => (p.consent ? { ...p, consent: false } : p));
                                    }}
                                    className="w-5 h-5 mt-px flex-none accent-[#B5330E]"
                                    aria-invalid={bad.consent ? true : undefined}
                                />
                                <span>
                                    I&rsquo;m 18 or older, I own or run this business, and I agree to the{" "}
                                    <a href="#rules" className="underline text-[#0a0a0a]">
                                        Official Rules
                                    </a>
                                    . I&rsquo;m okay with Creative Cowboys emailing me about this giveaway and
                                    occasional tips and offers. Unsubscribe anytime.
                                </span>
                            </label>
                            {bad.consent && (
                                <div className="text-xs text-[#B5330E] font-bold -mt-3 mb-4">{ERRORS.consent}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="w-full bg-[#B5330E] text-white py-[17px] font-anton text-[15px] tracking-[1.5px] border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-wait disabled:transform-none"
                        >
                            {status === "sending" ? "SENDING..." : "ENTER TO WIN →"}
                        </button>
                    </form>
                    <div className="text-center text-[12.5px] text-[#5a5a5a] px-7 pb-6">
                        Your entry goes straight to Josh and Dave. We&rsquo;ll confirm by email within a few
                        minutes.
                    </div>
                </>
            )}

            {isThanks && (
                <div className="px-7 pt-10 pb-9 text-center">
                    <div className="font-lobster text-[22px] text-[#B5330E] -rotate-3 inline-block mb-2">
                        you&rsquo;re in!
                    </div>
                    <div className="font-anton text-[38px] sm:text-[44px] leading-[0.92] mb-3.5">
                        {view === "already" ? (
                            <>
                                YOU&rsquo;RE ALREADY <span className="text-[#B5330E]">ENTERED</span>.
                            </>
                        ) : (
                            <>
                                ENTRY <span className="text-[#B5330E]">RECEIVED</span>.
                            </>
                        )}
                    </div>
                    <p className="text-[14.5px] text-[#5a5a5a] leading-[1.65] max-w-[420px] mx-auto mb-6">
                        Check your inbox for a confirmation. We&rsquo;ll draw and announce the winner on{" "}
                        <strong className="text-[#0a0a0a]">September 25</strong> — and if it&rsquo;s you,
                        expect a phone call from a couple of very excited cowboys.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <a
                            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.creativecowboys.co%2Fthebiggiveaway"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F5C842] text-[#0a0a0a] px-4 py-[11px] font-anton text-xs tracking-[1.2px] border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                        >
                            SHARE ON FACEBOOK
                        </a>
                        {instagramUrl && (
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#F5C842] text-[#0a0a0a] px-4 py-[11px] font-anton text-xs tracking-[1.2px] border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                            >
                                FOLLOW ON INSTAGRAM
                            </a>
                        )}
                    </div>
                </div>
            )}

            {view === "closed" && (
                <div className="px-7 py-10 text-center">
                    <div className="font-anton text-[36px] sm:text-[40px] leading-[0.92] mb-3.5">
                        ENTRIES ARE <span className="text-[#B5330E]">CLOSED</span>.
                    </div>
                    <p className="text-[14.5px] text-[#5a5a5a] leading-[1.65] max-w-[420px] mx-auto">
                        Thanks to everyone who entered. The winner is announced September 25, 2026 on our
                        social channels. Missed it?{" "}
                        <a href="/contact" className="underline text-[#0a0a0a]">
                            Let&rsquo;s talk anyway
                        </a>{" "}
                        — we&rsquo;re not that expensive.
                    </p>
                </div>
            )}
        </div>
    );
}
