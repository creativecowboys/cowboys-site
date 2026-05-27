import { Metadata } from "next";
import Hero from "@/components/franklin/web-design/Hero";
import ProofBar from "@/components/franklin/web-design/ProofBar";
import IntegrationsSection from "@/components/ui/integrations-section";
import ServiceOverview from "@/components/franklin/web-design/ServiceOverview";
import CaseStudy from "@/components/franklin/web-design/CaseStudy";
import PricingTiers from "@/components/franklin/web-design/PricingTiers";
import Process from "@/components/franklin/web-design/Process";
import ServiceArea from "@/components/franklin/web-design/ServiceArea";
import TeamStrip from "@/components/franklin/web-design/TeamStrip";
import RiskReversal from "@/components/franklin/web-design/RiskReversal";
import FAQ from "@/components/franklin/web-design/FAQ";
import LiveReviews from "@/components/franklin/web-design/LiveReviews";
import FinalCTA from "@/components/franklin/web-design/FinalCTA";
import ScrollFadeIn from "@/components/franklin/web-design/ScrollFadeIn";

export const metadata: Metadata = {
  title: "Web Design in Franklin, TN | Sites That Convert From Cool Springs to Westhaven",
  description: "Franklin TN web design that loads in under 1.5 seconds and pays for itself in 90 days. 27 Williamson County sites shipped. Free Franklin Web Design Scorecard.",
  openGraph: {
    title: "Built in Williamson County. Built to convert.",
    description: "Franklin TN web design that loads in under 1.5 seconds and pays for itself in 90 days.",
    images: [
      {
        url: "/franklin-tn/og-web-design.png", // Updated to final unified path
        width: 1200,
        height: 630,
        alt: "Franklin Web Design - Creative Cowboys",
      },
    ],
  },
};

