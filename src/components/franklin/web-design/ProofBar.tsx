export default function ProofBar() {
  const stats = [
    {
      value: "★ 5.0",
      label: "From 20+ Google reviews",
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
    <section className="w-full bg-[#0E0E10] py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center justify-center relative">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-4 relative ${
                i > 0 ? "md:border-l border-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 justify-center mb-2">
                <span className="font-display font-bold text-5xl md:text-6xl text-white leading-none tracking-tight">
                  {stat.value}
                </span>
              </div>
              <span className="font-body text-xs md:text-sm font-semibold text-[#6a6a68] uppercase tracking-[0.12em] max-w-[200px] leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
