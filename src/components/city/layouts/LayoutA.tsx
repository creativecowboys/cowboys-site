import Image from "next/image";
import Link from "next/link";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ArrowRight, ArrowUpRight, Check, Phone } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import CityLeadForm from "@/components/city/CityLeadForm";
import { offerSchema } from "@/components/city/OfferSection";
import { BUSINESS_ID, NAP, SITE_URL } from "@/lib/seo";
import { HQ, milesBetween, nearbyLinks, proofFor, type CityPage } from "@/lib/city-pages";
import { LOCAL_PACKAGE, OTHER_SERVICES, usd } from "@/lib/offer";

/**
 * Layout option A, "Night Ride" (Josh's dark brand direction, Nov 18 2026).
 * Brief: scripts/city-pages/LAYOUT_BRIEFS.md. Signature: the camera viewfinder
 * around Josh and Dave in the hero. Everything else stays quiet.
 */

const display = Inter_Tight({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-nr-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-nr-mono" });

/* Tokens: canvas #050404 · surface #0E0B0A · line #2a2220 · orange #F15A29 → peach #FFB089 · text #F4EFEA · muted #A79C95 */
const wrap = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12";
const fDisplay = "font-[family-name:var(--font-nr-display)] font-black uppercase tracking-[-0.045em]";
const fMono = "font-[family-name:var(--font-nr-mono)] uppercase tracking-[0.16em]";
const hud = `${fMono} text-[11px] sm:text-[12px] text-[#A79C95]`;
const h2 = `${fDisplay} text-[clamp(30px,4.2vw,54px)] leading-[0.95] text-[#F4EFEA] [text-wrap:balance]`;
const h3 = "font-[family-name:var(--font-nr-display)] font-extrabold uppercase tracking-[-0.02em] text-[#F4EFEA]";
const body = "font-inter text-[16px] md:text-[17px] leading-[1.7] text-[#A79C95]";
const gradText = "bg-gradient-to-r from-[#F15A29] to-[#FFB089] bg-clip-text text-transparent";
const card = "nr-card rounded-[18px] border border-[#2a2220] bg-[#0E0B0A]";
const link = "text-[#F4EFEA] underline decoration-[#F15A29]/50 underline-offset-[3px] hover:decoration-[#F15A29] transition-colors";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#F15A29] px-6 py-3.5 font-inter text-[15px] font-semibold text-[#050404] shadow-[0_10px_40px_-10px_rgba(241,90,41,0.7)] transition-[background-color,box-shadow] duration-300 hover:bg-[#ff6a3a] hover:shadow-[0_14px_50px_-10px_rgba(241,90,41,0.9)]";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#2a2220] bg-[#0E0B0A]/60 px-6 py-3.5 font-inter text-[15px] font-semibold text-[#F4EFEA] transition-colors duration-300 hover:border-[#F15A29]/60";
const pill = "rounded-full border border-[#2a2220] bg-[#0E0B0A] px-4 py-2 font-inter text-[14px] text-[#F4EFEA]";
const section = "py-20 md:py-28";

const TEAM = [
  { name: "Josh", role: "Co-founder", photo: "/team/josh-tee.jpg" },
  { name: "Dave", role: "Co-founder", photo: "/team/dave-tee.jpg" },
];

const LOGOS = [
  { src: "/Client%20Logos/johnbjackson-dark-Blue.png", alt: "John B. Jackson Law", w: 520, h: 100 },
  { src: "/Client%20Logos/McKinley%20(Black).png", alt: "McKinley Roofing", w: 326, h: 127 },
  { src: "/Client%20Logos/Harmonic%20Logo%20(Black).png", alt: "Harmonic Production", w: 4260, h: 854 },
  { src: "/Client%20Logos/big-MetLane_logo_full.png", alt: "Met Lane", w: 450, h: 85 },
  { src: "/Client%20Logos/Leuco%20transparent%202.png", alt: "LEUCO", w: 1500, h: 331 },
  { src: "/Client%20Logos/InnovativeLogoWebsite.png", alt: "Innovative", w: 1023, h: 432 },
  { src: "/Client%20Logos/Life%20Publishers%20(Black).png", alt: "Life Publishers", w: 326, h: 127 },
  { src: "/Client%20Logos/FireBible%20logo%20Black.webp", alt: "Fire Bible", w: 179, h: 69 },
];

const stateAnchor = (stateName: string) => `/areas-we-serve#${stateName.toLowerCase().replace(/\s+/g, "-")}`;
const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}°${v >= 0 ? pos : neg}`;

/** Section tag: a small mono label with an orange tick. Names the section, nothing more. */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${hud} mb-5 flex items-center gap-2.5`}>
      <span aria-hidden="true" className="h-px w-6 bg-[#F15A29]" />
      {children}
    </p>
  );
}

