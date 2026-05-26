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
    <section className="py-32 bg-[#121417] text-[#F4F2F0]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (50% on desktop) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-[#F4F2F0] mb-6">
              Serving the full Franklin and Williamson County market.
            </h2>
            <p className="font-body text-lg text-neutral-300 leading-relaxed mb-10">
              From Cool Springs storefronts to Westhaven boutiques, from Berry Farms home services to Downtown Franklin professional firms — we work with businesses across every Franklin neighborhood. Strategy calls in person or remote, whichever fits how you work.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-body text-sm font-bold tracking-widest uppercase text-[#F26522] mb-4">
                  Neighborhoods We Serve
                </h3>
                <ul className="space-y-3 font-body text-neutral-300">
                  {neighborhoods.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-body text-sm font-bold tracking-widest uppercase text-[#F26522] mb-4">
                  Verticals We Know
                </h3>
                <ul className="space-y-3 font-body text-neutral-300">
                  {verticals.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (50% on desktop) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full aspect-square max-w-[500px] select-none">
              <Image 
                src="/franklin-tn/williamson-county-map.svg" 
                alt="Williamson County Map"
                fill
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
