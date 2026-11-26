import Link from "next/link";
import ServicePage, { type ServicePageData } from "@/components/night-ride/ServicePage";
import { RESULT_HARMONIC, RESULT_JBJ } from "@/components/night-ride/service-content";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

// Plain-string answers feed both the page and the FAQ schema. `more` adds a link on the page only.
const faqs: Array<{ q: string; a: string; more?: { href: string; label: string } }> = [
  { q: "How long does SEO take to show results?", a: "Most businesses see meaningful movement in rankings within 3 to 6 months. Highly competitive markets may take 6 to 12 months. SEO is a long-term investment, and unlike paid ads, the results keep building over time.", more: { href: "/blog/how-long-does-seo-take", label: "Read the full breakdown" } },
  { q: "Do I need local SEO or national SEO?", a: "If your customers are mostly within driving distance, local SEO is the priority. It targets searches with a place attached, like “marketing agency Villa Rica GA”, and gets you into Google Maps results. National SEO fits companies whose buyers are spread across states." },
  { q: "How much does SEO cost?", a: "Our SEO packages start at $297 a month, month to month. The right plan depends on how competitive your market is and what you want to reach. We give you a clear quote after a free consultation." },
  { q: "What will I see in my monthly report?", a: "Keyword ranking changes, organic traffic trends and the specific work we completed, in plain English. You always know what we are doing and why." },
];

const REPORT = ["Keyword rankings", "Organic traffic", "Search Console data", "Backlink growth", "Technical health", "Action summary"];

const data: ServicePageData = {
  slug: "seo",
  eyebrow: "SEO services · Villa Rica, GA",
  titleLead: "Get found. Get leads. Get",
  titleHighlight: "results.",
  subhead: "We help small businesses in West Georgia and across the Southeast rank higher on Google, bring in steady organic traffic and turn searchers into paying customers. You see exactly what we did each month.",
  pills: ["Local keywords", "Map pack rankings", "Google Business Profile", "Authority links", "Plain-English reports", "No vanity metrics"],
  secondary: { label: "See SEO results", href: "#results" },
  heroImage: { src: "/night-ride/hero/seo.jpg", position: "92% 45%" },
  intro: {
    eyebrow: "Why it matters",
    heading: <>When they search, do <span className="grad">you</span> show up?</>,
    paragraphs: [
      <>Local SEO is the work of tuning your online presence so your business appears when people in your area search for what you do. When someone types &ldquo;roofing company near me&rdquo; or &ldquo;web design Villa Rica GA&rdquo;, local SEO decides whether you show up or your competitor does.</>,
      <>For most small businesses, local search is the highest-return marketing channel there is. It brings in buyers who are already looking for exactly what you offer, with no cold outreach.</>,
    ],
    quote: <>Our local SEO work took John B. Jackson Law to <b>22 #1 organic rankings</b> for personal injury searches in 12 months.</>,
    quoteSource: "Source: Creative Cowboys case study",
  },
  blocks: [
    {
      id: "process",
      eyebrow: "Our SEO process",
      heading: <>How we get you <span className="grad">ranked.</span></>,
      lede: "Six kinds of work, each aimed at rankings you can measure.",
      items: [
        { label: "Keyword research", desc: "We find the exact terms your best customers are searching: high-intent, local and ready to buy." },
        { label: "On-page optimization", desc: "Headlines, meta tags, content structure and image text. Every page tuned to send clear signals to Google." },
        { tag: "03 / #1 local ranking factor", label: "Google Business Profile", desc: "Your profile is the biggest local ranking factor. We work every part of it to get you into the map pack." },
        { label: "Link building", desc: "Quality backlinks from relevant local and industry sources that grow your site's authority." },
        { label: "Technical SEO", desc: "Site speed, structured data and sitemaps. The technical foundation Google expects, handled for you." },
        { label: "Reporting & transparency", desc: "Monthly reports in plain English: keyword rankings, traffic trends and what we are doing next." },
      ],
    },
  ],
  results: [RESULT_JBJ, RESULT_HARMONIC],
  pricing: { line: "SEO packages start at $297 a month." },
  faqs: faqs.map((f) => ({
    q: f.q,
    a: f.more ? <>{f.a} <Link href={f.more.href}>{f.more.label} &rarr;</Link></> : f.a,
  })),
  ctaHeadline: <>Ready to own your <span className="grad">market?</span></>,
  ctaSub: "Free consultation, no contract. You get a clear plan to get you ranking.",
};

const pageSchema = graph(
  breadcrumb("SEO Services", "/seo"),
  serviceSchema({
    name: "SEO Services",
    serviceType: "Search Engine Optimization",
    description: "SEO for small businesses across the Southeast: local SEO, keyword strategy, Google Business Profile optimization and clear monthly reporting.",
    path: "/seo",
  }),
  {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
);

export default function SEOPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <ServicePage data={data}>
        {/* LOCAL VS NATIONAL, and what the monthly report shows */}
        <section id="strategy" style={{ paddingTop: "0" }}>
          <div className="wrap">
            <div className="split">
              <div>
                <span className="eyebrow"><svg><use href="#star" /></svg>The right strategy</span>
                <h2 className="h-display h2">Local SEO or national SEO: what <span className="grad">you</span> need.</h2>
                <div className="split-body">
                  <p>If your customers are within driving distance, anywhere from Villa Rica and Carrollton out through Atlanta and across the Southeast, local SEO is your main focus. It gets you into the Google Map Pack (the three businesses shown with a map above the regular results) and reaches people searching in the towns you serve.</p>
                  <p>National SEO competes for broad terms with no location attached. That is the right call for manufacturers, distributors and B2B suppliers whose buyers are three states away. Being nearby does nothing for them, so the work shifts to site structure, content depth and authority. Most service businesses see a faster return from local. We build toward whichever one fits.</p>
                  <div className="btn-row">
                    <Link className="btn btn-ghost" href="/local-seo">Local SEO <svg><use href="#arr" /></svg></Link>
                    <Link className="btn btn-ghost" href="/national-seo">National SEO <svg><use href="#arr" /></svg></Link>
                  </div>
                </div>
              </div>
              <div className="card checklist">
                <h3 className="h3">Every month, you see:</h3>
                <ul>
                  {REPORT.map((r) => (
                    <li key={r}><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card band">
              <div>
                <h3 className="h3">SEO or Google Ads? Often both.</h3>
                <p>SEO builds organic visibility that keeps growing. Google Ads bring traffic right away while your SEO gains ground. Many businesses get the best results running the two together.</p>
              </div>
              <Link className="btn btn-ghost" href="/ppc">See Google Ads management <svg><use href="#arr" /></svg></Link>
            </div>
          </div>
        </section>
      </ServicePage>
    </>
  );
}
