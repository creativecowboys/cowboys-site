import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import { Phone, MapPin, ArrowUpRight, Clock, Mail } from "lucide-react";
import { Footer7 } from "@/components/ui/footer-7";

const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-anton" });

/*
 * TODO (needs Josh): a few facts would materially strengthen this page for both
 * E-E-A-T and AI-engine entity resolution, but none of them are safe to guess:
 *   - the year Creative Cowboys started (add as `foundingDate` in the schema)
 *   - real headshots for Josh and Dave
 *   - last names + a line of background each
 *   - the Franklin, TN street address once the office is settled
 * Everything currently on this page is drawn from copy already published on the
 * site, so it ships truthfully as-is.
 */

export const metadata: Metadata = {
  // No brand in the title — the root layout template already appends
  // "| Creative Cowboys".
  title: "About Us — The Team Behind the Work",
  description:
    "Creative Cowboys is Josh and Dave — a digital marketing shop with roots in Villa Rica, GA, serving businesses across the Southeast. You work directly with the people doing the work, not a sales rep.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Creative Cowboys — The Team Behind the Work",
    description:
      "A digital marketing shop with roots in Villa Rica, GA, serving businesses across the Southeast. No sales reps, no handoffs — you work with the people doing the work.",
    url: "https://www.creativecowboys.co/about",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency",
      },
    ],
  },
};

/**
 * AboutPage + Organization schema.
 *
 * The Organization block matters more than it looks: AI engines build their
 * understanding of a business from cross-source consensus, and until now the
 * site gave them no entity to resolve at all. Keep the name, address, and phone
 * here byte-identical to the LocalBusiness block in the root layout and to the
 * Google Business Profile — contradictions are what break entity confidence.
 */
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Creative Cowboys",
  url: "https://www.creativecowboys.co/about",
  mainEntity: {
    "@type": "Organization",
    name: "Creative Cowboys Media",
    alternateName: "Creative Cowboys",
    url: "https://www.creativecowboys.co",
    telephone: "+1-470-243-7517",
    email: "howdy@creativecowboys.co",
    description:
      "Digital marketing agency serving small businesses across the Southeast. Web design, local SEO, Google Ads, social advertising, and brand strategy.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "222 West Montgomery St",
      addressLocality: "Villa Rica",
      addressRegion: "GA",
      postalCode: "30180",
      addressCountry: "US",
    },
    founder: [
      { "@type": "Person", name: "Josh", jobTitle: "Co-Founder" },
      { "@type": "Person", name: "Dave", jobTitle: "Co-Founder" },
    ],
    // Villa Rica is the only office that exists today. Franklin is announced but
    // not open, so it belongs in areaServed — claiming it as a `location` would
    // assert a physical presence that isn't there yet. Promote it to a Place
    // (and add the street address) once the office actually opens.
    location: {
      "@type": "Place",
      name: "Creative Cowboys — Villa Rica, GA",
      address: {
        "@type": "PostalAddress",
        streetAddress: "222 West Montgomery St",
        addressLocality: "Villa Rica",
        addressRegion: "GA",
        postalCode: "30180",
        addressCountry: "US",
      },
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "West Georgia" },
      { "@type": "City", name: "Atlanta" },
      { "@type": "City", name: "Franklin" },
      { "@type": "AdministrativeArea", name: "Middle Tennessee" },
      { "@type": "AdministrativeArea", name: "Southeastern United States" },
    ],
    sameAs: [
      "https://www.facebook.com/creativecowboys",
      "https://www.instagram.com/creativecowboysmedia",
    ],
  },
};

const principles = [
  {
    title: "You talk to the people doing the work",
    body: "No account manager relaying your notes to a production house three states away. When you hire us, you get us.",
  },
  {
    title: "No vanity metrics",
    body: "Impressions and reach don't pay anybody's bills. We report on the things that do: calls, forms, booked work.",
  },
  {
    title: "We build it, we own it",
    body: "Sites, ads, SEO, and brand work all come out of the same shop, so the strategy doesn't fall apart in the handoff between vendors.",
  },
];

