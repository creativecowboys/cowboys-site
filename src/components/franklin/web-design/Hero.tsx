import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Franklin, TN/Living-in-Franklin-TN-A-Local-Perspective-cover.webp"
          alt="Franklin, Tennessee"
          fill
          className="object-cover object-center"
          priority
          quality={85}
        />
        {/* Gradient overlay: dark top → transparent mid → cream bottom (blends into next section) */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-900/50 to-[#F4F2F0]" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold tracking-widest uppercase">
          Web Design · Franklin, TN
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-[-0.02em] text-white mb-8 max-w-4xl mx-auto leading-tight drop-shadow-sm">
          Franklin Web Design That Pays For Itself in 90 Days.
        </h1>

        <p className="font-body text-lg md:text-xl text-white/85 mb-10 max-w-3xl mx-auto leading-relaxed font-medium tracking-[-0.005em]">
          A senior Southeast agency, now serving Franklin and Williamson County. 100+ websites built · $2M+ in revenue generated for clients · 1.4-second average page load. No hand-off jargon, no offshore work, no surprise change orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <div className="flex flex-col items-center">
            <Link
              href="#scorecard"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#F26522] hover:bg-[#d9551a] text-white font-bold rounded-full transition-colors text-lg shadow-lg"
            >
              Get a Free Franklin Web Design Scorecard
            </Link>
            <span className="text-sm text-white/70 mt-2 font-medium">48-hour turnaround. No sales call required.</span>
          </div>

          <div className="hidden sm:block text-white/40 mx-2">or</div>

          <Link
            href="#book-call"
            className="inline-flex items-center justify-center px-6 py-4 text-white/90 hover:text-white font-bold transition-colors text-lg underline decoration-2 underline-offset-4"
          >
            Book a 20-min Franklin web strategy call &rarr;
          </Link>
        </div>

        {/* Proof bar — sits over the fade-to-cream zone, white cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-5 flex flex-col items-center text-center shadow-sm">
            <div className="flex items-center gap-1 text-[#F26522] mb-1">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-xl text-neutral-900">5.0</span>
            </div>
            <p className="text-sm font-medium text-neutral-600">from 20+ Google reviews</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-5 flex flex-col items-center text-center shadow-sm">
            <span className="font-display font-bold text-2xl md:text-3xl text-neutral-900 mb-1">100+</span>
            <p className="text-sm font-medium text-neutral-600">websites built since 2022</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-5 flex flex-col items-center text-center shadow-sm">
            <span className="font-display font-bold text-2xl md:text-3xl text-neutral-900 mb-1">$2M+</span>
            <p className="text-sm font-medium text-neutral-600">in revenue generated for clients</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-5 flex flex-col items-center text-center shadow-sm">
            <span className="font-display font-bold text-2xl md:text-3xl text-neutral-900 mb-1">500+</span>
            <p className="text-sm font-medium text-neutral-600">#1 organic rankings achieved</p>
          </div>
        </div>
      </div>
    </section>
  );
}

