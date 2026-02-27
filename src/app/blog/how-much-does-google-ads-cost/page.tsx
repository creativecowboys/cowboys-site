import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "How Much Do Google Ads Cost? A Transparent Breakdown for Small Businesses | Creative Cowboys",
    description: "No fluff. Here's a real breakdown of what Google Ads costs — ad spend, management fees, and what to expect for West Georgia small businesses.",
    alternates: { canonical: "/blog/how-much-does-google-ads-cost" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "What is the minimum budget for Google Ads?", acceptedAnswer: { "@type": "Answer", text: "Google itself has no minimum. However, we recommend a minimum of $500/month in ad spend for most West Georgia markets to gather enough data to optimize effectively. Very low budgets often don't generate enough clicks to learn what's working." } },
        { "@type": "Question", name: "Is Google Ads worth it for small businesses?", acceptedAnswer: { "@type": "Answer", text: "Yes — when managed correctly. We've sustained 2+ years of positive ROI for a commercial insurance client through Google Ads. The key is proper campaign structure, keyword targeting, and conversion tracking so you know exactly what you're getting for your money." } },
        { "@type": "Question", name: "How much should I spend on Google Ads per month?", acceptedAnswer: { "@type": "Answer", text: "Most West Georgia small businesses start with $500–$2,000/month in ad spend depending on their market competitiveness and goals. We'll recommend a specific budget after reviewing your industry and target market." } },
    ],
};

export default function BlogGoogleAdsCost() {
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
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease,transform 180ms ease; }
        .cta-primary:hover { background:#d04c1c; transform:translateY(-1px); }
        .cost-table { width:100%; border-collapse:collapse; margin:24px 0; }
        .cost-table th { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.70); font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:12px 16px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.08); }
        .cost-table td { padding:12px 16px; font-size:15px; color:rgba(255,255,255,0.55); border-bottom:1px solid rgba(255,255,255,0.05); vertical-align:top; line-height:1.6; }
        .cost-table tr:last-child td { border-bottom:none; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ORANGE, padding: "4px 10px", background: "rgba(241,95,42,0.12)", borderRadius: "999px" }}>PPC & Google Ads</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 6 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        How Much Do Google Ads Cost? A Transparent Breakdown for Small Businesses
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Most articles dance around the numbers. We&rsquo;re going to give you real figures — ad spend, management fees, expected costs-per-click, and what to actually budget for West Georgia markets.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>The Two Costs of Google Ads</h2>
                    <p>Google Ads has two separate cost components that are commonly confused:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Ad spend</strong> — Money paid directly to Google for your clicks. You set this budget and it goes directly to Google.</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Management fee</strong> — Paid to the agency managing your campaigns. This covers strategy, setup, ongoing optimization, and reporting.</li>
                    </ul>
                    <p>At Creative Cowboys, our Google Ads management starts at $497/month. Your ad spend is separate and paid directly to Google.</p>

                    <h2>Expected Costs Per Click by Industry</h2>
                    <p>Cost-per-click varies enormously by industry and market. In West Georgia, you&rsquo;ll generally pay less than in Atlanta metro for the same keywords — but the ranges below give you a realistic picture:</p>
                    <table className="cost-table">
                        <thead><tr><th>Industry</th><th>Avg. CPC (West Georgia)</th><th>Monthly Budget Suggestion</th></tr></thead>
                        <tbody>
                            <tr><td>Home services (HVAC, plumbing, roofing)</td><td>$8–$25</td><td>$500–$1,000</td></tr>
                            <tr><td>Legal services</td><td>$25–$80</td><td>$1,500–$3,000</td></tr>
                            <tr><td>Marketing & consulting</td><td>$5–$20</td><td>$500–$1,500</td></tr>
                            <tr><td>Medical & dental</td><td>$10–$35</td><td>$800–$2,000</td></tr>
                            <tr><td>Retail / e-commerce</td><td>$0.50–$5</td><td>$300–$1,000</td></tr>
                            <tr><td>Real estate</td><td>$5–$25</td><td>$500–$1,500</td></tr>
                        </tbody>
                    </table>

                    <h2>What Determines Your Cost-Per-Click</h2>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Competition</strong> — More advertisers bidding on the same keyword = higher cost</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Quality Score</strong> — Google rewards relevant, well-structured ads with lower CPCs. Proper campaign setup directly reduces your cost</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Location targeting</strong> — Smaller geographic targets can reduce competition</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Match type</strong> — Exact match keywords typically cost more but convert better than broad match</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Seasonality</strong> — Costs rise when demand spikes (roofing after storms, HVAC in summer)</li>
                    </ul>

                    <h2>What to Budget as a West Georgia Small Business</h2>
                    <p>Here&rsquo;s our transparent recommendation for starting budgets:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Minimum viable</strong>: $500/month ad spend — enough to gather meaningful data for low-competition markets</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Solid launch</strong>: $1,000–$1,500/month — recommended starting point for most local service businesses</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Aggressive growth</strong>: $2,000–$5,000/month — appropriate for competitive markets or when you want to dominate quickly</li>
                    </ul>
                    <p>The right budget depends on your market and how many leads you need. We&rsquo;ll give you a specific recommendation during your free consultation.</p>

                    <h2>When Google Ads Is Worth the Investment</h2>
                    <p>Google Ads is worth the investment when you have:</p>
                    <ul>
                        <li>A clear offer and good conversion rate on your landing page</li>
                        <li>Proper conversion tracking set up (call tracking, form submissions)</li>
                        <li>A management team that actively optimizes — not &ldquo;set and forget&rdquo;</li>
                        <li>A realistic customer lifetime value that justifies the cost-per-lead</li>
                    </ul>
                    <p>Our commercial insurance client has sustained 2 years of positive ROI because we track every lead, know the exact cost-per-acquisition, and continuously optimize. <Link href="/results">Read the case study →</Link></p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to run Google Ads that actually work?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation. We&rsquo;ll tell you what budget makes sense for your market and what you can realistically expect.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free PPC Consultation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/google-ads-vs-seo-small-business" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Google Ads vs. SEO: Which Is Right for You? →</Link>
                            <Link href="/blog/ppc-mistakes-small-business" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>10 Google Ads Mistakes Small Businesses Make →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
