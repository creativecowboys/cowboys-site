"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { CREW_SIZES, JOB_VALUES, validateSubmission, type Playbook } from "@/lib/playbooks";
import { gaEvent, trackFb } from "@/lib/analytics";

/**
 * The eight-field form, one question group per screen so it reads like the
 * quiz-style page on a phone (funnel spec, section 6, step 3).
 *
 *   1. first name, phone, email
 *   2. city, crew size, typical job
 *   3. website yes / no (+ URL), consent line, send
 */

const ERRORS: Record<string, string> = {
    first_name: "What should we call you?",
    phone: "We text the playbook to this number.",
    email: "We email the playbook here.",
    city: "Which town do you work out of?",
    crew_size: "Pick one.",
    typical_job: "Pick one. A rough guess is fine.",
    has_website: "Pick one.",
};

const EMPTY = {
    first_name: "",
    phone: "",
    email: "",
    city: "",
    crew_size: "",
    typical_job: "",
    has_website: "",
    website_url: "",
};

type Status = "idle" | "sending" | "done" | "error";
const STEP_FIELDS: (keyof typeof EMPTY)[][] = [
    ["first_name", "phone", "email"],
    ["city", "crew_size", "typical_job"],
    ["has_website"],
];

export default function PlaybookForm({ playbook }: { playbook: Playbook }) {
    const [form, setForm] = useState(EMPTY);
    const [step, setStep] = useState(0);
    const [bad, setBad] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<Status>("idle");
    const [honeypot, setHoneypot] = useState("");
    const cardRef = useRef<HTMLDivElement>(null);

    const set = (name: keyof typeof EMPTY, value: string) => {
        setForm((p) => ({ ...p, [name]: value }));
        setBad((p) => (p[name] ? { ...p, [name]: false } : p));
    };
    const change = (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.name as keyof typeof EMPTY, e.target.value);

    const invalidOnStep = (i: number) => {
        const all = validateSubmission(form);
        const mine: Record<string, boolean> = {};
        for (const k of STEP_FIELDS[i]) if (all[k]) mine[k] = true;
        return mine;
    };

    const next = () => {
        const mine = invalidOnStep(step);
        setBad(mine);
        if (Object.keys(mine).length) return;
        setStep((s) => s + 1);
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const all = validateSubmission(form);
        setBad(all);
        if (Object.keys(all).length) {
            const firstBad = STEP_FIELDS.findIndex((fs) => fs.some((k) => all[k]));
            if (firstBad >= 0) setStep(firstBad);
            return;
        }
        if (honeypot.trim()) {
            setStatus("done");
            return;
        }
        setStatus("sending");
        const q = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
        try {
            const res = await fetch("/api/playbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    playbook: playbook.slug,
                    company_fax: honeypot,
                    utm_source: q.get("utm_source") ?? "",
                    utm_medium: q.get("utm_medium") ?? "",
                    utm_campaign: q.get("utm_campaign") ?? "",
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            gaEvent("playbook_download", { playbook: playbook.slug });
            trackFb("Lead", { content_name: playbook.slug });
            setStatus("done");
            cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
            setStatus("error");
        }
    };

    const label = "block font-anton text-[11px] tracking-[1.8px] mb-[7px]";
    const input =
        "w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-[13px_14px] font-inter text-[15px] text-[#0a0a0a] outline-none focus:bg-white transition-colors placeholder:text-[#0a0a0a]/35";
    const inputBad = "border-[#B5330E] shadow-[3px_3px_0px_#B5330E]";

    const field = (name: keyof typeof EMPTY, labelText: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <div>
            <label className={label} htmlFor={`pb-${name}`}>{labelText}</label>
            <input
                id={`pb-${name}`}
                name={name}
                value={form[name]}
                onChange={change}
                className={`${input} ${bad[name] ? inputBad : ""}`}
                aria-invalid={bad[name] ? true : undefined}
                {...extra}
            />
            {bad[name] && <div className="text-xs text-[#B5330E] font-bold mt-1.5">{ERRORS[name]}</div>}
        </div>
    );

    const pills = (name: keyof typeof EMPTY, labelText: string, options: readonly (string | { value: string; label: string })[]) => (
        <fieldset>
            <legend className={label}>{labelText}</legend>
            <div className="grid grid-cols-2 gap-2">
                {options.map((raw) => {
                    const o = typeof raw === "string" ? { value: raw, label: raw } : raw;
                    const on = form[name] === o.value;
                    return (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => set(name, o.value)}
                            aria-pressed={on}
                            className={`text-left px-3 py-3 border-[2.5px] border-[#0a0a0a] font-inter text-[14px] font-semibold transition-colors ${
                                on ? "bg-[#0a0a0a] text-[#F5C842]" : "bg-[#F2EBDA] hover:bg-white"
                            }`}
                        >
                            {o.label}
                        </button>
                    );
                })}
            </div>
            {bad[name] && <div className="text-xs text-[#B5330E] font-bold mt-1.5">{ERRORS[name]}</div>}
        </fieldset>
    );

    const done = status === "done";

    return (
        <div ref={cardRef} className="bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] scroll-mt-6">
            <div className="bg-[#0a0a0a] text-[#F2EBDA] px-5 sm:px-6 py-4 flex justify-between items-center gap-3">
                <div className="font-anton text-[14px] tracking-[2px] uppercase">
                    {done ? "On its way" : "Get the playbook"}
                </div>
                <div className="font-anton text-[10px] tracking-[1.5px] px-2.5 py-[5px] text-white whitespace-nowrap bg-[#B5330E]">
                    {done ? "SENT" : `${step + 1} OF 3`}
                </div>
            </div>

            {!done && (
                <div className="h-[6px] bg-[#F2EBDA] border-b-[2.5px] border-[#0a0a0a]">
                    <div className="h-full bg-[#F5C842] transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
                </div>
            )}

            {done ? (
                <div className="px-5 sm:px-6 py-7 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-11 h-11 border-[2.5px] border-[#0a0a0a] bg-[#F5C842] inline-flex items-center justify-center flex-none">
                            <MessageSquareText size={20} />
                        </span>
                        <h2 className="font-anton uppercase text-2xl leading-none">Check your texts.</h2>
                    </div>
                    <p className="text-[15px] leading-relaxed">
                        The 7-Day Fix is on its way to <b>{form.phone}</b> right now, and a copy is going to <b>{form.email}</b>. Day one takes about ten minutes.
                    </p>
                    <p className="text-[13px] text-[#0a0a0a]/65">
                        If nothing shows up in a minute, check your spam folder, then call or text me at{" "}
                        <a href="tel:+14702437517" className="underline font-bold">(470) 243-7517</a> and I&rsquo;ll send it by hand.
                    </p>
                    <p className="text-[13px] font-bold">Joshua Pack, Creative Cowboys</p>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="px-5 sm:px-6 py-6 flex flex-col gap-[18px]">
                    {status === "error" && (
                        <div className="bg-[#B5330E] text-white text-[13px] font-bold px-4 py-3 border-[2.5px] border-[#0a0a0a]">
                            Something went wrong sending that. Try again, or call (470) 243-7517 and we&rsquo;ll send it to you by hand.
                        </div>
                    )}

                    {step === 0 && (
                        <>
                            {field("first_name", "FIRST NAME", { type: "text", placeholder: "What do people call you?", autoComplete: "given-name", autoFocus: true })}
                            {field("phone", "CELL NUMBER", { type: "tel", placeholder: "We text the playbook here", autoComplete: "tel", inputMode: "tel" })}
                            {field("email", "EMAIL", { type: "email", placeholder: "And a copy goes here", autoComplete: "email", inputMode: "email" })}
                        </>
                    )}

                    {step === 1 && (
                        <>
                            {field("city", "WHAT TOWN ARE YOU BASED IN?", { type: "text", placeholder: "Villa Rica, Carrollton, Douglasville...", autoComplete: "address-level2", autoFocus: true })}
                            {pills("crew_size", "HOW BIG IS YOUR CREW?", CREW_SIZES)}
                            {pills("typical_job", "WHAT'S A TYPICAL JOB WORTH?", JOB_VALUES)}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {pills("has_website", "DO YOU HAVE A WEBSITE?", [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }])}
                            {form.has_website === "yes" &&
                                field("website_url", "WHAT'S THE ADDRESS?", { type: "text", placeholder: "yourcompany.com", autoComplete: "url", inputMode: "url" })}
                            <p className="text-[12px] leading-relaxed text-[#0a0a0a]/65">
                                By sending this you&rsquo;re saying it&rsquo;s fine for Creative Cowboys to text, call and email you about
                                the playbook. We don&rsquo;t sell your info, and you can text STOP any time.
                            </p>
                        </>
                    )}

                    {/* Honeypot */}
                    <div className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
                        <label htmlFor="pb-company_fax">Company fax</label>
                        <input id="pb-company_fax" name="company_fax" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                        {step > 0 ? (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className="font-anton text-[12px] tracking-[1.5px] uppercase underline underline-offset-4">
                                Back
                            </button>
                        ) : (
                            <span className="text-[12px] text-[#0a0a0a]/50">Takes about 30 seconds.</span>
                        )}
                        {step < 2 ? (
                            <button
                                type="button"
                                onClick={next}
                                className="pb-btn inline-flex items-center gap-2 font-anton text-sm tracking-[1.5px] px-6 py-3.5 bg-[#F5C842] text-[#0a0a0a]"
                            >
                                NEXT <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="pb-btn inline-flex items-center gap-2 font-anton text-sm tracking-[1.5px] px-6 py-3.5 bg-[#B5330E] text-white disabled:opacity-60"
                            >
                                {status === "sending" ? "SENDING" : "SEND ME THE PLAYBOOK"} <MessageSquareText size={16} />
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
