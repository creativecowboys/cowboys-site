import { Star } from "lucide-react";

export default function LiveReviews() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="max-w-4xl mx-auto bg-neutral-50 rounded-[24px] border border-neutral-200 p-12">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex gap-1 text-[#F26522] mb-3 select-none">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-current" />
              ))}
            </div>
            <h3 className="font-display font-bold text-3xl text-neutral-900">5.0</h3>
            <p className="font-body text-neutral-500 font-medium mt-1">from 20+ Google Reviews</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-300 rounded-[14px] bg-neutral-100/50">
            <div className="flex items-center gap-3 text-neutral-600 font-body">
              <svg className="animate-spin h-5 w-5 text-[#F26522]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-semibold text-neutral-800">Live reviews — loading from Google</span>
            </div>
          </div>
          
          <div className="mt-8">
            <a href="#" className="font-body font-bold text-[#F26522] hover:underline underline-offset-4">
              See all reviews on Google &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
