import Image from "next/image";
import Link from "next/link";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import OfferSection, { offerSchema } from "@/components/city/OfferSection";
import { BUSINESS_ID, NAP, SITE_URL } from "@/lib/seo";
import { HQ, milesBetween, nearbyLinks, proofFor, type CityPage } from "@/lib/city-pages";

const linkClass = "text-[#B5330E] font-bold underline decoration-[#B5330E]/30 hover:decoration-[#B5330E]";
const sectionClass = "py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]";
const h2Class = "font-anton text-3xl md:text-5xl uppercase leading-[0.95]";
const bodyClass = "font-inter text-base md:text-lg text-[#3a3a3a] leading-relaxed";
/** Team photos go in /public/team/. Leave photo unset until the real photo is in place. */
const TEAM: { name: string; role: string; photo?: string }[] = [
  { name: "Josh", role: "Co-founder", photo: "/team/josh-tee.jpg" },
  { name: "Dave", role: "Co-founder", photo: "/team/dave-tee.jpg" },
];

const stateAnchor = (stateName: string) => `/areas-we-serve#${stateName.toLowerCase().replace(/\s+/g, "-")}`;

export default function CityLandingPage({ page }: { page: CityPage }) {
  const place = `${page.city}, ${page.state}`;
  const pageName = `Web Design in ${place}`;
  const url = `${SITE_URL}${page.path}`;
  const milesFromHq = Math.round(milesBetween(HQ, page));
  const nearby = nearbyLinks(page);
  const proof = proofFor(page);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Areas We Serve", item: `${SITE_URL}/areas-we-serve` },
          { "@type": "ListItem", position: 3, name: pageName, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${page.title} | Creative Cowboys`,
        description: page.metaDescription,
        datePublished: page.published,
        dateModified: page.updated,
        inLanguage: "en-US",
        about: { "@id": `${url}#service` },
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: pageName,
        serviceType: "Web Design and Local Marketing",
        description: page.lead,
        url,
        provider: { "@id": BUSINESS_ID },
        areaServed: {
          "@type": "City",
          name: page.city,
          geo: { "@type": "GeoCoordinates", latitude: page.lat, longitude: page.lon },
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: `${page.county}, ${page.stateName}`,
          },
        },
        offers: offerSchema(),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <div className="bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-white min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header dark={false} />
      <main>
        {/* Hero */}
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="font-inter text-xs font-bold uppercase tracking-wider text-[#5a5a5a] mb-6">
              <Link href="/" className={linkClass}>Home</Link>
              <span aria-hidden="true"> / </span>
              <Link href="/areas-we-serve" className={linkClass}>Areas We Serve</Link>
              <span aria-hidden="true"> / </span>
              <Link href={stateAnchor(page.stateName)} className={linkClass}>{page.stateName}</Link>
              <span aria-hidden="true"> / </span>
              <span className="text-[#0a0a0a]">{page.city}</span>
            </nav>
            <p className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">— {page.eyebrow} —</p>
            <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase mb-6">
              Web Design in
              <br />
              {place}
            </h1>
            <p className={`${bodyClass} mb-8`}>{page.lead}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#B5330E] text-white font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a]"
              >
                Get a free {page.city} site plan
              </Link>
              <a
                href={`tel:${NAP.telephone.replace(/[^\d+]/g, "")}`}
                className="bg-white text-[#0a0a0a] font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#0a0a0a]"
              >
                Call {NAP.telephoneDisplay}
              </a>
            </div>
          </div>
        </section>

        {/* Local substance */}
        <section className={sectionClass}>
          <div className="max-w-3xl flex flex-col gap-6">
            <h2 className={h2Class}>{page.local.heading}</h2>
            {page.local.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className={bodyClass}>{p}</p>
            ))}
            <p className={bodyClass}>
              More on how we build is on our <Link href="/web-design" className={linkClass}>web design</Link> page, and how we get sites found is on{" "}
              <Link href="/seo" className={linkClass}>SEO</Link>.
            </p>
          </div>
        </section>

        {/* The offer */}
        <OfferSection city={page.city} state={page.state} />

        {/* Industries */}
        <section className={`${sectionClass} bg-[#E8E1CF]`}>
          <div className="max-w-5xl">
            <h2 className={`${h2Class} mb-4`}>{page.industries.heading}</h2>
            <p className={`${bodyClass} max-w-3xl mb-10`}>{page.industries.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.industries.items.map((item) => (
                <article key={item.name} className="bg-white border-[2.5px] border-[#0a0a0a] p-6 shadow-[4px_4px_0px_#0a0a0a]">
                  <h3 className="font-anton text-xl uppercase mb-3">{item.name}</h3>
                  <p className="font-inter text-sm md:text-base text-[#3a3a3a] leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What the site includes */}
        <section className={sectionClass}>
          <div className="max-w-5xl">
            <h2 className={`${h2Class} mb-10`}>What your {page.city} website includes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.includes.map((item) => (
                <article key={item.title} className="bg-white border-[2.5px] border-[#0a0a0a] p-6 shadow-[4px_4px_0px_#0a0a0a]">
                  <h3 className="font-anton text-xl uppercase mb-3">{item.title}</h3>
                  <p className="font-inter text-sm md:text-base text-[#3a3a3a] leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proof */}
        <section className={`${sectionClass} bg-[#0a0a0a] text-[#F2EBDA]`}>
          <div className="max-w-6xl">
            <h2 className={`${h2Class} mb-4`}>{proof.local ? `Work near ${page.city}` : "Businesses we work with"}</h2>
            <p className="font-inter text-sm md:text-base text-[#F2EBDA]/75 leading-relaxed max-w-2xl mb-10">
              {proof.local
                ? `Real clients a short drive from ${page.city}. Ask us about their work on your first call.`
                : `Real clients we work with today. We'll walk you through their work on your first call. More on the `}
              {!proof.local && (
                <>
                  <Link href="/results" className="text-[#F5C842] font-bold underline">results page</Link>.
                </>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proof.clients.map((c) => (
                <article key={c.name} className="border-[2.5px] border-[#F2EBDA]/30 p-6">
                  {c.screenshot && (
                    <div className="relative aspect-[16/10] mb-5 border-[2px] border-[#F2EBDA]/40 overflow-hidden bg-[#1a1a1a]">
                      <Image
                        src={c.screenshot}
                        alt={`${c.name} website, built by Creative Cowboys`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover object-top"
                      />
                    </div>
                  )}
                  <p className="font-anton text-xs tracking-wider text-[#F5C842] uppercase mb-2">
                    {c.city}, {c.state} · {c.industry}
                  </p>
                  <h3 className="font-anton text-2xl uppercase mb-3">{c.name}</h3>
                  <p className="font-inter text-sm text-[#F2EBDA]/80 leading-relaxed">{c.work}</p>
                  {c.url && c.screenshot && (
                    <a href={c.url} target="_blank" rel="noopener" className="inline-block mt-4 font-inter text-xs font-bold uppercase tracking-wider text-[#F5C842] underline">
                      See the live site
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How we work */}
        <section className={sectionClass}>
          <div className="max-w-3xl flex flex-col gap-6">
            <h2 className={h2Class}>{page.howWeWork.heading}</h2>
            {page.howWeWork.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className={bodyClass}>{p}</p>
            ))}
            {TEAM.some((t) => t.photo) && (
              <div className="grid grid-cols-2 gap-6 max-w-md">
                {TEAM.filter((t) => t.photo).map((t) => (
                  <figure key={t.name}>
                    <div className="relative aspect-[4/5] border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] overflow-hidden">
                      <Image src={t.photo as string} alt={`${t.name}, ${t.role} at Creative Cowboys`} fill sizes="220px" className="object-cover object-[center_25%]" />
                    </div>
                    <figcaption className="font-anton text-lg uppercase mt-3">{t.name}</figcaption>
                    <p className="font-inter text-xs text-[#5a5a5a] uppercase tracking-wider">{t.role}</p>
                  </figure>
                ))}
              </div>
            )}
            <p className={bodyClass}>
              Creative Cowboys is Josh and Dave, working out of {NAP.streetAddress} in {NAP.addressLocality}, Georgia
              {milesFromHq > 25 ? `, about ${milesFromHq} miles from ${page.city}` : ""}. You talk to the people building your site,
              not a salesperson. Read more <Link href="/about" className={linkClass}>about us</Link>.
            </p>
          </div>
        </section>

        {/* Areas */}
        <section className={`${sectionClass} bg-[#E8E1CF]`}>
          <div className="max-w-5xl">
            <h2 className={`${h2Class} mb-4`}>Where we work around {page.city}</h2>
            <p className={`${bodyClass} max-w-3xl mb-8`}>{page.areas.intro}</p>
            <ul className="flex flex-wrap gap-3">
              {page.areas.places.map((p) => (
                <li key={p} className="px-4 py-2 bg-white border-[2px] border-[#0a0a0a] font-inter text-xs font-bold uppercase tracking-wide">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className={sectionClass} id="faq">
          <div className="max-w-3xl">
            <h2 className={`${h2Class} mb-8`}>Web design in {page.city}: common questions</h2>
            <div className="border-t-[2.5px] border-[#0a0a0a]">
              {page.faqs.map((faq) => (
                <details key={faq.q} className="border-b-[2.5px] border-[#0a0a0a] group">
                  <summary className="font-anton text-lg uppercase tracking-wide py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between gap-4">
                    <h3 className="font-anton text-lg uppercase tracking-wide">{faq.q}</h3>
                    <span className="text-[#B5330E] group-open:hidden" aria-hidden="true">+</span>
                    <span className="text-[#B5330E] hidden group-open:inline" aria-hidden="true">—</span>
                  </summary>
                  <p className="font-inter text-sm md:text-base text-[#3a3a3a] leading-relaxed pb-6">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby + CTA */}
        <section className={sectionClass} aria-labelledby="nearby-heading">
          <div className="max-w-5xl">
            <h2 id="nearby-heading" className={`${h2Class} mb-8`}>Nearby cities we serve</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {nearby.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block bg-white border-[2.5px] border-[#0a0a0a] p-5 font-anton uppercase tracking-wide hover:bg-[#F5C842]">
                    Web design {n.city}, {n.state}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-inter text-sm text-[#3a3a3a] mb-12">
              See every city on <Link href="/areas-we-serve" className={linkClass}>Areas We Serve</Link>, or more of{" "}
              <Link href={stateAnchor(page.stateName)} className={linkClass}>{page.stateName}</Link>.
            </p>
            <div className="bg-[#B5330E] text-white border-[2.5px] border-[#0a0a0a] p-8 md:p-10 shadow-[6px_6px_0px_#0a0a0a]">
              <h2 className="font-anton text-3xl md:text-4xl uppercase leading-none mb-4">Ready to win {page.city} searches?</h2>
              <p className="font-inter text-base mb-6 max-w-2xl">
                Tell us about your business. We&rsquo;ll come back with a plan for your {page.city} site and local SEO, with no pressure.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="bg-[#0a0a0a] text-white font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-white">
                  Start your project
                </Link>
                <a href={`tel:${NAP.telephone.replace(/[^\d+]/g, "")}`} className="bg-white text-[#0a0a0a] font-anton text-sm uppercase tracking-wider py-4 px-6 border-[2.5px] border-[#0a0a0a]">
                  {NAP.telephoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
