import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { ArrowUpRight, CalendarCheck, Check, Phone } from "lucide-react";
import OfferCta from "./OfferCta";
import OfferVideo from "./OfferVideo";
import {
    CHECKOUT_URL,
    DEAL,
    FAQS,
    MARQUEE,
    OFFER_CLOSES,
    PHONE_DISPLAY,
    PHONE_TEL,
    SEO_BULLETS,
    STEPS,
    VIDEO,
    WEBSITE_BULLETS,
} from "./content";

/**
 * Post-giveaway offer for Christmas in September entrants.
 *
 * Reached only from the offer email, so it is a dead end: no site nav, no
 * outbound links except checkout, the booking page, the phone number, and
 * legal. Noindex (see robots below and NOINDEX_ROUTES in sitemap.ts) so it
 * can't compete with /local-seo. Copy lives in ./content.ts.
 */

export const metadata: Metadata = {
    title: "Your Free Website + Local Max at $297/mo — Entrant Offer",
    description:
        "For Christmas in September entrants: the $8,000 website from the prize, free, when you start Local Max at $297 a month for 12 months.",
    alternates: { canonical: "/local-max-offer" },
    robots: { index: false, follow: false },
    openGraph: {
        title: "You didn't win the big one. You still get the website.",
        description:
            "The $8,000 website from the giveaway, free, with Local Max at $297/mo for 12 months. Entrants only.",
    },
};

const ACCENT = "#B5330E";
const YELLOW = "#F5C842";

const STYLES = `
.o-dotgrid{background-image:radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);background-size:18px 18px;}
.o-btn{border:2.5px solid #0a0a0a;box-shadow:4px 4px 0 #0a0a0a;transition:transform .18s ease,box-shadow .18s ease;}
.o-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #0a0a0a;}
.o-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #0a0a0a;}
.o-card{background:#fff;border:2.5px solid #0a0a0a;box-shadow:6px 6px 0 #0a0a0a;}
@keyframes oMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.o-marquee{display:flex;width:max-content;animation:oMarquee 32s linear infinite;}
.o-faq{border-bottom:2.5px solid #0a0a0a;}
.o-faq summary{font-family:var(--font-anton),'Anton',sans-serif;font-size:clamp(16px,2vw,19px);letter-spacing:.5px;text-transform:uppercase;padding:22px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;}
.o-faq summary::-webkit-details-marker{display:none}
.o-faq summary::after{content:'+';font-size:26px;color:#B5330E;flex:none}
.o-faq[open] summary::after{content:'—';font-size:18px}
.o-strike{position:relative;display:inline-block;}
.o-strike::after{content:'';position:absolute;left:-4%;right:-4%;top:52%;height:4px;background:#B5330E;transform:rotate(-6deg);}
@media (prefers-reduced-motion:reduce){.o-marquee{animation:none}}
`;

