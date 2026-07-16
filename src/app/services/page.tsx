import type { Metadata } from "next";
import Link from "next/link";
import { Anton } from "next/font/google";
import { ArrowUpRight, Check } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

export const metadata: Metadata = {
    title: "Digital Marketing Services in West Georgia",
    description:
        "Web design, SEO, Google Ads, social media, branding, and content — everything a West Georgia small business needs to get found and grow. Creative Cowboys, Villa Rica, GA.",
    alternates: { canonical: "/services" },
    openGraph: {
        title: "Digital Marketing Services in West Georgia | Creative Cowboys",
        description: "Web design, SEO, PPC, social media, branding & content for West Georgia small businesses.",
    },
};

const services = [
    {
        label: "Web Design",
        href: "/web-design",
        tile: "#B5330E",
        tagline: "Sites that sell",
        description: "Custom-designed, conversion-focused websites built to turn visitors into customers. Fast, mobile-first, and SEO-ready from day one.",
        bullets: ["Custom design — no templates", "Mobile-first & lightning fast", "Built to convert, not just look good"],
    },
    {
        label: "Google Ads & PPC",
        href: "/ppc",
        tile: "#005eb8",
        tagline: "More leads, more revenue",
        description: "Google Ads and paid traffic strategies designed to bring qualified buyers to your business — not just clicks. Every dollar tracked.",
        bullets: ["Google & Meta Ads management", "ROI-focused strategy", "Transparent reporting"],
    },
    {
        label: "SEO",
        href: "/seo",
        tile: "#008f4c",
        tagline: "Own your market",
        description: "Rank higher on Google and drive consistent organic traffic. We handle technical SEO, content strategy, and local search optimization.",
        bullets: ["Local SEO for Villa Rica & beyond", "Technical & on-page optimization", "Long-term sustainable growth"],
    },
    {
        label: "Branding",
        href: "/brand-strategy",
        tile: "#F5C842",
        tagline: "Look the part",
        description: "Logo design, brand identity, and visual systems that make your business look professional and memorable from the first click.",
        bullets: ["Logo & identity design", "Brand guidelines & assets", "Cohesive look across all channels"],
    },
    {
        label: "Social Media Ads",
        href: "/social-media-ads",
        tile: "#B5330E",
        tagline: "Stay top of mind",
        description: "Targeted social media advertising and content strategies that keep your brand in front of prospects and turn followers into customers.",
        bullets: ["Facebook, Instagram & TikTok", "Content strategy & scheduling", "Audience growth & engagement"],
    },
    {
        label: "Video, Photo & Design",
        href: "/media-creation",
        tile: "#005eb8",
        tagline: "Tell your story",
        description: "Scroll-stopping video, photography, and graphic design — the local proof that turns lookers into buyers across every channel.",
        bullets: ["Business video & photography", "Graphic design for marketing", "Reels & short-form content"],
    },
];

const stats = [
    { value: "2–4 wks", label: "Average launch time", color: "#005eb8" },
    { value: "100%", label: "Custom builds, no templates", color: "#008f4c" },
    { value: "Local", label: "Villa Rica based, nationally reaching", color: "#B5330E" },
    { value: "Real", label: "Results tied to your revenue", color: "#F5C842" },
];

export default function ServicesPage() {
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
      `,
                }}
            />

            <Header />

            {/* Hero */}
            <section className="relative w-full py-16 md:py-24 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 svc-dotgrid pointer-events-none opacity-80" />
                <div className="relative max-w-4xl mx-auto flex flex-col gap-6">
                    <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">Everything We Do</span>
                    <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-tight">
                        SERVICES THAT MAKE YOUR <span className="text-[#B5330E]">PHONE RING.</span>
                    </h1>
                    <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-2xl leading-relaxed">
                        One team for the whole stack — websites, SEO, ads, branding, and content. No offshore work, no
                        vanity metrics. Just the systems that get West Georgia small businesses found and growing.
                    </p>
                </div>
            </section>

            {/* Service cards */}
            <section className="w-full pb-6 px-6 md:px-12 relative">
                <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s) => (
                        <Link key={s.label} href={s.href} className="svc-card bg-white p-6 flex flex-col gap-3 group">
                            <div className="flex items-center justify-between">
                                <span className="w-10 h-10 border-[2.5px] border-[#0a0a0a] flex items-center justify-center" style={{ background: s.tile }}>
                                    <span className="w-3 h-3 bg-white" />
                                </span>
                                <ArrowUpRight size={18} className="text-[#0a0a0a]/30 group-hover:text-[#B5330E] transition-colors" />
                            </div>
                            <div>
                                <h2 className="font-anton text-2xl md:text-3xl uppercase tracking-wide leading-none">{s.label}</h2>
                                <span className="font-inter text-xs font-bold uppercase tracking-widest text-[#B5330E]">{s.tagline}</span>
                            </div>
                            <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">{s.description}</p>
                            <div className="flex flex-col gap-2 pt-3 border-t border-[#0a0a0a]/10 mt-auto">
                                {s.bullets.map((b) => (
                                    <span key={b} className="flex items-start gap-2 font-inter text-xs text-[#0a0a0a]/80">
                                        <Check size={15} className="text-[#008f4c] flex-none mt-0.5" /> {b}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="w-full py-14 md:py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s) => (
                        <div key={s.label} className="border-t-4 border-[#0a0a0a] pt-4">
                            <span className="font-anton text-4xl md:text-5xl block leading-none" style={{ color: s.color }}>{s.value}</span>
                            <span className="font-inter text-[11px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60 mt-2 block">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA band */}
            <section className="w-full py-16 md:py-24 px-6 md:px-12 bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a]">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                    <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none text-white">NOT SURE WHERE TO START?</h2>
                    <p className="font-inter text-base md:text-lg text-[#F2EBDA]/80 max-w-xl">
                        Book a free consultation. We&rsquo;ll look at your business and tell you the truth about what will
                        move the needle — even if it&rsquo;s not us.
                    </p>
                    <Link href="/contact" className="svc-btn border-[#F2EBDA] bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2 shadow-[4px_4px_0px_#f3efe0] mt-2">
                        Get A Free Proposal <ArrowUpRight size={18} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
