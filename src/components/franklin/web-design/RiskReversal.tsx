import { Shield } from "lucide-react";

export default function RiskReversal() {
  const points = [
    "You own the site. The domain. The hosting. The files. When the project's done, everything transfers to you. If you ever leave us, you take it all.",
    "Flat fee. No surprises. The number on the proposal is the number on the final invoice — assuming scope doesn't change. If scope changes, you'll see the new estimate before any work happens.",
    "If you're not happy with the design direction after the first review, we'll do one full pivot at no extra cost. After that we'll talk.",
    "We say no a lot. If your project isn't a fit for us, we'll tell you and point you somewhere better. We'd rather not work with you than do bad work."
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-12 bg-[#F4F2F0] rounded-[24px] p-10 md:p-16 border border-[#ECEAE3] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-neutral-900 mb-10">
            Things we want you to know upfront.
          </h2>
          
          <ul className="space-y-6">
            {points.map((point, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-[#F26522] shrink-0 mt-2.5" />
                <p className="font-body text-neutral-700 text-lg leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
