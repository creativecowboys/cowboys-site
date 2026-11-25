import Link from "next/link";
import ServicePage, { type ServicePageData } from "@/components/night-ride/ServicePage";
import { RESULT_HARMONIC, RESULT_MCKINLEY } from "@/components/night-ride/service-content";
import { VIDEO_SHANA, VIDEO_VICTOR } from "@/components/night-ride/home-content";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

// The FAQ answers are plain strings so the same text feeds the page and the FAQ schema.
const faqs = [
  { q: "How much does a website cost?", a: "Custom websites start at $997, one time, and you own the site outright. Hosting, maintenance and updates start at $30 a month. We publish these numbers so you know what to expect before we talk." },
  { q: "How long does a site take?", a: "Most sites launch in 4 to 6 weeks. Smaller monthly-plan sites can launch in as little as 2 weeks. You get a staging link early and can check progress any time." },
  { q: "Do you use templates?", a: "No. Every site is designed around your business, your customers and your goals. Templates are why so many small-business websites look the same and convert poorly." },
  { q: "Who owns the site when we're done?", a: "You do. The domain, the hosting, the files and the design. When the project is done, everything transfers to you. If you ever leave us, you take it all." },
  { q: "Can you redesign my existing site?", a: "Yes. Squarespace, Wix, GoDaddy, WordPress, whatever you have. We audit what is working, keep the search rankings you have built, and rebuild the rest." },
];

const CITIES = [
  { label: "Web design Carrollton, GA", href: "/web-design-carrollton-ga", desc: "County seat, University of West Georgia, Tanner, and Adamson Square. About 15 minutes from our Villa Rica office.", tag: "Carroll County" },
  { label: "Web design Villa Rica, GA", href: "/web-design-villa-rica-ga", desc: "Our hometown. Downtown, The Mill, Mirror Lake, and the I-20 county line between Carroll and Douglas.", tag: "Home base" },
  { label: "Web design Douglasville, GA", href: "/web-design-douglasville-ga", desc: "Douglas County on I-20: Arbor Place, Chapel Hill, downtown, and Lithia Springs. About 20 minutes from the office.", tag: "Douglas County" },
];