export default function LocalMaxOfferPage() {
    const videoAvailable = fs.existsSync(path.join(process.cwd(), "public", VIDEO.mp4));

    return (
        <div className="font-inter bg-[#F2EBDA] text-[#0a0a0a] selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative md:pt-[36px] pb-[72px] md:pb-0">
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />

            {/* Header — logo and phone only. Dead end by design. */}
            <header className="w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12">
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
                    <Link href="/" className="inline-block select-none" prefetch={false}>
                        <Image
                            src="/Cowboys logo script 2026 v2.png"
                            alt="Creative Cowboys"
                            width={380}
                            height={110}
                            priority
                            className="w-40 sm:w-52 md:w-56 h-auto object-contain"
                            style={{ filter: "brightness(0) invert(1)" }}
                        />
                    </Link>
                    <a
                        href={PHONE_TEL}
                        className="o-btn border-[#F2EBDA] bg-[#B5330E] text-white font-anton tracking-[1.5px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#F2EBDA] hover:shadow-[6px_6px_0px_#F2EBDA]"
                    >
                        <Phone size={15} />
                        <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
                        <span className="sm:hidden">Call</span>
                    </a>
                </div>
            </header>

            {/* Hero — video first, then the headline */}
            <section className="relative w-full py-14 md:py-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 o-dotgrid pointer-events-none" />
                <div className="relative max-w-6xl mx-auto flex flex-col gap-10 md:gap-14">
                    <div className="max-w-3xl mx-auto w-full">
                        <OfferVideo
                            mp4={VIDEO.mp4}
                            webm={VIDEO.webm}
                            poster={VIDEO.poster}
                            available={videoAvailable}
                        />
                    </div>

                    <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
                        <span
                            className="font-anton text-[12px] tracking-[2.5px] uppercase px-3 py-1.5 border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                            style={{ background: YELLOW }}
                        >
                            For Christmas in September entrants only
                        </span>
                        <h1 className="font-anton uppercase text-[44px] sm:text-[60px] md:text-[76px] leading-[0.9] tracking-tight">
                            You didn&rsquo;t win the big one.
                            <span className="block" style={{ color: ACCENT }}>
                                You still get the website.
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-[#0a0a0a]/80 leading-relaxed max-w-2xl">
                            We couldn&rsquo;t give away $44,000 to everyone. So we&rsquo;re putting the
                            website half of the prize on the table for every business that entered: the
                            same $8,000 build, free, when you start Local Max at $297 a month for twelve
                            months. That&rsquo;s $200 a month off our regular price, and the site costs you
                            nothing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-1">
                            <OfferCta
                                position="hero"
                                href="#accept"
                                className="o-btn inline-flex items-center justify-center gap-2 font-anton text-sm tracking-[1.5px] px-8 py-4 text-white"
                                style={{ background: ACCENT }}
                            >
                                ACCEPT THE OFFER <ArrowUpRight size={18} />
                            </OfferCta>
                            <a
                                href="#deal"
                                className="o-btn inline-flex items-center justify-center font-anton text-sm tracking-[1.5px] px-8 py-4 bg-[#F2EBDA] text-[#0a0a0a]"
                            >
                                SEE WHAT&rsquo;S INCLUDED
                            </a>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/55">
                            Open through {OFFER_CLOSES}
                        </p>
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="w-full bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a] overflow-hidden py-4">
                <div className="o-marquee">
                    {[0, 1].map((rep) => (
                        <div
                            key={rep}
                            className="flex gap-16 items-center pr-16 font-anton text-2xl md:text-3xl uppercase tracking-widest select-none whitespace-nowrap"
                            aria-hidden={rep === 1}
                        >
                            {MARQUEE.map((word, i) => (
                                <span key={`${rep}-${i}`} className="flex items-center gap-16">
                                    <span>{word}</span>
                                    <span className={i % 2 === 0 ? "text-[#B5330E]" : "text-[#F5C842]"}>★</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* The deal */}
            <section id="deal" className="w-full py-16 md:py-[90px] px-6 md:px-12 scroll-mt-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
                    <div className="flex flex-col gap-5">
                        <span className="font-anton text-[13px] tracking-[2.5px]" style={{ color: ACCENT }}>
                            THE DEAL
                        </span>
                        <h2 className="font-anton uppercase text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92]">
                            Two things.
                            <br />
                            One price.
                        </h2>
                        <p className="text-[#5a5a5a] leading-relaxed text-base md:text-lg">
                            The website is the prize. The price is the price. You pay $297 a month for
                            Local Max, and the site comes with it at no cost. No build fee, no setup fee,
                            no hosting bill. After twelve months, the site is yours outright.
                        </p>
                        <ul className="flex flex-col gap-3 mt-2">
                            {[
                                "12-month agreement, in writing, before you pay a dollar",
                                "Your rate stays at $297 if you renew",
                                "Ad spend is never included in any fee",
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-3 text-sm md:text-base">
                                    <span
                                        className="flex-none mt-[3px] w-5 h-5 border-[2px] border-[#0a0a0a] flex items-center justify-center"
                                        style={{ background: YELLOW }}
                                    >
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="o-card p-7 md:p-9 flex flex-col gap-7 lg:-rotate-[0.6deg]">
                        {DEAL.map((d, i) => (
                            <div
                                key={d.label}
                                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                                    i > 0 ? "border-t-[2.5px] border-[#0a0a0a] pt-7" : ""
                                }`}
                            >
                                <div>
                                    <div className="font-anton text-xl md:text-2xl uppercase leading-none">{d.label}</div>
                                    <div className="text-sm text-[#5a5a5a] mt-2 max-w-xs">{d.sub}</div>
                                </div>
                                <div className="flex items-baseline gap-4 sm:flex-col sm:items-end sm:gap-1">
                                    <span className="o-strike font-anton text-xl md:text-2xl text-[#8a8378]">{d.was}</span>
                                    <span className="font-anton text-[40px] md:text-[52px] leading-none" style={{ color: ACCENT }}>
                                        {d.now}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div
                            className="flex items-center justify-between gap-4 text-white px-5 py-4 border-[2.5px] border-[#0a0a0a] -mx-2"
                            style={{ background: "#0a0a0a", boxShadow: `6px 6px 0 ${ACCENT}` }}
                        >
                            <span className="font-anton tracking-[1.5px] text-sm uppercase">You pay</span>
                            <span className="font-anton text-2xl md:text-3xl">
                                $297<span className="text-base text-[#d4ccb8]">/mo · 12 months</span>
                            </span>
                        </div>
                        <OfferCta
                            position="deal"
                            href="#accept"
                            className="o-btn inline-flex items-center justify-center gap-2 font-anton text-sm tracking-[1.5px] px-8 py-4 text-white"
                            style={{ background: ACCENT }}
                        >
                            ACCEPT THE OFFER <ArrowUpRight size={18} />
                        </OfferCta>
                    </div>
                </div>
            </section>

            {/* What you get */}
            <section className="w-full bg-[#0e0e0e] text-[#F2EBDA] py-16 md:py-[90px] px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-2xl mb-10 md:mb-14">
                        <span className="font-anton text-[13px] tracking-[2.5px]" style={{ color: YELLOW }}>
                            WHAT YOU GET
                        </span>
                        <h2 className="font-anton uppercase text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] mt-3">
                            The site, and the year of work that makes it pay.
                        </h2>
                        <p className="text-[#d4ccb8] mt-4 leading-relaxed">
                            A website on its own is a brochure. Local Max is the part that puts it in
                            front of people searching for what you do in your town, and keeps it there.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white text-[#0a0a0a] border-[2.5px] border-[#0a0a0a] shadow-[8px_8px_0px_#B5330E] p-7 md:p-8">
                            <div className="flex items-baseline justify-between gap-4 border-b-[2.5px] border-[#0a0a0a] pb-4 mb-5">
                                <h3 className="font-anton text-2xl md:text-[28px] uppercase leading-none">Your website</h3>
                                <span className="font-anton text-sm tracking-[1px]" style={{ color: ACCENT }}>
                                    $8,000 → FREE
                                </span>
                            </div>
                            <ul className="flex flex-col gap-3">
                                {WEBSITE_BULLETS.map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-sm md:text-[15px] leading-snug">
                                        <span className="flex-none mt-[2px] w-5 h-5 border-[2px] border-[#0a0a0a] flex items-center justify-center" style={{ background: YELLOW }}>
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white text-[#0a0a0a] border-[2.5px] border-[#0a0a0a] shadow-[8px_8px_0px_#F5C842] p-7 md:p-8">
                            <div className="flex items-baseline justify-between gap-4 border-b-[2.5px] border-[#0a0a0a] pb-4 mb-5">
                                <h3 className="font-anton text-2xl md:text-[28px] uppercase leading-none">Local Max</h3>
                                <span className="font-anton text-sm tracking-[1px]" style={{ color: ACCENT }}>
                                    $497 → $297/MO
                                </span>
                            </div>
                            <ul className="flex flex-col gap-3">
                                {SEO_BULLETS.map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-sm md:text-[15px] leading-snug">
                                        <span className="flex-none mt-[2px] w-5 h-5 border-[2px] border-[#0a0a0a] flex items-center justify-center" style={{ background: YELLOW }}>
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="w-full py-16 md:py-[90px] px-6 md:px-12 relative">
                <div className="absolute inset-0 o-dotgrid pointer-events-none" />
                <div className="relative max-w-6xl mx-auto">
                    <div className="max-w-2xl mb-10">
                        <span className="font-anton text-[13px] tracking-[2.5px]" style={{ color: ACCENT }}>
                            HOW IT WORKS
                        </span>
                        <h2 className="font-anton uppercase text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] mt-3">
                            Three steps. About three weeks.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s) => (
                            <div key={s.n} className="o-card p-7 flex flex-col gap-4">
                                <span
                                    className="w-12 h-12 flex items-center justify-center font-anton text-lg border-[2.5px] border-[#0a0a0a] rounded-full"
                                    style={{ background: YELLOW }}
                                >
                                    {s.n}
                                </span>
                                <h3 className="font-anton text-xl md:text-2xl uppercase leading-none">{s.title}</h3>
                                <p className="text-sm md:text-[15px] text-[#5a5a5a] leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accept */}
            <section id="accept" className="w-full bg-[#E8E1CF] border-y-4 border-[#0a0a0a] py-16 md:py-[90px] px-6 md:px-12 scroll-mt-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
                    <div className="flex flex-col gap-5">
                        <span className="font-anton text-[13px] tracking-[2.5px]" style={{ color: ACCENT }}>
                            ACCEPT THE OFFER
                        </span>
                        <h2 className="font-anton uppercase text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92]">
                            Two minutes now.
                            <br />
                            A new site in three weeks.
                        </h2>
                        <p className="text-[#5a5a5a] leading-relaxed text-base md:text-lg">
                            Checkout is a secure page from our billing system. The agreement is on it in
                            plain English, and you&rsquo;ll get a receipt by email. As soon as it&rsquo;s
                            done, you&rsquo;ll book your 15-minute onboarding call with our team.
                        </p>
                        <p className="text-sm text-[#5a5a5a]">
                            Rather talk first? Call{" "}
                            <a href={PHONE_TEL} className="font-bold underline" style={{ color: ACCENT }}>
                                {PHONE_DISPLAY}
                            </a>{" "}
                            or reply to the email this came from.
                        </p>
                    </div>

                    <div className="bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] p-7 md:p-9 flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <span className="flex-none w-9 h-9 flex items-center justify-center font-anton border-[2.5px] border-[#0a0a0a]" style={{ background: YELLOW }}>
                                1
                            </span>
                            <div className="flex-1">
                                <div className="font-anton text-xl uppercase leading-none">Start Local Max</div>
                                <div className="text-sm text-[#5a5a5a] mt-1.5">
                                    $297/mo · 12 months · website included free
                                </div>
                                <OfferCta
                                    position="accept"
                                    href={CHECKOUT_URL}
                                    external
                                    className="o-btn mt-4 w-full inline-flex items-center justify-center gap-2 font-anton text-[15px] tracking-[1.5px] px-6 py-[17px] text-white"
                                    style={{ background: ACCENT }}
                                >
                                    ACCEPT &amp; CHECK OUT <ArrowUpRight size={18} />
                                </OfferCta>
                            </div>
                        </div>
                        <div className="border-t-[2.5px] border-dashed border-[#0a0a0a]/30" />
                        <div className="flex items-start gap-4">
                            <span className="flex-none w-9 h-9 flex items-center justify-center font-anton border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA]">
                                2
                            </span>
                            <div className="flex-1">
                                <div className="font-anton text-xl uppercase leading-none">Book your 15-minute call</div>
                                <div className="text-sm text-[#5a5a5a] mt-1.5">
                                    You&rsquo;ll land on the scheduler right after checkout. Already paid?
                                </div>
                                <OfferCta
                                    position="book"
                                    href="/local-max-offer/welcome"
                                    className="o-btn mt-4 w-full inline-flex items-center justify-center gap-2 font-anton text-[15px] tracking-[1.5px] px-6 py-[17px] bg-[#F2EBDA] text-[#0a0a0a]"
                                >
                                    <CalendarCheck size={18} /> BOOK THE CALL
                                </OfferCta>
                            </div>
                        </div>
                        <p className="text-[11px] text-[#8a8378] leading-relaxed">
                            By checking out you agree to the Local Max 12-month service agreement shown at
                            checkout. Offer available to Christmas in September entrants through{" "}
                            {OFFER_CLOSES}.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="w-full py-16 md:py-[90px] px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <span className="font-anton text-[13px] tracking-[2.5px]" style={{ color: ACCENT }}>
                        THE FINE PRINT, IN PLAIN ENGLISH
                    </span>
                    <h2 className="font-anton uppercase text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] mt-3 mb-6">
                        Questions we&rsquo;d ask too
                    </h2>
                    <div className="border-t-[2.5px] border-[#0a0a0a]">
                        {FAQS.map((f) => (
                            <details key={f.q} className="o-faq">
                                <summary>{f.q}</summary>
                                <p className="pb-6 text-[#5a5a5a] leading-relaxed text-[15px] max-w-2xl">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full py-16 md:py-20 px-6 md:px-12 text-center" style={{ background: ACCENT }}>
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-[#F2EBDA]">
                    <h2 className="font-anton uppercase text-[36px] sm:text-[48px] md:text-[60px] leading-[0.9]">
                        You entered to win a website.
                        <br />
                        Go get it.
                    </h2>
                    <p className="text-[#F2EBDA]/85 max-w-xl">
                        $297 a month, twelve months, the site is free and it&rsquo;s yours at the end.
                        Open through {OFFER_CLOSES}.
                    </p>
                    <OfferCta
                        position="final"
                        href="#accept"
                        className="o-btn inline-flex items-center justify-center gap-2 font-anton text-sm tracking-[1.5px] px-8 py-4 text-[#0a0a0a] border-[#0a0a0a]"
                        style={{ background: YELLOW }}
                    >
                        ACCEPT THE OFFER <ArrowUpRight size={18} />
                    </OfferCta>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-[#0e0e0e] text-[#F2EBDA] py-10 px-6 md:px-12">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-xs text-[#F2EBDA]/60 leading-relaxed">
                        <span className="font-bold text-[#F2EBDA]">Creative Cowboys Media</span>
                        <br />
                        Villa Rica, GA · Franklin, TN
                        <br />
                        <a href={PHONE_TEL} className="hover:text-[#F5C842]">
                            {PHONE_DISPLAY}
                        </a>{" "}
                        ·{" "}
                        <a href="mailto:josh@creativecowboys.co" className="hover:text-[#F5C842]">
                            josh@creativecowboys.co
                        </a>
                    </div>
                    <div className="flex gap-5 text-xs text-[#F2EBDA]/50 font-bold uppercase tracking-wider">
                        <Link href="/privacy-policy" prefetch={false} className="hover:text-[#F5C842]">
                            Privacy
                        </Link>
                        <Link href="/legal/terms-of-service" prefetch={false} className="hover:text-[#F5C842]">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>

            {/* Mobile sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-4 border-[#B5330E] p-3 flex gap-3">
                <OfferCta
                    position="sticky"
                    href="#accept"
                    className="flex-1 text-[#F2EBDA] border-[2.5px] border-[#F2EBDA] font-anton py-3 tracking-[1.5px] text-xs inline-flex items-center justify-center"
                    style={{ background: ACCENT }}
                >
                    ACCEPT THE OFFER
                </OfferCta>
                <a
                    href={PHONE_TEL}
                    className="flex-1 text-[#0a0a0a] border-[2.5px] border-[#0a0a0a] font-anton py-3 tracking-[1.5px] text-xs inline-flex items-center justify-center gap-1.5"
                    style={{ background: YELLOW }}
                >
                    <Phone size={14} /> CALL
                </a>
            </div>
        </div>
    );
}
