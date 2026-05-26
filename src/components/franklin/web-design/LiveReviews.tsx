import { Star } from "lucide-react";

export default function LiveReviews() {
  return (
    <section className="py-24 bg-white border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* TODO: Replace with actual embedded widget pulling from GBP */}
        <div className="max-w-4xl mx-auto bg-neutral-50 rounded-[24px] border border-neutral-200 p-12">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex gap-1 text-[#F26522] mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-current" />
              ))}
            </div>
            <h3 className="font-display font-bold text-3xl text-neutral-900">5.0</h3>
            <p className="font-body text-neutral-500 font-medium mt-1">from 20+ Google Reviews</p>
          </div>
          
          <div className="p-8 border border-dashed border-neutral-300 rounded-[14px] bg-neutral-100 text-neutral-500">
            [Live Google Reviews Widget Placeholder]
            <br/>
            <span className="text-sm mt-2 block">Will show star rating, total count, and most recent 5 reviews.</span>
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
