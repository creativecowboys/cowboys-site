import Image from "next/image";
import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import WranglerChat from "@/components/WranglerChat";
import { Features } from "@/components/ui/features-4";
import { Footer7 } from "@/components/ui/footer-7";
import { TestimonialStack } from "@/components/ui/glass-testimonial-swiper";
import { FAQSection } from "@/components/ui/faq-section";

export default function Home() {
  return (
    <>
      {/* ===== Hero Section — full viewport height with gradient ===== */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="mesh-gradient absolute inset-0 w-full h-full" />

        {/* Logo (top-left, fixed) — offset below the 36px info bar */}
        <Link href="/" className="site-logo absolute left-6 z-50" style={{ top: "52px" }}>
          <Image
            src="/Main%20logo%202.png"
            alt="Creative Cowboys Media — Home"
            width={180}
            height={48}
            priority
            className="w-[180px] h-auto block"
          />
        </Link>

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
        <TestimonialStack />
      </section>

      {/* ===== FAQ Section ===== */}
      <FAQSection />

      {/* ===== Footer ===== */}
      <Footer7 />
    </>
  );
}
