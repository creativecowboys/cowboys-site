import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "How to Optimize Your Google Business Profile for More Local Leads | Creative Cowboys",
    description: "Your GBP is your most powerful free local marketing tool. Here's exactly how to optimize every element for more calls, visits, and leads in West Georgia.",
    alternates: { canonical: "/blog/google-business-profile-optimization" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "What is a Google Business Profile?", acceptedAnswer: { "@type": "Answer", text: "Google Business Profile (formerly Google My Business) is a free tool from Google that lets businesses manage how they appear in Google Search and Google Maps. It's the primary factor in whether you appear in the 'Map Pack' — the 3 local businesses shown at the top of local search results." } },
        { "@type": "Question", name: "How do I get more Google reviews for my business?", acceptedAnswer: { "@type": "Answer", text: "The most effective method: send every satisfied client a direct link to your Google review page immediately after service delivery. Add a QR code to your invoices, email signature, and signage. Make the process as frictionless as possible — every extra step reduces completion rate." } },
        { "@type": "Question", name: "How often should I post to Google Business Profile?", acceptedAnswer: { "@type": "Answer", text: "At minimum, once per week. Consistent GBP posting signals to Google that your business is active, which is a ranking signal. Post tips, case study highlights, service spotlights, or seasonal offers — anything that's relevant to your audience." } },
    ],
};

export default function BlogGBPOptimization() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose ul { list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:10px; }
        .prose li { display:flex; align-items:flex-start; gap:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.55); }
        .prose li::before { content:"✓"; color:${ORANGE}; flex-shrink:0; font-weight:900; }
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
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#56CCF2", padding: "4px 10px", background: "rgba(86,204,242,0.12)", borderRadius: "999px" }}>SEO Tips</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 8 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        How to Optimize Your Google Business Profile for More Local Leads
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Your Google Business Profile is the most powerful free local marketing tool available. Here&rsquo;s exactly how to optimize every element — from categories to reviews — to show up when West Georgia customers are searching for you.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>Why GBP Is Your #1 Local Marketing Priority</h2>
                    <p>The Google Map Pack — the three businesses that appear at the top of local search results with a map — receives the majority of clicks for local searches. Your Google Business Profile is the primary factor determining whether you appear there.</p>
                    <p>Unlike your website, which can take months to rank organically, a fully optimized GBP can start driving calls and direction requests within days. And it&rsquo;s completely free.</p>

                    <h2>Step 1: Complete Every Section of Your Profile</h2>
                    <p>Google rewards completeness. An incomplete profile signals a business that&rsquo;s not actively managed. Here&rsquo;s every field you should complete:</p>
                    <ul>
                        <li>Business name (exact match to your actual business name)</li>
                        <li>Primary category (choose the most specific, accurate option)</li>
                        <li>Additional categories (one for each major service you offer)</li>
                        <li>Business description (use all 750 characters — include your services, location, and differentiator)</li>
                        <li>Phone number (must match your website exactly)</li>
                        <li>Website URL</li>
                        <li>Business hours (including holiday hours)</li>
                        <li>Address (must match your website and all citations exactly)</li>
                        <li>Service area (add all cities and counties you serve)</li>
                        <li>Services list (add each service individually with descriptions)</li>
                    </ul>

                    <h2>Step 2: Choose the Right Categories</h2>
                    <p>Your primary category is the single most important GBP optimization decision. It directly affects which searches you appear in. For Creative Cowboys, the right primary category is &ldquo;Internet Marketing Service.&rdquo;</p>
                    <p>Add additional categories for each major service — Web Designer, Advertising Agency, Social Media Marketing Service. Each additional category expands your visibility for different search terms.</p>

                    <h2>Step 3: Photos and Visual Content</h2>
                    <p>GBP profiles with photos get significantly more engagement than those without. Google uses photo count and recency as signals of an active, trustworthy business.</p>
                    <ul>
                        <li>Upload 10+ high-quality photos minimum</li>
                        <li>Include team photos, office/location photos, product/work photos</li>
                        <li>Add before-and-after shots for service businesses</li>
                        <li>Add a cover photo and logo that represent your brand</li>
                        <li>Continue adding new photos monthly</li>
                    </ul>

                    <h2>Step 4: Reviews — Your Most Powerful Ranking Signal</h2>
                    <p>Reviews are a critical component of local rankings. Google considers review quantity, average rating, recency, and your response pattern. Here&rsquo;s how to build a strong review profile:</p>
                    <ul>
                        <li>Target 25+ reviews with an average above 4.7 for strong local competitiveness</li>
                        <li>Send every satisfied client a direct link immediately after service</li>
                        <li>Add your review link to invoices, email signatures, and receipts</li>
                        <li>Respond to every review — positive and negative — within 24 hours</li>
                        <li>For negative reviews, respond professionally and offer to resolve offline</li>
                    </ul>

                    <h2>Step 5: Weekly GBP Posts</h2>
                    <p>GBP posts appear in your business listing in search results. They signal to Google that your business is active — a direct ranking factor. Post at least once per week:</p>
                    <ul>
                        <li>Tips and educational content related to your services</li>
                        <li>Case study highlights and client wins</li>
                        <li>Service spotlights with pricing (if appropriate)</li>
                        <li>Seasonal offers and promotions</li>
                        <li>Behind-the-scenes content from your team</li>
                    </ul>

                    <h2>Step 6: Pre-Populate the Q&A Section</h2>
                    <p>Anyone can add questions to your GBP — including your competitors. Get ahead of this by posting and answering your own FAQs. Common questions to address:</p>
                    <ul>
                        <li>What services do you offer?</li>
                        <li>What areas do you serve?</li>
                        <li>What are your prices / do you offer free consultations?</li>
                        <li>How long does the process take?</li>
                        <li>Are you accepting new clients?</li>
                    </ul>

                    <h2>Monitoring Your GBP Performance</h2>
                    <p>GBP Insights shows you how many people found your profile, what actions they took (calls, direction requests, website visits), and what search terms triggered your listing. Check this monthly and use it to guide your posting and optimization strategy.</p>
                    <p>This connects directly to your broader <Link href="/seo">local SEO strategy</Link> — GBP optimization and website SEO work best when they reinforce each other.</p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to grow your West Georgia business?</h2>
                        <p style={{ margin: "0 0 28px" }}>Get a free consultation and we&rsquo;ll audit your GBP and local SEO presence.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Local SEO Consultation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/local-seo-guide-west-georgia" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>The Complete Local SEO Guide for West Georgia →</Link>
                            <Link href="/seo" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Explore our SEO Services →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
