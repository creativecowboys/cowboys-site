"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Anton, Roboto_Condensed, Syne, Playfair_Display, Alfa_Slab_One } from "next/font/google";
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  Check, 
  ExternalLink,
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  FileText,
  Star,
  ArrowLeft,
  ArrowRight,
  Shield
} from "lucide-react";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-condensed",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-syne",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"],
  variable: "--font-playfair-display",
});

const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-alfa-slab-one",
});

// Static Page Data
const clientPortfolio = [
  {
    name: "Harmonic Production",
    vertical: "AV & Event Production",
    image: "/franklin-tn/harmonic-desktop-hero.png"
  },
  {
    name: "Squirrel Made Products",
    vertical: "Boutique CPG",
    image: "/franklin-tn/squirrel-shop-page.png"
  },
  {
    name: "John B. Jackson & Associates",
    vertical: "Legal / Ads Pipeline",
    image: "/franklin-tn/jbjackson-desktop-hero.png"
  },
  {
    name: "McKinley Roofing",
    vertical: "Home Services SEO",
    image: "/franklin-tn/mckinley-desktop-hero.png"
  },
  {
    name: "LEUCO Tools",
    vertical: "Industrial E-Com",
    image: "/franklin-tn/leuco-desktop-hero.png"
  }
];

const capabilities = [
  {
    num: "01",
    title: "LANDING PAGES.",
    desc: "Built to convert ad traffic. Focused headers, frictionless forms, and server-side conversion mapping. Payback tracked weekly.",
    bullets: ["Lighthouse 95+ mobile score", "Integrated call tracking", "HubSpot & CRM connections"]
  },
  {
    num: "02",
    title: "BRAND WEBSITES.",
    desc: "Complete custom digital architectures. High-fidelity layouts, local keywords, and fast loads to capture Williamson County organic search.",
    bullets: ["Zero off-the-shelf templates", "Fully custom Webflow or WordPress", "Built-in local schema tags"]
  },
  {
    num: "03",
    title: "E-COMMERCE STORES.",
    desc: "Shopify, Stripe, or WooCommerce setups built for scale. Fast checkout funnels, cart recovery emails, and custom retention systems.",
    bullets: ["Frictionless checkout paths", "Automated email sequences", "Real-time inventory sync"]
  },
  {
    num: "04",
    title: "LOCAL SEO SETUP.",
    desc: "Neighborhood service area page mapping, citations audit, and deep Google Business Profile optimizations to place you on the Map Pack.",
    bullets: ["Map Pack ranking targets", "Location page builders", "Review generation hooks"]
  },
  {
    num: "05",
    title: "FAST EDGE HOSTING.",
    desc: "Ditch the sluggish servers. We host on Next.js/Vercel global CDNs with zero maintenance overhead, automated backups, and 99.9% uptime.",
    bullets: ["Global Vercel/Next CDNs", "Uptime monitor alarms", "SSL & cloud backup assets"]
  },
  {
    num: "06",
    title: "SPEED AUDITS.",
    desc: "Identify page load speed leakage and technical blockers. We rewrite code blocks and compress payloads to guarantee sub-1.5s mobile paint times.",
    bullets: ["LCP speed optimization", "Image payload reduction", "Core Web Vitals validation"]
  }
];

const caseStudies = [
  {
    id: "04.15",
    title: "HARMONIC PRODUCTION",
    category: "WEB DESIGN & SEO",
    client: "Ryan Coffey, Founder",
    location: "Cleveland, TN",
    result: "300% Engagement",
    link: "#contact",
    impacts: [
      "Delivered a full brand overhaul and localized SEO strategy.",
      "Boosted year-over-year customer retention by 200%.",
      "Cut server downtime to zero during the domain transition."
    ]
  },
  {
    id: "05.20",
    title: "JOHN B. JACKSON & ASSOC",
    category: "SEO & PPC ADS",
    client: "John B. Jackson, Founding Attorney",
    location: "Douglasville, GA",
    result: "+$500k Revenue",
    link: "#contact",
    impacts: [
      "Achieved 22 #1 organic placements on Google in 12 months.",
      "Designed multi-platform lead funnels with phone-call tracking.",
      "Launched integrated brand campaigns across streaming TV and paid social."
    ]
  },
  {
    id: "06.15",
    title: "MCKINLEY ROOFING",
    category: "WEB & LOCAL SEO",
    client: "McKinley Family, Owners",
    location: "Douglasville, GA",
    result: "+1000% Traffic",
    link: "#contact",
    impacts: [
      "Built dynamic neighborhood service-area landing pages.",
      "Established top-tier Google Business Profile optimization and schema markup.",
      "Shipped custom storm-damage intake forms that feed straight to insurance leads."
    ]
  }
];

const processSteps = [
  {
    num: "1",
    title: "Discovery",
    timing: "Week 1",
    desc: "60-min strategy call. You answer 12 questions about your business, your customers, and your goals. We send back a one-page strategy brief defining deliverables and what success looks like."
  },
  {
    num: "2",
    title: "Design",
    timing: "Weeks 2–3",
    desc: "Wireframes first, then high-fidelity Figma designs for every page. We do one big design review with you in week 3 — not a death-by-Slack revision loop."
  },
  {
    num: "3",
    title: "Build",
    timing: "Weeks 3–5",
    desc: "Clean code on WordPress or Webflow. Lighthouse score reviewed weekly. Real device testing on iPhone and Pixel. You see a staging URL on day one and can review progress anytime."
  },
  {
    num: "4",
    title: "Launch",
    timing: "Week 5–6",
    desc: "DNS handover, SSL, GA4 + GSC + Tag Manager setup, sitemap submission, schema validation. We don't ghost on launch day — we're on Slack with you for the full week."
  },
  {
    num: "5",
    title: "Optimize",
    timing: "Months 2–3",
    desc: "We watch the site in the wild. Real user data (Microsoft Clarity heat maps + GA4). Two rounds of small conversion-rate-optimization tweaks at days 30 and 60."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$6,500 flat",
    desc: "For local Franklin small businesses looking for a professional web presence.",
    bullets: [
      "5-page custom marketing website",
      "Strategy &rarr; Design &rarr; Build in 5–6 weeks",
      "WordPress or Webflow core development",
      "SEO foundations & Google Analytics setup",
      "Care plan optional ($150/mo after launch)"
    ]
  },
  {
    name: "Growth",
    price: "$14,500 flat",
    desc: "For growing Franklin companies targeting aggressive local search lead flow.",
    isPopular: true,
    bullets: [
      "8–15 page comprehensive custom site",
      "Custom brand system & UI design elements",
      "HubSpot, CRM, and call-tracking integration",
      "Lighthouse 95+ mobile page speed guaranteed",
      "Includes 3 months of free website care"
    ]
  },
  {
    name: "Scale",
    price: "$28,500+ flat",
    desc: "For established firms requiring advanced custom databases, apps, or e-commerce.",
    bullets: [
      "Full custom design + database development",
      "CMS-driven pages with complex APIs",
      "Shopify, eCom, or app-like workflows (10-14 wks)",
      "90-day post-launch CRO conversion tracking",
      "Full schema markup audit and schema cataloging"
    ]
  }
];

