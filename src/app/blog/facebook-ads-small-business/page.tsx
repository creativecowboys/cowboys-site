import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Do Facebook Ads Work for Small Businesses? (Honest Answer) | Creative Cowboys",
    description: "Yes — but only when done right. Here's what works, what doesn't, and what to expect from your first Facebook and Instagram ad campaign for your West Georgia business.",
    alternates: { canonical: "/blog/facebook-ads-small-business" },
};

const ORANGE = "#F15F2A";
const PINK = "#EA51FF";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "Do Facebook ads work for local businesses?", acceptedAnswer: { "@type": "Answer", text: "Yes — Facebook and Instagram ads are highly effective for local businesses when the targeting, creative, and offer are aligned. The biggest advantage is the ability to target people within a specific radius of your location with detailed demographic and interest filters." } },
        { "@type": "Question", name: "How much should I budget for Facebook ads?", acceptedAnswer: { "@type": "Answer", text: "Most West Georgia local businesses can start seeing results with $300–$800/month in Meta ad spend. Brand awareness campaigns can work at lower budgets; lead generation campaigns typically need more budget to gather data and optimize effectively." } },
        { "@type": "Question", name: "Why aren't my Facebook ads getting results?", acceptedAnswer: { "@type": "Answer", text: "The most common reasons: poor targeting (too broad or wrong audience), weak creative that doesn't stop the scroll, an offer that isn't compelling enough, or sending traffic to a page that doesn't convert. All of these are fixable with proper campaign setup and optimization." } },
    ],
};

export default function BlogFacebookAdsSmallBusiness() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose ul { list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:10px; }
        .prose li { display:flex; align-items:flex-start; gap:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.55); }
        .prose li::before { content:"→"; color:${PINK}; flex-shrink:0; font-weight:700; }
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
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: PINK, padding: "4px 10px", background: "rgba(234,81,255,0.12)", borderRadius: "999px" }}>Social Media</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 7 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        Do Facebook Ads Work for Small Businesses? (Honest Answer)
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Yes — but only when set up correctly. Here&rsquo;s the honest breakdown of when Facebook ads work, when they don&rsquo;t, and what you can realistically expect from your first campaign.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>The Short Answer: Yes, With Conditions</h2>
                    <p>Facebook and Instagram ads absolutely work for small businesses — including local businesses in West Georgia. We&rsquo;ve seen 300% engagement increases for clients through well-executed Meta ad campaigns. But we&rsquo;ve also seen businesses waste thousands of dollars on poorly structured campaigns that produce nothing.</p>
                    <p>The difference between those two outcomes comes down to: the right offer, the right audience, the right creative, and the right follow-through.</p>

                    <h2>When Facebook Ads Work Best</h2>
                    <ul>
                        <li>You have a visual product or service that benefits from before/after photography or video</li>
                        <li>You&rsquo;re targeting a specific demographic in West Georgia (local businesses, homeowners, a specific age range)</li>
                        <li>You have a clear, compelling offer — not just &ldquo;call us to learn more&rdquo;</li>
                        <li>You have a landing page or booking system that converts the click into a lead</li>
                        <li>You&rsquo;re willing to run the campaign for 60+ days to allow the algorithm to optimize</li>
                    </ul>

                    <h2>When Facebook Ads Underperform</h2>
                    <ul>
                        <li>Your offer is weak or unclear — &ldquo;licensed and insured since 1992&rdquo; is not an offer</li>
                        <li>Your creative is too polished and corporate — native-looking content outperforms obvious ads</li>
                        <li>You&rsquo;re targeting too broadly or too narrowly</li>
                        <li>You&rsquo;re sending ad traffic to your homepage instead of a dedicated landing page</li>
                        <li>You&rsquo;re running ads for less than 30 days and not giving the algorithm time to learn</li>
                        <li>You have no retargeting campaign for people who visited your site but didn&rsquo;t convert</li>
                    </ul>

                    <h2>The Right Structure for a Local Business Facebook Ad Campaign</h2>
                    <h3>Campaign Level: Objective</h3>
                    <p>For lead generation, choose the &ldquo;Leads&rdquo; objective. For brand awareness, choose &ldquo;Awareness.&rdquo; For website conversions, choose &ldquo;Sales&rdquo; with conversion events configured in your Meta Pixel. Don&rsquo;t choose &ldquo;Engagement&rdquo; if you want actual leads — it&rsquo;s optimized for likes and comments, not buyers.</p>

                    <h3>Ad Set Level: Audience</h3>
                    <p>Start with a geographic radius around your service area — typically 15–30 miles around Villa Rica. Layer in demographic qualifiers if relevant (homeowners for home services, business owners for B2B). Start broad and let the algorithm find your best performers; narrow after you have data.</p>

                    <h3>Ad Level: Creative That Converts</h3>
                    <p>The most important element is the first 1–2 seconds of a video or the first visual of an image ad. It must stop the scroll. What works for local West Georgia businesses:</p>
                    <ul>
                        <li>Real before-and-after results photos</li>
                        <li>Local landmarks or recognizable West Georgia locations</li>
                        <li>The owner or team on camera — local businesses build trust through faces</li>
                        <li>A clear, specific offer in the first 3 words of your headline</li>
                        <li>Social proof: &ldquo;Join 200+ Villa Rica homeowners who trust us&rdquo;</li>
                    </ul>

                    <h2>What to Expect: A Realistic Timeline</h2>
                    <p>Facebook ads don&rsquo;t work instantly. The algorithm needs time to find your best audience. Here&rsquo;s a realistic expectation:</p>
                    <ul>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Week 1–2</strong>: Learning phase. Higher cost-per-result, algorithm is finding your audience</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Week 3–4</strong>: Early optimization. Costs start to decrease, results improve</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Month 2–3</strong>: Peak efficiency. Campaign is dialed in, cost-per-lead is stabilizing</li>
                        <li><strong style={{ color: "rgba(255,255,255,0.75)" }}>Month 3+</strong>: Retargeting layers kick in, compound results from warm audiences</li>
                    </ul>

                    <h2>Facebook Ads vs. Google Ads for Local Businesses</h2>
                    <p>Facebook ads reach people based on who they are. Google Ads reach people based on what they&rsquo;re searching for. Both have value. Social ads are better for building awareness and reaching people before they&rsquo;re actively searching. Google Ads are better for capturing people at the moment of highest purchase intent.</p>
                    <p>Read our full comparison: <Link href="/blog/google-ads-vs-seo-small-business">Google Ads vs. SEO — which is right for you? →</Link></p>
                    <p>We manage both as part of our <Link href="/social-media-ads">social media advertising</Link> and <Link href="/ppc">PPC management</Link> services.</p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to run social ads that actually convert?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation. We&rsquo;ll audit your current ads or build a strategy from scratch.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free Social Ads Audit <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/social-media-ads" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Explore our Social Media Advertising services →</Link>
                            <Link href="/blog/google-ads-vs-seo-small-business" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Google Ads vs. SEO: Which Is Better? →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