export default function WebDesignFranklinPage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* 1. Hero */}
      <ScrollFadeIn>
        <Hero />
      </ScrollFadeIn>
      
      {/* Proof Bar */}
      <ScrollFadeIn>
        <ProofBar />
      </ScrollFadeIn>
      
      {/* 2. Integrations Wall */}
      <ScrollFadeIn>
        <IntegrationsSection />
      </ScrollFadeIn>
      
      {/* 3. Service Overview */}
      <ScrollFadeIn>
        <ServiceOverview />
      </ScrollFadeIn>
      
      {/* 4. Case Study #1 — Harmonic Production */}
      <ScrollFadeIn>
        <CaseStudy
          clientName="Harmonic Production"
          eyebrow="AV & EVENT PRODUCTION"
          quote="“A complete rehaul of our site and SEO. Zero downtime. I'd recommend Cowboys to anyone looking for SEO and market engagement.”"
          attribution="— Ryan Coffey, Founder, Harmonic Production · Cleveland, TN"
          storyParagraphs={[
            "Harmonic Production has been one of the Southeast’s leading AV and concert production outfits since 2014 — 500+ events across 12 states, from Sunday morning church services to stadium tours. The web didn’t match the work. We rebuilt the site from the ground up: bold identity, real photography from real shows, a service catalog mapped to how event planners think, and the gear brands they trust front and center — L-Acoustics, DiGiCo, Shure, JBL. SEO was rebuilt in parallel — technical fixes, schema, Southeast location targeting — with zero downtime through the cutover."
          ]}
          metrics={[
            { label: "Customer engagement", value: "+300%" },
            { label: "Customer retention", value: "+200%" },
            { label: "Downtime during rebuild", value: "0 minutes" }
          ]}
          linkUrl="#"
          liveSiteUrl="https://www.harmonicproduction.co"
          imageSrc="/franklin-tn/harmonic-mobile-hero.png"
          imageAlt="Harmonic Production new website — after Creative Cowboys"
          imagePlaceholder="Harmonic Production — Asset Coming Soon"
          isMobileImage={true}
          bgClass="bg-testimonial-warm"
          tags={["FEATURED", "AV & EVENT PRODUCTION"]}
        />
      </ScrollFadeIn>
      
      {/* 5. Pricing Tiers */}
      <ScrollFadeIn>
        <PricingTiers />
      </ScrollFadeIn>
      
      {/* 6. Case Study #2 */}
      <ScrollFadeIn>
        <CaseStudy 
          clientName="John B. Jackson & Associates"
          eyebrow="PERSONAL INJURY · WEST GEORGIA"
          quote="“We worked with a national marketing company for six years and never broke into the top 10. We should have made the switch to Cowboys sooner.”"
          attribution="— John B. Jackson, Founding Attorney, John B. Jackson & Associates · West Georgia"
          storyParagraphs={[
            "John B. Jackson & Associates is one of West Georgia's most established personal injury and workers' comp firms — serving Carrollton, Douglasville, and Villa Rica since 2003. Before we partnered, they'd spent six years with a large national marketing agency and had never cracked the top 10 of Google for their primary keyword: \"personal injury.\" We rebuilt the website from the ground up — a modern firm site with practice-area pages, fast intake forms, and the polish a personal injury client expects before they trust someone with their case. In parallel, we built and ran integrated campaigns across CTV, Google Ads, and paid social, all routing back to conversion-tracked landing pages. Twelve months in: 22 #1 organic rankings, $500,000+ in new revenue, and a national marketing agency JBJ no longer needed."
          ]}
          metrics={[
            { label: "#1 organic rankings", value: "0 → 22 in 12 months" },
            { label: "New revenue generated", value: "$500,000+" },
            { label: "Active marketing channels", value: "0 → 3 (CTV, Google Ads, paid social)" }
          ]}
          linkUrl="/case-studies/john-b-jackson" // TODO: build sub-page
          linkText="See the full John B. Jackson case study"
          imageSrc="/franklin-tn/jbjackson-desktop-hero.png"
          imageAlt="John B. Jackson & Associates website redesign"
          imagePlaceholder="John B. Jackson & Associates — Asset Coming Soon"
          bgClass="bg-testimonial-warm"
          tags={["FEATURED", "PERSONAL INJURY"]}
        />
      </ScrollFadeIn>
      
      {/* 7. Process */}
      <ScrollFadeIn>
        <Process />
      </ScrollFadeIn>
      
      {/* 8. Case Study #3 */}
      <ScrollFadeIn>
        <CaseStudy 
          clientName="McKinley Roofing & Restoration"
          eyebrow="ROOFING · DOUGLASVILLE, GA"
          quote="“We had a one-page site that nobody could find. The Cowboys built us a real online presence — and the phone hasn't stopped ringing since.”"
          attribution="— [Owner Name], McKinley Roofing & Restoration · Douglasville, GA"
          storyParagraphs={[
            "McKinley Roofing & Restoration is a family-owned roofing company in Douglasville, GA. When we started working together, their entire web presence was a single-page site nobody could find — virtually no organic traffic, no inbound leads from search, no real digital footprint. We rebuilt the site as a proper local roofing presence: neighborhood-specific service area pages, an insurance claim assistance flow, real photography of their crew on real West Georgia roofs, and the Google Business Profile + local SEO foundations they'd been missing. We layered in active Google Ads, SEO, and paid social campaigns running together as one system. The result: 11 #1 organic rankings, website traffic up 1,000% since launch, and a phone that doesn't stop ringing during storm season."
          ]}
          metrics={[
            { label: "#1 organic rankings", value: "0 → 11" },
            { label: "Website traffic", value: "+1,000% since launch" },
            { label: "Active marketing channels", value: "0 → 3 (Google Ads, SEO, paid social)" }
          ]}
          linkUrl="/case-studies/mckinley-roofing" // TODO: build sub-page
          linkText="See the full McKinley Roofing case study"
          imageSrc="/franklin-tn/mckinley-desktop-hero.png"
          imageAlt="McKinley Roofing & Restoration website redesign"
          imagePlaceholder="McKinley Roofing & Restoration — Asset Coming Soon"
          bgClass="bg-testimonial-warm"
          tags={["FEATURED", "ROOFING"]}
        />
      </ScrollFadeIn>
      
      {/* 9. Service Area */}
      <ScrollFadeIn>
        <ServiceArea />
      </ScrollFadeIn>
      
      {/* 10. Team Strip */}
      <ScrollFadeIn>
        <TeamStrip />
      </ScrollFadeIn>
      
      {/* 11. Risk Reversal */}
      <ScrollFadeIn>
        <RiskReversal />
      </ScrollFadeIn>
      
      {/* 12. FAQ */}
      <ScrollFadeIn>
        <FAQ />
      </ScrollFadeIn>
      
      {/* 13. Live Google Reviews */}
      <ScrollFadeIn>
        <LiveReviews />
      </ScrollFadeIn>
      
      {/* 14. Final CTA */}
      <ScrollFadeIn>
        <FinalCTA />
      </ScrollFadeIn>
      
    </main>
  );
}
