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
  ArrowRight
} from "lucide-react";
import WranglerChat from "@/components/WranglerChat";

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

// Static Business Data
const caseStudies = [
  {
    id: "04.15",
    title: "HARMONIC PRODUCTION",
    category: "WEB DESIGN & SEO",
    client: "AV & Event Concert Outfits",
    location: "Cleveland, TN",
    result: "300% Engagement",
    link: "/services",
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
    client: "Personal Injury Lawyers",
    location: "Douglasville, GA + Across the Southeast",
    result: "+$500k Revenue",
    link: "/seo",
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
    client: "Roofing & Restoration",
    location: "Douglasville, GA",
    result: "+1000% Traffic",
    link: "/web-design",
    impacts: [
      "Built dynamic neighborhood service-area landing pages.",
      "Established top-tier Google Business Profile optimization and schema markup.",
      "Shipped custom storm-damage intake forms that feed straight to insurance leads."
    ]
  }
];

const services = [
  {
    num: "01",
    title: "WEB DESIGN.",
    desc: "Landing pages · e-comm · UI/UX",
    link: "/web-design"
  },
  {
    num: "02",
    title: "SEO SEARCH.",
    desc: "Local keywords · Google Business Profile · audits · authority links",
    link: "/seo"
  },
  {
    num: "03",
    title: "PPC ADVERTISING.",
    desc: "Google Ads · Meta · funnel optimization · lead tracking",
    link: "/ppc"
  },
  {
    num: "04",
    title: "BRAND IDENTITY.",
    desc: "Logos · typography · style guides · print + vector",
    link: "/brand-strategy"
  },
  {
    num: "05",
    title: "SOCIAL ADS.",
    desc: "Meta · TikTok · creative testing",
    link: "/social-media-ads"
  },
  {
    num: "06",
    title: "LOCAL SEO.",
    desc: "Service-area pages · reviews · citations · maps ranking",
    link: "/seo"
  },
  {
    num: "07",
    title: "CONTENT + COPY.",
    desc: "Site copy · blogs · landing pages",
    link: "/media-creation"
  },
  {
    num: "08",
    title: "EMAIL + CRM.",
    desc: "Welcome flows · retention · cart recovery",
    link: "/contact"
  }
];

