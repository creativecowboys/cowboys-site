import Link from "next/link";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import ClientScripts from "@/components/seo/ClientScripts";
import dynamic from "next/dynamic";

const SEOChartsSection = dynamic(() => import("@/components/seo/SEOChartsSection"), {
  loading: () => <div className="h-[400px] bg-[#0a0a0a]/20 animate-pulse border-[2.5px] border-[#F5C842]" />
});

export default function SEOPage() {
    return (
        <div className="bg-[#F2EBDA] text-[#0a0a0a] font-inter selection:bg-[#B5330E] selection:text-white min-h-screen relative overflow-hidden flex flex-col">

            <style>{`
                .dotgrid { 
                    background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px); 
                    background-size: 18px 18px; 
                }
                
                /* FAQ Accordion Styling */
                .faq-item {
                    border-bottom: 2.5px solid #0a0a0a;
                }
                .faq-item summary {
                    font-family: var(--font-anton), 'Anton', sans-serif;
                    font-size: 19px;
                    letter-spacing: 0.5px;
                    padding: 22px 0;
                    cursor: pointer;
                    list-style: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .faq-item summary::-webkit-details-marker {
                    display: none;
                }
                .faq-item summary::after {
                    content: '+';
                    font-size: 26px;
                    color: #B5330E;
                }
                .faq-item[open] summary::after {
                    content: '—';
                    font-size: 18px;
                }

                /* Marquee Animation */
                @keyframes scrollMarquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .marquee-track {
                    display: flex;
                    white-space: nowrap;
                    animation: scrollMarquee 30s linear infinite;
                }
            `}</style>

            {/* JSON-LD Schema Graphs */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": "Home",
                                        "item": "https://www.creativecowboys.co"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": "SEO Services",
                                        "item": "https://www.creativecowboys.co/seo"
                                    }
                                ]
                            },
                            {
                                "@type": "Service",
                                "name": "SEO Services",
                                "provider": {
                                    "@type": "LocalBusiness",
                                    "name": "Creative Cowboys Media",
                                    "telephone": "+1-470-243-7517",
                                    "email": "howdy@creativecowboys.co",
                                    "address": {
                                        "@type": "PostalAddress",
                                        "streetAddress": "222 West Montgomery St",
                                        "addressLocality": "Villa Rica",
                                        "addressRegion": "GA",
                                        "postalCode": "30180",
                                        "addressCountry": "US"
                                    }
                                },
                                "description": "Results-driven SEO services for small businesses in West Georgia including local SEO, keyword strategy, Google Business Profile optimization, and transparent reporting.",
                                "areaServed": [
                                    { "@type": "City", "name": "Villa Rica" },
                                    { "@type": "City", "name": "Carrollton" },
                                    { "@type": "City", "name": "Douglasville" },
                                    { "@type": "City", "name": "Newnan" },
                                    { "@type": "City", "name": "Bremen" },
                                    { "@type": "City", "name": "Dallas" },
                                    { "@type": "AdministrativeArea", "name": "West Georgia" },
                                    { "@type": "City", "name": "Franklin", "containedInPlace": { "@type": "State", "name": "TN" } }
                                ]
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "HOW LONG DOES SEO TAKE TO SHOW RESULTS?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Most businesses see meaningful movement in rankings within 3–6 months. Highly competitive markets may take 6–12 months. SEO is a long-term investment — but unlike paid ads, the results compound over time."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "DO I NEED LOCAL SEO OR NATIONAL SEO?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "If your customers are primarily in West Georgia and the surrounding area, local SEO is the priority. It targets location-based searches like 'marketing agency Villa Rica GA' and helps you appear in Google Maps results."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "HOW MUCH DOES SEO COST?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Our SEO packages start at $497/month. The right investment depends on your market competitiveness and goals. We'll give you a transparent quote after a free consultation."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "WHAT WILL I SEE IN MY MONTHLY REPORT?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Keyword ranking changes, organic traffic trends, and the specific work we completed — no jargon, no vanity metrics. You'll always know exactly what we're doing and why."
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                }}
            />

            {/* Global Header */}
            <Header dark={false} />

            <main>
                {/* ── HERO SECTION ── */}
                <section className="hero dotgrid py-12 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        {/* Left Column Text & Details */}
                        <div className="lg:col-span-7 flex flex-col text-left h-[460px] sm:h-[400px] lg:h-auto">
                            <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                                — SEO SERVICES · WEST GEORGIA —
                            </div>
                            <h1 className="font-anton text-5xl sm:text-6xl md:text-[76px] leading-[0.88] text-[#0a0a0a] uppercase mb-6 tracking-wide">
                                GET FOUND.<br />
                                GET LEADS.<br />
                                GET <span className="text-[#B5330E]">RESULTS</span>.
                            </h1>
                            <p className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed max-w-lg mb-8">
                                We help West Georgia small businesses rank higher on Google, drive consistent organic traffic, and turn searchers into paying customers — with zero fluff and full transparency.
                            </p>
                            
                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    prefetch={false}
                                    href="/contact"
                                    data-track="seo_hero_audit"
                                    className="bg-[#B5330E] text-white font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0a0a0a] transition-all text-center"
                                >
                                    GET A FREE SEO AUDIT ↗
                                </Link>
                                <a 
                                    href="#proof"
                                    data-track="seo_hero_strategy"
                                    className="bg-white text-[#0a0a0a] font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] hover:bg-neutral-50 transition-colors text-center"
                                >
                                    SEE SEO RESULTS
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Custom Brutalist SERP/Map Pack Mockup */}
                        <div className="lg:col-span-5 relative w-full h-[480px] md:h-[500px]">
                            <div className="absolute top-4 left-0 right-4 md:right-8 h-[410px] bg-white border-[2.5px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] -rotate-[1.5deg] overflow-hidden flex flex-col">
                                {/* Browser Header Bar */}
                                <div className="bg-[#0a0a0a] py-2 px-3 flex gap-1.5 items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#B5330E]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5C842]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                                    <div 
                                        className="flex-1 bg-[#2a2a2a] h-5 ml-2.5 rounded text-[9px] text-neutral-400 px-2 flex items-center select-none font-[ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace]"
                                    >
                                        google.com/search
                                    </div>
                                </div>
                                {/* Browser Viewport */}
                                <div className="p-4 flex-1 flex flex-col justify-between text-left select-none bg-white">
                                    {/* Search Query Input */}
                                    <div className="border-[2px] border-[#0a0a0a] rounded-full py-1.5 px-4 text-xs font-semibold text-[#0a0a0a] flex items-center gap-1.5 select-none bg-neutral-50">
                                        <span className="text-[#B5330E] font-bold">⌕</span> roofing company near me
                                    </div>
                                    {/* Map Pack Widget */}
                                    <div className="border-[2.5px] border-[#0a0a0a] overflow-hidden flex flex-col">
                                        <div className="h-14 relative bg-gradient-to-br from-[#cfe3d2] via-[#e8e1cf] to-[#cfd9e3] select-none">
                                            <span className="absolute text-lg" style={{ top: "8px", left: "22%" }}>📍</span>
                                            <span className="absolute text-lg" style={{ top: "24px", left: "58%" }}>📍</span>
                                        </div>
                                        {/* Result 1 (Highlighted You) */}
                                        <div className="flex justify-between items-center p-3 border-t-[2.5px] border-[#0a0a0a] text-xs font-inter bg-[#F5C842]">
                                            <div>
                                                <div className="font-bold text-[#0a0a0a]">Your Business</div>
                                                <div className="text-[#0a0a0a] text-[10px] font-semibold">★★★★★ 5.0 (47)</div>
                                            </div>
                                            <div className="font-anton text-[9px] tracking-wider bg-[#0a0a0a] text-[#F5C842] px-2 py-0.5">
                                                #1 MAP PACK
                                            </div>
                                        </div>
                                        {/* Result 2 */}
                                        <div className="flex justify-between items-center p-3 border-t-[2.5px] border-[#0a0a0a] text-xs font-inter bg-white select-none">
                                            <div>
                                                <div className="font-bold text-[#0a0a0a]">Competitor A</div>
                                                <div className="text-neutral-600 text-[10px]">★★★★☆ 4.2 (19)</div>
                                            </div>
                                        </div>
                                        {/* Result 3 */}
                                        <div className="flex justify-between items-center p-3 border-t-[2.5px] border-[#0a0a0a] text-xs font-inter bg-white select-none">
                                            <div>
                                                <div className="font-bold text-[#0a0a0a]">Competitor B</div>
                                                <div className="text-neutral-600 text-[10px]">★★★☆☆ 3.8 (8)</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Organic SEO Result */}
                                    <div className="text-[11px] text-[#5a5a5a] leading-relaxed p-2.5 border-t-[2.5px] border-[#0a0a0a] bg-neutral-50 select-none">
                                        <div className="text-[#1a0dab] font-semibold text-xs hover:underline cursor-pointer">
                                            Your Business — West Georgia's Trusted...
                                        </div>
                                        Ranked #1 organic, right below the map pack you also own.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── MARQUEE STRIP ── */}
                <div className="bg-[#0a0a0a] text-[#F2EBDA] overflow-hidden py-4 border-b-[2.5px] border-[#0a0a0a] select-none">
                    <div className="marquee-track flex whitespace-nowrap font-anton text-sm md:text-base tracking-[2px]">
                        {Array(4).fill(null).map((_, i) => (
                            <span key={i} className="flex items-center">
                                <span className="px-4">LOCAL KEYWORDS</span>
                                <span className="text-[#B5330E]">★</span>
                                <span className="px-4">MAP PACK RANKINGS</span>
                                <span className="text-[#B5330E]">★</span>
                                <span className="px-4">GOOGLE BUSINESS PROFILE</span>
                                <span className="text-[#B5330E]">★</span>
                                <span className="px-4">AUTHORITY LINKS</span>
                                <span className="text-[#B5330E]">★</span>
                                <span className="px-4">PLAIN-ENGLISH REPORTS</span>
                                <span className="text-[#B5330E]">★</span>
                                <span className="px-4">NO VANITY METRICS</span>
                                <span className="text-[#B5330E]">★</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── WHAT IS LOCAL SEO ── */}
                <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a] bg-[#F2EBDA]">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                        {/* Text Content */}
                        <div className="flex-1 text-left">
                            <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                                — WHY IT MATTERS —
                            </div>
                            <h2 className="font-anton text-4xl md:text-5xl leading-[0.92] text-[#0a0a0a] uppercase mb-6 tracking-wide">
                                WHEN THEY SEARCH,<br />
                                DO <span className="text-[#B5330E]">YOU</span> SHOW UP?
                            </h2>
                            <p className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed mb-4">
                                Local SEO is the process of optimizing your online presence so your business appears when people in your area search for your services on Google. When someone types &ldquo;marketing agency near me&rdquo; or &ldquo;web design Villa Rica GA&rdquo; — local SEO determines whether you show up or your competitor does.
                            </p>
                            <p className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed">
                                For most small businesses in West Georgia, local search is the single highest-ROI marketing channel available. It brings in buyers who are already looking for exactly what you offer — no chasing, no cold outreach.
                            </p>
                        </div>
                        {/* Pull Quote Card */}
                        <div className="flex-1 w-full lg:max-w-md">
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] border-l-[6px] border-l-[#B5330E] shadow-[6px_6px_0px_#0a0a0a] p-6 md:p-8">
                                <p className="font-inter text-sm md:text-base text-[#0a0a0a] leading-relaxed">
                                    Our local SEO work helped John B. Jackson Law achieve <strong className="text-[#B5330E] font-bold">22 #1 rankings</strong> in personal injury search terms — driving consistent, qualified leads month after month, <strong className="text-[#B5330E] font-bold">without a dollar spent on ads</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── OUR PROCESS SECTION ── */}
                <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a] bg-[#E8E1CF]" id="process">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-left mb-10">
                            <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                                — OUR SEO PROCESS —
                            </div>
                            <h2 className="font-anton text-4xl md:text-5xl leading-[0.92] text-[#0a0a0a] uppercase mb-2 tracking-wide">
                                HOW WE GET YOU <span className="text-[#B5330E]">RANKED</span>.
                            </h2>
                            <div className="flex flex-wrap items-baseline gap-2">
                                <p className="font-inter text-sm md:text-base text-[#5a5a5a]">
                                    Every step is built to produce measurable rankings — not vanity metrics.
                                </p>
                                <span className="font-lobster text-lg md:text-xl text-[#B5330E] inline-block rotate-[-3deg] ml-1 select-none">
                                    six moves, partner
                                </span>
                            </div>
                        </div>

                        {/* Capability Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Card 1 */}
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#B5330E] tracking-[2px] uppercase mb-3">01</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">KEYWORD RESEARCH.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#5a5a5a] leading-relaxed">
                                    We identify the exact terms your ideal customers are searching — high-intent, local, and ready to convert.
                                </p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#B5330E] tracking-[2px] uppercase mb-3">02</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">ON-PAGE OPTIMIZATION.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#5a5a5a] leading-relaxed">
                                    Headlines, meta tags, content structure, image text — every page tuned to send clear signals to Google.
                                </p>
                            </div>
                            {/* Card 3 (Featured in Yellow) */}
                            <div className="bg-[#F5C842] border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#0a0a0a] tracking-[2px] uppercase mb-3">03 / #1 LOCAL RANKING FACTOR</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">GOOGLE BUSINESS PROFILE.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#0a0a0a] leading-relaxed">
                                    Your profile is your #1 local ranking factor. We optimize every element to get you into the map pack.
                                </p>
                            </div>
                            {/* Card 4 */}
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#B5330E] tracking-[2px] uppercase mb-3">04</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">LINK BUILDING.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#5a5a5a] leading-relaxed">
                                    Quality backlinks from relevant local and industry sources that grow your site's authority.
                                </p>
                            </div>
                            {/* Card 5 */}
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#B5330E] tracking-[2px] uppercase mb-3">05</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">TECHNICAL SEO.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#5a5a5a] leading-relaxed">
                                    Site speed, structured data, sitemaps — the technical foundation Google demands, handled for you.
                                </p>
                            </div>
                            {/* Card 6 */}
                            <div className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col">
                                <div className="font-anton text-xs text-[#B5330E] tracking-[2px] uppercase mb-3">06</div>
                                <h3 className="font-anton text-lg md:text-xl text-[#0a0a0a] uppercase mb-2">REPORTING & TRANSPARENCY.</h3>
                                <p className="font-inter text-xs md:text-sm text-[#5a5a5a] leading-relaxed">
                                    Monthly reports in plain English. Keyword rankings, traffic trends, and what we're doing next.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── PROOF & GROWTH METRICS (DARK) ── */}
                <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a] bg-[#0e0e0e] text-[#d4ccb8]" id="proof">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-left mb-10">
                            <div className="font-anton text-xs md:text-sm text-[#F5C842] tracking-[2.5px] uppercase mb-4">
                                — PROOF IT WORKS —
                            </div>
                            <h2 className="font-anton text-4xl md:text-5xl leading-[0.92] text-white uppercase mb-4 tracking-wide">
                                REAL RANKINGS.<br />
                                REAL <span className="text-[#F5C842]">TRAFFIC</span>.
                            </h2>
                            <p className="font-inter text-sm md:text-base text-[#a0998a] max-w-lg">
                                Keyword positions and organic traffic growth from real client accounts — Google position before &rarr; after our SEO campaign.
                            </p>
                        </div>

                        {/* Charts Area */}
                        <SEOChartsSection />
                    </div>
                </section>

                {/* ── LOCAL VS NATIONAL + REPORTING ── */}
                <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a] bg-[#F2EBDA]">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                        {/* Strategy Info */}
                        <div className="flex-1 text-left">
                            <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                                — THE RIGHT STRATEGY —
                            </div>
                            <h2 className="font-anton text-4xl md:text-5xl leading-[0.92] text-[#0a0a0a] uppercase mb-6 tracking-wide">
                                LOCAL SEO VS. NATIONAL SEO —<br />
                                WHAT <span className="text-[#B5330E]">YOU</span> NEED.
                            </h2>
                            <p className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed mb-4">
                                If you serve customers in Villa Rica, Carrollton, Douglasville, or anywhere in West Georgia — local SEO is your primary focus. It gets you into the Google Map Pack (the 3 businesses that appear above organic results with a map) and targets people searching in your service area.
                            </p>
                            <p className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed">
                                National SEO competes for broad terms without location modifiers. It's valuable for e-commerce and brands serving customers nationwide — but for most West Georgia businesses, local SEO delivers a far faster return on investment. We build a strategy that prioritizes the approach that fits your business.
                            </p>
                        </div>

                        {/* Checklist Side */}
                        <div className="flex-1 w-full flex flex-col">
                            <div className="font-anton text-base md:text-lg text-[#0a0a0a] tracking-[1px] uppercase mb-6">
                                EVERY MONTH, YOU SEE:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    "KEYWORD RANKINGS",
                                    "ORGANIC TRAFFIC",
                                    "SEARCH CONSOLE DATA",
                                    "BACKLINK GROWTH",
                                    "TECHNICAL HEALTH",
                                    "ACTION SUMMARY",
                                ].map((item) => (
                                    <div 
                                        key={item} 
                                        className="border-[2.5px] border-[#0a0a0a] bg-white p-4 font-anton text-xs sm:text-sm tracking-[1px] flex items-center gap-3 shadow-[3px_3px_0px_#0a0a0a] select-none"
                                    >
                                        <span className="text-[#B5330E] text-base font-bold">✓</span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── PPC CROSS-SELL BAND ── */}
                <section className="py-12 px-6 md:px-12 bg-[#F2EBDA] border-b-[2.5px] border-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto border-[3px] border-[#0a0a0a] bg-[#F5C842] shadow-[10px_10px_0px_#0a0a0a] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex-1">
                            <h3 className="font-anton text-2xl md:text-3xl text-[#0a0a0a] mb-2 uppercase">
                                SEO VS. PPC — WHY NOT BOTH?
                            </h3>
                            <p className="font-inter text-sm text-[#0a0a0a]/80 max-w-2xl leading-relaxed">
                                SEO builds long-term organic visibility that compounds over time. PPC delivers immediate traffic while your SEO gains traction. Many West Georgia businesses get the best results running both together.
                            </p>
                        </div>
                        <Link 
                            prefetch={false}
                            href="/ppc"
                            data-track="seo_cross_ppc"
                            className="bg-[#0a0a0a] text-[#F5C842] font-anton text-sm uppercase tracking-wider py-4 px-8 border-[2.5px] border-[#0a0a0a] hover:bg-neutral-900 transition-colors whitespace-nowrap self-start md:self-center text-center shadow-[4px_4px_0px_#B5330E]"
                        >
                            SEE PPC MANAGEMENT →
                        </Link>
                    </div>
                </section>

                {/* ── FAQ SECTION ── */}
                <section className="py-16 md:py-24 px-6 md:px-12 border-b-[2.5px] border-[#0a0a0a] bg-[#E8E1CF]" id="faq">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                                — FAQ —
                            </div>
                            <h2 className="font-anton text-4xl md:text-5xl leading-[0.92] text-[#0a0a0a] uppercase mb-4 tracking-wide">
                                COMMON <span className="text-[#B5330E]">QUESTIONS</span>.
                            </h2>
                        </div>

                        {/* Native details accordion */}
                        <div className="faq-list flex flex-col">
                            <details className="faq-item group" open={true}>
                                <summary className="font-anton text-lg md:text-xl text-[#0a0a0a] py-6 cursor-pointer list-none flex justify-between items-center select-none">
                                    HOW LONG DOES SEO TAKE TO SHOW RESULTS?
                                </summary>
                                <div className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 pr-6">
                                    Most businesses see meaningful movement in rankings within 3–6 months. Highly competitive markets may take 6–12 months. SEO is a long-term investment — but unlike paid ads, the results compound over time.
                                </div>
                            </details>

                            <details className="faq-item group">
                                <summary className="font-anton text-lg md:text-xl text-[#0a0a0a] py-6 cursor-pointer list-none flex justify-between items-center select-none">
                                    DO I NEED LOCAL SEO OR NATIONAL SEO?
                                </summary>
                                <div className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 pr-6">
                                    If your customers are primarily in West Georgia and the surrounding area, local SEO is the priority. It targets location-based searches like &ldquo;marketing agency Villa Rica GA&rdquo; and helps you appear in Google Maps results.
                                </div>
                            </details>

                            <details className="faq-item group">
                                <summary className="font-anton text-lg md:text-xl text-[#0a0a0a] py-6 cursor-pointer list-none flex justify-between items-center select-none">
                                    HOW MUCH DOES SEO COST?
                                </summary>
                                <div className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 pr-6">
                                    Our SEO packages start at $497/month. The right investment depends on your market competitiveness and goals. We&rsquo;ll give you a transparent quote after a free consultation.
                                </div>
                            </details>

                            <details className="faq-item group">
                                <summary className="font-anton text-lg md:text-xl text-[#0a0a0a] py-6 cursor-pointer list-none flex justify-between items-center select-none">
                                    WHAT WILL I SEE IN MY MONTHLY REPORT?
                                </summary>
                                <div className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 pr-6">
                                    Keyword ranking changes, organic traffic trends, and the specific work we completed — no jargon, no vanity metrics. You&rsquo;ll always know exactly what we&rsquo;re doing and why.
                                </div>
                            </details>

                            <details className="faq-item group">
                                <summary className="font-anton text-lg md:text-xl text-[#0a0a0a] py-6 cursor-pointer list-none flex justify-between items-center select-none">
                                    HOW LONG DOES SEO TAKE FOR A SMALL BUSINESS?
                                </summary>
                                <div className="font-inter text-sm md:text-base text-[#5a5a5a] leading-relaxed pb-6 pr-6">
                                    Read our full breakdown: <Link href="/blog/how-long-does-seo-take" className="text-[#B5330E] hover:underline font-semibold">How long SEO takes for West Georgia businesses &rarr;</Link>
                                </div>
                            </details>
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA SECTION ── */}
                <section className="final-cta dotgrid py-20 px-6 md:px-12 text-center border-b-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] flex flex-col items-center">
                    <div className="font-anton text-xs md:text-sm text-[#B5330E] tracking-[2.5px] uppercase mb-4">
                        — READY WHEN YOU ARE —
                    </div>
                    <h2 className="font-anton text-5xl md:text-6xl leading-[0.9] text-[#0a0a0a] uppercase mb-6 tracking-wide">
                        READY TO OWN<br />
                        YOUR <span className="text-[#B5330E]">MARKET</span>?
                    </h2>
                    <p className="font-inter text-sm md:text-base text-[#5a5a5a] max-w-lg mb-8 leading-relaxed">
                        Free consultation. No contracts. No fluff. Just a clear plan to get you ranking.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link 
                            prefetch={false}
                            href="/contact"
                            data-track="seo_final_audit"
                            className="bg-[#B5330E] text-white font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0a0a0a] transition-all text-center"
                        >
                            GET YOUR FREE SEO AUDIT ↗
                        </Link>
                        <a 
                            href="#proof"
                            data-track="seo_final_strategy"
                            className="bg-white text-[#0a0a0a] font-anton text-sm md:text-base uppercase tracking-wider py-4 px-6 md:px-8 border-[2.5px] border-[#0a0a0a] hover:bg-neutral-50 transition-colors text-center"
                        >
                            SEE OUR RESULTS
                        </a>
                    </div>
                </section>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Client scripts for analytics tracking and mobile sticky bar */}
            <ClientScripts />
        </div>
    );
}
