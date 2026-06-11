import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import MobileMenuWrapper from "./MobileMenuWrapper";

interface HeaderProps {
  dark?: boolean;
}

export default function Header({ dark = false }: HeaderProps) {
  const serviceLinks = [
    { name: "Web Design", href: "/web-design" },
    { name: "SEO Programs", href: "/seo" },
    { name: "PPC Advertising", href: "/ppc" },
    { name: "Brand Strategy", href: "/brand-strategy" },
    { name: "Social Media Ads", href: "/social-media-ads" },
    { name: "Content + Copy", href: "/media-creation" },
  ];

  const themeClass = dark
    ? {
        navBg: "bg-h3-black/90 backdrop-blur-md",
        navBorder: "border-b-[2.5px] border-h3-black",
        text: "text-white",
        textHover: "hover:text-h3-red",
        logoFilter: "brightness(0) invert(1)",
        proposalBtnBg: "bg-h3-red text-white",
        proposalBtnBorder: "border-white/10",
        proposalBtnShadow: "shadow-[4px_4px_0px_#f3efe0]",
      }
    : {
        navBg: "bg-[#F2EBDA]/90 backdrop-blur-md",
        navBorder: "border-b-[2.5px] border-[#0a0a0a]",
        text: "text-[#0a0a0a]",
        textHover: "hover:text-[#B5330E]",
        logoFilter: "none",
        proposalBtnBg: "bg-[#B5330E] text-white",
        proposalBtnBorder: "border-[#0a0a0a]",
        proposalBtnShadow: "shadow-[4px_4px_0px_#0a0a0a]",
      };

  return (
    <>
      {/* ── TOP UTILITY BAR ── */}
      <div className="w-full bg-[#0a0a0a] text-[#F2EBDA] font-h3-display text-[11px] tracking-[2px] py-2.5 px-6 md:px-12 flex justify-between items-center z-50 relative">
        <Link prefetch={false} href="/franklin-tn/web-design" className="hover:text-[#F5C842] transition-colors flex items-center gap-1">
          COMING SOON: OUR FRANKLIN, TN OFFICE <span className="text-[#B5330E]">→</span>
        </Link>
        <a href="tel:4702437517" className="text-[#F5C842] hover:underline transition-all font-bold">
          (470) 243-7517
        </a>
      </div>

      {/* ── GLOBAL NAV HEADER ── */}
      <header
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${themeClass.navBg} ${themeClass.navBorder} py-4 px-6 md:px-12`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo on Left */}
          <Link prefetch={false} href="/" className="inline-block select-none site-logo">
            <Image
              src="/Cowboys logo script 2026 v2.png"
              alt="Creative Cowboys"
              width={224}
              height={65}
              priority
              sizes="(max-width: 640px) 176px, 224px"
              className="w-44 sm:w-52 md:w-56 h-auto object-contain"
              style={{ filter: themeClass.logoFilter }}
            />
          </Link>

          {/* Nav Links in Center */}
          <nav className={`hidden md:flex items-center gap-8 font-h3-secondary text-sm md:text-base font-bold uppercase tracking-wider ${themeClass.text}`}>
            {/* Services Dropdown (CSS Hover) */}
            <div className="relative group py-2">
              <button
                className={`flex items-center gap-1.5 cursor-pointer uppercase transition-colors duration-200 ${themeClass.textHover}`}
              >
                Services <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Dropdown Card */}
              <div className="absolute top-full -left-4 pt-2 w-52 z-50 hidden group-hover:block">
                <div className="bg-[#F2EBDA] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-lg overflow-hidden py-2">
                  {serviceLinks.map((link) => (
                    <Link prefetch={false}
                      key={link.name}
                      href={link.href}
                      className="block px-5 py-2.5 text-sm font-h3-secondary font-bold uppercase tracking-wider hover:bg-[#E8E1CF] hover:text-[#B5330E] transition-colors duration-150"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link prefetch={false} href="/results" className={`transition-colors duration-200 ${themeClass.textHover}`}>
              Work
            </Link>
            <Link prefetch={false} href="/about" className={`transition-colors duration-200 ${themeClass.textHover}`}>
              About
            </Link>
            <Link prefetch={false} href="/blog" className={`transition-colors duration-200 ${themeClass.textHover}`}>
              Blog
            </Link>
            <Link prefetch={false}
              href="/franklin-tn/web-design"
              className="text-[#B5330E] hover:text-[#0a0a0a] dark:hover:text-white transition-colors duration-200"
            >
              Franklin, TN
            </Link>
          </nav>

          {/* Right Action Button & Mobile Trigger */}
          <div className="flex items-center gap-4">
            <Link prefetch={false}
              href="/contact"
              className={`hidden md:inline-flex h3-btn-brutalist border-[2.5px] ${themeClass.proposalBtnBg} font-bold px-6 py-3 uppercase tracking-wider text-sm items-center gap-2 whitespace-nowrap ${themeClass.proposalBtnBorder} ${themeClass.proposalBtnShadow}`}
            >
              Get A Proposal <ArrowUpRight size={16} />
            </Link>

            {/* Mobile Menu (Client-side interactive) */}
            <MobileMenuWrapper dark={dark} serviceLinks={serviceLinks} />
          </div>
        </div>
      </header>
    </>
  );
}
