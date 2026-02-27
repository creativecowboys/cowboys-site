import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "What to Look for When Hiring a Digital Marketing Agency in West Georgia | Creative Cowboys",
    description: "Red flags, green flags, and the exact questions to ask before signing with any digital marketing agency. From Creative Cowboys — a West Georgia marketing agency.",
    alternates: { canonical: "/blog/what-to-look-for-marketing-agency" },
};

const ORANGE = "#F15F2A";
const DARK = "#0D0D0F";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "How do I find a trustworthy marketing agency in West Georgia?", acceptedAnswer: { "@type": "Answer", text: "Ask for case studies with real client names and numbers — not anonymized results. Review their own online presence (do they rank well? do they practice what they preach?). Ask about contract terms and whether they lock you into long-term agreements." } },
        { "@type": "Question", name: "What questions should I ask a marketing agency before hiring them?", acceptedAnswer: { "@type": "Answer", text: "Key questions: Can you show me case studies from clients similar to my business? What does your reporting look like and how often will I receive it? Who will be my point of contact? What happens to my accounts if I leave? Do you require long-term contracts?" } },
    ],
};

const redFlags = [
    "They guarantee #1 rankings on Google — no one can guarantee this",
    "They can't show you real case studies with specific results",
    "They require 12-month contracts before proving results",
    "Their own website doesn't rank well or looks outdated",
    "They handle your accounts in-house and won't give you access",
    "They talk about 'impressions' and 'engagement' but never about leads",
    "They pitch a complex suite of services you didn't ask for",
    "They won't tell you exactly what they'll do for your money each month",
];

const greenFlags = [
    "They show you case studies with real clients and specific numbers",
    "They ask about your goals before recommending services",
    "They explain their process clearly without jargon",
    "They offer month-to-month agreements or short initial commitments",
    "They give you ownership of your ad accounts, website, and data",
    "They talk in terms of leads, revenue, and ROI",
    "They specialize in businesses like yours — not every client under the sun",
    "They respond quickly and communicate proactively",
];

