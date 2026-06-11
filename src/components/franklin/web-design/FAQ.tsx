"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How much does a website cost in Franklin, TN?",
      a: "We offer two ways to start. Ongoing starts at $497/month with no upfront cost — includes the website, hosting, minor updates, and a Local SEO package. One Time builds start at $3,500 flat — you own everything outright on your own cloud server with no ongoing commitment. Most Franklin small businesses pick the model that matches their cash flow, not their site size. We publish these numbers because we'd rather start the conversation with money on the table than have you guess. If you find a Franklin agency quoting $1,500 for a 'custom' site, the work is being done offshore — that's not a value judgment, it's just useful information."
    },
    {
      q: "How long does it take to build a website for a Franklin business?",
      a: "4–6 weeks for most Ongoing builds, 6–10 weeks for One Time builds depending on scope. Complex e-commerce or custom database work runs 10–14 weeks. That's calendar time, not 'we're working on it.' Each phase has a real deliverable date in your project tracker. We've never missed a launch date that wasn't pushed by the client."
    },
    {
      q: "Do you build on WordPress, Webflow, or something else?",
      a: "We can work in WordPress or Webflow if you've already invested in one — we'll meet you where you are. For new builds from scratch, we've refined a faster, more modern architecture that delivers sub-1.5-second load times, better Google performance, and lower long-term hosting costs than typical WordPress sites. The stack we use is enterprise-grade — the same kind of cloud infrastructure that powers some of the fastest sites on the internet — but the technical details are our problem, not yours. You get a fast site, you own it, and you can move it anywhere you want later."
    },
    {
      q: "Will my new site actually rank in Cool Springs / Westhaven / Downtown Franklin search results?",
      a: "On its own, no website ranks for anything just by existing. But every site we build includes the SEO foundations that put it in a position to rank: clean technical SEO, schema markup, page speed, mobile-first design, proper headings, location-specific pages, and Google Business Profile integration. From there, ranking is a function of links, content velocity, and competitive pressure — which is what our SEO service handles. The website is the prerequisite, not the whole answer."
    },
    {
      q: "What happens after launch? Do you offer maintenance?",
      a: "If you chose Ongoing, all of this is already included — hosting, updates, backups, security monitoring, uptime monitoring, minor content edits, and a Local SEO package, all rolled into the $497/month. If you chose One Time, you own and run the site yourself on your own cloud server — and we can quote a separate care plan starting at $150/month if you want us handling maintenance, security, and small edits for you. Many Franklin clients run their One Time sites themselves after launch and only call us when they want a redesign — that's fine too."
    },
    {
      q: "Can you redesign my existing Squarespace / Wix / GoDaddy site?",
      a: "Most of our projects are redesigns, not new builds. We'll usually rebuild from scratch on our modern architecture rather than try to fix a Squarespace site that has fundamental limitations. You'll end up with a faster, better-ranking site that you own outright. If your current site is actually fine and you just need a refresh, we'll tell you — and recommend a designer who does Squarespace refreshes for less than we'd charge."
    },
    {
      q: "Who owns the site, the domain, and the hosting when we're done?",
      a: "You do. All of it. We don't lock clients into our infrastructure. The domain stays in your account. With Ongoing, the site lives on cloud hosting we manage as part of your subscription — and if you ever leave us, you can transfer or buy out the site outright. With One Time, the site is set up on your own secure cloud server from day one, in your name, with you holding the keys. The files, design, and code are yours either way. If you ever fire us, you walk away with everything."
    },
    {
      q: "Do you handle copywriting and photography?",
      a: "Yes — and we usually do. Most clients come to us with a website that's been written in the voice of whoever happened to have time. We write the site in your voice and source or produce professional photography for the project. For Franklin-area shoots we'll travel for the project scope, and we have a network of Nashville-area photographers we work with directly. Included by default in One Time builds; available as an add-on for Ongoing subscribers."
    },
    {
      q: "What if I'm not happy with the design?",
      a: "First design review usually happens in week 3. If the direction's wrong, we'll do one full pivot — new concept, new layout, new mood — at no extra cost. That's happened twice across our portfolio. After the pivot we'll talk about whether the brief was wrong, the work was wrong, or whether we're not a fit."
    },
    {
      q: "Do you build ecommerce sites for Franklin retailers?",
      a: "Yes. We build on Shopify for most catalog-driven retail, or on our modern architecture for headless and custom commerce setups. We've built e-commerce for Williamson County boutique retail, food/CPG brands, and home goods. E-commerce projects price as One Time builds starting at $7,500+ depending on product count, custom integrations, and complexity."
    },
    {
      q: "Can you make my site ADA / WCAG compliant?",
      a: "WCAG 2.1 AA is our default standard on every One Time build. If you're a Franklin healthcare practice, professional services firm, or running paid ads, this isn't optional — it's a real legal exposure. Ongoing subscribers get WCAG basics by default; a full compliance audit can be added as a one-time service."
    },
    {
      q: "Why should I hire Creative Cowboys instead of JLB or Horton Group?",
      a: "Honest answer: JLB has been around for 20+ years and has a bigger team. If you want a 'safe' agency choice with a lot of badges, they're a real option. We're a smaller senior team — flatter org, more time on each project, modern design language, real founder accountability. Look at our case studies, look at their case studies, look at the visual design of both websites, and decide which feels like the team you want building yours. We're not for everyone."
    }
  ];

  return (
    <section className="py-28 bg-[#0D0D0F] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (40% / col-span-4 on desktop, vertically centered relative to grid) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start lg:self-center w-full lg:sticky lg:top-12">
            <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
              &mdash; FAQ &mdash;
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-8 leading-[1.15] text-center lg:text-left w-full">
              Questions Franklin business owners{" "}
              <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
                actually ask us.
              </span>
            </h2>
            <div className="relative w-full max-w-[360px] md:max-w-[400px] aspect-square select-none">
              <Image
                src="/franklin-tn/faq-illustration-dark.svg"
                alt="FAQ illustration"
                fill
                className="object-contain opacity-95"
              />
            </div>
          </div>

          {/* Right Column (60% / col-span-6 on desktop) */}
          <div className="lg:col-span-6 space-y-4 w-full text-white">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div 
                  key={i} 
                  className="bg-[#121417] rounded-[14px] border border-white/10 overflow-hidden transition-colors duration-300"
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between p-6 font-display font-bold text-lg text-white hover:text-brand-orange transition-colors focus:outline-none text-left"
                  >
                    {faq.q}
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-current">
                      <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`} />
                      <span className={`absolute h-5 w-0.5 bg-current transition-transform duration-300 ease-out ${isOpen ? "rotate-90 scale-y-0" : ""}`} />
                    </span>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 font-body text-neutral-300 leading-relaxed text-lg border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
