import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import { ArrowUpRight, Check, Phone, X } from "lucide-react";
import ClaimBuilder from "./ClaimBuilder";
import { COMPETITORS, MOVE_OFF_FEE, PHONE_DISPLAY, PHONE_HREF, PLANS, SLOTS, TERMS_LINE } from "./offer";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

/**
 * The claim page for the free-website program (Josh & Dave, Oct 15 2026). Replaces the earlier
 * "free website with a 12-month local SEO agreement" offer on this URL.
 *
 * The pitch: we design, build and launch a custom site for free; the client pays monthly hosting
 * (from $30) plus whatever add-ons they tick, first month at checkout. The page is a dead end on
 * purpose (no site nav; legal links and the phone only) and stays out of the search index, since
 * it exists for paid traffic. Prices, plans and add-ons come from ./offer.ts; the interactive
 * plan + add-ons cart is ./ClaimBuilder.tsx.
 *
 * Two optional environment variables:
 *   NEXT_PUBLIC_FREE_SITE_VSL_URL            embed URL of the VSL (YouTube/Vimeo/Wistia); without it
 *                                            the hero shows the "what you get" card instead.
 *   NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_BASIC the GoHighLevel order form for Hosting & Support
 *   NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO   the GoHighLevel order form for Website Pro
 *                                            (without them the claim form collects the lead and we
 *                                            send the checkout link by hand; see ClaimBuilder).
 */
const VSL_URL = (process.env.NEXT_PUBLIC_FREE_SITE_VSL_URL || "").trim();
const BASIC = PLANS.find((p) => p.key === "basic")!;
const PRO = PLANS.find((p) => p.key === "pro")!;

export const metadata: Metadata = {
    title: "We Build Your Website Free — Limited Slots",
    description:
        `A custom website designed, written and launched for your business at no cost. You pay hosting from $${BASIC.monthly} a month. ${SLOTS} builds a month, most live within 2 weeks.`,
    alternates: { canonical: "/free-website" },
    // Ad landing page: it exists for paid traffic, not for search (also in NOINDEX_ROUTES in sitemap.ts).
    robots: { index: false, follow: true },
    openGraph: {
        title: "We Build Your Website Free | Creative Cowboys",
        description: `A custom site, built for you, free. Hosting from $${BASIC.monthly}/mo. Most websites go live within 2 weeks.`,
    },
};

const INCLUDED_SITE = [
    "A custom design for your business, not a template with your logo dropped in",
    "Every page written for you: services, about, contact and the pages Google looks for",
    "Built to load fast on a phone, where most of your customers are",
    "Contact forms and click-to-call wired to your phone and inbox",
    "Set up for Google from day one: titles, structure, speed",
    "Hosting, SSL and launch, all handled",
];

const STEPS = [
    {
        n: "01",
        title: "Claim your spot",
        body: `Pick a plan, tick any add-ons, and pay your first month. That's the whole commitment: hosting from $${BASIC.monthly}, cancel any time.`,
    },
    {
        n: "02",
        title: "Tell us about your business",
        body: "A 15-minute onboarding chat. Your services, your area, your hours, your logo and a few photos. Pick a color palette. If you don't have a domain, pick one of those too.",
    },
    {
        n: "03",
        title: "We build it",
        body: "Design, copy and build, by us. You get a preview link to look over on your phone, and one round of changes.",
    },
    {
        n: "04",
        title: "It goes live",
        body: "You approve it, we launch it on your domain. Most websites go live within 2 weeks of claiming.",
    },
];

