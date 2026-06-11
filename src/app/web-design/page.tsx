"use client";

import { useState } from "react";
import Link from "next/link";
import { Anton, Roboto_Condensed, Lobster } from "next/font/google";
import { X, ArrowRight } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-condensed",
});

const lobster = Lobster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lobster",
});

export default function WebDesignPage() {
  const [stickyVisible, setStickyVisible] = useState(true);

  // Conversion event tracking helper
  const trackCTA = (eventName: string) => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: eventName,
      });
      console.log(`GA4 Event tracked: ${eventName}`);
    }
  };

  return (
    <div className={`${anton.variable} ${robotoCondensed.variable} ${lobster.variable} bg-[#F2EBDA] text-[#0a0a0a] font-sans selection:bg-[#DD5A2E] selection:text-white min-h-screen relative overflow-hidden flex flex-col`}>
      <style>{`
        .dotgrid { 
          background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px); 
          background-size: 18px 18px; 
        }
        .font-anton {
          font-family: var(--font-anton), 'Anton', Impact, 'Arial Black', sans-serif;
        }
        .font-roboto {
          font-family: var(--font-roboto-condensed), 'Roboto Condensed', sans-serif;
        }
        .font-lobster {
          font-family: var(--font-lobster), 'Lobster', 'Brush Script MT', cursive;
        }
        
        /* FAQ Accordion Styling */
        .faq-item {
          border-bottom: 2.5px solid #0a0a0a;
        }
        .faq-item summary {
          font-family: var(--font-anton), 'Anton', sans-serif;
          font-size: 19px;
          letter-spacing: 0.5px;
          padding: 22px 0;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-item summary::-webkit-details-marker {
          display: none;
        }
        .faq-item summary::after {
          content: '+';
          font-size: 26px;
          color: #DD5A2E;
        }
        .faq-item[open] summary::after {
          content: '—';
          font-size: 18px;
        }

        /* Marquee Animation */
        @keyframes scrollMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          white-space: nowrap;
          animation: scrollMarquee 30s linear infinite;
        }
      `}</style>

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.creativecowboys.co"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Web Design",
                    "item": "https://www.creativecowboys.co/web-design"
                  }
                ]
              },
              {
                "@type": "Service",
                "name": "Web Design Services",
                "provider": {
                  "@type": "LocalBusiness",
                  "name": "Creative Cowboys Media",
                  "telephone": "+1-470-243-7517",
                  "email": "howdy@creativecowboys.co",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "222 West Montgomery St",
                    "addressLocality": "Villa Rica",
                    "addressRegion": "GA",
                    "postalCode": "30180",
                    "addressCountry": "US"
                  }
                },
                "description": "Bespoke, conversion-focused custom web design services built for revenue growth.",
                "areaServed": [
                  { "@type": "City", name: "Villa Rica" },
                  { "@type": "City", name: "Carrollton" },
                  { "@type": "City", name: "Douglasville" },
                  { "@type": "City", name: "Newnan" },
                  { "@type": "City", name: "Bremen" },
                  { "@type": "City", name: "Dallas" },
                  { "@type": "AdministrativeArea", name: "West Georgia" },
                  { "@type": "City", name: "Franklin", "containedInPlace": { "@type": "State", "name": "TN" } }
                ]
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "HOW MUCH DOES A WEBSITE COST?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Two ways to start. Ongoing starts at $497/month with no upfront cost — includes the website, hosting, minor updates, and local SEO. One-time builds start at $3,500 flat — you own everything outright. We publish these numbers because we'd rather start the conversation with money on the table than have you guess."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "HOW LONG DOES A SITE TAKE?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Most sites launch in 4–6 weeks. Smaller monthly-plan sites can launch in as little as 2 weeks. You'll see a staging link early and can review progress anytime — no black box."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "DO YOU USE TEMPLATES?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No. Every site is custom-designed around your business, your customers, and your goals. Templates are why most small-business websites all look the same — and why they don't convert."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "WHO OWNS THE SITE WHEN WE'RE DONE?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "You do. The domain, the hosting, the files, the design. When the project's done, everything transfers to you. If you ever leave us, you take it all."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "CAN YOU REDESIGN MY EXISTING SITE?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes — Squarespace, Wix, GoDaddy, WordPress, whatever you've got. We'll audit what's working, keep the equity you've built, and rebuild the rest."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* Global Header (handles Utility Bar + Main Nav) */}
      <Header dark={false} />

      {/* HERO SECTION */}
      <section className="hero dotgrid py-12 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column Text & Details */}
          <div className="lg:col-span-7 flex flex-col text-left">
            <div className="font-anton text-xs md:text-sm text-[#DD5A2E] tracking-[2.5px] uppercase mb-4">
              — CUSTOM WEB DESIGN · WEST GEORGIA —
            </div>
            <h1 className="font-anton text-5xl sm:text-6xl md:text-[76px] leading-[0.88] text-[#0a0a0a] uppercase mb-6 tracking-wide">
              WEB DESIGN<br />
              THAT ACTUALLY<br />
              <span className="text-[#DD5A2E]">CONVERTS</span>.
            </h1>
            <p className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-lg mb-8">
              Your website shouldn't just look pretty. It should generate leads, close sales, and move your business forward. We build high-performance, revenue-generating websites for brands serious about growth — serving Villa Rica, Carrollton, Douglasville, and the Southeast.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link 
                href="/contact"
                onClick={() => trackCTA("web_design_hero_start")}
                className="bg-[#DD5A2E] text-white font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0a0a0a] transition-all"
              >
                START YOUR PROJECT ↗
              </Link>
              <Link 
                href="/contact"
                onClick={() => trackCTA("web_design_hero_strategy")}
                className="bg-white text-[#0a0a0a] font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] hover:bg-neutral-50 transition-colors"
              >
                BOOK A FREE STRATEGY CALL
              </Link>
            </div>

            {/* Stat Strip */}
            <div className="grid grid-cols-3 border-[2.5px] border-[#0a0a0a] bg-white shadow-[6px_6px_0px_#0a0a0a] max-w-lg">
              <div className="p-4 border-r-[2.5px] border-[#0a0a0a] text-center">
                <div className="font-anton text-xl sm:text-2xl text-[#DD5A2E]">100+</div>
                <div className="font-anton text-[9px] sm:text-[10px] tracking-wider text-[#0a0a0a] mt-1">SITES SHIPPED</div>
              </div>
              <div className="p-4 border-r-[2.5px] border-[#0a0a0a] text-center">
                <div className="font-anton text-xl sm:text-2xl text-[#DD5A2E]">1.4s</div>
                <div className="font-anton text-[9px] sm:text-[10px] tracking-wider text-[#0a0a0a] mt-1">AVG PAGE LOAD</div>
              </div>
              <div className="p-4 text-center">
                <div className="font-anton text-xl sm:text-2xl text-[#DD5A2E]">$2M+</div>
                <div className="font-anton text-[9px] sm:text-[10px] tracking-wider text-[#0a0a0a] mt-1">CLIENT REVENUE</div>
              </div>
            </div>
          </div>

          {/* Right Column: HTML/CSS Desktop & Phone Mockup Pair */}
          <div className="lg:col-span-5 relative w-full h-[460px] md:h-[500px]">
            {/* Desktop Mockup Card */}
            <div className="absolute top-8 left-0 right-12 md:right-16 bg-white border-3 border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] -rotate-[1.5deg] z-10 overflow-hidden flex flex-col">
              {/* Browser Header Bar */}
              <div className="bg-[#0a0a0a] py-2 px-3 flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-[#DD5A2E]" />
                <span className="w-2 h-2 rounded-full bg-[#F5C842]" />
                <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                <div className="flex-1 bg-[#2a2a2a] h-4.5 ml-2.5 rounded text-[9px] text-neutral-400 px-2 flex items-center font-mono select-none">
                  harmonicproduction.co
                </div>
              </div>
              {/* Browser Viewport */}
              <div className="aspect-[16/10] bg-gradient-to-br from-[#0a0a0a] to-[#2a1a15] p-5 flex flex-col justify-between text-white select-none">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-anton tracking-widest text-[9px] uppercase">HARMONIC ◆</span>
                  <span className="bg-[#DD5A2E] text-white px-2 py-0.5 text-[8px] font-anton tracking-wider uppercase">GET A QUOTE</span>
                </div>
                <div className="text-left mt-6">
                  <div className="font-anton text-[8px] text-[#DD5A2E] tracking-widest uppercase">CLEVELAND, TN · EST. 2014</div>
                  <div className="font-anton text-xl md:text-2xl leading-[0.88] uppercase mt-1">
                    WE MAKE<br />
                    <span className="text-[#DD5A2E]">PRODUCTION</span><br />
                    LEGENDARY.
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup Card */}
            <div className="absolute bottom-4 right-0 w-28 md:w-32 bg-[#0a0a0a] rounded-[22px] p-2 rotate-[5deg] shadow-[7px_7px_0px_#DD5A2E] z-20 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a0a0a] to-[#2a1a15] rounded-[14px] aspect-[9/16] p-3 flex flex-col justify-between text-white select-none">
                <div className="font-anton text-[7px] tracking-wider text-center opacity-90 uppercase">HARMONIC ◆</div>
                <div className="text-left">
                  <div className="font-anton text-[11px] md:text-xs leading-[0.88] uppercase">
                    WE MAKE<br />
                    <span className="text-[#DD5A2E]">PRODUCTION</span><br />
                    LEGENDARY.
                  </div>
                  <div className="bg-[#DD5A2E] text-white py-1 text-[7px] text-center font-anton tracking-wider uppercase mt-2">
                    GET A QUOTE
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MARQUEE STRIP */}
      <div className="w-full bg-[#0a0a0a] text-[#F2EBDA] py-3.5 border-y-[2.5px] border-[#0a0a0a] overflow-hidden select-none z-10 relative">
        <div className="marquee-track">
          {Array(3).fill([
            "CONVERSION-FOCUSED", "1.4S PAGE LOADS", "NO TEMPLATES", "SEO BUILT-IN", "MOBILE-FIRST", "NO OFFSHORE WORK", "REVENUE TRACKING"
          ]).flat().map((text, i) => (
            <span key={i} className="font-anton text-sm tracking-[2px] uppercase flex items-center gap-4 px-3.5">
              <span>{text}</span>
              <span className="text-[#DD5A2E]">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHY US SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EBDA]" id="why">
        <div className="max-w-7xl mx-auto">
          {/* Head */}
          <div className="text-left mb-12">
            <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-3">— WHY CREATIVE COWBOYS —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-[#0a0a0a] uppercase max-w-xl">
              WE DON'T BUILD WEBSITES.<br />
              WE BUILD <span className="text-[#DD5A2E]">REVENUE MACHINES</span>.
            </h2>
            <p className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-xl mt-4">
              Most web designers are artists. We are marketers. Every pixel we place has one job — turn your visitors into paying customers. <span className="font-lobster text-xl md:text-2xl text-[#DD5A2E] inline-block rotate-[-3deg] ml-1.5">no fluff, partner</span>
            </p>
          </div>

          {/* 4 Numbered Rows */}
          <div className="border-t-[2.5px] border-[#0a0a0a]">
            {[
              { num: "01", title: "CONVERSION-FOCUSED DESIGN.", desc: "Psychological triggers, clear calls-to-action, and strategic layout that guide visitors to a decision." },
              { num: "02", title: "SEO BUILT-IN FROM DAY ONE.", desc: "Your site launches ranking-ready. Clean code, proper structure, fast load times — so Google finds you from the start." },
              { num: "03", title: "AD CAMPAIGN INTEGRATION.", desc: "Landing pages engineered for your paid traffic so every dollar you spend works harder." },
              { num: "04", title: "ANALYTICS & REVENUE TRACKING.", desc: "Know exactly what's working. We set up advanced tracking tied directly to your revenue." }
            ].map((row) => (
              <div key={row.num} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center py-8 border-b-[2.5px] border-[#0a0a0a]">
                <div className="md:col-span-1 font-anton text-4xl text-[#DD5A2E]">{row.num}</div>
                <div className="md:col-span-4 font-anton text-xl sm:text-2xl text-[#0a0a0a] uppercase tracking-wide">{row.title}</div>
                <div className="md:col-span-7 font-roboto text-sm text-[#5a5a5a] leading-relaxed">{row.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#E8E1CF] dotgrid border-y-[2.5px] border-[#0a0a0a]" id="capabilities">
        <div className="max-w-7xl mx-auto">
          {/* Head */}
          <div className="text-left mb-12">
            <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-3">— WHAT YOU GET —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-[#0a0a0a] uppercase max-w-xl">
              CUSTOM WEBSITES<br />
              BUILT FOR <span className="text-[#DD5A2E]">GROWTH</span>.
            </h2>
            <p className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-xl mt-4">
              We don't use cookie-cutter templates. We build bespoke digital assets designed to dominate your market and drive revenue.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { tag: "01 / BUILT TO SELL", title: "CONVERSION-FOCUSED.", desc: "Structured with clear calls-to-action and psychological triggers that guide users to buy.", featured: false },
              { tag: "02 / SPEED", title: "LIGHTNING FAST.", desc: "Optimized for speed. Because every second of delay costs you conversions and search rankings.", featured: true },
              { tag: "03 / EVERY DEVICE", title: "MOBILE-FIRST.", desc: "Flawless experience on every device. We design for where your customers actually are.", featured: false },
              { tag: "04 / GET FOUND", title: "SEO-READY.", desc: "Built with clean code and proper structure so Google loves your site from day one.", featured: false },
              { tag: "05 / PEACE OF MIND", title: "SECURE & SCALABLE.", desc: "Enterprise-grade security and architecture that grows as your business scales.", featured: false },
              { tag: "06 / KNOW YOUR NUMBERS", title: "DATA-DRIVEN.", desc: "Integrated with advanced analytics so you know exactly how your site is performing.", featured: false }
            ].map((card) => (
              <div 
                key={card.title} 
                className={`border-[2.5px] border-[#0a0a0a] p-8 shadow-[6px_6px_0px_#0a0a0a] flex flex-col text-left transition-all ${
                  card.featured ? "bg-[#F5C842]" : "bg-white"
                }`}
              >
                <div className="font-anton text-[10px] tracking-[2px] text-[#DD5A2E] uppercase mb-3">{card.tag}</div>
                <h3 className="font-anton text-xl sm:text-2xl text-[#0a0a0a] uppercase mb-3">{card.title}</h3>
                <p className="font-roboto text-sm text-[#5a5a5a] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EBDA] border-b-[2.5px] border-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          {/* Head */}
          <div className="text-left mb-12">
            <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-3">— PROVEN OUTCOMES —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-[#0a0a0a] uppercase">
              SITES THAT ACTUALLY <span className="text-[#DD5A2E]">CONVERT</span>.
            </h2>
          </div>

          {/* Case Bands */}
          <div className="flex flex-col gap-8">
            {/* Harmonic Case Band */}
            <div className="border-3 border-[#0a0a0a] bg-white shadow-[10px_10px_0px_#0a0a0a] p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              <div className="lg:col-span-8 flex flex-col">
                <div className="font-anton text-[11px] tracking-[2px] text-[#5a5a5a] uppercase mb-2">04.15 // WEB DESIGN & SEO · CLEVELAND, TN</div>
                <h3 className="font-anton text-2xl sm:text-3xl text-[#0a0a0a] uppercase mb-4">HARMONIC PRODUCTION</h3>
                <ul className="list-disc pl-5 font-roboto text-sm text-[#5a5a5a] leading-relaxed space-y-2">
                  <li>Delivered a full brand overhaul and localized SEO strategy.</li>
                  <li>Boosted year-over-year customer retention by 200%.</li>
                  <li>Cut server downtime to zero during the domain transition.</li>
                </ul>
              </div>
              <div className="lg:col-span-4 text-center border-t-2 lg:border-t-0 lg:border-l-2 border-neutral-100 pt-6 lg:pt-0 lg:pl-6">
                <div className="font-anton text-6xl md:text-7xl text-[#DD5A2E] leading-none">300%</div>
                <div className="font-anton text-xs sm:text-sm tracking-[2px] text-[#0a0a0a] mt-2 uppercase">CUSTOMER ENGAGEMENT ↑</div>
              </div>
            </div>

            {/* McKinley Case Band */}
            <div className="border-3 border-[#0a0a0a] bg-white shadow-[10px_10px_0px_#0a0a0a] p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              <div className="lg:col-span-8 flex flex-col">
                <div className="font-anton text-[11px] tracking-[2px] text-[#5a5a5a] uppercase mb-2">06.15 // WEB & LOCAL SEO · DOUGLASVILLE, GA</div>
                <h3 className="font-anton text-2xl sm:text-3xl text-[#0a0a0a] uppercase mb-4">MCKINLEY ROOFING</h3>
                <ul className="list-disc pl-5 font-roboto text-sm text-[#5a5a5a] leading-relaxed space-y-2">
                  <li>Built dynamic neighborhood service-area landing pages.</li>
                  <li>Top-tier Google Business Profile optimization so they show up on the map.</li>
                  <li>Custom storm-damage intake forms that feed straight to insurance leads.</li>
                </ul>
              </div>
              <div className="lg:col-span-4 text-center border-t-2 lg:border-t-0 lg:border-l-2 border-neutral-100 pt-6 lg:pt-0 lg:pl-6">
                <div className="font-anton text-6xl md:text-7xl text-[#DD5A2E] leading-none">+1000%</div>
                <div className="font-anton text-xs sm:text-sm tracking-[2px] text-[#0a0a0a] mt-2 uppercase">SITE TRAFFIC ↑</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE SECTION (DARK) */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0e0e0e] text-[#F2EBDA] border-b-[2.5px] border-[#0a0a0a]" id="process">
        <div className="max-w-7xl mx-auto">
          {/* Head */}
          <div className="text-left mb-16">
            <div className="font-anton text-xs text-[#F5C842] tracking-[2.5px] uppercase mb-3">— OUR PROCESS —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-white uppercase max-w-xl">
              STRATEGY FIRST.<br />
              DESIGN SECOND.
            </h2>
            <p className="font-roboto text-sm md:text-base text-[#a0998a] leading-relaxed max-w-xl mt-4">
              We don't just start pushing pixels. We follow a battle-tested process to make sure your website actually achieves your business goals. <span className="font-lobster text-xl md:text-2xl text-[#F5C842] inline-block rotate-[-3deg] ml-1.5">four steps —</span>
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="relative">
            {/* Connecting line on desktop */}
            <div className="absolute top-[88px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-[#F5C842] via-[#DD5A2E] to-[#F5C842] hidden lg:block z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "STEP 01", circleNum: "1", title: "DISCOVERY.", desc: "We dive deep into your business, audience, and competitors to find your unique edge.", featured: false },
                { step: "STEP 02", circleNum: "2", title: "STRUCTURE.", desc: "We map out the user journey and craft compelling copy that sells your value.", featured: false },
                { step: "STEP 03", circleNum: "3", title: "DESIGN + BUILD.", desc: "We bring the strategy to life with stunning, high-performance custom design.", featured: true },
                { step: "STEP 04", circleNum: "4", title: "LAUNCH + OPTIMIZE.", desc: "We deploy, test, and integrate analytics to ensure maximum return from day one.", featured: false }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="font-anton text-xs text-[#F5C842] tracking-[1.8px] mb-4 uppercase">{item.step}</div>
                  
                  {/* Circle wrapper */}
                  <div className="h-20 flex items-center justify-center mb-4">
                    <div className={`rounded-full flex items-center justify-center font-anton border-4 border-[#0e0e0e] transition-all ${
                      item.featured 
                        ? "w-[70px] h-[70px] bg-[#DD5A2E] text-white text-2xl shadow-[0_0_0_4px_#F5C842]" 
                        : "w-14 h-14 bg-[#F5C842] text-[#0a0a0a] text-xl"
                    }`}>
                      {item.circleNum}
                    </div>
                  </div>

                  <h4 className="font-anton text-lg text-white mb-2 uppercase">{item.title}</h4>
                  <p className="font-roboto text-[12px] text-[#a0998a] leading-relaxed px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE WORK WITH SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F2EBDA] dotgrid border-b-[2.5px] border-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          {/* Head */}
          <div className="text-left mb-12">
            <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-3">— WHO WE WORK WITH —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-[#0a0a0a] uppercase max-w-xl">
              BUILT FOR BUSINESSES<br />
              THAT WANT TO <span className="text-[#DD5A2E]">GROW</span>.
            </h2>
            <p className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-xl mt-4">
              We partner with ambitious companies that understand the value of a premium digital presence.
            </p>
          </div>

          {/* Vertical Tags */}
          <div className="flex flex-wrap gap-4 text-left">
            {[
              { title: "LOCAL BUSINESSES", desc: "Service businesses and brick-and-mortar shops ready to dominate their local market online." },
              { title: "CONTRACTORS & TRADES", desc: "Builders, HVAC, electricians — companies that need leads flowing consistently." },
              { title: "PROFESSIONAL FIRMS", desc: "Law firms, accountants, consultants who need a site that commands authority." },
              { title: "E-COMMERCE BRANDS", desc: "Stores that need a high-converting storefront, not just another off-the-shelf theme." },
              { title: "SCALING STARTUPS", desc: "Early-stage companies that need to establish credibility fast." },
              { title: "B2B SERVICES", desc: "Companies selling to other businesses where trust and clarity drive every deal." }
            ].map((tag) => (
              <div 
                key={tag.title} 
                className="border-[2.5px] border-[#0a0a0a] bg-white p-6 md:p-8 flex flex-col flex-1 min-w-[280px] max-w-[380px] shadow-[4px_4px_0px_#0a0a0a]"
              >
                <div className="font-anton text-base text-[#0a0a0a] tracking-wide mb-2 uppercase">{tag.title}</div>
                <div className="font-roboto text-xs text-[#5a5a5a] leading-relaxed">{tag.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#E8E1CF] border-b-[2.5px] border-[#0a0a0a]" id="faq">
        <div className="max-w-4xl mx-auto">
          {/* Head */}
          <div className="text-left mb-12">
            <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-3">— FAQ —</div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-[52px] leading-[0.92] text-[#0a0a0a] uppercase">
              COMMON <span className="text-[#DD5A2E]">QUESTIONS</span>.
            </h2>
          </div>

          {/* Accordion list */}
          <div className="flex flex-col border-t-[2.5px] border-[#0a0a0a] text-left">
            <details className="faq-item" open={true}>
              <summary>HOW MUCH DOES A WEBSITE COST?</summary>
              <div className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 max-w-2xl">
                Two ways to start. Ongoing starts at $497/month with no upfront cost — includes the website, hosting, minor updates, and local SEO. One-time builds start at $3,500 flat — you own everything outright. We publish these numbers because we'd rather start the conversation with money on the table than have you guess.
              </div>
            </details>
            <details className="faq-item">
              <summary>HOW LONG DOES A SITE TAKE?</summary>
              <div className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 max-w-2xl">
                Most sites launch in 4–6 weeks. Smaller monthly-plan sites can launch in as little as 2 weeks. You'll see a staging link early and can review progress anytime — no black box.
              </div>
            </details>
            <details className="faq-item">
              <summary>DO YOU USE TEMPLATES?</summary>
              <div className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 max-w-2xl">
                No. Every site is custom-designed around your business, your customers, and your goals. Templates are why most small-business websites all look the same — and why they don't convert.
              </div>
            </details>
            <details className="faq-item">
              <summary>WHO OWNS THE SITE WHEN WE'RE DONE?</summary>
              <div className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 max-w-2xl">
                You do. The domain, the hosting, the files, the design. When the project's done, everything transfers to you. If you ever leave us, you take it all.
              </div>
            </details>
            <details className="faq-item">
              <summary>CAN YOU REDESIGN MY EXISTING SITE?</summary>
              <div className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 max-w-2xl">
                Yes — Squarespace, Wix, GoDaddy, WordPress, whatever you've got. We'll audit what's working, keep the equity you've built, and rebuild the rest.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="final-cta py-24 md:py-32 px-6 md:px-12 bg-[#F2EBDA] dotgrid border-b-[2.5px] border-[#0a0a0a] text-center" id="contact">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="font-anton text-xs text-[#DD5A2E] tracking-[2.5px] uppercase mb-4">— READY WHEN YOU ARE —</div>
          <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl leading-[0.9] text-[#0a0a0a] uppercase mb-6">
            STOP LOSING CUSTOMERS TO A<br />
            <span className="text-[#DD5A2E]">CONFUSING</span> WEBSITE.
          </h2>
          <p className="font-roboto text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-md mb-8">
            Free strategy call. No long-term contracts. No BS. Just a clear plan to turn your website into your hardest-working salesperson.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/contact"
              onClick={() => trackCTA("web_design_final_start")}
              className="bg-[#DD5A2E] text-white font-anton text-sm md:text-base uppercase tracking-wider py-4 px-8 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0a0a0a] transition-all"
            >
              START YOUR PROJECT ↗
            </Link>
            <Link 
              href="/contact"
              onClick={() => trackCTA("web_design_final_strategy")}
              className="bg-white text-[#0a0a0a] font-anton text-sm md:text-base uppercase tracking-wider py-4 px-8 border-[2.5px] border-[#0a0a0a] hover:bg-neutral-50 transition-colors"
            >
              BOOK A FREE STRATEGY CALL
            </Link>
          </div>
        </div>
      </section>

      {/* Reusable Global Footer */}
      <Footer />

      {/* MOBILE STICKY BOTTOM CTA BAR */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-2 border-[#DD5A2E] py-3 px-4 flex justify-between items-center md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.25)]">
          <div className="flex gap-2 w-full max-w-sm mx-auto justify-between items-center">
            <a 
              href="tel:4702437517" 
              onClick={() => trackCTA("web_design_sticky_call")}
              className="flex-1 text-center bg-[#F5C842] text-[#0a0a0a] font-anton uppercase text-xs tracking-wider py-2.5 border border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] mr-2"
            >
              CALL NOW
            </a>
            <a 
              href="/contact" 
              onClick={() => trackCTA("web_design_sticky_proposal")}
              className="flex-1 text-center bg-[#DD5A2E] text-white font-anton uppercase text-xs tracking-wider py-2.5 border border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
            >
              GET A PROPOSAL
            </a>
          </div>
          <button 
            onClick={() => setStickyVisible(false)} 
            className="text-white hover:text-[#DD5A2E] ml-4 cursor-pointer focus:outline-none"
            aria-label="Dismiss sticky CTA bar"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
