import type { Metadata } from "next";

export type WebDesignFaq = { q: string; a: string };

export type WebDesignCity = {
  /** "Carrollton" */
  name: string;
  /** "carrollton" — proposal-free slug used in ids only */
  slug: string;
  path: string;
  county: string;
  /** Schema area, e.g. "Carroll County, Georgia" */
  areaName: string;
  eyebrow: string;
  /** First local section heading */
  localHeading: string;
  lead: string;
  paragraphs: string[];
  /** What this city's build emphasizes. Unique per page. */
  includes: { title: string; body: string }[];
  neighborhoods: string[];
  neighborhoodIntro: string;
  faqs: WebDesignFaq[];
  digitalMarketingHref: string;
  digitalMarketingLabel: string;
  nearby: { label: string; href: string }[];
};

const CARE =
  "Edits are requested by emailing howdy@creativecowboys.co. The $30 a month covers hosting, security, backups, updates, and those edits.";

export const carrolltonWebDesign: WebDesignCity = {
  name: "Carrollton",
  slug: "carrollton",
  path: "/web-design-carrollton-ga",
  county: "Carroll County",
  areaName: "Carroll County, Georgia",
  eyebrow: "Carroll County · about 15 minutes from our Villa Rica office",
  localHeading: "A Carrollton website has a different job than a statewide template.",
  lead: "Web design in Carrollton, GA for businesses that have to win a local search, not just look finished. Creative Cowboys is in Villa Rica, about 15 minutes down the road, and we will meet you in town.",
  paragraphs: [
    "Carrollton is the Carroll County seat, and it is a crowded small-business market. The University of West Georgia puts more than 9,000 students in town. Tanner Health System is one of the region's largest employers. Downtown still draws people to Adamson Square. A website that could belong to any Georgia city will not hold up next to that.",
    "We build the site around how Carrollton customers actually look. A contractor covering East Carrollton and Lake Carroll needs those places named. A shop in the Maple Street district needs a page that sounds like Maple Street, not a stock welcome line. A clinic or professional firm near the university and Tanner needs a clear next step, because a lot of that traffic is on a phone between appointments.",
    `You work with Josh and Dave — the people doing the work — not a salesperson who hands the project off. The website build is a one-time $497, plus $30 a month for hosting, security, backups, updates, and edits. ${CARE} Google Business Profile local SEO is separate: $297 a month on a 12-month agreement. Month-to-month local SEO is $497. The site is not included in that plan.`,
  ],
  includes: [
    {
      title: "Carrollton on the page, not in the footer.",
      body: "Titles, headings, and body copy name Carrollton and the neighborhoods you actually serve, so the page matches the search.",
    },
    {
      title: "Service areas you can drive.",
      body: "Adamson Square, the university district, East Carrollton and Lake Carroll, Maple Street, west and south Carrollton — included only where you work.",
    },
    {
      title: "A next step on a phone.",
      body: "Click-to-call and a short form. Campus, Tanner, and downtown traffic is usually not sitting at a desktop.",
    },
    {
      title: "Care after launch.",
      body: "Hosting, security, backups, updates, and edits stay on the $30 a month plan. Email the change to howdy@creativecowboys.co.",
    },
  ],
  neighborhoods: [
    "Downtown & Adamson Square",
    "University District",
    "East Carrollton & Lake Carroll",
    "South of Maple",
    "West Carrollton",
    "Maple Street District",
    "Bowdon",
    "Temple",
    "Whitesburg",
    "Mount Zion",
    "Roopville",
  ],
  neighborhoodIntro:
    "Carroll County is not one search. We write for the parts of Carrollton and the county you cover, and we leave the rest off the site.",
  faqs: [
    {
      q: "How much does web design in Carrollton, GA cost?",
      a: "A Carrollton website is a one-time $497 build, plus $30 a month for hosting, security, backups, updates, and edits. Google Business Profile local SEO is $297 a month on a 12-month agreement, or $497 a month without that agreement. The website is billed separately from local SEO. Send edits to howdy@creativecowboys.co.",
    },
    {
      q: "Do you meet Carrollton clients in person?",
      a: "Yes. Creative Cowboys is based at 222 West Montgomery St in Villa Rica, about 15 minutes from Carrollton, and we work across Carroll County. We will meet you in town.",
    },
    {
      q: "Can you rebuild a Carrollton site that is already on Wix, Squarespace, or GoDaddy?",
      a: "Yes. We look at what already earns traffic, keep what is worth keeping, and rebuild the rest so the site can speak to Carrollton searches instead of a generic template.",
    },
    {
      q: "Will the site mention Carrollton neighborhoods?",
      a: "When you serve them. Pages can cover Adamson Square, the university district, East Carrollton and Lake Carroll, and the Maple Street district. We do not add a neighborhood you do not work in.",
    },
    {
      q: "How do I request a change after the Carrollton site launches?",
      a: "Email howdy@creativecowboys.co. Hosting, security, backups, updates, and edits are what the $30 a month is for.",
    },
  ],
  digitalMarketingHref: "/digital-marketing-carrollton-ga",
  digitalMarketingLabel: "digital marketing in Carrollton, GA",
  nearby: [
    { label: "Web design Villa Rica, GA", href: "/web-design-villa-rica-ga" },
    { label: "Web design Douglasville, GA", href: "/web-design-douglasville-ga" },
  ],
};