const FAQS = [
    {
        q: "What's the catch?",
        a: `There isn't a hidden one, so here's the visible one. Your site runs on our platform, the same way a Wix or Squarespace site runs on theirs. You pay hosting from $${BASIC.monthly} a month, first month at checkout, and you can turn it off whenever you like. If you ever want the site moved to a host you manage yourself, that's a one-time $${MOVE_OFF_FEE} job. Your domain and your content are yours either way.`,
    },
    {
        q: "Why would you build a website for free?",
        a: "Because we'd rather earn a small amount every month for years than argue about a big invoice once. A business that loves its site stays. That's the whole model.",
    },
    {
        q: "I already have a website. Can I still do this?",
        a: "Yes. We build you a new one and point your domain at it when you're ready to switch. Nothing changes on your current site until you say so.",
    },
    {
        q: "I don't have a domain. What then?",
        a: "Tick the Custom Domain add-on ($5 a month, included in Website Pro). During onboarding we'll show you names that are available, you pick one, and we register it for you. The domain belongs to you.",
    },
    {
        q: "What if I need to change something after it's live?",
        a: `That's what on-demand web updates are for. Log into your dashboard, describe the change in plain English, and see a preview in minutes. Hosting & Support includes ${BASIC.credits} update credits a month; Website Pro includes ${PRO.credits}. Most small changes use one. If a change is more than the tool can handle, one click sends it to our team.`,
    },
    {
        q: "What does the AI chat actually do?",
        a: "It sits on your site and answers questions about your business around the clock: what you do, where you work, your hours, how to book. When a visitor is ready, it collects their name and number and texts you the lead. It's trained on your business, not a generic bot.",
    },
    {
        q: "How fast is this really?",
        a: `Most websites go live within 2 weeks of claiming. That's why we only take ${SLOTS} builds a month: it's the number we can actually finish. If the slots are gone, the page will say so.`,
    },
    {
        q: "What if I change my mind?",
        a: "Full refund any time before the build starts, which is when you finish onboarding. Once we've started building, the first month isn't refundable, but you're never locked into anything after it.",
    },
];

const MARQUEE = [
    `${SLOTS} BUILD SLOTS`,
    "FREE WEBSITE",
    "LIVE IN 2 WEEKS",
    `HOSTING FROM $${BASIC.monthly}`,
    "NO FLUFF",
    "CANCEL ANY TIME",
];

