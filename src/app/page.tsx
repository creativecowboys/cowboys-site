import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import WranglerChat from "@/components/WranglerChat";
import { Features } from "@/components/ui/features-4";
import { Footer7 } from "@/components/ui/footer-7";
import { TestimonialStack, Testimonial } from "@/components/ui/glass-testimonial-swiper";
import { Users, Calendar, TrendingUp, Zap, Star, BarChart3, Globe, Megaphone } from "lucide-react";

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    initials: 'JR',
    name: 'Jake Rivera',
    role: 'Owner, Lone Star HVAC',
    quote: "Creative Cowboys completely transformed our online presence. Within 60 days of launching our new site, we were getting 3x more leads from Google. The team was hands-on the whole way through — felt like having an in-house marketing team.",
    tags: [{ text: 'FEATURED', type: 'featured' }, { text: 'Web Design', type: 'default' }],
    stats: [{ icon: TrendingUp, text: '3x more leads' }, { icon: Calendar, text: '60 day launch' }],
    avatarGradient: 'linear-gradient(135deg, #F15F2A, #d97706)',
  },
  {
    id: 2,
    initials: 'AM',
    name: 'Ashley Monroe',
    role: 'Founder, Bloom Boutique',
    quote: "The branding they built for us was exactly what I had in my head but couldn't articulate. Our store traffic doubled after the rebrand and we finally feel like a real brand, not just a small shop.",
    tags: [{ text: 'Branding', type: 'default' }, { text: 'E-Commerce', type: 'default' }],
    stats: [{ icon: Star, text: '5-star rated' }, { icon: Users, text: '2x store traffic' }],
    avatarGradient: 'linear-gradient(135deg, #EA51FF, #8b5cf6)',
  },
  {
    id: 3,
    initials: 'CT',
    name: 'Carlos Torres',
    role: 'Co-Founder, Apex Roofing Co.',
    quote: "We went from zero digital presence to ranking on the first page of Google in our area. The marketing strategy they put together was clear, affordable, and actually worked. Couldn't recommend them more.",
    tags: [{ text: 'SEO', type: 'default' }, { text: 'Digital Marketing', type: 'featured' }],
    stats: [{ icon: Globe, text: 'Page 1 Google' }, { icon: BarChart3, text: 'Organic growth' }],
    avatarGradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    id: 4,
    initials: 'SL',
    name: 'Samantha Lee',
    role: 'Director, Horizon Real Estate Group',
    quote: "Our old website was embarrassing us at networking events. Creative Cowboys turned it around fast — clean, modern, and built to convert. Our inquiry form submissions went up immediately after launch.",
    tags: [{ text: 'Web Design', type: 'default' }, { text: 'Quick Launch', type: 'default' }],
    stats: [{ icon: Zap, text: 'Fast turnaround' }, { icon: Megaphone, text: 'More inquiries' }],
    avatarGradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  },
];

export default function Home() {
  return (
    <>
      {/* ===== Hero Section — full viewport height with gradient ===== */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="mesh-gradient absolute inset-0 w-full h-full" />

        {/* Logo (top-left, fixed) — offset below the 36px info bar */}
        <div className="absolute left-6 z-50" style={{ top: "52px" }}>
          <Image
            src="/Main%20logo%202.png"
            alt="Creative Cowboys Media"
            width={180}
            height={48}
            priority
            className="w-[180px] h-auto"
          />
        </div>

        {/* ── Hero Headline — Pro Max: Agency Bold pattern ── */}
        <style>{`
          @keyframes heroFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
          .hero-eyebrow  { animation: heroFadeUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
          .hero-headline { animation: heroFadeUp 0.60s cubic-bezier(0.4,0,0.2,1) 0.18s both; }
          .hero-sub      { animation: heroFadeUp 0.60s cubic-bezier(0.4,0,0.2,1) 0.32s both; }
          .hero-chat     { animation: heroFadeUp 0.60s cubic-bezier(0.4,0,0.2,1) 0.46s both; }
          .hero-services { animation: heroFadeUp 0.60s cubic-bezier(0.4,0,0.2,1) 0.60s both; }
          @media (prefers-reduced-motion: reduce) {
            .hero-eyebrow, .hero-headline, .hero-sub, .hero-chat, .hero-services { animation: none; }
          }
        `}</style>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "0 24px",
            marginBottom: "28px",
            maxWidth: "860px",
          }}
        >


          {/* H1 — bold two-tone headline */}
          <h1
            className="hero-headline"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#1a1514",
              margin: "0 0 18px",
            }}
          >
            Let&rsquo;s Build Something{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              That Actually Converts.
            </span>
          </h1>

          {/* Option B — Supporting subline */}
          <p
            className="hero-sub"
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              fontWeight: 400,
              color: "rgba(26,21,20,0.60)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Web design, marketing &amp; branding that drives real results.
          </p>
        </div>

        {/* ── Wrangler AI Chat ── */}
        <div className="hero-chat" style={{ width: "100%", maxWidth: "600px", padding: "0 24px", marginBottom: "20px" }}>
          <WranglerChat />
        </div>

        {/* ── Services ── */}
        <div
          className="hero-services"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 4px",
            justifyContent: "center",
            marginTop: "20px",
            padding: "0 24px",
            alignItems: "center",
          }}
        >
          {["Web Design", "Digital Marketing", "Branding", "Business Strategy"].map((service, i, arr) => (
            <>
              <span
                key={service}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "rgba(26,21,20,0.65)",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {service}
              </span>
              {i < arr.length - 1 && (
                <span key={`dot-${i}`} style={{ color: "rgba(26,21,20,0.3)", fontSize: "13px" }}>·</span>
              )}
            </>
          ))}
        </div>



        {/* Floating Navigation */}
        <FloatingNav />
      </section>

      {/* ===== Features / Services Section ===== */}
      <div id="services">
        <Features />
      </div>

      {/* ===== Testimonials Section ===== */}
      <section className="testimonials-section">
        <span className="testimonials-eyebrow">Client Results</span>
        <h2 className="testimonials-heading">
          Real People.{" "}
          <span style={{ background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Real Results.
          </span>
        </h2>
        <p className="testimonials-subheading">See what business owners are saying after working with us.</p>
        <TestimonialStack testimonials={testimonialsData} visibleBehind={2} />
      </section>

      {/* ===== Footer ===== */}
      <Footer7 />
    </>
  );
}
