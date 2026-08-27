import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import { ArrowUpRight, Check, Phone, X } from "lucide-react";
import OfferForm from "./OfferForm";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

/**
 * Paid-social landing page for the local SEO campaign.
 *
 * Deliberately a dead end: no site nav, no outbound links except legal and the
 * phone number. Ad traffic either converts or leaves — every extra doorway is a
 * leak. It is also noindex (see `robots` below and the entry added to
 * NOINDEX_ROUTES in src/app/sitemap.ts) so it can't cannibalise /local-seo,
 * which is the page that has to earn the organic ranking.
 *
 * HOW MANY BUILD SLOTS: change SLOTS and the page updates everywhere it's
 * mentioned. When the promotion ends, delete the route and the sitemap entry.
 */
const SLOTS = 10;

export const metadata: Metadata = {
    title: "Free Website With Local SEO — Limited Slots",
    description:
        "Start local SEO with Creative Cowboys on a 12-month agreement and we build your new website free. Limited build slots for local service businesses across the Southeast.",
    alternates: { canonical: "/free-website" },
    // Ad landing page: it exists for paid traffic, not for search. Keeping it out
    // of the index stops it competing with /local-seo for the same terms.
    robots: { index: false, follow: true },
    openGraph: {
        title: "Free Website With Local SEO | Creative Cowboys",
        description:
            "Sign up for local SEO, we build your website free. Only a handful of build slots — first come, first served.",
    },
};

const INCLUDED_SITE = [
    "A custom-designed site — not a template with your logo dropped in",
    "Built to load in under two seconds on a phone",
    "Written and structured for the searches your customers actually type",
    "Service pages and service-area pages that give SEO something to rank",
    "Contact forms and click-to-call wired to your phone and inbox",
    "Hosting set up, SSL, and the whole thing launched for you",
];

const INCLUDED_SEO = [
    "Google Business Profile built out properly — categories, services, photos, posts",
    "Every wrong address and dead phone number scrubbed from the directories",
    "A review system that asks your happy customers at the right moment",
    "Real service-area pages for the towns you cover, not spun filler",
    "Local links from chambers, trade groups, and suppliers in your market",
    "Monthly reporting that shows calls and rankings, not vanity charts",
];

const STEPS = [
    {
        n: "01",
        title: "We look at where you stand",
        body: "A free call. We pull up your Google Business Profile, your current rankings, and what your competitors are doing. If local SEO isn't going to move the needle for you, we'll say so on that call and you've lost twenty minutes.",
    },
    {
        n: "02",
        title: "You start local SEO",
        body: `A 12-month agreement, because that's how long it takes for this work to compound into something worth having. That's what unlocks the free build — and it's why we can only take ${SLOTS} of these at a time.`,
    },
    {
        n: "03",
        title: "We build the site — free",
        body: "Design, build, copy, and launch, at no cost to you. It runs in parallel with the SEO work, so your profile and citations are already improving while the site comes together.",
    },
];

const FAQS = [
    {
        q: "What's the catch on the free website?",
        a: "The commitment. Local SEO with us is a 12-month agreement, and that's what pays for the build. Everything else — what you pay monthly, what happens if you leave early, what's included — is spelled out in writing before you sign anything, not after.",
    },
    {
        q: "Why would you give away the website?",
        a: "Self-interest, honestly. SEO on a slow, badly-structured website is us fighting with one hand tied. We'd rather build the thing right on day one than spend six months explaining why the rankings are moving but the phone isn't. It costs us up front and makes the SEO work far better — that's the trade.",
    },
    {
        q: "I already have a website. Does that disqualify me?",
        a: "No. We'll look at what you've got. If it's solid, we'll say so and skip the rebuild rather than replace something that's working. If it's holding you back — slow, thin, no real service pages — that's exactly what this offer is for.",
    },
    {
        q: "How long before I see anything?",
        a: "Google Business Profile work can move you in the map pack inside 4–8 weeks, because you're improving an asset Google already trusts. Organic rankings for your service-area pages take longer — 3 to 6 months to settle, more in a competitive metro. Anyone promising faster than that is guessing.",
    },
    {
        q: "Can I rank in a town where I don't have an office?",
        a: "In the map pack, no — Google ranks those by how close you are to the person searching, so an address in that town is the requirement. In the regular results below the map, yes. That's what service-area pages are for, and it's often the bigger share of the traffic anyway.",
    },
];

