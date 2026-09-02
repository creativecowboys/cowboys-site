import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { ENTRY_DEADLINE, resolvePhase } from "@/lib/giveaway";
import { SITE_URL } from "@/lib/seo";
import Countdown from "./Countdown";
import EntryForm from "./EntryForm";
import HeroVideo from "./HeroVideo";
import IntroGate from "./IntroGate";
import StickyCta from "./StickyCta";
import TrackedCta from "./TrackedCta";
import RulesText from "./RulesText";
import {
    AD_SPEND_FOOTNOTE,
    FAQS,
    GROWTH_MAX_TILES,
    MARQUEE,
    RULES,
    STEPS,
    TOTAL_BAND_FINEPRINT,
    WEBSITE_BULLETS,
    WHO_TILES,
} from "./content";

/**
 * Christmas in September giveaway (§2).
 *
 * Indexable — this is a campaign page people will search for by name, and the
 * URL is printed on video and social assets. Per §2 it must NEVER 404, even
 * after the giveaway ends; §9's `winner` phase is what it becomes instead.
 *
 * Revalidated rather than fully static so the phase can flip on its own. A
 * statically-built page would freeze whatever phase was true at build time and
 * still be advertising an open giveaway in October. Five minutes is well inside
 * the tolerance for a date-based flip, and /api/giveaway is the real authority
 * on whether an entry is accepted.
 */
export const revalidate = 300;

const OG_IMAGE = "/Main%20logo%202.png"; // TODO: Josh to supply 1200×630 campaign art (§11)

