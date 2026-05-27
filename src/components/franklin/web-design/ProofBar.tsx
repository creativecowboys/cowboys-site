"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "motion/react";

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 1500; // 1.5s
    const startTime = performance.now();

    let animationFrame: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);

      const current = start + easeProgress * (end - start);
      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function ProofBar() {
  const stats = [
    {
      component: <Counter value={5} decimals={1} prefix="★ " />,
      label: "From 20+ Google reviews",
    },
    {
      component: <Counter value={100} decimals={0} suffix="+" />,
      label: "Websites built since 2022",
    },
    {
      component: <Counter value={2} decimals={0} prefix="$" suffix="M+" />,
      label: "Revenue generated for clients",
    },
    {
      component: <Counter value={500} decimals={0} suffix="+" />,
      label: "#1 Organic rankings achieved",
    },
  ];

  return (
    <section className="w-full bg-[#0E0E10] py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center justify-center relative">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-4 relative ${
                i > 0 ? "md:border-l border-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 justify-center mb-2">
                <span className="font-display font-bold text-5xl md:text-6xl text-white leading-none tracking-tight">
                  {stat.component}
                </span>
              </div>
              <span className="font-body text-xs md:text-sm font-semibold text-[#6a6a68] uppercase tracking-[0.12em] max-w-[200px] leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
