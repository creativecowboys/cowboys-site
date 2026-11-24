/**
 * One city landing page. Each lives as JSON in src/content/city-pages/<slug>.json.
 * Writing rules and limits: scripts/city-pages/CONTENT_SPEC.md. Checked by
 * scripts/city-pages/validate.mjs before anything ships.
 */
export type CityPage = {
  /** "dunwoody-ga" (city + state, lowercase, hyphens). Also the file name. */
  slug: string;
  /** "/web-design-dunwoody-ga" */
  path: string;
  city: string;
  /** Two-letter state code, "GA" */
  state: string;
  stateName: string;
  /** "DeKalb County" */
  county: string;
  /** The big city this one sits next to, "Atlanta" */
  metro: string;
  lat: number;
  lon: number;
  population: number;
  /** ISO dates */
  published: string;
  updated: string;

  /** <title> before the " | Creative Cowboys" suffix. 41 characters max. */
  title: string;
  /** 120-160 characters, names the city. */
  metaDescription: string;
  /** Small line above the H1 */
  eyebrow: string;
  /** Opening paragraph under the H1 */
  lead: string;

  local: { heading: string; paragraphs: string[] };
  industries: { heading: string; intro: string; items: { name: string; body: string }[] };
  includes: { title: string; body: string }[];
  areas: { intro: string; places: string[] };
  howWeWork: { heading: string; paragraphs: string[] };
  faqs: { q: string; a: string }[];

  /** Where the local facts came from. Not shown on the page; used in review. */
  sources: string[];
};
