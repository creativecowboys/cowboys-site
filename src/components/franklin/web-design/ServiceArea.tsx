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
    <section className="py-24 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] mb-6">
            Serving the full Franklin and Williamson County market.
          </h2>
          <p className="font-body text-lg text-neutral-300 leading-relaxed">
            From Cool Springs storefronts to Westhaven boutiques, from Berry Farms home services to Downtown Franklin professional firms — we work with businesses across every Franklin neighborhood. Strategy calls in person or remote, whichever fits how you work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="font-body text-sm font-bold tracking-widest uppercase text-[#F26522] mb-6">
              Neighborhoods We Serve
            </h3>
            <ul className="grid sm:grid-cols-2 gap-4 font-body text-neutral-300">
              {neighborhoods.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-body text-sm font-bold tracking-widest uppercase text-[#F26522] mb-6">
              Verticals We Know
            </h3>
            <ul className="space-y-4 font-body text-neutral-300">
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
    </section>
  );
}
