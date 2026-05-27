import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-32 bg-[#0D0D0F] border-b border-white/10">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center text-white">
        <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
          &mdash; GET STARTED &mdash;
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-[-0.02em] text-white mb-6">
          Ready to grow your{" "}
          <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
            Franklin business?
          </span>
        </h2>
        <p className="font-body text-xl text-neutral-300 mb-12">
          Two ways to begin. Both free. Both take less than 5 minutes from your side.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link 
            href="#scorecard" 
            className="inline-flex items-center justify-center px-8 py-[18px] bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-full transition-all duration-300 text-base shadow-[0_4px_16px_rgba(242,101,34,0.35)] hover:shadow-[0_4px_24px_rgba(242,101,34,0.5)] cursor-pointer text-center w-full sm:w-auto"
          >
            Start a Project
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="#book-call" 
            className="inline-flex items-center justify-center py-[18px] px-8 border border-white/20 hover:bg-white/5 bg-transparent text-white font-semibold rounded-full transition-all duration-300 text-base cursor-pointer text-center w-full sm:w-auto"
          >
            Get a Free Consultation
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body font-medium text-neutral-400">
          <span>(470) 243-7517</span>
          <span className="hidden sm:inline">·</span>
          <span>hello@creativecowboys.co</span>
          <span className="hidden sm:inline">·</span>
          <span>Serving Franklin, TN</span>
        </div>
      </div>
    </section>
  );
}
