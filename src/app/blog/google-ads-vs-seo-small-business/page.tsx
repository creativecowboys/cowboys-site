import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Google Ads vs. SEO: Which Is Better for Your West Georgia Business? | Creative Cowboys",
    description: "Both Google Ads and SEO work. The right answer depends on your timeline, budget, and goals. Here's how to decide for your West Georgia small business.",
    alternates: { canonical: "/blog/google-ads-vs-seo-small-business" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "Should I do SEO or Google Ads first?", acceptedAnswer: { "@type": "Answer", text: "If you need leads now, start with Google Ads. If you have 6+ months of runway, investing in SEO first will pay compounding dividends. Most West Georgia businesses benefit most from running both simultaneously." } },
        { "@type": "Question", name: "Can I do both SEO and Google Ads at the same time?", acceptedAnswer: { "@type": "Answer", text: "Yes — and we recommend it. Google Ads provides immediate traffic while SEO builds organic rankings. As your organic rankings improve over time, you can reduce ad spend while maintaining lead volume." } },
        { "@type": "Question", name: "Which has better ROI — SEO or PPC?", acceptedAnswer: { "@type": "Answer", text: "SEO typically delivers higher long-term ROI because organic traffic is free once you're ranking. But Google Ads delivers immediate, measurable results. The highest-ROI strategy usually involves both working together." } },
    ],
};

export default function BlogGoogleAdsVsSEO() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose ul { list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:10px; }
        .prose li { display:flex; align-items:flex-start; gap:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.55); }
        .prose li::before { content:"→"; color:${ORANGE}; flex-shrink:0; font-weight:700; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .prose a:hover { text-decoration:underline; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease,transform 180ms ease; }
        .cta-primary:hover { background:#d04c1c; transform:translateY(-1px); }
        .compare-table { width:100%; border-collapse:collapse; margin:24px 0; }
        .compare-table th { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.70); font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:12px 16px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.08); }
        .compare-table td { padding:12px 16px; font-size:15px; color:rgba(255,255,255,0.55); border-bottom:1px solid rgba(255,255,255,0.05); vertical-align:top; line-height:1.6; }
        .compare-table tr:last-child td { border-bottom:none; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ORANGE, padding: "4px 10px", background: "rgba(241,95,42,0.12)", borderRadius: "999px" }}>PPC & Google Ads</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 8 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        Google Ads vs. SEO: Which Is Better for Your West Georgia Business?
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Both work. The real question is: which is right for your business, right now? Here&rsquo;s the honest breakdown so you can make the right decision.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>The Core Difference</h2>
                    <p><strong style={{ color: "rgba(255,255,255,0.80)" }}>Google Ads (PPC)</strong> puts your business at the top of search results immediately — but only as long as you&rsquo;re paying. Stop paying, results stop.</p>
                    <p><strong style={{ color: "rgba(255,255,255,0.80)" }}>SEO</strong> builds your organic ranking over time. It takes 3–6+ months to see significant results, but once you rank, the traffic is essentially free — and it compounds over time.</p>
                    <p>Neither is objectively better. The right choice depends on your timeline, budget, market competitiveness, and business goals.</p>

                    <h2>Side-by-Side Comparison</h2>
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th>Factor</th>
                                <th>Google Ads (PPC)</th>
                                <th>SEO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Time to results</td><td>Days to weeks</td><td>3–6 months</td></tr>
                            <tr><td>Cost structure</td><td>Pay-per-click (ongoing)</td><td>Monthly service fee, no cost-per-click</td></tr>
                            <tr><td>Long-term ROI</td><td>Stops when budget stops</td><td>Compounds over time</td></tr>
                            <tr><td>Targeting control</td><td>Precise (keyword, location, time)</td><td>Less direct control</td></tr>
                            <tr><td>Trust signals</td><td>Ad label may reduce clicks</td><td>Organic results trusted more</td></tr>
                            <tr><td>Best for</td><td>Immediate lead generation</td><td>Long-term market domination</td></tr>
                        </tbody>
                    </table>

                    <h2>When Google Ads Is the Right Choice</h2>
                    <ul>
                        <li>You need leads now — launching a new business or entering a new market</li>
                        <li>You have a seasonal service with a defined window (roofing after storm season, HVAC in summer)</li>
                        <li>You want to test which keywords convert before investing in SEO content</li>
                        <li>Your market is so competitive that SEO alone won&rsquo;t cut through fast enough</li>
                    </ul>

                    <h2>When SEO Is the Right Choice</h2>
                    <ul>
                        <li>You have a 6–12 month timeline to see results and want sustainable growth</li>
                        <li>Your ad costs are high and you want to reduce reliance on paid traffic over time</li>
                        <li>You want to own your market — not just rent visibility</li>
                        <li>You want to build a content and brand presence that compounds over years</li>
                    </ul>

                    <h2>The Best Strategy for Most West Georgia Businesses</h2>
                    <p>Run both. Here&rsquo;s why this works:</p>
                    <ul>
                        <li>Google Ads generates immediate leads while your SEO foundation is being built</li>
                        <li>SEO data from Google Search Console informs which keywords to prioritize in your ad campaigns</li>
                        <li>As organic rankings improve, you can reduce ad spend on keywords where you now rank organically — lowering your cost-per-lead</li>
                        <li>You&rsquo;re visible in both the paid and organic results for high-intent searches — owning more real estate on the page</li>
                    </ul>
                    <p>This is the exact approach we took with several of our West Georgia clients. <Link href="/results">See our results page for real examples →</Link></p>

                    <h2>How to Decide: Ask These Questions</h2>
                    <ul>
                        <li>Do I need leads in the next 30 days? → Prioritize Google Ads</li>
                        <li>Am I willing to invest for 6–12 months to own organic rankings? → Prioritize SEO</li>
                        <li>Do I have a budget for both? → Run both together</li>
                        <li>Is my market extremely competitive locally? → Start with Google Ads, build SEO simultaneously</li>
                    </ul>

                    <h2>What Creative Cowboys Recommends</h2>
                    <p>We&rsquo;ve run hundreds of Google Ads campaigns and done extensive SEO work across West Georgia industries. Our honest recommendation: if your budget allows, invest in both from the start. If you have to choose, pick based on your timeline. Need leads in 60 days? PPC first. Thinking 12 months out? SEO first.</p>
                    <p>Learn more about our specific services: <Link href="/seo">SEO services</Link> and <Link href="/ppc">Google Ads & PPC management</Link>.</p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to grow your West Georgia business?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation — we&rsquo;ll recommend the right mix of SEO and PPC for your specific situation.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Consultation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/how-long-does-seo-take" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>How Long Does SEO Take? A Realistic Timeline →</Link>
                            <Link href="/blog/how-much-does-google-ads-cost" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>How Much Do Google Ads Cost? A Transparent Breakdown →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