/** Orange viewfinder corner bracket. */
function Bracket({ at }: { at: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "top-3 left-3 border-t-2 border-l-2",
    tr: "top-3 right-3 border-t-2 border-r-2",
    bl: "bottom-3 left-3 border-b-2 border-l-2",
    br: "bottom-3 right-3 border-b-2 border-r-2",
  }[at];
  return <span aria-hidden="true" className={`pointer-events-none absolute z-20 size-7 border-[#F15A29] sm:size-9 ${pos}`} />;
}

const CSS = `
.nr ::selection { background: #F15A29; color: #050404; }
.nr a:focus-visible, .nr button:focus-visible, .nr summary:focus-visible {
  outline: 2px solid #FFB089; outline-offset: 3px; border-radius: 10px;
}
.nr-card { position: relative; isolation: isolate; transition: border-color .4s ease; }
.nr-card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: -1; pointer-events: none;
  background: radial-gradient(120% 90% at 50% 0%, rgba(241,90,41,.14), transparent 62%);
  opacity: 0; transition: opacity .5s ease;
}
.nr-card:hover { border-color: #3b2d29; }
.nr-card:hover::before { opacity: 1; }
@keyframes nr-rise { from { opacity: 0; transform: translateY(18px); filter: blur(10px); } to { opacity: 1; transform: none; filter: blur(0); } }
.nr-rise { animation: nr-rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--i, 0) * 80ms); }
@keyframes nr-rec { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
.nr-rec { animation: nr-rec 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: no-preference) { html:has(.nr) { scroll-behavior: smooth; } }
@media (prefers-reduced-motion: reduce) {
  .nr-rise, .nr-rec { animation: none; }
  .nr-card, .nr-card::before { transition: none; }
}
`;

