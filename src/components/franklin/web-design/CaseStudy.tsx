import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Metric {
  label: string;
  value: string;
}

interface CaseStudyProps {
  clientName: string;
  eyebrow: string;
  quote: string;
  attribution: string;
  storyParagraphs: string[];
  metrics: Metric[];
  linkUrl: string;
  linkText?: string;         // Optional custom link text
  liveSiteUrl?: string;     // Optional "View Site" link shown under the After image
  imageSrc?: string;        // "After" screenshot path from /public
  imageAlt?: string;        // Alt text for after image
  beforeSrc?: string;       // "Before" screenshot path from /public
  beforeAlt?: string;       // Alt text for before image
  imagePlaceholder: string; // Shown when no imageSrc provided
  reverseLayout?: boolean;
  isMobileImage?: boolean;  // Renders inside an iPhone device mockup
  bgClass?: string;         // Background class like bg-white or bg-[#F4F2F0]
}

export default function CaseStudy({
  clientName,
  eyebrow,
  quote,
  attribution,
  storyParagraphs,
  metrics,
  linkUrl,
  linkText,
  liveSiteUrl,
  imageSrc,
  imageAlt,
  beforeSrc,
  beforeAlt,
  imagePlaceholder,
  reverseLayout = false,
  isMobileImage = false,
  bgClass = "bg-white"
}: CaseStudyProps) {
  return (
    <section className={`w-full ${bgClass} ${bgClass === "bg-white" ? "py-32" : "py-28"}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`flex flex-col gap-12 lg:gap-20 ${reverseLayout ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="inline-block mb-0 px-3 py-1 rounded-[10px] bg-[#EDE9E4] text-[#121417] text-xs font-bold tracking-widest uppercase self-start">
              {eyebrow}
            </div>
            
            <h2 className="font-display text-[36px] md:text-[48px] font-bold text-[#121417] mt-0 mb-4 tracking-[-0.02em] leading-tight">
              {clientName}
            </h2>

            <blockquote className="font-display text-[20px] md:text-[24px] text-[#F26522] font-medium italic tracking-[-0.01em] leading-snug mb-4">
              {quote}
            </blockquote>
          <p className="font-body text-neutral-500 font-medium mb-10">{attribution}</p>
          
          <div className="space-y-6 text-neutral-700 font-body text-lg leading-relaxed mb-10">
            {storyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          
          <div className="bg-white p-8 rounded-[18px] border border-neutral-100 shadow-sm mb-8">
            <h4 className="font-display font-bold text-neutral-900 mb-6 text-lg">The Results</h4>
            <ul className="space-y-4">
              {metrics.map((metric, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-neutral-100 last:border-0 last:pb-0">
                  <span className="text-neutral-500 font-medium">{metric.label}</span>
                  <span className="font-bold text-neutral-900">{metric.value}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Link href={linkUrl} className="inline-flex items-center text-[#F26522] font-bold hover:underline underline-offset-4 decoration-2">
            {linkText ?? `See the full ${clientName} case study`} <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
        
        <div className="lg:w-1/2 flex justify-center items-center">
          {imageSrc && beforeSrc ? (
            /* Before / After comparison */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="relative w-full rounded-[14px] overflow-hidden border border-neutral-200 shadow-sm">
                <div className="absolute top-3 left-3 z-10 bg-neutral-800/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Before
                </div>
                <Image
                  src={beforeSrc}
                  alt={beforeAlt ?? `${clientName} — before`}
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex-1 h-px bg-neutral-200" />
                <span>Creative Cowboys rebuilt it</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
              <div className="relative w-full rounded-[14px] overflow-hidden border border-[#F26522]/30 shadow-sm">
                <div className="absolute top-3 left-3 z-10 bg-[#F26522] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  After
                </div>
                <Image
                  src={imageSrc}
                  alt={imageAlt ?? `${clientName} — after`}
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              {liveSiteUrl && (
                <a
                  href={liveSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 hover:border-[#F26522] hover:text-[#F26522] text-neutral-700 font-bold rounded-full text-sm transition-colors shadow-sm self-center"
                >
                  View Site
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          ) : imageSrc ? (
            isMobileImage ? (
              /* Custom iPhone frame for mobile screenshots */
              <div className="relative mx-auto w-full max-w-[310px] aspect-[9/19.5] bg-neutral-950 rounded-[44px] p-3 shadow-2xl border-[4px] border-neutral-800 ring-4 ring-neutral-900 select-none">
                {/* Speaker notch / Dynamic island shape */}
                <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-neutral-900 rounded-full z-20"></div>
                {/* Screen */}
                <div className="relative w-full h-full overflow-hidden rounded-[34px] bg-neutral-950 border border-neutral-900">
                  <Image
                    src={imageSrc}
                    alt={imageAlt ?? clientName}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
            ) : (
              /* Single image (desktop / generic) */
              <div className="relative w-full rounded-[24px] overflow-hidden border border-neutral-200 shadow-md">
                <Image
                  src={imageSrc}
                  alt={imageAlt ?? clientName}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
            )
          ) : (
            /* Placeholder */
            <div className="w-full h-full min-h-[400px] bg-neutral-200 rounded-[18px] border border-neutral-300 flex items-center justify-center text-neutral-500 flex-col p-8 text-center">
              <p className="font-bold mb-2">{imagePlaceholder}</p>
              <p className="text-sm text-neutral-400">Asset coming soon</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