const portfolioItems = [
  {
    title: "Harmonic Web Design",
    desc: "Custom site for Cleveland, TN concert AV outfit",
    bgClass: "bg-h3-green text-h3-cream",
    tag: "WEB DESIGN + SEO",
    services: [
      "Custom-built website",
      "Localized SEO strategy",
      "Event Calendar Integration",
      "High-performance hosting"
    ]
  },
  {
    title: "JBJ Law Ad Campaigns",
    desc: "Legal lead-gen landing pipelines",
    bgClass: "bg-h3-cream text-h3-black",
    tag: "Google PPC",
    services: [
      "Google Ads strategy",
      "Retargeting Ad Design",
      "Local lead funnels",
      "Phone conversion tracking"
    ]
  },
  {
    title: "McKinley Roofing Site",
    desc: "Local service business SEO mapping",
    bgClass: "bg-h3-blue text-h3-cream",
    tag: "Web Design",
    services: [
      "Neighborhood service-area pages",
      "Schema markup",
      "Google Business Profile optimization",
      "Review generation system"
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
    quote: '"Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime. Would recommend them to anyone looking for SEO and market engagement."',
    attribution: "— Ryan Coffey",
    domain: "harmonicproduction.co",
    themeBg: "bg-h3-blue",
    activeBtnBg: "bg-h3-yellow",
    activeBtnText: "text-h3-black",
    accentColor: "text-h3-yellow",
    barColor: "bg-h3-yellow",
    scriptColor: "text-h3-yellow",
    mockup: {
      title: "HARMONIC",
      subtitle: "CLEVELAND, TN · EST. 2014",
      headline: "WE MAKE PRODUCTION LEGENDARY.",
      btnText: "GET A QUOTE",
      btnBg: "bg-[#F26522] text-white"
    }
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
    mockup: {
      title: "COMMERCIAL INSURANCE",
      subtitle: "BREMEN, GA",
      headline: "COMMERCIAL & PERSONAL INSURANCE",
      btnText: "GET A PROPOSAL",
      btnBg: "bg-h3-red text-white"
    }
  },
  {
    name: "DAY ACCOUNTING.",
    shortName: "DAY ACCOUNTING",
    date: "06.15",
    tag: "WEB DESIGN",
    subtitle: "CPA · NEWNAN, GA · LOCAL GUIDE / 23 REVIEWS",
    quote: '"If you need some help with your web work, these guys can get it all together for you. No worries, just solutions."',
    attribution: "— Lance Day",
    domain: "dayacct.com",
    themeBg: "bg-h3-black",
    activeBtnBg: "bg-h3-red",
    activeBtnText: "text-white",
    accentColor: "text-h3-red",
    barColor: "bg-h3-red",
    scriptColor: "text-h3-red",
    mockup: {
      title: "DAY ACCOUNTING",
      subtitle: "NEWNAN, GA",
      headline: "ACCOUNTING & CPA SERVICES",
      btnText: "GET IN TOUCH",
      btnBg: "bg-white text-h3-black"
    }
  }
];

const faqs = [
  {
    question: "HOW DOES PRICING WORK?",
    shortQuestion: "How does pricing work?",
    index: "01",
    category: "PRICING",
    answer: (
      <>
        Every project is different, so we don't do one-size-fits-all pricing. We'll talk through what you need and put together a <span className="text-h3-yellow font-bold">custom proposal</span> that fits your goals and budget.
      </>
    ),
    related: [
      { text: "How long does a site take?", index: 1 },
      { text: "How do I get started?", index: 5 }
    ]
  },
  {
    question: "HOW LONG DOES A SITE TAKE?",
    shortQuestion: "How long does a site take?",
    index: "02",
    category: "TIMELINE",
    answer: (
      <>
        Most builds ship in <span className="text-h3-yellow font-bold">3 to 6 weeks</span>. A custom landing page can be live in a week. Full e-commerce builds run 5 to 8 weeks. We send a <span className="text-h3-yellow font-bold">fixed timeline</span> with the proposal — no scope creep, no surprises.
      </>
    ),
    related: [
      { text: "How does pricing work?", index: 0 },
      { text: "How do I get started?", index: 5 }
    ]
  },
  {
    question: "SMALL BUSINESSES?",
    shortQuestion: "Do you work with small businesses?",
    index: "03",
    category: "AUDIENCE",
    answer: (
      <>
        Yes — most of our clients are <span className="text-h3-yellow font-bold">small or family-owned</span>. We've worked with roofers, lawyers, AV companies, restaurants, churches, and accountants. If you're a local or regional business looking for real growth, you're the kind of client we built this agency for.
      </>
    ),
    related: [
      { text: "How does pricing work?", index: 0 },
      { text: "What results can I expect?", index: 4 }
    ]
  },
  {
    question: "WHERE Y'ALL LOCATED?",
    shortQuestion: "Where are you located?",
    index: "04",
    category: "LOCATION",
    answer: (
      <>
        <span className="text-h3-yellow font-bold">Villa Rica, GA</span> — about 35 miles west of Atlanta. We ride for clients across the Southeast. Currently serving Villa Rica, Carrollton, Douglasville, Cleveland TN, Franklin TN, and beyond. Distance is no issue; results are.
      </>
    ),
    related: [
      { text: "How do I get started?", index: 5 }
    ]
  },
  {
    question: "WHAT RESULTS CAN I EXPECT?",
    shortQuestion: "What results can I expect?",
    index: "05",
    category: "METRICS",
    answer: (
      <>
        Results vary by business and starting point, but the goal we work toward on every engagement is the same: traffic that costs less than the revenue it brings in. Most of our long-term clients see traffic, lead volume, and revenue grow within <span className="text-h3-yellow font-bold">the first 90 days</span>. We send monthly reports so you can see the math yourself.
      </>
    ),
    related: [
      { text: "Do you work with small businesses?", index: 2 },
      { text: "How does pricing work?", index: 0 }
    ]
  },
  {
    question: "HOW DO I GET STARTED?",
    shortQuestion: "How do I get started?",
    index: "06",
    category: "STARTING",
    answer: (
      <>
        Hit <span className="text-h3-yellow font-bold">"Get a Proposal"</span> or call us at <span className="text-h3-yellow font-bold">(470) 243-7517</span>. We'll have a 20-minute conversation about what you're trying to do, what you've tried, and where you're stuck. If we're a fit, we'll send you a custom proposal within 3 business days. No high-pressure sales calls, no monthly retainer commitments before you've seen real work.
      </>
    ),
    related: [
      { text: "How does pricing work?", index: 0 },
      { text: "How long does a site take?", index: 1 }
    ]
  }
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

export default function Home3Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    <div className={`${anton.variable} ${robotoCondensed.variable} ${syne.variable} ${playfairDisplay.variable} ${alfaSlabOne.variable} bg-h3-cream text-h3-black font-h3-secondary selection:bg-h3-red selection:text-h3-cream min-h-screen relative overflow-hidden flex flex-col pt-[36px]`}>
      
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
        .h3-menu-dots {
          flex: 1;
          border-bottom: 2px dotted rgba(26, 26, 26, 0.35);
          margin: 0 10px;
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
        /* Hover or Touch active state */
        .h3-flip-card-container:hover .h3-flip-card-inner,
        .h3-flip-card-container:focus-within .h3-flip-card-inner {
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
          /* Handle 3D layering for Safari */
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
            transform: translateX(120px) rotate(8deg);
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
          {/* Logo on the left (new script image, white) */}
          <Link 
            href="/" 
            className="inline-block select-none"
          >
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

          {/* Navigation Links in the middle */}
          <nav className="hidden md:flex items-center gap-8 font-h3-secondary text-sm md:text-base font-bold uppercase tracking-wider text-h3-cream">
            <a href="#case-studies" className="hover:text-h3-red transition-colors duration-200">Case Studies</a>
            <a href="#services" className="hover:text-h3-red transition-colors duration-200">Services</a>
            <a href="#portfolio" className="hover:text-h3-red transition-colors duration-200">Selected Works</a>
          </nav>
 
          {/* Right Action Button & Mobile Trigger */}
          <div className="flex items-center gap-4">
            <a 
              href="#contact" 
              className="hidden md:inline-flex h3-btn-brutalist border-h3-cream bg-h3-red text-white font-bold px-6 py-3 uppercase tracking-wider text-sm items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_#f3efe0] hover:shadow-[6px_6px_0px_#f3efe0]"
            >
              Get A Proposal <ArrowUpRight size={16} />
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-h3-black border-b-4 border-h3-black py-4 px-6 flex flex-col gap-4 font-h3-secondary text-base font-bold uppercase tracking-wider text-h3-cream z-50">
            <a 
              href="#case-studies" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Case Studies
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Services
            </a>
            <a 
              href="#portfolio" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-h3-red transition-colors duration-200"
            >
              Selected Works
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="h3-btn-brutalist border-h3-cream bg-h3-red text-white font-bold px-4 py-2.5 uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5 mt-2 shadow-[3px_3px_0px_#f3efe0] hover:shadow-[4px_4px_0px_#f3efe0]"
            >
              Get A Proposal <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-24 px-6 md:px-12 z-10 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            <h1 className="font-h3-display text-6xl md:text-8xl leading-[0.9] text-h3-black uppercase tracking-tight h3-animate-fade-in-up">
              DIGITAL <br className="hidden md:inline" />
              MARKETING <br />
              THAT <span className="text-h3-red">DRIVES</span> <br className="hidden md:inline" />
              RESULTS.
            </h1>

            <p className="font-h3-secondary text-lg md:text-xl text-h3-black/80 max-w-xl leading-relaxed h3-animate-fade-in-up h3-delay-1">
              We're the Southeast's no-fluff marketing agency. We build fast, high-converting websites, run advertising that pays for itself, and get small businesses found on Google. Serving Villa Rica, Carrollton, Douglasville, Cleveland TN, Franklin TN, and beyond.
            </p>

            <div className="flex flex-wrap gap-4 mt-2 h3-animate-fade-in-up h3-delay-2">
              <a href="#contact" className="h3-btn-brutalist bg-h3-red text-h3-cream font-bold px-8 py-4 uppercase tracking-wider text-sm inline-flex items-center gap-2">
                Get A Proposal <ArrowUpRight size={18} />
              </a>
              <a href="#services" className="h3-btn-brutalist bg-h3-cream text-h3-black font-bold px-8 py-4 uppercase tracking-wider text-sm">
                Explore Services
              </a>
            </div>

            {/* Performance Stats Strip */}
            <div className="grid grid-cols-3 gap-4 border-t-2 border-h3-black/20 pt-8 mt-4 h3-animate-fade-in-up h3-delay-3">
              <div>
                <span className="font-h3-display text-4xl text-h3-blue block">300% ↑</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Avg Site Traffic</span>
              </div>
              <div>
                <span className="font-h3-display text-4xl text-h3-green block">90-DAY</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Payback Target</span>
              </div>
              <div>
                <span className="font-h3-display text-4xl text-h3-red block">100+</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-h3-black/60">Brands Shipped</span>
              </div>
            </div>
          </div>

          {/* Hero Right Banner Image Card */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="h3-brutalist-card bg-h3-red p-8 text-h3-cream h3-animate-slide-in-right w-full max-w-[420px] flex flex-col justify-between aspect-[3/4] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-h3-black/20 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <span className="font-h3-display text-2xl uppercase tracking-widest opacity-80 border-b-2 border-h3-cream pb-1">COWBOYS</span>
                <div className="border-2 border-h3-cream rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">NO FLUFF</div>
              </div>

              <div className="my-8 flex flex-col gap-2">
                <span className="font-h3-secondary text-xs uppercase tracking-widest font-bold text-h3-yellow">Our Mission</span>
                <span className="font-h3-display text-5xl md:text-6xl leading-[0.95] uppercase">
                  ZERO<br />
                  WASTED<br />
                  SPEND.
                </span>
              </div>

              <div className="border-t-2 border-h3-cream/20 pt-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span>ESTABLISHED 2025</span>
                <span>VILLA RICA, GA</span>
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
              <span>CUSTOM WEB DESIGN</span>
              <span className="text-h3-red">★</span>
              <span>SEO SEARCH</span>
              <span className="text-h3-yellow">★</span>
              <span>ROI PPC ADVERTISING</span>
              <span className="text-h3-blue">★</span>
              <span>BRAND IDENTITY</span>
              <span className="text-h3-green">★</span>
              <span>SOCIAL MEDIA ADS</span>
              <span className="text-h3-red">★</span>
              <span>LOCAL SEO MAPPING</span>
              <span className="text-h3-yellow">★</span>
              <span>CONTENT + COPY</span>
              <span className="text-h3-blue">★</span>
              <span>EMAIL + CRM</span>
              <span className="text-h3-cream">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="w-full py-20 px-6 md:px-12 bg-h3-cream z-10 border-b-4 border-h3-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Case Studies Header & Left Poster */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h3-reveal-on-scroll flex flex-col gap-2">
              <span className="text-h3-red font-bold text-xs uppercase tracking-widest">Proven Outcomes</span>
              <h2 className="font-h3-display text-5xl md:text-6xl uppercase leading-none">CASE<br />STUDIES</h2>
              <div className="h-1.5 w-16 bg-h3-red mt-2" />
            </div>

            <p className="font-h3-secondary text-sm md:text-base text-h3-black/70 leading-relaxed max-w-sm">
              We focus on the metrics that shift your balance sheet. Here is how we've helped small businesses across the Southeast and beyond scale their operations.
            </p>

            {/* Brutalist Skew Poster Card */}
            <div className="h3-reveal-on-scroll h3-brutalist-card bg-h3-red text-h3-cream p-8 flex flex-col justify-between aspect-square mt-4 -rotate-2 select-none">
              <span className="font-h3-secondary text-xs uppercase tracking-widest font-bold">Creative Cowboys</span>
              <h3 className="font-h3-display text-6xl md:text-7xl -rotate-6 uppercase text-center my-auto leading-none text-h3-yellow">
                NO<br />FLUFF
              </h3>
              <span className="font-h3-secondary text-[10px] uppercase tracking-widest font-bold text-right">RESULTS ONLY</span>
            </div>
          </div>

          {/* Case Studies Timeline/List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {caseStudies.map((study, idx) => (
              <div 
                key={study.id}
                className="h3-reveal-on-scroll h3-brutalist-card bg-h3-cream hover:bg-h3-cream/50 p-6 md:p-8 flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-h3-black/10">
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

      {/* Services Menu Section */}
      <section id="services" className="w-full py-20 px-6 md:px-12 bg-h3-black border-b-4 border-h3-black z-10 text-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-h3-cream/10">
            <div className="h3-reveal-on-scroll flex flex-col text-left">
              <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary">Capabilities</span>
              <h2 className="font-h3-display text-5xl md:text-6xl text-white uppercase mt-1 leading-none">SERVICES.</h2>
            </div>

            {/* Live status badge */}
            <div className="h3-reveal-on-scroll">
              <div className="inline-flex items-center gap-2 bg-[#12281a] border border-[#1b3e27] text-[#4ade80] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
                OPEN FOR BUSINESS
              </div>
            </div>
          </div>

          {/* Grid Layout of 8 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-8 h3-reveal-on-scroll">
            {services.map((item) => (
              <a 
                key={item.num}
                href={item.link}
                className="flex flex-col group py-5 border-b border-h3-cream/10 hover:border-h3-yellow/50 transition-colors duration-200"
              >
                <div className="flex items-baseline justify-between w-full">
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className="font-h3-display text-4xl md:text-5xl text-h3-yellow select-none leading-none min-w-[50px] text-left">
                      {item.num}
                    </span>
                    <span className="font-h3-display text-xl md:text-2xl text-white uppercase tracking-wide leading-none group-hover:text-h3-yellow transition-colors duration-150">
                      {item.title}
                    </span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-h3-yellow group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
                </div>
                
                <div className="pl-[66px] md:pl-[74px] mt-2 text-left">
                  <span className="text-h3-cream/60 text-xs md:text-sm font-h3-secondary font-bold tracking-wide">
                    {item.desc}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Custom CTA Box */}
          <div className="h3-reveal-on-scroll border-4 border-h3-black bg-h3-cream text-h3-black p-6 md:p-8 flex flex-col justify-between sm:flex-row sm:items-center gap-6 mt-16 shadow-[6px_6px_0px_#e94e33]">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-h3-display text-2xl text-h3-red uppercase tracking-widest leading-none">NEED A CUSTOM MARKETING BUILD?</h3>
              <p className="font-h3-secondary text-sm text-h3-black/80 max-w-2xl leading-relaxed mt-2">
                Every business is different. We build custom packages — combining the right mix of SEO, fast websites, and ad spend — to hit your specific growth target. Tell us what you're trying to do, we'll send you a plan.
              </p>
            </div>
            <a href="#contact" className="h3-btn-brutalist bg-h3-black text-h3-cream font-bold px-8 py-3.5 uppercase tracking-wider text-xs w-fit flex-shrink-0 border-h3-black">
              GET A PROPOSAL
            </a>
          </div>

        </div>
      </section>

      {/* Selected Works Portfolio Section */}
      <section id="portfolio" className="w-full py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="h3-reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-h3-green font-bold text-xs uppercase tracking-widest">Selected Works</span>
              <h2 className="font-h3-display text-5xl md:text-6xl uppercase leading-none mt-1">PORTFOLIO</h2>
              <div className="h-1.5 w-16 bg-h3-green mt-2" />
            </div>
            <p className="font-h3-secondary text-sm md:text-base text-h3-black/60 max-w-md">
              A collection of digital platforms, search initiatives, and brand architectures shipped to our partners.
            </p>
          </div>

          {/* Grid Layout of 6 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item, idx) => (
              <div 
                key={idx}
                className="h3-reveal-on-scroll h3-flip-card-container aspect-square w-full"
                tabIndex={0}
              >
                <div className="h3-flip-card-inner">
                  
                  {/* Card Front */}
                  <div className={`h3-flip-card-front ${item.bgClass} p-6`}>
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[10px] font-bold uppercase tracking-widest border border-current rounded-full px-2.5 py-0.5">
                        {item.tag}
                      </span>
                      <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center -rotate-45">
                        <ArrowUpRight size={12} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-auto w-full text-left">
                      <h3 className="font-h3-display text-2xl uppercase tracking-wider leading-none">
                        {item.title}
                      </h3>
                      <p className="font-h3-secondary text-xs opacity-75 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="h3-flip-card-back bg-h3-black text-h3-cream p-6">


                    {/* Services bullet list */}
                    <ul className="flex flex-col gap-3 my-auto w-full text-left">
                      {item.services.map((svc, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-2 font-h3-secondary font-bold text-xs uppercase tracking-wide text-h3-cream/90">
                          <span className="w-1.5 h-1.5 bg-h3-red rotate-45 flex-shrink-0" />
                          <span>{svc}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-center w-full border-t border-h3-cream/15 pt-2 text-[10px] font-bold uppercase tracking-widest text-h3-cream/70">
                      <span>CREATIVE COWBOYS</span>
                      <span className="text-h3-red">★</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Wrangler AI Chat Widget Section - Hidden
      <section className="w-full py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="h3-reveal-on-scroll text-center flex flex-col items-center gap-4 mb-10">
            <span className="text-h3-red font-bold text-xs uppercase tracking-widest">Instant Chatbot Support</span>
            <h2 className="font-h3-display text-5xl md:text-6xl uppercase leading-none">CHAT WITH WRANGLER</h2>
            <div className="h-1.5 w-16 bg-h3-red mt-2" />
            <p className="font-h3-secondary text-sm md:text-base text-h3-black/60 max-w-lg mt-1">
              Ask our custom trained AI assistant anything about our marketing packages, web design, or search optimization programs.
            </p>
          </div>

          <div className="h3-reveal-on-scroll h3-brutalist-card bg-h3-black p-4 md:p-8 w-full">
            <div className="border-b-2 border-h3-cream/20 pb-4 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-h3-red animate-pulse" />
                <span className="font-h3-display text-h3-cream text-lg tracking-wider">WRANGLER AI // ONLINE</span>
              </div>
              <span className="text-h3-cream/55 text-xs font-bold uppercase tracking-widest hidden sm:inline">VILLA RICA, GA</span>
            </div>

            <WranglerChat variant="brutalist" />
          </div>

        </div>
      </section>
      */}

      {/* Testimonials Section - Alternating Color Carousel */}
      <section 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full py-20 px-6 md:px-12 border-b-4 border-h3-black z-10 relative flex flex-col items-center justify-between transition-colors duration-500 overflow-hidden ${testimonials[activeTestimonial].themeBg}`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col justify-between h-full min-h-[600px] relative z-10">
          
          {/* Top Header Row */}
          <div className="w-full flex items-center justify-between font-h3-secondary text-xs md:text-sm font-bold tracking-widest text-white/95 uppercase border-b border-white/20 pb-4 mb-12">
            <span>Client Testimonials</span>
            <div className="flex-grow h-[1px] bg-white/20 mx-6 hidden sm:block" />
            <span>{`0${activeTestimonial + 1} / 03`}</span>
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
              <h2 className={`font-h3-display text-5xl md:text-7xl leading-none mt-2 select-none uppercase tracking-tight ${testimonials[activeTestimonial].accentColor}`}>
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
                {/* McKinley offset background shadow card */}
                {activeTestimonial === 2 && (
                  <div className="absolute inset-0 bg-[#e94e33] rounded-[18px] translate-x-3 translate-y-3 z-0" />
                )}

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
                    {/* Spacer */}
                    <div className="w-12" />
                  </div>

                  {/* Browser Window Body Content */}
                  <div className="flex-grow relative overflow-hidden bg-[#1a1a1a]">
                    <Image
                      src={activeTestimonial === 0 
                        ? "/franklin-tn/harmonic-desktop-hero.png" 
                        : activeTestimonial === 1 
                          ? "/franklin-tn/jbjackson-desktop-hero.png" 
                          : "/franklin-tn/mckinley-desktop-hero.png"
                      }
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
              {/* Prev Button */}
              <button 
                onClick={prevSlide}
                className="border border-white/40 hover:bg-white/10 text-white rounded-xl w-14 h-12 flex items-center justify-center transition-colors cursor-pointer select-none"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft size={20} />
              </button>
              {/* Next Button */}
              <button 
                onClick={nextSlide}
                className={`rounded-xl w-14 h-12 flex items-center justify-center transition-colors cursor-pointer font-bold select-none text-h3-black ${testimonials[activeTestimonial].activeBtnBg}`}
                aria-label="Next Testimonial"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Central Tabbed Indicators */}
            <div className="flex items-center gap-8 md:gap-12">
              {testimonials.map((item, idx) => {
                const isActive = idx === activeTestimonial;
                return (
                  <button 
                    key={idx}
                    onClick={() => handleSlideChange(idx)}
                    className="flex flex-col items-center cursor-pointer select-none text-white focus:outline-none"
                  >
                    {/* Number indicator */}
                    <span className={`text-[10px] md:text-xs font-bold tracking-wider transition-colors duration-200 ${isActive ? "text-white" : "text-white/40"}`}>
                      {`0${idx + 1}`}
                    </span>
                    
                    {/* Underline segment bar */}
                    <div className="w-12 h-1.5 my-1.5 relative rounded bg-white/10 overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 right-0 transition-transform duration-300 origin-left ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      } ${testimonials[activeTestimonial].barColor}`} />
                    </div>

                    {/* Short client label */}
                    <span className={`text-[10px] md:text-xs font-bold font-h3-secondary tracking-widest uppercase transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/40"
                    }`}>
                      {item.shortName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Script brand text */}
            <div className={`hidden sm:block text-right transition-colors duration-300 font-sign-painter text-2xl md:text-3xl tracking-wide select-none ${
              testimonials[activeTestimonial].scriptColor
            }`}>
              &mdash; hear 'em out
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="w-full py-20 px-6 md:px-12 bg-h3-cream border-b-4 border-h3-black z-10 text-h3-black">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="h3-reveal-on-scroll text-left flex flex-col gap-2 mb-12">
            <span className="text-h3-red font-bold text-xs uppercase tracking-widest font-h3-secondary">FAQ</span>
            <h2 className="font-h3-display text-5xl md:text-6xl text-h3-black uppercase mt-1 leading-none">COMMON QUESTIONS.</h2>
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
                      className={`w-full flex justify-between items-center p-5 text-left font-bold font-h3-secondary text-sm md:text-base tracking-wide uppercase transition-all duration-200 select-none border-2 border-h3-black ${
                        isActive 
                          ? "bg-h3-black text-h3-yellow shadow-[4px_4px_0px_#e94e33] translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-white text-h3-black hover:bg-h3-cream/40"
                      }`}
                    >
                      <span>{faq.question}</span>
                      <span className={`text-lg md:text-xl font-bold flex-shrink-0 ml-4 ${isActive ? "text-h3-yellow" : "text-h3-red"}`}>
                        {isActive ? "—" : "+"}
                      </span>
                    </button>
                    
                    {/* Mobile Inline Details Card */}
                    {isActive && (
                      <div className="lg:hidden w-full mt-3">
                        <div className="bg-h3-red border-4 border-h3-black p-6 text-white shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between">
                          <div>
                            <span className="text-h3-yellow font-bold text-[10px] md:text-xs uppercase tracking-widest font-h3-secondary">
                              Q.{faq.index} · {faq.category}
                            </span>
                            <h3 className="font-h3-display text-2xl text-white uppercase mt-2 leading-tight">
                              {faq.question}
                            </h3>
                            <div className="font-h3-secondary text-sm md:text-base text-h3-cream/90 leading-relaxed mt-4 text-left">
                              {faq.answer}
                            </div>
                          </div>
                          
                          {faq.related && faq.related.length > 0 && (
                            <div className="w-full mt-6 pt-4 border-t border-h3-cream/20">
                              <span className="text-h3-yellow font-bold text-[10px] md:text-xs uppercase tracking-widest font-h3-secondary block mb-2">
                                RELATED
                              </span>
                              <div className="flex flex-col gap-2">
                                {faq.related.map((rel, rIdx) => (
                                  <button
                                    key={rIdx}
                                    onClick={() => setActiveFaq(rel.index)}
                                    className="flex items-center gap-2 text-white font-h3-secondary font-bold text-xs md:text-sm uppercase tracking-wide text-left hover:text-h3-yellow transition-colors"
                                  >
                                    <span>→</span>
                                    <span className="underline decoration-h3-cream/30">{rel.text}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
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
                  <div className="bg-h3-red border-4 border-h3-black p-8 text-white shadow-[6px_6px_0px_#1a1a1a] min-h-[360px] flex flex-col justify-between">
                    <div>
                      <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary">
                        Q.{currentFaq.index} · {currentFaq.category}
                      </span>
                      <h3 className="font-h3-display text-4xl text-white uppercase mt-2 leading-tight">
                        {currentFaq.question}
                      </h3>
                      <div className="font-h3-secondary text-base md:text-lg text-h3-cream/90 leading-relaxed mt-6 text-left">
                        {currentFaq.answer}
                      </div>
                    </div>

                    {currentFaq.related && currentFaq.related.length > 0 && (
                      <div className="w-full mt-8 pt-6 border-t border-h3-cream/20">
                        <span className="text-h3-yellow font-bold text-xs uppercase tracking-widest font-h3-secondary block mb-3">
                          RELATED
                        </span>
                        <div className="flex flex-col gap-2.5">
                          {currentFaq.related.map((rel, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() => setActiveFaq(rel.index)}
                              className="flex items-center gap-2 text-white font-h3-secondary font-bold text-sm md:text-base uppercase tracking-wide text-left hover:text-h3-yellow transition-colors cursor-pointer"
                            >
                              <span>→</span>
                              <span className="underline decoration-h3-cream/30 hover:decoration-h3-yellow">{rel.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer id="contact" className="w-full bg-h3-black text-h3-cream border-t-4 border-h3-black py-16 px-6 md:px-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Footer Contact Details */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <h3 className="font-h3-display text-4xl uppercase tracking-widest text-h3-yellow">HOWDY PARTNER</h3>
            <p className="font-h3-secondary text-sm text-h3-cream/70 leading-relaxed max-w-sm">
              We're Josh and Dave — based in Villa Rica, GA. No vanity metrics. Just websites, ads, and SEO built to make your phone ring.
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
                <span>Villa Rica, Georgia</span>
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

          {/* Quick links & Brand tag */}
          <div className="md:col-span-3 flex flex-col gap-6 text-right md:text-left">
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
