"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function GHLChatWidget() {
    // Retry-based auto-open: tries every 300ms, up to 20 attempts (~6 seconds)
    useEffect(() => {
        let attempts = 0;
        const timer = setInterval(() => {
            attempts++;
            const launcher =
                document.querySelector<HTMLElement>("#lc-chat-launcher") ||
                document.querySelector<HTMLElement>(".lc-launcher") ||
                document.querySelector<HTMLElement>(".chat-widget-launcher");

            if (launcher) {
                launcher.click();
                clearInterval(timer);
                return;
            }
            if (attempts > 20) clearInterval(timer);
        }, 300);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <style>{`
        /* Hide the default corner launcher */
        #lc-chat-launcher,
        .lc-launcher,
        .chat-widget-launcher {
          display: none !important;
        }

        /* Make the widget behave like a "hero embedded" chat */
        iframe[src*="widgets.leadconnectorhq.com"],
        iframe[src*="leadconnectorhq.com/chat-widget"],
        iframe[src*="/chat-widget/"] {
          position: absolute !important;
          left: 50% !important;
          top: 55% !important;
          transform: translate(-50%, -50%) !important;

          width: min(720px, 92vw) !important;
          height: min(560px, 62vh) !important;

          border: none !important;
          border-radius: 22px !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.28) !important;
          z-index: 50 !important;
        }
      `}</style>

            {/* Anchor div GHL mounts into */}
            <div id="cc-chat-wrapper" />

            {/* GHL widget loader */}
            <Script
                src="https://widgets.leadconnectorhq.com/loader.js"
                data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
                data-widget-id="68fbc428b69bbf814fe868e2"
                strategy="afterInteractive"
            />
        </>
    );
}
