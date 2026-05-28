"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk, Inter, Bebas_Neue } from "next/font/google";
import WranglerChat from "@/components/WranglerChat";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

const faqs = [
  {
    question: "How does pricing work?",
    answer:
      "Every project is different, so we don't do one-size-fits-all pricing. We'll talk through what you need and put together a custom proposal that fits your goals and budget.",
  },
  {
    question: "How long does a website take?",
    answer:
      "Most websites are ready in 2-4 weeks. Larger projects with custom features can take a bit longer, but we keep you in the loop every step of the way.",
  },
  {
    question: "Do you work with small businesses?",
    answer:
      "Absolutely — small and local businesses are our butter. Whether you're just starting out or ready to scale, we build strategies that fit where you are right now.",
  },
  {
    question: "Where are you located, and do you work with businesses outside of Villa Rica?",
    answer:
      "We're based in Villa Rica, GA, but we work with clients all over the country. Most of what we do is remote-friendly, so location is never a barrier.",
  },
  {
    question: "What results can I expect?",
    answer:
      "That depends on the service, but we always tie our work to real metrics — more traffic, more leads, more revenue. We'll set clear goals upfront so you know exactly what we're working toward.",
  },
  {
    question: "How do I get started?",
    answer:
      "Just type in the box above! Wrangler will ask you a few quick questions and get you connected with our team.",
  },
];