const testimonials = [
  {
    name: "HARMONIC PRODUCTION.",
    shortName: "HARMONIC",
    date: "04.15",
    tag: "WEB DESIGN + SEO",
    subtitle: "CONCERT AV · CLEVELAND, TN",
    quote: '"Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime."',
    attribution: "— Ryan Coffey",
    domain: "harmonicproduction.co",
    themeBg: "bg-h3-blue",
    activeBtnBg: "bg-h3-yellow",
    activeBtnText: "text-h3-black",
    accentColor: "text-h3-yellow",
    barColor: "bg-h3-yellow",
    scriptColor: "text-h3-yellow",
    mockup: "/franklin-tn/harmonic-desktop-hero.png"
  },
  {
    name: "COMMERCIAL INSURANCE AGENCY.",
    shortName: "COMMERCIAL INSURANCE",
    date: "05.20",
    tag: "WEB + SEO",
    subtitle: "INSURANCE · BREMEN, GA",
    quote: '"Top notch service. We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question or issue. Highly recommend."',
    attribution: "— Rob Goldin",
    domain: "bremencia.com",
    themeBg: "bg-h3-red",
    activeBtnBg: "bg-h3-yellow",
    activeBtnText: "text-h3-black",
    accentColor: "text-h3-yellow",
    barColor: "bg-h3-yellow",
    scriptColor: "text-h3-yellow",
    mockup: "/franklin-tn/jbjackson-desktop-hero.png"
  },
  {
    name: "DAY ACCOUNTING.",
    shortName: "DAY ACCOUNTING",
    date: "06.15",
    tag: "WEB DESIGN",
    subtitle: "CPA · NEWNAN, GA",
    quote: '"If you need some help with your web work, these guys can get it all together for you. No worries, just solutions."',
    attribution: "— Lance Day",
    domain: "dayacct.com",
    themeBg: "bg-h3-black",
    activeBtnBg: "bg-h3-red",
    activeBtnText: "text-white",
    accentColor: "text-h3-red",
    barColor: "bg-h3-red",
    scriptColor: "text-h3-red",
    mockup: "/franklin-tn/mckinley-desktop-hero.png"
  },
  {
    name: "HORIZON REAL ESTATE.",
    shortName: "HORIZON REAL ESTATE",
    date: "07.22",
    tag: "WEB DESIGN",
    subtitle: "REAL ESTATE · FRANKLIN, TN",
    quote: '"Our old website was embarrassing us at networking events. Creative Cowboys turned it around fast — clean, modern, and built to convert. Our inquiry form submissions went up immediately after launch."',
    attribution: "— Samantha Lee",
    domain: "horizonrealestate.co",
    themeBg: "bg-h3-green",
    activeBtnBg: "bg-h3-yellow",
    activeBtnText: "text-h3-black",
    accentColor: "text-h3-yellow",
    barColor: "bg-h3-yellow",
    scriptColor: "text-h3-yellow",
    mockup: "/franklin-tn/leuco-desktop-hero.png"
  }
];

const faqs = [
  {
    question: "HOW MUCH DOES A WEBSITE COST IN FRANKLIN, TN?",
    answer: "Our flat-fee tiers start at $6,500 for a Starter site (5 pages, 5–6 week build). Growth is $14,500. Scale is $28,500+. Most Franklin small businesses land in Starter or Growth. We publish these numbers on this page because we'd rather start the conversation with money on the table than have you guess. If you find a Franklin agency quoting $1,500 for a 'custom' site, the work is being done offshore — that's not a value judgment, it's just useful information."
  },
  {
    question: "HOW LONG DOES IT TAKE TO BUILD A WEBSITE?",
    answer: "5–6 weeks for Starter, 6–8 weeks for Growth, 10–14 weeks for Scale. That's calendar time, not 'we're working on it.' Each phase has a real deliverable date in your project tracker. We've never missed a launch date that wasn't pushed by the client."
  },
  {
    question: "DO YOU WORK WITH WORDPRESS, WEBFLOW, OR BOTH?",
    answer: "Both. WordPress for clients who want full ownership and an enormous plugin ecosystem (most home services, professional services, eCom). Webflow for clients who want a faster build, easier ongoing edits, and a designer-friendly CMS (most boutique retail, restaurants, creative businesses). We'll recommend the right one for your team — never the one that's easier for us."
  },
  {
    question: "WILL MY SITE ACTUALLY RANK IN LOCAL FRANKLIN SEARCH?",
    answer: "On its own, no website ranks for anything just by existing. But every site we build includes the SEO foundations that put it in a position to rank: clean technical SEO, schema markup, page speed, mobile-first design, proper headings, location-specific pages, and Google Business Profile integration. From there, ranking is a function of links, content velocity, and competitive pressure — which is what our SEO service handles. The website is the prerequisite, not the whole answer."
  },
  {
    question: "WHAT HAPPENS AFTER LAUNCH? MAINTENANCE?",
    answer: "Yes. Our Care Plans handle hosting, updates, backups, security monitoring, uptime monitoring, monthly content edits, and quarterly design refreshes. Starts at $150/mo for Starter sites. Optional, not required. Many Franklin clients run their sites themselves after launch and only call us when they want a redesign — that's fine."
  },
  {
    question: "CAN YOU REDESIGN MY Squarespace / Wix / GoDaddy SITE?",
    answer: "Most of our projects are redesigns, not new builds. We'll usually rebuild on WordPress or Webflow rather than try to fix a Squarespace site that has fundamental limitations. If your current site is actually fine and you just need a refresh, we'll tell you — and recommend a designer who does Squarespace refreshes for less than we'd charge."
  },
  {
    question: "WHO OWNS THE SITE AND DOMAIN WHEN WE'RE DONE?",
    answer: "You do. All of it. We don't host other agencies' work as a lock-in. The domain stays in your account. The hosting account (typically WP Engine, Kinsta, or Webflow Cloud) goes in your name. The files are yours. If you ever fire us, you walk away with everything."
  },
  {
    question: "DO YOU handle copywriting and photography?",
    answer: "Yes — and we usually do. Most clients come to us with a website that's been written in the voice of whoever happened to have time. We write the site in your voice and source or produce professional photography for the project. For Franklin-area shoots we'll travel for the project scope, and we have a network of Nashville-area photographers we work with directly. Included in Growth and Scale tiers; optional add-on for Starter."
  },
  {
    question: "WHAT IF I'M NOT HAPPY WITH THE DESIGN DIRECTION?",
    answer: "First design review usually happens in week 3 of a Growth project. If the direction's wrong, we'll do one full pivot — new concept, new layout, new mood — at no extra cost. That's happened twice across our portfolio. After the pivot we'll talk about whether the brief was wrong, the work was wrong, or whether we're not a fit."
  },
  {
    question: "DO YOU BUILD E-COMMERCE FOR FRANKLIN RETAILERS?",
    answer: "Yes. Shopify, WooCommerce, or BigCommerce depending on the catalog size and integrations. We've built ecom for Williamson County boutique retail, food/CPG brands, and home goods. Pricing usually lands in our Growth or Scale tier depending on product count and integrations."
  },
  {
    question: "CAN YOU MAKE MY SITE ADA / WCAG COMPLIANT?",
    answer: "WCAG 2.1 AA is our default standard on every Growth and Scale build. If you're a Franklin healthcare practice, professional services firm, or running paid ads, this isn't optional — it's a real legal exposure. Starter tier covers WCAG basics; full audit + compliance is an add-on or upgrade to Growth."
  },
  {
    question: "WHY HIRE CREATIVE COWBOYS INSTEAD OF LOCAL AGENCIES?",
    answer: "Honest answer: Franklin has big, established agencies with 20+ years in the market. If you want a 'safe' agency choice with a lot of badges, they're a real option. We're a smaller senior team — flatter org, more time on each project, modern design language, real founder accountability. Look at our case studies, look at their case studies, look at the visual design of both websites, and decide which feels like the team you want building yours. We're not for everyone."
  }
];

