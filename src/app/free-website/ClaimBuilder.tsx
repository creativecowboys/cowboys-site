"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { trackFb } from "@/lib/fbq";
import {
    ADDONS, ONE_TIME, PHONE_DISPLAY, PHONE_HREF, PLANS, SLOTS, TERMS_LINE,
    checkoutUrl, summarize, totals, type AddonKey, type OneTime, type PlanKey, type Selection,
} from "./offer";

/**
 * The claim step: pick a plan, tick add-ons, see what today costs, claim.
 *
 * With a GoHighLevel order form configured for the plan, "Claim my website" is a link to it that
 * carries the selection. Without one, the button opens a short claim form that lands the lead (and
 * the cart, as text) in the team inbox and GoHighLevel, and we send the checkout link by hand.
 * Either way the selection is a URL-free, cookie-free piece of React state: nothing is stored.
 */
export default function ClaimBuilder() {
    const [plan, setPlan] = useState<PlanKey>("basic");
    const [addons, setAddons] = useState<AddonKey[]>([]);
    const [oneTime, setOneTime] = useState<OneTime["key"][]>([]);
    const [showForm, setShowForm] = useState(false);
    // The ad parameters on the URL. Empty on the server and during hydration, filled in on the client.
    const search = useSyncExternalStore(subscribeNever, readSearch, () => "");

    const sel: Selection = useMemo(() => ({ plan, addons, oneTime }), [plan, addons, oneTime]);
    const t = useMemo(() => totals(sel), [sel]);
    const current = PLANS.find((p) => p.key === plan)!;
    const link = checkoutUrl(sel, search);

    const toggleAddon = (key: AddonKey, on: boolean) =>
        setAddons((prev) => (on ? [...new Set([...prev, key])] : prev.filter((k) => k !== key)));
    const toggleOneTime = (key: OneTime["key"], on: boolean) =>
        setOneTime((prev) => (on ? [...new Set([...prev, key])] : prev.filter((k) => k !== key)));

    const money = (n: number) => `$${n}`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-10">
                {/* Plans */}
                <div>
                    <h3 className="font-anton text-2xl md:text-3xl uppercase leading-none mb-1">1. Pick your plan</h3>
                    <p className="font-inter text-sm text-[#0a0a0a]/70 mb-5">The build is free with either. This is what keeps the site online.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" role="radiogroup" aria-label="Plan">
                        {PLANS.map((p) => {
                            const on = p.key === plan;
                            return (
                                <label
                                    key={p.key}
                                    className={`lp-card cursor-pointer p-6 flex flex-col gap-4 ${on ? "bg-[#0a0a0a] text-[#F2EBDA]" : "bg-white text-[#0a0a0a]"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            {p.key === "pro" && (
                                                <span className={`font-inter text-[10px] uppercase tracking-widest font-bold ${on ? "text-[#F5C842]" : "text-[#B5330E]"}`}>
                                                    40 more update credits + priority support
                                                </span>
                                            )}
                                            <span className="font-anton text-2xl md:text-3xl uppercase leading-none block mt-1">{p.name}</span>
                                        </div>
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={p.key}
                                            checked={on}
                                            onChange={() => setPlan(p.key)}
                                            className="mt-1 h-5 w-5 flex-none accent-[#B5330E]"
                                            aria-label={p.name}
                                        />
                                    </div>
                                    <div className="font-anton text-4xl leading-none">
                                        {money(p.monthly)}<span className="font-inter text-sm font-bold uppercase tracking-wider opacity-70">/mo</span>
                                    </div>
                                    <p className={`font-inter text-sm leading-relaxed ${on ? "text-[#F2EBDA]/80" : "text-[#0a0a0a]/70"}`}>{p.tagline}</p>
                                    <ul className="flex flex-col gap-2">
                                        {p.includes.map((line) => (
                                            <li key={line} className="flex items-start gap-2.5">
                                                <Check size={15} strokeWidth={3} className={`flex-none mt-[3px] ${on ? "text-[#F5C842]" : "text-[#008f4c]"}`} />
                                                <span className={`font-inter text-[13px] leading-relaxed ${on ? "text-[#F2EBDA]/85" : "text-[#0a0a0a]/80"}`}>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Add-ons */}
                <div>
                    <h3 className="font-anton text-2xl md:text-3xl uppercase leading-none mb-1">2. Add what you want</h3>
                    <p className="font-inter text-sm text-[#0a0a0a]/70 mb-5">Tick it now or add it later from your dashboard. Nothing is pre-checked.</p>
                    <div className="flex flex-col gap-3">
                        {ADDONS.map((a) => {
                            const included = current.bundled.includes(a.key);
                            const on = included || addons.includes(a.key);
                            return (
                                <label
                                    key={a.key}
                                    className={`flex items-start gap-4 border-[3px] border-[#0a0a0a] p-4 bg-white transition-colors ${included ? "opacity-80" : "cursor-pointer hover:bg-[#FBF8F0]"} ${on && !included ? "shadow-[4px_4px_0px_#1a1a1a]" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={on}
                                        disabled={included}
                                        onChange={(e) => toggleAddon(a.key, e.target.checked)}
                                        className="mt-1 h-5 w-5 flex-none accent-[#B5330E]"
                                        aria-label={a.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                            <span className="font-anton text-lg uppercase tracking-wide leading-none">{a.name}</span>
                                            <span className="font-anton text-lg leading-none text-[#B5330E]">
                                                {included ? <span className="font-inter text-[11px] font-bold uppercase tracking-widest text-[#008f4c]">Included in {current.name}</span> : <>+{money(a.monthly)}<span className="font-inter text-[11px] font-bold uppercase tracking-wider">/mo</span></>}
                                            </span>
                                        </div>
                                        <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed mt-1">{a.pitch}</p>
                                        {on && a.detail && <p className="font-inter text-xs text-[#0a0a0a]/55 leading-relaxed mt-1">{a.detail}</p>}
                                    </div>
                                </label>
                            );
                        })}
                        {ONE_TIME.map((o) => {
                            const on = oneTime.includes(o.key);
                            return (
                                <label
                                    key={o.key}
                                    className={`flex items-start gap-4 border-[3px] border-[#0a0a0a] p-4 bg-white cursor-pointer hover:bg-[#FBF8F0] transition-colors ${on ? "shadow-[4px_4px_0px_#1a1a1a]" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={on}
                                        onChange={(e) => toggleOneTime(o.key, e.target.checked)}
                                        className="mt-1 h-5 w-5 flex-none accent-[#B5330E]"
                                        aria-label={o.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                            <span className="font-anton text-lg uppercase tracking-wide leading-none">{o.name}</span>
                                            <span className="font-anton text-lg leading-none text-[#B5330E]">
                                                +{money(o.amount)}<span className="font-inter text-[11px] font-bold uppercase tracking-wider"> once</span>
                                            </span>
                                        </div>
                                        <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed mt-1">{o.pitch}</p>
                                        {on && <p className="font-inter text-xs text-[#0a0a0a]/55 leading-relaxed mt-1">{o.detail}</p>}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary: sticky on desktop so the total is always in view */}
            <div className="lg:col-span-5 lg:sticky lg:top-6">
                <div className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-6 md:p-7 flex flex-col gap-5">
                    <h3 className="font-anton text-2xl md:text-3xl uppercase leading-none">3. Claim it</h3>

                    <ul className="flex flex-col gap-2 border-y-2 border-[#0a0a0a]/15 py-4">
                        <li className="flex justify-between items-baseline gap-4 font-inter text-sm">
                            <span className="font-bold">Custom website, designed and built</span>
                            <span className="font-anton text-lg text-[#008f4c]">$0</span>
                        </li>
                        {t.lines.map((l) => (
                            <li key={l.name} className="flex justify-between items-baseline gap-4 font-inter text-sm">
                                <span className="text-[#0a0a0a]/80">{l.name}{l.monthly ? "" : " (one-time)"}</span>
                                <span className="font-anton text-lg tabular-nums">{money(l.amount)}{l.monthly && <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/60">/mo</span>}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a]/60 block">Today</span>
                            <span className="font-anton text-4xl leading-none tabular-nums">{money(t.today)}</span>
                        </div>
                        <div>
                            <span className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a]/60 block">Then</span>
                            <span className="font-anton text-4xl leading-none tabular-nums">{money(t.monthly)}<span className="font-inter text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">/mo</span></span>
                        </div>
                    </div>
                    <p className="font-inter text-xs text-[#0a0a0a]/65 leading-relaxed -mt-2">
                        Today&rsquo;s charge is your first month{t.oneTime ? " plus the one-time items" : ""}. Billing runs monthly from today. Most websites go live within 2 weeks. Cancel any time.
                    </p>

                    {link ? (
                        <a
                            href={link}
                            onClick={() => trackFb("InitiateCheckout", { content_name: "Free Website Program", content_category: current.name, value: t.today, currency: "USD" })}
                            className="lp-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2"
                        >
                            Claim my website <ArrowUpRight size={18} />
                        </a>
                    ) : showForm ? (
                        <ClaimForm sel={sel} search={search} planName={current.name} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="lp-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Claim my website <ArrowUpRight size={18} />
                        </button>
                    )}

                    <p className="font-inter text-[11px] text-[#0a0a0a]/55 leading-relaxed">
                        {TERMS_LINE} Full refund until onboarding is finished; none once the build has started. {SLOTS} builds a month.
                    </p>
                </div>
            </div>
        </div>
    );
}

const subscribeNever = () => () => {};
const readSearch = () => { try { return window.location.search; } catch { return ""; } };

type FormState = "idle" | "loading" | "success" | "error";

/**
 * The claim form shown while the GoHighLevel order forms don't exist yet. Posts to /api/contact (same
 * honeypot and time trap as every other form on the site) with the cart as the message, so the team
 * inbox and the GoHighLevel contact both say exactly what was picked.
 */
function ClaimForm({ sel, search, planName }: { sel: Selection; search: string; planName: string }) {
    const [status, setStatus] = useState<FormState>("idle");
    const [form, setForm] = useState({ name: "", company: "", phone: "", email: "" });
    const [websiteUrl, setWebsiteUrl] = useState("");
    const loadedAt = useRef<number>(0);
    useEffect(() => { loadedAt.current = Date.now(); }, []);

    const adParams = useMemo(() => {
        try {
            return [...new URLSearchParams(search).entries()]
                .filter(([k]) => /^utm_|^(fbclid|gclid|ttclid|msclkid|ad|adset|campaign)$/i.test(k))
                .map(([k, v]) => `${k}=${v}`).join(" · ");
        } catch { return ""; }
    }, [search]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name, email: form.email, phone: form.phone, company: form.company,
                    service: "Free Website Program",
                    message: `Claimed: ${summarize(sel)}. Send the checkout link.`,
                    source: adParams ? `Free Website Program — ${adParams}` : "Free Website Program",
                    website_url: websiteUrl,
                    elapsed_ms: loadedAt.current ? Date.now() - loadedAt.current : undefined,
                }),
            });
            if (!res.ok) throw new Error("Send failed");
            trackFb("Lead", { content_name: "Free Website Program", content_category: planName });
            setStatus("success");
        } catch {
            setStatus("error");
        }
    };

    const labelCls = "block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5";
    const inputCls = "w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm text-[#0a0a0a] outline-none focus:bg-white transition-colors placeholder:text-[#0a0a0a]/40";

    if (status === "success") {
        return (
            <div className="border-[3px] border-[#008f4c] bg-[#EAF5EE] p-5 flex flex-col gap-2">
                <span className="font-anton text-2xl uppercase leading-none flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-[#008f4c]" /> You&rsquo;re in.</span>
                <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">
                    We&rsquo;ll send your checkout link within one business day. Your build slot is held once your first month is paid, and onboarding starts right after. Questions now? Call <a href={PHONE_HREF} className="font-bold text-[#B5330E] underline">{PHONE_DISPLAY}</a>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-4 border-t-2 border-[#0a0a0a]/15 pt-5">
            <div style={{ position: "absolute", opacity: 0, zIndex: -1, pointerEvents: "none" }} aria-hidden="true">
                <input type="text" name="website_url" tabIndex={-1} autoComplete="off" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Do not fill this" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls} htmlFor="claim-name">Your name *</label>
                    <input id="claim-name" name="name" type="text" required autoComplete="name" placeholder="Jake Rivera" value={form.name} onChange={onChange} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="claim-company">Business name *</label>
                    <input id="claim-company" name="company" type="text" required autoComplete="organization" placeholder="Lone Star HVAC" value={form.company} onChange={onChange} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="claim-phone">Mobile *</label>
                    <input id="claim-phone" name="phone" type="tel" required autoComplete="tel" placeholder="(555) 555-5555" value={form.phone} onChange={onChange} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="claim-email">Email *</label>
                    <input id="claim-email" name="email" type="email" required autoComplete="email" placeholder="jake@company.com" value={form.email} onChange={onChange} className={inputCls} />
                </div>
            </div>
            {status === "error" && (
                <p className="font-inter text-sm text-[#B5330E] font-bold">That didn&rsquo;t send. Try again, or call {PHONE_DISPLAY}.</p>
            )}
            <button
                type="submit"
                disabled={status === "loading"}
                className="lp-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {status === "loading" ? "Sending…" : <>Send my checkout link <ArrowUpRight size={18} /></>}
            </button>
        </form>
    );
}
