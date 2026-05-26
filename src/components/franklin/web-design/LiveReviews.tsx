import { Star } from "lucide-react";

export default function LiveReviews() {
  const reviews = [
    {
      name: "Ryan Coffey",
      role: "Owner, Harmonic Production",
      stars: 5,
      date: "2 months ago",
      text: "Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Zero downtime.",
      initials: "RC",
      bg: "bg-orange-500"
    },
    {
      name: "Rob Goldin",
      role: "Owner, Bremen Commercial Insurance",
      stars: 5,
      date: "3 weeks ago",
      text: "Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.",
      initials: "RG",
      bg: "bg-purple-500"
    },
    {
      name: "Samantha Lee",
      role: "Director, Horizon Real Estate Group",
      stars: 5,
      date: "1 month ago",
      text: "Our old website was embarrassing us at networking events. Creative Cowboys turned it around fast — clean, modern, and built to convert. Our inquiry form submissions went up immediately after launch.",
      initials: "SL",
      bg: "bg-blue-500"
    },
    {
      name: "John B. Jackson",
      role: "Founder, Jackson Law",
      stars: 5,
      date: "4 months ago",
      text: "Within 6 months of starting, we held 21 #1 positions on Google for our target keywords. Organic leads became our primary acquisition channel, reducing our dependence on paid ads.",
      initials: "JJ",
      bg: "bg-emerald-500"
    },
    {
      name: "Lance Day",
      role: "Owner, Day Accounting (CPA)",
      stars: 5,
      date: "5 months ago",
      text: "If you need some help with your web work, these guys can get it all together for you. No worries, just solutions.",
      initials: "LD",
      bg: "bg-amber-500"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="flex gap-1 text-[#F26522] mb-3 select-none">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-current" />
            ))}
          </div>
          <h2 className="font-display font-bold text-5xl text-neutral-900 mb-2">5.0 Rating</h2>
          <p className="font-body text-neutral-500 font-semibold uppercase tracking-wider text-sm">
            Based on 20+ client reviews on Google
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((rev, i) => (
            <div 
              key={i} 
              className={`bg-[#F4F2F0] p-8 rounded-[24px] border border-[#ECEAE3] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 ${
                i >= 3 ? "lg:col-span-1 md:col-span-1 lg:md:col-span-1" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full ${rev.bg} text-white flex items-center justify-center font-display font-bold text-sm select-none`}>
                    {rev.initials}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 leading-none mb-1">{rev.name}</h3>
                    <p className="font-body text-xs text-neutral-500">{rev.role}</p>
                  </div>
                </div>
                <div className="flex text-[#F26522] gap-0.5 mb-4 select-none">
                  {[...Array(rev.stars)].map((_, starIdx) => (
                    <Star key={starIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="font-body text-neutral-700 text-sm leading-relaxed mb-6">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
              <span className="font-body text-[11px] text-neutral-400 font-medium block">
                Posted {rev.date}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <a 
            href="#" 
            className="inline-flex items-center justify-center px-8 py-[18px] bg-[#F26522] hover:bg-[#ff7b3a] text-white font-semibold rounded-full transition-all duration-300 text-base shadow-[0_4px_16px_rgba(242,101,34,0.35)] hover:shadow-[0_4px_24px_rgba(242,101,34,0.5)] cursor-pointer"
          >
            See all reviews on Google
          </a>
          <span className="font-body text-xs text-neutral-400 italic">
            Pulled from our Google Business Profile &middot; refreshed weekly.
          </span>
        </div>

      </div>
    </section>
  );
}
