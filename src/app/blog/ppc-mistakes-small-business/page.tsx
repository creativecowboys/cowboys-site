import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "10 Google Ads Mistakes Small Businesses Make (And How to Fix Them) | Creative Cowboys",
    description: "We've audited hundreds of Google Ads accounts. Here are the 10 most common mistakes killing your ROI — and exactly how to fix them. Creative Cowboys, West Georgia.",
    alternates: { canonical: "/blog/ppc-mistakes-small-business" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "What is the biggest Google Ads mistake small businesses make?", acceptedAnswer: { "@type": "Answer", text: "By far the most common — and most expensive — mistake is using broad match keywords without negative keywords. This causes Google to show your ads for completely unrelated searches, burning your budget on clicks that will never convert." } },
        { "@type": "Question", name: "How do I know if my Google Ads are working?", acceptedAnswer: { "@type": "Answer", text: "You need proper conversion tracking set up through Google Tag Manager and GA4. Track every call, form submission, and meaningful action on your site. If you can't see your cost-per-lead, your campaigns are not properly measured — and likely not properly managed." } },
    ],
};

const mistakes = [
    { num: "01", title: "Using Broad Match Keywords Without Negative Keywords", desc: "Broad match casts a wide net — too wide. Your 'HVAC repair' ad might show for 'HVAC repair school' or 'HVAC salary.' Every irrelevant click burns budget. Fix: Start with phrase and exact match keywords, and build an aggressive negative keyword list from day one." },
    { num: "02", title: "Sending Traffic to Your Homepage", desc: "Your homepage is designed for everyone. An ad should send traffic to a dedicated landing page designed specifically for that ad's offer and audience. A mismatched landing page tanks conversion rates. Fix: Build specific landing pages for each campaign or ad group." },
    { num: "03", title: "No Conversion Tracking", desc: "If you don't track conversions, you have no idea which keywords, ads, or campaigns are generating leads. You're optimizing blind. Fix: Set up Google Tag Manager, link it to GA4, and configure conversion events for calls, form submissions, and every meaningful action." },
    { num: "04", title: "Not Using Ad Extensions", desc: "Call extensions, sitelinks, structured snippets, and location extensions make your ad larger and more compelling — at no extra cost per click. Most small business accounts have minimal extensions enabled. Fix: Enable every extension relevant to your business type." },
    { num: "05", title: "Setting It and Forgetting It", desc: "Google Ads requires active optimization. Bids need adjusting, poor performers need pausing, high performers need budget, and new negative keywords need adding weekly. A 'set and forget' campaign degrades in performance over time. Fix: Review your account at minimum weekly." },
    { num: "06", title: "Targeting Too Broadly Geographically", desc: "Targeting the entire state of Georgia when you serve only West Georgia wastes budget on people you can't serve. Fix: Set your geographic targeting to your actual service area — cities, counties, or a radius around your location." },
    { num: "07", title: "Ignoring Quality Score", desc: "Quality Score directly affects your cost-per-click. A low QS means you pay more for the same position than a competitor with better ad relevance. Fix: Align your keywords, ad copy, and landing page content so all three reinforce the same theme." },
    { num: "08", title: "Only Running Search Ads (No Retargeting)", desc: "Only 2–5% of first-time visitors convert immediately. The other 95–98% leave without acting. Without retargeting, you're missing the warm audience that already knows you. Fix: Add a Display retargeting campaign targeting past website visitors." },
    { num: "09", title: "Weak or Generic Ad Copy", desc: "Google Ads have limited characters — every word matters. Vague copy like 'Professional services. Call today!' doesn't give a reason to click. Fix: Lead with your specific differentiator, include your location, and include a clear offer or benefit in every headline." },
    { num: "10", title: "Not Testing Ad Variations", desc: "If you're running only one or two ads per ad group, you have no data on what messaging resonates. Fix: Run at least 2–3 responsive search ads per ad group, monitor performance, and continuously iterate based on which headlines and descriptions perform best." },
];

export default function BlogPPCMistakes() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease; }
        .cta-primary:hover { background:#d04c1c; }
        .mistake-item { border-bottom:1px solid rgba(255,255,255,0.05); padding:28px 0; display:flex; gap:20px; align-items:flex-start; }
        .mistake-item:last-child { border-bottom:none; }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#FF6B6B", padding: "4px 10px", background: "rgba(255,107,107,0.12)", borderRadius: "999px" }}>PPC & Google Ads</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 9 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        10 Google Ads Mistakes Small Businesses Make (And How to Fix Them)
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        We&rsquo;ve audited hundreds of Google Ads accounts — from medical practices to contractors to law firms across West Georgia. These are the mistakes we find most often, and exactly how to fix them.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <p>Bad Google Ads management doesn&rsquo;t just fail to produce results — it actively burns money on irrelevant traffic while giving you the false impression you&rsquo;re &ldquo;doing digital marketing.&rdquo; These 10 mistakes represent the most common and most expensive issues we find when auditing new client accounts.</p>

                    <div style={{ background: "#15181e", borderRadius: "16px", padding: "8px 24px", border: "1px solid rgba(255,255,255,0.07)", margin: "32px 0" }}>
                        {mistakes.map(({ num, title, desc }) => (
                            <div key={num} className="mistake-item">
                                <span style={{ fontSize: "26px", fontWeight: 900, color: "#FF6B6B", minWidth: "40px", lineHeight: 1, flexShrink: 0, letterSpacing: "-0.02em" }}>{num}</span>
                                <div>
                                    <h2 style={{ fontSize: "18px !important", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{title}</h2>
                                    <p style={{ fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.50)", margin: 0 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2>Why Professional Management Matters</h2>
                    <p>Most of these mistakes are easy to avoid — but also easy to miss if you don&rsquo;t live inside Google Ads daily. Even a technically correctable mistake like &ldquo;broad match without negatives&rdquo; can burn thousands of dollars of budget over months before a business owner realizes the issue.</p>
                    <p>Our <Link href="/ppc">Google Ads management service</Link> covers all of these from day one: proper campaign structure, negative keyword management, conversion tracking, ad testing, and regular optimization. Learn about our approach, or <Link href="/results">see results from clients we manage →</Link></p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Want a free Google Ads audit?</h2>
                        <p style={{ margin: "0 0 28px" }}>We&rsquo;ll review your current campaigns and tell you exactly what&rsquo;s wasting your budget — no obligation.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Get Your Free PPC Audit <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/blog/how-much-does-google-ads-cost" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>How Much Do Google Ads Cost? →</Link>
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
