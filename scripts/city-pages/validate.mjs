#!/usr/bin/env node
/**
 * Quality gate for city landing pages. Nothing ships unless this passes.
 * Run: node scripts/city-pages/validate.mjs            (all pages)
 *      node scripts/city-pages/validate.mjs dunwoody-ga (just these, still compared against all)
 * Rules: scripts/city-pages/CONTENT_SPEC.md
 */
import fs from "node:fs";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "src/content/city-pages");
const only = new Set(process.argv.slice(2));
const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json")).sort();
const pages = files.map((f) => ({ file: f, data: JSON.parse(fs.readFileSync(path.join(CONTENT, f), "utf8")) }));

const ALLOWED_DOLLARS = new Set(["$297", "$3,500"]);
const BANNED = [
  // AI-writing tells and filler (see the humanizer skill)
  /\bin today'?s (digital|competitive|fast-paced)/i, /\blook no further\b/i, /\belevate\b/i, /\bunlock\b/i,
  /\bseamless(ly)?\b/i, /\bcutting[- ]edge\b/i, /\bgame[- ]changer\b/i, /\bnestled\b/i, /\bvibrant\b/i,
  /\bbustling\b/i, /\bboasts\b/i, /\btapestry\b/i, /\btestament to\b/i, /\bdelve\b/i, /\brobust\b/i,
  /\bleverage\b/i, /\bempower/i, /\bthriving\b/i, /\bin conclusion\b/i, /\bnot just\b[^.]{0,60}\bbut\b/i,
  /\bwhether you'?re\b/i, /\bunparalleled\b/i, /\bstate[- ]of[- ]the[- ]art\b/i, /\bworld[- ]class\b/i,
  /\bhidden gem\b/i, /\bone[- ]stop[- ]shop\b/i, /\bsynerg/i, /\bholistic\b/i,
  // Claims we can't make
  /\b(our|we have an?) (office|location|team) (in|located in)\b/i, /\b12[- ]month\b/i, /\bannual (contract|agreement)\b/i, /\bguarantee/i, /\b#1\b/, /\bbest in\b/i,
];

