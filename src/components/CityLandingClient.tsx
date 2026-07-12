"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import {
  ArrowUpRight,
  Menu,
  X,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import ProposalModal from "@/components/ProposalModal";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

/* ─── Types ─────────────────────────────────────────────────────── */
export type CityFaq = {
  index: string;
  category: string;
  question: string;
  answer: string;
};

export type CityLink = { label: string; href: string };

export type CityData = {
  /** "Newnan" */
  name: string;
  /** "NEWNAN" */
  nameUpper: string;
  /** "Coweta County" */
  county: string;
  /** "COWETA COUNTY" */
  countyUpper: string;
  /** slug used for proposal-modal source strings, e.g. "newnan" */
  slug: string;
  /** hero eyebrow subtitle, e.g. "Digital Marketing · Newnan, GA" */
  eyebrow: string;
  /** hero paragraph */
  heroSubhead: string;
  /** the extra marquee tag, e.g. "VILLA RICA TO NEWNAN" or "HOME OF THE COWBOYS" */
  marqueeLine: string;
  /** intro section paragraphs (the last renders with the results link appended) */
  introParagraphs: string[];
  /** service-area chips */
  neighborhoods: string[];
  /** city-specific FAQs */
  faqs: CityFaq[];
  /** footer blurb under HOWDY PARTNER */
  footerBlurb: string;
  /** footer location line, e.g. "Villa Rica, GA · Serving Newnan" */
  footerLocation: string;
  /** other city cross-links in the footer */
  otherCities: CityLink[];
};

/* ─── Generic (city-agnostic) content ───────────────────────────── */
const caseStudies = [
  {
    id: "05.20",
    title: "JOHN B. JACKSON & ASSOC",
    category: "SEO & PPC ADS",
    client: "Personal Injury Lawyers",
    location: "Douglasville, GA",
    result: "+$500k Revenue",
    impacts: [
      "Achieved 22 #1 organic placements on Google in 12 months.",
      "Designed multi-platform lead funnels with phone-call tracking.",
      "Launched integrated brand campaigns across streaming TV and paid social.",
    ],
  },
  {
    id: "06.15",
    title: "MCKINLEY ROOFING",
    category: "WEB & LOCAL SEO",
    client: "Roofing & Restoration",
    location: "Douglasville, GA",
    result: "+1000% Traffic",
    impacts: [
      "Built dynamic neighborhood service-area landing pages.",
      "Established top-tier Google Business Profile optimization and schema markup.",
      "Shipped storm-damage intake forms that feed straight to insurance leads.",
    ],
  },
  {
    id: "04.15",
    title: "HARMONIC PRODUCTION",
    category: "WEB DESIGN & SEO",
    client: "AV & Event Concert Outfits",
    location: "Cleveland, TN",
    result: "+300% Engagement",
    impacts: [
      "Delivered a full brand overhaul and localized SEO strategy.",
      "Boosted year-over-year customer retention by 200%.",
      "Cut server downtime to zero during the domain transition.",
    ],
  },
];

const processSteps = [
  {
    week: "WEEK 1",
    title: "DISCOVERY.",
    desc: "60-minute call, 12 questions, one-page strategy brief you actually keep.",
  },
  {
    week: "WEEKS 2–3",
    title: "DESIGN.",
    desc: "Wireframes to Figma. One big review, one free design pivot.",
  },
  {
    week: "WEEKS 3–5",
    title: "BUILD.",
    desc: "Clean code, weekly Lighthouse checks, real-device testing, staging URL from day one.",
  },
  {
    week: "WEEK 5–6",
    title: "LAUNCH.",
    desc: "DNS, SSL, GA4 + Search Console + Tag Manager, sitemap, schema.",
  },
  {
    week: "MONTHS 2–3",
    title: "OPTIMIZE.",
    desc: "Heatmaps + GA4, two CRO rounds at days 30 and 60.",
  },
];

