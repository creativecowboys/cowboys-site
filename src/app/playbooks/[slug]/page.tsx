import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { PLAYBOOKS } from "@/lib/playbooks";
import PlaybookForm from "./PlaybookForm";
import BookMockup from "./BookMockup";
import { REVIEWS, ReviewCard } from "./ReviewCards";

/**
 * Free playbook landing page: the one-screen form page from the funnel spec
 * (Free Playbooks / "Playbook concepts (2026-09-22).md", section 6, step 2).
 *
 * Reached from paid ads and social. A dead end by design: logo, phone, the
 * headline, the delivery promise, the eight-field form, the consent line, two
 * reviews, and nothing else. Noindex so it never competes with /local-seo.
 */

const PHONE_DISPLAY = "(470) 243-7517";
const PHONE_TEL = "tel:4702437517";



const STYLES = `
.pb-dotgrid{background-image:radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);background-size:18px 18px;}
.pb-btn{border:2.5px solid #0a0a0a;box-shadow:4px 4px 0 #0a0a0a;transition:transform .18s ease,box-shadow .18s ease;}
.pb-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #0a0a0a;}
.pb-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #0a0a0a;}
`;

export function generateStaticParams() {
    return Object.keys(PLAYBOOKS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pb = PLAYBOOKS[slug];
    if (!pb) return {};
    return {
        title: `${pb.title} (Free)`,
        description: pb.sub,
        alternates: { canonical: `/playbooks/${pb.slug}` },
        robots: { index: false, follow: false },
        openGraph: { title: pb.title, description: pb.sub },
    };
}

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pb = PLAYBOOKS[slug];
    if (!pb) notFound();

    return (
        <div className="font-inter bg-[#F2EBDA] text-[#0a0a0a] selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative">
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />

            <header className="w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12">
                <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
                    <Link href="/" className="inline-block select-none" prefetch={false}>
                        <Image
                            src="/Cowboys logo script 2026 v2.png"
                            alt="Creative Cowboys"
                            width={380}
                            height={110}
                            priority
                            className="w-36 sm:w-48 h-auto object-contain"
                            style={{ filter: "brightness(0) invert(1)" }}
                        />
                    </Link>
                    <a
                        href={PHONE_TEL}
                        className="pb-btn border-[#F2EBDA] bg-[#B5330E] text-white font-anton tracking-[1.5px] px-4 md:px-6 py-2.5 text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#F2EBDA] hover:shadow-[6px_6px_0px_#F2EBDA]"
                    >
                        <Phone size={15} />
                        <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
                        <span className="sm:hidden">Call</span>
                    </a>
                </div>
            </header>

            <main className="relative w-full px-5 md:px-12 py-10 md:py-16 overflow-hidden">
                <div className="absolute inset-0 pb-dotgrid pointer-events-none" />
                <div className="relative max-w-5xl mx-auto flex flex-col gap-12 md:gap-16">
                    {/* Hero: words left, the book right */}
                    <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <span className="self-start font-anton text-[12px] tracking-[2.5px] uppercase px-3 py-1.5 border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] bg-[#F5C842]">
                                {pb.eyebrow}
                            </span>
                            <h1 className="font-anton uppercase text-[38px] sm:text-[50px] lg:text-[58px] leading-[0.92] tracking-tight">
                                {pb.headline[0]}
                                <span className="block text-[#B5330E]">{pb.headline[1]}</span>
                            </h1>
                            <p className="text-base md:text-lg text-[#0a0a0a]/80 leading-relaxed max-w-xl">{pb.sub}</p>
                            <div className="font-anton text-[13px] tracking-[2px] uppercase text-[#B5330E]">
                                Texted and emailed to you in 60 seconds
                            </div>
                            <a
                                href="#get"
                                className="pb-btn self-start inline-flex items-center gap-2 font-anton text-sm tracking-[1.5px] px-6 py-3.5 bg-[#B5330E] text-white lg:hidden"
                            >
                                GET THE PLAYBOOK
                            </a>
                        </div>
                        {pb.mockup ? (
                            <div className="flex justify-center lg:justify-end">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={pb.mockup} alt={`${pb.title}, paperback`} className="w-full max-w-[440px] h-auto" loading="eager" decoding="async" />
                            </div>
                        ) : pb.cover ? (
                            <div className="flex justify-center lg:justify-end lg:pr-8 pt-4 pb-8">
                                <BookMockup src={pb.cover} alt={`${pb.title}, paperback cover`} className="bk-lg" />
                            </div>
                        ) : null}
                    </section>

                    {/* What's inside on the left, the form on the right */}
                    <section id="get" className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center scroll-mt-6">
                        <div className="flex flex-col gap-6 order-2 lg:order-1">
                            <h2 className="font-anton uppercase text-3xl sm:text-4xl leading-none">What&rsquo;s in it</h2>
                            <ul className="flex flex-col gap-4 max-w-xl">
                                {pb.inside.map((line) => (
                                    <li key={line} className="flex gap-3 items-start text-[16px] leading-snug">
                                        <span className="mt-[2px] flex-none w-6 h-6 border-[2.5px] border-[#0a0a0a] bg-[#F5C842] inline-flex items-center justify-center">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 lg:order-2">
                            <PlaybookForm playbook={pb} />
                        </div>
                    </section>

                    {/* Reviews, full width, side by side */}
                    <section className="flex flex-col gap-6">
                        <h2 className="font-anton uppercase text-2xl sm:text-3xl leading-none">From two of our clients</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {REVIEWS.map((r) => (
                                <ReviewCard key={r.who} r={r} />
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="w-full border-t-4 border-[#0a0a0a] bg-[#0a0a0a] text-[#F2EBDA] px-6 md:px-12 py-6">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-3 text-xs text-[#F2EBDA]/70">
                    <span>Creative Cowboys · Villa Rica, GA · Franklin, TN · {PHONE_DISPLAY}</span>
                    <span className="flex gap-4">
                        <Link href="/privacy-policy" className="hover:text-[#F5C842]">Privacy</Link>
                        <Link href="/sms-terms" className="hover:text-[#F5C842]">Texting terms</Link>
                    </span>
                </div>
            </footer>
        </div>
    );
}
