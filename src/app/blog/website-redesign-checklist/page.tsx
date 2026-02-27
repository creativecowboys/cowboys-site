import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Website Redesign Checklist: 15 Things Your New Site Must Have | Creative Cowboys",
    description: "Before you launch a new website, run through this checklist. Missing any of these is leaving money on the table. From Creative Cowboys, West Georgia's web design experts.",
    alternates: { canonical: "/blog/website-redesign-checklist" },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "How often should I redesign my website?", acceptedAnswer: { "@type": "Answer", text: "Most businesses benefit from a significant redesign every 3–5 years to keep up with design trends, device capabilities, and search engine requirements. That said, ongoing optimization is more valuable than periodic full redesigns." } },
        { "@type": "Question", name: "What is the most important thing on a business website?", acceptedAnswer: { "@type": "Answer", text: "A clear, compelling value proposition that answers 'what you do, who you do it for, and why you're the best choice' — visible above the fold without scrolling. After that, clear calls-to-action that make it easy for visitors to take the next step." } },
    ],
};

const items = [
    { num: "01", title: "Clear Value Proposition Above the Fold", desc: "The first thing visitors see should answer: what you do, who you serve, and why you're the best choice. If it's unclear in 3 seconds, they're gone." },
    { num: "02", title: "Mobile-First Design", desc: "Over 60% of web traffic is mobile. Your site must look and function perfectly on phones — not just be 'responsive.'" },
    { num: "03", title: "Page Load Speed Under 3 Seconds", desc: "53% of mobile visitors leave if a page takes more than 3 seconds to load. Compress images, minify code, use a CDN." },
    { num: "04", title: "SEO-Optimized On Every Page", desc: "Every page needs a unique title tag, meta description, proper H1, and target keyword integration from day one." },
    { num: "05", title: "Conversion-Focused CTAs", desc: "Every page should have a clear next step — call now, contact us, get a quote. Don't make visitors hunt for how to work with you." },
    { num: "06", title: "Schema Markup (JSON-LD)", desc: "LocalBusiness schema, Service schema on service pages, FAQPage schema on FAQ sections. This helps Google understand your site and can produce rich results." },
    { num: "07", title: "SSL Certificate (HTTPS)", desc: "Google penalizes non-HTTPS sites and visitors see scary 'Not Secure' warnings. This is non-negotiable." },
    { num: "08", title: "Google Analytics 4 Installed", desc: "You need to know who's visiting, where they came from, and what they're doing. GA4 should be installed and tracking conversions from day one." },
    { num: "09", title: "Contact Form That Actually Works", desc: "Test your contact form. Test it again. Nothing kills conversions like a broken form — and you won't know it's broken if you don't test regularly." },
    { num: "10", title: "Testimonials and Social Proof", desc: "Real quotes from real clients, ideally with photos and names. Video testimonials are even better. Trust is built before the phone call happens." },
    { num: "11", title: "Google Reviews Integration or Display", desc: "Your Google review rating displayed prominently signals instant credibility to new visitors." },
    { num: "12", title: "NAP Consistency", desc: "Your Name, Address, and Phone number must be identical everywhere online — on your site, GBP, directories, and social profiles." },
    { num: "13", title: "Open Graph Tags for Social Sharing", desc: "When someone shares your link on social media, OG tags control what the preview card looks like. A well-configured card dramatically increases click-through." },
    { num: "14", title: "XML Sitemap Submitted to Google Search Console", desc: "Tells Google every page on your site and how to prioritize them. Submit it to Google Search Console and verify your site." },
    { num: "15", title: "Core Web Vitals Passing", desc: "Google's LCP, CLS, and INP metrics directly affect rankings. Check your Core Web Vitals in Google Search Console and fix any 'Poor' or 'Needs Improvement' pages." },
];

export default function BlogWebsiteRedesignChecklist() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease,transform 180ms ease; }
        .cta-primary:hover { background:#d04c1c; transform:translateY(-1px); }
        .checklist-item { border-bottom:1px solid rgba(255,255,255,0.05); padding:24px 0; display:flex; gap:20px; align-items:flex-start; }
        .checklist-item:last-child { border-bottom:none; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: PINK, padding: "4px 10px", background: "rgba(234,81,255,0.12)", borderRadius: "999px" }}>Web Design</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 9 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        Website Redesign Checklist: 15 Things Your New Site Must Have
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Before you launch — or before you sign off on your new website — run through this checklist. Every item on this list is something we&rsquo;ve seen clients miss, and every one of them costs you leads.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>Why Most Website Redesigns Fall Short</h2>
                    <p>A website redesign usually starts with aesthetics — &ldquo;we want it to look more modern&rdquo; — and ends with a beautiful site that doesn&rsquo;t rank, doesn&rsquo;t convert, and doesn&rsquo;t integrate with analytics. We&rsquo;ve audited hundreds of sites for West Georgia businesses and the same gaps appear over and over.</p>
                    <p>This checklist covers every critical element — design, SEO, technical, and conversion. If your new site ticks all 15 boxes, you&rsquo;re launching from a position of strength. If it&rsquo;s missing even a few, you&rsquo;re leaving money on the table from day one.</p>

                    <h2>The 15 Must-Haves</h2>
                    <div style={{ background: "#15181e", borderRadius: "16px", padding: "8px 24px", border: "1px solid rgba(255,255,255,0.07)", margin: "24px 0" }}>
                        {items.map(({ num, title, desc }) => (
                            <div key={num} className="checklist-item">
                                <span style={{ fontSize: "28px", fontWeight: 900, color: ORANGE, minWidth: "40px", lineHeight: 1, flexShrink: 0, letterSpacing: "-0.02em" }}>{num}</span>
                                <div>
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{title}</h3>
                                    <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2>Bonus: Ongoing Optimization</h2>
                    <p>A website launch is the beginning, not the end. The sites that perform best over time are continuously improved based on data. Set up Google Search Console and GA4 from day one, review your data monthly, and make iterative improvements to content, CTAs, and page speed.</p>
                    <p>Our <Link href="/web-design">web design team in West Georgia</Link> builds every site with all 15 of these elements built in — and we provide ongoing SEO support to keep it ranking and converting after launch.</p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to build a website that actually performs?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation. We&rsquo;ll review your current site and tell you exactly what&rsquo;s holding it back.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Web Design Consultation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/local-seo-guide-west-georgia" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>The Complete Local SEO Guide for West Georgia →</Link>
                            <Link href="/web-design" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Explore our Web Design services →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
