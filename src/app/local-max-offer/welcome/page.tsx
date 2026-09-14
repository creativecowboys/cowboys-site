import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import CalendlyEmbed from "../CalendlyEmbed";
import { CALENDLY_URL, PHONE_DISPLAY, PHONE_TEL } from "../content";

/**
 * Where the checkout sends people after they pay: book the 15-minute
 * onboarding call. Also reachable from the offer page for anyone who paid
 * and closed the tab. Set this URL as the payment link's post-purchase redirect.
 */

export const metadata: Metadata = {
    title: "You're in — book your onboarding call",
    robots: { index: false, follow: false },
};

const ACCENT = "#B5330E";
const YELLOW = "#F5C842";

const NEXT = [
    "Pick a 15-minute slot below. Josh or Dave will be on it.",
    "Check your inbox in a few minutes for your welcome email and onboarding link.",
    "Onboarding takes about 15 minutes online and saves as you go.",
    "Your build starts as soon as it's complete. Live in about three weeks.",
];

export default function LocalMaxWelcomePage() {
    return (
        <div className="font-inter bg-[#F2EBDA] text-[#0a0a0a] min-h-screen md:pt-[36px]">
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
                    <a href={PHONE_TEL} className="font-anton tracking-[1.5px] text-[#F2EBDA] text-sm">
                        {PHONE_DISPLAY}
                    </a>
                </div>
            </header>

            <section className="w-full py-14 md:py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
                    <div className="flex flex-col gap-5">
                        <span
                            className="self-start font-anton text-[12px] tracking-[2.5px] uppercase px-3 py-1.5 border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                            style={{ background: YELLOW }}
                        >
                            Local Max
                        </span>
                        <h1 className="font-anton uppercase text-[44px] sm:text-[56px] md:text-[68px] leading-[0.9]">
                            You&rsquo;re in.
                            <span className="block" style={{ color: ACCENT }}>
                                Book your call.
                            </span>
                        </h1>
                        <p className="text-[#5a5a5a] leading-relaxed text-base md:text-lg">
                            Fifteen minutes with our team so we start your site with the right picture of
                            your business. Grab whatever slot works.
                        </p>
                        <ul className="flex flex-col gap-3 mt-2">
                            {NEXT.map((t) => (
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
                        <p className="text-sm text-[#5a5a5a] mt-2">
                            Questions before then? Call{" "}
                            <a href={PHONE_TEL} className="font-bold underline" style={{ color: ACCENT }}>
                                {PHONE_DISPLAY}
                            </a>
                            .
                        </p>
                    </div>
                    <CalendlyEmbed url={CALENDLY_URL} />
                </div>
            </section>

            <footer className="w-full bg-[#0e0e0e] text-[#F2EBDA]/60 text-xs py-8 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">Creative Cowboys Media · Villa Rica, GA · Franklin, TN</div>
            </footer>
        </div>
    );
}
