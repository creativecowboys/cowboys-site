import Image from "next/image";
import Link from "next/link";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import { ArrowRight, ArrowUpRight, Check, Phone } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import CityLeadForm from "@/components/city/CityLeadForm";
import { offerSchema } from "@/components/city/OfferSection";
import { BUSINESS_ID, NAP, SITE_URL } from "@/lib/seo";
import { LOCAL_PACKAGE, OTHER_SERVICES, usd } from "@/lib/offer";
import { HQ, milesBetween, nearbyLinks, proofFor, type CityPage } from "@/lib/city-pages";
import { StickyCallBar } from "./LayoutC.motion";

/**
 * Layout option C · "The Quote" (Nov 2026). Conversion-first: orange hero that
 * leads with the form, and the offer drawn as an itemized estimate.
 */

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--fc-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--fc-body", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fc-mono", display: "swap" });

/* ── tokens ── */
const display = "font-(family-name:--fc-display) font-black uppercase [font-variation-settings:'wdth'_110]";
const mono = "font-(family-name:--fc-mono)";
const wrap = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12";
const section = "py-16 md:py-24";
const h2 = `${display} text-[clamp(30px,4.2vw,54px)] leading-[0.95] tracking-[-0.01em] text-balance`;
const eyebrow = `${mono} text-[12px] font-medium uppercase tracking-[0.16em]`;
const body = "text-[16px] md:text-[17px] leading-[1.7] text-[#2b2b2b]";
const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#0B0B0B]";
const inkLink = `font-semibold underline decoration-2 underline-offset-4 decoration-[#F15A29] hover:text-[#B5330E] ${focusRing}`;

const TEAM = [
  { name: "Josh", role: "Co-founder", photo: "/team/josh-tee.jpg" },
  { name: "Dave", role: "Co-founder", photo: "/team/dave-tee.jpg" },
];

const LOGOS = [
  { file: "johnbjackson-dark-Blue.png", alt: "John B. Jackson Law" },
  { file: "McKinley (Black).png", alt: "McKinley Roofing" },
  { file: "Harmonic Logo (Black).png", alt: "Harmonic Production" },
  { file: "big-MetLane_logo_full.png", alt: "Met Lane" },
  { file: "Leuco transparent 2.png", alt: "LEUCO" },
  { file: "InnovativeLogoWebsite.png", alt: "Innovative" },
  { file: "Life Publishers (Black).png", alt: "Life Publishers" },
  { file: "FireBible logo Black.webp", alt: "FireBible" },
];

const stateAnchor = (stateName: string) => `/areas-we-serve#${stateName.toLowerCase().replace(/\s+/g, "-")}`;

