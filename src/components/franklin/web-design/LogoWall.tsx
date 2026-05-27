import Image from "next/image";

export default function LogoWall() {
  const portfolio = [
    {
      name: "Harmonic Production",
      vertical: "AV & Event Production",
      image: "/franklin-tn/harmonic-desktop-hero.png"
    },
    {
      name: "Squirrel Made Products",
      vertical: "Boutique CPG",
      image: "/franklin-tn/squirrel-shop-page.png"
    },
    {
      name: "John B. Jackson & Associates",
      vertical: "Legal",
      image: "/franklin-tn/jbjackson-desktop-hero.png"
    },
    {
      name: "McKinley Roofing",
      vertical: "Home Services",
      image: "/franklin-tn/mckinley-desktop-hero.png"
    },
    {
      name: "LEUCO Tools",
      vertical: "Industrial / eCom",
      image: "/franklin-tn/leuco-desktop-hero.png"
    }
  ];

  return (
    <section className="py-16 bg-[#0D0D0F]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* Uppercase label with em-dashes */}
        <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-10">
          &mdash; RECENT CLIENTS &middot; SOUTHEAST PORTFOLIO &mdash;
        </p>

        {/* 5-up grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-6">
          {portfolio.map((item, i) => (
            <div key={i} className="flex flex-col group select-none cursor-pointer">
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/10] w-full rounded-[12px] border border-white/10 overflow-hidden mb-3.5 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-cover object-top transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
                />
                {/* Subtle brand orange tint overlay on hover */}
                <div className="absolute inset-0 bg-[#F26522]/0 transition-colors duration-[250ms] ease-out group-hover:bg-[#F26522]/[0.08] pointer-events-none z-10" />
              </div>
              {/* Caption */}
              <div className="transition-opacity duration-[250ms] ease-out opacity-80 group-hover:opacity-100 font-body text-[13px] font-medium text-left leading-normal">
                <div className="text-white font-semibold tracking-tight">{item.name}</div>
                <div className="text-neutral-400">{item.vertical}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
