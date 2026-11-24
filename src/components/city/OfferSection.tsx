import Link from "next/link";
import { LOCAL_PACKAGE, OTHER_SERVICES, usd } from "@/lib/offer";

/**
 * The offer block every city page leads with: the $297 Local Marketing Package,
 * then the other services. Numbers come from src/lib/offer.ts only.
 */
export default function OfferSection({ city, state }: { city: string; state: string }) {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]" id="pricing">
      <div className="max-w-6xl">
        <p className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
          — Our best offer for {city} businesses —
        </p>
        <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-10">
          {usd(LOCAL_PACKAGE.monthly)} a month. Local SEO, ads, and a free website.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <article className="lg:col-span-3 bg-[#0a0a0a] text-[#F2EBDA] border-[2.5px] border-[#0a0a0a] p-8 md:p-10 shadow-[8px_8px_0px_#B5330E]">
            <p className="font-anton text-xs tracking-wider text-[#F5C842] uppercase mb-3">{LOCAL_PACKAGE.name}</p>
            <p className="font-anton text-6xl md:text-7xl uppercase leading-none mb-2">
              {usd(LOCAL_PACKAGE.monthly)}
              <span className="text-2xl md:text-3xl text-[#F2EBDA]/70"> /month</span>
            </p>
            <p className="font-inter text-sm text-[#F2EBDA]/70 mb-8">
              {LOCAL_PACKAGE.term} Cancel anytime.
            </p>
            <ul className="flex flex-col gap-5 mb-8">
              {LOCAL_PACKAGE.includes.map((item) => (
                <li key={item.title} className="border-l-4 border-[#F5C842] pl-4">
                  <p className="font-anton text-xl uppercase tracking-wide">{item.title}</p>
                  <p className="font-inter text-sm md:text-base text-[#F2EBDA]/80 leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ul>
            <p className="font-inter text-sm text-[#F2EBDA]/80 mb-6">
              The website alone is a {usd(LOCAL_PACKAGE.websiteValue)} value. With the package, it&rsquo;s included.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#F5C842] text-[#0a0a0a] font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#F2EBDA]"
            >
              Get the {city} package
            </Link>
          </article>

          <div className="lg:col-span-2 bg-white border-[2.5px] border-[#0a0a0a] p-8 shadow-[6px_6px_0px_#0a0a0a]">
            <p className="font-anton text-xs tracking-wider text-[#B5330E] uppercase mb-3">Add what you need</p>
            <h3 className="font-anton text-2xl uppercase leading-tight mb-6">
              More we do for {city}, {state} businesses
            </h3>
            <ul className="flex flex-col gap-4">
              {OTHER_SERVICES.map((s) => (
                <li key={s.title}>
                  <p className="font-anton text-lg uppercase tracking-wide">
                    {"href" in s && s.href ? (
                      <Link href={s.href} className="underline decoration-[#B5330E]/40 hover:decoration-[#B5330E]">
                        {s.title}
                      </Link>
                    ) : (
                      s.title
                    )}
                  </p>
                  <p className="font-inter text-sm text-[#3a3a3a] leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F5C842] border-[2.5px] border-[#0a0a0a] p-6 shadow-[4px_4px_0px_#0a0a0a]">
          <p className="font-anton text-xl md:text-2xl uppercase leading-tight">
            Only need a website? Ask us about our new website specials.
          </p>
          <Link
            href="/contact"
            className="shrink-0 bg-[#0a0a0a] text-white font-anton text-sm uppercase tracking-wider py-3 px-5 border-[2.5px] border-[#0a0a0a] text-center"
          >
            Ask about website specials
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Offer nodes for the Service schema, from the same constants. */
export function offerSchema() {
  return [
    {
      "@type": "Offer",
      name: LOCAL_PACKAGE.name,
      price: String(LOCAL_PACKAGE.monthly),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(LOCAL_PACKAGE.monthly),
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: `Local SEO, paid ads management (ad budget separate), and a free custom website valued at ${usd(
        LOCAL_PACKAGE.websiteValue,
      )}. ${LOCAL_PACKAGE.term}`,
    },
  ];
}
