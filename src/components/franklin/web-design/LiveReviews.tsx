import { Star } from "lucide-react";
import { TestimonialStack } from "@/components/ui/glass-testimonial-swiper";

export default function LiveReviews() {
  return (
    <section className="py-32 bg-gradient-to-b from-[#f0ddd4] via-[#fce8d5] to-[#f0ddd4]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="flex gap-1 text-brand-orange mb-3 select-none">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-current" />
            ))}
          </div>
          <h2 className="font-display font-bold text-5xl text-neutral-900 mb-2">5.0 Rating</h2>
          <p className="font-body text-neutral-500 font-semibold uppercase tracking-wider text-sm">
            Based on 20+ client reviews on Google
          </p>
        </div>

        {/* Reviews Swiper */}
        <div className="mb-16">
          <TestimonialStack />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <a 
            href="#" 
            className="inline-flex items-center justify-center px-8 py-[18px] bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-full transition-all duration-300 text-base shadow-[0_4px_16px_rgba(242,101,34,0.35)] hover:shadow-[0_4px_24px_rgba(242,101,34,0.5)] cursor-pointer"
          >
            See all reviews on Google
          </a>
          <span className="font-body text-xs text-neutral-500 italic">
            Pulled from our Google Business Profile &middot; refreshed weekly.
          </span>
        </div>

      </div>
    </section>
  );
}
