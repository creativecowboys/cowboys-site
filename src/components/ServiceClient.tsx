import Link from "next/link";
import { Anton } from "next/font/google";
import { ArrowUpRight, Check } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

export type ServiceFeature = { label: string; desc: string };
export type ServiceFaq = { q: string; a: string };

export type ServiceData = {
    /** small eyebrow above the H1, e.g. "Google Ads · PPC" */
    eyebrow: string;
    /** first line(s) of the hero headline (uppercase) */
    titleLead: string;
    /** highlighted (orange) tail of the headline (uppercase) */
    titleHighlight: string;
    /** hero paragraph */
    subhead: string;
    /** the included capabilities */
    features: ServiceFeature[];
    /** heading over the features grid; defaults to "WHAT'S INCLUDED." */
    featuresHeading?: string;
    /** words for the scrolling marquee */
    marquee: string[];
    /** optional FAQ */
    faqs?: ServiceFaq[];
    /** closing CTA headline (uppercase) */
    ctaHeadline: string;
    /** closing CTA sub-line */
    ctaSub?: string;
};

const STATS = [
    { value: "1.4s", label: "Avg Page Load", color: "#005eb8" },
    { value: "100+", label: "Sites Shipped", color: "#008f4c" },
    { value: "$2M+", label: "Client Revenue", color: "#B5330E" },
];