const neighborhoods = [
  "Cool Springs", "Westhaven", "Berry Farms", 
  "Downtown Franklin", "McKay's Mill", 
  "Fieldstone Farms", "Brentwood", "Spring Hill"
];

const verticals = [
  "Healthcare & dental", "Boutique retail", "Restaurants & hospitality",
  "Home services (HVAC, roofing)", "Professional services (law, financial)",
  "Country music & entertainment", "Wealth management"
];

const riskReversalPoints = [
  "You own the site. The domain. The hosting. The files. When the project's done, everything transfers to you. If you ever leave us, you take it all.",
  "Flat fee. No surprises. The number on the proposal is the number on the final invoice — assuming scope doesn't change. If scope changes, you'll see the new estimate before any work happens.",
  "If you're not happy with the design direction after the first review, we'll do one full pivot at no extra cost. After that we'll talk.",
  "We say no a lot. If your project isn't a fit for us, we'll tell you and point you somewhere better. We'd rather not work with you than do bad work."
];

// Helper Jagged Divider
function JaggedDivider({ color = "#008f4c", direction = "down" }: { color?: string; direction?: "up" | "down" }) {
  return (
    <div className="w-full overflow-hidden h-4 select-none pointer-events-none" style={{ color }}>
      <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className={`w-full h-full fill-current ${direction === "up" ? "rotate-180" : ""}`}>
        <polygon points="0,0 10,10 20,0 30,10 40,0 50,10 60,0 70,10 80,0 90,10 100,0 110,10 120,0 130,10 140,0 150,10 160,0 170,10 180,0 190,10 200,0 210,10 220,0 230,10 240,0 250,10 260,0 270,10 280,0 290,10 300,0 310,10 320,0 330,10 340,0 350,10 360,0 370,10 380,0 390,10 400,0 410,10 420,0 430,10 440,0 450,10 460,0 470,10 480,0 490,10 500,0 510,10 520,0 530,10 540,0 550,10 560,0 570,10 580,0 590,10 600,0 610,10 620,0 630,10 640,0 650,10 660,0 670,10 680,0 690,10 700,0 710,10 720,0 730,10 740,0 750,10 760,0 770,10 780,0 790,10 800,0 810,10 820,0 830,10 840,0 850,10 860,0 870,10 880,0 890,10 900,0 910,10 920,0 930,10 940,0 950,10 960,0 970,10 980,0 990,10 1000,0 1010,10 1020,0 1030,10 1040,0 1050,10 1060,0 1070,10 1080,0 1090,10 1100,0 1110,10 1120,0 1130,10 1140,0 1150,10 1160,0 1170,10 1180,0 1190,10 1200,0 1200,20 0,20" />
      </svg>
    </div>
  );
}

