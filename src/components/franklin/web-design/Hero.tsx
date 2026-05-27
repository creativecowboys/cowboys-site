"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupportsHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    const handleMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sectionRef.current.style.setProperty("--mouse-x", `${x}px`);
      sectionRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const section = sectionRef.current;
    if (section && mediaQuery.matches) {
      section.addEventListener("mousemove", handleMove);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      if (section) {
        section.removeEventListener("mousemove", handleMove);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#0D0D0F] text-white pt-24 pb-20 md:pt-36 md:pb-28 group">
      {/* 7.2 Hero background grain texture overlay */}
      <div 
        className="absolute inset-0 z-0 bg-repeat pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: "url('/franklin-tn/hero-noise.png')", backgroundSize: "1440px 900px" }}
      />

      {/* Cursor-following highlight overlay (omitted on touch devices) */}
      {supportsHover && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: "radial-gradient(200px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(242, 101, 34, 0.15), transparent 80%)"
          }}
        />
      )}

      {/* Chrome Brand bar - Top Left Page Chrome */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 mb-8 md:mb-16">
        <Link href="/" className="site-logo inline-block select-none">
          <Image
            src="/Main%20logo%202.png"
            alt="Creative Cowboys"
            width={180}
            height={48}
            priority
            style={{ width: "180px", height: "auto" }}
          />
        </Link>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: 60% on desktop (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow chip */}
            <div className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-6">
              &mdash; WEB DESIGN &middot; FRANKLIN, TN &mdash;
            </div>

            {/* H1 */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[56px] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-6 max-w-2xl">
              Franklin Web Design That Pays For Itself{" "}
              <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
                in 90 Days.
              </span>
            </h1>

            {/* Subhead */}
            <p className="font-body text-base md:text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
              A senior Southeast agency, now serving Franklin and Williamson County. 100+ websites built · $2M+ in revenue generated for clients · 1.4-second average page load. No hand-off jargon, no offshore work, no surprise change orders.
            </p>

            {/* MOBILE DEVICE MOCKUP: Stacks BELOW subhead and ABOVE CTAs on mobile (hidden on desktop) */}
            <div className="block lg:hidden w-[60%] sm:w-[50%] mx-auto my-8 relative">
              {/* Glow Accent behind */}
              <div className="absolute -inset-4 z-0 pointer-events-none opacity-30 blur-2xl">
                <Image 
                  src="/franklin-tn/hero-accent.png"
                  alt="Accent Glow"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              
              {/* Photo-realistic MacBook Frame */}
              <div className="relative z-10 rotate-[4deg] translate-x-2">
                {/* Screen */}
                <div className="relative aspect-[16/10] bg-[#121417] rounded-t-xl p-1.5 pb-0 shadow-2xl border-t border-x border-white/10">
                  <div className="relative w-full h-full overflow-hidden rounded-t-md bg-neutral-950">
                    <Image
                      src="/franklin-tn/harmonic-desktop-hero.png"
                      alt="Harmonic Production Desktop Mockup"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                {/* Base */}
                <div className="relative h-1.5 bg-neutral-800 rounded-b-xl border-t border-neutral-700 w-[102%] -left-[1%]"></div>
                <div className="relative h-0.5 bg-black/50 rounded-b-xl w-[90%] mx-auto opacity-50 shadow-md"></div>
              </div>
            </div>

            {/* CTA Stack */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="#scorecard"
                className="inline-flex items-center justify-center px-8 py-[18px] bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-full transition-all duration-300 text-base shadow-[0_4px_16px_rgba(242,101,34,0.35)] hover:shadow-[0_4px_24px_rgba(242,101,34,0.5)] cursor-pointer text-center"
              >
                Get a Free Franklin Web Design Scorecard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                href="#book-call"
                className="inline-flex items-center justify-center py-[18px] px-8 border border-white/20 hover:bg-white/5 bg-transparent text-white font-semibold rounded-full transition-all duration-300 text-base cursor-pointer text-center"
              >
                Book a 20-min Franklin web strategy call
              </Link>
            </div>

            {/* Trust microline */}
            <span className="text-xs text-white/50 mt-3 font-medium w-full sm:w-auto sm:pl-2 text-center sm:text-left">
              48-hour turnaround. No sales call required.
            </span>

          </div>

          {/* RIGHT COLUMN: 40% on desktop (col-span-5, hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-5 relative w-full">
            {/* Glow Accent behind */}
            <div className="absolute -left-1/4 -top-1/4 w-[150%] h-[150%] z-0 pointer-events-none opacity-20 blur-3xl select-none">
              <Image 
                src="/franklin-tn/hero-accent.png"
                alt="Accent Glow"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Photo-realistic MacBook Frame with slight rotation and offset */}
            <div className="relative z-10 rotate-[5deg] translate-x-8 translate-y-2 transform hover:rotate-[3deg] transition-transform duration-700 ease-out select-none">
              {/* Screen */}
              <div className="relative aspect-[16/10] bg-[#121417] rounded-t-2xl p-3 pb-0 shadow-2xl border-t border-x border-white/10">
                <div className="relative w-full h-full overflow-hidden rounded-t-lg bg-neutral-950">
                  <Image
                    src="/franklin-tn/harmonic-desktop-hero.png"
                    alt="Harmonic Production Desktop Mockup"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
              {/* Base */}
              <div className="relative h-2.5 bg-neutral-800 rounded-b-2xl border-t border-neutral-700 w-[102%] -left-[1%]"></div>
              <div className="relative h-1 bg-black/60 rounded-b-2xl w-[90%] mx-auto opacity-50 shadow-xl"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