export default function BlogMarketingAgencyTips() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <style>{`
        .prose h2 { font-size:clamp(22px,3vw,30px); font-weight:800; color:#fff; margin:48px 0 16px; letter-spacing:-0.02em; }
        .prose h3 { font-size:20px; font-weight:700; color:#fff; margin:32px 0 12px; }
        .prose p { font-size:17px; line-height:1.85; color:rgba(255,255,255,0.55); margin:0 0 20px; }
        .prose a { color:${ORANGE}; text-decoration:none; font-weight:600; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.06); padding:24px 0; }
        .cta-primary { background:${ORANGE}; transition:background 180ms ease; }
        .cta-primary:hover { background:#d04c1c; }
        .flag-item { display:flex; align-items:flex-start; gap:12px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:15px; line-height:1.65; color:rgba(255,255,255,0.55); }
      `}</style>

            <div style={{ background: DARK, minHeight: "100vh", fontFamily: "var(--font-geist-sans, sans-serif)" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <header style={{ maxWidth: "760px", margin: "0 auto", padding: "140px 24px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ORANGE, padding: "4px 10px", background: "rgba(241,95,42,0.12)", borderRadius: "999px" }}>Agency Advice</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><Clock size={13} /> 7 min read</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}><User size={13} /> Josh — Creative Cowboys</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                        What to Look for When Hiring a Digital Marketing Agency in West Georgia
                    </h1>
                    <p style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                        Yes, we&rsquo;re a marketing agency writing this article. We&rsquo;re going to be genuinely honest — including about things that might make you not hire us. That&rsquo;s exactly why you should read it.
                    </p>
                </header>

                <article style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 96px" }} className="prose">
                    <h2>Why This Is Hard</h2>
                    <p>Hiring a marketing agency is difficult because results take time to verify, promises are easy to make, and the average small business owner doesn&rsquo;t know enough about SEO, Google Ads, or website performance to evaluate whether the work is good. This information asymmetry is routinely exploited by agencies that prioritize client acquisition over client results.</p>
                    <p>We&rsquo;ve had clients come to us from agencies that took them on retainer for 12 months, produced reports full of vanity metrics, and never moved a single keyword ranking. Here&rsquo;s how to avoid that.</p>

                    <h2>Red Flags to Watch For</h2>
                    <div style={{ background: "#15181e", border: "1px solid rgba(255,60,60,0.20)", borderRadius: "16px", padding: "16px 24px", marginBottom: "32px" }}>
                        {redFlags.map(f => (
                            <div key={f} className="flag-item">
                                <span style={{ color: "#FF6B6B", fontWeight: 700, flexShrink: 0, fontSize: "16px" }}>✕</span>
                                {f}
                            </div>
                        ))}
                    </div>

                    <h2>Green Flags That Signal a Trustworthy Agency</h2>
                    <div style={{ background: "#15181e", border: "1px solid rgba(46,213,115,0.20)", borderRadius: "16px", padding: "16px 24px", marginBottom: "32px" }}>
                        {greenFlags.map(f => (
                            <div key={f} className="flag-item">
                                <span style={{ color: "#2ED573", fontWeight: 700, flexShrink: 0, fontSize: "16px" }}>✓</span>
                                {f}
                            </div>
                        ))}
                    </div>

                    <h2>The Questions to Ask Before Signing Anything</h2>
                    <p>Use these questions in your consultation to separate serious agencies from those who can&rsquo;t back up their promises:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                        {[
                            "Can you show me a case study from a business in my industry or similar to mine?",
                            "What do your monthly reports look like — can I see an example?",
                            "Who will be my main point of contact and how often will we speak?",
                            "If I leave, do I own my website, ad accounts, and all content created?",
                            "What are your contract terms — month-to-month or annual?",
                            "How do you define success for a client like me, and what KPIs will you track?",
                            "What happens in month 1, month 3, and month 6?",
                        ].map((q, i) => (
                            <div key={q} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(241,95,42,0.15)", border: "1px solid rgba(241,95,42,0.30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: ORANGE, flexShrink: 0 }}>{i + 1}</span>
                                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.6 }}>{q}</p>
                            </div>
                        ))}
                    </div>

                    <h2>The Creative Cowboys Approach</h2>
                    <p>We&rsquo;re going to be transparent about who we are and who we&rsquo;re best for. We&rsquo;re a small team based in Villa Rica, GA that specializes in local digital marketing for West Georgia small businesses. We don&rsquo;t work with 200 clients and produce templated reports — we work with a focused number of clients and genuinely care about moving their numbers.</p>
                    <p>We don&rsquo;t require long-term contracts. We give you access to and ownership of everything we build for you. And we show you results in plain English, not dashboard screenshots full of metrics you didn&rsquo;t ask for.</p>
                    <p><Link href="/results">See our real results from real clients →</Link></p>

                    <h2>Frequently Asked Questions</h2>
                    {faqSchema.mainEntity.map(({ name, acceptedAnswer }) => (
                        <div key={name} className="faq-item">
                            <h3 style={{ margin: "0 0 8px" }}>{name}</h3>
                            <p style={{ margin: 0 }}>{acceptedAnswer.text}</p>
                        </div>
                    ))}

                    <div style={{ background: "#15181e", borderRadius: "20px", padding: "40px", marginTop: "64px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <h2 style={{ margin: "0 0 12px" }}>Ready to have an honest conversation?</h2>
                        <p style={{ margin: "0 0 28px" }}>Free consultation. No pressure. We&rsquo;ll tell you honestly whether we&rsquo;re a good fit for your business.</p>
                        <Link href="/contact" className="cta-primary" style={{ padding: "14px 32px", color: "#fff", fontWeight: 700, fontSize: "15px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            Start a Conversation <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginTop: "64px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Related Articles</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link href="/results" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>See our client results →</Link>
                            <Link href="/seo" style={{ color: ORANGE, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Our West Georgia SEO services →</Link>
                        </div>
                    </div>
                </article>
                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
