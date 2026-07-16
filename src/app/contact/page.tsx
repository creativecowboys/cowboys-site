import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import { Mail, Phone, MapPin, ArrowUpRight, Clock } from "lucide-react";
import { Footer7 } from "@/components/ui/footer-7";
import ContactForm from "@/components/ui/contact-form";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

export const metadata: Metadata = {
    title: "Free Digital Marketing Consultation in West Georgia",
    description:
        "Ready to grow? Get a free consultation with Creative Cowboys — West Georgia's no-fluff digital marketing agency. Based in Villa Rica, GA. No contracts. No fluff. Just results.",
    alternates: { canonical: "/contact" },
    openGraph: {
        title: "Free Digital Marketing Consultation in West Georgia | Creative Cowboys",
        description:
            "Get a free consultation with Creative Cowboys — West Georgia's digital marketing agency. SEO, PPC, web design & branding for small businesses.",
    },
};

const contactRows = [
    {
        label: "Email",
        value: "howdy@creativecowboys.co",
        href: "mailto:howdy@creativecowboys.co",
        icon: Mail,
        tile: "#B5330E",
    },
    {
        label: "Phone",
        value: "(470) 243-7517",
        href: "tel:4702437517",
        icon: Phone,
        tile: "#005eb8",
    },
];

export default function ContactPage() {
    return (
        <>
            <div
                className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative overflow-hidden flex flex-col md:pt-[36px] pt-0`}
            >
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
        .h3-btn-brutalist{border:3px solid #1a1a1a;box-shadow:4px 4px 0px #1a1a1a;transition:all .2s ease;}
        .h3-btn-brutalist:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0px #1a1a1a;}
        .h3-btn-brutalist:active{transform:translate(2px,2px);box-shadow:0px 0px 0px #1a1a1a;}
        .h3-dotted-bg{background-image:radial-gradient(rgba(26,26,26,0.12) 1.5px,transparent 1.5px);background-size:24px 24px;}
      `,
                    }}
                />

                {/* Dotted retro printed background */}
                <div className="absolute inset-0 h3-dotted-bg pointer-events-none z-0 opacity-80" />

                {/* Header */}
                <header className="relative w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12 z-40">
                    <div className="w-full flex justify-between items-center gap-4">
                        <Link href="/" className="inline-block select-none">
                            <Image
                                src="/Cowboys logo script 2026 v2.png"
                                alt="Creative Cowboys — Digital Marketing Agency"
                                width={380}
                                height={110}
                                priority
                                className="w-44 sm:w-52 md:w-60 h-auto object-contain"
                                style={{ filter: "brightness(0) invert(1)" }}
                            />
                        </Link>

                        <nav className="hidden md:flex items-center gap-8 font-inter text-sm md:text-base font-bold uppercase tracking-wider text-[#F2EBDA]">
                            <Link href="/services" className="hover:text-[#B5330E] transition-colors duration-200">Services</Link>
                            <Link href="/web-design" className="hover:text-[#B5330E] transition-colors duration-200">Web Design</Link>
                            <Link href="/seo" className="hover:text-[#B5330E] transition-colors duration-200">SEO</Link>
                            <Link href="/results" className="hover:text-[#B5330E] transition-colors duration-200">Results</Link>
                        </nav>

                        <a
                            href="tel:4702437517"
                            className="h3-btn-brutalist border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 md:px-6 py-2.5 md:py-3 uppercase tracking-wider text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
                        >
                            <Phone size={15} /> (470) 243-7517
                        </a>
                    </div>
                </header>

                {/* Main content */}
                <section className="relative w-full py-14 md:py-24 px-6 md:px-12 z-10 flex-grow">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Left: intro + contact details */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest font-inter">
                                Let&rsquo;s Work Together
                            </span>

                            <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-tight text-[#0a0a0a]">
                                TELL US ABOUT <br className="hidden md:inline" />
                                YOUR <span className="text-[#B5330E]">PROJECT.</span>
                            </h1>

                            <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-md leading-relaxed">
                                Whether you need a new website, a rebrand, or a full digital marketing strategy — we&rsquo;d love
                                to hear what you&rsquo;re building. No fluff, no pressure. Just a straight conversation about
                                growing your business.
                            </p>

                            {/* Contact detail cards */}
                            <div className="flex flex-col gap-4 mt-2">
                                {contactRows.map(({ label, value, href, icon: Icon, tile }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        className="group flex items-center gap-4 bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all"
                                    >
                                        <span
                                            className="w-11 h-11 flex-none border-[2.5px] border-[#0a0a0a] flex items-center justify-center"
                                            style={{ background: tile }}
                                        >
                                            <Icon size={18} className="text-white" />
                                        </span>
                                        <span className="flex flex-col">
                                            <span className="font-anton text-[10px] tracking-[1.5px] uppercase text-[#0a0a0a]/50">{label}</span>
                                            <span className="font-inter text-sm font-bold text-[#0a0a0a]">{value}</span>
                                        </span>
                                        <ArrowUpRight size={16} className="ml-auto text-[#0a0a0a]/30 group-hover:text-[#B5330E] transition-colors" />
                                    </a>
                                ))}

                                {/* Location (non-link) */}
                                <div className="flex items-center gap-4 bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-4">
                                    <span className="w-11 h-11 flex-none border-[2.5px] border-[#0a0a0a] bg-[#008f4c] flex items-center justify-center">
                                        <MapPin size={18} className="text-white" />
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="font-anton text-[10px] tracking-[1.5px] uppercase text-[#0a0a0a]/50">Location</span>
                                        <span className="font-inter text-sm font-bold text-[#0a0a0a]">222 West Montgomery St · Villa Rica, GA 30180</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 font-inter text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/60">
                                <Clock size={14} className="text-[#B5330E]" /> Mon – Fri · 9:00 AM – 5:00 PM
                            </div>
                        </div>

                        {/* Right: form */}
                        <div className="lg:col-span-7 w-full">
                            <ContactForm />
                        </div>
                    </div>
                </section>
            </div>

            <Footer7 />
        </>
    );
}
