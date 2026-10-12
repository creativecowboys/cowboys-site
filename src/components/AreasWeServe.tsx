import Link from "next/link";
import {
  DIGITAL_MARKETING_CITY_PAGES,
  FRANKLIN_WEB_DESIGN,
  WEB_DESIGN_CITY_PAGES,
  type CityAreaGroup,
  type CityPageLink,
} from "@/lib/city-pages";

const GROUPS: Record<
  CityAreaGroup,
  { title: string; links: CityPageLink[] }
> = {
  "web-design": {
    title: "Web design",
    links: WEB_DESIGN_CITY_PAGES,
  },
  "digital-marketing": {
    title: "Digital marketing",
    links: DIGITAL_MARKETING_CITY_PAGES,
  },
};

function introFor(groups: CityAreaGroup[]): string {
  const web = groups.includes("web-design");
  const marketing = groups.includes("digital-marketing");
  const place =
    "Creative Cowboys is headquartered at 222 West Montgomery St in Villa Rica, GA. That is the only open office.";
  if (web && marketing) {
    return `${place} These pages are the local versions of web design and digital marketing for the nearby cities we work in.`;
  }
  if (marketing) {
    return `${place} These pages cover digital marketing — local SEO, ads, and websites — for the nearby cities we work in.`;
  }
  return `${place} These pages cover web design for the nearby cities we work in.`;
}

const cardClass =
  "group flex flex-col gap-2 border-[2.5px] border-[#0a0a0a] bg-white p-5 md:p-6 shadow-[4px_4px_0px_#0a0a0a] hover:bg-[#F5C842] transition-colors";

export default function AreasWeServe({
  groups = ["web-design", "digital-marketing"],
  id = "areas-we-serve",
}: {
  groups?: CityAreaGroup[];
  id?: string;
}) {
  const headingId = `${id}-heading`;
  const showFranklin = groups.includes("web-design");

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="w-full py-12 md:py-20 px-6 md:px-12 bg-[#E8E1CF] border-b-4 border-[#0a0a0a] z-10"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4 flex flex-col gap-4 text-left">
          <span className="text-[#B5330E] font-bold text-xs uppercase tracking-widest font-inter">
            Areas we serve
          </span>
          <h2
            id={headingId}
            className="font-anton text-4xl md:text-5xl uppercase leading-[0.95] text-[#0a0a0a]"
          >
            West Georgia, from Villa Rica.
          </h2>
          <p className="font-inter text-sm md:text-base text-[#0a0a0a]/75 leading-relaxed">
            {introFor(groups)}
          </p>
          {showFranklin ? (
            <p className="font-inter text-sm text-[#0a0a0a]/75 leading-relaxed">
              Middle Tennessee is a separate page:{" "}
              <Link
                href={FRANKLIN_WEB_DESIGN.href}
                className="text-[#B5330E] font-bold underline decoration-[#B5330E]/40 hover:decoration-[#B5330E]"
              >
                {FRANKLIN_WEB_DESIGN.label}
              </Link>
              . {FRANKLIN_WEB_DESIGN.note}
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-10">
          {groups.map((key) => {
            const group = GROUPS[key];
            return (
              <div key={key}>
                <h3 className="font-anton text-xl md:text-2xl uppercase tracking-wide text-[#0a0a0a] mb-4">
                  {group.title}
                </h3>
                <ul
                  className={`grid grid-cols-1 gap-4 ${
                    group.links.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"
                  }`}
                >
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={cardClass}>
                        <span className="font-anton text-lg md:text-xl uppercase leading-tight text-[#0a0a0a]">
                          {link.label}
                        </span>
                        <span className="font-inter text-sm text-[#3a3a3a] leading-relaxed group-hover:text-[#0a0a0a]">
                          {link.note}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const footerLinkClass =
  "font-inter text-sm text-[#F2EBDA]/80 hover:text-[#F5C842] transition-colors";

/**
 * Compact sitewide list. Sentence-case anchors, not a wall of keyword chips.
 * Used by the global footer and the homepage footer (the homepage does not
 * render the global footer).
 */
export function AreasFooterLinks() {
  return (
    <nav
      aria-label="Areas we serve"
      className="col-span-1 md:col-span-12 mt-2 pt-8 border-t border-[#F2EBDA]/15"
    >
      <h4 className="font-anton text-sm uppercase tracking-[0.18em] text-[#F5C842] mb-5">
        Areas we serve
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#F2EBDA]/40 mb-2">
            Web design
          </p>
          <ul className="flex flex-col gap-1.5">
            {WEB_DESIGN_CITY_PAGES.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={FRANKLIN_WEB_DESIGN.href} className={footerLinkClass}>
                {FRANKLIN_WEB_DESIGN.label}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#F2EBDA]/40 mb-2">
            Digital marketing
          </p>
          <ul className="flex flex-col gap-1.5">
            {DIGITAL_MARKETING_CITY_PAGES.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
