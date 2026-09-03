"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = "1804089387217105"; // Creative Cowboys Media Pixel (was 483676105466176 = Excel Church client pixel)

/**
 * Meta (Facebook) Pixel.
 *
 * Two things the copy-pasted Meta snippet gets wrong in an App Router app:
 *
 * 1. It fires PageView exactly once, on hard load. Every <Link> navigation
 *    after that is client-side, so Meta would only ever see the first page a
 *    visitor landed on. The effect below re-fires PageView on pathname change.
 *
 * 2. Dropped into <head> as a sync script it blocks first paint. `next/script`
 *    with afterInteractive loads it once the page is usable instead.
 *
 * Keyed on pathname only, not search params: reading useSearchParams here would
 * force a Suspense boundary and deopt static generation across the whole site,
 * and a query-string change without a path change isn't a pageview worth
 * counting anyway.
 */
export default function MetaPixel() {
    const pathname = usePathname();
    const isInitialRender = useRef(true);

    useEffect(() => {
        // The inline snippet already fires PageView for the initial load —
        // firing again here would double-count every landing.
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        window.fbq?.("track", "PageView");
    }, [pathname]);

    return (
        <>
            <Script id="meta-pixel" strategy="afterInteractive">
                {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>

            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    alt=""
                    src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    );
}
