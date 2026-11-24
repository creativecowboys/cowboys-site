import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { allCityLinks, type CityLink } from "@/lib/city-pages";
import { BUSINESS_ID, SITE_URL } from "@/lib/seo";
import { LOCAL_PACKAGE, usd } from "@/lib/offer";

export const metadata: Metadata = {
  title: "Areas We Serve: Web Design & SEO by City",
  description:
    "Every city Creative Cowboys builds websites and runs local SEO for, by state. Custom websites, local SEO, and ads in one $297/month package.",
  alternates: { canonical: "/areas-we-serve" },
};

const anchor = (stateName: string) => stateName.toLowerCase().replace(/\s+/g, "-");

export default function AreasWeServePage() {
  const links = allCityLinks();
  const byState = new Map<string, CityLink[]>();
  for (const l of links) {
    const list = byState.get(l.stateName) ?? [];
    list.push(l);
    byState.set(l.stateName, list);
  }
  const states = [...byState.keys()].sort((a, b) => a.localeCompare(b));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/areas-we-serve#webpage`,
        url: `${SITE_URL}/areas-we-serve`,
        name: "Areas We Serve | Creative Cowboys",
        publisher: { "@id": BUSINESS_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: links.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Web design in ${l.city}, ${l.state}`,
            url: `${SITE_URL}${l.href}`,
          })),
        },
      },
    ],
  };

  return (
    <div className="bg-[#F2EBDA] text-[#0a0a0a] font-inter min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header dark={false} />
      <main>
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
          <div className="max-w-3xl">
            <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.9] uppercase mb-6">Areas we serve</h1>
            <p className="font-inter text-base md:text-lg text-[#3a3a3a] leading-relaxed mb-4">
              Creative Cowboys builds websites and runs local SEO for businesses in these cities, from our office in Villa Rica, Georgia.
              Every city gets the same offer: local SEO, paid ads management, and a free custom website for {usd(LOCAL_PACKAGE.monthly)} a month.
            </p>
            <p className="font-inter text-base text-[#3a3a3a]">
              Don&rsquo;t see your town? We work there too. <Link href="/contact" className="text-[#B5330E] font-bold underline">Tell us where you are</Link>.
            </p>
          </div>
        </section>
        <section className="py-12 md:py-16 px-6 md:px-12">
          <nav aria-label="States" className="flex flex-wrap gap-2 mb-12">
            {states.map((s) => (
              <a key={s} href={`#${anchor(s)}`} className="px-3 py-1 border-[2px] border-[#0a0a0a] font-inter text-xs font-bold uppercase bg-white hover:bg-[#F5C842]">
                {s}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {states.map((s) => {
              const cities = (byState.get(s) ?? []).sort((a, b) => a.city.localeCompare(b.city));
              return (
                <div key={s} id={anchor(s)} className="scroll-mt-24">
                  <h2 className="font-anton text-3xl uppercase mb-4 border-b-[2.5px] border-[#0a0a0a] pb-2">{s}</h2>
                  <ul className="flex flex-col gap-2">
                    {cities.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="font-inter text-base text-[#B5330E] font-bold underline decoration-[#B5330E]/30 hover:decoration-[#B5330E]">
                          Web design in {c.city}, {c.state}
                        </Link>
                        {c.metro && c.metro !== c.city && (
                          <span className="font-inter text-xs text-[#5a5a5a]"> · {c.metro} area</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
