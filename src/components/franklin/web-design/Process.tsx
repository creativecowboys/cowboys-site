import Image from "next/image";

export default function Process() {
  const steps = [
    {
      num: "1",
      title: "Discovery",
      timing: "Week 1",
      icon: "/franklin-tn/process-1-dark.svg",
      desc: "60-min strategy call. You answer 12 questions about your business, your customers, and your goals. We send back a one-page strategy brief: who we're designing for, what the site needs to do, what success looks like."
    },
    {
      num: "2",
      title: "Design",
      timing: "Weeks 2–3",
      icon: "/franklin-tn/process-2-dark.svg",
      desc: "Wireframes first, then high-fidelity Figma designs for every page. We do one big design review with you in week 3 — not a death-by-Slack revision loop. Sample artifact: shared Figma file with comments enabled."
    },
    {
      num: "3",
      title: "Build",
      timing: "Weeks 3–5",
      icon: "/franklin-tn/process-3-dark.svg",
      desc: "Clean code on WordPress or Webflow. Lighthouse score reviewed weekly. Real device testing on iPhone and Pixel. You see a staging URL on day one and can review anytime. Sample artifact: weekly Loom walkthrough of progress."
    },
    {
      num: "4",
      title: "Launch",
      timing: "Week 5–6",
      icon: "/franklin-tn/process-4-dark.svg",
      desc: "DNS handover, SSL, GA4 + GSC + Tag Manager setup, sitemap submission, schema validation. We don't ghost on launch day — we're on Slack with you for the full week."
    },
    {
      num: "5",
      title: "Optimize",
      timing: "Months 2–3",
      icon: "/franklin-tn/process-5-dark.svg",
      desc: "We watch the site in the wild. Real user data (Microsoft Clarity heat maps + GA4). Two rounds of small conversion-rate-optimization tweaks at days 30 and 60. Sample artifact: 90-day report PDF."
    }
  ];

  return (
    <section className="bg-[#0D0D0F] py-32 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-20">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3">
            &mdash; OUR PROCESS &mdash;
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-6">
            How we work{" "}
            <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
              in 90 days.
            </span>
          </h2>
          <p className="font-body text-lg text-neutral-300 leading-relaxed">
            Five steps. Each with a realistic timeline. We send you the actual artifact at each step — not just a Slack update saying it&apos;s done.
          </p>
        </div>

        {/* Desktop Layout: Horizontal numbered timeline */}
        <div className="hidden lg:block relative mt-16">
          {/* Horizontal connecting line */}
          <div className="absolute top-16 left-[10%] right-[10%] h-0.5 bg-neutral-800 z-0"></div>

          <div className="grid grid-cols-5 gap-6 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Step circle indicator with number */}
                <div className="w-10 h-10 rounded-full border-2 border-neutral-800 bg-[#121417] shadow-sm flex items-center justify-center font-display font-bold text-lg text-brand-orange mb-6 z-10 transition-transform duration-300 group-hover:scale-110">
                  {step.num}
                </div>

                {/* SVG Icon */}
                <div className="w-16 h-16 bg-[#121417] border border-white/10 rounded-2xl flex items-center justify-center p-3 mb-6 select-none transition-all duration-300 hover:border-white/20">
                  <Image 
                    src={step.icon} 
                    alt={step.title} 
                    width={48} 
                    height={48}
                    className="w-12 h-12"
                  />
                </div>

                {/* Step Metadata */}
                <h3 className="font-display font-bold text-lg text-white mb-1">
                  {step.title}
                </h3>
                <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full mb-4">
                  {step.timing}
                </span>

                {/* Step Paragraph */}
                <p className="font-body text-sm text-neutral-400 leading-relaxed max-w-[220px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout: Vertical stacked timeline */}
        <div className="block lg:hidden relative pl-8 before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-neutral-800">
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col sm:flex-row gap-6 items-start">
                {/* Number indicator */}
                <div className="absolute -left-8 top-1.5 w-7 h-7 rounded-full border-2 border-neutral-800 bg-[#121417] shadow-sm flex items-center justify-center font-display font-bold text-sm text-brand-orange z-10">
                  {step.num}
                </div>

                {/* Icon box */}
                <div className="w-14 h-14 bg-[#121417] border border-white/10 rounded-xl flex items-center justify-center p-2.5 shrink-0 select-none">
                  <Image 
                    src={step.icon} 
                    alt={step.title} 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                </div>

                {/* Content card */}
                <div className="flex-1 bg-[#121417] border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-display font-bold text-lg text-white">
                      {step.title}
                    </h3>
                    <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full">
                      {step.timing}
                    </span>
                  </div>
                  <p className="font-body text-sm text-neutral-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