export const villaRicaWebDesign: WebDesignCity = {
  name: "Villa Rica",
  slug: "villa-rica",
  path: "/web-design-villa-rica-ga",
  county: "Carroll County",
  areaName: "Carroll County, Georgia",
  eyebrow: "Headquarters · 222 West Montgomery St, downtown Villa Rica",
  localHeading: "Villa Rica web design, written from the town on the county line.",
  lead: "Web design in Villa Rica, GA from the agency headquartered downtown. Creative Cowboys is at 222 West Montgomery St. This is the home market, not a city we claim from somewhere else.",
  paragraphs: [
    "Villa Rica sits on I-20 between Atlanta and Carrollton, straddling the Carroll and Douglas County line. New rooftops keep showing up around Mirror Lake and Fairfield Plantation. Shops and restaurants around historic downtown and The Mill serve a different customer than the contractors and professional firms along Highway 61 and Interstate West. Those buyers do not type the same search.",
    "A Villa Rica website has to say which of those places you actually cover. Downtown and The Mill are not the same job as Gold City, Pine Mountain, Temple, or Winston. We write pages for the neighborhoods you serve and leave off the ones you do not. We are a short drive from a lot of the businesses on this page, so you can sit down with us instead of onboarding through a ticket queue.",
    `Josh and Dave do the work. The website is $497 once, plus $30 a month for hosting, security, backups, updates, and edits. ${CARE} If you want the Google Business Profile worked as well, local SEO is $297 a month on a 12-month agreement. That plan does not include the website. Without the agreement, local SEO is $497 a month.`,
  ],
  includes: [
    {
      title: "Written in Villa Rica, for Villa Rica.",
      body: "The office is downtown at 222 West Montgomery St. The copy is about this town, not a swapped city name on a regional template.",
    },
    {
      title: "Both sides of the county line, when that is real.",
      body: "Villa Rica touches Carroll and Douglas counties. Mirror Lake, Fairfield Plantation, Highway 61, Interstate West, Temple, and Winston go on the site only if you work there.",
    },
    {
      title: "Readable in a minute.",
      body: "What you do, where you work, and how to reach you — ahead of a long explanation of the agency.",
    },
    {
      title: "Edits by email.",
      body: "The $30 a month plan is hosting, security, backups, updates, and edits. The address for a change is howdy@creativecowboys.co.",
    },
  ],
  neighborhoods: [
    "Downtown & Main Street",
    "The Mill",
    "Mirror Lake",
    "Fairfield Plantation",
    "Gold City",
    "Interstate West",
    "Pine Mountain",
    "Highway 61 Corridor",
    "Temple",
    "Winston",
  ],
  neighborhoodIntro:
    "Villa Rica's searches split between downtown, the lake communities, and the highway corridors. The site should match the ones you serve.",
  faqs: [
    {
      q: "How much does web design in Villa Rica, GA cost?",
      a: "The website build is $497 one time, plus $30 a month for hosting, security, backups, updates, and edits. Google Business Profile local SEO is $297 a month on a 12-month agreement and does not include the website. Month-to-month local SEO is $497. Email edits to howdy@creativecowboys.co.",
    },
    {
      q: "Are you actually based in Villa Rica?",
      a: "Yes. Creative Cowboys is headquartered at 222 West Montgomery St in downtown Villa Rica. We are neighbors, and we will meet you in person.",
    },
    {
      q: "What does the $30 a month cover?",
      a: "Hosting, security, backups, updates, and edits for a site we build. It is part of having the website with us. Send the change to howdy@creativecowboys.co.",
    },
    {
      q: "Does $297 a month include the website?",
      a: "No. $297 a month is Google Business Profile local SEO on a 12-month agreement. The Villa Rica website is a separate one-time $497 build, plus $30 a month for care. Month-to-month local SEO is $497.",
    },
    {
      q: "Can a Villa Rica site cover both Carroll and Douglas County?",
      a: "Yes, when that is where you work. We write for downtown and The Mill, Mirror Lake, Fairfield Plantation, Highway 61, and the nearby towns you serve. We do not invent a service area.",
    },
  ],
  digitalMarketingHref: "/digital-marketing-villa-rica-ga",
  digitalMarketingLabel: "digital marketing in Villa Rica, GA",
  nearby: [
    { label: "Web design Carrollton, GA", href: "/web-design-carrollton-ga" },
    { label: "Web design Douglasville, GA", href: "/web-design-douglasville-ga" },
  ],
};