export default function WebDesignFranklinPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCardFlip = (idx: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Setup reveal observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".h3-reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleSlideChange = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial(index);
      setIsTransitioning(false);
    }, 200);
  };

  const nextSlide = () => {
    handleSlideChange((activeTestimonial + 1) % testimonials.length);
  };

  const prevSlide = () => {
    handleSlideChange((activeTestimonial - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials carousel every 5 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeTestimonial, isHovered]);

  return (
    <div className={`${anton.variable} ${robotoCondensed.variable} ${syne.variable} ${playfairDisplay.variable} ${alfaSlabOne.variable} bg-h3-cream text-h3-black font-h3-secondary selection:bg-h3-red selection:text-h3-cream min-h-screen relative overflow-hidden flex flex-col md:pt-[36px] pt-0`}>
      
      {/* Scope specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'SignPainter';
          src: url('/fonts/SignPainter_HouseScriptSemibold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
        }
        @font-face {
          font-family: 'SignPainter';
          src: url('/fonts/SignPainter_HouseScript.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        .font-sign-painter {
          font-family: 'SignPainter', cursive;
          font-weight: bold;
        }
        .h3-vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        .h3-logo-diamond {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .h3-reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: opacity, transform;
        }
        .h3-reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .h3-brutalist-card {
          border: 4px solid #1a1a1a;
          box-shadow: 6px 6px 0px #1a1a1a;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .h3-brutalist-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 10px 10px 0px #1a1a1a;
        }
        .h3-btn-brutalist {
          border: 3px solid #1a1a1a;
          box-shadow: 4px 4px 0px #1a1a1a;
          transition: all 0.2s ease;
        }
        .h3-btn-brutalist:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #1a1a1a;
        }
        .h3-btn-brutalist:active {
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0px #1a1a1a;
        }
        @keyframes h3-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .h3-marquee-track {
          display: flex;
          width: max-content;
          animation: h3-marquee-left 35s linear infinite;
        }
        .h3-dotted-bg {
          background-image: radial-gradient(rgba(26, 26, 26, 0.12) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        @keyframes h3-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .h3-animate-spin-slow {
          animation: h3-spin 25s linear infinite;
        }

        /* 3D Flip Card Styles */
        .h3-flip-card-container {
          perspective: 1000px;
          cursor: pointer;
        }
        .h3-flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        /* Hover, focus, or flipped state */
        @media (hover: hover) {
          .h3-flip-card-container:hover .h3-flip-card-inner {
            transform: rotateY(180deg);
          }
        }
        .h3-flip-card-container:focus-within .h3-flip-card-inner,
        .h3-flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .h3-flip-card-front, .h3-flip-card-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden; /* Safari */
          backface-visibility: hidden;
          border: 4px solid #1a1a1a;
          box-shadow: 6px 6px 0px #1a1a1a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .h3-flip-card-front {
          z-index: 2;
          transform: rotateY(0deg);
        }
        .h3-flip-card-back {
          transform: rotateY(180deg);
          z-index: 1;
        }

        /* Hero Card Slide In From Right */
        @keyframes h3-slide-in-right {
          from {
            opacity: 0;
            transform: translateX(40px) rotate(8deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotate(2deg);
          }
        }
        .h3-animate-slide-in-right {
          opacity: 0;
          animation: h3-slide-in-right 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
        }

        /* Hero Text Fade In Up */
        @keyframes h3-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .h3-animate-fade-in-up {
          opacity: 0;
          animation: h3-fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .h3-delay-1 {
          animation-delay: 0.15s;
        }
        .h3-delay-2 {
          animation-delay: 0.3s;
        }
        .h3-delay-3 {
          animation-delay: 0.45s;
        }
      `}} />

      {/* Dotted retro printed background layer */}
      <div className="absolute inset-0 h3-dotted-bg pointer-events-none z-0 opacity-80" />

      {/* Navigation Header */}
      <header className="relative w-full bg-h3-black border-b-4 border-h3-black py-4 px-6 md:px-12 z-40">
        <div className="w-full flex justify-between items-center">
          <Link href="/" className="inline-block select-none">
            <Image 
              src="/Cowboys logo script 2026 v2.png"
              alt="Creative Cowboys"
              width={380}
              height={110}
              priority
              className="w-48 sm:w-56 md:w-64 h-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-h3-secondary text-sm md:text-base font-bold uppercase tracking-wider text-h3-cream">
            <a href="#capabilities" className="hover:text-h3-red transition-colors duration-200">Capabilities</a>
            <a href="#case-studies" className="hover:text-h3-red transition-colors duration-200">Recent Work</a>
            <a href="#process" className="hover:text-h3-red transition-colors duration-200">Process</a>
            <a href="#pricing" className="hover:text-h3-red transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-h3-red transition-colors duration-200">FAQ</a>
          </nav>
 
          <div className="flex items-center gap-4">
            <a 
              href="#contact" 
              className="hidden md:inline-flex h3-btn-brutalist border-h3-cream bg-h3-red text-white font-bold px-6 py-3 uppercase tracking-wider text-sm items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
            >
              Get a Scorecard <ArrowUpRight size={16} />
            </a>
 
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-h3-cream hover:text-h3-red transition-colors duration-200 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
 
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-h3-black border-b-4 border-h3-black py-4 px-6 flex flex-col gap-4 font-h3-secondary text-base font-bold uppercase tracking-wider text-h3-cream z-50 animate-fade-in">
            <a 
              href="#capabilities" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Capabilities
            </a>
            <a 
              href="#case-studies" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Recent Work
            </a>
            <a 
              href="#process" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Process
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Pricing
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              FAQ
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="h3-btn-brutalist border-h3-cream bg-h3-red text-white font-bold px-4 py-2.5 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5 mt-2 shadow-[3px_3px_0px_#f3efe0] hover:shadow-[4px_4px_0px_#f3efe0]"
            >
              Get a Scorecard <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-6 md:px-12 z-10 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="font-h3-secondary text-xs font-bold tracking-[0.12em] text-h3-red uppercase h3-animate-fade-in-up">
              &mdash; WEB DESIGN &middot; FRANKLIN, TN &mdash;
            </div>

            <h1 className="font-h3-display text-4xl sm:text-6xl md:text-7xl leading-[0.95] text-h3-black uppercase tracking-tight h3-animate-fade-in-up">
              FRANKLIN <br />
              WEB DESIGN <br />
              THAT PAYS <br className="hidden md:inline" />
              FOR <span className="text-h3-red">ITSELF</span>.
            </h1>

            <p className="font-h3-secondary text-lg md:text-xl text-h3-black/80 max-w-xl leading-relaxed h3-animate-fade-in-up h3-delay-1">
              A senior Southeast agency, serving Franklin and Williamson County. 100+ websites built · $2M+ in client revenue generated · 1.4s average page load. No hand-off jargon, no offshore work, no surprise change orders.
            </p>

            <div className="flex flex-wrap gap-4 mt-2 h3-animate-fade-in-up h3-delay-2">
              <a href="#contact" className="h3-btn-brutalist bg-h3-red text-h3-cream font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2">
                Get a Free Scorecard <ArrowUpRight size={18} />
              </a>
              <a href="#contact" className="h3-btn-brutalist bg-h3-cream text-h3-black font-bold px-8 py-4 uppercase tracking-wider text-sm">
                Book a Strategy Call
              </a>
            </div>

            {/* Performance Stats Strip */}
            <div className="grid grid-cols-3 gap-4 border-t-2 border-h3-black/20 pt-8 mt-4 h3-animate-fade-in-up h3-delay-3">
              <div>
                <span className="font-h3-display text-3xl sm:text-4xl text-h3-blue block">1.4s</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Avg Page Load</span>
              </div>
              <div>
                <span className="font-h3-display text-3xl sm:text-4xl text-h3-green block">100+</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Sites Shipped</span>
              </div>
              <div>
                <span className="font-h3-display text-3xl sm:text-4xl text-h3-red block">$2M+</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Client Revenue</span>
              </div>
            </div>
          </div>

          {/* Hero Right Banner Image Card */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="h3-brutalist-card bg-h3-red p-4 sm:p-6 text-h3-cream h3-animate-slide-in-right w-full max-w-[440px] flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-h3-black/20 rounded-full blur-xl pointer-events-none" />
              
              {/* Browser Header Bar */}
              <div className="h-8 bg-h3-black rounded-t-md border-b border-white/10 flex items-center px-3 justify-between gap-4 mb-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                  <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                </div>
                <div className="bg-white/10 rounded px-3 py-0.5 text-[9px] font-mono truncate w-1/2 text-center text-white/60">
                  harmonicproduction.co
                </div>
                <div className="w-8" />
              </div>

              {/* Mockup Frame Screen */}
              <div className="flex-grow relative overflow-hidden bg-[#1a1a1a] rounded-b-md border border-h3-black/40">
                <Image
                  src="/franklin-tn/harmonic-desktop-hero.png"
                  alt="Harmonic Production new website redesign"
                  fill
                  className="object-cover object-top"
                  sizes="(max-w-[768px]) 100vw, 440px"
                  priority
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Infinite Horizontal Marquee Ticker */}
      <section className="w-full bg-h3-black text-h3-cream border-y-4 border-h3-black overflow-hidden py-4 z-20">
        <div className="h3-marquee-track">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex gap-16 items-center pr-16 font-h3-display text-2xl md:text-3xl uppercase tracking-widest select-none whitespace-nowrap">
              <span>FAST PAGE LOADS</span>
              <span className="text-h3-red">★</span>
              <span>90-DAY PAYBACK</span>
              <span className="text-h3-yellow">★</span>
              <span>NO OFFSHORE WORK</span>
              <span className="text-h3-blue">★</span>
              <span>NO SALES CALLS</span>
              <span className="text-h3-green">★</span>
              <span>WILLIAMSON COUNTY</span>
              <span className="text-h3-red">★</span>
              <span>CUSTOM SEO MAPPING</span>
              <span className="text-h3-yellow">★</span>
              <span>VILLA RICA TO FRANKLIN</span>
              <span className="text-h3-blue">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Clients Screenshot Proof Grid */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-h3-red font-bold text-xs uppercase tracking-widest font-h3-secondary block mb-10">&mdash; RECENT CLIENTS &middot; SOUTHEAST PORTFOLIO &mdash;</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {clientPortfolio.map((item, idx) => (
              <div 
                key={idx} 
                className="h3-reveal-on-scroll h3-brutalist-card bg-white p-4 flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full rounded border-2 border-h3-black overflow-hidden mb-3.5 shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-w-[768px]) 100vw, 20vw"
                    className="object-cover object-top hover:scale-[1.03] transition-transform duration-[250ms] ease-out"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-h3-display text-base uppercase tracking-tight text-h3-black leading-tight">{item.name}</h4>
                  <p className="font-h3-secondary text-[10px] font-bold uppercase tracking-wider text-h3-black/50 mt-0.5">{item.vertical}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-black border-b-4 border-h3-black z-10 text-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-h3-cream/10">
            <div className="h3-reveal-on-scroll flex flex-col text-left">
              <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary">Capabilities</span>
              <h2 className="font-h3-display text-5xl md:text-6xl text-white uppercase mt-1 leading-none">WHAT WE DO.</h2>
            </div>
            
            <div className="h3-reveal-on-scroll text-left md:text-right max-w-md font-h3-secondary text-sm text-h3-cream/70 leading-relaxed">
              We design and build websites for Franklin businesses that are tired of paying for sites that just sit there. Strategy first, then design, then a clean build that loads in under 1.5 seconds.
            </div>
          </div>

          {/* Grid Layout of 6 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 h3-reveal-on-scroll">
            {capabilities.map((item) => (
              <div 
                key={item.num}
                className="h3-brutalist-card bg-h3-cream text-h3-black p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-h3-display text-4xl text-h3-red leading-none select-none">{item.num}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase border border-h3-black/30 rounded-full px-2.5 py-0.5">SERVICES</span>
                  </div>
                  
                  <h3 className="font-h3-display text-xl uppercase tracking-wider mb-2 text-left">{item.title}</h3>
                  <p className="font-h3-secondary text-xs text-h3-black/80 leading-relaxed mb-6 text-left">{item.desc}</p>
                </div>
                
                <ul className="space-y-2 border-t border-h3-black/10 pt-4 text-left">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-wider text-h3-black/70">
                      <Check size={12} className="text-h3-green shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-cream z-10 border-b-4 border-h3-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Case Studies Header */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h3-reveal-on-scroll flex flex-col gap-2">
              <span className="text-h3-red font-bold text-xs uppercase tracking-widest">Proven Outcomes</span>
              <h2 className="font-h3-display text-5xl md:text-6xl uppercase leading-none">CASE<br />STUDIES</h2>
              <div className="h-1.5 w-16 bg-h3-red mt-2" />
            </div>

            <p className="font-h3-secondary text-sm md:text-base text-h3-black/70 leading-relaxed max-w-sm">
              We focus on the metrics that shift your balance sheet. Here is how we've helped small businesses across the Southeast scale their operations.
            </p>
          </div>

          {/* Case Studies Timeline/List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {caseStudies.map((study, idx) => (
              <div 
                key={study.id}
                className="h3-reveal-on-scroll h3-brutalist-card bg-white hover:bg-white/80 p-6 md:p-8 flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-h3-display text-xl text-h3-red">{study.id}</span>
                      <span className="text-h3-black/40 text-xs font-bold uppercase tracking-wider">// {study.category}</span>
                    </div>
                    
                    <h3 className="font-h3-display text-2xl md:text-3xl uppercase tracking-wide leading-tight">
                      {study.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-4 text-xs font-bold uppercase text-h3-black/60 mt-1">
                      <span>Client: {study.client}</span>
                      <span className="text-h3-black/35">•</span>
                      <span>Location: {study.location}</span>
                    </div>
                  </div>

                  {/* Impact Highlight Badge */}
                  <div className="h-fit px-4 py-2 border-2 border-h3-black bg-h3-yellow text-h3-black font-bold uppercase text-xs tracking-wider shadow-[2px_2px_0px_#1a1a1a] whitespace-nowrap self-start md:self-auto">
                    {study.result}
                  </div>
                </div>

                {/* Bullets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-h3-black/10 text-left">
                  {study.impacts.map((impact, i) => (
                    <div key={i} className="flex gap-2.5">
                      <Check size={16} className="text-h3-green flex-shrink-0 mt-0.5" />
                      <p className="font-h3-secondary text-xs text-h3-black/85 leading-relaxed">{impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-black border-b-4 border-h3-black z-10 text-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl mb-16 text-left">
            <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary">&mdash; OUR PROCESS &mdash;</span>
            <h2 className="font-h3-display text-5xl md:text-6xl text-white uppercase mt-1 leading-none">HOW WE WORK.</h2>
            <p className="font-h3-secondary text-sm md:text-base text-h3-cream/70 leading-relaxed mt-4">
              Five steps. Each with a realistic timeline. We send you the actual artifact at each step — not just a Slack update saying it's done.
            </p>
          </div>

          {/* Stepped Process List */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {processSteps.map((step, idx) => (
              <div 
                key={idx}
                className="h3-brutalist-card bg-h3-cream text-h3-black p-6 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-full border-2 border-h3-black bg-h3-yellow flex items-center justify-center font-h3-display text-lg text-h3-black mb-4 select-none">
                    {step.num}
                  </div>
                  
                  <h3 className="font-h3-display text-lg uppercase tracking-wide mb-1 leading-none">{step.title}</h3>
                  <span className="text-[10px] font-bold text-h3-red bg-h3-red/10 px-2 py-0.5 rounded-full inline-block mb-4">{step.timing}</span>
                  
                  <p className="font-h3-secondary text-xs text-h3-black/80 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-h3-red font-bold text-xs uppercase tracking-widest font-h3-secondary block mb-3">&mdash; PRICING TIERS &mdash;</span>
            <h2 className="font-h3-display text-5xl md:text-6xl uppercase leading-none">THREE WAYS TO START.</h2>
            <p className="font-h3-secondary text-sm md:text-base text-h3-black/60 max-w-2xl mx-auto mt-4 leading-relaxed">
              Most Franklin agencies hide their pricing. We don't. Here's what a website costs us to build correctly — flat project fees with zero hidden charge orders.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`h3-brutalist-card p-8 flex flex-col justify-between text-left relative ${
                  plan.isPopular ? "bg-white border-h3-red shadow-[6px_6px_0px_#e94e33]" : "bg-white"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-h3-red border-2 border-h3-black text-h3-cream px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    MOST POPULAR
                  </div>
                )}
                
                <div>
                  <h3 className="font-h3-display text-2xl uppercase tracking-wider mb-1 leading-none">{plan.name}</h3>
                  <div className="font-h3-display text-3xl text-h3-red my-4">{plan.price}</div>
                  <p className="font-h3-secondary text-xs text-h3-black/75 mb-6">{plan.desc}</p>
                  
                  <ul className="space-y-3.5 mb-8 border-t border-h3-black/10 pt-6">
                    {plan.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex gap-2.5 items-start text-xs font-h3-secondary text-h3-black/90 leading-snug">
                        <Check size={16} className="text-h3-green shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: bullet }} />
                      </li>
                    ))}
                  </ul>
                </div>
                
                <a href="#contact" className={`h3-btn-brutalist w-full text-center font-bold py-3.5 uppercase tracking-wider text-xs ${
                  plan.isPopular ? "bg-h3-red text-white" : "bg-h3-cream text-h3-black"
                }`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>

          {/* Pricing detail explainer card */}
          <div className="h3-reveal-on-scroll h3-brutalist-card bg-h3-black text-h3-cream p-6 md:p-8 flex flex-col justify-between sm:flex-row sm:items-center gap-6 mt-16 text-left">
            <div className="flex flex-col gap-2">
              <h3 className="font-h3-display text-xl text-h3-yellow uppercase tracking-widest leading-none">HOW WE PRICE OUR PROJECTS</h3>
              <p className="font-h3-secondary text-xs text-h3-cream/80 max-w-3xl leading-relaxed mt-1.5">
                Flat project fee, paid in three milestones (kickoff / design approval / launch). No retainers, no hidden charge orders — we scope tight upfront. If your project doesn't fit one of these, we'll tell you and recommend someone better suited (even if that's Squarespace or a freelancer).
              </p>
            </div>
            <a href="#contact" className="h3-btn-brutalist bg-h3-red text-h3-cream font-bold px-8 py-3.5 uppercase tracking-wider text-xs w-fit flex-shrink-0 border-h3-black">
              BOOK A STRATEGY CALL
            </a>
          </div>

        </div>
      </section>

      {/* Williamson County Service Area map and neighborhood details */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-black text-white border-b-4 border-h3-black z-10 overflow-hidden text-left">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Columns */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="font-h3-secondary text-xs font-bold tracking-[0.12em] text-h3-yellow uppercase mb-3 block">&mdash; WILLIAMSON COUNTY &mdash;</span>
              
              <h2 className="font-h3-display text-4xl md:text-5xl uppercase leading-none mb-6">
                SERVING THE FULL FRANKLIN & WILLIAMSON COUNTY MARKET.
              </h2>
              
              <p className="font-h3-secondary text-sm text-h3-cream/70 leading-relaxed mb-10">
                From Cool Springs storefronts to Westhaven boutiques, from Berry Farms home services to Downtown Franklin professional firms — we work with businesses across every Franklin neighborhood. Strategy calls in person or remote, whichever fits how you work.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-h3-cream/15 pt-6">
                <div>
                  <h3 className="font-h3-display text-sm uppercase text-h3-yellow mb-3">Neighborhoods</h3>
                  <ul className="space-y-2 text-xs font-h3-secondary font-bold text-h3-cream/80 uppercase tracking-wide">
                    {neighborhoods.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-h3-red rotate-45" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-h3-display text-sm uppercase text-h3-yellow mb-3">Verticals</h3>
                  <ul className="space-y-2 text-xs font-h3-secondary font-bold text-h3-cream/80 uppercase tracking-wide">
                    {verticals.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-h3-red rotate-45" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Map Image */}
            <div className="lg:col-span-7 flex justify-center items-center lg:translate-x-6 overflow-visible w-full">
              <div className="relative w-full aspect-[4/3] select-none border-4 border-h3-black shadow-2xl rounded-lg bg-h3-cream p-4">
                <Image 
                  src="/franklin-tn/williamson-county-map.svg" 
                  alt="Williamson County Map"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Risk Reversal Guarantee Card */}
      <section className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10">
        <div className="max-w-4xl mx-auto h3-brutalist-card bg-white p-6 sm:p-12 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-h3-black pointer-events-none">
            <Shield className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <span className="text-h3-red font-bold text-xs uppercase tracking-widest font-h3-secondary block mb-3">&mdash; OUR GUARANTEE &mdash;</span>
            <h2 className="font-h3-display text-3xl md:text-4xl uppercase mb-8">THINGS WE WANT YOU TO KNOW UPFRONT.</h2>
            
            <ul className="space-y-6">
              {riskReversalPoints.map((point, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-2.5 h-2.5 bg-h3-red rotate-45 shrink-0 mt-2" />
                  <p className="font-h3-secondary text-sm md:text-base text-h3-black/85 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Alternating Color Carousel */}
      <section 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full py-12 md:py-20 px-6 md:px-12 border-b-4 border-h3-black z-10 relative flex flex-col items-center justify-between transition-colors duration-500 overflow-hidden ${testimonials[activeTestimonial].themeBg}`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col justify-between h-full min-h-[500px] md:min-h-[600px] relative z-10">
          
          {/* Top Header Row */}
          <div className="w-full flex items-center justify-between font-h3-secondary text-xs md:text-sm font-bold tracking-widest text-white/95 uppercase border-b border-white/20 pb-4 mb-12">
            <span>Client Testimonials</span>
            <div className="flex-grow h-[1px] bg-white/20 mx-6 hidden sm:block" />
            <span>{`0${activeTestimonial + 1} / 04`}</span>
          </div>

          {/* Grid Layout for Content */}
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Left Column: Review text and rating */}
            <div className="lg:col-span-7 flex flex-col items-start text-left gap-4">
              {/* Badges */}
              <div className="flex gap-3">
                <span className="bg-black/30 backdrop-blur-sm border border-white/10 text-white font-h3-secondary font-bold text-xs tracking-wider px-3 py-1 rounded">
                  {testimonials[activeTestimonial].date}
                </span>
                <span className="bg-black/30 backdrop-blur-sm border border-white/10 text-white font-h3-secondary font-bold text-xs tracking-wider px-3 py-1 rounded">
                  {testimonials[activeTestimonial].tag}
                </span>
              </div>

              {/* Large Client Name */}
              <h2 className={`font-h3-display text-3xl sm:text-5xl md:text-7xl leading-none mt-2 select-none uppercase tracking-tight ${testimonials[activeTestimonial].accentColor}`}>
                {testimonials[activeTestimonial].name}
              </h2>

              {/* Subtitle */}
              <p className="font-h3-secondary font-bold text-xs tracking-widest text-white/90 uppercase">
                {testimonials[activeTestimonial].subtitle}
              </p>

              {/* Quote */}
              <blockquote className="font-serif text-lg md:text-2xl font-medium leading-relaxed italic text-white mt-4 max-w-xl">
                {testimonials[activeTestimonial].quote}
              </blockquote>

              {/* Attribution */}
              <p className="font-h3-secondary font-bold text-sm tracking-widest text-h3-yellow uppercase mt-2">
                {testimonials[activeTestimonial].attribution}
              </p>

              {/* 5 Stars */}
              <div className="flex gap-1.5 mt-2 text-h3-yellow">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} fill="currentColor" className="stroke-black/30 stroke-[1.5px]" />
                ))}
              </div>
            </div>

            {/* Right Column: Browser mockup */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-[460px] mx-auto">
                {/* Browser Container */}
                <div className="relative z-10 bg-[#121417] rounded-[18px] border border-white/15 overflow-hidden shadow-2xl flex flex-col w-full aspect-[4/3] transition-all duration-300">
                  {/* Browser Header Bar */}
                  <div className="h-10 bg-[#1a1c1e] border-b border-white/5 flex items-center px-4 justify-between gap-4">
                    {/* Traffic light dots */}
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    {/* Address Input Bar */}
                    <div className="bg-[#0f1113] rounded-md text-[11px] text-white/50 px-3 py-1 flex items-center justify-center font-mono w-3/5 max-w-[240px] truncate select-none border border-white/5">
                      {testimonials[activeTestimonial].domain}
                    </div>
                    <div className="w-12" />
                  </div>

                  {/* Browser Window Body Content */}
                  <div className="flex-grow relative overflow-hidden bg-[#1a1a1a]">
                    <Image
                      src={testimonials[activeTestimonial].mockup}
                      alt={testimonials[activeTestimonial].name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-w-[768px]) 100vw, 460px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Row */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/20 pt-8 mt-12">
            {/* Prev/Next Navigation Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={prevSlide}
                className="border border-white/40 hover:bg-white/10 text-white rounded-xl w-14 h-12 flex items-center justify-center transition-colors cursor-pointer select-none"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft size={20} />
              </button>
              
              <button 
                onClick={nextSlide}
                className={`rounded-xl w-14 h-12 flex items-center justify-center transition-colors cursor-pointer font-bold select-none text-h3-black ${testimonials[activeTestimonial].activeBtnBg}`}
                aria-label="Next Testimonial"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Central Tabbed Indicators */}
            <div className="flex items-center gap-6 md:gap-10">
              {testimonials.map((item, idx) => {
                const isActive = idx === activeTestimonial;
                return (
                  <button 
                    key={idx}
                    onClick={() => handleSlideChange(idx)}
                    className="flex flex-col items-center cursor-pointer select-none text-white focus:outline-none"
                  >
                    <span className={`text-[10px] md:text-xs font-bold tracking-wider transition-colors duration-200 ${isActive ? "text-white" : "text-white/40"}`}>
                      {`0${idx + 1}`}
                    </span>
                    
                    <div className="w-10 h-1.5 my-1.5 relative rounded bg-white/10 overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 right-0 transition-transform duration-300 origin-left ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      } ${testimonials[activeTestimonial].barColor}`} />
                    </div>

                    <span className={`text-[9px] font-bold font-h3-secondary tracking-widest uppercase transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/40"
                    } hidden md:inline`}>
                      {item.shortName}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={`hidden sm:block text-right transition-colors duration-300 font-sign-painter text-2xl md:text-3xl tracking-wide select-none ${
              testimonials[activeTestimonial].scriptColor
            }`}>
              &mdash; hear 'em out
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="w-full py-12 md:py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10 text-h3-black">
        <div className="max-w-7xl mx-auto">
          
          <div className="h3-reveal-on-scroll text-left flex flex-col gap-2 mb-12">
            <span className="text-h3-red font-bold text-xs uppercase tracking-widest font-h3-secondary">FAQ</span>
            <h2 className="font-h3-display text-5xl md:text-6xl text-h3-black uppercase mt-1 leading-none">QUESTIONS ASKED.</h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-start">
            
            {/* Left Menu (Buttons List) */}
            <div className="lg:col-span-5 flex flex-col gap-4 w-full">
              {faqs.map((faq, index) => {
                const isActive = activeFaq === index;
                return (
                  <div key={index} className="h3-reveal-on-scroll flex flex-col w-full">
                    <button 
                      onClick={() => setActiveFaq(index)}
                      className={`w-full flex justify-between items-center p-4 text-left font-bold font-h3-secondary text-xs sm:text-sm tracking-wide uppercase transition-all duration-200 select-none border-2 border-h3-black ${
                        isActive 
                          ? "bg-h3-black text-h3-yellow shadow-[4px_4px_0px_#e94e33] translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-white text-h3-black hover:bg-h3-cream/40"
                      }`}
                    >
                      <span>{faq.question}</span>
                      <span className={`text-base font-bold flex-shrink-0 ml-4 ${isActive ? "text-h3-yellow" : "text-h3-red"}`}>
                        {isActive ? "—" : "+"}
                      </span>
                    </button>
                    
                    {/* Mobile Inline Details Card */}
                    {isActive && (
                      <div className="lg:hidden w-full mt-3">
                        <div className="bg-h3-red border-4 border-h3-black p-6 text-white shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between text-left">
                          <div>
                            <span className="text-h3-yellow font-bold text-[10px] uppercase tracking-widest font-h3-secondary">
                              Q.0{index + 1}
                            </span>
                            <h3 className="font-h3-display text-xl text-white uppercase mt-2 leading-tight">
                              {faq.question}
                            </h3>
                            <div className="font-h3-secondary text-xs sm:text-sm text-h3-cream/90 leading-relaxed mt-4">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Details Panel (Desktop only) */}
            <div className="hidden lg:block lg:col-span-7 w-full h-full h3-reveal-on-scroll">
              {(() => {
                const currentFaq = faqs[activeFaq] || faqs[0];
                return (
                  <div className="bg-h3-red border-4 border-h3-black p-8 text-white shadow-[6px_6px_0px_#1a1a1a] min-h-[420px] flex flex-col justify-between text-left">
                    <div>
                      <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary">
                        Q.0{activeFaq + 1} &middot; ANSWER
                      </span>
                      <h3 className="font-h3-display text-3xl text-white uppercase mt-2 leading-tight">
                        {currentFaq.question}
                      </h3>
                      <div className="font-h3-secondary text-base text-h3-cream/90 leading-relaxed mt-6">
                        {currentFaq.answer}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer id="contact" className="w-full bg-h3-black text-h3-cream border-t-4 border-h3-black py-12 md:py-16 px-6 md:px-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Footer Contact Details */}
          <div className="md:col-span-5 flex flex-col gap-6 text-left">
            <h3 className="font-h3-display text-4xl uppercase tracking-widest text-h3-yellow">HOWDY PARTNER</h3>
            <p className="font-h3-secondary text-sm text-h3-cream/70 leading-relaxed max-w-sm">
              We're Josh and Dave — serving Franklin and Williamson County, TN. No vanity metrics. Just high-converting websites, fast code, and SEO built to make your phone ring.
            </p>

            <div className="flex flex-col gap-3 font-bold text-sm tracking-wider uppercase">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-h3-yellow" />
                <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
              </div>
              <a href="mailto:howdy@creativecowboys.co" className="flex items-center gap-3 hover:text-h3-red transition-colors duration-200">
                <Mail size={16} className="text-h3-yellow" />
                <span>howdy@creativecowboys.co</span>
              </a>
              <a href="tel:4702437517" className="flex items-center gap-3 hover:text-h3-red transition-colors duration-200">
                <Phone size={16} className="text-h3-yellow" />
                <span>(470) 243-7517</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-h3-yellow" />
                <span>Franklin, Tennessee</span>
              </div>
            </div>
          </div>

          {/* Footer Logo Wordmark */}
          <div className="md:col-span-4 flex flex-col items-center justify-center py-6 border-y-2 md:border-y-0 md:border-x-2 border-h3-cream/10">
            <div className="font-h3-display text-5xl uppercase tracking-widest text-h3-red mb-2">
              COWBOYS
            </div>
            <div className="font-h3-secondary text-[9px] uppercase tracking-[0.2em] font-bold text-h3-cream/40">
              © 2026 ALL RIGHTS RESERVED
            </div>
            
            {/* Social Icons Badge Grid */}
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/creativecowboyco" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-h3-cream rotate-45 flex items-center justify-center hover:bg-h3-cream hover:text-h3-black transition-colors duration-200 group">
                <span className="-rotate-45 font-bold text-xs">fb</span>
              </a>
              <a href="https://www.instagram.com/creativecowboyco" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-h3-cream rotate-45 flex items-center justify-center hover:bg-h3-cream hover:text-h3-black transition-colors duration-200 group">
                <span className="-rotate-45 font-bold text-xs">ig</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 flex flex-col gap-6 text-left">
            <h4 className="font-h3-display text-xl uppercase tracking-widest text-h3-blue">DIRECT LINKS</h4>
            <div className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-h3-cream/70">
              <a href="/seo" className="hover:text-h3-red transition-colors">SEO Programs</a>
              <a href="/web-design" className="hover:text-h3-red transition-colors">Web Design</a>
              <a href="/ppc" className="hover:text-h3-red transition-colors">PPC Campaigns</a>
              <a href="/brand-strategy" className="hover:text-h3-red transition-colors">Brand Strategy</a>
              <a href="/privacy-policy" className="hover:text-h3-red transition-colors mt-2">Privacy Policy</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