const data: ServicePageData = {
  slug: "web_design",
  eyebrow: "Custom web design · Villa Rica, GA",
  titleLead: "Web design that actually",
  titleHighlight: "converts.",
  subhead: (
    <>
      Your website should bring in leads and close sales, and look good doing it. We build fast, custom sites for businesses in{" "}
      <Link href="/web-design-villa-rica-ga">Villa Rica</Link>, <Link href="/web-design-carrollton-ga">Carrollton</Link>,{" "}
      <Link href="/web-design-douglasville-ga">Douglasville</Link> and across the Southeast.
    </>
  ),
  pills: ["Built to convert", "No templates", "SEO built in", "Mobile-first", "No offshore work", "Revenue tracking"],
  secondary: { label: "See our work", href: "#work" },
  heroImage: { src: "/night-ride/hero/web-design.jpg", position: "92% 45%" },
  // Review lines about websites, word for word from the Google profile.
  proof: [
    { who: "Shana Genenbacher", quote: "They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that." },
    { who: "Daniel Hooper", quote: "I had very specific needs for my website, and they worked closely with me to build exactly what my company required." },
    { who: "Ryan Coffey", quote: "Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention." },
  ],
  videos: [VIDEO_VICTOR, VIDEO_SHANA],
  work: {
    heading: <>Sites that pull<br />their weight.</>,
    lede: "Custom builds for venues, realtors, builders, insurers and other local businesses. Click any of them to see the live site.",
  },
  reviews: true,
  blocks: [
    {
      id: "capabilities",
      eyebrow: "What you get",
      heading: <>Custom websites built for <span className="grad">growth.</span></>,
      lede: "No cookie-cutter templates. Every site is designed around your business and built to bring in revenue.",
      items: [
        { tag: "01 / Built to sell", label: "Conversion-focused", desc: "Clear calls to action and a layout that guides visitors toward getting in touch." },
        { tag: "02 / Speed", label: "Lightning fast", desc: "Optimized for speed, because every second of delay costs you conversions and search rankings." },
        { tag: "03 / Every device", label: "Mobile-first", desc: "A clean experience on every screen. We design for the phone first, because that is where your customers are." },
        { tag: "04 / Get found", label: "SEO-ready", desc: "Built with clean code and proper structure so Google can read your site from day one." },
        { tag: "05 / Peace of mind", label: "Secure & scalable", desc: "Secure hosting and a build that grows as your business does." },
        { tag: "06 / Know your numbers", label: "Data-driven", desc: "Connected to analytics so you know how your site is performing." },
      ],
    },
    {
      id: "why",
      eyebrow: "Why Creative Cowboys",
      heading: <>Websites built to bring in <span className="grad">revenue.</span></>,
      lede: "Most web designers are artists. We are marketers. Every part of the page has one job: turn visitors into paying customers.",
      cols: 4,
      items: [
        { label: "Conversion-focused design", desc: "Clear calls to action and a layout that walks visitors to a decision." },
        { label: "SEO built in from day one", desc: "Your site launches ready to rank, with clean code, proper structure and fast load times." },
        { label: "Ad campaign integration", desc: "Landing pages built for your paid traffic, so every dollar you spend works harder." },
        { label: "Analytics & revenue tracking", desc: "Know what is working. We set up tracking tied to your revenue." },
      ],
    },
    {
      id: "who",
      eyebrow: "Who we work with",
      heading: <>Built for businesses that want to <span className="grad">grow.</span></>,
      lede: "We work with companies that see their website as a way to win customers.",
      items: [
        { label: "Local businesses", desc: "Service businesses and brick-and-mortar shops ready to lead their local market online." },
        { label: "Contractors & trades", desc: "Builders, HVAC, electricians and other companies that need leads coming in steadily." },
        { label: "Professional firms", desc: "Law firms, accountants and consultants who need a site that earns trust quickly." },
        { label: "E-commerce brands", desc: "Stores that need a storefront built to convert, beyond an off-the-shelf theme." },
        { label: "Scaling startups", desc: "Early-stage companies that need to establish credibility fast." },
        { label: "B2B services", desc: "Companies selling to other businesses, where trust and clarity drive every deal." },
      ],
    },
    {
      id: "cities",
      eyebrow: "West Georgia",
      heading: <>Web design in <span className="grad">your town.</span></>,
      lede: "The work above covers the Southeast. These pages are the local version: what a site has to do in each West Georgia city, and what it costs.",
      items: CITIES,
    },
  ],
  results: [RESULT_HARMONIC, RESULT_MCKINLEY],
  resultsLede: "Two sites we built, and what they did for the business.",
  steps: {
    eyebrow: "Our process",
    heading: <>Strategy first.<br /><span className="grad">Design second.</span></>,
    lede: "We follow the same four steps on every build, so the site does what your business needs it to do.",
    items: [
      { when: "Step 01", title: "Discovery", body: "We learn your business, your customers and your competitors to find what sets you apart." },
      { when: "Step 02", title: "Structure", body: "We map out the pages and write copy that explains what you do and why to choose you." },
      { when: "Step 03", title: "Design + build", body: "We design and build the site. You get a staging link early so you can follow along." },
      { when: "Step 04", title: "Launch + optimize", body: "We launch, test and connect analytics, then keep improving it from real numbers." },
    ],
  },
  pricing: { line: "Custom websites start at $997, one time, and you own the site.", note: "Hosting, maintenance and updates start at $30 a month. No contract." },
  faqs,
  ctaHeadline: <>Stop losing customers to a <span className="grad">confusing website.</span></>,
  ctaSub: "Free strategy call, no long-term contract. You get a clear plan to turn your website into your hardest-working salesperson.",
};

const pageSchema = graph(
  breadcrumb("Web Design", "/web-design"),
  serviceSchema({
    name: "Web Design Services",
    serviceType: "Custom Website Design and Development",
    description: "Custom web design built to bring in leads and revenue. Fast, mobile-first, and SEO-ready from day one.",
    path: "/web-design",
  }),
  {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
);

export default function WebDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <ServicePage data={data} />
    </>
  );
}
