import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export default function ServiceOverview() {
  const services = [
    {
      id: "build",
      title: "Build",
      eyebrow: "BUILD",
      icon: "/franklin-tn/icon-build-dark.svg",
      description: "Custom design system. No off-the-shelf themes. WordPress or Webflow, whichever fits your team. Strategy-led, not pixel-led.",
      accentClass: "text-brand-orange",
      borderClass: "border-brand-orange/20",
      bgOpacityClass: "bg-brand-orange/15",
      glowColor: "rgba(242, 101, 34, 0.12)",
      bullets: [
        "Custom design system",
        "No templates or cheap themes",
        "WordPress or Webflow core"
      ]
    },
    {
      id: "convert",
      title: "Convert",
      eyebrow: "CONVERT",
      icon: "/franklin-tn/icon-convert-dark.svg",
      description: "Conversion-tested forms, real call tracking, server-side analytics. We design for the action you actually want a Williamson County buyer to take.",
      accentClass: "text-brand-pink",
      borderClass: "border-brand-pink/20",
      bgOpacityClass: "bg-brand-pink/15",
      glowColor: "rgba(234, 81, 255, 0.12)",
      bullets: [
        "Conversion-optimized layout",
        "Integrated CRM & call tracking",
        "Server-side analytic tag manager"
      ]
    },
    {
      id: "maintain",
      title: "Maintain",
      eyebrow: "MAINTAIN",
      icon: "/franklin-tn/icon-maintain-dark.svg",
      description: "Optional Care Plans handle hosting, updates, backups, security, and quarterly design refreshes. Your site stays fast, secure, and current.",
      accentClass: "text-brand-blue",
      borderClass: "border-brand-blue/20",
      bgOpacityClass: "bg-brand-blue/15",
      glowColor: "rgba(42, 156, 241, 0.12)",
      bullets: [
        "Lightning-fast secure hosting",
        "Daily cloud backups & patches",
        "Quarterly design iterations"
      ]
    }
  ];

  return (
    <section className="bg-[#0D0D0F] py-32 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
            &mdash; WHAT WE DO &mdash;
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-6">
            Everything a Franklin business needs{" "}
            <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
              to win online.
            </span>
          </h2>
          <p className="font-body text-lg text-neutral-300 leading-relaxed">
            We design and build websites for Franklin businesses that are tired of paying for sites that just sit there. Strategy first, then design, then a clean build on WordPress or Webflow that loads in under 1.5 seconds and ranks for the searches your customers actually run. We bring the systems and senior team of a bigger agency, with the senior-on-every-project attention you&apos;d get from a boutique.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service) => (
            <div 
              key={service.id}
              className="relative bg-[#121417] p-8 rounded-[24px] border border-white/10 overflow-hidden group hover:border-white/20 hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between"
            >
              {/* Glow layers */}
              <div 
                className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none z-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 100% 100%, ${service.glowColor} 0%, transparent 60%)`
                }}
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 100% 100%, ${service.glowColor.replace('0.12', '0.32')} 0%, transparent 60%)`
                }}
              />

              <div className="relative z-10">
                {/* Top Icon inside pill background */}
                <div className={`mb-6 select-none inline-flex items-center justify-center p-3 rounded-2xl border ${service.borderClass} ${service.bgOpacityClass}`}>
                  <Image 
                    src={service.icon} 
                    alt={service.title} 
                    width={32} 
                    height={32} 
                    className="w-8 h-8"
                  />
                </div>

                {/* Eyebrow flanked by dashes */}
                <span className={`font-body text-xs font-bold tracking-[0.15em] ${service.accentClass} uppercase mb-2 block`}>
                  &mdash; {service.eyebrow} &mdash;
                </span>

                {/* Headline */}
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="font-body text-sm text-neutral-400 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Bullet Points with checkmarks */}
                <ul className="space-y-3 mb-8">
                  {service.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${service.accentClass}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learn More Link */}
              <Link 
                href="#book-call" 
                className={`relative z-10 inline-flex items-center text-sm font-semibold ${service.accentClass} hover:opacity-85 transition-opacity mt-4`}
              >
                Learn more <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1 ml-1">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center text-lg font-medium text-neutral-300">
          The fastest way to know if we&apos;re a fit: look at what we&apos;ve built for businesses like yours.
        </div>
      </div>
    </section>
  );
}