const services = [
  { label: "Local & National SEO", href: "/seo" },
  { label: "Google Ads & PPC", href: "/ppc" },
  { label: "Web Design", href: "/web-design" },
  { label: "Social Media Advertising", href: "/social-media-ads" },
  { label: "Brand Strategy", href: "/brand-strategy" },
  { label: "Video, Photo & Design", href: "/media-creation" },
];

const offices = [
  {
    city: "Villa Rica, GA",
    detail: "222 West Montgomery St · Villa Rica, GA 30180",
    note: "Where we started, and still home base.",
    tile: "#008f4c",
  },
  {
    city: "Franklin, TN",
    detail: "Williamson County & Greater Nashville",
    note: "Opening soon — already taking on Middle Tennessee work.",
    tile: "#005eb8",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <div
        className={`${anton.variable} bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-[#F2EBDA] min-h-screen relative overflow-hidden flex flex-col md:pt-[36px] pt-0`}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
        .h3-btn-brutalist{border:3px solid #1a1a1a;box-shadow:4px 4px 0px #1a1a1a;transition:all .2s ease;}
        .h3-btn-brutalist:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0px #1a1a1a;}
        .h3-btn-brutalist:active{transform:translate(2px,2px);box-shadow:0px 0px 0px #1a1a1a;}
        .h3-dotted-bg{background-image:radial-gradient(rgba(26,26,26,0.12) 1.5px,transparent 1.5px);background-size:24px 24px;}
      `,
          }}
        />

        {/* Dotted retro printed background */}
        <div className="absolute inset-0 h3-dotted-bg pointer-events-none z-0 opacity-80" />

        {/* Header */}
        <header className="relative w-full bg-[#0a0a0a] border-b-4 border-[#0a0a0a] py-4 px-6 md:px-12 z-40">
          <div className="w-full flex justify-between items-center gap-4">
            <Link href="/" className="inline-block select-none">
              <Image
                src="/Cowboys logo script 2026 v2.png"
                alt="Creative Cowboys — Digital Marketing Agency"
                width={380}
                height={110}
                priority
                className="w-44 sm:w-52 md:w-60 h-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-inter text-sm md:text-base font-bold uppercase tracking-wider text-[#F2EBDA]">
              <Link href="/services" className="hover:text-[#B5330E] transition-colors duration-200">Services</Link>
              <Link href="/web-design" className="hover:text-[#B5330E] transition-colors duration-200">Web Design</Link>
              <Link href="/seo" className="hover:text-[#B5330E] transition-colors duration-200">SEO</Link>
              <Link href="/results" className="hover:text-[#B5330E] transition-colors duration-200">Results</Link>
            </nav>

            <a
              href="tel:4702437517"
              className="h3-btn-brutalist border-[#F2EBDA] bg-[#B5330E] text-white font-bold px-4 md:px-6 py-2.5 md:py-3 uppercase tracking-wider text-xs md:text-sm inline-flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
            >
              <Phone size={15} /> (470) 243-7517
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="relative w-full pt-14 md:pt-24 px-6 md:px-12 z-10">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest font-inter">
                Who We Are
              </span>

              <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase tracking-tight text-[#0a0a0a]">
                TWO GUYS WHO GOT <br className="hidden md:inline" />
                TIRED OF <span className="text-[#B5330E]">AGENCY FLUFF.</span>
              </h1>

              <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-2xl leading-relaxed">
                We&rsquo;re Josh and Dave. Creative Cowboys started in Villa Rica, Georgia, building
                websites and running ads for the kind of businesses that keep a small town
                running — contractors, attorneys, plumbers, manufacturers, pool builders.
                These days we work with businesses across the Southeast, and we&rsquo;re opening
                a second office in Franklin, Tennessee.
              </p>

              <p className="font-inter text-base md:text-lg text-[#0a0a0a]/80 max-w-2xl leading-relaxed">
                What hasn&rsquo;t changed is how we work. When you hire Creative Cowboys, you&rsquo;re
                working directly with the team that does the work — not a sales rep who hands
                you off to a production house after the contract is signed.
              </p>
            </div>

            {/* Contact card stack */}
            <div className="lg:col-span-5 w-full flex flex-col gap-4">
              <a
                href="mailto:howdy@creativecowboys.co"
                className="group flex items-center gap-4 bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all"
              >
                <span className="w-11 h-11 flex-none border-[2.5px] border-[#0a0a0a] flex items-center justify-center bg-[#B5330E]">
                  <Mail size={18} className="text-white" />
                </span>
                <span className="flex flex-col">
                  <span className="font-anton text-[10px] tracking-[1.5px] uppercase text-[#0a0a0a]/50">Email</span>
                  <span className="font-inter text-sm font-bold text-[#0a0a0a]">howdy@creativecowboys.co</span>
                </span>
                <ArrowUpRight size={16} className="ml-auto text-[#0a0a0a]/30 group-hover:text-[#B5330E] transition-colors" />
              </a>

              <a
                href="tel:4702437517"
                className="group flex items-center gap-4 bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all"
              >
                <span className="w-11 h-11 flex-none border-[2.5px] border-[#0a0a0a] flex items-center justify-center bg-[#005eb8]">
                  <Phone size={18} className="text-white" />
                </span>
                <span className="flex flex-col">
                  <span className="font-anton text-[10px] tracking-[1.5px] uppercase text-[#0a0a0a]/50">Phone</span>
                  <span className="font-inter text-sm font-bold text-[#0a0a0a]">(470) 243-7517</span>
                </span>
                <ArrowUpRight size={16} className="ml-auto text-[#0a0a0a]/30 group-hover:text-[#B5330E] transition-colors" />
              </a>

              <div className="flex items-center gap-2 font-inter text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/60 px-1">
                <Clock size={14} className="text-[#B5330E]" /> Mon – Fri · 9:00 AM – 5:00 PM
              </div>
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="relative w-full py-14 md:py-20 px-6 md:px-12 z-10">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="font-anton text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#0a0a0a] mb-8">
              WHERE YOU&rsquo;LL FIND US
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offices.map(({ city, detail, note, tile }) => (
                <div
                  key={city}
                  className="bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-6 flex flex-col gap-3"
                >
                  <span
                    className="w-11 h-11 flex-none border-[2.5px] border-[#0a0a0a] flex items-center justify-center"
                    style={{ background: tile }}
                  >
                    <MapPin size={18} className="text-white" />
                  </span>
                  <span className="font-anton text-2xl uppercase tracking-tight text-[#0a0a0a]">{city}</span>
                  <span className="font-inter text-sm font-bold text-[#0a0a0a]/80">{detail}</span>
                  <span className="font-inter text-sm text-[#0a0a0a]/60">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we work */}
        <section className="relative w-full pb-14 md:pb-20 px-6 md:px-12 z-10">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="font-anton text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#0a0a0a] mb-8">
              HOW WE WORK
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {principles.map(({ title, body }, i) => (
                <div
                  key={title}
                  className="bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-6 flex flex-col gap-3"
                >
                  <span className="font-anton text-4xl text-[#B5330E] leading-none">
                    0{i + 1}
                  </span>
                  <h3 className="font-anton text-xl uppercase tracking-tight text-[#0a0a0a] leading-tight">
                    {title}
                  </h3>
                  <p className="font-inter text-sm text-[#0a0a0a]/70 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we do — internal links */}
        <section className="relative w-full pb-14 md:pb-24 px-6 md:px-12 z-10">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="font-anton text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#0a0a0a] mb-8">
              WHAT WE DO
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#1a1a1a] p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all"
                >
                  <span className="font-inter text-sm font-bold uppercase tracking-wider text-[#0a0a0a]">
                    {label}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="ml-auto text-[#0a0a0a]/30 group-hover:text-[#B5330E] transition-colors"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="h3-btn-brutalist bg-[#B5330E] text-white font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2"
              >
                Start a Conversation <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/results"
                className="h3-btn-brutalist bg-white text-[#0a0a0a] font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2"
              >
                See the Results <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer7 />
    </>
  );
}
