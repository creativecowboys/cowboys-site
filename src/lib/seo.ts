/**
 * Canonical SEO / structured-data constants.
 *
 * Everything here was previously copy-pasted inline into each page's JSON-LD
 * block, which is exactly how the site ended up with a service area that said
 * one thing on /seo and another on /ppc. Import from here instead.
 *
 * The NAP values must stay byte-identical to the Google Business Profile and
 * every directory listing. AI engines resolve a business entity from
 * cross-source consensus — "St" vs "Street" is enough to weaken the match.
 * See Projects/Creative Cowboys/NAP-Cleanup-Checklist.md.
 */

export const SITE_URL = "https://www.creativecowboys.co";

export const NAP = {
  name: "Creative Cowboys Media",
  alternateName: "Creative Cowboys",
  streetAddress: "222 West Montgomery St",
  addressLocality: "Villa Rica",
  addressRegion: "GA",
  postalCode: "30180",
  addressCountry: "US",
  telephone: "+1-470-243-7517",
  telephoneDisplay: "(470) 243-7517",
  email: "howdy@creativecowboys.co",
  latitude: 33.7327,
  longitude: -84.9182,
} as const;

export const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: NAP.streetAddress,
  addressLocality: NAP.addressLocality,
  addressRegion: NAP.addressRegion,
  postalCode: NAP.postalCode,
  addressCountry: NAP.addressCountry,
} as const;

export const SOCIAL_PROFILES = [
  "https://www.facebook.com/creativecowboys",
  "https://www.instagram.com/creativecowboysmedia",
] as const;

/**
 * Service area.
 *
 * Villa Rica is the only physical office, so this is genuinely "where we take
 * work," not a claim of presence. Local-pack ranking is proximity-based and
 * areaServed does not change that — these entries exist so organic and AI
 * results understand the real footprint.
 *
 * Home market first (where the local pack is actually winnable), then the
 * expansion metros in the order the SEO plan prioritizes them.
 */
export const SERVICE_AREA = [
  // Home market — West Georgia
  { "@type": "City", name: "Villa Rica" },
  { "@type": "City", name: "Carrollton" },
  { "@type": "City", name: "Douglasville" },
  { "@type": "City", name: "Newnan" },
  { "@type": "City", name: "Bremen" },
  { "@type": "City", name: "Dallas" },
  { "@type": "AdministrativeArea", name: "West Georgia" },

  // Priority expansion metros
  { "@type": "City", name: "Atlanta" },
  { "@type": "City", name: "Birmingham" },
  { "@type": "City", name: "Chattanooga" },
  { "@type": "City", name: "Columbus" },
  { "@type": "City", name: "Macon" },
  { "@type": "City", name: "Huntsville" },
  { "@type": "City", name: "Augusta" },
  { "@type": "City", name: "Greenville" },

  // Middle Tennessee — Franklin office announced, not yet open
  { "@type": "City", name: "Franklin" },
  { "@type": "City", name: "Nashville" },
  { "@type": "AdministrativeArea", name: "Middle Tennessee" },

  // Regional
  { "@type": "State", name: "Georgia" },
  { "@type": "State", name: "Alabama" },
  { "@type": "State", name: "Tennessee" },
  { "@type": "State", name: "South Carolina" },
  { "@type": "AdministrativeArea", name: "Southeastern United States" },
] as const;

/**
 * The provider block reused inside each page's `Service` schema. Kept as a
 * function so callers get a fresh object and can't mutate shared state.
 */
export function providerBlock() {
  return {
    "@type": "LocalBusiness",
    name: NAP.name,
    url: SITE_URL,
    telephone: NAP.telephone,
    email: NAP.email,
    address: { ...POSTAL_ADDRESS },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NAP.latitude,
      longitude: NAP.longitude,
    },
  };
}

/** Standard two-level breadcrumb: Home → this page. */
export function breadcrumb(name: string, path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${SITE_URL}${path}`,
      },
    ],
  };
}

/**
 * Builds the `Service` node used on each service page.
 *
 * `serviceType` should read like the thing a buyer would search for, not an
 * internal label — it is one of the strings AI engines lift when describing
 * what the business does.
 */
export function serviceSchema(opts: {
  name: string;
  serviceType: string;
  description: string;
  path: string;
}) {
  return {
    "@type": "Service",
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: providerBlock(),
    areaServed: SERVICE_AREA.map((a) => ({ ...a })),
  };
}

/** Wraps nodes into a single @graph document, the form all pages emit. */
export function graph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
