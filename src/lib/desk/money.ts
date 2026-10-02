import { CATALOG } from "@/lib/packages/catalog";
import { PACKAGES, isGiveawayWinner } from "@/lib/onboarding/config";
import { CLIENT_PACKAGES } from "@/lib/clients/config";

// "Monthly $" (Onboarding) and "MRR" (Clients) were Monday formula columns. On GoHighLevel there is no
// formula, so the list price is worked out here from the package labels on the contact plus Custom $/mo.
// The numbers come from the package catalog (src/lib/packages/catalog.ts) — one price list for the
// package builder and the desk — and match the two Monday formulas label for label (unit-tested):
//   Local Growth 497 · Local Growth — First Year $297 → 297 · Max Growth 1497 · Expanded Reach 200 ·
//   Social Ads 300 / 600 / 1,200 · Google Ads 500 / 1,000 / 1,500 · CRM 97 · AI Chat only 47 · + Custom $/mo.
// Labels with no fixed price (AI SEO, the two "Custom" ads tiers, Growth Strategy Session — a one-time fee,
// Website hosting / care, Custom retainer) count 0 here and are carried by Custom $/mo, exactly as on Monday.
// A Giveaway Winner is never billed, so their monthly is 0 whatever else is ticked.
// Pure and client-safe (no node imports).

/** Every package label the desk knows, byte-for-byte as on the two Monday dropdowns (Onboarding first, then the Clients-only ones). */
export const ALL_PACKAGE_LABELS: readonly string[] = [...PACKAGES, ...CLIENT_PACKAGES.filter((p) => !(PACKAGES as readonly string[]).includes(p))];

const LABEL_TO_CATALOG: Record<string, { key: string; tier?: string; term?: string }> = {
  "Local Growth": { key: "local-growth", term: "month-to-month" },
  "Local Growth — First Year $297": { key: "local-growth", term: "12-month" },
  "Max Growth": { key: "max-growth" },
  "Expanded Reach (+5 cities)": { key: "expanded-reach" },
  "Social Ads $300": { key: "social-ads", tier: "300" },
  "Social Ads $600": { key: "social-ads", tier: "600" },
  "Social Ads $1,200": { key: "social-ads", tier: "1200" },
  "Google Ads $500": { key: "google-ads", tier: "500" },
  "Google Ads $1,000": { key: "google-ads", tier: "1000" },
  "Google Ads $1,500": { key: "google-ads", tier: "1500" },
  "CRM (incl. AI Chat)": { key: "crm" },
  "AI Chat only": { key: "ai-chat" },
};

/** List price of one package label per month; 0 for custom-quoted, one-time and unknown labels. */
export function listPrice(label: string): number {
  const ref = LABEL_TO_CATALOG[label.trim()];
  if (!ref) return 0;
  const item = CATALOG.find((c) => c.key === ref.key);
  if (!item) return 0;
  if (ref.tier) return item.tiers?.find((t) => t.key === ref.tier)?.amount ?? 0;
  if (ref.term) return item.terms?.find((t) => t.key === ref.term)?.amount ?? 0;
  return item.amount ?? 0;
}

/** Sum of the list prices plus Custom $/mo. Giveaway winners are $0. */
export function monthlyList(packages: readonly string[], customMonthly: number | string | null | undefined): number {
  if (isGiveawayWinner(packages)) return 0;
  const custom = Number(customMonthly);
  const total = packages.reduce((sum, p) => sum + listPrice(p), 0) + (Number.isFinite(custom) && custom > 0 ? custom : 0);
  return Math.round(total * 100) / 100;
}

/**
 * Package labels out of a comma-joined string. Three labels contain a comma ("Social Ads $1,200",
 * "Google Ads $1,000", "Google Ads $1,500"), so a plain split(",") breaks them — match the known labels
 * first (longest wins) and only fall back to a comma split for a label nobody has listed.
 */
export function splitPackages(text: string | null | undefined, known: readonly string[] = ALL_PACKAGE_LABELS): string[] {
  const out: string[] = [];
  let rest = (text || "").trim();
  const byLength = [...known].sort((a, b) => b.length - a.length);
  while (rest) {
    const hit = byLength.find((l) => rest === l || rest.startsWith(`${l},`));
    if (hit) { out.push(hit); rest = rest.slice(hit.length).replace(/^,\s*/, ""); continue; }
    const i = rest.indexOf(",");
    const piece = (i < 0 ? rest : rest.slice(0, i)).trim();
    if (piece) out.push(piece);
    rest = i < 0 ? "" : rest.slice(i + 1).trim();
  }
  return [...new Set(out)];
}
export const joinPackages = (packages: readonly string[]): string => packages.join(", ");
