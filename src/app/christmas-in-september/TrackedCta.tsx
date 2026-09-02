"use client";

import { gaEvent } from "@/lib/analytics";

/**
 * CTA link that reports which one was clicked (§8) — `nav`, `hero`, `sticky`
 * or `final`. Anchor navigation is left entirely to the browser; the event is
 * fire-and-forget so a blocked analytics container can't swallow the click.
 */
export default function TrackedCta({
    position,
    href,
    className,
    style,
    children,
}: {
    position: "nav" | "hero" | "sticky" | "final";
    href: string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            className={className}
            style={style}
            onClick={() => gaEvent("giveaway_cta_click", { position })}
        >
            {children}
        </a>
    );
}
