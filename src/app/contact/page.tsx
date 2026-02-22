import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer7 } from "@/components/ui/footer-7";
import FloatingNav from "@/components/FloatingNav";
import ContactForm from "@/components/ui/contact-form";

export const metadata: Metadata = {
    title: "Contact | Creative Cowboys Media",
    description:
        "Get in touch with Creative Cowboys Media. We're based in Villa Rica, GA and work with businesses across the country.",
};

export default function ContactPage() {
    return (
        <>
            {/* ── Full-page dark container ── */}
            <main
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #0a0908 0%, #140f0d 50%, #0a0908 100%)",
                    paddingTop: "36px", // offset for TopBar
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Subtle grid texture overlay */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                        pointerEvents: "none",
                    }}
                />

                {/* Glow orbs */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-10%",
                        left: "-5%",
                        width: "600px",
                        height: "600px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(241,95,42,0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: "10%",
                        right: "-5%",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(234,81,255,0.10) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "60px 24px 100px",
                    }}
                >
                    {/* Logo */}
                    <Link href="/" className="site-logo" style={{ display: "inline-block", marginBottom: "64px" }}>
                        <Image
                            src="/Main%20logo%202.png"
                            alt="Creative Cowboys Media"
                            width={160}
                            height={42}
                            priority
                            style={{ width: "160px", height: "auto" }}
                        />
                    </Link>

                    {/* Two-column layout */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "80px",
                            alignItems: "start",
                        }}
                        className="contact-grid"
                    >
                        {/* ── Left: Info Panel ── */}
                        <div>
                            <p style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "#F15F2A",
                                marginBottom: "16px",
                            }}>
                                Let&rsquo;s Work Together
                            </p>

                            <h1 style={{
                                fontSize: "clamp(36px, 5vw, 60px)",
                                fontWeight: 800,
                                letterSpacing: "-0.04em",
                                lineHeight: 1.05,
                                color: "#ffffff",
                                margin: "0 0 24px",
                            }}>
                                Tell us about{" "}
                                <span style={{
                                    background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    your project.
                                </span>
                            </h1>

                            <p style={{
                                fontSize: "clamp(15px, 1.5vw, 17px)",
                                color: "rgba(255,255,255,0.50)",
                                lineHeight: 1.7,
                                marginBottom: "56px",
                                maxWidth: "420px",
                            }}>
                                Whether you need a new website, a rebrand, or a full digital marketing strategy — we&rsquo;d love to hear what you&rsquo;re building.
                            </p>

                            {/* Contact details */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                                {/* Email */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "12px",
                                        background: "rgba(241,95,42,0.12)",
                                        border: "1px solid rgba(241,95,42,0.25)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#F15F2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <polyline points="22,6 12,13 2,6" stroke="#F15F2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Email</p>
                                        <a href="mailto:howdy@creativecowboys.co" style={{ color: "#ffffff", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}>
                                            howdy@creativecowboys.co
                                        </a>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "12px",
                                        background: "rgba(234,81,255,0.10)",
                                        border: "1px solid rgba(234,81,255,0.20)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#EA51FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Phone</p>
                                        <a href="tel:4702437517" style={{ color: "#ffffff", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}>
                                            (470) 243-7517
                                        </a>
                                    </div>
                                </div>

                                {/* Location */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "12px",
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Location</p>
                                        <p style={{ color: "#ffffff", fontSize: "15px", fontWeight: 500, margin: 0 }}>
                                            222 West Montgomery St.<br />Villa Rica, GA 30180
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── Right: Contact Form ── */}
                        <ContactForm />
                    </div>
                </div>

                <FloatingNav />
            </main>

            {/* ─── Responsive grid styles ─── */}
            <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>

            <Footer7 />
        </>
    );
}
