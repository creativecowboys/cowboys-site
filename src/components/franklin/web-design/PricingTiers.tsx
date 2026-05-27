import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function PricingTiers() {
  return (
    <section className="bg-[#0D0D0F] py-32 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
            &mdash; PRICING TIERS &mdash;
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-6">
            Three ways to start.{" "}
            <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
              All with real numbers.
            </span>
          </h2>
          <p className="font-body text-lg text-neutral-300 leading-relaxed">
            Most Franklin agencies hide their pricing. We don&apos;t. Here&apos;s what a website costs us to build correctly — and here&apos;s what&apos;s in each tier. If your project doesn&apos;t fit one of these, we&apos;ll tell you and recommend someone better suited (sometimes that&apos;s a freelancer, sometimes Squarespace, sometimes nobody yet).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 items-stretch">
          {/* Starter Tier */}
          <div className="bg-[#121417] rounded-[18px] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="font-display text-3xl font-bold text-brand-orange mb-6">$6,500 flat</div>
              <ul className="space-y-4 mb-8 font-body text-neutral-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>5-page marketing site for Franklin small business.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Strategy &rarr; Design &rarr; Build &rarr; Launch in 5–6 weeks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>WordPress or Webflow.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>SEO foundations + analytics setup included.</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-500">
                  <span className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Care plan optional ($150/mo).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Growth Tier */}
          <div className="bg-[#1A1A1E] rounded-[18px] p-8 border-2 border-brand-orange shadow-md flex flex-col justify-between relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Most Common
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Growth</h3>
              <div className="font-display text-3xl font-bold text-brand-orange mb-6">$14,500 flat</div>
              <ul className="space-y-4 mb-8 font-body text-neutral-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>8–15 page site for growing Franklin business.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Custom design system.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Conversion-tested forms. CRM/HubSpot/Mailchimp integration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Lighthouse 95+ mobile guaranteed. 6–8 weeks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Care plan included for first 3 months.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Scale Tier */}
          <div className="bg-[#121417] rounded-[18px] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Scale</h3>
              <div className="font-display text-3xl font-bold text-brand-orange mb-6">$28,500+ flat</div>
              <ul className="space-y-4 mb-8 font-body text-neutral-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Full custom design + dev.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>CMS-driven. Custom integrations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>eCom, membership, or app-like experiences.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Full schema + analytics. 10–14 weeks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Includes 90-day post-launch conversion optimization.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-[#121417] p-8 rounded-2xl border border-white/10 text-center">
          <h4 className="font-display font-bold text-xl text-white mb-4">How we price</h4>
          <p className="font-body text-neutral-300 mb-8 max-w-3xl mx-auto">
            Flat project fee, paid in three milestones (kickoff / design approval / launch). No retainers, no hidden change orders — we scope tight upfront. The single biggest reason web design projects go off the rails is fuzzy scope, and we&apos;d rather pass on a project than guess at it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <span className="font-body font-medium text-neutral-300">Not sure which tier fits?</span>
            <Link 
              href="#scorecard" 
              className="inline-flex items-center justify-center px-8 py-[18px] bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-full transition-all duration-300 text-base shadow-[0_4px_16px_rgba(242,101,34,0.35)] hover:shadow-[0_4px_24px_rgba(242,101,34,0.5)] cursor-pointer text-center"
            >
              Get a Free Franklin Web Design Scorecard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
