"use client";

import { gaEvent } from "@/lib/analytics";

/**
 * CTA link that reports which one was clicked. Navigation is left to the
 * browser; the event is fire-and-forget so blocked analytics can't eat a click.
 */
export default function OfferCta({
    position,
    href,
    className,
    style,
    external = false,
    children,
}: {
    position: "hero" | "deal" | "accept" | "sticky" | "final" | "book";
    href: string;
    className?: string;
    style?: React.CSSProperties;
    external?: boolean;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            className={className}
            style={style}
            rel={external ? "noopener" : undefined}
            onClick={() => gaEvent("local_max_offer_cta_click", { position })}
        >
            {children}
        </a>
    );
}
