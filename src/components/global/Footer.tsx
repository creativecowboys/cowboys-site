"use client";

import React from "react";
import Link from "next/link";
import { Clock, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#0e0e0e] text-[#F2EBDA] border-t-[2.5px] border-[#0a0a0a] py-16 px-6 md:px-12 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Footer Contact Details */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <h3 className="font-h3-display text-3xl uppercase tracking-widest text-[#F5C842]">HOWDY PARTNER</h3>
          <p className="font-h3-secondary text-sm text-[#F2EBDA]/70 leading-relaxed max-w-sm">
            We're Josh and Dave — Villa Rica, GA born, and now settin' up shop in Franklin, TN. No vanity metrics. Just websites, ads, and SEO built to make your phone ring.
          </p>

          <div className="flex flex-col gap-3 font-bold text-sm tracking-wider uppercase">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-[#F5C842]" />
              <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
            </div>
            <a href="mailto:howdy@creativecowboys.co" className="flex items-center gap-3 hover:text-[#DD5A2E] transition-colors duration-200">
              <Mail size={16} className="text-[#F5C842]" />
              <span>howdy@creativecowboys.co</span>
            </a>
            <a href="tel:4702437517" className="flex items-center gap-3 hover:text-[#DD5A2E] transition-colors duration-200">
              <Phone size={16} className="text-[#F5C842]" />
              <span>(470) 243-7517</span>
            </a>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[#F5C842]" />
              <span>
                VILLA RICA, GA &nbsp;·&nbsp; FRANKLIN, TN <span className="text-[#DD5A2E] font-extrabold">(NEW OFFICE)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Logo Wordmark */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-6 md:pt-0 md:pb-6 border-y-2 md:border-y-0 md:border-x-2 border-[#F2EBDA]/10">
          <div className="font-h3-display text-3xl uppercase tracking-widest text-[#DD5A2E] mb-2">
            COWBOYS
          </div>
          <div className="font-h3-secondary text-[9px] uppercase tracking-[0.2em] font-bold text-[#F2EBDA]/40">
            © 2026 ALL RIGHTS RESERVED
          </div>
          
          {/* Social Icons Badge Grid */}
          <div className="flex gap-4 mt-6">
            <a 
              href="https://www.facebook.com/creativecowboyco" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 border border-[#F2EBDA] rotate-45 flex items-center justify-center hover:bg-[#F2EBDA] hover:text-[#0e0e0e] transition-colors duration-200 group"
            >
              <span className="-rotate-45 font-bold text-xs">fb</span>
            </a>
            <a 
              href="https://www.instagram.com/creativecowboyco" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 border border-[#F2EBDA] rotate-45 flex items-center justify-center hover:bg-[#F2EBDA] hover:text-[#0e0e0e] transition-colors duration-200 group"
            >
              <span className="-rotate-45 font-bold text-xs">ig</span>
            </a>
          </div>
        </div>

        {/* Quick links & Brand tag */}
        <div className="md:col-span-3 flex flex-col gap-6 text-left">
          <h4 className="font-h3-display text-3xl uppercase tracking-widest text-[#DD5A2E]">DIRECT LINKS</h4>
          <div className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-[#F2EBDA]/70">
            <Link href="/seo" className="hover:text-[#DD5A2E] transition-colors">SEO Programs</Link>
            <Link href="/web-design" className="hover:text-[#DD5A2E] transition-colors">Web Design</Link>
            <Link href="/ppc" className="hover:text-[#DD5A2E] transition-colors">PPC Campaigns</Link>
            <Link href="/brand-strategy" className="hover:text-[#DD5A2E] transition-colors">Brand Strategy</Link>
            <Link href="/franklin-tn/web-design" className="hover:text-[#F5C842] text-[#DD5A2E] transition-colors mt-1 font-extrabold">Franklin, TN Hub</Link>
            <Link href="/contact" className="hover:text-[#DD5A2E] transition-colors mt-2">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