export default function FreeWebsitePage() {
    return (
        <div
            className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative flex flex-col pb-[76px] md:pb-0`}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .lp-dotgrid{background-image:radial-gradient(rgba(26,26,26,0.12) 1.5px,transparent 1.5px);background-size:24px 24px;}
        .lp-card{border:4px solid #0a0a0a;box-shadow:6px 6px 0px #1a1a1a;transition:transform .18s ease,box-shadow .18s ease;}
        .lp-card:hover{transform:translate(-4px,-4px);box-shadow:10px 10px 0px #1a1a1a;}
        .lp-btn{border:3px solid #0a0a0a;box-shadow:4px 4px 0px #1a1a1a;transition:all .18s ease;}
        .lp-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0px #1a1a1a;}
        .lp-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #1a1a1a;}
        @keyframes lpMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .lp-marquee{display:flex;width:max-content;animation:lpMarquee 35s linear infinite;}
        .lp-faq{border-bottom:2.5px solid #0a0a0a;}
        .lp-faq summary{font-family:var(--font-anton),'Anton',sans-serif;font-size:clamp(17px,2.2vw,22px);letter-spacing:.4px;text-transform:uppercase;padding:22px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;}
        .lp-faq summary::-webkit-details-marker{display:none}
        .lp-faq summary::after{content:'+';font-size:26px;color:#B5330E;flex:none}
        .lp-faq[open] summary::after{content:'—';font-size:18px}
        .lp-vsl{position:relative;aspect-ratio:16/9;border:4px solid #0a0a0a;box-shadow:6px 6px 0px #1a1a1a;background:#0a0a0a;}
        .lp-vsl iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
        @media (prefers-reduced-motion:reduce){.lp-marquee{animation:none}.lp-card{transition:none}}
      `,
                }}
            />

            {/* Header: logo and phone only. No nav: this page is a dead end by design. */}
            <header className="relative w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12 z-40">
                <div className="w-full max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <Link href="/" className="inline-block select-none" prefetch={false}>
                        <Image
                            src="/Cowboys logo script 2026 v2.png"
                            alt="Creative Cowboys — Digital Marketing Agency"
                            width={380}
                            height={110}
                            priority
                            className="w-40 sm:w-52 md:w-60 h-auto object-contain"
                            style={{ filter: "brightness(0) invert(1)" }}
                        />
                    </Link>
                    <a
                        href={PHONE_HREF}
                        className="lp-btn border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 md:px-6 py-2.5 md:py-3 uppercase tracking-wider text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
                    >
                        <Phone size={15} />
                        <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
                        <span className="sm:hidden">Call Us</span>
                    </a>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full py-14 md:py-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-80" />
                <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <div className="lg:col-span-6 flex flex-col gap-6 text-left">
                        <span className="self-start bg-[#F5C842] border-[3px] border-[#0a0a0a] shadow-[3px_3px_0px_#1a1a1a] px-3 py-1.5 font-bold text-[11px] uppercase tracking-widest">
                            {SLOTS} build slots this month · most live in 2 weeks
                        </span>

                        <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.88] uppercase tracking-tight">
                            A CUSTOM WEBSITE.
                            <span className="block">BUILT FOR YOU.</span>
                            <span className="text-[#B5330E] block">FREE.</span>
                        </h1>

                        <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-xl leading-relaxed">
                            We design it, write it and launch it. You pay hosting from ${BASIC.monthly} a
                            month, which is about what Wix or Squarespace charge you to build it yourself.
                            First month at checkout, cancel any time.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-1">
                            <a
                                href="#claim"
                                className="lp-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2"
                            >
                                Claim my website <ArrowUpRight size={18} />
                            </a>
                            <a
                                href={PHONE_HREF}
                                className="lp-btn bg-[#F2EBDA] text-[#0a0a0a] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2"
                            >
                                <Phone size={16} /> {PHONE_DISPLAY}
                            </a>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t-2 border-[#0a0a0a]/20 pt-7 mt-3 max-w-lg">
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#008f4c]">$0</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">For the build</span>
                            </div>
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#005eb8]">${BASIC.monthly}</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">A month, hosting</span>
                            </div>
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#B5330E]">2 wks</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">To go live, most sites</span>
                            </div>
                        </div>
                    </div>

                    {/* The VSL when there is one; the "what you get" card until then, so the hero is never a hole. */}
                    <div className="lg:col-span-6 w-full">
                        {VSL_URL ? (
                            <div className="lp-vsl">
                                <iframe
                                    src={VSL_URL}
                                    title="Why we build websites for free"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="lp-card bg-[#0a0a0a] text-[#F2EBDA] p-7 md:p-9 flex flex-col gap-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="font-inter text-[11px] uppercase tracking-widest font-bold text-[#F5C842]">You pay nothing for this</span>
                                        <h2 className="font-anton text-3xl md:text-4xl uppercase leading-none mt-1">The Website</h2>
                                    </div>
                                    <span className="flex-none border-2 border-[#F5C842] text-[#F5C842] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">Free</span>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {INCLUDED_SITE.map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <Check size={17} strokeWidth={3} className="text-[#F5C842] flex-none mt-[3px]" />
                                            <span className="font-inter text-sm text-[#F2EBDA]/85 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="w-full bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a] overflow-hidden py-4">
                <div className="lp-marquee">
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

            {/* How it works */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 relative">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-60" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="flex flex-col pb-8">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">How It Works</span>
                        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1">FOUR STEPS. TWO WEEKS.</h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {STEPS.map((s) => (
                            <div key={s.n} className="lp-card bg-white p-6 md:p-7 flex flex-col gap-3">
                                <span className="font-anton text-4xl text-[#B5330E] leading-none">{s.n}</span>
                                <h3 className="font-anton text-xl md:text-2xl uppercase tracking-wide leading-tight">{s.title}</h3>
                                <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Claim: plans, add-ons, total */}
            <section id="claim" className="w-full py-14 md:py-20 px-6 md:px-12 bg-white border-y-4 border-[#0a0a0a] scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col pb-10">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">Claim your website</span>
                        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1">THE BUILD IS FREE. PICK WHAT KEEPS IT RUNNING.</h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>
                    <ClaimBuilder />
                </div>
            </section>

            {/* Compared with building it yourself */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 relative">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-60" />
                <div className="relative max-w-5xl mx-auto">
                    <div className="flex flex-col pb-8">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">Compared with doing it yourself</span>
                        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1">SAME MONTHLY. SOMEBODY ELSE DOES THE WORK.</h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>
                    <div className="lp-card bg-white overflow-x-auto">
                        <table className="w-full min-w-[560px] font-inter text-sm">
                            <thead>
                                <tr className="bg-[#0a0a0a] text-[#F2EBDA]">
                                    <th className="text-left p-4 font-anton text-base uppercase tracking-wide font-normal">&nbsp;</th>
                                    <th className="text-left p-4 font-anton text-base uppercase tracking-wide font-normal text-[#F5C842]">Creative Cowboys</th>
                                    {COMPETITORS.map((c) => (
                                        <th key={c.name} className="text-left p-4 font-anton text-base uppercase tracking-wide font-normal">{c.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="[&_td]:p-4 [&_td]:border-t-2 [&_td]:border-[#0a0a0a]/10 [&_td]:align-top">
                                <tr>
                                    <td className="font-bold">Who builds the site</td>
                                    <td className="font-bold text-[#008f4c]">We do, free</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>You do</td>)}
                                </tr>
                                <tr>
                                    <td className="font-bold">Monthly</td>
                                    <td className="font-bold">${BASIC.monthly}–${PRO.monthly}</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>${c.low}–${c.high}<span className="block text-xs text-[#0a0a0a]/55">{c.note}, billed yearly</span></td>)}
                                </tr>
                                <tr>
                                    <td className="font-bold">Custom design and copy</td>
                                    <td className="font-bold text-[#008f4c]">Included</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>Templates, you write it</td>)}
                                </tr>
                                <tr>
                                    <td className="font-bold">Changes after launch</td>
                                    <td className="font-bold text-[#008f4c]">Describe it, we make it</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>You make them</td>)}
                                </tr>
                                <tr>
                                    <td className="font-bold">Hosting, SSL, security</td>
                                    <td className="font-bold text-[#008f4c]">Included</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>Included</td>)}
                                </tr>
                                <tr>
                                    <td className="font-bold">Someone to call</td>
                                    <td className="font-bold text-[#008f4c]">{PHONE_DISPLAY}</td>
                                    {COMPETITORS.map((c) => <td key={c.name}>Help center</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="font-inter text-xs text-[#0a0a0a]/55 mt-3">Wix and Squarespace prices are their published annual-billing rates as of October 2026; monthly billing costs more.</p>
                </div>
            </section>

            {/* The honest why */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest">Why we&rsquo;d build a website for free</span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-[0.95]">
                        BECAUSE A BUSINESS THAT LOVES ITS SITE <span className="text-[#B5330E]">STAYS.</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-2">
                        <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed">
                            The old way: quote a few thousand dollars for a build, argue about revisions, hand it over, and never hear from you again until something breaks. Nobody enjoys that, including us.
                        </p>
                        <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed">
                            So we stopped charging for the build. We earn a small amount every month for keeping your site fast, secure and up to date. If it&rsquo;s good, you stay. That&rsquo;s the whole trade, and it only works if the site is good.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="border-[3px] border-[#F2EBDA]/25 p-5 flex flex-col gap-2">
                            <span className="font-anton text-lg uppercase text-[#B5330E] flex items-center gap-2"><X size={18} strokeWidth={3} /> What this isn&rsquo;t</span>
                            <p className="font-inter text-sm text-[#F2EBDA]/70 leading-relaxed">
                                A template with your logo dropped in, a &ldquo;free&rdquo; site with a surprise bill, or a long contract.
                            </p>
                        </div>
                        <div className="border-[3px] border-[#F2EBDA]/25 p-5 flex flex-col gap-2">
                            <span className="font-anton text-lg uppercase text-[#F5C842] flex items-center gap-2"><Check size={18} strokeWidth={3} /> What it is</span>
                            <p className="font-inter text-sm text-[#F2EBDA]/70 leading-relaxed">
                                The same site we&rsquo;d otherwise quote you for, on a plan you can cancel any month.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 bg-white border-b-4 border-[#0a0a0a]">
                <div className="max-w-3xl mx-auto">
                    <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">FAQ</span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1 mb-8">THE QUESTIONS YOU&rsquo;RE ACTUALLY ASKING.</h2>
                    <div className="flex flex-col">
                        {FAQS.map((faq) => (
                            <details key={faq.q} className="lp-faq">
                                <summary>{faq.q}</summary>
                                <p className="font-inter text-sm md:text-base text-[#0a0a0a]/75 leading-relaxed pb-6 -mt-1">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="w-full py-16 md:py-24 px-6 md:px-12 bg-[#B5330E] text-[#F2EBDA] border-b-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                    <span className="bg-[#F5C842] text-[#0a0a0a] border-[3px] border-[#0a0a0a] shadow-[3px_3px_0px_#1a1a1a] px-3 py-1.5 font-bold text-[11px] uppercase tracking-widest">
                        {SLOTS} builds a month · first come, first served
                    </span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none text-white">YOUR SITE COULD BE LIVE IN TWO WEEKS.</h2>
                    <p className="font-inter text-base md:text-lg text-[#F2EBDA]/90 max-w-xl">
                        Pick a plan, pay your first month, and tell us about your business. We take it from there.
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mt-2 w-full sm:w-auto">
                        <a
                            href="#claim"
                            className="lp-btn border-[#F2EBDA] bg-[#0a0a0a] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#f3efe0]"
                        >
                            Claim my website <ArrowUpRight size={18} />
                        </a>
                        <a
                            href={PHONE_HREF}
                            className="lp-btn border-[#F2EBDA] bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#f3efe0]"
                        >
                            <Phone size={16} /> {PHONE_DISPLAY}
                        </a>
                    </div>
                </div>
            </section>

            {/* Fine print + slim footer. Legal links only; no nav back into the site. */}
            <footer className="w-full bg-[#0e0e0e] text-[#F2EBDA] py-12 px-6 md:px-12 flex-grow">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    <div className="border-[3px] border-[#F2EBDA]/20 p-6">
                        <h3 className="font-anton text-lg uppercase tracking-widest text-[#F5C842] mb-3">The Fine Print</h3>
                        <p className="font-inter text-xs text-[#F2EBDA]/60 leading-relaxed">
                            The free build is available with a Hosting &amp; Support or Website Pro plan, limited to {SLOTS} builds a month. Your first month and any one-time items are charged at checkout; billing then runs monthly from that date whatever the launch date. Most websites go live within 2 weeks. Full refund until onboarding is complete; none once the build has started. {TERMS_LINE} Moving the site to a host you manage is a one-time ${MOVE_OFF_FEE}. Domains we register for you are registered in your name and transfer with you (registrars hold new domains for 60 days). Add-on and plan details are in our{" "}
                            <Link href="/legal/terms-of-service" prefetch={false} className="underline hover:text-[#F5C842]">terms of service</Link>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-[#F2EBDA]/10 pt-6">
                        <div className="font-inter text-xs text-[#F2EBDA]/60 leading-relaxed">
                            <span className="font-bold text-[#F2EBDA]">Creative Cowboys Media, LLC</span>
                            <br />
                            222 West Montgomery St, Villa Rica, GA 30180
                            <br />
                            <a href={PHONE_HREF} className="hover:text-[#B5330E] transition-colors">{PHONE_DISPLAY}</a>{" "}
                            ·{" "}
                            <a href="mailto:howdy@creativecowboys.co" className="hover:text-[#B5330E] transition-colors">howdy@creativecowboys.co</a>
                        </div>
                        <div className="flex gap-5 font-inter text-xs text-[#F2EBDA]/50 font-bold uppercase tracking-wider">
                            <Link href="/privacy-policy" prefetch={false} className="hover:text-[#F5C842] transition-colors">Privacy</Link>
                            <Link href="/legal/terms-of-service" prefetch={false} className="hover:text-[#F5C842] transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile sticky CTA: most paid social traffic is on a phone. */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-4 border-[#B5330E] p-3 flex gap-3">
                <a
                    href="#claim"
                    className="flex-1 bg-[#B5330E] text-[#F2EBDA] border-[2.5px] border-[#F2EBDA] font-bold py-3 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5"
                >
                    Claim my website
                </a>
                <a
                    href={PHONE_HREF}
                    className="flex-1 bg-[#F5C842] text-[#0a0a0a] border-[2.5px] border-[#0a0a0a] font-bold py-3 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5"
                >
                    <Phone size={14} /> Call Now
                </a>
            </div>
        </div>
    );
}
