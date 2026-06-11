"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X, ChevronDown } from "lucide-react";

interface HeaderProps {
  dark?: boolean;
}

export default function Header({ dark = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        navBg: scrolled ? "bg-h3-black/95 backdrop-blur-md" : "bg-h3-black",
        navBorder: "border-b-[2.5px] border-h3-black",
        text: "text-white",
        textHover: "hover:text-h3-red",
        logoFilter: "brightness(0) invert(1)",
        proposalBtnBg: "bg-h3-red text-white",
        proposalBtnBorder: "border-white/10",
        proposalBtnShadow: "shadow-[4px_4px_0px_#f3efe0]",
        hamburger: "text-white hover:text-h3-red",
      }
    : {
        navBg: scrolled ? "bg-[#F2EBDA]/95 backdrop-blur-md" : "bg-[#F2EBDA]",
        navBorder: "border-b-[2.5px] border-[#0a0a0a]",
        text: "text-[#0a0a0a]",
        textHover: "hover:text-[#B5330E]",
        logoFilter: "none",
        proposalBtnBg: "bg-[#B5330E] text-white",
        proposalBtnBorder: "border-[#0a0a0a]",
        proposalBtnShadow: "shadow-[4px_4px_0px_#0a0a0a]",
        hamburger: "text-[#0a0a0a] hover:text-[#B5330E]",
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
              width={380}
              height={110}
              priority
              className="w-44 sm:w-52 md:w-56 h-auto object-contain"
              style={{ filter: themeClass.logoFilter }}
            />
          </Link>

          {/* Nav Links in Center */}
          <nav className={`hidden md:flex items-center gap-8 font-h3-secondary text-sm md:text-base font-bold uppercase tracking-wider ${themeClass.text}`}>
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 cursor-pointer uppercase transition-colors duration-200 ${themeClass.textHover}`}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              >
                Services <ChevronDown size={14} className={`transition-transform duration-200 ${servicesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Card */}
              {servicesDropdownOpen && (
                <div className="absolute top-full -left-4 pt-4 w-52 z-50">
                  <div className="bg-[#F2EBDA] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-lg overflow-hidden py-2">
                    {serviceLinks.map((link) => (
                      <Link prefetch={false}
                        key={link.name}
                        href={link.href}
                        className="block px-5 py-2.5 text-sm font-h3-secondary font-bold uppercase tracking-wider hover:bg-[#E8E1CF] hover:text-[#B5330E] transition-colors duration-150"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${themeClass.hamburger} transition-colors duration-200 cursor-pointer`}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE FULL-SCREEN OVERLAY ── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[110px] bg-[#F2EBDA] border-t-2 border-[#0a0a0a] py-8 px-6 flex flex-col justify-between font-h3-display text-3xl uppercase tracking-widest text-[#0a0a0a] z-50 overflow-y-auto">
            <div className="flex flex-col gap-6 text-left">
              {/* Expandable Services list */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-h3-secondary font-bold tracking-widest text-neutral-400">Services</span>
                <div className="flex flex-col gap-2 pl-4 text-2xl">
                  {serviceLinks.map((link) => (
                    <Link prefetch={false}
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#B5330E] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#0a0a0a]/10 my-2" />

              <Link prefetch={false}
                href="/results"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B5330E] transition-colors"
              >
                Work
              </Link>
              <Link prefetch={false}
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B5330E] transition-colors"
              >
                About
              </Link>
              <Link prefetch={false}
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B5330E] transition-colors"
              >
                Blog
              </Link>
              <Link prefetch={false}
                href="/franklin-tn/web-design"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#B5330E] hover:text-[#0a0a0a] transition-colors"
              >
                Franklin, TN
              </Link>
            </div>

            <div className="pt-8 pb-4">
              <Link prefetch={false}
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="h3-btn-brutalist w-full border-[2.5px] border-[#0a0a0a] bg-[#B5330E] text-white font-bold py-4 uppercase tracking-wider text-base inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0a0a0a]"
              >
                Get A Proposal <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
