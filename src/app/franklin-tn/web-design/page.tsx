import { Metadata } from "next";
import Hero from "@/components/franklin/web-design/Hero";
import ProofBar from "@/components/franklin/web-design/ProofBar";
import LogoWall from "@/components/franklin/web-design/LogoWall";
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
      <Hero />
      
      {/* Proof Bar */}
      <ProofBar />
      
      {/* 2. Logo Wall */}
      <LogoWall />
      
      {/* 3. Service Overview */}
      <ServiceOverview />
      
      {/* 4. Case Study #1 — Harmonic Production */}
      <CaseStudy
        clientName="Harmonic Production"
        eyebrow="AV & EVENT PRODUCTION"
        quote="“A complete rehaul of our site and SEO — almost 300% lift in customer engagement, 200% retention, zero downtime through the whole project.”"
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
        bgClass="bg-[#F4F2F0]"
      />
      
      {/* 5. Pricing Tiers */}
      <PricingTiers />
      
      {/* 6. Case Study #2 */}
      <CaseStudy 
        clientName="[Recent Professional Services Client]"
        eyebrow="LAW FIRM"
        quote="We went from 2 contact form fills a month to 18. Same traffic, better site."
        attribution="[First Last], Partner, [Firm Name]"
        storyParagraphs={[
          "[Firm Name] had been running the same site since 2017. It was content-heavy, slow, and the contact form lived three clicks deep. Their content was actually good — they just couldn't capture the people reading it. The firm was getting steady organic traffic but converting almost none of it.",
          "We kept the content, restructured the site IA around practice areas, added a context-aware contact form to every page, simplified the practice-area landing pages, and added schema markup so their local reviews showed up in search results. Three weeks of design, four weeks of build."
        ]}
        metrics={[
          { label: "Contact form submissions", value: "2/mo → 18/mo (800% lift)" },
          { label: "Organic clicks", value: "+34% (same traffic, better CTR)" },
          { label: "Average session duration", value: "1:08 → 2:47" }
        ]}
        linkUrl="#"
        imagePlaceholder="Before/After Homepage + Work Photo"
        reverseLayout={true}
        bgClass="bg-[#F4F2F0]"
      />
      
      {/* 7. Process */}
      <Process />
      
      {/* 8. Case Study #3 */}
      <CaseStudy 
        clientName="[Recent Home Services Client]"
        eyebrow="HVAC · MULTI-NEIGHBORHOOD SERVICE AREA"
        quote="Phone hasn't stopped ringing since June. Most of these callers said they found us on Google."
        attribution="[First Last], Owner, [HVAC Business Name]"
        storyParagraphs={[
          "Service area was wrong on the old site. Google Business Profile wasn't connected to the website. There were no separate landing pages for the different neighborhoods they served — meaning a search for 'HVAC near me' in one neighborhood never showed up as a strong local match. We rebuilt the site with neighborhood-specific service pages, wired up Google Business Profile, added schema markup for the service area, and added a click-to-call button that fires on every mobile page."
        ]}
        metrics={[
          { label: "Service calls from Google", value: "11/mo → 64/mo (482% lift)" },
          { label: "Page-1 rankings across served neighborhoods", value: "0 → 7 keywords" },
          { label: "Click-to-call taps on mobile", value: "8/mo → 91/mo" }
        ]}
        linkUrl="#"
        imagePlaceholder="Before/After Screens + Work Photo"
        bgClass="bg-[#F4F2F0]"
      />
      
      {/* 9. Service Area */}
      <ServiceArea />
      
      {/* 10. Team Strip */}
      <TeamStrip />
      
      {/* 11. Risk Reversal */}
      <RiskReversal />
      
      {/* 12. FAQ */}
      <FAQ />
      
      {/* 13. Live Google Reviews */}
      <LiveReviews />
      
      {/* 14. Final CTA */}
      <FinalCTA />
      
    </main>
  );
}
