import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

/**
 * Sitemap, generated from the route tree at build time.
 *
 * This replaces the old hand-maintained `public/sitemap.xml`, which had already
 * drifted out of sync with reality (it still listed `/about` long after that
 * route became a redirect). Walking the filesystem means a new page is in the
 * sitemap the moment it ships, and a deleted page leaves on its own.
 *
 * To keep a route OUT, add it to PRIVATE_SEGMENTS or NOINDEX_ROUTES below.
 */

export const dynamic = "force-static";

const BASE_URL = "https://www.creativecowboys.co";
const APP_DIR = path.join(process.cwd(), "src", "app");

/** Any route whose path contains one of these segments is never public. */
const PRIVATE_SEGMENTS = ["admin", "clients", "proposals", "api"];

/** Individually excluded routes — internal design references and ad landing pages. */
const NOINDEX_ROUTES = new Set([
  "/home2",
  "/home3",
  // Paid-social landing page for the free-website promotion. Kept out of the
  // index so it can't compete with /local-seo; remove when the promo ends.
  "/free-website",
  // Post-giveaway entrant offer + its post-checkout booking page. Reached
  // from email only; remove after the offer closes (Oct 3, 2026).
  "/local-max-offer",
  "/local-max-offer/welcome",
]);

/**
 * Priority and change frequency by route. Anything unlisted falls back to
 * DEFAULT_RULE, so forgetting to add an entry costs sensible defaults, not a
 * missing page.
 */
const DEFAULT_RULE = { priority: 0.6, changeFrequency: "monthly" as const };

const ROUTE_RULES: Record<
  string,
  { priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }
> = {
  "/": { priority: 1.0, changeFrequency: "weekly" },
  "/services": { priority: 0.9, changeFrequency: "monthly" },
  "/seo": { priority: 0.9, changeFrequency: "monthly" },
  "/ppc": { priority: 0.9, changeFrequency: "monthly" },
  "/web-design": { priority: 0.9, changeFrequency: "monthly" },
  "/about": { priority: 0.8, changeFrequency: "monthly" },
  "/contact": { priority: 0.8, changeFrequency: "monthly" },
  "/results": { priority: 0.8, changeFrequency: "monthly" },
  "/pricing": { priority: 0.8, changeFrequency: "monthly" },
  "/blog": { priority: 0.8, changeFrequency: "weekly" },
  "/social-media-ads": { priority: 0.8, changeFrequency: "monthly" },
  "/brand-strategy": { priority: 0.8, changeFrequency: "monthly" },
  "/media-creation": { priority: 0.7, changeFrequency: "monthly" },
  "/ai": { priority: 0.8, changeFrequency: "monthly" },
};

/** Legal / compliance pages: real pages, but they shouldn't compete for crawl budget. */
const LOW_PRIORITY_PREFIXES = ["/privacy-policy", "/sms-", "/legal/"];

type Discovered = { route: string; lastModified: Date };

function walk(dir: string, segments: string[] = []): Discovered[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const found: Discovered[] = [];

  // A `page.tsx` in this directory means these segments form a real route.
  const pageFile = entries.find(
    (e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name),
  );
  if (pageFile) {
    const route = "/" + segments.join("/");
    found.push({
      route: route === "/" ? "/" : route,
      lastModified: fs.statSync(path.join(dir, pageFile.name)).mtime,
    });
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const name = entry.name;

    // Skip private folders (_foo), parallel routes (@foo), and dynamic
    // segments ([slug]) — dynamic routes can't be enumerated from disk.
    if (name.startsWith("_") || name.startsWith("@") || name.startsWith("[")) {
      continue;
    }

    // Route groups — (marketing) — are organizational only and add no URL segment.
    const isRouteGroup = name.startsWith("(") && name.endsWith(")");
    const nextSegments = isRouteGroup ? segments : [...segments, name];

    found.push(...walk(path.join(dir, name), nextSegments));
  }

  return found;
}

function isPublic(route: string): boolean {
  if (NOINDEX_ROUTES.has(route)) return false;
  const segments = route.split("/").filter(Boolean);
  return !segments.some((s) => PRIVATE_SEGMENTS.includes(s));
}

function ruleFor(route: string) {
  if (ROUTE_RULES[route]) return ROUTE_RULES[route];
  if (LOW_PRIORITY_PREFIXES.some((p) => route.startsWith(p))) {
    return { priority: 0.3, changeFrequency: "yearly" as const };
  }
  if (route.startsWith("/blog/")) {
    return { priority: 0.7, changeFrequency: "monthly" as const };
  }
  return DEFAULT_RULE;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return walk(APP_DIR)
    .filter(({ route }) => isPublic(route))
    .sort((a, b) => a.route.localeCompare(b.route))
    .map(({ route, lastModified }) => {
      const { priority, changeFrequency } = ruleFor(route);
      return {
        url: route === "/" ? `${BASE_URL}/` : `${BASE_URL}${route}`,
        lastModified,
        changeFrequency,
        priority,
      };
    });
}
