import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import { Check, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "../offer";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

/**
 * Where the GoHighLevel payment links send a client after the first month is paid. The onboarding
 * link itself comes by email a couple of minutes later (workflow FWP-01 mints it after payment),
 * so this page's one job is to say that, and what happens next.
 */
export const metadata: Metadata = {
    title: "You're In — Check Your Email",
    robots: { index: false, follow: false },
};

const NEXT = [
    { title: "Check your email", body: "Within a few minutes you'll get a link to a 10-minute chat: your business, your logo, your colors. Everything saves as you go." },
    { title: "We build it", body: "Once that's done we start. You get a preview link to look over, with one round of changes." },
    { title: "It goes live", body: "You approve it, we launch it on your domain. Most websites go live within 2 weeks." },
];

export default function FreeWebsiteThanksPage() {
    return (
        <div className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter min-h-screen flex flex-col`}>
            <header className="w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <Link href="/" className="inline-block" prefetch={false}>
                        <Image src="/Cowboys logo script 2026 v2.png" alt="Creative Cowboys" width={380} height={110} priority className="w-40 sm:w-52 h-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                    </Link>
                    <a href={PHONE_HREF} className="border-[3px] border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 md:px-6 py-2.5 uppercase tracking-wider text-xs md:text-sm inline-flex items-center gap-2">
                        <Phone size={15} /> {PHONE_DISPLAY}
                    </a>
                </div>
            </header>

            <main className="flex-1 w-full px-6 md:px-12 py-16 md:py-24">
                <div className="max-w-3xl mx-auto flex flex-col gap-8">
                    <div className="w-14 h-14 bg-[#008f4c] border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-[3px_3px_0px_#1a1a1a]">
                        <Check size={26} className="text-white" strokeWidth={3} />
                    </div>
                    <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-tight">
                        You&rsquo;re in.<span className="block text-[#B5330E]">Check your email.</span>
                    </h1>
                    <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-xl leading-relaxed">
                        Your first month is paid and your build slot is held. The next step comes by email in the next few minutes: a link to the short onboarding chat where you tell us about your business.
                    </p>
                    <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {NEXT.map((s, i) => (
                            <li key={s.title} className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-6 flex flex-col gap-2">
                                <span className="font-anton text-3xl text-[#B5330E] leading-none">0{i + 1}</span>
                                <h2 className="font-anton text-xl uppercase tracking-wide leading-tight">{s.title}</h2>
                                <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">{s.body}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="font-inter text-sm text-[#0a0a0a]/65 leading-relaxed max-w-xl">
                        No email after 15 minutes? Check spam for a message from Josh at Creative Cowboys, or call{" "}
                        <a href={PHONE_HREF} className="font-bold text-[#B5330E] underline">{PHONE_DISPLAY}</a> and we&rsquo;ll send the link by text.
                    </p>
                </div>
            </main>
        </div>
    );
}
