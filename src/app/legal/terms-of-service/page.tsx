import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import { Footer7 } from "@/components/ui/footer-7";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for Creative Cowboys Media.",
    alternates: { canonical: "/legal/terms-of-service" },
};

const DARK = "#0D0D0F";

export default function TermsOfServicePage() {
    return (
        <>
            <div style={{ background: DARK, minHeight: "100vh", color: "#d1d5db", fontFamily: "var(--font-geist-sans, sans-serif)", paddingBottom: "80px" }}>
                <Link href="/" className="site-logo" style={{ position: "absolute", top: "52px", left: "24px", zIndex: 50 }}>
                    <Image src="/Main%20logo%202.png" alt="Creative Cowboys Media" width={160} height={42} priority style={{ width: "160px", height: "auto" }} />
                </Link>

                <section style={{ maxWidth: "800px", margin: "0 auto", padding: "160px 24px 80px" }}>
                    <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "#fff", marginBottom: "24px", letterSpacing: "-0.02em" }}>
                        Terms of Service
                    </h1>
                    <p style={{ fontSize: "16px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "40px" }}>
                        Last Updated: May 2026
                    </p>

                    <div style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>
                        <p style={{ marginBottom: "24px" }}>
                            Welcome to Creative Cowboys. By accessing our website and using our services, you agree to these Terms of Service. Please read them carefully.
                        </p>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "40px 0 16px" }}>1. Acceptance of Terms</h2>
                        <p style={{ marginBottom: "24px" }}>
                            By engaging with Creative Cowboys Media, you agree to abide by all applicable laws and regulations and be responsible for compliance with any applicable local laws.
                        </p>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "40px 0 16px" }}>2. Services Provided</h2>
                        <p style={{ marginBottom: "24px" }}>
                            Creative Cowboys offers digital marketing, SEO, PPC management, web design, and branding services. The specific scope of work, deliverables, and timelines will be outlined in a separate proposal or agreement.
                        </p>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "40px 0 16px" }}>3. Contact Us</h2>
                        <p style={{ marginBottom: "24px" }}>
                            If you have any questions about these Terms, please contact us at howdy@creativecowboys.co.
                        </p>
                    </div>
                </section>

                <Footer7 />
            </div>
            <FloatingNav />
        </>
    );
}
