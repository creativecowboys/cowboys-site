import Image from "next/image";

export default function FAQ() {
  const faqs = [
    {
      q: "How much does a website cost in Franklin, TN?",
      a: "Our flat-fee tiers start at $6,500 for a Starter site (5 pages, 5–6 week build). Growth is $14,500. Scale is $28,500+. Most Franklin small businesses land in Starter or Growth. We publish these numbers on this page because we'd rather start the conversation with money on the table than have you guess. If you find a Franklin agency quoting $1,500 for a 'custom' site, the work is being done offshore — that's not a value judgment, it's just useful information."
    },
    {
      q: "How long does it take to build a website for a Franklin business?",
      a: "5–6 weeks for Starter, 6–8 weeks for Growth, 10–14 weeks for Scale. That's calendar time, not 'we're working on it.' Each phase has a real deliverable date in your project tracker. We've never missed a launch date that wasn't pushed by the client."
    },
    {
      q: "Do you work with WordPress, Webflow, or both?",
      a: "Both. WordPress for clients who want full ownership and an enormous plugin ecosystem (most home services, professional services, eCom). Webflow for clients who want a faster build, easier ongoing edits, and a designer-friendly CMS (most boutique retail, restaurants, creative businesses). We'll recommend the right one for your team — never the one that's easier for us."
    },
    {
      q: "Will my new site actually rank in Cool Springs / Westhaven / Downtown Franklin search results?",
      a: "On its own, no website ranks for anything just by existing. But every site we build includes the SEO foundations that put it in a position to rank: clean technical SEO, schema markup, page speed, mobile-first design, proper headings, location-specific pages, and Google Business Profile integration. From there, ranking is a function of links, content velocity, and competitive pressure — which is what our SEO service handles. The website is the prerequisite, not the whole answer."
    },
    {
      q: "What happens after launch? Do you offer maintenance?",
      a: "Yes. Our Care Plans handle hosting, updates, backups, security monitoring, uptime monitoring, monthly content edits, and quarterly design refreshes. Starts at $150/mo for Starter sites. Optional, not required. Many Franklin clients run their sites themselves after launch and only call us when they want a redesign — that's fine."
    },
    {
      q: "Can you redesign my existing Squarespace / Wix / GoDaddy site?",
      a: "Most of our projects are redesigns, not new builds. We'll usually rebuild on WordPress or Webflow rather than try to fix a Squarespace site that has fundamental limitations. If your current site is actually fine and you just need a refresh, we'll tell you — and recommend a designer who does Squarespace refreshes for less than we'd charge."
    },
    {
      q: "Who owns the site, the domain, and the hosting when we're done?",
      a: "You do. All of it. We don't host other agencies' work as a lock-in. The domain stays in your account. The hosting account (typically WP Engine, Kinsta, or Webflow Cloud) goes in your name. The files are yours. If you ever fire us, you walk away with everything."
    },
    {
      q: "Do you handle copywriting and photography?",
      a: "Yes — and we usually do. Most clients come to us with a website that's been written in the voice of whoever happened to have time. We write the site in your voice and source or produce professional photography for the project. For Franklin-area shoots we'll travel for the project scope, and we have a network of Nashville-area photographers we work with directly. Included in Growth and Scale tiers; optional add-on for Starter."
    },
    {
      q: "What if I'm not happy with the design?",
      a: "First design review usually happens in week 3 of a Growth project. If the direction's wrong, we'll do one full pivot — new concept, new layout, new mood — at no extra cost. That's happened twice across our portfolio. After the pivot we'll talk about whether the brief was wrong, the work was wrong, or whether we're not a fit."
    },
    {
      q: "Do you build ecommerce sites for Franklin retailers?",
      a: "Yes. Shopify, WooCommerce, or BigCommerce depending on the catalog size and integrations. We've built ecom for Williamson County boutique retail, food/CPG brands, and home goods. Pricing usually lands in our Growth or Scale tier depending on product count and integrations."
    },
    {
      q: "Can you make my site ADA / WCAG compliant?",
      a: "WCAG 2.1 AA is our default standard on every Growth and Scale build. If you're a Franklin healthcare practice, professional services firm, or running paid ads, this isn't optional — it's a real legal exposure. Starter tier covers WCAG basics; full audit + compliance is an add-on or upgrade to Growth."
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
          
          {/* Left Column (40% / col-span-4 on desktop) */}
          <div className="lg:col-span-4 flex flex-col items-start lg:sticky lg:top-8">
            <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
              &mdash; FAQ &mdash;
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-8 leading-[1.15]">
              Questions Franklin business owners{" "}
              <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
                actually ask us.
              </span>
            </h2>
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto lg:mx-0 select-none">
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
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-[#121417] rounded-[14px] border border-white/10 overflow-hidden open:shadow-sm transition-all">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-display font-bold text-lg text-white marker:content-none hover:text-brand-orange transition-colors">
                  {faq.q}
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <span className="absolute h-0.5 w-5 bg-current transition-transform duration-300 ease-out group-open:rotate-180" />
                    <span className="absolute h-5 w-0.5 bg-current transition-transform duration-300 ease-out group-open:rotate-90" />
                  </span>
                </summary>
                <div className="px-6 pb-6 font-body text-neutral-300 leading-relaxed text-lg">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
