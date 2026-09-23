/**
 * Review cards for the playbook landing page: the Google card layout. The Google "G" and the five stars are inline SVG so they
 * stay crisp at any size and need no extra requests.
 */

export type Review = {
    quote: string;
    who: string;
    business: string;
    where: string;
};

export const REVIEWS: Review[] = [
    {
        quote: "Complete rehaul of our website and optimized our SEO, which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention.",
        who: "Ryan Coffey",
        business: "Harmonic Production",
        where: "Cleveland, TN",
    },
    {
        quote: "Top notch service. We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question or issue. Highly recommend.",
        who: "Rob Goldin",
        business: "Commercial Insurance Agency",
        where: "Bremen, GA",
    },
];

export function GoogleG({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

export function Stars({ size = 22, color = "#FBBC04", gap = 3 }: { size?: number; color?: string; gap?: number }) {
    return (
        <span className="inline-flex items-center" style={{ gap }} role="img" aria-label="Five out of five stars">
            {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill={color} d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.5 1.4-7.2-5.3-5 7.2-.9z" />
                </svg>
            ))}
        </span>
    );
}

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
    return (
        <span
            className="inline-flex items-center justify-center w-11 h-11 font-anton text-[16px] tracking-[1px] border-[2.5px] bg-[#B5330E] text-white border-[#0a0a0a]"
            aria-hidden="true"
        >
            {initials}
        </span>
    );
}

/** A. Google card: white, the G and big stars up top, avatar and name at the foot. */
export function ReviewCardA({ r }: { r: Review }) {
    return (
        <figure className="bg-white border-[3px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-anton text-[11px] tracking-[2px] uppercase text-[#0a0a0a]/70">
                    <GoogleG size={22} /> Google review
                </span>
                <Stars size={24} />
            </div>
            <blockquote className="text-[17px] leading-snug">&ldquo;{r.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3 pt-2 border-t-[2.5px] border-[#0a0a0a]/15">
                <Avatar name={r.who} />
                <span className="flex flex-col leading-tight">
                    <span className="font-anton text-[15px] tracking-[1px] uppercase">{r.who}</span>
                    <span className="text-[12px] text-[#0a0a0a]/65">{r.business} &middot; {r.where}</span>
                </span>
            </figcaption>
        </figure>
    );
}

export function ReviewCard({ r }: { r: Review }) {
    return <ReviewCardA r={r} />;
}
