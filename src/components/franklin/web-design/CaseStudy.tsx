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
  reverseLayout?: boolean;   // Kept for backward compatibility but deprecated visually
  isMobileImage?: boolean;  // Renders inside an iPhone device mockup
  bgClass?: string;         // Background class like bg-white or bg-[#F4F2F0]
  tags?: string[];          // Optional custom tags
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
  bgClass = "bg-white",
  tags
}: CaseStudyProps) {
  // Lock tags to: FEATURED and VERTICAL (eyebrow) by default (2 tags max)
  const activeTags = tags ?? ["FEATURED", eyebrow];

  return (
    <section className={`w-full ${bgClass} py-32 border-b border-white/10`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: 58% width, aligned to top */}
          <div className="lg:w-[58%] w-full flex flex-col items-start">
            <div className="font-body text-xs font-semibold tracking-[0.12em] text-brand-orange uppercase mb-3 self-start">
              &mdash; {eyebrow} &mdash;
            </div>
            
            <h2 className="font-display text-[36px] md:text-[48px] font-bold text-[#121417] mt-0 mb-4 tracking-[-0.02em] leading-tight">
              {clientName}
            </h2>

            <blockquote className="font-display text-[20px] md:text-[24px] text-brand-orange font-medium italic tracking-[-0.01em] leading-snug mb-4">
              {quote}
            </blockquote>
            <p className="font-body text-neutral-500 font-medium mb-10">{attribution}</p>
            
            <div className="space-y-6 text-neutral-700 font-body text-lg leading-relaxed mb-10">
              {storyParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-[18px] border border-neutral-100 shadow-sm mb-6 w-full">
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

            {/* Tags under the Results card */}
            <div className="flex flex-wrap gap-2 mb-8">
              {activeTags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full ${
                    idx === 0 
                      ? "text-brand-orange bg-brand-orange/10 border border-brand-orange/20" 
                      : "text-neutral-500 bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link href={linkUrl} className="inline-flex items-center text-brand-orange font-bold hover:underline underline-offset-4 decoration-2">
              {linkText ?? `See the full ${clientName} case study`} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          {/* RIGHT COLUMN: 42% width, aligned to top */}
          <div className="lg:w-[42%] w-full flex justify-center">
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
                <div className="relative w-full rounded-[24px] overflow-hidden border border-brand-orange/30 shadow-md">
                  <div className="absolute top-3 left-3 z-10 bg-brand-orange text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 hover:border-brand-orange hover:text-brand-orange text-neutral-700 font-bold rounded-full text-sm transition-colors shadow-sm self-center"
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
                /* Premium Desktop Browser Mockup */
                <div className="relative w-full rounded-[24px] overflow-hidden border border-neutral-200/80 shadow-lg bg-white select-none">
                  {/* Browser Header Bar */}
                  <div className="flex items-center gap-1.5 px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  {/* Image Screen */}
                  <div className="relative w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={imageAlt ?? clientName}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover object-top"
                    />
                  </div>
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
