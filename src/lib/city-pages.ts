/**
 * Visible internal links to city landing pages.
 *
 * Anchor text is the phrase a person would use. Notes stay inside what the
 * city pages already say: one office in Villa Rica, drive times already
 * published, Franklin announced and not open. Do not add cities here that
 * do not have a page.
 */

export type CityPageLink = {
  href: string;
  /** Standalone anchor, e.g. "Web design in Carrollton, GA". */
  label: string;
  /** One factual sentence. No invented offices, reviews, or results. */
  note: string;
};

export const WEB_DESIGN_CITY_PAGES: CityPageLink[] = [
  {
    href: "/web-design-villa-rica-ga",
    label: "Web design in Villa Rica, GA",
    note: "Our hometown. The office is downtown at 222 West Montgomery St — The Mill, Mirror Lake, and the Carroll–Douglas county line.",
  },
  {
    href: "/web-design-carrollton-ga",
    label: "Web design in Carrollton, GA",
    note: "Carroll County seat, about 15 minutes from the Villa Rica office.",
  },
  {
    href: "/web-design-douglasville-ga",
    label: "Web design in Douglasville, GA",
    note: "Douglas County on I-20, about 20 minutes from the Villa Rica office.",
  },
];

export const DIGITAL_MARKETING_CITY_PAGES: CityPageLink[] = [
  {
    href: "/digital-marketing-villa-rica-ga",
    label: "Digital marketing in Villa Rica, GA",
    note: "Local SEO, ads, and websites from the downtown Villa Rica office.",
  },
  {
    href: "/digital-marketing-carrollton-ga",
    label: "Digital marketing in Carrollton, GA",
    note: "The same work for Carrollton businesses, about 15 minutes from the office.",
  },
  {
    href: "/digital-marketing-douglasville-ga",
    label: "Digital marketing in Douglasville, GA",
    note: "The same work for Douglasville businesses, about 20 minutes from the office.",
  },
  {
    href: "/digital-marketing-newnan-ga",
    label: "Digital marketing in Newnan, GA",
    note: "Coweta County, served from Villa Rica. There is no Newnan office.",
  },
];

/** Separate market. The office is announced on the site and is not open. */
export const FRANKLIN_WEB_DESIGN: CityPageLink = {
  href: "/franklin-tn/web-design",
  label: "Web design in Franklin, TN",
  note: "The Franklin office is coming soon.",
};

export type CityAreaGroup = "web-design" | "digital-marketing";