export default function ServiceClient({ data }: { data: ServiceData }) {
    const marquee = data.marquee.length ? data.marquee : ["NO FLUFF", "REAL RESULTS", "WEST GEORGIA"];
    return (
        <div className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative flex flex-col`}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .svc-dotgrid{background-image:radial-gradient(rgba(26,26,26,0.12) 1.5px,transparent 1.5px);background-size:24px 24px;}
        .svc-card{border:4px solid #0a0a0a;box-shadow:6px 6px 0px #1a1a1a;transition:transform .18s ease,box-shadow .18s ease;}
        .svc-card:hover{transform:translate(-4px,-4px);box-shadow:10px 10px 0px #1a1a1a;}
        .svc-btn{border:3px solid #0a0a0a;box-shadow:4px 4px 0px #1a1a1a;transition:all .18s ease;}
        .svc-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0px #1a1a1a;}
        .svc-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #1a1a1a;}
        @keyframes svcMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .svc-marquee{display:flex;width:max-content;animation:svcMarquee 35s linear infinite;}
        .svc-faq{border-bottom:2.5px solid #0a0a0a;}
        .svc-faq summary{font-family:var(--font-anton),'Anton',sans-serif;font-size:clamp(17px,2.2vw,22px);letter-spacing:.4px;text-transform:uppercase;padding:22px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;}
        .svc-faq summary::-webkit-details-marker{display:none}
        .svc-faq summary::after{content:'+';font-size:26px;color:#B5330E;flex:none}
        .svc-faq[open] summary::after{content:'—';font-size:18px}
        @media (prefers-reduced-motion:reduce){.svc-marquee{animation:none}.svc-card{transition:none}}
      `,
                }}
            />

            <Header />

            {/* Hero */}
            <section className="relative w-full py-16 md:py-24 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 svc-dotgrid pointer-events-none opacity-80" />
                <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">{data.eyebrow}</span>
                        <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-tight">
                            {data.titleLead}{" "}
                            <span className="text-[#B5330E]">{data.titleHighlight}</span>
                        </h1>
                        <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-xl leading-relaxed">{data.subhead}</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <Link href="/contact" className="svc-btn bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2">
                                Get A Proposal <ArrowUpRight size={18} />
                            </Link>
                            <Link href="/results" className="svc-btn bg-[#F2EBDA] text-[#0a0a0a] font-bold px-8 py-4 uppercase tracking-wider text-sm">
                                See Our Results
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t-2 border-[#0a0a0a]/20 pt-8 mt-4 max-w-lg">
                            {STATS.map((s) => (
                                <div key={s.label}>
                                    <span className="font-anton text-3xl sm:text-4xl block" style={{ color: s.color }}>{s.value}</span>
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Poster card */}
                    <div className="lg:col-span-5 flex justify-center items-center">
                        <div className="svc-card bg-[#0a0a0a] p-8 text-[#F2EBDA] w-full max-w-[420px] aspect-[3/4] flex flex-col justify-between -rotate-2">
                            <div className="flex justify-between items-start">
                                <span className="font-anton text-2xl uppercase tracking-widest opacity-80 border-b-2 border-[#F2EBDA] pb-1">COWBOYS</span>
                                <span className="border-2 border-[#F2EBDA] rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">NO FLUFF</span>
                            </div>
                            <div className="my-8 flex flex-col gap-2">
                                <span className="font-inter text-xs uppercase tracking-widest font-bold text-[#F5C842]">{data.eyebrow}</span>
                                <span className="font-anton text-4xl md:text-5xl leading-[0.95] uppercase text-[#F2EBDA]">{data.titleLead} {data.titleHighlight}</span>
                            </div>
                            <div className="border-t-2 border-[#F2EBDA]/20 pt-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                <span>West Georgia</span>
                                <span>Est. 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="w-full bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a] overflow-hidden py-4">
                <div className="svc-marquee">
                    {[0, 1].map((rep) => (
                        <div key={rep} className="flex gap-16 items-center pr-16 font-anton text-2xl md:text-3xl uppercase tracking-widest select-none whitespace-nowrap" aria-hidden={rep === 1}>
                            {marquee.map((word, i) => (
                                <span key={`${rep}-${i}`} className="flex items-center gap-16">
                                    <span>{word}</span>
                                    <span className={i % 2 === 0 ? "text-[#B5330E]" : "text-[#F5C842]"}>★</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="w-full py-14 md:py-20 px-6 md:px-12 relative">
                <div className="absolute inset-0 svc-dotgrid pointer-events-none opacity-60" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="flex flex-col pb-8">
                        <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">What You Get</span>
                        <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none mt-1">{data.featuresHeading ?? "WHAT'S INCLUDED."}</h2>
                        <div className="h-1.5 w-16 bg-[#B5330E] mt-3" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.features.map((f, i) => (
                            <div key={f.label} className="svc-card bg-white p-6 flex flex-col gap-3">
                                <span className="font-anton text-3xl text-[#B5330E] leading-none">{String(i + 1).padStart(2, "0")}</span>
                                <h3 className="font-anton text-xl md:text-2xl uppercase tracking-wide leading-tight">{f.label}</h3>
                                <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            {data.faqs && data.faqs.length > 0 && (
                <section className="w-full py-14 md:py-20 px-6 md:px-12 bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a]">
                    <div className="max-w-3xl mx-auto">
                        <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest">FAQ</span>
                        <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none mt-1 mb-8">QUESTIONS ASKED.</h2>
                        <div className="flex flex-col">
                            {data.faqs.map((faq) => (
                                <details key={faq.q} className="svc-faq">
                                    <summary className="text-[#F2EBDA]">{faq.q}</summary>
                                    <p className="font-inter text-sm md:text-base text-[#F2EBDA]/70 leading-relaxed pb-6 -mt-1">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA band */}
            <section className="w-full py-16 md:py-24 px-6 md:px-12 bg-[#B5330E] text-[#F2EBDA] border-b-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                    <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none text-white">{data.ctaHeadline}</h2>
                    {data.ctaSub && <p className="font-inter text-base md:text-lg text-[#F2EBDA]/90 max-w-xl">{data.ctaSub}</p>}
                    <div className="flex flex-wrap gap-4 justify-center mt-2">
                        <Link href="/contact" className="svc-btn border-[#F2EBDA] bg-[#0a0a0a] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2 shadow-[4px_4px_0px_#f3efe0]">
                            Get A Free Proposal <ArrowUpRight size={18} />
                        </Link>
                        <a href="tel:4702437517" className="svc-btn border-[#F2EBDA] bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2 shadow-[4px_4px_0px_#f3efe0]">
                            <Check size={16} /> (470) 243-7517
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
