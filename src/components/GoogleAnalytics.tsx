"use client";

import Script from "next/script";
import { useEffect } from "react";
import { gaEvent } from "@/lib/analytics";
import { trackFb } from "@/lib/fbq";

/**
 * Google Analytics 4 (and, optionally, the Google Ads tag).
 *
 * Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set in Vercel (a "G-..." id).
 * NEXT_PUBLIC_GOOGLE_ADS_ID ("AW-...") adds the Ads tag on the same loader.
 *
 * Page views after the first are counted by GA4's own "page changes based on
 * browser history events" setting, which is on by default, so no route listener
 * is needed here.
 *
 * The click listener below reports taps on phone, text and email links from any
 * page, so call and text leads show up next to form leads.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function GoogleAnalytics() {
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!link) return;
            const href = link.getAttribute("href") ?? "";
            const kind = href.startsWith("tel:")
                ? "phone_click"
                : href.startsWith("sms:")
                  ? "text_click"
                  : href.startsWith("mailto:")
                    ? "email_click"
                    : null;
            if (!kind) return;
            gaEvent(kind, { page_path: window.location.pathname });
            if (kind !== "email_click") trackFb("Contact", { content_name: kind });
        };
        document.addEventListener("click", onClick, { capture: true });
        return () => document.removeEventListener("click", onClick, { capture: true });
    }, []);

    if (!GA_ID) return null;

    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');${ADS_ID ? `\ngtag('config', '${ADS_ID}');` : ""}`}
            </Script>
        </>
    );
}