const MARQUEE = [
    `${SLOTS} BUILD SLOTS`,
    "FREE WEBSITE",
    "LOCAL SEO",
    "NO FLUFF",
    "MAP PACK",
    "WEST GEORGIA",
];

export default function FreeWebsiteOfferPage() {
    return (
        <div
            className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative flex flex-col md:pt-[36px] pb-[76px] md:pb-0`}
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
        @media (prefers-reduced-motion:reduce){.lp-marquee{animation:none}.lp-card{transition:none}}
      `,
                }}
            />

            {/* Header — logo and phone only. No nav: this page is a dead end by design. */}
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
                        href="tel:4702437517"
                        className="lp-btn border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 md:px-6 py-2.5 md:py-3 uppercase tracking-wider text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
                    >
                        <Phone size={15} />
                        <span className="hidden sm:inline">(470) 243-7517</span>
                        <span className="sm:hidden">Call Us</span>
                    </a>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full py-14 md:py-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-80" />
                <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                        <span className="self-start bg-[#F5C842] border-[3px] border-[#0a0a0a] shadow-[3px_3px_0px_#1a1a1a] px-3 py-1.5 font-bold text-[11px] uppercase tracking-widest">
                            Limited — {SLOTS} build slots
                        </span>

                        <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.88] uppercase tracking-tight">
                            GET FOUND ON GOOGLE.
                            {/* block, not inline: keeps the two sentences from running
                                together onto one line on narrow phones */}
                            <span className="text-[#B5330E] block">
                                WE&rsquo;LL BUILD THE WEBSITE FREE.
                            </span>
                        </h1>

                        <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-xl leading-relaxed">
                            Start local SEO with us on a 12-month agreement and we build your new
                            website at no cost — designed, written, and launched. We can only take{" "}
                            {SLOTS} of these at a time, because we&rsquo;re the ones doing the building.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-1">
                            <a
                                href="#claim"
                                className="lp-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2"
                            >
                                Claim A Build Slot <ArrowUpRight size={18} />
                            </a>
                            <a
                                href="tel:4702437517"
                                className="lp-btn bg-[#F2EBDA] text-[#0a0a0a] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2"
                            >
                                <Phone size={16} /> (470) 243-7517
                            </a>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t-2 border-[#0a0a0a]/20 pt-7 mt-3 max-w-lg">
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#005eb8]">21</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">
                                    #1 Google Rankings
                                </span>
                            </div>
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#008f4c]">100+</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">
                                    Sites Shipped
                                </span>
                            </div>
                            <div>
                                <span className="font-anton text-3xl sm:text-4xl block text-[#B5330E]">1.4s</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">
                                    Avg Page Load
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form sits in the hero — ad traffic shouldn't have to scroll to convert */}
                    <div id="claim" className="lg:col-span-5 w-full scroll-mt-24">
                        <div className="mb-4">
                            <h2 className="font-anton text-2xl md:text-3xl uppercase leading-none">
                                Check if a slot is open
                            </h2>
                            <p className="font-inter text-sm text-[#0a0a0a]/70 mt-1.5">
                                Takes about thirty seconds. We&rsquo;ll call you within one business day.
                            </p>
                        </div>
                        <OfferForm slots={SLOTS} />
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

            {/* What you actually get */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 relative">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-60" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="flex flex-col pb-8">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">
                            The Deal
                        </span>
                        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1">
                            HERE&rsquo;S EXACTLY WHAT YOU GET.
                        </h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Free website */}
                        <div className="lp-card bg-[#0a0a0a] text-[#F2EBDA] p-7 md:p-9 flex flex-col gap-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="font-inter text-[11px] uppercase tracking-widest font-bold text-[#F5C842]">
                                        You pay nothing for this
                                    </span>
                                    <h3 className="font-anton text-3xl md:text-4xl uppercase leading-none mt-1">
                                        The Website
                                    </h3>
                                </div>
                                <span className="flex-none border-2 border-[#F5C842] text-[#F5C842] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                                    Free
                                </span>
                            </div>
                            <ul className="flex flex-col gap-3">
                                {INCLUDED_SITE.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <Check
                                            size={17}
                                            strokeWidth={3}
                                            className="text-[#F5C842] flex-none mt-[3px]"
                                        />
                                        <span className="font-inter text-sm text-[#F2EBDA]/85 leading-relaxed">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Local SEO */}
                        <div className="lp-card bg-white p-7 md:p-9 flex flex-col gap-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="font-inter text-[11px] uppercase tracking-widest font-bold text-[#B5330E]">
                                        The part you&rsquo;re signing up for
                                    </span>
                                    <h3 className="font-anton text-3xl md:text-4xl uppercase leading-none mt-1">
                                        The Local SEO
                                    </h3>
                                </div>
                                <span className="flex-none border-2 border-[#0a0a0a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                                    Monthly
                                </span>
                            </div>
                            <ul className="flex flex-col gap-3">
                                {INCLUDED_SEO.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <Check
                                            size={17}
                                            strokeWidth={3}
                                            className="text-[#008f4c] flex-none mt-[3px]"
                                        />
                                        <span className="font-inter text-sm text-[#0a0a0a]/80 leading-relaxed">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* The honest why */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest">
                        Why we&rsquo;d give away a website
                    </span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-[0.95]">
                        BECAUSE SEO ON A BAD WEBSITE IS{" "}
                        <span className="text-[#B5330E]">MONEY DOWN A HOLE.</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-2">
                        <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed">
                            We can get you into the map pack. We can get your service-area pages
                            ranking. None of that matters if somebody taps your listing, waits six
                            seconds for a page to load on a phone, and hits the back button. That
                            traffic is bought and paid for, and it lands on a floor with a hole in it.
                        </p>
                        <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed">
                            So we stopped charging for the build. It costs us up front, and it makes
                            the SEO work land — which is the part you stay for. That&rsquo;s the whole
                            trade. There&rsquo;s no clever angle hiding behind it.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="border-[3px] border-[#F2EBDA]/25 p-5 flex flex-col gap-2">
                            <span className="font-anton text-lg uppercase text-[#B5330E] flex items-center gap-2">
                                <X size={18} strokeWidth={3} /> What this isn&rsquo;t
                            </span>
                            <p className="font-inter text-sm text-[#F2EBDA]/70 leading-relaxed">
                                A five-page template with your logo dropped into it, or a
                                &ldquo;free&rdquo; site you have to keep renting from us to keep
                                online.
                            </p>
                        </div>
                        <div className="border-[3px] border-[#F2EBDA]/25 p-5 flex flex-col gap-2">
                            <span className="font-anton text-lg uppercase text-[#F5C842] flex items-center gap-2">
                                <Check size={18} strokeWidth={3} /> What it is
                            </span>
                            <p className="font-inter text-sm text-[#F2EBDA]/70 leading-relaxed">
                                The same site we&rsquo;d otherwise quote you for, built as the
                                foundation the SEO work runs on.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 relative">
                <div className="absolute inset-0 lp-dotgrid pointer-events-none opacity-60" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="flex flex-col pb-8">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">
                            How It Works
                        </span>
                        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1">
                            THREE STEPS. NO RUNAROUND.
                        </h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s) => (
                            <div key={s.n} className="lp-card bg-white p-6 md:p-7 flex flex-col gap-3">
                                <span className="font-anton text-4xl text-[#B5330E] leading-none">{s.n}</span>
                                <h3 className="font-anton text-xl md:text-2xl uppercase tracking-wide leading-tight">
                                    {s.title}
                                </h3>
                                <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 bg-white border-y-4 border-[#0a0a0a]">
                <div className="max-w-3xl mx-auto">
                    <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">FAQ</span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none mt-1 mb-8">
                        THE QUESTIONS YOU&rsquo;RE ACTUALLY ASKING.
                    </h2>
                    <div className="flex flex-col">
                        {FAQS.map((faq) => (
                            <details key={faq.q} className="lp-faq">
                                <summary>{faq.q}</summary>
                                <p className="font-inter text-sm md:text-base text-[#0a0a0a]/75 leading-relaxed pb-6 -mt-1">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="w-full py-16 md:py-24 px-6 md:px-12 bg-[#B5330E] text-[#F2EBDA] border-b-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                    <span className="bg-[#F5C842] text-[#0a0a0a] border-[3px] border-[#0a0a0a] shadow-[3px_3px_0px_#1a1a1a] px-3 py-1.5 font-bold text-[11px] uppercase tracking-widest">
                        {SLOTS} slots · first come, first served
                    </span>
                    <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl uppercase leading-none text-white">
                        LET&rsquo;S SEE IF YOU&rsquo;RE A FIT.
                    </h2>
                    <p className="font-inter text-base md:text-lg text-[#F2EBDA]/90 max-w-xl">
                        One call. We&rsquo;ll pull up your current visibility and tell you straight
                        whether this is worth doing — even if the answer is no.
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mt-2 w-full sm:w-auto">
                        <a
                            href="#claim"
                            className="lp-btn border-[#F2EBDA] bg-[#0a0a0a] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#f3efe0]"
                        >
                            Claim A Build Slot <ArrowUpRight size={18} />
                        </a>
                        <a
                            href="tel:4702437517"
                            className="lp-btn border-[#F2EBDA] bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#f3efe0]"
                        >
                            <Phone size={16} /> (470) 243-7517
                        </a>
                    </div>
                </div>
            </section>

            {/* Fine print + slim footer. Legal links only — no nav back into the site. */}
            <footer className="w-full bg-[#0e0e0e] text-[#F2EBDA] py-12 px-6 md:px-12 flex-grow">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    <div className="border-[3px] border-[#F2EBDA]/20 p-6">
                        <h3 className="font-anton text-lg uppercase tracking-widest text-[#F5C842] mb-3">
                            The Fine Print
                        </h3>
                        <p className="font-inter text-xs text-[#F2EBDA]/60 leading-relaxed">
                            The free website build is available to new local SEO clients who start
                            on a 12-month service agreement, limited to {SLOTS} build slots. Full
                            terms — pricing, what the build covers, and what happens if you leave
                            early — are provided in writing before you sign anything. We&rsquo;ll
                            walk you through all of it on the first call.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-[#F2EBDA]/10 pt-6">
                        <div className="font-inter text-xs text-[#F2EBDA]/60 leading-relaxed">
                            <span className="font-bold text-[#F2EBDA]">Creative Cowboys Media</span>
                            <br />
                            222 West Montgomery St, Villa Rica, GA 30180
                            <br />
                            <a href="tel:4702437517" className="hover:text-[#B5330E] transition-colors">
                                (470) 243-7517
                            </a>{" "}
                            ·{" "}
                            <a
                                href="mailto:howdy@creativecowboys.co"
                                className="hover:text-[#B5330E] transition-colors"
                            >
                                howdy@creativecowboys.co
                            </a>
                        </div>
                        <div className="flex gap-5 font-inter text-xs text-[#F2EBDA]/50 font-bold uppercase tracking-wider">
                            <Link
                                href="/privacy-policy"
                                prefetch={false}
                                className="hover:text-[#F5C842] transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/legal/terms-of-service"
                                prefetch={false}
                                className="hover:text-[#F5C842] transition-colors"
                            >
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile sticky CTA — most paid social traffic is on a phone. */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-4 border-[#B5330E] p-3 flex gap-3">
                <a
                    href="#claim"
                    className="flex-1 bg-[#B5330E] text-[#F2EBDA] border-[2.5px] border-[#F2EBDA] font-bold py-3 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5"
                >
                    Claim A Slot
                </a>
                <a
                    href="tel:4702437517"
                    className="flex-1 bg-[#F5C842] text-[#0a0a0a] border-[2.5px] border-[#0a0a0a] font-bold py-3 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5"
                >
                    <Phone size={14} /> Call Now
                </a>
            </div>
        </div>
    );
}
