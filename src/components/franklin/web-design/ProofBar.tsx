import { Star } from "lucide-react";

export default function ProofBar() {
  const stats = [
    {
      value: "5.0",
      label: "From 20+ Google reviews",
      hasStars: true,
    },
    {
      value: "100+",
      label: "Websites built since 2022",
    },
    {
      value: "$2M+",
      label: "Revenue generated for clients",
    },
    {
      value: "500+",
      label: "#1 Organic rankings achieved",
    },
  ];

  return (
    <section className="w-full bg-[#F4F2F0] py-12 border-b border-[#ECEAE3]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center justify-center relative">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-4 relative ${
                i > 0 ? "md:border-l border-[#ECEAE3]" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 justify-center mb-2">
                {stat.hasStars && (
                  <div className="flex text-[#F26522]">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                )}
                <span className="font-display font-bold text-5xl md:text-6xl text-[#121417] leading-none tracking-tight">
                  {stat.value}
                </span>
              </div>
              <span className="font-body text-xs md:text-sm font-semibold text-[#6a6a68] uppercase tracking-widest max-w-[200px] leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
