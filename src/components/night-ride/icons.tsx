/** Small inline icons shared by Night Ride pages. Decorative: all are hidden from screen readers. */

export function ArrowRight() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
    );
}

export function Check() {
    return (
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 9.5l3.5 3.5 7.5-8" />
        </svg>
    );
}

export function Plus() {
    return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M7 2v10M2 7h10" />
        </svg>
    );
}

export function PhoneIcon() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 2.5h2.6l1.2 3-1.6 1.2a8 8 0 004.1 4.1l1.2-1.6 3 1.2V13a1.5 1.5 0 01-1.6 1.5A11.5 11.5 0 011.5 4.1 1.5 1.5 0 013 2.5z" />
        </svg>
    );
}

export function Stars() {
    return (
        <span className="stars" role="img" aria-label="Five out of five stars">
            {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.5 1.4-7.2-5.3-5 7.2-.9z" />
                </svg>
            ))}
        </span>
    );
}

export function GoogleG({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

/** The four orange viewfinder corners. Put inside an element with the `vf` class. */
export function Corners() {
    return (
        <>
            <span className="c tl" aria-hidden="true" />
            <span className="c tr" aria-hidden="true" />
            <span className="c bl" aria-hidden="true" />
            <span className="c br" aria-hidden="true" />
        </>
    );
}
