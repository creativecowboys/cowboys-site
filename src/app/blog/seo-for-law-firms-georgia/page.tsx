import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "SEO for Law Firms in Georgia: How to Rank in a Competitive Market | Creative Cowboys",
    description: "Law firm SEO is one of the most competitive markets in Georgia. Here's the strategy we used to get a client 21 #1 rankings in personal injury law search terms.",
    alternates: { canonical: "/blog/seo-for-law-firms-georgia" },
};

const ORANGE = "#F15F2A";
const GOLD = "#F7B731";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "How competitive is law firm SEO in Georgia?", acceptedAnswer: { "@type": "Answer", text: "Personal injury and criminal defense law are among the most competitive SEO markets in the state. Cost-per-click in Google Ads for some personal injury terms exceeds $100. Organic SEO is a critical differentiator because a single top ranking can be worth hundreds of thousands in annual revenue." } },
        { "@type": "Question", name: "What keywords should a law firm target for SEO?", acceptedAnswer: { "@type": "Answer", text: "Law firms should build a keyword strategy across three tiers: practice area + location (e.g., 'personal injury attorney Villa Rica GA'), informational queries ('what to do after a car accident in Georgia'), and long-tail questions ('how long do I have to file a personal injury claim in Georgia')." } },
    ],
};

export default function BlogLawFirmSEO() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose ul { list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:10px; }
        .prose li { display:flex; align-items:flex-start; gap:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.55); }
        .prose li::before { content:"→"; color:${GOLD}; flex-shrink:0; font-weight:700; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease; }
        .cta-primary:hover { background:#d04c1c; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: GOLD, padding: "4px 10px", background: "rgba(247,183,49,0.12)", borderRadius: "999px" }}>SEO Tips</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 10 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        SEO for Law Firms in Georgia: How to Rank in a Competitive Market
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Law firm SEO is one of the most competitive — and highest-value — SEO markets in Georgia. Here&rsquo;s the exact strategy we used to help John B. Jackson Law achieve 21 #1 rankings in personal injury search terms.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>Why Law Firm SEO Is Different</h2>
                    <p>Legal keywords are some of the most expensive in Google Ads — personal injury terms in Georgia can cost $50–$100+ per click. This means a single first-page organic ranking can be worth hundreds of thousands of dollars in annual revenue. The stakes are high, and so is the competition.</p>
                    <p>Georgia law firms that dominate search results typically have invested years into their domain authority, content depth, and local presence. To compete, you need a comprehensive strategy — not just a few optimized pages.</p>

                    <h2>The Jackson Law Case Study</h2>
                    <p>John B. Jackson Law came to Creative Cowboys entirely dependent on referrals. Their website had minimal content, weak on-page SEO, and virtually no organic visibility for competitive personal injury terms.</p>
                    <p>Within 6 months of implementing a systematic SEO strategy, they held 21 #1 positions in Google for their target personal injury keywords. Organic search became their primary lead channel — delivering consistent, qualified leads without the cost-per-click overhead of advertising.</p>
                    <p><Link href="/results">Read the full case study →</Link></p>

                    <h2>The Law Firm SEO Strategy That Works in Georgia</h2>
                    <h3>1. Comprehensive Keyword Research</h3>
                    <p>Law firm keywords break into three tiers:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>High-intent transactional</strong> — &ldquo;personal injury attorney Villa Rica GA,&rdquo; &ldquo;car accident lawyer West Georgia&rdquo; — people ready to hire</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Informational</strong> — &ldquo;what to do after a car accident in Georgia,&rdquo; &ldquo;how long do personal injury cases take&rdquo; — people in early research mode who become future clients</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Local</strong> — &ldquo;law firm near me&rdquo; type searches handled through GBP and local landing pages</li>
                    </ul>

                    <h3>2. Practice Area Pages with Deep Content</h3>
                    <p>Each practice area needs its own dedicated page — not a paragraph on a general services page. A strong practice area page has:</p>
                    <ul>
                        <li>H1 targeting the primary keyword (e.g., &ldquo;Personal Injury Attorney in Villa Rica, GA&rdquo;)</li>
                        <li>800–2,000+ words of genuinely useful content</li>
                        <li>FAQs answering the questions injury victims actually ask</li>
                        <li>Clear CTAs with your phone number visible above the fold</li>
                        <li>Schema markup (LegalService, FAQPage)</li>
                    </ul>

                    <h3>3. Blog Content Targeting Informational Queries</h3>
                    <p>The attorneys who dominate Georgia legal search have answered hundreds of questions prospects are already Googling. Topics like:</p>
                    <ul>
                        <li>&ldquo;How long do I have to file a personal injury claim in Georgia?&rdquo;</li>
                        <li>&ldquo;What is comparative negligence in Georgia?&rdquo;</li>
                        <li>&ldquo;Average settlement amounts for car accidents in Georgia&rdquo;</li>
                    </ul>
                    <p>Each post attracts people early in their decision-making process and builds your authority as the expert they should call when ready.</p>

                    <h3>4. Local SEO Infrastructure</h3>
                    <ul>
                        <li>Fully optimized Google Business Profile (primary category: &ldquo;Personal Injury Attorney&rdquo;)</li>
                        <li>Consistent NAP across all citations and directories</li>
                        <li>Reviews from clients (handled carefully within Georgia State Bar guidelines)</li>
                        <li>Local landing pages for each county/city you serve</li>
                    </ul>

                    <h3>5. Authority Building Through Link Acquisition</h3>
                    <p>Law firm SEO requires domain authority. Backlinks from legal directories (Avvo, Justia, FindLaw, courts.gov), local news coverage, bar association websites, and community involvement are the highest-value sources.</p>

                    <h2>Is PPC or SEO Better for Law Firms?</h2>
                    <p>Both. PPC delivers immediate qualified leads; SEO builds compounding organic visibility that over time costs nothing per click. The highest-performing law firm marketers in Georgia run both simultaneously. See our <Link href="/blog/google-ads-vs-seo-small-business">SEO vs. PPC comparison →</Link></p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to dominate legal search in West Georgia?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation. We&rsquo;ll audit your current rankings and build a strategy to own your market.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Law Firm SEO Consultation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/results" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>See the Jackson Law case study →</Link>
                            <Link href="/blog/local-seo-guide-west-georgia" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>The Complete Local SEO Guide for West Georgia →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
