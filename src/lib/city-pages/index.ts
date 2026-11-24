import type { Metadata } from "next";
import { CITY_PAGES } from "@/content/city-pages";
import { WEB_DESIGN_CITIES } from "@/lib/web-design-cities";
import { PROOF_CLIENTS, type ProofClient } from "./clients";
import type { CityPage } from "./types";

export type { CityPage } from "./types";

/** Villa Rica office, for honest "how far are you" copy. */
export const HQ = { lat: 33.7327, lon: -84.9182 };

export function milesBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function allCityPages(): CityPage[] {
  return CITY_PAGES;
}

export function getCityPage(slug: string): CityPage {
  const page = CITY_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`No city page content for "${slug}"`);
  return page;
}

/** Every city we have a page for, including the hand-built West Georgia pages. */
export type CityLink = { city: string; state: string; stateName: string; href: string; lat: number; lon: number; metro?: string };

const LEGACY_LINKS: CityLink[] = [
  ...WEB_DESIGN_CITIES.map((c) => ({
    city: c.name,
    state: "GA",
    stateName: "Georgia",
    href: c.path,
    metro: "West Georgia",
    ...({
      carrollton: { lat: 33.5801, lon: -85.0766 },
      "villa-rica": { lat: 33.7327, lon: -84.9182 },
      douglasville: { lat: 33.7515, lon: -84.7477 },
    } as Record<string, { lat: number; lon: number }>)[c.slug],
  })),
  { city: "Franklin", state: "TN", stateName: "Tennessee", href: "/franklin-tn/web-design", lat: 35.9251, lon: -86.8689, metro: "Nashville" },
];

export function allCityLinks(): CityLink[] {
  return [
    ...LEGACY_LINKS,
    ...CITY_PAGES.map((p) => ({
      city: p.city,
      state: p.state,
      stateName: p.stateName,
      href: p.path,
      lat: p.lat,
      lon: p.lon,
      metro: p.metro,
    })),
  ];
}

/** The closest other city pages, for the "nearby" block. */
export function nearbyLinks(page: CityPage, count = 6): (CityLink & { miles: number })[] {
  return allCityLinks()
    .filter((l) => l.href !== page.path)
    .map((l) => ({ ...l, miles: milesBetween(page, l) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, count);
}

/**
 * Clients to show as proof: anyone within 75 miles first, then the featured
 * case studies to fill out three cards.
 */
export function proofFor(page: CityPage): { local: boolean; clients: (ProofClient & { miles: number })[] } {
  const withMiles = PROOF_CLIENTS.map((c) => ({ ...c, miles: milesBetween(page, c) }));
  const near = withMiles.filter((c) => c.miles <= 75).sort((a, b) => a.miles - b.miles);
  const featured = withMiles
    .filter((c) => c.featuredRank && !near.includes(c))
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  const clients = [...near.slice(0, 3), ...featured].slice(0, 3);
  return { local: near.length > 0, clients };
}

export function cityPageMetadata(page: CityPage): Metadata {
  const url = `https://www.creativecowboys.co${page.path}`;
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: page.path },
    openGraph: {
      title: `${page.title} | Creative Cowboys`,
      description: page.metaDescription,
      url,
      siteName: "Creative Cowboys",
      type: "website",
      locale: "en_US",
      images: [{ url: "/Main%20logo%202.png", width: 1200, height: 630, alt: `Creative Cowboys web design in ${page.city}, ${page.state}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | Creative Cowboys`,
      description: page.metaDescription,
    },
    other: {
      "geo.region": `US-${page.state}`,
      "geo.placename": `${page.city}, ${page.state}`,
      "geo.position": `${page.lat};${page.lon}`,
      ICBM: `${page.lat}, ${page.lon}`,
    },
  };
}
