export default function Process() {
  const steps = [
    {
      num: "1",
      title: "Discovery",
      timing: "Week 1",
      desc: "60-min strategy call. You answer 12 questions about your business, your customers, and your goals. We send back a one-page strategy brief: who we're designing for, what the site needs to do, what success looks like."
    },
    {
      num: "2",
      title: "Design",
      timing: "Weeks 2–3",
      desc: "Wireframes first, then high-fidelity Figma designs for every page. We do one big design review with you in week 3 — not a death-by-Slack revision loop. Sample artifact: shared Figma file with comments enabled."
    },
    {
      num: "3",
      title: "Build",
      timing: "Weeks 3–5",
      desc: "Clean code on WordPress or Webflow. Lighthouse score reviewed weekly. Real device testing on iPhone and Pixel. You see a staging URL on day one and can review anytime. Sample artifact: weekly Loom walkthrough of progress."
    },
    {
      num: "4",
      title: "Launch",
      timing: "Week 5–6",
      desc: "DNS handover, SSL, GA4 + GSC + Tag Manager setup, sitemap submission, schema validation. We don't ghost on launch day — we're on Slack with you for the full week."
    },
    {
      num: "5",
      title: "90-day optimize",
      timing: "Months 2–3",
      desc: "We watch the site in the wild. Real user data (Microsoft Clarity heat maps + GA4). Two rounds of small conversion-rate-optimization tweaks at days 30 and 60. Sample artifact: 90-day report PDF."
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="max-w-3xl mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-neutral-900 mb-6">
          How we work
        </h2>
        <p className="font-body text-lg text-neutral-700 leading-relaxed">
          Five steps. Each with a realistic timeline. We send you the actual artifact at each step — not just a Slack update saying it&apos;s done.
        </p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
        {steps.map((step, i) => (
          <div key={i} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-[#F26522] text-white font-bold font-display shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {step.num}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-[18px] border border-neutral-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-xl text-neutral-900">{step.title}</h3>
                <span className="text-sm font-bold text-[#F26522] bg-[#F26522]/10 px-3 py-1 rounded-full">{step.timing}</span>
              </div>
              <p className="font-body text-neutral-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
