import Image from "next/image";

export default function ServiceOverview() {
  return (
    <section className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-[#121417] mb-6">
            What we do
          </h2>
          <p className="font-body text-lg text-neutral-700 leading-relaxed">
            We design and build websites for Franklin businesses that are tired of paying for sites that just sit there. Strategy first, then design, then a clean build on WordPress or Webflow that loads in under 1.5 seconds and ranks for the searches your customers actually run. We bring the systems and senior team of a bigger agency, with the senior-on-every-project attention you&apos;d get from a boutique.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Card 1: Build */}
          <div className="bg-[#F4F2F0] p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 select-none">
              <Image 
                src="/franklin-tn/icon-build.svg" 
                alt="Build" 
                width={48} 
                height={48} 
                className="w-12 h-12"
              />
            </div>
            <h3 className="font-display text-xl font-bold text-[#121417] mb-3">Build</h3>
            <p className="font-body text-neutral-600 leading-relaxed">
              Custom design system. No off-the-shelf themes. WordPress or Webflow, whichever fits your team. Strategy-led, not pixel-led.
            </p>
          </div>

          {/* Card 2: Convert */}
          <div className="bg-[#F4F2F0] p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 select-none">
              <Image 
                src="/franklin-tn/icon-convert.svg" 
                alt="Convert" 
                width={48} 
                height={48} 
                className="w-12 h-12"
              />
            </div>
            <h3 className="font-display text-xl font-bold text-[#121417] mb-3">Convert</h3>
            <p className="font-body text-neutral-600 leading-relaxed">
              Conversion-tested forms, real call tracking, server-side analytics. We design for the action you actually want a Williamson County buyer to take.
            </p>
          </div>

          {/* Card 3: Maintain */}
          <div className="bg-[#F4F2F0] p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 select-none">
              <Image 
                src="/franklin-tn/icon-maintain.svg" 
                alt="Maintain" 
                width={48} 
                height={48} 
                className="w-12 h-12"
              />
            </div>
            <h3 className="font-display text-xl font-bold text-[#121417] mb-3">Maintain</h3>
            <p className="font-body text-neutral-600 leading-relaxed">
              Optional Care Plans handle hosting, updates, backups, security, and quarterly design refreshes. Your site stays fast, secure, and current.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center text-lg font-medium text-neutral-700">
          The fastest way to know if we&apos;re a fit: look at what we&apos;ve built for businesses like yours.
        </div>
      </div>
    </section>
  );
}
