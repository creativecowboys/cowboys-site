import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import WranglerChat from "@/components/WranglerChat";
import { Features } from "@/components/ui/features-4";
import { Footer7 } from "@/components/ui/footer-7";

export default function Home() {
  return (
    <>
      {/* ===== Hero Section — full viewport height with gradient ===== */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="mesh-gradient absolute inset-0 w-full h-full" />

        {/* Logo (top-left, fixed) — offset below the 36px info bar */}
        <div className="fixed left-6 z-50" style={{ top: "52px" }}>
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
            marginBottom: "36px",
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
              margin: "0 0 20px",
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

      {/* ===== Footer ===== */}
      <Footer7 />
    </>
  );
}