export const douglasvilleWebDesign: WebDesignCity = {
  name: "Douglasville",
  slug: "douglasville",
  path: "/web-design-douglasville-ga",
  county: "Douglas County",
  areaName: "Douglas County, Georgia",
  eyebrow: "Douglas County · about 20 minutes from Villa Rica",
  localHeading: "Douglasville web design has to beat a bigger market.",
  lead: "Web design in Douglasville, GA for businesses competing along I-20, not for a template with the city name swapped in. Our office is about 20 minutes west, in Villa Rica.",
  paragraphs: [
    "Douglasville is the Douglas County seat and a west-metro gateway on I-20. Arbor Place, the Chapel Hill corridor, and WellStar Douglas Hospital pull customers from across the west side of Atlanta. That is useful for a local business and hard for a website. You are not only next to the shop down the street. You are next to larger brands bidding on the same searches.",
    "We write Douglasville pages for the places people name: downtown and O'Neal Plaza, Arbor Place, Chapel Hill, Lithia Springs, Winston, and the rest of Douglas County when that is your real service area. The page has to make the service, the town, and the next step obvious on a phone. Published Creative Cowboys work in Douglasville includes John B. Jackson & Associates and McKinley Roofing. Those projects are on our results page. They are not a promise that a new site will produce the same outcome.",
    `The build is $497 once. Hosting, security, backups, updates, and edits are $30 a month. ${CARE} Google Business Profile local SEO is $297 a month on a 12-month agreement, billed separately from the website. Month-to-month local SEO is $497. If you want ads and Map Pack work on top of the site, that conversation starts on the Douglasville digital marketing page.`,
  ],
  includes: [
    {
      title: "Douglasville, not generic Atlanta.",
      body: "The page is about Douglas County: I-20, Arbor Place, Chapel Hill, downtown, O'Neal Plaza, and Lithia Springs when you serve them.",
    },
    {
      title: "Service areas written out.",
      body: "A Douglasville search and a Lithia Springs search are different. The site says which ones you cover.",
    },
    {
      title: "Proof stays honest.",
      body: "We have published Douglasville work. We will show you that work. We will not paste another company's result onto your estimate.",
    },
    {
      title: "Maintenance with a real inbox.",
      body: "After launch, hosting, security, backups, updates, and edits are $30 a month. Email howdy@creativecowboys.co.",
    },
  ],
  neighborhoods: [
    "Downtown & O'Neal Plaza",
    "Arbor Place",
    "Chapel Hill",
    "Lithia Springs",
    "Winston",
    "Bill Arp",
    "Fairplay",
    "Austell",
    "Sweetwater",
    "Douglas County",
  ],
  neighborhoodIntro:
    "Douglas County traffic does not all start in downtown Douglasville. The site should name the corridors and towns you actually cover.",
  faqs: [
    {
      q: "How much does web design in Douglasville, GA cost?",
      a: "The Douglasville website is $497 one time, plus $30 a month for hosting, security, backups, updates, and edits. Google Business Profile local SEO is $297 a month on a 12-month agreement and is not a website plan. Month-to-month local SEO is $497. Edits go to howdy@creativecowboys.co.",
    },
    {
      q: "How far is your office from Douglasville?",
      a: "About 20 minutes west, at 222 West Montgomery St in Villa Rica. We are a West Georgia shop, and we will meet you in Douglasville.",
    },
    {
      q: "Do you already build for Douglasville businesses?",
      a: "Yes. Published work here includes John B. Jackson & Associates and McKinley Roofing. Those results are specific to those businesses. A new Douglasville site still has to fit the company it is for.",
    },
    {
      q: "Can the site target Douglasville and nearby towns?",
      a: "Yes, for towns you serve — Chapel Hill, Lithia Springs, Winston, and the rest of Douglas County among them. The website is the foundation. Map Pack rankings are local SEO, covered on our SEO page and the Douglasville digital marketing page.",
    },
    {
      q: "Who do I email when a Douglasville page needs a change?",
      a: "howdy@creativecowboys.co. That is the edits channel for the $30 a month plan, which also includes hosting, security, backups, and updates.",
    },
  ],
  digitalMarketingHref: "/digital-marketing-douglasville-ga",
  digitalMarketingLabel: "digital marketing in Douglasville, GA",
  nearby: [
    { label: "Web design Carrollton, GA", href: "/web-design-carrollton-ga" },
    { label: "Web design Villa Rica, GA", href: "/web-design-villa-rica-ga" },
  ],
};

export const WEB_DESIGN_CITIES = [
  carrolltonWebDesign,
  villaRicaWebDesign,
  douglasvilleWebDesign,
] as const;

export function webDesignCityMetadata(city: WebDesignCity): Metadata {
  const title = `Web Design ${city.name}, GA`;
  const description = `Web design ${city.name} GA from Creative Cowboys. A one-time $497 website plus $30/month for hosting, security, backups, updates, and edits — or $297/month Google Business Profile local SEO.`;

  return {
    title,
    description,
    alternates: { canonical: city.path },
    keywords: [
      `web design ${city.name} GA`,
      `web design ${city.name.toLowerCase()} ga`,
      `website design ${city.name} GA`,
      `${city.name} GA web designer`,
      `web design ${city.county}`,
    ],
    openGraph: {
      title: `${title} | Creative Cowboys`,
      description,
      url: `https://www.creativecowboys.co${city.path}`,
      siteName: "Creative Cowboys",
      type: "website",
      images: [
        {
          url: "/Main%20logo%202.png",
          width: 1200,
          height: 630,
          alt: `Creative Cowboys — Web Design in ${city.name}, GA`,
        },
      ],
    },
  };
}
