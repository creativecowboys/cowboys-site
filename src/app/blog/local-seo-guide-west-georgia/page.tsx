import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "The Complete Local SEO Guide for West Georgia Small Businesses (2025) | Creative Cowboys",
    description: "Everything you need to rank in local search — keywords, Google Business Profile, on-page SEO, and link building — in one comprehensive guide for West Georgia businesses.",
    alternates: { canonical: "/blog/local-seo-guide-west-georgia" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "What is local SEO?", acceptedAnswer: { "@type": "Answer", text: "Local SEO is the process of optimizing your online presence so your business appears when people search for your services in a specific geographic area — like 'marketing agency Villa Rica GA' or 'plumber near me' in West Georgia." } },
        { "@type": "Question", name: "How do I rank in the Google Map Pack?", acceptedAnswer: { "@type": "Answer", text: "The Google Map Pack (the 3 businesses that appear with a map in local search results) is primarily driven by your Google Business Profile optimization, proximity to the searcher, and review quantity/quality. A fully optimized GBP with recent reviews is the highest-leverage action for most local businesses." } },
        { "@type": "Question", name: "How many Google reviews do I need to rank locally?", acceptedAnswer: { "@type": "Answer", text: "There's no magic number, but reviews are a critical ranking signal. In most West Georgia markets, 25+ reviews with a 4.7+ average rating puts you in a strong competitive position. Consistent recent reviews matter more than a large number of old ones." } },
    ],
};

