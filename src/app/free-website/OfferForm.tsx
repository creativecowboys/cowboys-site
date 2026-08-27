"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

const SELECT_ARROW =
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const BUSINESS_TYPES = [
    "Roofing",
    "Plumbing",
    "HVAC",
    "Electrical",
    "Concrete / Construction",
    "Landscaping / Lawn",
    "Pressure Washing",
    "Law Firm",
    "Pest Control",
    "Cleaning",
    "Auto / Towing",
    "Medical / Dental",
    "Other",
];

/**
 * Lead form for the paid-social landing page.
 *
 * Posts to the same /api/contact route the rest of the site uses — including
 * its honeypot and time-trap spam checks — but stamps `source` with the
 * campaign plus whatever ad parameters came in on the URL, so a lead from this
 * page is distinguishable from a /contact lead in the Resend email.
 */
export default function OfferForm({ slots }: { slots: number }) {
    const [status, setStatus] = useState<FormState>("idle");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        business: "",
        message: "",
    });

    // Spam traps: a honeypot real people never see, plus how long the form was open.
    const [websiteUrl, setWebsiteUrl] = useState("");
    const loadedAt = useRef<number>(0);
    const adParams = useRef<string>("");

    useEffect(() => {
        loadedAt.current = Date.now();

        // Ad attribution. Anything the ad platform appends (utm_*, fbclid, ttclid,
        // gclid) rides along into the lead email so campaigns can be told apart.
        try {
            const q = new URLSearchParams(window.location.search);
            const keep = [...q.entries()].filter(([k]) =>
                /^utm_|^(fbclid|gclid|ttclid|msclkid|ad|adset|campaign)$/i.test(k),
            );
            if (keep.length) {
                adParams.current = keep.map(([k, v]) => `${k}=${v}`).join(" · ");
            }
        } catch {
            // A malformed query string is not a reason to break the form.
        }
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        const source = adParams.current
            ? `Free Website Offer (Social Ad) — ${adParams.current}`
            : "Free Website Offer (Social Ad)";

        // The lead email renders `company || business`, so a trade sent as
        // `business` is silently dropped whenever a company name is filled in —
        // which is always, since Business Name is required. Fold it into the
        // message instead so it actually reaches the inbox.
        const message = [
            form.business ? `Trade: ${form.business}` : null,
            form.message.trim() || null,
        ]
            .filter(Boolean)
            .join(" — ");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    company: form.company,
                    message,
                    service: "Local SEO + Free Website Offer",
                    website_url: websiteUrl, // Honeypot
                    elapsed_ms: loadedAt.current ? Date.now() - loadedAt.current : undefined,
                    source,
                }),
            });
            if (!res.ok) throw new Error("Send failed");
            setStatus("success");
        } catch {
            setStatus("error");
        }
    };

    const labelCls = "block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5";
    const inputCls =
        "w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm text-[#0a0a0a] outline-none focus:bg-white transition-colors placeholder:text-[#0a0a0a]/40";

    if (status === "success") {
        return (
            <div className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-8 md:p-10 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-[#008f4c] border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-[3px_3px_0px_#1a1a1a]">
                    <Check size={26} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="font-anton text-3xl md:text-4xl uppercase text-[#0a0a0a] leading-none">
                    You&rsquo;re On The List.
                </h3>
                <p className="font-inter text-sm text-[#0a0a0a]/70 max-w-sm leading-relaxed">
                    We&rsquo;ll call you within one business day to walk through your current Google
                    visibility and confirm whether one of the {slots} build slots is still open. If you
                    &rsquo;d rather not wait, call us at{" "}
                    <a href="tel:4702437517" className="font-bold text-[#B5330E] underline">
                        (470) 243-7517
                    </a>
                    .
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-8 md:p-10 text-center flex flex-col items-center gap-4">
                <h3 className="font-anton text-3xl md:text-4xl uppercase text-[#B5330E] leading-none">
                    Something Went Wrong
                </h3>
                <p className="font-inter text-sm text-[#0a0a0a]/70 max-w-xs leading-relaxed">
                    Your message couldn&rsquo;t be sent. Try again, or just call us at{" "}
                    <a href="tel:4702437517" className="font-bold text-[#B5330E] underline">
                        (470) 243-7517
                    </a>
                    .
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="mt-1 border-[3px] border-[#0a0a0a] bg-[#B5330E] text-[#F2EBDA] font-bold uppercase tracking-wider text-xs px-6 py-3 shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-6 md:p-8 flex flex-col gap-5"
        >
            {/* Spam honeypot — hidden from real users, bots fill it in */}
            <div
                style={{ position: "absolute", opacity: 0, zIndex: -1, pointerEvents: "none" }}
                aria-hidden="true"
            >
                <input
                    type="text"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Do not fill this"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls} htmlFor="lp-name">
                        Name *
                    </label>
                    <input
                        id="lp-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Jake Rivera"
                        value={form.name}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls} htmlFor="lp-phone">
                        Phone *
                    </label>
                    <input
                        id="lp-phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="(555) 555-5555"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls} htmlFor="lp-email">
                        Email *
                    </label>
                    <input
                        id="lp-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="jake@company.com"
                        value={form.email}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls} htmlFor="lp-company">
                        Business Name *
                    </label>
                    <input
                        id="lp-company"
                        name="company"
                        type="text"
                        required
                        autoComplete="organization"
                        placeholder="Lone Star HVAC"
                        value={form.company}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </div>
            </div>

            <div>
                <label className={labelCls} htmlFor="lp-business">
                    What kind of work do you do?
                </label>
                <select
                    id="lp-business"
                    name="business"
                    value={form.business}
                    onChange={handleChange}
                    className={`${inputCls} cursor-pointer appearance-none bg-no-repeat`}
                    style={{
                        backgroundImage: SELECT_ARROW,
                        backgroundPosition: "right 12px center",
                        backgroundSize: "18px",
                    }}
                >
                    <option value="">Select your trade...</option>
                    {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelCls} htmlFor="lp-message">
                    Anything we should know? (optional)
                </label>
                <textarea
                    id="lp-message"
                    name="message"
                    rows={3}
                    placeholder="Towns you serve, what you're currently ranking for, whether you already have a site."
                    value={form.message}
                    onChange={handleChange}
                    className={`${inputCls} resize-y min-h-[84px]`}
                />
            </div>

            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full border-[3px] border-[#0a0a0a] bg-[#B5330E] text-[#F2EBDA] font-bold uppercase tracking-wider text-sm px-8 py-4 shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
                {status === "loading" ? (
                    "Sending…"
                ) : (
                    <>
                        Claim My Build Slot <ArrowUpRight size={18} />
                    </>
                )}
            </button>

            <p className="font-inter text-[11px] text-[#0a0a0a]/50 text-center leading-relaxed">
                No obligation. We&rsquo;ll look at your current visibility and tell you straight
                whether local SEO is worth it for your business.
            </p>
        </form>
    );
}