const words = (s) => (s.match(/[A-Za-z0-9$',.-]+/g) || []).length;
const textOf = (d) =>
  [
    d.eyebrow, d.lead, d.local?.heading, ...(d.local?.paragraphs || []), d.industries?.heading, d.industries?.intro,
    ...(d.industries?.items || []).flatMap((i) => [i.name, i.body]), ...(d.includes || []).flatMap((i) => [i.title, i.body]),
    d.areas?.intro, d.howWeWork?.heading, ...(d.howWeWork?.paragraphs || []), ...(d.faqs || []).flatMap((f) => [f.q, f.a]),
  ].filter(Boolean).join(" ");

function shingles(d) {
  const mask = new RegExp(`\\b(${[d.city, d.county, d.metro, d.stateName, d.state].filter(Boolean).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
  const toks = textOf(d).replace(mask, "X").toLowerCase().replace(/[^a-z0-9$ ]/g, " ").split(/\s+/).filter(Boolean);
  const set = new Set();
  for (let i = 0; i + 5 <= toks.length; i++) set.add(toks.slice(i, i + 5).join(" "));
  return set;
}

const errors = [];
const warns = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);
const warn = (slug, msg) => warns.push(`${slug}: ${msg}`);

const sh = new Map(pages.map(({ data }) => [data.slug, shingles(data)]));
const titles = new Map();
const descs = new Map();

for (const { file, data: d } of pages) {
  const s = d.slug || file;
  titles.set(d.title, [...(titles.get(d.title) || []), s]);
  descs.set(d.metaDescription, [...(descs.get(d.metaDescription) || []), s]);
  if (only.size && !only.has(s)) continue;

  // Shape
  for (const k of ["slug", "path", "city", "state", "stateName", "county", "metro", "lat", "lon", "population", "published", "updated", "title", "metaDescription", "eyebrow", "lead", "local", "industries", "includes", "areas", "howWeWork", "faqs", "sources"]) {
    if (d[k] === undefined || d[k] === "") err(s, `missing ${k}`);
  }
  if (`${d.slug}.json` !== file) err(s, `file name must be ${d.slug}.json`);
  if (d.path !== `/web-design-${d.slug}`) err(s, `path must be /web-design-${d.slug}`);
  if (!/^[a-z0-9-]+-[a-z]{2}$/.test(d.slug || "")) err(s, "slug must be city-st, lowercase");
  if (!/^[A-Z]{2}$/.test(d.state || "")) err(s, "state must be a 2-letter code");
  if (!(Math.abs(d.lat) > 0 && Math.abs(d.lon) > 0)) err(s, "lat/lon missing");
  for (const k of ["published", "updated"]) if (!/^\d{4}-\d{2}-\d{2}$/.test(d[k] || "")) err(s, `${k} must be YYYY-MM-DD`);

  // Search targeting
  if ((d.title || "").length > 41) err(s, `title is ${d.title.length} chars (max 41, the site adds " | Creative Cowboys")`);
  if (!(d.title || "").includes(d.city) || !/web design/i.test(d.title || "")) err(s, "title must contain 'Web Design' and the city");
  const ml = (d.metaDescription || "").length;
  if (ml < 120 || ml > 160) err(s, `metaDescription is ${ml} chars (120-160)`);
  if (!(d.metaDescription || "").includes(d.city)) err(s, "metaDescription must name the city");
  if (!(d.lead || "").includes(d.city)) err(s, "lead must name the city");

  // Depth
  const lw = words(d.lead || "");
  if (lw < 30 || lw > 80) err(s, `lead is ${lw} words (30-80)`);
  if ((d.local?.paragraphs || []).length < 3) err(s, "local needs 3+ paragraphs");
  (d.local?.paragraphs || []).forEach((p, i) => { const w = words(p); if (w < 45 || w > 150) err(s, `local paragraph ${i + 1} is ${w} words (45-150)`); });
  const ni = (d.industries?.items || []).length;
  if (ni < 4 || ni > 6) err(s, `industries needs 4-6 items (has ${ni})`);
  if ((d.includes || []).length !== 4) err(s, "includes needs exactly 4 items");
  if ((d.areas?.places || []).length < 6) err(s, "areas needs 6+ places");
  if ((d.howWeWork?.paragraphs || []).length < 2) err(s, "howWeWork needs 2+ paragraphs");
  const nf = (d.faqs || []).length;
  if (nf < 5 || nf > 7) err(s, `faqs needs 5-7 (has ${nf})`);
  (d.faqs || []).forEach((f, i) => { const w = words(f.a || ""); if (w < 20 || w > 95) err(s, `faq ${i + 1} answer is ${w} words (20-95)`); });
  if (!(d.faqs || []).some((f) => /cost|price|how much/i.test(f.q))) err(s, "faqs need a cost question");
  const tw = words(textOf(d));
  if (tw < 850) err(s, `page copy is ${tw} words (850+ before the shared offer and proof sections)`);
  if (tw > 1500) warn(s, `page copy is ${tw} words; over 1,500 gets long on a phone`);
  // Count the city as a word on its own, not inside place names like "Dunwoody Village".
  const cityHits = (textOf(d).match(new RegExp(`\\b${d.city}\\b(?!\\s+[A-Z])`, "g")) || []).length;
  if (cityHits < 8) err(s, `city named only ${cityHits} times; aim for 10-20`);
  if (cityHits > 30) err(s, `city named ${cityHits} times; that reads as stuffing (max 30)`);

  // Truth and tone
  const all = textOf(d);
  for (const m of all.match(/\$[\d,]+/g) || []) if (!ALLOWED_DOLLARS.has(m)) err(s, `price ${m} is not one of ${[...ALLOWED_DOLLARS].join(", ")}`);
  for (const re of BANNED) { const m = all.match(re); if (m) err(s, `banned phrase: "${m[0]}"`); }
  const dashes = (all.match(/—/g) || []).length;
  if (dashes > 4) err(s, `${dashes} em dashes (max 4)`);
  if ((d.sources || []).filter((u) => /^https?:\/\//.test(u)).length < 3) err(s, "needs 3+ source URLs for its local facts");

  // Uniqueness against every other page
  const mine = sh.get(d.slug);
  for (const [other, set] of sh) {
    if (other === d.slug || !mine.size) continue;
    let shared = 0;
    for (const g of mine) if (set.has(g)) shared++;
    const pct = (100 * shared) / mine.size;
    if (pct > 20) err(s, `${pct.toFixed(0)}% of its 5-word phrases also appear on ${other} (max 20%)`);
  }
}
for (const [t, list] of titles) if (list.length > 1) err(list.join(","), `duplicate title "${t}"`);
for (const [t, list] of descs) if (list.length > 1) err(list.join(","), `duplicate meta description`);

for (const w of warns) console.log(`warn  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
console.log(`${pages.length} pages checked, ${errors.length} problems`);
process.exit(errors.length ? 1 : 0);
