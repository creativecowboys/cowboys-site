import Image from "next/image";

const logos = [
  { src: "/Client Logos/FireBible logo Black.webp", alt: "FireBible", width: 179, height: 40, className: "h-10 w-auto object-contain" },
  { src: "/Client Logos/Harmonic Logo (Black).png", alt: "Harmonic", width: 140, height: 40, className: "h-10 w-auto object-contain" },
  { src: "/Client Logos/InnovativeLogoWebsite.png", alt: "Innovative", width: 130, height: 40, className: "h-10 w-auto object-contain" },
  { src: "/Client Logos/Leuco transparent 2.png", alt: "Leuco", width: 110, height: 40, className: "h-10 w-auto object-contain" },
  { src: "/Client Logos/big-MetLane_logo_full.png", alt: "MetLane", width: 130, height: 40, className: "h-10 w-auto object-contain" },
  { src: "/Client Logos/johnbjackson-dark-Blue.png", alt: "John B. Jackson", width: 120, height: 40, className: "h-10 w-auto object-contain" },
];

export default function LogoWall() {
  return (
    <section className="py-20 bg-white border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Recent client work from across the Southeast.
        </h2>
        <p className="font-body text-neutral-600 max-w-3xl mx-auto mb-14 text-lg">
          Boutique retailers, dental practices, HVAC and home services, professional services, restaurants, DTC brands. We don&apos;t do everything for everyone — we do good work for businesses that want their websites to actually do something.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="opacity-70 hover:opacity-100 transition-opacity duration-300 ease-in-out"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className={logo.className}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

