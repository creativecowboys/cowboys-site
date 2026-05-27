import Image from "next/image";

export default function ServiceArea() {
  const neighborhoods = [
    "Cool Springs", "Westhaven", "Berry Farms", 
    "Downtown Franklin", "McKay's Mill", 
    "Fieldstone Farms", "Brentwood", "Spring Hill"
  ];

  const verticals = [
    "Healthcare & dental", "Boutique retail", "Restaurants & hospitality",
    "Home services (HVAC, roofing, landscaping)", "Professional services (law, financial, accounting)",
    "Country music & entertainment", "Wealth management"
  ];

  return (
    <section className="py-32 bg-[#0D0D0F] text-[#F4F2F0] border-b border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (41.7% on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
              &mdash; WILLIAMSON COUNTY &mdash;
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-6">
              Serving the full Franklin{" "}
              <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
                and Williamson County market.
              </span>
            </h2>
            <p className="font-body text-lg text-neutral-300 leading-relaxed mb-10">
              From Cool Springs storefronts to Westhaven boutiques, from Berry Farms home services to Downtown Franklin professional firms — we work with businesses across every Franklin neighborhood. Strategy calls in person or remote, whichever fits how you work.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-body text-xs font-semibold tracking-[0.12em] uppercase text-brand-orange mb-4">
                  Neighborhoods We Serve
                </h3>
                <ul className="space-y-3 font-body text-neutral-300">
                  {neighborhoods.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-body text-xs font-semibold tracking-[0.12em] uppercase text-brand-orange mb-4">
                  Verticals We Know
                </h3>
                <ul className="space-y-3 font-body text-neutral-300">
                  {verticals.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (58.3% on desktop, bleeds 24px past right edge) */}
          <div className="lg:col-span-7 flex justify-center items-center lg:-mr-6 lg:translate-x-6 overflow-visible w-full">
            <div className="relative w-full aspect-[4/3] select-none">
              <Image 
                src="/franklin-tn/williamson-county-map.svg" 
                alt="Williamson County Map"
                fill
                className="object-contain object-right lg:object-right"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