export default function BlogLocalSEOGuide() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose ul,.prose ol { list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:10px; }
        .prose li { display:flex; align-items:flex-start; gap:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.55); }
        .prose li::before { content:"→"; color:${ORANGE}; flex-shrink:0; font-weight:700; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .prose a:hover { text-decoration:underline; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease,transform 180ms ease; }
        .cta-primary:hover { background:#d04c1c; transform:translateY(-1px); }
        .checklist-box { background:#15181e; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px; margin:32px 0; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#2ED573", padding: "4px 10px", background: "rgba(46,213,115,0.12)", borderRadius: "999px" }}>SEO Tips</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 12 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        The Complete Local SEO Guide for West Georgia Small Businesses (2025)
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Everything you need to dominate local search in Villa Rica, Carrollton, Douglasville, and across West Georgia — from GBP optimization to link building.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>What Is Local SEO?</h2>
                    <p>Local SEO is the practice of optimizing your online presence to rank for searches with local intent — searches where the person is looking for a business in a specific location. When someone searches &ldquo;marketing agency near me&rdquo; or &ldquo;SEO company Villa Rica GA&rdquo; — they want a local business, and Google&rsquo;s algorithm is specifically designed to surface the most relevant, trustworthy local options.</p>
                    <p>For West Georgia small businesses, local SEO is the single highest-ROI marketing channel available. It targets buyers who are ready to purchase, not people casually browsing. And unlike paid ads, the traffic is free once you&rsquo;re ranking.</p>

                    <h2>The 5 Pillars of Local SEO</h2>
                    <p>Ranking in local search comes down to five core areas. Get all five right, and you become very difficult to knock off the first page.</p>

                    <h3>1. Google Business Profile (GBP) Optimization</h3>
                    <p>Your Google Business Profile is the single most important local SEO asset you have. It&rsquo;s what populates the Map Pack — the three businesses that appear with a map above all organic results. This position gets the majority of local clicks.</p>
                    <ul>
                        <li>Complete every field in your GBP — business name, categories, hours, phone, website, description</li>
                        <li>Choose the most accurate primary category (for most agencies: &ldquo;Internet Marketing Service&rdquo;)</li>
                        <li>Add additional categories for each service you offer</li>
                        <li>Upload 10+ high-quality photos of your team, office, and work</li>
                        <li>Post to your GBP weekly — tips, case studies, seasonal offers</li>
                        <li>Pre-populate the Q&A section with common questions</li>
                        <li>Respond to every review, positive and negative, within 24 hours</li>
                    </ul>

                    <h3>2. On-Page SEO for Local Keywords</h3>
                    <p>Every page on your website should target specific keywords that match local search intent. The key elements Google evaluates:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Title tag</strong> — Include your primary keyword + city in every page&rsquo;s title tag</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>H1</strong> — One H1 per page, incorporating your keyword naturally</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Meta description</strong> — Include keyword + a compelling reason to click</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>NAP consistency</strong> — Your Name, Address, Phone should match exactly across your site and GBP</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Schema markup</strong> — LocalBusiness schema tells Google exactly what you are, where you are, and what you offer</li>
                    </ul>

                    <h3>3. Local Keyword Strategy</h3>
                    <p>The biggest mistake West Georgia businesses make is targeting generic keywords instead of local ones. &ldquo;Marketing agency&rdquo; has national competition from thousands of companies. &ldquo;Marketing agency Villa Rica GA&rdquo; has far less competition and far more buying intent.</p>
                    <p>Build your keyword strategy around three tiers:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>City + service</strong> — &ldquo;SEO company West Georgia,&rdquo; &ldquo;web design Villa Rica GA&rdquo;</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Near me variations</strong> — These are handled largely by GBP optimization and your service area settings</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Long-tail local</strong> — &ldquo;how to get more customers in Carrollton GA,&rdquo; &ldquo;best marketing agency for small business in West Georgia&rdquo;</li>
                    </ul>

                    <h3>4. Local Landing Pages</h3>
                    <p>If you serve multiple cities across West Georgia, you need dedicated landing pages for each location. One page targeting all cities doesn&rsquo;t work as well as individual pages because Google rewards specificity.</p>
                    <p>A good local landing page for Carrollton, for example, would have:</p>
                    <ul>
                        <li>H1 targeting Carrollton specifically (e.g., &ldquo;Digital Marketing Agency in Carrollton, GA&rdquo;)</li>
                        <li>Content addressing Carrollton businesses specifically</li>
                        <li>Local testimonials or case studies from Carrollton clients if possible</li>
                        <li>Links to your service pages and contact page</li>
                    </ul>

                    <h3>5. Reviews and Reputation</h3>
                    <p>Google uses review quantity, recency, and rating as direct ranking signals for local results. Reviews also influence conversion — a business with 50 reviews at 4.8 stars will outconvert a competitor with 5 reviews at 5.0 stars.</p>
                    <ul>
                        <li>Target 25+ reviews with an average above 4.7 for strong local competitiveness</li>
                        <li>Ask every satisfied client for a review immediately after the relationship begins</li>
                        <li>Send a direct link to your GBP review page — reduce the friction</li>
                        <li>Respond to every review promptly</li>
                        <li>Never buy reviews — Google detects and penalizes this</li>
                    </ul>

                    <h2>Technical Local SEO Checklist</h2>
                    <div className="checklist-box">
                        <ul style={{ marginBottom: 0 }}>
                            <li>Site loads in under 2.5 seconds (Largest Contentful Paint)</li>
                            <li>Mobile-friendly design that passes Google&rsquo;s Mobile-Friendly Test</li>
                            <li>SSL certificate active (HTTPS)</li>
                            <li>XML sitemap submitted to Google Search Console</li>
                            <li>Robots.txt properly configured</li>
                            <li>LocalBusiness schema markup on homepage</li>
                            <li>No broken internal links (404 errors)</li>
                            <li>All images have descriptive alt text</li>
                            <li>Canonical tags on all pages to prevent duplicate content</li>
                        </ul>
                    </div>

                    <h2>Link Building for Local SEO</h2>
                    <p>Backlinks from other websites remain one of Google&rsquo;s strongest ranking signals. For local SEO, prioritize:</p>
                    <ul>
                        <li>Local business directories (Google, Yelp, BBB, industry-specific directories)</li>
                        <li>Local Chamber of Commerce websites</li>
                        <li>Local news coverage and press mentions</li>
                        <li>Industry associations and local business groups</li>
                        <li>Guest posts on regional business blogs</li>
                    </ul>

                    <h2>How to Track Your Local SEO Progress</h2>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Google Search Console</strong> — Track keyword impressions, clicks, and ranking positions</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Google Business Profile Insights</strong> — Views, direction requests, calls, and website visits</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Google Analytics 4</strong> — Organic traffic sessions and conversion tracking</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Rank tracking tools</strong> — Monitor your keyword positions over time (SEMrush, Ahrefs)</li>
                    </ul>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to grow your West Georgia business?</h2>
                        <p style={{ margin: "0 0 28px" }}>Get a free consultation. We&rsquo;ll audit your current local SEO presence and build you a clear strategy.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free SEO Audit <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/how-long-does-seo-take" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>How Long Does SEO Take? →</Link>
                            <Link href="/blog/google-business-profile-optimization" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>How to Optimize Your Google Business Profile →</Link>
                            <Link href="/seo" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Explore our West Georgia SEO services →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
