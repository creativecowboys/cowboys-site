import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Digital Marketing Blog | Creative Cowboys",
    description:
        "The Creative Cowboys blog — no-fluff digital marketing tips, SEO strategies, and growth insights for small businesses in West Georgia and beyond.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Digital Marketing Blog | Creative Cowboys",
        description: "No-fluff digital marketing tips, SEO strategies, and growth insights for West Georgia small businesses.",
    },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";
const CARD = "#15181e";

const posts = [
    { slug: "how-long-does-seo-take", title: "How Long Does SEO Take? A Realistic Timeline for West Georgia Small Businesses", category: "SEO Tips", readTime: "7 min read", excerpt: "Honest answer: most businesses see meaningful movement in 3–6 months. Here's exactly what to expect and when.", color: "#56CCF2" },
    { slug: "google-ads-vs-seo-small-business", title: "Google Ads vs. SEO: Which Is Better for Your West Georgia Business?", category: "PPC & Google Ads", readTime: "8 min read", excerpt: "Both work. The right answer depends on your timeline, budget, and goals. Here's how to decide.", color: ORANGE },
    { slug: "local-seo-guide-west-georgia", title: "The Complete Local SEO Guide for West Georgia Small Businesses (2025)", category: "SEO Tips", readTime: "12 min read", excerpt: "Everything you need to rank in local search — keywords, GBP, on-page, and link building — in one comprehensive guide.", color: "#2ED573" },
    { slug: "how-much-does-google-ads-cost", title: "How Much Do Google Ads Cost? A Transparent Breakdown for Small Businesses", category: "PPC & Google Ads", readTime: "6 min read", excerpt: "No fluff. Here's a real breakdown of what Google Ads costs — ad spend, management fees, and what to expect.", color: ORANGE },
    { slug: "website-redesign-checklist", title: "Website Redesign Checklist: 15 Things Your New Site Must Have", category: "Web Design", readTime: "9 min read", excerpt: "Before you launch a new website, run through this checklist. Missing any of these is leaving money on the table.", color: PINK },
    { slug: "google-business-profile-optimization", title: "How to Optimize Your Google Business Profile for More Local Leads", category: "SEO Tips", readTime: "8 min read", excerpt: "Your GBP is your most powerful free local marketing tool. Here's exactly how to optimize every element.", color: "#56CCF2" },
    { slug: "facebook-ads-small-business", title: "Do Facebook Ads Work for Small Businesses? (Honest Answer)", category: "Social Media", readTime: "7 min read", excerpt: "Yes — but only when done right. Here's what works, what doesn't, and what to expect from your first campaign.", color: PINK },
    { slug: "seo-for-law-firms-georgia", title: "SEO for Law Firms in Georgia: How to Rank in a Competitive Market", category: "SEO Tips", readTime: "10 min read", excerpt: "Law firm SEO is one of the most competitive markets in Georgia. Here's the strategy we used to get 21 #1 rankings.", color: "#F7B731" },
    { slug: "what-to-look-for-marketing-agency", title: "What to Look for When Hiring a Digital Marketing Agency in West Georgia", category: "Agency Advice", readTime: "7 min read", excerpt: "Red flags, green flags, and the exact questions to ask before signing with any marketing agency.", color: ORANGE },
    { slug: "ppc-mistakes-small-business", title: "10 Google Ads Mistakes Small Businesses Make (And How to Fix Them)", category: "PPC & Google Ads", readTime: "9 min read", excerpt: "We've audited hundreds of ad accounts. Here are the most common mistakes killing your ROI — and exactly how to fix them.", color: "#FF6B6B" },
];

const categories = ["All", "SEO Tips", "PPC & Google Ads", "Web Design", "Social Media", "Agency Advice"];

export default function BlogPage() {
    return (
        <>
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu-1 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
        .fu-3 { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.30s both; }
        @media (prefers-reduced-motion: reduce) { .fu-1,.fu-2,.fu-3 { animation: none; } }
        .post-card { transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease; }
        .post-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.40); border-color: rgba(255,255,255,0.15) !important; }
        .cta-primary { background: ${ORANGE}; transition: background 180ms ease, transform 180ms ease; }
        .cta-primary:hover { background: #d04c1c; transform: translateY(-1px); }
        .blog-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
        @media (max-width: 1024px) { .blog-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .blog-grid { grid-template-columns: 1fr; } }
        .cat-chip { display: inline-flex; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.45); cursor: default; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                {/* ── Hero ── */}
                <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 24px 80px", textAlign: "center", position: "relative" }}>
                    <div aria-hidden style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(241,95,42,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <p className="fu-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: "20px" }}>The Creative Cowboys Blog</p>
                    <h1 className="fu-2" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 24px" }}>
                        Digital Marketing Tips, Strategies &{" "}
                        <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Insights.</span>
                    </h1>
                    <p className="fu-3" style={{ fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: "0", maxWidth: "600px", marginInline: "auto" }}>
                        No-fluff digital marketing knowledge for West Georgia small businesses. Written by practitioners, not content farms.
                    </p>
                </section>

                {/* ── Category Chips ── */}
                <section style={{ padding: "0 24px 48px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                        {categories.map(cat => (
                            <span key={cat} className="cat-chip" style={{ background: cat === "All" ? "rgba(241,95,42,0.15)" : "rgba(255,255,255,0.03)", borderColor: cat === "All" ? "rgba(241,95,42,0.40)" : undefined, color: cat === "All" ? ORANGE : undefined }}>
                                {cat}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── Latest Posts ── */}
                <section style={{ padding: "0 24px 96px" }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 40px", letterSpacing: "-0.02em" }}>Latest Posts</h2>
                        <div className="blog-grid">
                            {posts.map(({ slug, title, category, readTime, excerpt, color }) => (
                                <Link key={slug} href={`/blog/${slug}`} className="post-card" style={{ display: "block", background: "#15181e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "32px", textDecoration: "none", position: "relative", overflow: "hidden" }}>
                                    <div aria-hidden style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: `${color}14`, filter: "blur(30px)", borderRadius: "50%", pointerEvents: "none" }} />
                                    <div style={{ position: "relative", zIndex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color, padding: "4px 10px", background: `${color}18`, borderRadius: "999px" }}>{category}</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "rgba(255,255,255,0.30)" }}><Clock size={12} />{readTime}</span>
                                        </div>
                                        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.45, letterSpacing: "-0.01em" }}>{title}</h3>
                                        <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.42)", margin: "0 0 20px" }}>{excerpt}</p>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color, textDecoration: "none" }}>
                                            Read article <ArrowRight size={13} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Topic Sections ── */}
                <section style={{ background: "#15181e", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "80px 24px" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
                        <BookOpen size={32} color={ORANGE} style={{ marginBottom: "16px" }} />
                        <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                            Topics We Cover
                        </h2>
                        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "560px", marginInline: "auto" }}>
                            Every article is written to help you make better marketing decisions for your West Georgia business.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                            {["SEO Tips", "Google Ads & PPC", "Web Design", "Social Media Marketing", "Local Marketing", "Agency Advice", "Case Studies", "West Georgia Business"].map(t => (
                                <span key={t} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "999px", fontSize: "13px", color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: "96px 24px", textAlign: "center" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                            Ready to put this into action?
                        </h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "32px" }}>
                            Reading about marketing is a great start. Having Creative Cowboys execute it for you is even better.
                        </p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "16px 40px", color: "#fff", fontWeight: 700, fontSize: "16px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Consultation <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
