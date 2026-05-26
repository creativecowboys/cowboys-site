import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-32 bg-[#F4F2F0]">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-[-0.02em] text-neutral-900 mb-6">
          Ready to get started?
        </h2>
        <p className="font-body text-xl text-neutral-600 mb-12">
          Two ways to begin. Both free. Both take less than 5 minutes from your side.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link 
            href="#scorecard" 
            className="inline-flex items-center justify-center px-8 py-5 bg-[#F26522] hover:bg-[#d9551a] text-white font-bold rounded-full transition-colors text-lg w-full sm:w-auto"
          >
            Get a Free Franklin Web Design Scorecard
          </Link>
          <Link 
            href="#book-call" 
            className="inline-flex items-center justify-center px-8 py-5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold rounded-full transition-colors text-lg w-full sm:w-auto shadow-sm"
          >
            Book a 20-min strategy call
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body font-medium text-neutral-500">
          <span>(470) 243-7517</span>
          <span className="hidden sm:inline">·</span>
          <span>hello@creativecowboys.co</span>
          <span className="hidden sm:inline">·</span>
          <span>[Franklin TN office address]</span>
        </div>
      </div>
    </section>
  );
}