export const metadata: Metadata = {
    title: "Christmas in September: Win a $44,000 Website + Marketing Package",
    description:
        "Creative Cowboys is giving one U.S. small business a brand-new website, a full year of marketing, and a business growth strategy — valued at $44,000. Enter free by September 24. Winner announced September 25, 2026.",
    alternates: { canonical: "/christmas-in-september" },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/christmas-in-september`,
        title: "Christmas in September: Win a $44,000 Website + Marketing Package | Creative Cowboys",
        description:
            "One U.S. small business wins a brand-new website, a full year of marketing, and a growth strategy — a $44,000 package. Free to enter through September 24, 2026.",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Christmas in September — Creative Cowboys giveaway" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Win a $44,000 website + marketing package | Creative Cowboys",
        description: "Free to enter through September 24, 2026. Winner announced September 25.",
        images: [OG_IMAGE],
    },
};

/* Palette note: the mockup specifies coral #DD5A2E, but that value lives only on
   /franklin-tn/web-design. The site-wide accent — and the one baked into the
   Header and Footer this page is required to reuse — is #B5330E. Using the
   mockup's coral would put two different oranges in the same viewport, so the
   page follows the production token. Flip ACCENT to change it everywhere. */
const ACCENT = "#B5330E";
const YELLOW = "#F5C842";
const INK = "#0a0a0a";

const faqSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": `${SITE_URL}/christmas-in-september`,
            url: `${SITE_URL}/christmas-in-september`,
            name: "Christmas in September Giveaway",
            description:
                "Creative Cowboys is giving one U.S. small business a brand-new website, a full year of marketing, and a business growth strategy — valued at $44,000.",
            isPartOf: { "@type": "WebSite", url: SITE_URL, name: "Creative Cowboys" },
        },
        {
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        },
    ],
};

export default function ChristmasInSeptemberPage() {
    const phase = resolvePhase();
    const isOpen = phase === "open";

    return (
        <div className="font-inter bg-[#F2EBDA] text-[#0a0a0a] selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .g-dotgrid{background-image:radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);background-size:18px 18px;}
        .g-btn{border:2.5px solid ${INK};box-shadow:4px 4px 0 ${INK};transition:transform .18s ease,box-shadow .18s ease;}
        .g-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 ${INK};}
        .g-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 ${INK};}
        @keyframes gMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .g-marquee{display:flex;width:max-content;animation:gMarquee 32s linear infinite;}
        .g-faq{border-bottom:2.5px solid ${INK};}
        .g-faq summary{font-family:var(--font-anton),'Anton',sans-serif;font-size:clamp(16px,2vw,19px);letter-spacing:.5px;padding:22px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:20px;}
        .g-faq summary::-webkit-details-marker{display:none}
        .g-faq summary::after{content:'+';font-size:26px;color:${ACCENT};flex:none}
        .g-faq[open] summary::after{content:'—';font-size:18px}
        @media (prefers-reduced-motion:reduce){.g-marquee{animation:none}.g-btn{transition:none}}
      `,
                }}
            />

            <Header />

            {/* ══ HERO ══ */}
            <section className="g-dotgrid px-6 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
                    <div>
                        <div
                            className="inline-flex items-center gap-2.5 bg-[#0a0a0a] text-[#F2EBDA] font-anton text-xs tracking-[2px] px-3.5 py-2 mb-5 -rotate-[1.5deg] border-[2.5px] border-[#0a0a0a]"
                            style={{ boxShadow: `4px 4px 0 ${ACCENT}` }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: ACCENT }} />
                            CHRISTMAS IN SEPTEMBER · 2026
                        </div>

                        <h1 className="font-anton text-[46px] sm:text-[62px] md:text-[82px] leading-[0.88] uppercase mb-6">
                            WE&rsquo;RE GIVING
                            <br />
                            ONE SMALL BUSINESS
                            <br />
                            A <span style={{ color: ACCENT }}>$44,000</span>
                            <br />
                            HEAD START.
                        </h1>

                        <p className="text-base text-[#5a5a5a] leading-[1.65] max-w-[520px] mb-7">
                            A brand-new website. A full year of marketing. A real growth strategy.{" "}
                            <strong className="text-[#0a0a0a]">One winner. Zero cost.</strong> Because we got
                            tired of watching great businesses lose to worse ones with better websites.
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            {isOpen ? (
                                <TrackedCta
                                    position="hero"
                                    href="#enter"
                                    className="g-btn inline-block text-white font-anton text-sm tracking-[1.5px] px-7 py-4"
                                    style={{ background: ACCENT }}
                                >
                                    ENTER TO WIN →
                                </TrackedCta>
                            ) : (
                                <span className="g-btn inline-block bg-[#0a0a0a] text-[#F2EBDA] font-anton text-sm tracking-[1.5px] px-7 py-4 cursor-default">
                                    WINNER ANNOUNCED SEPT 25
                                </span>
                            )}
                            <span className="font-anton text-[11px] tracking-[1.8px] text-[#5a5a5a]">
                                FREE TO ENTER · NO PURCHASE NECESSARY · 2 MINUTES
                            </span>
                        </div>

                        <Countdown deadlineIso={ENTRY_DEADLINE.toISOString()} phase={phase} />
                    </div>

                    {/* Campaign video — replaces the itemised prize card. The same
                        breakdown still appears in full in "What's in the box" below,
                        so no value detail is lost from the page. */}
                    <div className="mt-8 lg:mt-0">
                        <HeroVideo gated />
                        <p className="text-[10px] leading-[1.5] text-[#8a8378] mt-4 max-w-[520px]">
                            {AD_SPEND_FOOTNOTE}
                        </p>
                    </div>
                </div>
            </section>

            {/* ══ MARQUEE ══ */}
            <section className="bg-[#0a0a0a] text-[#F2EBDA] overflow-hidden py-3.5">
                <div className="g-marquee">
                    {[0, 1].map((rep) => (
                        <div
                            key={rep}
                            className="flex items-center font-anton text-[15px] tracking-[2px] whitespace-nowrap select-none"
                            aria-hidden={rep === 1}
                        >
                            {MARQUEE.map((word, i) => (
                                <span key={`${rep}-${i}`} className="flex items-center">
                                    <span className="px-3.5">{word}</span>
                                    <span className="px-3.5" style={{ color: ACCENT }}>
                                        ★
                                    </span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ WHAT'S IN THE BOX ══ */}
            <section id="prize" className="g-dotgrid px-6 md:px-12 py-16 md:py-[90px]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: ACCENT }}>
                            — WHAT&rsquo;S IN THE BOX —
                        </div>
                        <h2 className="font-anton text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] uppercase">
                            EVERYTHING WE&rsquo;D BUILD FOR A
                            <br />
                            PAYING CLIENT. <span style={{ color: ACCENT }}>FOR FREE.</span>{" "}
                            <span className="font-lobster text-[22px] -rotate-3 inline-block align-middle normal-case" style={{ color: ACCENT }}>
                                the real thing
                            </span>
                        </h2>
                        <p className="text-[15px] leading-[1.6] max-w-[620px] mt-4.5 text-[#5a5a5a]">
                            This isn&rsquo;t a template and a coupon. It&rsquo;s the same website, the same
                            marketing program, and the same strategy work our clients pay for — handed to one
                            business for a full year.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 01 — website */}
                        <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-7">
                            <div className="font-anton text-[11px] tracking-[2.5px]" style={{ color: ACCENT }}>
                                01 · THE WEBSITE
                            </div>
                            <h3 className="font-anton text-[26px] sm:text-[28px] leading-[0.95] my-2.5 mb-3.5 uppercase">
                                A CUSTOM SITE BUILT TO MAKE THE PHONE RING.
                            </h3>
                            <p className="text-sm text-[#5a5a5a] leading-[1.65] mb-4.5">
                                Designed around your business, not a template. Fast, mobile-first, and built for
                                search from day one.
                            </p>
                            <ul className="list-none p-0 mb-5">
                                {WEBSITE_BULLETS.map((b) => (
                                    <li
                                        key={b}
                                        className="text-[13.5px] leading-[1.5] py-1.5 pl-[22px] relative border-t border-[#0a0a0a]/12"
                                    >
                                        <span className="absolute left-0 top-1.5 text-xs" style={{ color: ACCENT }}>
                                            ★
                                        </span>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                            <div className="font-anton text-[13px] tracking-[1.5px] border-t-[2.5px] border-[#0a0a0a] pt-3.5 flex justify-between">
                                <span>VALUE</span>
                                <b className="text-xl" style={{ color: ACCENT }}>
                                    $8,000
                                </b>
                            </div>
                        </div>

                        {/* 02 — Growth Max, featured */}
                        <div
                            className="lg:col-span-2 border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-7"
                            style={{ background: YELLOW }}
                        >
                            <div className="font-anton text-[11px] tracking-[2.5px] text-[#0a0a0a]">
                                02 · GROWTH MAX MARKETING PACKAGE · 12 MONTHS
                            </div>
                            <h3 className="font-anton text-[26px] sm:text-[28px] leading-[0.95] my-2.5 mb-3.5 uppercase">
                                A FULL YEAR OF OUR BIGGEST PACKAGE, WORKING ON YOUR LEADS.
                            </h3>
                            <p className="text-sm text-[#3a3520] leading-[1.65] mb-4.5">
                                Growth Max is the top-tier program our clients pay $3,000 a month for. SEO,
                                digital advertising, AI tools, and a CRM that tracks every lead — all managed by
                                us, plus a kickoff strategy workshop and quarterly strategy sessions with Josh
                                &amp; Dave. You take the calls.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                                {GROWTH_MAX_TILES.map((t) => (
                                    <div
                                        key={t.title}
                                        className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] px-4.5 py-4"
                                    >
                                        <div className="font-anton text-base tracking-[0.5px] flex justify-between items-baseline gap-2.5">
                                            <span>{t.title}</span>
                                            <span className="whitespace-nowrap text-right" style={{ color: ACCENT }}>
                                                {t.value}
                                                <small className="block font-inter text-[10px] text-[#5a5a5a] tracking-normal font-medium">
                                                    {t.mo}
                                                </small>
                                            </span>
                                        </div>
                                        <p className="text-[12.5px] text-[#5a5a5a] leading-[1.55] mt-2">{t.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="font-anton text-[13px] tracking-[1.5px] border-t-[2.5px] border-[#0a0a0a] pt-3.5 flex justify-between">
                                <span>VALUE</span>
                                <span>
                                    <b className="text-xl text-[#0a0a0a]">$36,000</b>
                                    <span className="text-[11px] text-[#3a3520] tracking-[1px] ml-2">
                                        ($3,000/MO × 12)
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total band */}
                    <div
                        className="mt-11 bg-[#0a0a0a] text-[#F2EBDA] border-[3px] border-[#0a0a0a] px-6 sm:px-10 py-7 flex flex-wrap justify-between items-center gap-7"
                        style={{ boxShadow: `10px 10px 0 ${ACCENT}` }}
                    >
                        <div className="font-anton text-2xl sm:text-3xl leading-none">
                            TOTAL VALUE: <span style={{ color: YELLOW }}>$44,000</span>
                        </div>
                        <div className="text-[13px] text-[#a0998a] max-w-[520px] leading-[1.6]">
                            Website + 12 months of Growth Max, with strategy sessions included. Full details in
                            the{" "}
                            <a href="#rules" className="underline text-[#F2EBDA]">
                                Official Rules
                            </a>
                            .
                        </div>
                    </div>

                    <p className="text-[10px] leading-[1.6] text-[#8a8378] mt-4 max-w-[900px]">
                        {TOTAL_BAND_FINEPRINT}
                    </p>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section id="how" className="bg-[#0e0e0e] text-[#F2EBDA] px-6 md:px-12 py-16 md:py-[90px]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: YELLOW }}>
                            — HOW IT WORKS —
                        </div>
                        <h2 className="font-anton text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] uppercase text-white">
                            THREE STEPS. NO <span style={{ color: YELLOW }}>CATCH</span>.
                        </h2>
                        <p className="text-[15px] leading-[1.6] max-w-[620px] mt-4.5 text-[#d4ccb8]">
                            No purchase, no pitch, no &ldquo;just hop on a quick call first.&rdquo; Fill out the
                            form and you&rsquo;re in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
                        {STEPS.map((s) => (
                            <div
                                key={s.n}
                                className="border-[2.5px] px-6 pt-9 pb-7 relative"
                                style={{ borderColor: YELLOW }}
                            >
                                <div
                                    className="absolute -top-[22px] left-[22px] w-11 h-11 rounded-full flex items-center justify-center font-anton text-xl border-[3px] border-[#0e0e0e]"
                                    style={{
                                        background: s.hot ? ACCENT : YELLOW,
                                        color: s.hot ? "#fff" : INK,
                                    }}
                                >
                                    {s.n}
                                </div>
                                <h3 className="font-anton text-[22px] mt-1.5 mb-2.5 text-[#F2EBDA] uppercase">
                                    {s.title}
                                </h3>
                                <p className="text-[13.5px] text-[#a0998a] leading-[1.65]">{s.body}</p>
                                <div
                                    className="font-anton text-[10px] tracking-[2px] mt-3.5"
                                    style={{ color: YELLOW }}
                                >
                                    {s.when}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ WHO SHOULD ENTER ══ */}
            <section id="who" className="g-dotgrid px-6 md:px-12 py-16 md:py-[90px]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div>
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: ACCENT }}>
                            — WHO SHOULD ENTER —
                        </div>
                        <h2 className="font-anton text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] uppercase">
                            ANY SMALL BUSINESS
                            <br />
                            IN THE <span style={{ color: ACCENT }}>U.S.</span>
                        </h2>
                        <p className="text-[15px] leading-[1.65] mt-4.5 text-[#5a5a5a] max-w-[560px]">
                            Plumbers, bakeries, law offices, gyms, boutiques, contractors, dentists — if
                            you&rsquo;re a small business owner anywhere in the United States, you&rsquo;re
                            eligible. Doesn&rsquo;t matter if you have no website or a website you&rsquo;re
                            embarrassed by. We&rsquo;ll build from wherever you&rsquo;re standing.
                        </p>
                        <div
                            className="mt-6 inline-flex items-center gap-2.5 border-[2.5px] border-[#0a0a0a] px-4.5 py-3 font-anton text-xs tracking-[1.2px] -rotate-1"
                            style={{ background: YELLOW }}
                        >
                            ⚡ ONE ENTRY PER BUSINESS · MUST BE 18+ · U.S. ONLY
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {WHO_TILES.map((t) => (
                            <div
                                key={t}
                                className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] px-4 py-3.5 font-anton text-[13px] tracking-[1px] flex gap-2.5 items-center"
                            >
                                <span className="text-base" style={{ color: ACCENT }}>
                                    ✓
                                </span>
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ ENTRY FORM ══ */}
            <section id="enter" className="g-dotgrid bg-[#E8E1CF] px-6 md:px-12 py-16 md:py-[90px] scroll-mt-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-[70px] items-start">
                    <div>
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: ACCENT }}>
                            — ENTER THE GIVEAWAY —
                        </div>
                        <h2 className="font-anton text-[40px] sm:text-[52px] md:text-[62px] leading-[0.88] uppercase mb-5">
                            THROW YOUR
                            <br />
                            HAT IN
                            <br />
                            THE <span style={{ color: ACCENT }}>RING</span>.
                        </h2>
                        <p className="text-[15px] text-[#5a5a5a] leading-[1.65] max-w-[460px] mb-7">
                            A few quick fields. We&rsquo;ll confirm your entry by email, announce the winner on
                            September 25, and that&rsquo;s it. Nobody&rsquo;s going to blow up your phone.
                        </p>
                        <ul className="list-none p-0 m-0">
                            {[
                                "NO PURCHASE. NO CREDIT CARD. NO CATCH.",
                                "NO SALES CALLS BECAUSE YOU ENTERED",
                                "WE NEVER SELL OR SHARE YOUR INFO",
                            ].map((t, i, arr) => (
                                <li
                                    key={t}
                                    className={`font-anton text-[13px] tracking-[1px] py-3 border-t-2 border-[#0a0a0a] flex gap-3 items-center ${i === arr.length - 1 ? "border-b-2" : ""}`}
                                >
                                    <span className="text-lg" style={{ color: ACCENT }}>
                                        ✕
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                        <div
                            className="mt-6 inline-flex items-center gap-2.5 border-[2.5px] border-[#0a0a0a] px-4.5 py-3 font-anton text-xs tracking-[1.2px] -rotate-1"
                            style={{ background: YELLOW }}
                        >
                            🎁 ENTRIES CLOSE SEPT 24 AT 11:59 PM ET
                        </div>
                    </div>

                    <EntryForm phase={phase} />
                </div>
            </section>

            {/* ══ FAQ ══ */}
            <section id="faq" className="g-dotgrid px-6 md:px-12 py-16 md:py-[90px]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-5">
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: ACCENT }}>
                            — QUESTIONS, ANSWERED —
                        </div>
                        <h2 className="font-anton text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] uppercase">
                            &ldquo;OKAY, WHAT&rsquo;S THE <span style={{ color: ACCENT }}>CATCH</span>?&rdquo;
                        </h2>
                    </div>
                    <div className="max-w-[860px]">
                        {FAQS.map((f, i) => (
                            <details key={f.q} className="g-faq" open={i === 0}>
                                <summary>{f.q}</summary>
                                <p className="text-[14.5px] text-[#5a5a5a] leading-[1.7] pb-6 max-w-[720px] -mt-1">
                                    {f.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ OFFICIAL RULES ══ */}
            <section id="rules" className="bg-[#E8E1CF] px-6 md:px-12 py-16 md:py-[90px] scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <div className="font-anton text-[13px] tracking-[2.5px] mb-3.5" style={{ color: ACCENT }}>
                            — THE FINE PRINT —
                        </div>
                        <h2 className="font-anton text-[36px] sm:text-[44px] md:text-[54px] leading-[0.92] uppercase">
                            OFFICIAL <span style={{ color: ACCENT }}>RULES</span>.{" "}
                            <span className="font-lobster text-[22px] -rotate-3 inline-block align-middle normal-case" style={{ color: ACCENT }}>
                                short and honest
                            </span>
                        </h2>
                    </div>
                    <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] px-5 sm:px-9 py-8 max-w-[900px] text-[13px] leading-[1.7] text-[#5a5a5a]">
                        <h3 className="font-anton text-xl tracking-[1px] mb-3.5 text-[#0a0a0a] uppercase">
                            CHRISTMAS IN SEPTEMBER GIVEAWAY — OFFICIAL RULES
                        </h3>
                        <ol className="pl-5 m-0 list-decimal">
                            {RULES.map((r) => (
                                <li key={r.title} className="mb-2.5">
                                    <b className="text-[#0a0a0a]">{r.title}</b> <RulesText body={r.body} />
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <section
                className="px-6 md:px-12 py-16 md:py-[90px] text-center text-white border-t-[3px] border-[#0a0a0a]"
                style={{ background: ACCENT }}
            >
                <h2 className="font-anton text-[38px] sm:text-[52px] md:text-[72px] leading-[0.88] uppercase mb-5">
                    {isOpen ? (
                        <>
                            DON&rsquo;T BUY A LOTTERY TICKET.
                            <br />
                            ENTER THIS INSTEAD.
                        </>
                    ) : (
                        <>MISSED IT? LET&rsquo;S TALK ANYWAY.</>
                    )}
                </h2>
                <p className="text-[15px] max-w-[520px] mx-auto mb-7 leading-[1.6]">
                    Better odds, better prize, and even if you don&rsquo;t win you&rsquo;ll hear from two people
                    who actually want your business to grow.
                </p>
                {isOpen ? (
                    <TrackedCta
                        position="final"
                        href="#enter"
                        className="g-btn inline-block font-anton text-sm tracking-[1.5px] px-7 py-4 text-[#0a0a0a]"
                        style={{ background: YELLOW }}
                    >
                        ENTER TO WIN →
                    </TrackedCta>
                ) : (
                    <Link
                        href="/contact"
                        prefetch={false}
                        className="g-btn inline-block font-anton text-sm tracking-[1.5px] px-7 py-4 text-[#0a0a0a]"
                        style={{ background: YELLOW }}
                    >
                        LET&rsquo;S TALK →
                    </Link>
                )}
            </section>

            <Footer />

            {isOpen && <StickyCta />}
            {isOpen && <IntroGate />}
        </div>
    );
}