export default function LayoutA({ page, preview = false }: { page: CityPage; preview?: boolean }) {
  const place = `${page.city}, ${page.state}`;
  const pageName = `Web Design in ${place}`;
  const url = `${SITE_URL}${page.path}`;
  const milesFromHq = Math.round(milesBetween(HQ, page));
  const nearby = nearbyLinks(page);
  const proof = proofFor(page);
  const tel = `tel:${NAP.telephone.replace(/[^\d+]/g, "")}`;
  const coords = `${coord(page.lat, "N", "S")} ${coord(page.lon, "E", "W")}`;
  const pop = page.population.toLocaleString("en-US");

  // H1 sizes to the longest line so short and long city names both read big.
  const longest = Math.min(16, Math.max(14, place.length + 1));
  const h1Size = `clamp(40px, ${(100 / (0.54 * longest)).toFixed(2)}cqi, 120px)`;

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
    <div
      className={`nr ${display.variable} ${mono.variable} flex min-h-screen flex-col overflow-x-clip bg-[#050404] font-inter text-[#F4EFEA]`}
      style={{
        backgroundImage: "radial-gradient(rgba(244,239,234,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header dark />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-10 pb-20 md:pt-14 md:pb-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
            style={{ background: "radial-gradient(60% 55% at 50% 100%, rgba(241,90,41,0.20), rgba(241,90,41,0.06) 45%, transparent 75%)" }}
          />
          <div className={`${wrap} relative`}>
            <nav aria-label="Breadcrumb" className={`${hud} nr-rise mb-10 flex flex-wrap items-center gap-x-2 gap-y-1`} style={{ ["--i" as string]: 0 }}>
              <Link href="/" className="hover:text-[#F4EFEA]">Home</Link>
              <span aria-hidden="true" className="text-[#2a2220]">/</span>
              <Link href="/areas-we-serve" className="hover:text-[#F4EFEA]">Areas we serve</Link>
              <span aria-hidden="true" className="text-[#2a2220]">/</span>
              <Link href={stateAnchor(page.stateName)} className="hover:text-[#F4EFEA]">{page.stateName}</Link>
              <span aria-hidden="true" className="text-[#2a2220]">/</span>
              <span className="text-[#F4EFEA]" aria-current="page">{page.city}</span>
            </nav>

            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-16">
              <div className="@container min-w-0">
                <p
                  className={`nr-rise ${fMono} mb-7 inline-flex max-w-full items-center gap-2.5 rounded-[16px] border leading-[1.5] sm:rounded-full border-[#2a2220] bg-[#0E0B0A]/80 py-2 pr-4 pl-3 text-[11px] text-[#F4EFEA]`}
                  style={{ ["--i" as string]: 1 }}
                >
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#F15A29] shadow-[0_0_0_4px_rgba(241,90,41,0.18),0_0_14px_rgba(241,90,41,0.9)]" />
                  <span>{page.eyebrow}</span>
                </p>
                <h1
                  className={`nr-rise ${fDisplay} leading-[0.9] text-[#F4EFEA]`}
                  style={{ ["--i" as string]: 2, fontSize: h1Size }}
                >
                  <span className="block">Web Design in</span>
                  <span className={`block pb-[0.06em] [text-wrap:balance] ${gradText}`}>{place}</span>
                </h1>
                <p className={`nr-rise ${body} mt-7 max-w-[56ch] text-[17px] md:text-[18px]`} style={{ ["--i" as string]: 3 }}>
                  {page.lead}
                </p>
                <div className="nr-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ ["--i" as string]: 4 }}>
                  <a href="#plan" className={btnPrimary}>
                    Get my free {page.city} plan
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                  <a href={tel} className={btnGhost}>
                    <Phone aria-hidden="true" className="size-4 text-[#F15A29]" />
                    Call {NAP.telephoneDisplay}
                  </a>
                </div>
              </div>

              {/* Signature: the viewfinder */}
              <figure className="nr-rise mx-auto w-full max-w-[520px] lg:max-w-none" style={{ ["--i" as string]: 5 }}>
                <div className="rounded-[18px] border border-[#2a2220] bg-[#0E0B0A] p-2.5 shadow-[0_50px_120px_-50px_rgba(241,90,41,0.55)] sm:p-3">
                  <div className="relative overflow-hidden rounded-[12px] bg-[#050404]">
                    <div className="grid aspect-[4/3.6] grid-cols-2 gap-[3px]">
                      {TEAM.map((t, i) => (
                        <div key={t.name} className="relative">
                          <Image
                            src={t.photo}
                            alt={`${t.name}, ${t.role.toLowerCase()} of Creative Cowboys`}
                            fill
                            priority={i === 0}
                            sizes="(min-width: 1024px) 220px, (min-width: 640px) 260px, 50vw"
                            className="object-cover object-[center_14%]"
                          />
                        </div>
                      ))}
                    </div>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,4,4,0.65),transparent_24%,transparent_70%,rgba(5,4,4,0.8))]" />
                    <Bracket at="tl" />
                    <Bracket at="tr" />
                    <Bracket at="bl" />
                    <Bracket at="br" />
                    {/* small center reticle */}
                    <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-20 size-4 -translate-x-1/2 -translate-y-1/2">
                      <span className="absolute top-1/2 left-0 h-px w-full bg-[#F4EFEA]/50" />
                      <span className="absolute top-0 left-1/2 h-full w-px bg-[#F4EFEA]/50" />
                    </span>
                    <div className={`${fMono} absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-5 text-[10px] text-[#F4EFEA] sm:px-8 sm:pt-6 sm:text-[11px]`}>
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden="true" className="nr-rec size-2 rounded-full bg-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.9)]" />
                        Rec
                      </span>
                      <span>{place}</span>
                    </div>
                    <div className={`${fMono} absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-6 pb-5 text-[10px] text-[#F4EFEA] sm:px-8 sm:pb-6 sm:text-[11px]`}>
                      <span className="tracking-[0.08em]">{coords}</span>
                      <span className="text-[#A79C95]">Pop {pop}</span>
                    </div>
                  </div>
                  <figcaption className={`${fMono} grid grid-cols-2 gap-[3px] px-1 pt-3 pb-1 text-[10px] sm:text-[11px]`}>
                    {TEAM.map((t) => (
                      <span key={t.name} className="text-[#A79C95]">
                        <span className="text-[#F4EFEA]">{t.name}</span> · {t.role}
                      </span>
                    ))}
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Logo strip ── */}
        <section aria-label="Businesses we work with" className="border-y border-[#1a1412] py-8">
          <div className={`${wrap} flex flex-col gap-6 md:flex-row md:items-center md:gap-10`}>
            <p className={`${hud} shrink-0 text-[11px]`}>Some of our clients</p>
            <ul className="grid flex-1 grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-4">
              {LOGOS.map((l) => (
                <li key={l.src} className="flex justify-center">
                  <Image
                    src={l.src}
                    alt={l.alt}
                    width={l.w}
                    height={l.h}
                    sizes="140px"
                    className="h-6 w-auto max-w-[130px] object-contain opacity-40 brightness-0 invert md:h-7"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Local story ── */}
        <section className={section}>
          <div className={`${wrap} grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16`}>
            <aside aria-label={`${page.city} at a glance`} className="lg:pt-2">
              <dl className={`${hud} grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:sticky lg:top-32 lg:grid-cols-1`}>
                <div>
                  <dt className="text-[#6f6560]">City</dt>
                  <dd className="mt-1 text-[#F4EFEA]">{place}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6560]">County</dt>
                  <dd className="mt-1 text-[#F4EFEA]">{page.county}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6560]">Population</dt>
                  <dd className="mt-1 text-[#F4EFEA]">{pop}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6560]">Position</dt>
                  <dd className="mt-1 tracking-[0.06em] text-[#F4EFEA]">{coords}</dd>
                </div>
              </dl>
            </aside>
            <div className="max-w-[68ch]">
              <Tag>The local picture</Tag>
              <h2 className={h2}>{page.local.heading}</h2>
              <div className="mt-8 flex flex-col gap-5">
                {page.local.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={body}>{p}</p>
                ))}
                <p className={body}>
                  More on how we build is on our <Link href="/web-design" className={link}>web design</Link> page, and how we get
                  sites found is on <Link href="/seo" className={link}>SEO</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Offer ── */}
        <section id="pricing" className={`${section} pt-0 md:pt-0`}>
          <div className={wrap}>
            <Tag>The package</Tag>
            <h2 className={`${h2} max-w-[18ch]`}>
              One plan for <span className={gradText}>{page.city}</span> businesses
            </h2>

            <article className="relative mt-12 overflow-hidden rounded-[22px] border border-[#3a2a24] bg-[#0E0B0A] shadow-[0_60px_160px_-60px_rgba(241,90,41,0.6)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(70% 90% at 0% 0%, rgba(241,90,41,0.16), transparent 60%), radial-gradient(50% 60% at 100% 100%, rgba(255,176,137,0.06), transparent 70%)" }}
              />
              <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                <div className="border-b border-[#2a2220] p-7 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
                  <p className={`${hud} text-[#F4EFEA]`}>{LOCAL_PACKAGE.name}</p>
                  <p className="mt-6 flex items-end gap-3">
                    <span className={`${fDisplay} text-[clamp(84px,12vw,148px)] leading-[0.8] ${gradText} pr-[0.04em]`}>
                      {usd(LOCAL_PACKAGE.monthly)}
                    </span>
                    <span className={`${hud} whitespace-nowrap pb-2 text-[12px]`}>/ month</span>
                  </p>
                  <p className="mt-6 font-inter text-[15px] font-medium text-[#F4EFEA]">{LOCAL_PACKAGE.term}</p>
                  <p className={`${body} mt-2 text-[15px] md:text-[15px]`}>
                    The custom website is a {usd(LOCAL_PACKAGE.websiteValue)} value. With the package, it&rsquo;s free.
                  </p>
                  <a href="#plan" className={`${btnPrimary} mt-9 w-full sm:w-auto`}>
                    Get the {page.city} package
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
                <ul className="flex flex-col divide-y divide-[#2a2220] p-7 sm:p-10 lg:p-12">
                  {LOCAL_PACKAGE.includes.map((item) => (
                    <li key={item.title} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                      <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[#F15A29]/40 bg-[#F15A29]/10">
                        <Check className="size-3.5 text-[#F15A29]" strokeWidth={3} />
                      </span>
                      <div>
                        <h3 className={`${h3} text-[19px] md:text-[21px]`}>{item.title}</h3>
                        <p className={`${body} mt-1.5 text-[15px] md:text-[16px]`}>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <div className="mt-14">
              <h3 className={`${hud} mb-5`}>Add what you need</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {OTHER_SERVICES.map((s) => {
                  const href = "href" in s ? s.href : undefined;
                  return (
                    <li key={s.title} className={`${card} rounded-[16px] p-5`}>
                      <p className="font-inter text-[15px] font-semibold text-[#F4EFEA]">
                        {href ? (
                          <Link href={href} className="group inline-flex items-center gap-1 hover:text-[#FFB089]">
                            {s.title}
                            <ArrowUpRight aria-hidden="true" className="size-3.5 text-[#F15A29] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </Link>
                        ) : (
                          s.title
                        )}
                      </p>
                      <p className="mt-2 font-inter text-[14px] leading-[1.6] text-[#A79C95]">{s.body}</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 flex flex-col items-start gap-4 rounded-[20px] border border-[#2a2220] bg-[#0E0B0A] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3 sm:pr-3 sm:pl-7">
              <p className="font-inter text-[15px] text-[#F4EFEA]">
                Only need a website? Ask us about our new website specials.
              </p>
              <Link href="/contact" className={`${btnGhost} shrink-0 py-2.5 text-[14px]`}>
                Ask about website specials
                <ArrowRight aria-hidden="true" className="size-4 text-[#F15A29]" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Industries ── */}
        <section className={`${section} border-t border-[#1a1412]`}>
          <div className={wrap}>
            <div className="max-w-[60ch]">
              <Tag>Who we build for</Tag>
              <h2 className={h2}>{page.industries.heading}</h2>
              <p className={`${body} mt-6`}>{page.industries.intro}</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {page.industries.items.map((item) => (
                <article key={item.name} className={`${card} p-7 md:p-8`}>
                  <h3 className={`${h3} text-[20px] leading-[1.1] md:text-[22px]`}>{item.name}</h3>
                  <p className={`${body} mt-3 text-[15px] md:text-[16px]`}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Includes ── */}
        <section className={`${section} pt-0 md:pt-0`}>
          <div className={wrap}>
            <Tag>What&rsquo;s in the build</Tag>
            <h2 className={`${h2} max-w-[20ch]`}>What your {page.city} website includes</h2>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {page.includes.map((item) => (
                <article key={item.title} className={`${card} p-7 md:p-8`}>
                  <span aria-hidden="true" className="mb-5 block h-0.5 w-8 rounded-full bg-gradient-to-r from-[#F15A29] to-[#FFB089]" />
                  <h3 className={`${h3} text-[20px] leading-[1.1] md:text-[22px]`}>{item.title}</h3>
                  <p className={`${body} mt-3 text-[15px] md:text-[16px]`}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Proof ── */}
        <section className={`${section} border-t border-[#1a1412]`}>
          <div className={wrap}>
            <div className="max-w-[60ch]">
              <Tag>{proof.local ? "Nearby clients" : "Clients"}</Tag>
              <h2 className={h2}>{proof.local ? `Work near ${page.city}` : "Businesses we work with"}</h2>
              <p className={`${body} mt-6`}>
                {proof.local
                  ? `Real clients a short drive from ${page.city}. Ask us about their work on your first call.`
                  : "Real clients we work with today. We'll walk you through their work on your first call. More on the "}
                {!proof.local && (
                  <>
                    <Link href="/results" className={link}>results page</Link>.
                  </>
                )}
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {proof.clients.map((c) => (
                <article key={c.name} className={`${card} flex flex-col p-7`}>
                  {c.screenshot && (
                    <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[12px] border border-[#2a2220] bg-[#050404]">
                      <Image
                        src={c.screenshot}
                        alt={`${c.name} website, built by Creative Cowboys`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover object-top"
                      />
                    </div>
                  )}
                  <div className={`${fMono} flex items-center justify-between gap-3 text-[11px]`}>
                    <span className="text-[#F15A29]">{c.city}, {c.state}</span>
                    {proof.local && c.miles <= 75 && <span className="text-[#6f6560]">{Math.round(c.miles)} mi</span>}
                  </div>
                  <h3 className={`${h3} mt-4 text-[24px] leading-[1.05]`}>{c.name}</h3>
                  <p className={`${hud} mt-2 normal-case tracking-[0.02em] text-[13px]`}>{c.industry}</p>
                  <p className={`${body} mt-5 text-[15px] md:text-[15px]`}>{c.work}</p>
                  {c.url && c.screenshot && (
                    <a href={c.url} target="_blank" rel="noopener" className={`${link} mt-6 inline-flex items-center gap-1 self-start text-[14px]`}>
                      See the live site
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How we work + form ── */}
        <section className={`${section} border-t border-[#1a1412]`}>
          <div className={`${wrap} grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-20`}>
            <div className="max-w-[62ch]">
              <Tag>How we work</Tag>
              <h2 className={h2}>{page.howWeWork.heading}</h2>
              <div className="mt-8 flex flex-col gap-5">
                {page.howWeWork.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={body}>{p}</p>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-4 border-t border-[#2a2220] pt-8">
                <div className="flex -space-x-3">
                  {TEAM.map((t) => (
                    <span key={t.name} className="relative size-14 overflow-hidden rounded-full border-2 border-[#050404] ring-1 ring-[#2a2220]">
                      <Image src={t.photo} alt={`${t.name}, ${t.role.toLowerCase()}`} fill sizes="56px" className="object-cover object-[center_12%]" />
                    </span>
                  ))}
                </div>
                <p className="font-inter text-[15px] leading-[1.55] text-[#F4EFEA]">
                  Josh and Dave
                  <span className={`${hud} mt-0.5 block text-[11px]`}>Co-founders</span>
                </p>
              </div>
              <p className={`${body} mt-6`}>
                Creative Cowboys is Josh and Dave, working out of {NAP.streetAddress} in {NAP.addressLocality}, Georgia
                {milesFromHq > 25 ? `, about ${milesFromHq} miles from ${page.city}` : ""}. You talk to the people building your
                site, not a salesperson. Read more <Link href="/about" className={link}>about us</Link>.
              </p>
            </div>

            <div id="plan" className="scroll-mt-32">
              <div className="relative overflow-hidden rounded-[18px] border border-[#2a2220] bg-[#0E0B0A] p-7 shadow-[0_40px_120px_-60px_rgba(241,90,41,0.6)] sm:p-9">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(90% 50% at 100% 0%, rgba(241,90,41,0.12), transparent 70%)" }} />
                <div className="relative">
                  <p className={`${hud} flex items-center gap-2`}>
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-[#F15A29] shadow-[0_0_10px_rgba(241,90,41,0.9)]" />
                    Free plan
                  </p>
                  <h2 className={`${fDisplay} mt-4 text-[clamp(28px,3vw,36px)] leading-[0.95] [text-wrap:balance]`}>
                    Get your free {page.city} plan
                  </h2>
                  <p className={`${body} mt-3 text-[15px] md:text-[15px]`}>
                    Tell us about your business. We&rsquo;ll call within one business day with a plan for your site and local SEO.
                  </p>
                  <div className="mt-7">
                    <CityLeadForm
                      city={page.city}
                      preview={preview}
                      idPrefix="nr-lead"
                      theme={{
                        form: "flex flex-col gap-4",
                        label: `${fMono} mb-2 block text-[11px] text-[#A79C95]`,
                        input:
                          "w-full rounded-[12px] border border-[#2a2220] bg-[#050404] px-4 py-3 font-inter text-[16px] text-[#F4EFEA] outline-none transition-[border-color,box-shadow] placeholder:text-[#6f6560] focus:border-[#F15A29] focus:shadow-[0_0_0_3px_rgba(241,90,41,0.25)] [&>option]:bg-[#0E0B0A]",
                        button: `${btnPrimary} mt-2 w-full disabled:opacity-60`,
                        note: "font-inter text-[14px] text-[#FFB089]",
                        success:
                          "rounded-[12px] border border-[#F15A29]/40 bg-[#F15A29]/10 p-5 font-inter text-[15px] leading-[1.6] text-[#F4EFEA]",
                      }}
                    />
                  </div>
                  <p className="mt-5 font-inter text-[14px] text-[#A79C95]">
                    Or call us at{" "}
                    <a href={tel} className={link}>{NAP.telephoneDisplay}</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Areas ── */}
        <section className={`${section} border-t border-[#1a1412]`}>
          <div className={wrap}>
            <div className="max-w-[60ch]">
              <Tag>Service area</Tag>
              <h2 className={h2}>Where we work around {page.city}</h2>
              <p className={`${body} mt-6`}>{page.areas.intro}</p>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {page.areas.places.map((p) => (
                <li key={p} className={pill}>{p}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className={`${section} pt-0 md:pt-0`}>
          <div className={`${wrap} grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16`}>
            <div>
              <Tag>Questions</Tag>
              <h2 className={h2}>Web design in {page.city}: common questions</h2>
            </div>
            <div className="border-t border-[#2a2220]">
              {page.faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-[#2a2220]">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-inter text-[17px] font-semibold leading-[1.4] text-[#F4EFEA] md:text-[18px]">{faq.q}</h3>
                    <span aria-hidden="true" className="relative mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-[#2a2220] transition-colors group-hover:border-[#F15A29]/60 group-open:border-[#F15A29]/60">
                      <span className="absolute h-px w-2.5 bg-[#F15A29]" />
                      <span className="absolute h-2.5 w-px bg-[#F15A29] group-open:hidden" />
                    </span>
                  </summary>
                  <p className={`${body} max-w-[64ch] pr-10 pb-7 text-[15px] md:text-[16px]`}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nearby ── */}
        <section aria-labelledby="nearby-heading" className={`${section} border-t border-[#1a1412]`}>
          <div className={wrap}>
            <Tag>Nearby</Tag>
            <h2 id="nearby-heading" className={h2}>Nearby cities we serve</h2>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {nearby.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className={`${pill} group inline-flex items-center gap-3 transition-colors hover:border-[#F15A29]/60`}>
                    Web design {n.city}, {n.state}
                    <span className={`${fMono} text-[10px] text-[#6f6560] group-hover:text-[#FFB089]`}>{Math.round(n.miles)} mi</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className={`${body} mt-8 text-[15px] md:text-[15px]`}>
              See every city on <Link href="/areas-we-serve" className={link}>Areas We Serve</Link>, or more of{" "}
              <Link href={stateAnchor(page.stateName)} className={link}>{page.stateName}</Link>.
            </p>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative overflow-hidden border-t border-[#1a1412] py-24 md:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(55% 80% at 50% 110%, rgba(241,90,41,0.32), rgba(241,90,41,0.08) 50%, transparent 75%)" }}
          />
          <div className={`${wrap} relative text-center`}>
            <p className={`${hud} mb-6`}>{coords} · {place}</p>
            <h2 className={`${fDisplay} mx-auto max-w-[16ch] text-[clamp(40px,7vw,96px)] leading-[0.9] [text-wrap:balance]`}>
              Ready to win <span className={gradText}>{page.city}</span> searches
            </h2>
            <p className={`${body} mx-auto mt-6 max-w-[52ch]`}>
              Tell us about your business. We&rsquo;ll come back with a plan for your {page.city} site and local SEO, with no pressure.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#plan" className={btnPrimary}>
                Get my free {page.city} plan
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
              <a href={tel} className={btnGhost}>
                <Phone aria-hidden="true" className="size-4 text-[#F15A29]" />
                Call {NAP.telephoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