export default function Home2Page() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  useEffect(() => {
    // Scroll Reveal Animation Logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-on-scroll-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    const animatedElements = document.querySelectorAll("[data-animation-on-scroll]");
    animatedElements.forEach((el) => {
      el.classList.add("animate-on-scroll-hidden");
      observer.observe(el);
    });

    // Content editable outline styling
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    const focusHandlers = new Map();
    const blurHandlers = new Map();

    editableElements.forEach((element) => {
      const el = element as HTMLElement;
      const onFocus = () => {
        el.style.outline = "3px solid #FF6B35";
        el.style.outlineOffset = "4px";
      };
      const onBlur = () => {
        el.style.outline = "none";
      };

      el.addEventListener("focus", onFocus);
      el.addEventListener("blur", onBlur);

      focusHandlers.set(el, onFocus);
      blurHandlers.set(el, onBlur);
    });

    // Smooth scroll with offset for fixed header
    const anchors = document.querySelectorAll('a[href^="#"]');
    const scrollHandlers = new Map();

    anchors.forEach((anchor) => {
      const a = anchor as HTMLAnchorElement;
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        const targetId = a.getAttribute("href");
        if (targetId) {
          const target = document.querySelector(targetId);
          if (target) {
            const offsetTop = (target as HTMLElement).offsetTop - 100;
            window.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
          }
        }
      };
      a.addEventListener("click", onClick);
      scrollHandlers.set(a, onClick);
    });

    return () => {
      observer.disconnect();
      editableElements.forEach((element) => {
        const el = element as HTMLElement;
        if (focusHandlers.has(el)) el.removeEventListener("focus", focusHandlers.get(el));
        if (blurHandlers.has(el)) el.removeEventListener("blur", blurHandlers.get(el));
      });
      anchors.forEach((anchor) => {
        const a = anchor as HTMLAnchorElement;
        if (scrollHandlers.has(a)) a.removeEventListener("click", scrollHandlers.get(a));
      });
    };
  }, []);

  return (
    <div
      className={`${spaceGrotesk.variable} ${inter.variable} ${bebasNeue.variable} home2-page-wrapper font-h2-secondary bg-h2-neutral-background text-h2-text-secondary overflow-x-hidden min-h-screen relative`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Custom styled elements inside Home 2 wrapper */
            .home2-page-wrapper {
              position: relative;
            }
            
            /* Brutalist dotted background */
            .home2-page-wrapper::before {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: radial-gradient(circle, #FF6B35 1px, transparent 1px);
              background-size: 24px 24px;
              z-index: 0;
              opacity: 0.03;
              pointer-events: none;
            }

            .home2-page-wrapper .animate-on-scroll-hidden {
              opacity: 0;
              transform: translateY(30px);
              transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .home2-page-wrapper .animate-on-scroll-visible {
              opacity: 1;
              transform: translateY(0);
            }

            /* Brutalist borders */
            .home2-page-wrapper .brutalist-border {
              border: 3px solid #1A1423;
              position: relative;
            }

            .home2-page-wrapper .brutalist-border::after {
              content: '';
              position: absolute;
              top: 8px;
              left: 8px;
              width: 100%;
              height: 100%;
              border: 3px solid #FF6B35;
              z-index: -1;
              transition: all 0.3s ease;
            }

            .home2-page-wrapper .brutalist-border:hover::after {
              top: 12px;
              left: 12px;
            }

            /* Skewed sections */
            .home2-page-wrapper .skew-section {
              transform: skewY(-2deg);
              margin: 16px 0;
            }

            .home2-page-wrapper .skew-section > * {
              transform: skewY(2deg);
            }

            @media (max-width: 767px) {
              .sticky-header {
                top: 0 !important;
              }
            }
            @media (min-width: 768px) {
              .sticky-header {
                top: 36px !important;
              }
            }
            
            @media print {
              .home2-page-wrapper::before {
                display: none;
              }
              
              .home2-page-wrapper header,
              .home2-page-wrapper footer,
              .home2-page-wrapper .no-print {
                display: none !important;
              }
              
              .home2-page-wrapper .brutalist-border::after {
                display: none;
              }
            }

            /* Diagonal accent */
            .home2-page-wrapper .diagonal-accent {
              position: relative;
              overflow: hidden;
            }

            .home2-page-wrapper .diagonal-accent::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -10%;
              width: 40%;
              height: 200%;
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
              opacity: 0.08;
              transform: rotate(15deg);
              z-index: 0;
            }

            /* Number counter animation */
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }

            .home2-page-wrapper .slide-up {
              animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `,
        }}
      />

      <header className="border-b-4 border-h2-brand-accent bg-h2-neutral-background sticky z-50 no-print sticky-header">
        <nav data-editable="header" className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="site-logo">
            <Image
              src="/Main%20logo%202.png"
              alt="Creative Cowboys Media — Home"
              width={180}
              height={48}
              priority
              className="w-[180px] h-auto block"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8" data-editable-list="header.navLinks">
            <a
              className="font-h2-primary font-bold text-h2-text-primary hover:text-h2-brand-primary transition-colors uppercase tracking-wide text-sm"
              href="#services"
            >
              Services
            </a>
            <a
              className="font-h2-primary font-bold text-h2-text-primary hover:text-h2-brand-primary transition-colors uppercase tracking-wide text-sm"
              href="#case-studies"
            >
              Case Studies
            </a>
            <a
              className="font-h2-primary font-bold text-h2-text-primary hover:text-h2-brand-primary transition-colors uppercase tracking-wide text-sm"
              href="#testimonials"
            >
              Testimonials
            </a>
            <a
              className="font-h2-primary font-bold text-h2-text-primary hover:text-h2-brand-primary transition-colors uppercase tracking-wide text-sm"
              href="#faq"
            >
              FAQ
            </a>
          </div>
          <a
            href="tel:4702437517"
            className="bg-h2-brand-accent text-h2-text-on-primary font-h2-primary font-bold px-6 py-3 border-3 border-h2-brand-accent hover:bg-h2-brand-primary hover:border-h2-brand-primary transition-all uppercase tracking-wide text-sm shadow-h2-subtle inline-block"
          >
            Call Us
          </a>
        </nav>
      </header>

      <main>
        {/* Hero Section - Brutalist Design */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-14 pb-6 relative overflow-hidden diagonal-accent">
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7" data-animation-on-scroll="fadeInUp">
                <div className="mb-6">
                  <span className="inline-block bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-4 py-2 uppercase tracking-wider text-xs mb-4">
                    West Georgia's No-Fluff Agency
                  </span>
                </div>

                <h1
                  className="font-h2-display text-6xl md:text-8xl lg:text-9xl font-bold text-h2-text-primary mb-6 leading-none"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  LET'S BUILD
                  <br />
                  SOMETHING THAT
                  <br />
                  CONVERTS.
                </h1>

                <div className="flex items-center gap-4 mb-8">
                  <div className="h-1 w-16 bg-h2-brand-primary"></div>
                  <p
                    className="font-h2-primary text-2xl md:text-3xl font-bold text-h2-brand-tertiary uppercase tracking-wide"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                  >
                    Web Design &amp; Digital Marketing
                  </p>
                </div>

                <p
                  className="text-lg md:text-xl text-h2-text-secondary max-w-2xl leading-relaxed mb-10"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  We combine premium layouts, conversion architecture, and local search expertise to build sites that load under 1.5 seconds and drive real customer calls. No templates, no fluff.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-10 max-w-xl">
                  <div className="border-l-4 border-h2-brand-primary pl-4">
                    <div className="font-h2-display text-4xl font-bold text-h2-brand-primary">90 Days</div>
                    <div className="font-h2-primary text-xs uppercase tracking-wider text-h2-text-secondary">
                      Payback Target
                    </div>
                  </div>
                  <div className="border-l-4 border-h2-brand-secondary pl-4">
                    <div className="font-h2-display text-4xl font-bold text-h2-brand-secondary">27+</div>
                    <div className="font-h2-primary text-xs uppercase tracking-wider text-h2-text-secondary">
                      Sites Shipped
                    </div>
                  </div>
                  <div className="border-l-4 border-h2-brand-tertiary pl-4">
                    <div className="font-h2-display text-4xl font-bold text-h2-brand-tertiary">300% ↑</div>
                    <div className="font-h2-primary text-xs uppercase tracking-wider text-h2-text-secondary">
                      Traffic Growth
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#case-studies"
                    className="brutalist-border bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-8 py-4 uppercase tracking-wide text-sm inline-block hover:bg-h2-brand-secondary transition-colors"
                  >
                    See Our Work
                  </a>
                  <a
                    href="mailto:howdy@creativecowboys.co"
                    className="brutalist-border bg-h2-neutral-surface text-h2-text-primary font-h2-primary font-bold px-8 py-4 uppercase tracking-wide text-sm inline-block hover:bg-h2-neutral-surface1 transition-colors"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>

              {/* Right Content - Chat Card */}
              <div className="lg:col-span-5" data-animation-on-scroll="fadeInUp">
                <div className="bg-h2-brand-accent border-4 border-h2-brand-primary p-6 shadow-h2-bold relative">
                  <h3 className="font-h2-display text-3xl font-bold text-h2-brand-primary mb-2">CHAT WITH WRANGLER</h3>
                  <p className="text-xs text-h2-neutral-background/70 mb-4 font-h2-secondary">
                    Have questions about pricing, timelines, or local SEO? Ask our virtual manager:
                  </p>
                  <div className="w-full">
                    <WranglerChat variant="brutalist" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-6 bg-h2-neutral-background">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10" data-animation-on-scroll="fadeInUp">
              <div className="flex items-center gap-6 mb-2">
                <div className="h-2 w-20 bg-h2-brand-secondary"></div>
                <span className="font-h2-primary font-bold uppercase tracking-wider text-sm text-h2-brand-secondary">
                  What We Offer
                </span>
              </div>
              <h2 className="font-h2-display text-5xl md:text-7xl font-bold text-h2-text-primary mb-4">
                SERVICES
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Web Design */}
              <div className="border-4 border-h2-brand-accent bg-h2-brand-primary p-8" data-animation-on-scroll="fadeInUp">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 border-4 border-h2-brand-accent bg-h2-neutral-surface flex items-center justify-center text-3xl">
                    💻
                  </div>
                  <h3 className="font-h2-display text-3xl font-bold text-h2-text-on-primary">
                    WEB DESIGN
                  </h3>
                </div>
                <p className="text-h2-text-on-primary mb-6 text-sm md:text-base leading-relaxed">
                  Custom websites built from scratch to look incredible, load instantly, and turn visitors into paying clients.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Next.js / React
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Custom UI/UX
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Speed Tuning
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Funnels
                  </span>
                </div>
              </div>

              {/* SEO */}
              <div className="border-4 border-h2-brand-accent bg-h2-brand-tertiary p-8" data-animation-on-scroll="fadeInUp">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 border-4 border-h2-brand-accent bg-h2-neutral-surface flex items-center justify-center text-3xl">
                    🔍
                  </div>
                  <h3 className="font-h2-display text-3xl font-bold text-h2-text-on-primary">
                    SEO SEARCH
                  </h3>
                </div>
                <p className="text-h2-text-on-primary mb-6 text-sm md:text-base leading-relaxed">
                  Data-driven search engine optimization that gets you found by local clients actively looking for your services.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Local SEO
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Google Profile
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Audit reports
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Link Building
                  </span>
                </div>
              </div>

              {/* PPC Ads */}
              <div className="border-4 border-h2-brand-accent bg-h2-brand-secondary p-8" data-animation-on-scroll="fadeInUp">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 border-4 border-h2-brand-accent bg-h2-neutral-surface flex items-center justify-center text-3xl">
                    🎯
                  </div>
                  <h3 className="font-h2-display text-3xl font-bold text-h2-text-on-primary">
                    ADVERTISING
                  </h3>
                </div>
                <p className="text-h2-text-on-primary mb-6 text-sm md:text-base leading-relaxed">
                  Google Ads, Meta Ads (Facebook/Instagram), and retargeting systems designed for positive ROI.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Google PPC
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Meta Ads
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Conversion tracking
                  </span>
                  <span className="border-2 border-h2-brand-accent bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Lead Captures
                  </span>
                </div>
              </div>

              {/* Branding */}
              <div className="border-4 border-h2-brand-accent bg-h2-brand-accent p-8" data-animation-on-scroll="fadeInUp">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 border-4 border-h2-brand-primary bg-h2-neutral-surface flex items-center justify-center text-3xl">
                    🎨
                  </div>
                  <h3 className="font-h2-display text-3xl font-bold text-h2-text-on-primary">
                    BRANDING
                  </h3>
                </div>
                <p className="text-h2-neutral-background/80 mb-6 text-sm md:text-base leading-relaxed">
                  Logo design, brand strategy guidelines, and social assets that make your local business look like an industry leader.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-primary bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Identity
                  </span>
                  <span className="border-2 border-h2-brand-primary bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Logo design
                  </span>
                  <span className="border-2 border-h2-brand-primary bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Media creation
                  </span>
                  <span className="border-2 border-h2-brand-primary bg-h2-neutral-surface text-h2-text-primary px-3 py-1 font-h2-primary font-bold uppercase text-[10px] tracking-wider">
                    Stylebooks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="py-16 px-6 skew-section bg-h2-neutral-surface1">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10" data-animation-on-scroll="fadeInUp">
              <div className="flex items-center gap-6 mb-2">
                <div className="h-2 w-20 bg-h2-brand-primary"></div>
                <span className="font-h2-primary font-bold uppercase tracking-wider text-sm text-h2-brand-primary">
                  Results
                </span>
              </div>
              <h2 className="font-h2-display text-5xl md:text-7xl font-bold text-h2-text-primary mb-4">
                CASE STUDIES
              </h2>
            </div>

            <div className="space-y-8">
              {/* Harmonic Production */}
              <div
                className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8 hover:shadow-h2-hover transition-all duration-300"
                data-animation-on-scroll="fadeInUp"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="inline-block bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-3 py-1 uppercase tracking-wider text-xs mb-3">
                      Web Design &amp; SEO
                    </div>
                    <h3
                      className="font-h2-display text-3xl md:text-4xl font-bold text-h2-text-primary mb-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      HARMONIC PRODUCTION
                    </h3>
                    <p
                      className="text-h2-brand-tertiary font-h2-primary font-bold text-lg mb-1"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      AV &amp; Event Concert Outfits
                    </p>
                    <p
                      className="text-h2-text-secondary text-sm"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Cleveland, TN
                    </p>
                  </div>
                  <div className="bg-h2-neutral-surface text-h2-brand-primary font-h2-primary font-bold px-6 py-3 uppercase tracking-wider text-sm whitespace-nowrap h-fit border-4 border-h2-brand-primary">
                    <span contentEditable={true} suppressContentEditableWarning={true}>
                      300% Engagement
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-h2-brand-primary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Delivered full brand rehaul and localized SEO keywords.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-secondary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Boosted customer retention metrics by 200% year-over-year.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-tertiary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Cut servers launch downtime to 0 minutes during final domain transition.
                    </span>
                  </div>
                </div>
              </div>

              {/* John B. Jackson */}
              <div
                className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8 hover:shadow-h2-hover transition-all duration-300"
                data-animation-on-scroll="fadeInUp"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="inline-block bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-3 py-1 uppercase tracking-wider text-xs mb-3">
                      SEO &amp; PPC Ads
                    </div>
                    <h3
                      className="font-h2-display text-3xl md:text-4xl font-bold text-h2-text-primary mb-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      JOHN B. JACKSON &amp; ASSOC
                    </h3>
                    <p
                      className="text-h2-brand-tertiary font-h2-primary font-bold text-lg mb-1"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Personal Injury Lawyers
                    </p>
                    <p
                      className="text-h2-text-secondary text-sm"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      West Georgia
                    </p>
                  </div>
                  <div className="bg-h2-neutral-surface text-h2-brand-secondary font-h2-primary font-bold px-6 py-3 uppercase tracking-wider text-sm whitespace-nowrap h-fit border-4 border-h2-brand-secondary">
                    <span contentEditable={true} suppressContentEditableWarning={true}>
                      +$500k Revenue
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-h2-brand-primary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Achieved 22 #1 organic placements on Google in 12 months.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-secondary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Designed multi-platform lead funnels tracking phone queries.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-tertiary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Launched integrated branding campaigns across CTV and paid social.
                    </span>
                  </div>
                </div>
              </div>

              {/* McKinley Roofing */}
              <div
                className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8 hover:shadow-h2-hover transition-all duration-300"
                data-animation-on-scroll="fadeInUp"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="inline-block bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-3 py-1 uppercase tracking-wider text-xs mb-3">
                      Web &amp; Local SEO
                    </div>
                    <h3
                      className="font-h2-display text-3xl md:text-4xl font-bold text-h2-text-primary mb-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      MCKINLEY ROOFING
                    </h3>
                    <p
                      className="text-h2-brand-tertiary font-h2-primary font-bold text-lg mb-1"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Roofing &amp; Restoration
                    </p>
                    <p
                      className="text-h2-text-secondary text-sm"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Douglasville, GA
                    </p>
                  </div>
                  <div className="bg-h2-neutral-surface text-h2-brand-tertiary font-h2-primary font-bold px-6 py-3 uppercase tracking-wider text-sm whitespace-nowrap h-fit border-4 border-h2-brand-tertiary">
                    <span contentEditable={true} suppressContentEditableWarning={true}>
                      +1000% Traffic
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-h2-brand-primary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Built dynamic neighborhood service-area landing pages.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-secondary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Established C-level Google Profile SEO and schema metrics.
                    </span>
                  </div>
                  <div className="border-l-4 border-h2-brand-tertiary pl-4 py-2">
                    <span
                      className="text-h2-text-secondary"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      Shipped custom storm intake insurance lead flows.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 px-6 bg-h2-neutral-background">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10" data-animation-on-scroll="fadeInUp">
              <div className="flex items-center gap-6 mb-2">
                <div className="h-2 w-20 bg-h2-brand-tertiary"></div>
                <span className="font-h2-primary font-bold uppercase tracking-wider text-sm text-h2-brand-tertiary">
                  Reviews
                </span>
              </div>
              <h2 className="font-h2-display text-5xl md:text-7xl font-bold text-text-primary mb-4">
                TESTIMONIALS
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Review 1 */}
              <div className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8" data-animation-on-scroll="fadeInUp">
                <div className="text-xl text-h2-brand-secondary mb-4">⭐⭐⭐⭐⭐</div>
                <h4
                  className="font-h2-primary font-bold text-base text-h2-text-primary mb-1"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  Rob Goldin
                </h4>
                <p className="text-xs text-h2-brand-primary uppercase font-h2-primary font-bold mb-4">
                  Bremen Commercial Insurance
                </p>
                <blockquote
                  className="text-sm text-h2-text-secondary leading-relaxed mb-6 italic"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  "Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend."
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    Client 2+ Years
                  </span>
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    Great ROI
                  </span>
                </div>
              </div>

              {/* Review 2 */}
              <div className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8" data-animation-on-scroll="fadeInUp">
                <div className="text-xl text-h2-brand-secondary mb-4">⭐⭐⭐⭐⭐</div>
                <h4
                  className="font-h2-primary font-bold text-base text-h2-text-primary mb-1"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  Lance Day
                </h4>
                <p className="text-xs text-h2-brand-primary uppercase font-h2-primary font-bold mb-4">
                  Day Accounting (CPA)
                </p>
                <blockquote
                  className="text-sm text-h2-text-secondary leading-relaxed mb-6 italic"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  "If you need some help with your web work, these guys can get it all together for you. No worries, just solutions."
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    Web Design Client
                  </span>
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    No Hassle
                  </span>
                </div>
              </div>

              {/* Review 3 */}
              <div className="border-4 border-h2-brand-accent bg-h2-neutral-surface p-8" data-animation-on-scroll="fadeInUp">
                <div className="text-xl text-h2-brand-secondary mb-4">⭐⭐⭐⭐⭐</div>
                <h4
                  className="font-h2-primary font-bold text-base text-h2-text-primary mb-1"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  Samantha Lee
                </h4>
                <p className="text-xs text-h2-brand-primary uppercase font-h2-primary font-bold mb-4">
                  Horizon Real Estate Group
                </p>
                <blockquote
                  className="text-sm text-h2-text-secondary leading-relaxed mb-6 italic"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  "Our old website was embarrassing us. Creative Cowboys turned it around fast — clean, modern, and built to convert. Form submissions went up immediately."
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    Modern Redesign
                  </span>
                  <span className="border-2 border-h2-brand-primary text-h2-brand-primary px-3 py-1 font-h2-primary font-bold uppercase text-[9px] tracking-wider">
                    Fast Launch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 px-6 skew-section bg-h2-neutral-surface1">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center" data-animation-on-scroll="fadeInUp">
              <div className="flex items-center justify-center gap-6 mb-2">
                <div className="h-2 w-16 bg-h2-brand-primary"></div>
                <span className="font-h2-primary font-bold uppercase tracking-wider text-sm text-h2-brand-primary">
                  Got Questions?
                </span>
                <div className="h-2 w-16 bg-h2-brand-primary"></div>
              </div>
              <h2 className="font-h2-display text-5xl md:text-7xl font-bold text-h2-text-primary mb-4">
                COMMON QUESTIONS
              </h2>
            </div>

            {/* Accordion FAQ */}
            <div className="space-y-4 max-w-3xl mx-auto" data-animation-on-scroll="fadeInUp">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="border-4 border-h2-brand-accent bg-h2-neutral-surface hover:shadow-h2-subtle transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-h2-primary font-bold text-lg md:text-xl text-h2-text-primary">
                        {faq.question}
                      </span>
                      <span
                        className="text-2xl font-bold text-h2-brand-primary transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: isOpen ? "200px" : "0" }}
                    >
                      <div className="p-6 pt-0 border-t-2 border-h2-neutral-border text-h2-text-secondary leading-relaxed font-h2-secondary text-sm md:text-base">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-h2-neutral-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-h2-brand-primary/10 to-h2-brand-tertiary/10"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center" data-animation-on-scroll="fadeInUp">
              <div className="inline-block bg-h2-brand-primary text-h2-text-on-primary font-h2-primary font-bold px-4 py-2 uppercase tracking-wider text-xs mb-6">
                Let's Talk Business
              </div>

              <h2 className="font-h2-display text-5xl md:text-7xl font-bold text-h2-text-primary mb-6 leading-tight">
                READY TO GROW
                <br />
                YOUR BUSINESS
                <br />
                ONLINE?
              </h2>

              <p className="text-lg md:text-xl text-h2-text-secondary mb-8 max-w-2xl mx-auto font-h2-secondary">
                No long-term contracts. No useless vanity metrics. Just high-converting websites and search setups built to return your investment.
              </p>

              <div className="flex flex-wrap gap-6 justify-center">
                <a
                  href="mailto:howdy@creativecowboys.co"
                  className="brutalist-border bg-h2-brand-accent text-h2-text-on-primary font-h2-primary font-bold px-10 py-5 uppercase tracking-wide inline-block hover:bg-h2-brand-primary transition-colors text-sm"
                >
                  Send Email
                </a>
                <a
                  href="tel:4702437517"
                  className="brutalist-border bg-h2-neutral-surface text-h2-text-primary font-h2-primary font-bold px-10 py-5 uppercase tracking-wide inline-block hover:bg-h2-brand-primary hover:text-h2-text-on-primary transition-colors text-sm"
                >
                  Call Us Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-h2-brand-accent text-h2-neutral-background pt-12 pb-8 mt-12 no-print border-t-8 border-h2-brand-primary relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-h2-display text-5xl font-bold mb-4 text-h2-brand-primary">CREATIVE COWBOYS</h3>
              <p className="text-h2-neutral-border text-sm leading-relaxed font-h2-secondary">
                West Georgia's no-fluff digital marketing agency. We build lightning-fast conversion websites, SEO pipelines, and lead campaigns that pay for themselves.
              </p>
            </div>
            <div>
              <h4 className="font-h2-primary font-bold mb-6 uppercase tracking-wider text-h2-brand-secondary text-sm">
                Connect
              </h4>
              <ul className="space-y-3 text-sm font-h2-primary">
                <li>
                  <a
                    href="https://www.facebook.com/creativecowboys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-h2-brand-primary transition-colors flex items-center gap-2"
                  >
                    → Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/creativecowboys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-h2-brand-primary transition-colors flex items-center gap-2"
                  >
                    → Instagram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-h2-primary font-bold mb-6 uppercase tracking-wider text-h2-brand-secondary text-sm">
                Contact
              </h4>
              <ul className="space-y-3 text-sm font-h2-secondary">
                <li>
                  <a href="mailto:howdy@creativecowboys.co" className="hover:text-h2-brand-primary transition-colors">
                    howdy@creativecowboys.co
                  </a>
                </li>
                <li>
                  <a href="tel:4702437517" className="hover:text-h2-brand-primary transition-colors">
                    (470) 243-7517
                  </a>
                </li>
                <li className="text-h2-neutral-border">Villa Rica, GA</li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-h2-neutral-border-interactive pt-5">
            <p className="text-sm text-center font-h2-primary">
              © {new Date().getFullYear()} Creative Cowboys. Crafted with precision in West Georgia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