const pricing = [
  {
    name: "ONGOING",
    badge: "MOST POPULAR",
    price: "$497",
    unit: "/mo",
    sub: "$0 upfront · 12-month agreement",
    features: [
      "New custom website",
      "Hosting, SSL & security",
      "Minor updates included",
      "Local SEO + Google Business Profile",
      "Launch in ~2 weeks",
      "Monthly performance report",
    ],
  },
  {
    name: "ONE TIME",
    badge: "YOU OWN IT",
    price: "$3,500",
    unit: "+",
    sub: "One-time build · no ongoing required",
    features: [
      "Custom build on your own cloud server",
      "Full brand integration",
      "Form + analytics setup",
      "90 days post-launch support",
      "You own domain, files, design & code",
      "Milestone billing: kickoff / approval / launch",
    ],
  },
];

const industries = [
  "HEALTHCARE",
  "RETAIL",
  "RESTAURANTS",
  "HOME SERVICES",
  "LAW + FINANCIAL",
  "CONTRACTORS & TRADES",
];

export default function CityLandingClient({ city }: { city: CityData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("");

  const openProposalModal = (source: string) => {
    setModalSource(source);
    setIsProposalModalOpen(true);
  };

  const capabilities = [
    {
      num: "01",
      title: "LOCAL SEO.",
      desc: `Get into the ${city.name} Map Pack. City keyword targeting, Google Business Profile, service-area pages, citations, and a review system that keeps you on top.`,
    },
    {
      num: "02",
      title: "GOOGLE ADS + PPC.",
      desc: `Ads that pay for themselves. Tight geo-targeting around ${city.county}, call tracking, zero wasted spend. We manage to ROI, not impressions.`,
    },
    {
      num: "03",
      title: "WEB DESIGN.",
      desc: "Custom, fast, mobile-first sites built to convert — not templates. 1.4s average load with conversion tracking baked in from day one.",
    },
    {
      num: "04",
      title: "SOCIAL ADS.",
      desc: `Facebook and Instagram campaigns that reach ${city.name} buyers where they scroll, with creative that drives leads — not just likes.`,
    },
    {
      num: "05",
      title: "BRAND IDENTITY.",
      desc: `Logos, messaging, and positioning that make a ${city.name} business the obvious choice. Strategy first, design second.`,
    },
    {
      num: "06",
      title: "VIDEO + PHOTO.",
      desc: "Real photography and video of your business, your team, your work — the local proof that turns lookers into buyers.",
    },
  ];

  return (
    <div
      className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative overflow-hidden flex flex-col md:pt-[36px] pt-0`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .h3-btn-brutalist { border: 3px solid #1a1a1a; box-shadow: 4px 4px 0px #1a1a1a; transition: all 0.2s ease; }
        .h3-btn-brutalist:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #1a1a1a; }
        .h3-btn-brutalist:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0px #1a1a1a; }
        .h3-brutalist-card { border: 4px solid #1a1a1a; box-shadow: 6px 6px 0px #1a1a1a; transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .h3-brutalist-card:hover { transform: translate(-4px, -4px); box-shadow: 10px 10px 0px #1a1a1a; }
        @keyframes h3-marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .h3-marquee-track { display: flex; width: max-content; animation: h3-marquee-left 35s linear infinite; }
        .h3-dotted-bg { background-image: radial-gradient(rgba(26, 26, 26, 0.12) 1.5px, transparent 1.5px); background-size: 24px 24px; }
      `,
        }}
      />

      {/* Dotted retro printed background layer */}
      <div className="absolute inset-0 h3-dotted-bg pointer-events-none z-0 opacity-80" />

      {/* Navigation Header */}
      <header className="relative w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12 z-40">
        <div className="w-full flex justify-between items-center">
          <Link href="/" className="inline-block select-none">
            <Image
              src="/Cowboys logo script 2026 v2.png"
              alt={`Creative Cowboys — Digital Marketing Agency in ${city.name}, GA`}
              width={380}
              height={110}
              priority
              className="w-48 sm:w-56 md:w-64 h-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-inter text-sm md:text-base font-bold uppercase tracking-wider text-[#F2EBDA]">
            <a href="#services" className="hover:text-[#B5330E] transition-colors duration-200">Services</a>
            <a href="#work" className="hover:text-[#B5330E] transition-colors duration-200">Results</a>
            <a href="#pricing" className="hover:text-[#B5330E] transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-[#B5330E] transition-colors duration-200">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openProposalModal(`${city.slug}_header_cta`)}
              className="hidden md:inline-flex h3-btn-brutalist border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-6 py-3 uppercase tracking-wider text-sm items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0] cursor-pointer"
            >
              Get A Proposal <ArrowUpRight size={16} />
            </button>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#F2EBDA] hover:text-[#B5330E] transition-colors duration-200 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 flex flex-col gap-4 font-inter text-base font-bold uppercase tracking-wider text-[#F2EBDA] z-50">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B5330E] transition-colors duration-200">Services</a>
            <a href="#work" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B5330E] transition-colors duration-200">Results</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B5330E] transition-colors duration-200">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B5330E] transition-colors duration-200">FAQ</a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openProposalModal(`${city.slug}_mobile_cta`);
              }}
              className="h3-btn-brutalist border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 py-2.5 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5 mt-2 shadow-[3px_3px_0px_#f3efe0] cursor-pointer text-center"
            >
              Get A Proposal <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-6 md:px-12 z-10 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest font-inter inline-flex items-center gap-2">
              <MapPin size={13} /> {city.eyebrow}
            </span>

            <h1 className="font-anton text-4xl sm:text-6xl md:text-7xl leading-[0.9] text-[#0a0a0a] uppercase tracking-tight">
              DIGITAL MARKETING <br className="hidden md:inline" />
              THAT MAKES <span className="text-[#B5330E]">{city.nameUpper}</span> <br className="hidden md:inline" />
              PHONES RING.
            </h1>

            <p className="font-inter text-lg md:text-xl text-[#0a0a0a]/80 max-w-xl leading-relaxed">
              {city.heroSubhead}
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => openProposalModal(`${city.slug}_hero_cta`)}
                className="h3-btn-brutalist bg-[#B5330E] text-[#F2EBDA] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                Get A Free Scorecard <ArrowUpRight size={18} />
              </button>
              <Link href="/results" className="h3-btn-brutalist bg-[#F2EBDA] text-[#0a0a0a] font-bold px-8 py-4 uppercase tracking-wider text-sm">
                See Our Results
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t-2 border-[#0a0a0a]/20 pt-8 mt-4">
              <div>
                <span className="font-anton text-3xl sm:text-4xl text-[#005eb8] block">1.4s</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">Avg Page Load</span>
              </div>
              <div>
                <span className="font-anton text-3xl sm:text-4xl text-[#008f4c] block">100+</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">Sites Shipped</span>
              </div>
              <div>
                <span className="font-anton text-3xl sm:text-4xl text-[#B5330E] block">$2M+</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0a0a0a]/60">Client Revenue</span>
              </div>
            </div>
          </div>

          {/* Hero poster card */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="h3-brutalist-card bg-[#B5330E] p-8 text-[#F2EBDA] w-full max-w-[420px] flex flex-col justify-between aspect-[3/4] relative overflow-hidden shadow-2xl -rotate-2">
              <div className="flex justify-between items-start">
                <span className="font-anton text-2xl uppercase tracking-widest opacity-80 border-b-2 border-[#F2EBDA] pb-1">COWBOYS</span>
                <div className="border-2 border-[#F2EBDA] rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">NO FLUFF</div>
              </div>

              <div className="my-8 flex flex-col gap-2">
                <span className="font-inter text-xs uppercase tracking-widest font-bold text-[#F5C842]">{city.name}, GA</span>
                <span className="font-anton text-5xl md:text-6xl leading-[0.95] uppercase">
                  ZERO<br />
                  WASTED<br />
                  SPEND.
                </span>
              </div>

              <div className="border-t-2 border-[#F2EBDA]/20 pt-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span>{city.countyUpper}</span>
                <span>EST. 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="w-full bg-[#0a0a0a] text-[#F2EBDA] border-y-4 border-[#0a0a0a] overflow-hidden py-4 z-20">
        <div className="h3-marquee-track">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex gap-16 items-center pr-16 font-anton text-2xl md:text-3xl uppercase tracking-widest select-none whitespace-nowrap">
              <span>FAST PAGE LOADS</span>
              <span className="text-[#B5330E]">★</span>
              <span>90-DAY PAYBACK</span>
              <span className="text-[#F5C842]">★</span>
              <span>NO OFFSHORE WORK</span>
              <span className="text-[#005eb8]">★</span>
              <span>NO SALES CALLS</span>
              <span className="text-[#008f4c]">★</span>
              <span>{city.countyUpper}</span>
              <span className="text-[#B5330E]">★</span>
              <span>LOCAL SEO MAPPING</span>
              <span className="text-[#F5C842]">★</span>
              <span>{city.marqueeLine}</span>
              <span className="text-[#005eb8]">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* Intro / Local context */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#F2EBDA] z-10 border-b-4 border-[#0a0a0a]">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">West Georgia · Local</span>
            <h2 className="font-anton text-4xl md:text-5xl uppercase leading-none">DIGITAL MARKETING FOR {city.nameUpper} SMALL BUSINESSES.</h2>
            <div className="h-1.5 w-16 bg-[#B5330E] mt-2" />
          </div>
          {city.introParagraphs.map((para, i) => (
            <p key={i} className="font-inter text-base md:text-lg text-[#0a0a0a]/80 leading-relaxed">
              {para}
              {i === city.introParagraphs.length - 1 && (
                <>
                  {" "}
                  <Link href="/results" className="text-[#B5330E] font-bold underline decoration-[#B5330E]/30 hover:decoration-[#B5330E]">See our results for real West Georgia clients →</Link>
                </>
              )}
            </p>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="services" className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#0a0a0a] border-b-4 border-[#0a0a0a] z-10 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col text-left pb-8 border-b border-[#F2EBDA]/10">
            <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest font-inter">Capabilities</span>
            <h2 className="font-anton text-5xl md:text-6xl text-white uppercase mt-1 leading-none">WHAT WE DO.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-8">
            {capabilities.map((item) => (
              <div key={item.num} className="flex flex-col py-5 border-b border-[#F2EBDA]/10">
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-anton text-4xl md:text-5xl text-[#F5C842] select-none leading-none min-w-[50px] text-left">{item.num}</span>
                  <span className="font-anton text-lg sm:text-xl md:text-2xl text-white uppercase tracking-wide leading-none">{item.title}</span>
                </div>
                <div className="pl-[66px] md:pl-[74px] mt-2 text-left">
                  <span className="text-[#F2EBDA]/60 text-xs md:text-sm font-inter font-bold tracking-wide leading-relaxed">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="work" className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#F2EBDA] z-10 border-b-4 border-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">Proven Outcomes</span>
            <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none">CASE STUDIES.</h2>
            <div className="h-1.5 w-16 bg-[#B5330E] mt-2" />
          </div>

          <div className="flex flex-col gap-6">
            {caseStudies.map((study) => (
              <div key={study.id} className="h3-brutalist-card bg-[#F2EBDA] p-6 md:p-8 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-anton text-xl text-[#B5330E]">{study.id}</span>
                      <span className="text-[#0a0a0a]/40 text-xs font-bold uppercase tracking-wider">{`// ${study.category}`}</span>
                    </div>
                    <h3 className="font-anton text-2xl md:text-3xl uppercase tracking-wide leading-tight">{study.title}</h3>
                    <div className="flex flex-wrap gap-x-4 text-xs font-bold uppercase text-[#0a0a0a]/60 mt-1">
                      <span>Client: {study.client}</span>
                      <span className="text-[#0a0a0a]/35">•</span>
                      <span>Location: {study.location}</span>
                    </div>
                  </div>
                  <div className="h-fit px-4 py-2 border-2 border-[#0a0a0a] bg-[#F5C842] text-[#0a0a0a] font-bold uppercase text-xs tracking-wider shadow-[2px_2px_0px_#1a1a1a] whitespace-nowrap self-start md:self-auto">
                    {study.result}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#0a0a0a]/10">
                  {study.impacts.map((impact, i) => (
                    <div key={i} className="flex gap-2.5">
                      <Check size={16} className="text-[#008f4c] flex-shrink-0 mt-0.5" />
                      <p className="font-inter text-xs text-[#0a0a0a]/85 leading-relaxed">{impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#0a0a0a] border-b-4 border-[#0a0a0a] z-10 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col text-left pb-8 border-b border-[#F2EBDA]/10 mb-8">
            <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest font-inter">Our Process</span>
            <h2 className="font-anton text-5xl md:text-6xl text-white uppercase mt-1 leading-none">HOW WE WORK.</h2>
            <p className="font-inter text-sm text-[#F2EBDA]/60 mt-4 max-w-2xl">Five steps. Each with a realistic timeline. We send you the actual artifact at each step — no black box.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {processSteps.map((step) => (
              <div key={step.title} className="flex flex-col gap-3 border-l-2 border-[#F5C842]/40 pl-4">
                <span className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#F5C842]">{step.week}</span>
                <h3 className="font-anton text-2xl uppercase text-white leading-none">{step.title}</h3>
                <p className="font-inter text-xs text-[#F2EBDA]/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#F2EBDA] border-b-4 border-[#0a0a0a] z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest">Transparent Pricing</span>
            <h2 className="font-anton text-5xl md:text-6xl uppercase leading-none">TWO WAYS TO START.</h2>
            <p className="font-inter text-sm text-[#0a0a0a]/70 mt-2 max-w-xl">We publish real numbers because you deserve to know before the call.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricing.map((tier) => (
              <div key={tier.name} className="h3-brutalist-card bg-white p-8 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-anton text-3xl uppercase leading-none">{tier.name}</h3>
                  <span className="px-3 py-1 border-2 border-[#0a0a0a] bg-[#F5C842] text-[#0a0a0a] font-bold uppercase text-[10px] tracking-wider">{tier.badge}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-anton text-5xl text-[#B5330E] leading-none">{tier.price}</span>
                  <span className="font-anton text-xl text-[#0a0a0a]/60 mb-1">{tier.unit}</span>
                </div>
                <span className="font-inter text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60">{tier.sub}</span>
                <div className="flex flex-col gap-3 pt-4 border-t border-[#0a0a0a]/10">
                  {tier.features.map((f) => (
                    <div key={f} className="flex gap-2.5 items-start">
                      <Check size={16} className="text-[#008f4c] flex-shrink-0 mt-0.5" />
                      <span className="font-inter text-sm text-[#0a0a0a]/85">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openProposalModal(`${city.slug}_pricing_${tier.name}`)}
                  className="h3-btn-brutalist bg-[#0a0a0a] text-[#F2EBDA] font-bold px-6 py-3.5 uppercase tracking-wider text-xs mt-2 cursor-pointer border-[#0a0a0a]"
                >
                  Book A Strategy Call
                </button>
              </div>
            ))}
          </div>
          <p className="font-inter text-xs text-[#0a0a0a]/60 mt-6 max-w-2xl">
            How we price: flat fee, milestone billing (kickoff / design approval / launch). Not a fit? We&apos;ll tell you and point you somewhere better.
          </p>
        </div>
      </section>

      {/* Service area / Neighborhoods */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#0a0a0a] border-b-4 border-[#0a0a0a] z-10 text-white">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest">Service Area</span>
            <h2 className="font-anton text-4xl md:text-5xl uppercase leading-none">{city.countyUpper}. WE&apos;RE THERE.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map((n) => (
              <span key={n} className="px-4 py-2 border border-[#F2EBDA]/20 text-[#F2EBDA]/80 font-inter font-bold text-xs uppercase tracking-wide">{n}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 border-t border-[#F2EBDA]/10">
            {industries.map((i) => (
              <span key={i} className="font-anton text-lg md:text-xl uppercase text-[#F5C842]/90">{i}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#F2EBDA] border-b-4 border-[#0a0a0a] z-10 text-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-left flex flex-col gap-2 mb-12">
            <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest font-inter">FAQ</span>
            <h2 className="font-anton text-5xl md:text-6xl text-[#0a0a0a] uppercase mt-1 leading-none">QUESTIONS ASKED.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4 w-full">
              {city.faqs.map((faq, index) => {
                const isActive = activeFaq === index;
                return (
                  <div key={faq.index} className="flex flex-col w-full">
                    <button
                      onClick={() => setActiveFaq(index)}
                      className={`w-full flex justify-between items-center p-5 text-left font-bold font-inter text-sm md:text-base tracking-wide uppercase transition-all duration-200 select-none border-2 border-[#0a0a0a] ${
                        isActive
                          ? "bg-[#0a0a0a] text-[#F5C842] shadow-[4px_4px_0px_#e94e33] translate-x-[-2px] translate-y-[-2px]"
                          : "bg-white text-[#0a0a0a] hover:bg-[#F2EBDA]/40"
                      }`}
                    >
                      <span>{faq.question}</span>
                      <span className={`text-lg md:text-xl font-bold flex-shrink-0 ml-4 ${isActive ? "text-[#F5C842]" : "text-[#B5330E]"}`}>{isActive ? "—" : "+"}</span>
                    </button>

                    {isActive && (
                      <div className="lg:hidden w-full mt-3">
                        <div className="bg-[#B5330E] border-4 border-[#0a0a0a] p-6 text-white shadow-[4px_4px_0px_#1a1a1a]">
                          <span className="text-[#F5C842] font-bold text-[10px] uppercase tracking-widest font-inter">Q.{faq.index} · {faq.category}</span>
                          <h3 className="font-anton text-2xl text-white uppercase mt-2 leading-tight">{faq.question}</h3>
                          <p className="font-inter text-sm text-[#F2EBDA]/90 leading-relaxed mt-4 text-left">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block lg:col-span-7 w-full">
              {(() => {
                const currentFaq = city.faqs[activeFaq] || city.faqs[0];
                return (
                  <div className="bg-[#B5330E] border-4 border-[#0a0a0a] p-8 text-white shadow-[6px_6px_0px_#1a1a1a] min-h-[360px] flex flex-col justify-between">
                    <div>
                      <span className="text-[#F5C842] font-bold text-xs uppercase tracking-widest font-inter">Q.{currentFaq.index} · {currentFaq.category}</span>
                      <h3 className="font-anton text-4xl text-white uppercase mt-2 leading-tight">{currentFaq.question}</h3>
                      <p className="font-inter text-base md:text-lg text-[#F2EBDA]/90 leading-relaxed mt-6 text-left">{currentFaq.answer}</p>
                    </div>
                    <button
                      onClick={() => openProposalModal(`${city.slug}_faq_cta`)}
                      className="h3-btn-brutalist bg-[#0a0a0a] text-[#F2EBDA] font-bold px-6 py-3 uppercase tracking-wider text-xs mt-8 self-start cursor-pointer border-[#F2EBDA]"
                    >
                      Get A Proposal
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Footer — Howdy Partner */}
      <footer id="contact" className="w-full bg-[#0a0a0a] text-[#F2EBDA] border-t-4 border-[#0a0a0a] py-12 md:py-16 px-6 md:px-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 flex flex-col gap-6">
            <h3 className="font-anton text-3xl uppercase tracking-widest text-[#F5C842]">HOWDY PARTNER</h3>
            <p className="font-inter text-sm text-[#F2EBDA]/70 leading-relaxed max-w-sm">
              {city.footerBlurb}
            </p>
            <div className="flex flex-col gap-3 font-bold text-sm tracking-wider uppercase">
              <div className="flex items-center gap-3"><Clock size={16} className="text-[#F5C842]" /><span>Mon - Fri: 9:00 AM - 5:00 PM</span></div>
              <a href="mailto:howdy@creativecowboys.co" className="flex items-center gap-3 hover:text-[#B5330E] transition-colors duration-200"><Mail size={16} className="text-[#F5C842]" /><span>howdy@creativecowboys.co</span></a>
              <a href="tel:4702437517" className="flex items-center gap-3 hover:text-[#B5330E] transition-colors duration-200"><Phone size={16} className="text-[#F5C842]" /><span>(470) 243-7517</span></a>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-[#F5C842]" /><span>{city.footerLocation}</span></div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center py-6 md:py-0 border-y-2 md:border-y-0 md:border-x-2 border-[#F2EBDA]/10">
            <div className="font-anton text-3xl uppercase tracking-widest text-[#B5330E] mb-2">COWBOYS</div>
            <div className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold text-[#F2EBDA]/40">© 2026 ALL RIGHTS RESERVED</div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-6 text-left">
            <h4 className="font-anton text-3xl uppercase tracking-widest text-[#005eb8]">DIRECT LINKS</h4>
            <div className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-[#F2EBDA]/70">
              <Link href="/seo" className="hover:text-[#B5330E] transition-colors">SEO Programs</Link>
              <Link href="/web-design" className="hover:text-[#B5330E] transition-colors">Web Design</Link>
              <Link href="/ppc" className="hover:text-[#B5330E] transition-colors">PPC Campaigns</Link>
              {city.otherCities.map((c) => (
                <Link key={c.href} href={c.href} className="hover:text-[#B5330E] transition-colors">{c.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        source={modalSource}
      />
    </div>
  );
}
