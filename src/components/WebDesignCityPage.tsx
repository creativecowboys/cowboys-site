import Link from "next/link";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { breadcrumb, NAP, providerBlock, SITE_URL } from "@/lib/seo";
import type { WebDesignCity } from "@/lib/web-design-cities";

const linkClass =
  "text-[#B5330E] font-bold underline decoration-[#B5330E]/30 hover:decoration-[#B5330E]";

export default function WebDesignCityPage({ city }: { city: WebDesignCity }) {
  const pageName = `Web Design ${city.name}, GA`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb(pageName, city.path),
      {
        "@type": "Service",
        name: `Web Design in ${city.name}, GA`,
        serviceType: "Web Design",
        description: city.lead,
        url: `${SITE_URL}${city.path}`,
        provider: providerBlock(),
        areaServed: {
          "@type": "City",
          name: city.name,
          containedInPlace: { "@type": "AdministrativeArea", name: city.areaName },
        },
        offers: [
          {
            "@type": "Offer",
            name: "Website build",
            price: "497",
            priceCurrency: "USD",
            description: "One-time website build.",
          },
          {
            "@type": "Offer",
            name: "Hosting, security, backups, updates, and edits",
            price: "30",
            priceCurrency: "USD",
            description:
              "Monthly care for a site we build. Edits are requested by emailing howdy@creativecowboys.co.",
          },
          {
            "@type": "Offer",
            name: "Google Business Profile local SEO",
            price: "297",
            priceCurrency: "USD",
            description:
              "Local SEO including Google Business Profile on a 12-month agreement. The website build is separate. Month-to-month local SEO is $497.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: city.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <div className="bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-white min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Header dark={false} />
      <main>
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="font-inter text-xs font-bold uppercase tracking-wider text-[#5a5a5a] mb-6">
              <Link href="/" className={linkClass}>
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              <Link href="/web-design" className={linkClass}>
                Web Design
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-[#0a0a0a]">{pageName}</span>
            </nav>
            <p className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
              — {city.eyebrow} —
            </p>
            <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase mb-6">
              Web Design
              <br />
              {city.name}, GA
            </h1>
            <p className="font-inter text-base md:text-lg text-[#3a3a3a] leading-relaxed mb-8">
              {city.lead}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#B5330E] text-white font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a]"
              >
                Start a {city.name} site
              </Link>
              <Link
                href={city.digitalMarketingHref}
                className="bg-white text-[#0a0a0a] font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#0a0a0a]"
              >
                {city.name} marketing
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-3xl flex flex-col gap-6">
            <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95]">
              {city.localHeading}
            </h2>
            {city.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="font-inter text-base md:text-lg text-[#3a3a3a] leading-relaxed">
                {paragraph}
              </p>
            ))}
            <p className="font-inter text-base md:text-lg text-[#3a3a3a] leading-relaxed">
              The full service is on our <Link href="/web-design" className={linkClass}>web design</Link> page.
              Search work is on <Link href="/seo" className={linkClass}>SEO</Link>.
              Ads, Map Pack, and the wider local offer are on{" "}
              <Link href={city.digitalMarketingHref} className={linkClass}>
                {city.digitalMarketingLabel}
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 bg-[#E8E1CF] border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-5xl">
            <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-10">
              What a {city.name} site includes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {city.includes.map((item) => (
                <article key={item.title} className="bg-white border-[2.5px] border-[#0a0a0a] p-6 shadow-[4px_4px_0px_#0a0a0a]">
                  <h3 className="font-anton text-xl uppercase mb-3">{item.title}</h3>
                  <p className="font-inter text-sm text-[#3a3a3a] leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]" id="pricing">
          <div className="max-w-5xl">
            <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-4">
              Web design pricing in {city.name}, GA
            </h2>
            <p className="font-inter text-base text-[#3a3a3a] leading-relaxed max-w-2xl mb-10">
              Two published ways to start. The website and the local SEO plan are separate offers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="bg-white border-[2.5px] border-[#0a0a0a] p-8 shadow-[6px_6px_0px_#0a0a0a]">
                <p className="font-anton text-xs tracking-wider text-[#B5330E] uppercase mb-3">The website</p>
                <h3 className="font-anton text-4xl uppercase leading-none mb-2">
                  $497 <span className="text-2xl text-[#5a5a5a]">once</span>
                </h3>
                <p className="font-inter text-sm text-[#3a3a3a] leading-relaxed mb-4">
                  Then $30 a month for hosting, security, backups, updates, and edits.
                </p>
                <ul className="font-inter text-sm text-[#3a3a3a] leading-relaxed flex flex-col gap-2">
                  <li>One-time website build for a {city.name} business.</li>
                  <li>
                    Edits go to{" "}
                    <a href={`mailto:${NAP.email}`} className={linkClass}>
                      {NAP.email}
                    </a>
                    .
                  </li>
                  <li>The $497 is not billed again each month.</li>
                </ul>
              </article>
              <article className="bg-[#0a0a0a] text-[#F2EBDA] border-[2.5px] border-[#0a0a0a] p-8 shadow-[6px_6px_0px_#B5330E]">
                <p className="font-anton text-xs tracking-wider text-[#F5C842] uppercase mb-3">Local SEO</p>
                <h3 className="font-anton text-4xl uppercase leading-none mb-2">
                  $297 <span className="text-2xl text-[#F2EBDA]/70">/month</span>
                </h3>
                <p className="font-inter text-sm text-[#F2EBDA]/80 leading-relaxed mb-4">
                  Includes Google Business Profile local SEO, on a 12-month agreement.
                </p>
                <ul className="font-inter text-sm text-[#F2EBDA]/80 leading-relaxed flex flex-col gap-2">
                  <li>This plan does not include the website build.</li>
                  <li>Month-to-month local SEO is $497.</li>
                  <li>
                    See <Link href="/seo" className="text-[#F5C842] font-bold underline">SEO</Link> for the broader search offer.
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-6 md:px-12 bg-[#0a0a0a] text-[#F2EBDA] border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-5xl">
            <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-4">
              {city.county}. Where the site can say you work.
            </h2>
            <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed max-w-2xl mb-8">
              {city.neighborhoodIntro}
            </p>
            <ul className="flex flex-wrap gap-3">
              {city.neighborhoods.map((place) => (
                <li key={place} className="px-4 py-2 border border-[#F2EBDA]/25 font-inter text-xs font-bold uppercase tracking-wide">
                  {place}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]" id="faq">
          <div className="max-w-3xl">
            <h2 className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-8">
              Questions about web design in {city.name}
            </h2>
            <div className="border-t-[2.5px] border-[#0a0a0a]">
              {city.faqs.map((faq) => (
                <details key={faq.q} className="border-b-[2.5px] border-[#0a0a0a] group">
                  <summary className="font-anton text-lg uppercase tracking-wide py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between gap-4">
                    {faq.q}
                    <span className="text-[#B5330E] group-open:hidden" aria-hidden="true">+</span>
                    <span className="text-[#B5330E] hidden group-open:inline" aria-hidden="true">—</span>
                  </summary>
                  <p className="font-inter text-sm md:text-base text-[#3a3a3a] leading-relaxed pb-6">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]" aria-labelledby="related-heading">
          <div className="max-w-5xl">
            <h2 id="related-heading" className="font-anton text-3xl md:text-5xl uppercase leading-[0.95] mb-8">
              Related pages
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li>
                <Link href="/web-design" className="block bg-white border-[2.5px] border-[#0a0a0a] p-5 font-anton uppercase tracking-wide hover:bg-[#F5C842]">
                  Web design services
                </Link>
              </li>
              <li>
                <Link href="/seo" className="block bg-white border-[2.5px] border-[#0a0a0a] p-5 font-anton uppercase tracking-wide hover:bg-[#F5C842]">
                  SEO
                </Link>
              </li>
              <li>
                <Link href={city.digitalMarketingHref} className="block bg-white border-[2.5px] border-[#0a0a0a] p-5 font-anton uppercase tracking-wide hover:bg-[#F5C842]">
                  {city.digitalMarketingLabel}
                </Link>
              </li>
              {city.nearby.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block bg-white border-[2.5px] border-[#0a0a0a] p-5 font-anton uppercase tracking-wide hover:bg-[#F5C842]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-inter text-sm text-[#3a3a3a] mt-8">
              Office: {NAP.streetAddress}, {NAP.addressLocality}, {NAP.addressRegion} {NAP.postalCode}.{" "}
              <a href={`tel:${NAP.telephone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                {NAP.telephoneDisplay}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
