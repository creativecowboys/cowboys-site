/**
 * Clients we can name as proof on city pages (Josh, Nov 18 2026: name a client
 * near the city when there is one; otherwise show other clients as social proof).
 *
 * Only live, active clients. "work" must be true and specific; leave a client
 * out rather than guess what we did for them.
 */
export type ProofClient = {
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  industry: string;
  work: string;
  url?: string;
  /** Screenshot of the site we built, in /public/work/. Shown on the proof card when set. */
  screenshot?: string;
  /** Shown when nothing is near the city. Lower = shown first. */
  featuredRank?: number;
};

export const PROOF_CLIENTS: ProofClient[] = [
  {
    name: "John B. Jackson Law",
    city: "Douglasville",
    state: "GA",
    lat: 33.7515,
    lon: -84.7477,
    industry: "Personal injury law",
    work: "SEO, Google Ads, and landing pages. 21 #1 Google rankings on competitive injury searches.",
    url: "https://johnbjacksonlaw.com",
    featuredRank: 1,
  },
  {
    name: "Commercial Insurance Agency",
    city: "Bremen",
    state: "GA",
    lat: 33.7212,
    lon: -85.1455,
    industry: "Commercial insurance",
    work: "Google Ads management with two straight years of positive return on ad spend.",
    url: "https://bremencia.com",
    featuredRank: 2,
  },
  {
    name: "Harmonic Production",
    city: "Cleveland",
    state: "TN",
    lat: 35.1595,
    lon: -84.8766,
    industry: "Live event and AV production",
    work: "Website and social strategy. Engagement up 300% in 90 days.",
    url: "https://harmonicproduction.co",
    featuredRank: 3,
  },
  {
    name: "McKinley Roofing",
    city: "Douglasville",
    state: "GA",
    lat: 33.7515,
    lon: -84.7477,
    industry: "Roofing and restoration",
    work: "Website and local SEO.",
    url: "https://www.mckinleyroofing.net",
    featuredRank: 4,
  },
  {
    name: "Dunwoody Christian Academy",
    city: "Dunwoody",
    state: "GA",
    lat: 33.9462,
    lon: -84.3346,
    industry: "Private Christian school",
    work: "A current Creative Cowboys client.",
    url: "https://dunwoodyca.com",
  },
  {
    name: "Whiten Pools",
    city: "Carrollton",
    state: "GA",
    lat: 33.5801,
    lon: -85.0766,
    industry: "Custom pool builder",
    work: "Website rebuild onto a fast modern platform.",
    url: "https://whiten-pools.com",
  },
  {
    name: "Southeastern PCG",
    city: "Carrollton",
    state: "GA",
    lat: 33.5801,
    lon: -85.0766,
    industry: "Church",
    work: "Website and a mobile app for iPhone and Android.",
    url: "https://southeasternpcg.org",
  },
  {
    name: "CDM Systems",
    city: "Bremen",
    state: "GA",
    lat: 33.7212,
    lon: -85.1455,
    industry: "Network and cabling installation",
    work: "Website and SEO.",
  },
  {
    name: "Truck Parking GA",
    city: "Villa Rica",
    state: "GA",
    lat: 33.7327,
    lon: -84.9182,
    industry: "Truck and trailer parking",
    work: "Website build.",
  },
  {
    name: "Mirror Lake Animal Hospital",
    city: "Villa Rica",
    state: "GA",
    lat: 33.7327,
    lon: -84.9182,
    industry: "Veterinary clinic",
    work: "Local marketing package.",
  },
  {
    name: "Shana Genenbacher, Keller Williams",
    city: "Prattville",
    state: "AL",
    lat: 32.464,
    lon: -86.4597,
    industry: "Real estate",
    work: "Website with lead capture that feeds her CRM.",
    url: "https://shanagenenbacher.com",
  },
  {
    name: "Bela Pilates",
    city: "Plainfield",
    state: "IN",
    lat: 39.7042,
    lon: -86.3994,
    industry: "Pilates studio",
    work: "Website rebuild.",
    url: "https://www.belapilates.com",
  },
  {
    name: "Arctic Law",
    city: "Wasilla",
    state: "AK",
    lat: 61.5814,
    lon: -149.4394,
    industry: "Law firm",
    work: "Website build.",
  },
];