export default function LayoutC({ page, preview = false }: { page: CityPage; preview?: boolean }) {
  const place = `${page.city}, ${page.state}`;
  const pageName = `Web Design in ${place}`;
  const url = `${SITE_URL}${page.path}`;
  const milesFromHq = Math.round(milesBetween(HQ, page));
  const nearby = nearbyLinks(page);
  const proof = proofFor(page);
  const tel = NAP.telephone.replace(/[^\d+]/g, "");
  const price = usd(LOCAL_PACKAGE.monthly);
  const [seo, ads, site] = LOCAL_PACKAGE.includes;

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

  /** The estimate's line items, in the order the quote lists them. */
  const lines = [
    { key: "site", label: "Custom website", note: null, include: site },
    { key: "seo", label: seo.title, note: null, include: seo },
    { key: "ads", label: ads.title, note: "Ad budget separate", include: ads },
  ] as const;

  const oddIndustries = page.industries.items.length % 2 === 1;

  return (
    <div
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} font-(family-name:--fc-body) bg-white text-[#0B0B0B] min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 selection:bg-[#F15A29] selection:text-[#0B0B0B]`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      <main>
        {/* ── HERO: orange, form first ── */}
        <section id="c-hero" className="relative bg-[#F15A29] text-[#0B0B0B] overflow-hidden">
          {/* faint print-registration grid, decorative */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(#0B0B0B_1px,transparent_1px),linear-gradient(90deg,#0B0B0B_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div className={`${wrap} relative grid lg:grid-cols-[1.12fr_0.88fr] gap-12 lg:gap-16 py-12 md:py-20 items-start`}>
            <div className="min-w-0 lg:pt-4">
              <nav aria-label="Breadcrumb" className={`${mono} text-[11px] uppercase tracking-[0.14em] mb-8`}>
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <li>
                    <Link href="/" className={`underline underline-offset-4 decoration-[#0B0B0B]/40 hover:decoration-[#0B0B0B] ${focusRing}`}>Home</Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/areas-we-serve" className={`underline underline-offset-4 decoration-[#0B0B0B]/40 hover:decoration-[#0B0B0B] ${focusRing}`}>Areas we serve</Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={stateAnchor(page.stateName)} className={`underline underline-offset-4 decoration-[#0B0B0B]/40 hover:decoration-[#0B0B0B] ${focusRing}`}>{page.stateName}</Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page">{page.city}</li>
                </ol>
              </nav>

              <p className={`${eyebrow} inline-flex items-center gap-2.5 border-2 border-[#0B0B0B] px-3 py-1.5 mb-7`}>
                <span aria-hidden="true" className="size-2 bg-[#0B0B0B]" />
                {page.eyebrow}
              </p>

              <h1 className={`${display} text-[clamp(42px,6.6vw,92px)] leading-[0.88] tracking-[-0.02em] text-balance mb-8`}>
                <span className="block">Web Design in</span>
                <span className="block">{place}</span>
              </h1>

              <p className="text-[17px] md:text-[19px] leading-[1.6] max-w-[56ch] mb-10">{page.lead}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-5">
                <a
                  href={`tel:${tel}`}
                  className={`group inline-flex items-center gap-3 ${focusRing}`}
                >
                  <span className="grid place-items-center size-12 bg-[#0B0B0B] text-[#F15A29] transition-transform duration-200 group-hover:-rotate-6 motion-reduce:transition-none">
                    <Phone aria-hidden="true" size={20} strokeWidth={2.5} />
                  </span>
                  <span>
                    <span className={`${mono} block text-[11px] uppercase tracking-[0.14em]`}>Call Josh or Dave</span>
                    <span className={`${display} block text-[26px] md:text-[30px] leading-none [font-variation-settings:'wdth'_100] tabular-nums`}>
                      {NAP.telephoneDisplay}
                    </span>
                  </span>
                </a>
                <p className={`${mono} text-[12px] uppercase tracking-[0.12em] leading-relaxed sm:border-l-2 sm:border-[#0B0B0B] sm:pl-6`}>
                  {price}/mo · free website
                  <br />
                  No contracts
                </p>
              </div>
            </div>

            {/* the form card */}
            <div
              id="plan"
              className="scroll-mt-28 bg-white text-[#0B0B0B] border-2 border-[#0B0B0B] shadow-[10px_10px_0_#0B0B0B] p-6 sm:p-8 lg:mt-2"
            >
              <p className={`${eyebrow} text-[#0B0B0B]/65 mb-2`}>Free · No obligation</p>
              <h2 className={`${display} text-[clamp(26px,2.6vw,34px)] leading-[0.95] mb-2`}>
                Get a {page.city} site plan
              </h2>
              <p className="text-[15px] leading-relaxed text-[#3a3a3a] mb-6">
                Tell us about your business. We&rsquo;ll call with a plan for your site, local SEO, and ads.
              </p>
              <CityLeadForm
                city={page.city}
                preview={preview}
                idPrefix="c-hero-lead"
                theme={{
                  form: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:[&>div:nth-child(5)]:col-span-2 sm:[&>button]:col-span-2 sm:[&>p]:col-span-2",
                  label: `${mono} block text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B0B0B] mb-1.5`,
                  input:
                    "w-full h-12 bg-white border-2 border-[#0B0B0B] px-3.5 text-[16px] text-[#0B0B0B] rounded-none focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F15A29]",
                  button: `${display} mt-2 w-full h-14 bg-[#0B0B0B] text-white text-[15px] tracking-[0.04em] border-2 border-[#0B0B0B] transition-colors hover:bg-[#F15A29] hover:text-[#0B0B0B] disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#F15A29]`,
                  note: "text-[14px] font-medium text-[#A11B0A] bg-[#FFE8DF] border-l-4 border-[#A11B0A] px-3 py-2",
                  success: `${display} text-[22px] leading-tight bg-[#FFE8DF] border-2 border-[#0B0B0B] p-6`,
                }}
              />
              <p className={`${mono} mt-5 text-[11px] uppercase tracking-[0.12em] text-[#0B0B0B]/65`}>
                Or call {NAP.telephoneDisplay}
              </p>
            </div>
          </div>
        </section>

        {/* ── LOGO STRIP ── */}
        <section aria-label="Some of the businesses we work with" className="bg-[#0B0B0B] text-white">
          <div className={`${wrap} py-8 md:py-10 flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-10`}>
            <p className={`${eyebrow} shrink-0 text-white/70`}>Businesses we work with</p>
            <ul className="flex-1 grid grid-cols-4 lg:grid-cols-8 items-center gap-x-6 sm:gap-x-10 gap-y-6">
              {LOGOS.map((l) => (
                <li key={l.file} className="relative h-8 md:h-9 w-full">
                  <Image
                    src={`/Client%20Logos/${encodeURIComponent(l.file)}`}
                    alt={l.alt}
                    fill
                    sizes="(min-width: 1024px) 120px, 22vw"
                    className="object-contain brightness-0 invert opacity-75"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── LOCAL STORY ── */}
        <section className={`${section} bg-white`}>
          <div className={wrap}>
            <span aria-hidden="true" className={`${display} block text-[#F15A29] text-[120px] md:text-[160px] leading-[0.6] h-[52px] md:h-[72px] [font-variation-settings:'wdth'_100]`}>
              &ldquo;
            </span>
            <h2 className={`${display} text-[clamp(30px,4.4vw,60px)] leading-[0.95] tracking-[-0.015em] max-w-[22ch] text-balance mb-12 md:mb-16`}>
              {page.local.heading}
            </h2>
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
              <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start">
                <p className={`${eyebrow} text-[#0B0B0B]/65 mb-3`}>{page.city} at a glance</p>
                <dl className={`${mono} text-[13px] border-t-2 border-[#0B0B0B]`}>
                  {[
                    ["City", place],
                    ["County", page.county],
                    ["Metro", page.metro],
                    ["Population", page.population.toLocaleString("en-US")],
                    ...(milesFromHq > 25 ? [["From our office", `About ${milesFromHq} miles`]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3 border-b border-[#0B0B0B]/15">
                      <dt className="uppercase tracking-[0.12em] text-[#0B0B0B]/65">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
              <div className="lg:col-span-7 lg:col-start-6 flex flex-col gap-6 max-w-[66ch]">
                {page.local.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={body}>
                    {p}
                  </p>
                ))}
                <p className={body}>
                  More on how we build is on our <Link href="/web-design" className={inkLink}>web design</Link> page, and how
                  we get sites found is on <Link href="/seo" className={inkLink}>SEO</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE QUOTE ── */}
        <section id="pricing" className={`${section} bg-[#F5F4F2] overflow-hidden`} aria-labelledby="c-quote-heading">
          <div className={wrap}>
            <p className={`${eyebrow} text-[#0B0B0B]/65 mb-3`}>{LOCAL_PACKAGE.name}</p>
            <h2 id="c-quote-heading" className={`${h2} max-w-[20ch] mb-12 md:mb-16`}>
              {price} a month. Here is the whole estimate.
            </h2>

            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-start">
              {/* the estimate document */}
              <div className="relative md:-rotate-[1.5deg] md:hover:-rotate-1 md:hover:-translate-y-1.5 transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:md:hover:-rotate-[1.5deg] motion-reduce:md:hover:translate-y-0">
                <article
                  aria-label={`Estimate for a ${place} business`}
                  className="relative bg-white border-2 border-[#0B0B0B] shadow-[12px_12px_0_#0B0B0B] px-5 py-7 sm:px-9 sm:py-10"
                >
                  {/* stamp tag */}
                  <div
                    className="absolute -top-5 right-3 sm:-top-6 sm:-right-6 rotate-[7deg] bg-[#F15A29] text-[#0B0B0B] border-2 border-[#0B0B0B] pl-8 pr-4 py-2.5 shadow-[4px_4px_0_#0B0B0B] [clip-path:polygon(14px_0,100%_0,100%_100%,14px_100%,0_50%)]"
                  >
                    <span aria-hidden="true" className="absolute left-[16px] top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-white border-2 border-[#0B0B0B]" />
                    <span className={`${display} block text-[15px] sm:text-[17px] leading-none tracking-[0.02em]`}>Free website included</span>
                  </div>

                  <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 pb-5 border-b-2 border-[#0B0B0B]">
                    <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#0B0B0B]/65`}>Estimate</p>
                    <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#0B0B0B]/65`}>Ref. {page.slug}</p>
                  </header>

                  <h3 className={`${display} text-[clamp(24px,2.6vw,34px)] leading-[0.95] mt-6 mb-2 max-w-[18ch] text-balance`}>
                    Estimate for a {place} business
                  </h3>
                  <p className={`${mono} text-[12px] leading-relaxed text-[#0B0B0B]/70 mb-8`}>
                    Prepared by Creative Cowboys · {NAP.streetAddress}, {NAP.addressLocality}, {NAP.addressRegion}
                  </p>

                  <dl className={`${mono} text-[14px] sm:text-[15px]`}>
                    {lines.map((l) => (
                      <div key={l.key} className="flex items-baseline gap-3 py-3">
                        <dt className="flex flex-1 min-w-0 items-baseline after:content-[''] after:flex-1 after:min-w-6 after:ml-3 after:border-b-2 after:border-dotted after:border-[#0B0B0B]/40">
                          <span>
                            <span className="font-medium">{l.label}</span>
                            {l.note && <span className="block text-[12px] text-[#0B0B0B]/65 mt-0.5">({l.note})</span>}
                          </span>
                        </dt>
                        <dd className="shrink-0 text-right font-semibold">
                          {l.key === "site" ? (
                            <>
                              <span className="sr-only">Valued at {usd(LOCAL_PACKAGE.websiteValue)}, yours for </span>
                              <s aria-hidden="true" className="font-normal text-[#0B0B0B]/55 decoration-[#F15A29] decoration-2 mr-2">
                                {usd(LOCAL_PACKAGE.websiteValue)}
                              </s>
                              <span className="bg-[#FFE8DF] px-1.5">{usd(0)}</span>
                            </>
                          ) : (
                            "Included"
                          )}
                        </dd>
                      </div>
                    ))}

                    <div className="mt-4 pt-5 border-t-[3px] border-double border-[#0B0B0B] flex items-baseline gap-3">
                      <dt className="flex flex-1 min-w-0 items-baseline uppercase tracking-[0.12em] text-[13px] after:content-[''] after:flex-1 after:min-w-6 after:ml-3 after:border-b-2 after:border-dotted after:border-[#0B0B0B]/40">
                        Monthly
                      </dt>
                      <dd className="shrink-0">
                        <span className={`${display} text-[44px] sm:text-[56px] leading-none tracking-[-0.02em] [font-variation-settings:'wdth'_100] tabular-nums`}>
                          {price}
                        </span>
                        <span className="text-[13px] text-[#0B0B0B]/70">/mo</span>
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-3 py-3">
                      <dt className="flex flex-1 min-w-0 items-baseline uppercase tracking-[0.12em] text-[13px] after:content-[''] after:flex-1 after:min-w-6 after:ml-3 after:border-b-2 after:border-dotted after:border-[#0B0B0B]/40">
                        Contract
                      </dt>
                      <dd className="shrink-0 text-right font-semibold">None, month to month</dd>
                    </div>
                  </dl>

                  <footer className="mt-8 pt-6 border-t border-dashed border-[#0B0B0B]/40 flex flex-col gap-5">
                    <p className="text-[14px] leading-snug text-[#3a3a3a]">
                      {LOCAL_PACKAGE.term} The website alone is a {usd(LOCAL_PACKAGE.websiteValue)} value.
                    </p>
                    <a
                      href="#plan"
                      className={`${display} sm:self-start inline-flex items-center justify-center gap-2 h-12 px-5 bg-[#0B0B0B] text-white text-[14px] tracking-[0.04em] hover:bg-[#F15A29] hover:text-[#0B0B0B] transition-colors ${focusRing}`}
                    >
                      Get my free {page.city} plan
                      <ArrowRight aria-hidden="true" size={16} strokeWidth={2.5} />
                    </a>
                  </footer>
                </article>
              </div>

              {/* how it works: the three package includes */}
              <div>
                <h3 className={`${display} text-[24px] md:text-[28px] leading-none mb-2`}>What the {price} covers</h3>
                <p className={`${body} mb-8`}>Each line on the estimate, in plain terms.</p>
                <ol className="flex flex-col">
                  {lines.map((l, i) => (
                    <li key={l.key} className="grid grid-cols-[auto_1fr] gap-x-5 py-6 border-t-2 border-[#0B0B0B] last:border-b-2">
                      <span className={`${mono} text-[12px] font-semibold uppercase tracking-[0.14em] pt-1.5 whitespace-nowrap`}>
                        Line {i + 1}
                      </span>
                      <div>
                        <h4 className={`${display} text-[20px] leading-tight mb-2`}>{l.include.title}</h4>
                        <p className="text-[15px] md:text-[16px] leading-[1.65] text-[#2b2b2b]">{l.include.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* add-ons */}
            <div className="mt-20 md:mt-24">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
                <h3 className={`${display} text-[24px] md:text-[28px] leading-none`}>Add-ons available</h3>
                <p className={`${mono} text-[12px] uppercase tracking-[0.14em] text-[#0B0B0B]/65`}>
                  For {place} businesses
                </p>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-5 border-t-2 border-[#0B0B0B]">
                {OTHER_SERVICES.map((s) => (
                  <li key={s.title} className="py-6 sm:pr-6 border-b border-[#0B0B0B]/15 lg:border-b-0">
                    <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#0B0B0B]/65 mb-2`}>Add-on</p>
                    <h4 className={`${display} text-[18px] leading-tight mb-2`}>
                      {"href" in s && s.href ? (
                        <Link href={s.href} className={`inline-flex items-start gap-1 hover:text-[#B5330E] ${focusRing}`}>
                          {s.title}
                          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                        </Link>
                      ) : (
                        s.title
                      )}
                    </h4>
                    <p className="text-[14px] leading-[1.6] text-[#3a3a3a]">{s.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* website specials */}
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFE8DF] border-2 border-[#0B0B0B] px-6 py-5">
              <p className={`${display} text-[18px] md:text-[22px] leading-tight`}>
                Only need a website? Ask us about our new website specials.
              </p>
              <Link
                href="/contact"
                className={`${display} shrink-0 inline-flex items-center justify-center gap-2 h-12 px-5 bg-[#0B0B0B] text-white text-[14px] tracking-[0.04em] hover:bg-[#F15A29] hover:text-[#0B0B0B] transition-colors ${focusRing}`}
              >
                Ask about specials
                <ArrowRight aria-hidden="true" size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES ── */}
        <section className={`${section} bg-white`}>
          <div className={wrap}>
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 mb-12">
              <h2 className={`${h2} lg:col-span-6`}>{page.industries.heading}</h2>
              <p className={`${body} lg:col-span-5 lg:col-start-8 self-end`}>{page.industries.intro}</p>
            </div>
            <ul className="grid md:grid-cols-2 gap-4 md:gap-5">
              {page.industries.items.map((item, i) => (
                <li
                  key={item.name}
                  className={`group relative bg-[#0B0B0B] text-white p-7 md:p-9 ${oddIndustries && i === 0 ? "md:col-span-2" : ""}`}
                >
                  <span aria-hidden="true" className="absolute left-0 top-0 h-1.5 w-12 bg-[#F15A29] transition-[width] duration-300 group-hover:w-full motion-reduce:transition-none" />
                  <h3 className={`${display} text-[22px] md:text-[26px] leading-[1.02] mb-4 max-w-[24ch]`}>{item.name}</h3>
                  <p className={`text-[15px] md:text-[16px] leading-[1.65] text-white/80 ${oddIndustries && i === 0 ? "max-w-[70ch]" : ""}`}>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── INCLUDES: checklist ── */}
        <section className={`${section} bg-[#F5F4F2]`}>
          <div className={wrap}>
            <h2 className={`${h2} max-w-[18ch] mb-12`}>What your {page.city} website includes</h2>
            <ul className="grid md:grid-cols-2 gap-x-12 gap-y-2">
              {page.includes.map((item) => (
                <li key={item.title} className="flex gap-5 py-6 border-t-2 border-[#0B0B0B]">
                  <span aria-hidden="true" className="grid place-items-center shrink-0 size-9 bg-[#F15A29] border-2 border-[#0B0B0B]">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className={`${display} text-[19px] md:text-[21px] leading-tight mb-2`}>{item.title}</h3>
                    <p className="text-[15px] md:text-[16px] leading-[1.65] text-[#2b2b2b]">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── PROOF ── */}
        <section className={`${section} bg-white`}>
          <div className={wrap}>
            <p className={`${eyebrow} text-[#0B0B0B]/65 mb-3`}>{proof.local ? "Close to home" : "Our clients"}</p>
            <h2 className={`${h2} mb-4`}>{proof.local ? `Work near ${page.city}` : "Businesses we work with"}</h2>
            <p className={`${body} max-w-[60ch] mb-12`}>
              {proof.local
                ? `Real clients a short drive from ${page.city}. Ask us about their work on your first call.`
                : "Real clients we work with today. We'll walk you through their work on your first call. More on the "}
              {!proof.local && (
                <>
                  <Link href="/results" className={inkLink}>results page</Link>.
                </>
              )}
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {proof.clients.map((c) => (
                <article key={c.name} className="flex flex-col bg-white border-2 border-[#0B0B0B] border-t-[8px] border-t-[#F15A29] p-7">
                  {c.screenshot && (
                    <div className="relative aspect-[16/10] mb-6 border-2 border-[#0B0B0B] overflow-hidden bg-[#F5F4F2]">
                      <Image
                        src={c.screenshot}
                        alt={`${c.name} website, built by Creative Cowboys`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover object-top"
                      />
                    </div>
                  )}
                  <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#0B0B0B]/65 mb-3`}>
                    {c.city}, {c.state} · {c.industry}
                  </p>
                  <h3 className={`${display} text-[24px] leading-[1] mb-4`}>{c.name}</h3>
                  <p className="text-[15px] leading-[1.65] text-[#2b2b2b] flex-1">{c.work}</p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener"
                      className={`${mono} mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4 decoration-[#F15A29] decoration-2 ${focusRing}`}
                    >
                      See the live site <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2.5} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM + HOW WE WORK ── */}
        <section className={`${section} bg-[#0B0B0B] text-white`}>
          <div className={`${wrap} grid lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5 max-w-[520px]">
              {TEAM.map((t, i) => (
                <figure key={t.name} className={i === 1 ? "mt-10" : ""}>
                  <div className="relative aspect-[4/5] overflow-hidden border-2 border-white/20">
                    <Image
                      src={t.photo}
                      alt={`${t.name}, ${t.role} at Creative Cowboys`}
                      fill
                      sizes="(min-width: 1024px) 250px, 45vw"
                      className="object-cover object-[center_22%]"
                    />
                  </div>
                  <figcaption className="mt-3 flex items-baseline justify-between gap-2">
                    <span className={`${display} text-[22px] leading-none`}>{t.name}</span>
                    <span className={`${mono} text-[11px] uppercase tracking-[0.14em] text-white/70`}>{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6 max-w-[64ch]">
              <h2 className={h2}>{page.howWeWork.heading}</h2>
              {page.howWeWork.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="text-[16px] md:text-[17px] leading-[1.7] text-white/80">
                  {p}
                </p>
              ))}
              <p className="text-[16px] md:text-[17px] leading-[1.7] text-white border-l-4 border-[#F15A29] pl-5">
                Creative Cowboys is Josh and Dave, working out of {NAP.streetAddress} in {NAP.addressLocality}, Georgia
                {milesFromHq > 25 ? `, about ${milesFromHq} miles from ${page.city}` : ""}. You talk to the people building
                your site, not a salesperson. Read more{" "}
                <Link
                  href="/about"
                  className="font-semibold text-[#F15A29] underline underline-offset-4 decoration-2 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
                >
                  about us
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ── AREAS ── */}
        <section className={`${section} bg-white`}>
          <div className={wrap}>
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 mb-10">
              <h2 className={`${h2} lg:col-span-6`}>Where we work around {page.city}</h2>
              <p className={`${body} lg:col-span-5 lg:col-start-8 self-end`}>{page.areas.intro}</p>
            </div>
            <ul className="flex flex-wrap gap-2.5">
              {page.areas.places.map((p) => (
                <li
                  key={p}
                  className={`${mono} text-[13px] font-medium uppercase tracking-[0.08em] border-2 border-[#0B0B0B] px-4 py-2.5`}
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className={`${section} bg-[#F5F4F2]`}>
          <div className={`${wrap} grid lg:grid-cols-12 gap-10 lg:gap-12`}>
            <div className="lg:col-span-4">
              <h2 className={`${display} text-[clamp(30px,3.2vw,42px)] leading-[0.98] tracking-[-0.01em] break-words lg:sticky lg:top-32`}>Web design in {page.city}: common questions</h2>
            </div>
            <div className="lg:col-span-8 border-t-2 border-[#0B0B0B]">
              {page.faqs.map((faq) => (
                <details key={faq.q} className="group border-b-2 border-[#0B0B0B]">
                  <summary
                    className={`flex items-start justify-between gap-6 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden ${focusRing}`}
                  >
                    <h3 className="font-(family-name:--fc-body) text-[17px] md:text-[19px] font-semibold leading-snug">{faq.q}</h3>
                    <span
                      aria-hidden="true"
                      className="relative shrink-0 grid place-items-center size-8 border-2 border-[#0B0B0B] bg-white group-open:bg-[#F15A29] transition-colors"
                    >
                      <span className="absolute h-0.5 w-3.5 bg-[#0B0B0B]" />
                      <span className="absolute h-3.5 w-0.5 bg-[#0B0B0B] transition-transform duration-200 group-open:scale-y-0 motion-reduce:transition-none" />
                    </span>
                  </summary>
                  <p className="pb-7 pr-12 text-[16px] leading-[1.7] text-[#2b2b2b] max-w-[68ch]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEARBY ── */}
        <section className={`${section} bg-white`} aria-labelledby="c-nearby-heading">
          <div className={wrap}>
            <h2 id="c-nearby-heading" className={`${h2} mb-10`}>Nearby cities we serve</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 border-t-2 border-[#0B0B0B]">
              {nearby.map((n) => (
                <li key={n.href} className="border-b border-[#0B0B0B]/20">
                  <Link
                    href={n.href}
                    className={`group flex items-center justify-between gap-4 py-5 pr-2 sm:pr-6 hover:text-[#B5330E] ${focusRing}`}
                  >
                    <span className={`${display} text-[18px] leading-tight`}>
                      Web design {n.city}, {n.state}
                    </span>
                    <span className={`${mono} shrink-0 text-[12px] uppercase tracking-[0.12em] text-[#0B0B0B]/65 group-hover:text-[#B5330E]`}>
                      {Math.round(n.miles)} mi
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className={`${body} mt-8`}>
              See every city on <Link href="/areas-we-serve" className={inkLink}>Areas We Serve</Link>, or more of{" "}
              <Link href={stateAnchor(page.stateName)} className={inkLink}>{page.stateName}</Link>.
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="bg-[#F15A29] text-[#0B0B0B] border-t-2 border-[#0B0B0B]">
          <div className={`${wrap} py-16 md:py-24`}>
            <p className={`${eyebrow} mb-4`}>Talk to the people who build it</p>
            <h2 className={`${h2} max-w-[20ch] mb-8`}>Call us about your {page.city} business</h2>
            <a
              href={`tel:${tel}`}
              className={`${display} block w-fit max-w-full text-[clamp(38px,10vw,136px)] leading-[0.9] tracking-[-0.03em] [font-variation-settings:'wdth'_100] tabular-nums whitespace-nowrap underline decoration-[6px] md:decoration-[10px] underline-offset-[10px] md:underline-offset-[16px] decoration-[#0B0B0B]/25 hover:decoration-[#0B0B0B] transition-colors ${focusRing}`}
            >
              {NAP.telephoneDisplay}
            </a>
            <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-5">
              <a
                href="#plan"
                className={`${display} inline-flex items-center justify-center gap-2 h-14 px-6 bg-[#0B0B0B] text-white text-[15px] tracking-[0.04em] shadow-[6px_6px_0_#fff] hover:shadow-[3px_3px_0_#fff] hover:translate-x-[3px] hover:translate-y-[3px] transition-[transform,box-shadow] motion-reduce:transition-none ${focusRing}`}
              >
                Get my free {page.city} plan
                <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
              </a>
              <p className={`${mono} text-[12px] uppercase tracking-[0.12em]`}>
                {price}/mo · {LOCAL_PACKAGE.term}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <StickyCallBar heroId="c-hero" formId="plan" offer={`${price}/mo · free website`} tel={tel} />
    </div>
  );
}
