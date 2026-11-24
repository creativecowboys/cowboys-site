import Image from "next/image";
import Link from "next/link";
import { Instrument_Sans, Inter } from "next/font/google";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import CityLeadForm from "@/components/city/CityLeadForm";
import { offerSchema } from "@/components/city/OfferSection";
import { LOCAL_PACKAGE, OTHER_SERVICES, usd } from "@/lib/offer";
import { BUSINESS_ID, NAP, SITE_URL } from "@/lib/seo";
import { HQ, milesBetween, nearbyLinks, proofFor, type CityPage } from "@/lib/city-pages";
import { RouteDraw } from "./LayoutB.motion";

/**
 * Option B · "Daylight Studio". Bright, calm, premium studio site.
 * Signature: a hand-drawn route map from the Villa Rica office to the city,
 * projected from real coordinates (no tiles, no external requests).
 */

const display = Instrument_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

/* ---------- Tokens ---------- */
const C = {
  white: "#FFFFFF",
  stone: "#F3F3F1",
  ink: "#121212",
  body: "#4A4A4A",
  muted: "#6A6A66",
  hair: "#E4E4E0",
  orange: "#F15A29",
  deep: "#111111",
};

const wrap = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
const label = "text-[12px] font-medium uppercase tracking-[0.12em]";
const h2 = `${display.className} text-[32px] leading-[1.08] sm:text-[40px] md:text-[48px] font-semibold tracking-[-0.03em] text-[#121212] text-balance`;
const h3 = `${display.className} text-[20px] leading-snug font-semibold tracking-[-0.015em] text-[#121212]`;
const prose = "text-[17px] md:text-[18px] leading-[1.7] text-[#4A4A4A]";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#F15A29] rounded-[6px]";
const textLink = `font-medium text-[#121212] underline decoration-[#F15A29] decoration-[1.5px] underline-offset-[5px] hover:decoration-[3px] transition-[text-decoration-thickness] ${focus}`;
const btnBase = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[16px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#F15A29]`;
const btnInk = `${btnBase} bg-[#121212] text-white hover:bg-[#2a2a2a]`;
const btnLight = `${btnBase} bg-white text-[#121212] hover:bg-[#EDEDEA]`;

const TEAM = [
  { name: "Josh", role: "Co-founder", photo: "/team/josh-tee.jpg" },
  { name: "Dave", role: "Co-founder", photo: "/team/dave-tee.jpg" },
] as const;

const LOGOS = [
  { src: "/Client Logos/johnbjackson-dark-Blue.png", alt: "John B. Jackson Law", w: 150 },
  { src: "/Client Logos/McKinley (Black).png", alt: "McKinley Roofing", w: 120 },
  { src: "/Client Logos/Harmonic Logo (Black).png", alt: "Harmonic Production", w: 130 },
  { src: "/Client Logos/big-MetLane_logo_full.png", alt: "MetLane", w: 120 },
  { src: "/Client Logos/Leuco transparent 2.png", alt: "LEUCO", w: 104 },
  { src: "/Client Logos/InnovativeLogoWebsite.png", alt: "Innovative", w: 120 },
  { src: "/Client Logos/Life Publishers (Black).png", alt: "Life Publishers", w: 120 },
  { src: "/Client Logos/FireBible logo Black.webp", alt: "Fire Bible", w: 110 },
];

const enc = (s: string) => encodeURI(s);
const stateAnchor = (stateName: string) => `/areas-we-serve#${stateName.toLowerCase().replace(/\s+/g, "-")}`;
const tel = `tel:${NAP.telephone.replace(/[^\d+]/g, "")}`;

/* ---------- Route map geometry ---------- */

type Pt = { x: number; y: number };
type RouteGeo = {
  W: number;
  H: number;
  hq: Pt;
  dest: Pt;
  ctrl: Pt;
  mid: Pt;
  path: string;
  latLines: { y: number; text: string }[];
  lonLines: { x: number; text: string }[];
  gridLat: { y: number; text: string }[];
  gridLon: { x: number; text: string }[];
  scale: { x: number; y: number; px: number; miles: number; dir: 1 | -1 };
  labelsAbove: { hq: boolean; dest: boolean };
};

const NICE_STEPS = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10];
const NICE_MILES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500];
const MI_PER_DEG = 69.05;

