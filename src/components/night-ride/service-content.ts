/**
 * Proof shared by the Night Ride service pages. Only sourced figures go here.
 * - JBJ: Creative Cowboys case study (Josh confirmed the 22 #1 spots and the revenue, Nov 2026).
 * - Harmonic: Ryan Coffey's Google review.
 * - McKinley: what we built. No traffic figure, because the old "+1000%" had no source.
 */
export type ResultStat = { label: string; value: string; from?: string };
export type ServiceResult = {
  pill: string;
  name: string;
  body: string;
  stats?: ResultStat[];
  points?: string[];
  source?: string;
};

export const RESULT_JBJ: ServiceResult = {
  pill: "SEO & Google Ads",
  name: "John B. Jackson & Assoc.",
  body: "Personal injury firm in Douglasville. We rebuilt the site, ran local SEO across the Southeast and built lead funnels with phone-call tracking.",
  stats: [
    { label: "#1 organic spots on Google", from: "0", value: "22" },
    { label: "Revenue added", value: "+$500k" },
    { label: "Time to get there", value: "12 months" },
  ],
  source: "Source: Creative Cowboys case study",
};

export const RESULT_HARMONIC: ServiceResult = {
  pill: "Web design & SEO",
  name: "Harmonic Production",
  body: "Concert AV outfit in Cleveland, TN. Full website rebuild, a move to a new domain and a localized SEO plan.",
  stats: [
    { label: "Customer engagement", value: "~300% ↑" },
    { label: "Customer retention", value: "200% ↑" },
    { label: "Downtime during domain move", value: "Zero" },
  ],
  source: "Source: client testimonial, Ryan Coffey",
};

export const RESULT_MCKINLEY: ServiceResult = {
  pill: "Web & local SEO",
  name: "McKinley Roofing",
  body: "Roofing and restoration company in Douglasville, GA. A new site built around the neighborhoods they work in.",
  points: [
    "Service-area landing pages for each neighborhood",
    "Google Business Profile work so they show up on the map",
    "Storm-damage intake forms that feed straight into insurance leads",
  ],
};