function routeGeometry(dest: { lat: number; lon: number }, W: number, H: number, padX: number, padY: number): RouteGeo {
  const k = Math.cos((((HQ.lat + dest.lat) / 2) * Math.PI) / 180);
  const toPlane = (p: { lat: number; lon: number }) => ({ x: p.lon * k, y: -p.lat });
  const a = toPlane(HQ);
  const b = toPlane(dest);
  const minSpan = 0.25;
  const dx = Math.max(Math.abs(b.x - a.x), minSpan);
  const dy = Math.max(Math.abs(b.y - a.y), minSpan);
  const s = Math.min((W - 2 * padX) / dx, (H - 2 * padY) / dy);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const px = (p: { x: number; y: number }): Pt => ({ x: W / 2 + (p.x - cx) * s, y: H / 2 + (p.y - cy) * s });
  const hq = px(a);
  const dp = px(b);

  // Curve: bow away from the pin labels.
  const vx = dp.x - hq.x;
  const vy = dp.y - hq.y;
  const len = Math.hypot(vx, vy) || 1;
  const level = Math.abs(vy) < 56;
  let nx = -vy / len;
  let ny = vx / len;
  const wantDown = level; // level pins carry labels above, so bow down
  if ((wantDown && ny < 0) || (!wantDown && ny > 0) || (Math.abs(ny) < 0.05 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  const bow = Math.min(len * 0.2, 90);
  const m = { x: (hq.x + dp.x) / 2, y: (hq.y + dp.y) / 2 };
  const ctrl = { x: m.x + nx * bow, y: m.y + ny * bow };
  const mid = { x: 0.25 * hq.x + 0.5 * ctrl.x + 0.25 * dp.x, y: 0.25 * hq.y + 0.5 * ctrl.y + 0.25 * dp.y };

  // Graticule over the visible area.
  const lonMin = (cx - W / 2 / s) / k;
  const lonMax = (cx + W / 2 / s) / k;
  const latMax = -(cy - H / 2 / s);
  const latMin = -(cy + H / 2 / s);
  const span = Math.max(lonMax - lonMin, latMax - latMin);
  const step = NICE_STEPS.find((st) => span / st <= 6) ?? 10;
  const dec = step < 0.1 ? 2 : step < 1 ? (step === 0.25 ? 2 : 1) : step === 2.5 ? 1 : 0;
  const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(dec)}°${v >= 0 ? pos : neg}`;
  const latLines: RouteGeo["latLines"] = [];
  for (let lat = Math.ceil(latMin / step) * step; lat <= latMax; lat += step) {
    const y = px(toPlane({ lat, lon: 0 })).y;
    if (y > 14 && y < H - 14) latLines.push({ y, text: fmt(lat, "N", "S") });
  }
  const lonLines: RouteGeo["lonLines"] = [];
  for (let lon = Math.ceil(lonMin / step) * step; lon <= lonMax; lon += step) {
    const x = W / 2 + (lon * k - cx) * s;
    if (x > 30 && x < W - 30) lonLines.push({ x, text: fmt(lon, "E", "W") });
  }

  // Scale bar in the corner farthest from both pins.
  const pxPerMile = s / MI_PER_DEG;
  const miles = [...NICE_MILES].reverse().find((mi) => mi * pxPerMile <= 110) ?? 1;
  const inset = 22;
  const corners = [
    { x: inset, y: H - inset, dir: 1 as const },
    { x: W - inset, y: H - inset, dir: -1 as const },
    { x: inset, y: inset + 14, dir: 1 as const },
    { x: W - inset, y: inset + 14, dir: -1 as const },
  ];
  const score = (c: Pt) => Math.min(Math.hypot(c.x - hq.x, c.y - hq.y), Math.hypot(c.x - dp.x, c.y - dp.y), Math.hypot(c.x - mid.x, c.y - mid.y));
  const corner = corners.reduce((best, c) => (score(c) > score(best) ? c : best), corners[0]);

  // Keep graticule labels clear of the pin labels.
  const pins = [hq, dp];
  const clearLat = latLines.filter((l) => !pins.some((p) => Math.abs(p.x - 30) < 100 && Math.abs(p.y - l.y) < 56));
  const clearLon = lonLines.filter((l) => !pins.some((p) => Math.abs(p.x - (l.x + 22)) < 90 && Math.abs(p.y - (H - 12)) < 80));

  return {
    W,
    H,
    hq,
    dest: dp,
    ctrl,
    mid,
    path: `M ${hq.x.toFixed(1)} ${hq.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${dp.x.toFixed(1)} ${dp.y.toFixed(1)}`,
    latLines: clearLat,
    lonLines: clearLon,
    gridLat: latLines,
    gridLon: lonLines,
    scale: { x: corner.x, y: corner.y, px: miles * pxPerMile, miles, dir: corner.dir },
    labelsAbove: level ? { hq: true, dest: true } : { hq: hq.y < dp.y, dest: dp.y < hq.y },
  };
}

function PinLabel({ at, above, lines, W, fontSize = 14 }: { at: Pt; above: boolean; lines: { text: string; strong?: boolean }[]; W: number; fontSize?: number }) {
  const widest = Math.max(...lines.map((l) => l.text.length)) * fontSize * 0.56;
  const x = Math.min(Math.max(at.x, 12 + widest / 2), W - 12 - widest / 2);
  const gap = fontSize + 4;
  const first = above ? at.y - 18 - gap * (lines.length - 1) : at.y + 18 + fontSize - 2;
  return (
    <g textAnchor="middle" style={{ paintOrder: "stroke" }} stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round">
      {lines.map((l, i) => (
        <text
          key={l.text}
          x={x}
          y={first + i * gap}
          fontSize={l.strong ? fontSize : fontSize - 2}
          fontWeight={l.strong ? 600 : 400}
          fill={l.strong ? C.ink : C.muted}
        >
          {l.text}
        </text>
      ))}
    </g>
  );
}

function RouteSvg({ page, W, H, id, distance, className }: { page: CityPage; W: number; H: number; id: string; distance: string; className?: string }) {
  const g = routeGeometry(page, W, H, W < 420 ? 44 : 64, W < 420 ? 74 : 84);
  const fs = W < 420 ? 13 : 14;
  const pillW = distance.length * (fs - 0.5) * 0.58 + 28;
  const sx = g.scale.dir === 1 ? g.scale.x : g.scale.x - g.scale.px;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby={`${id}-t`}
      className={className}
      style={{ fontFamily: "inherit" }}
    >
      <title id={`${id}-t`}>
        {`Map: our office in Villa Rica, GA, and ${page.city}, ${page.state}, ${distance} apart`}
      </title>
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <path d={g.path} className="lb-route-mask" pathLength={1} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        </mask>
      </defs>

      {/* Graticule */}
      <g stroke={C.hair} strokeWidth={1}>
        {g.gridLat.map((l) => (
          <line key={`la${l.text}`} x1={0} x2={W} y1={l.y} y2={l.y} />
        ))}
        {g.gridLon.map((l) => (
          <line key={`lo${l.text}`} y1={0} y2={H} x1={l.x} x2={l.x} />
        ))}
      </g>
      <g fontSize={10} fill="#8A8A85" letterSpacing="0.06em">
        {g.latLines.map((l) => (
          <text key={`lat${l.text}`} x={8} y={l.y - 5}>
            {l.text}
          </text>
        ))}
        {g.lonLines.map((l) => (
          <text key={`lon${l.text}`} x={l.x + 5} y={H - 8}>
            {l.text}
          </text>
        ))}
      </g>

      {/* Scale bar */}
      <g stroke={C.ink} strokeWidth={1.25} opacity={0.7}>
        <line x1={sx} x2={sx + g.scale.px} y1={g.scale.y - 18} y2={g.scale.y - 18} />
        <line x1={sx} x2={sx} y1={g.scale.y - 22} y2={g.scale.y - 14} />
        <line x1={sx + g.scale.px} x2={sx + g.scale.px} y1={g.scale.y - 22} y2={g.scale.y - 14} />
      </g>
      <text
        x={g.scale.dir === 1 ? sx : sx + g.scale.px}
        y={g.scale.y - 26}
        textAnchor={g.scale.dir === 1 ? "start" : "end"}
        fontSize={10.5}
        fill={C.muted}
        letterSpacing="0.06em"
      >
        {g.scale.miles} MI
      </text>

      {/* Route: faint track, then the dashed line revealed by the mask */}
      <path d={g.path} fill="none" stroke={C.orange} strokeOpacity={0.12} strokeWidth={6} strokeLinecap="round" />
      <g mask={`url(#${id}-m)`}>
        <path d={g.path} fill="none" stroke={C.orange} strokeWidth={2.25} strokeDasharray="7 7" strokeLinecap="round" />
      </g>

      {/* Office pin */}
      <circle cx={g.hq.x} cy={g.hq.y} r={12} fill="none" stroke={C.ink} strokeOpacity={0.18} />
      <circle cx={g.hq.x} cy={g.hq.y} r={6} fill={C.ink} stroke="#fff" strokeWidth={2.5} />
      <PinLabel at={g.hq} above={g.labelsAbove.hq} W={W} fontSize={fs} lines={[{ text: "Villa Rica, GA", strong: true }, { text: "our office" }]} />

      {/* Destination pin */}
      <g className="lb-route-dest">
        <circle cx={g.dest.x} cy={g.dest.y} r={17} fill={C.orange} fillOpacity={0.13} />
        <circle cx={g.dest.x} cy={g.dest.y} r={7} fill={C.orange} stroke="#fff" strokeWidth={2.5} />
        <PinLabel
          at={g.dest}
          above={g.labelsAbove.dest}
          W={W}
          fontSize={fs}
          lines={[{ text: `${page.city}, ${page.state}`, strong: true }, { text: page.county }]}
        />
      </g>

      {/* Distance label */}
      <g className="lb-route-pill">
        <rect x={g.mid.x - pillW / 2} y={g.mid.y - 15} width={pillW} height={30} rx={15} fill="#fff" stroke={C.hair} />
        <text x={g.mid.x} y={g.mid.y + 4.5} textAnchor="middle" fontSize={fs - 0.5} fontWeight={600} fill={C.ink}>
          {distance}
        </text>
      </g>
    </svg>
  );
}

function RouteCard({ page, miles }: { page: CityPage; miles: number }) {
  const distance = miles < 25 ? "next door" : `about ${miles} miles`;
  return (
    <figure className="rounded-[24px] border border-[#E4E4E0] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)] overflow-hidden">
      <figcaption className={`flex items-center justify-between gap-4 border-b border-[#E4E4E0] px-5 py-4 sm:px-6 ${label} text-[#6A6A66]`}>
        <span>From our office to {page.city}</span>
        <span aria-hidden="true" className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#121212]" />
          <span className="h-px w-5 border-t border-dashed border-[#F15A29]" />
          <span className="h-2 w-2 rounded-full bg-[#F15A29]" />
        </span>
      </figcaption>
      <RouteDraw className="bg-[#FBFBFA]">
        <RouteSvg page={page} W={560} H={420} id={`lb-route-${page.slug}`} distance={distance} className="hidden sm:block w-full h-auto" />
        <RouteSvg page={page} W={340} H={340} id={`lb-route-sm-${page.slug}`} distance={distance} className="block sm:hidden w-full h-auto" />
      </RouteDraw>
      <dl className="grid grid-cols-3 divide-x divide-[#E4E4E0] border-t border-[#E4E4E0]">
        {[
          { k: "Distance", v: `${miles} mi` },
          { k: "Population", v: page.population.toLocaleString("en-US") },
          { k: "County", v: page.county.replace(/ County$/, "") },
        ].map((d) => (
          <div key={d.k} className="px-4 py-4 sm:px-6">
            <dt className={`${label} text-[11px] text-[#6A6A66]`}>{d.k}</dt>
            <dd className={`${display.className} mt-1 text-[16px] sm:text-[19px] leading-tight font-semibold tracking-[-0.02em] text-[#121212]`}>{d.v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/* ---------- Page ---------- */

export default function LayoutB({ page, preview = false }: { page: CityPage; preview?: boolean }) {
  const place = `${page.city}, ${page.state}`;
  const pageName = `Web Design in ${place}`;
  const url = `${SITE_URL}${page.path}`;
  const milesFromHq = Math.round(milesBetween(HQ, page));
  const nearby = nearbyLinks(page);
  const proof = proofFor(page);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Areas We Serve", item: `${SITE_URL}/areas-we-serve` },
          { "@type": "ListItem", position: 3, name: pageName, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${page.title} | Creative Cowboys`,
        description: page.metaDescription,
        datePublished: page.published,
        dateModified: page.updated,
        inLanguage: "en-US",
        about: { "@id": `${url}#service` },
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: pageName,
        serviceType: "Web Design and Local Marketing",
        description: page.lead,
        url,
        provider: { "@id": BUSINESS_ID },
        areaServed: {
          "@type": "City",
          name: page.city,
          geo: { "@type": "GeoCoordinates", latitude: page.lat, longitude: page.lon },
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: `${page.county}, ${page.stateName}`,
          },
        },
        offers: offerSchema(),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <div className={`${body.className} min-h-screen flex flex-col bg-white text-[#121212] antialiased selection:bg-[#F15A29] selection:text-white`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .lb-fade { animation: lb-fade 900ms cubic-bezier(.16,1,.3,1) both; }
          .lb-fade-2 { animation-delay: 140ms; }
          @keyframes lb-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        }
        .lb-route-mask { stroke-dasharray: 1 1; stroke-dashoffset: 0; }
        [data-route="armed"] .lb-route-mask { stroke-dashoffset: 1; }
        [data-route="armed"] .lb-route-dest, [data-route="armed"] .lb-route-pill { opacity: 0; }
        [data-route="drawn"] .lb-route-mask { transition: stroke-dashoffset 1600ms cubic-bezier(.65,0,.35,1); }
        [data-route="drawn"] .lb-route-dest { transition: opacity 500ms ease 1350ms; }
        [data-route="drawn"] .lb-route-pill { transition: opacity 500ms ease 700ms; }
        .lb-faq summary::-webkit-details-marker { display: none; }
      `}</style>
      <Header />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className={`${wrap} grid items-center gap-14 pt-12 pb-16 md:grid-cols-[55fr_45fr] md:gap-10 md:pt-20 md:pb-24 lg:gap-16`}>
            <div>
              <nav aria-label="Breadcrumb" className="mb-10 text-[13px] text-[#6A6A66]">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <li><Link href="/" className={`hover:text-[#121212] ${focus}`}>Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href="/areas-we-serve" className={`hover:text-[#121212] ${focus}`}>Areas we serve</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href={stateAnchor(page.stateName)} className={`hover:text-[#121212] ${focus}`}>{page.stateName}</Link></li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-[#121212]">{page.city}</li>
                </ol>
              </nav>
              <p className={`${label} mb-6 flex items-center gap-3 text-[#4A4A4A]`}>
                <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-[#F15A29]" />
                {page.eyebrow}
              </p>
              <h1
                className={`${display.className} text-[44px] leading-[1.02] sm:text-[60px] lg:text-[76px] font-semibold tracking-[-0.035em] text-[#121212]`}
              >
                Web Design in
                <br />
                {place}
              </h1>
              <p className="mt-7 max-w-[34rem] text-[18px] leading-[1.65] text-[#4A4A4A]">{page.lead}</p>
              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <a href="#plan" className={btnInk}>
                  Get a free {page.city} site plan
                  <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                </a>
                <p className="text-[16px] text-[#4A4A4A]">
                  or call <a href={tel} className={textLink}>{NAP.telephoneDisplay}</a>
                </p>
              </div>
            </div>

            {/* Josh + Dave */}
            <div className="relative mx-auto w-full max-w-[460px] md:max-w-none">
              <div className="relative aspect-[10/11]">
                <figure className="lb-fade absolute left-0 top-0 w-[60%]">
                  <div className="relative aspect-[1000/1240] overflow-hidden rounded-[24px] bg-[#F3F3F1]">
                    <Image
                      src={TEAM[0].photo}
                      alt="Josh, co-founder of Creative Cowboys"
                      fill
                      priority
                      sizes="(min-width: 1200px) 290px, (min-width: 768px) 26vw, 60vw"
                      className="object-cover object-[center_18%]"
                    />
                  </div>
                  <figcaption className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] text-[#121212] shadow-[0_6px_20px_-8px_rgba(0,0,0,.25)]">
                    <span className="font-semibold">Josh</span> <span className="text-[#6A6A66]">· Co-founder</span>
                  </figcaption>
                </figure>
                <figure className="lb-fade lb-fade-2 absolute bottom-0 right-0 w-[56%]">
                  <div className="relative aspect-[1000/1240] overflow-hidden rounded-[24px] bg-[#F3F3F1] ring-[6px] ring-white">
                    <Image
                      src={TEAM[1].photo}
                      alt="Dave, co-founder of Creative Cowboys"
                      fill
                      priority
                      sizes="(min-width: 1200px) 270px, (min-width: 768px) 24vw, 56vw"
                      className="object-cover object-[center_18%]"
                    />
                  </div>
                  <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] text-[#121212] shadow-[0_6px_20px_-8px_rgba(0,0,0,.25)]">
                    <span className="font-semibold">Dave</span> <span className="text-[#6A6A66]">· Co-founder</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>

          {/* Logo strip */}
          <div className="border-y border-[#E4E4E0]">
            <div className={`${wrap} flex flex-col gap-6 py-9 lg:flex-row lg:items-center lg:gap-12`}>
              <p className={`${label} shrink-0 text-[#6A6A66]`}>Businesses we work with</p>
              <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-4 lg:flex lg:flex-1 lg:justify-between lg:gap-6">
                {LOGOS.map((l) => (
                  <li key={l.src} className="flex justify-center lg:block">
                    <Image
                      src={enc(l.src)}
                      alt={l.alt}
                      width={l.w}
                      height={40}
                      sizes={`${l.w}px`}
                      className="h-7 w-auto max-w-[120px] object-contain grayscale opacity-55 transition-opacity hover:opacity-90"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Local story + route map ---------- */}
        <section className="py-24 md:py-32">
          <div className={`${wrap} grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20`}>
            <div>
              <p className={`${label} mb-5 text-[#6A6A66]`}>{page.city} up close</p>
              <h2 className={h2}>{page.local.heading}</h2>
              <div className="mt-8 flex flex-col gap-6">
                {page.local.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={prose}>{p}</p>
                ))}
                <p className={prose}>
                  More on how we build is on our <Link href="/web-design" className={textLink}>web design</Link> page, and how we get
                  sites found is on <Link href="/seo" className={textLink}>SEO</Link>.
                </p>
              </div>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <RouteCard page={page} miles={milesFromHq} />
            </div>
          </div>
        </section>

        {/* ---------- Offer (deep band) ---------- */}
        <section aria-labelledby="lb-offer" className="bg-[#111111] text-white">
          <div className={`${wrap} py-24 md:py-32`}>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
              <div>
                <p className={`${label} mb-5 text-[#A3A39E]`}>{LOCAL_PACKAGE.name}</p>
                <h2 id="lb-offer" className={`${display.className} text-[32px] leading-[1.08] sm:text-[40px] font-semibold tracking-[-0.03em] text-balance`}>
                  One monthly package for {page.city} businesses
                </h2>
                <p className={`${display.className} mt-10 flex items-start font-semibold tracking-[-0.045em] leading-none`}>
                  <span className="mt-3 text-[32px] text-[#A3A39E]">$</span>
                  <span className="text-[104px] sm:text-[128px]">{LOCAL_PACKAGE.monthly}</span>
                  <span className="ml-2 self-end pb-5 text-[20px] tracking-[-0.01em] text-[#A3A39E]">/month</span>
                </p>
                <p className="mt-4 text-[17px] text-[#D8D8D4]">{LOCAL_PACKAGE.term}</p>
                <div className="mt-10 border-t border-white/15 pt-6">
                  <p className="text-[17px] leading-[1.6] text-[#D8D8D4]">
                    Includes a custom website we build for you, a{" "}
                    <span className="font-semibold text-white">{usd(LOCAL_PACKAGE.websiteValue)} value</span>, free with the package.
                  </p>
                </div>
                <a href="#plan" className={`${btnLight} mt-10`}>
                  Get my free {page.city} plan
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>

              <div>
                <h3 className={`${label} text-[#A3A39E]`}>What the {usd(LOCAL_PACKAGE.monthly)} covers</h3>
                <ul className="mt-5 border-t border-white/15">
                  {LOCAL_PACKAGE.includes.map((inc) => (
                    <li key={inc.title} className="grid gap-2 border-b border-white/15 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
                      <h4 className={`${display.className} text-[19px] font-semibold tracking-[-0.015em] flex items-start gap-3`}>
                        <span aria-hidden="true" className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#F15A29]" />
                        {inc.title}
                      </h4>
                      <p className="text-[16px] leading-[1.65] text-[#C9C9C4]">{inc.body}</p>
                    </li>
                  ))}
                </ul>

                <h3 className={`${label} mt-14 text-[#A3A39E]`}>Also available</h3>
                <ul className="mt-5 border-t border-white/15">
                  {OTHER_SERVICES.map((svc) => (
                    <li key={svc.title} className="grid gap-1.5 border-b border-white/10 py-5 sm:grid-cols-[200px_1fr] sm:gap-8">
                      <h4 className="text-[16px] font-medium text-white">
                        {"href" in svc && svc.href ? (
                          <Link href={svc.href} className={`hover:text-[#F15A29] ${focus}`}>
                            {svc.title}
                            <ArrowUpRight aria-hidden="true" className="ml-1 inline h-3.5 w-3.5 align-[-1px] opacity-60" />
                          </Link>
                        ) : (
                          svc.title
                        )}
                      </h4>
                      <p className="text-[15px] leading-[1.6] text-[#A3A39E]">{svc.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href="/contact"
              className={`group mt-16 inline-flex items-center gap-3 text-[17px] font-medium text-[#F15A29] ${focus}`}
            >
              Only need a website? Ask us about our new website specials.
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ---------- Industries ---------- */}
        <section className="py-24 md:py-32">
          <div className={wrap}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
              <h2 className={h2}>{page.industries.heading}</h2>
              <p className={`${prose} lg:pt-2`}>{page.industries.intro}</p>
            </div>
            <ul className="mt-14 grid gap-x-16 md:grid-cols-2">
              {page.industries.items.map((item) => (
                <li key={item.name} className="border-t border-[#E4E4E0] py-8">
                  <h3 className={h3}>{item.name}</h3>
                  <p className="mt-3 text-[16px] leading-[1.7] text-[#4A4A4A]">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Includes ---------- */}
        <section className="border-t border-[#E4E4E0] py-20 md:py-24">
          <div className={wrap}>
            <h2 className={`${display.className} text-[26px] sm:text-[30px] font-semibold tracking-[-0.025em] text-[#121212]`}>
              What your {page.city} website includes
            </h2>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {page.includes.map((item) => (
                <li key={item.title}>
                  <span aria-hidden="true" className="mb-5 block h-[2px] w-8 bg-[#F15A29]" />
                  <h3 className="text-[16px] font-semibold leading-snug text-[#121212]">{item.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.65] text-[#4A4A4A]">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Proof ---------- */}
        <section className="bg-[#F3F3F1] py-24 md:py-32">
          <div className={wrap}>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={`${label} mb-5 text-[#6A6A66]`}>{proof.local ? `Near ${page.city}` : "Current clients"}</p>
                <h2 className={h2}>{proof.local ? `Work near ${page.city}` : "Businesses we work with"}</h2>
              </div>
              <p className="max-w-md text-[16px] leading-[1.65] text-[#4A4A4A]">
                {proof.local
                  ? `Real clients a short drive from ${page.city}. Ask us about their work on your first call.`
                  : "Real clients we work with today. We'll walk you through their work on your first call. More on the "}
                {!proof.local && (
                  <>
                    <Link href="/results" className={textLink}>results page</Link>.
                  </>
                )}
              </p>
            </div>
            <ul className="mt-14 grid gap-5 md:grid-cols-3">
              {proof.clients.map((c) => (
                <li key={c.name} className="flex flex-col rounded-[20px] bg-white p-7 sm:p-8">
                  <p className={`${label} text-[11px] text-[#6A6A66]`}>
                    {c.city}, {c.state}
                  </p>
                  <h3 className={`${display.className} mt-4 text-[26px] leading-[1.12] font-semibold tracking-[-0.025em] text-[#121212]`}>{c.name}</h3>
                  <p className="mt-2 text-[14px] text-[#6A6A66]">{c.industry}</p>
                  <p className="mt-6 border-t border-[#E4E4E0] pt-6 text-[16px] leading-[1.65] text-[#4A4A4A]">{c.work}</p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener"
                      className={`mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-medium text-[#121212] hover:text-[#C2410C] ${focus} self-start`}
                    >
                      Visit {c.url.replace(/^https?:\/\/(www\.)?/, "")}
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- How we work + form ---------- */}
        <section id="plan" className="scroll-mt-28 py-24 md:py-32">
          <div className={`${wrap} grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20`}>
            <div>
              <h2 className={h2}>{page.howWeWork.heading}</h2>
              <div className="mt-8 flex flex-col gap-6">
                {page.howWeWork.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={prose}>{p}</p>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-5 border-t border-[#E4E4E0] pt-8">
                <div className="flex shrink-0 -space-x-3">
                  {TEAM.map((t) => (
                    <div key={t.name} className="relative h-14 w-14 overflow-hidden rounded-full bg-[#F3F3F1] ring-[3px] ring-white">
                      <Image src={t.photo} alt={`${t.name}, ${t.role}`} fill sizes="56px" className="object-cover object-[center_14%] scale-[1.35] origin-[50%_12%]" />
                    </div>
                  ))}
                </div>
                <p className="text-[16px] leading-[1.6] text-[#4A4A4A]">
                  Creative Cowboys is Josh and Dave, working out of {NAP.streetAddress} in {NAP.addressLocality}, Georgia
                  {milesFromHq > 25 ? `, about ${milesFromHq} miles from ${page.city}` : ""}. Read more{" "}
                  <Link href="/about" className={textLink}>about us</Link>.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#EDEDEA] bg-white p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,.18)] sm:p-10 lg:self-start">
              <h3 className={`${display.className} text-[26px] font-semibold tracking-[-0.025em] text-[#121212]`}>
                Get a free {page.city} site plan
              </h3>
              <p className="mt-2 mb-8 text-[15px] leading-[1.6] text-[#4A4A4A]">
                Tell us a little about your business. We&rsquo;ll call within one business day.
              </p>
              <CityLeadForm
                city={page.city}
                preview={preview}
                idPrefix="lb-lead"
                theme={{
                  form: "flex flex-col gap-5",
                  label: "mb-2 block text-[13px] font-medium text-[#121212]",
                  input:
                    "w-full rounded-[12px] border border-[#DADAD5] bg-white px-4 py-3.5 text-[16px] text-[#121212] transition-colors hover:border-[#BDBDB7] focus:border-[#121212] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A29]/40",
                  button:
                    "mt-2 w-full rounded-full bg-[#121212] px-7 py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#F15A29]",
                  note: "rounded-[10px] bg-[#FDEEE8] px-4 py-3 text-[14px] text-[#8A2A0A]",
                  success: "rounded-[16px] bg-[#F3F3F1] p-6 text-[16px] leading-[1.6] text-[#121212]",
                }}
              />
              <p className="mt-6 flex items-center gap-2 text-[14px] text-[#6A6A66]">
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                Prefer to talk? <a href={tel} className={textLink}>{NAP.telephoneDisplay}</a>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-[#E4E4E0] py-24 md:py-32">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20`}>
            <h2 className={h2}>Web design in {page.city}: common questions</h2>
            <div className="lb-faq border-t border-[#E4E4E0]">
              {page.faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-[#E4E4E0]">
                  <summary className={`flex cursor-pointer list-none items-start justify-between gap-6 py-6 ${focus}`}>
                    <h3 className="text-[18px] font-medium leading-snug text-[#121212]">{faq.q}</h3>
                    <span
                      aria-hidden="true"
                      className="relative mt-1.5 h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-[1.5px] before:w-4 before:-translate-y-1/2 before:bg-[#121212] after:absolute after:left-1/2 after:top-0 after:h-4 after:w-[1.5px] after:-translate-x-1/2 after:bg-[#121212] after:transition-transform after:duration-200 group-open:after:scale-y-0 group-open:before:bg-[#F15A29]"
                    />
                  </summary>
                  <p className="max-w-[44rem] pb-7 pr-10 text-[16px] leading-[1.7] text-[#4A4A4A]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Areas + nearby ---------- */}
        <section className="bg-[#F3F3F1] py-20 md:py-24">
          <div className={`${wrap} grid gap-14 lg:grid-cols-2 lg:gap-20`}>
            <div>
              <h2 className={`${display.className} text-[24px] sm:text-[28px] font-semibold tracking-[-0.025em] text-[#121212]`}>
                Where we work around {page.city}
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-[#4A4A4A]">{page.areas.intro}</p>
              <ul className="mt-6 flex flex-wrap gap-x-1 gap-y-2 text-[15px] text-[#121212]">
                {page.areas.places.map((p, i) => (
                  <li key={p}>
                    {p}
                    {i < page.areas.places.length - 1 && <span aria-hidden="true" className="px-2 text-[#B5B5AF]">·</span>}
                  </li>
                ))}
              </ul>
            </div>
            <nav aria-labelledby="lb-nearby">
              <h2 id="lb-nearby" className={`${display.className} text-[24px] sm:text-[28px] font-semibold tracking-[-0.025em] text-[#121212]`}>
                Nearby cities we serve
              </h2>
              <ul className="mt-6 border-t border-[#DADAD5]">
                {nearby.map((n) => (
                  <li key={n.href} className="border-b border-[#DADAD5]">
                    <Link href={n.href} className={`group flex items-center justify-between gap-4 py-3.5 text-[15px] text-[#121212] ${focus}`}>
                      <span className="underline decoration-transparent decoration-[1.5px] underline-offset-[5px] transition-colors group-hover:decoration-[#F15A29]">
                        Web design in {n.city}, {n.state}
                      </span>
                      <span className="text-[13px] tabular-nums text-[#6A6A66]">{Math.round(n.miles)} mi</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] text-[#4A4A4A]">
                See every city on <Link href="/areas-we-serve" className={textLink}>Areas we serve</Link>, or more of{" "}
                <Link href={stateAnchor(page.stateName)} className={textLink}>{page.stateName}</Link>.
              </p>
            </nav>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="py-28 md:py-36">
          <div className={`${wrap} flex flex-col items-center text-center`}>
            <span aria-hidden="true" className="mb-8 inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#121212]" />
              <span className="w-10 border-t-[1.5px] border-dashed border-[#F15A29]" />
              <span className="h-2 w-2 rounded-full bg-[#F15A29]" />
            </span>
            <h2 className={`${h2} max-w-[18ch]`}>Get a free plan for your {page.city} website</h2>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.65] text-[#4A4A4A]">
              Tell us about your business. We&rsquo;ll come back with a plan for your {page.city} site and local SEO, with no pressure.
            </p>
            <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
              <a href="#plan" className={btnInk}>
                Start my {page.city} plan
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <p className="text-[16px] text-[#4A4A4A]">
                or call <a href={tel} className={textLink}>{NAP.telephoneDisplay}</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
