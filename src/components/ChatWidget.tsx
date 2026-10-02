"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * GoHighLevel chat widget: the SMS opt-in form our A2P 10DLC campaign is registered against.
 *
 * Homepage only, on purpose. The carrier registration says this widget is the ONLY form that
 * collects text-message consent on https://www.creativecowboys.co, and other pages (/contact,
 * /playbooks/*) have their own phone fields. So the script is first loaded on "/", and once it
 * is on the page the bubble is hidden again whenever a client-side navigation leaves "/".
 */
const WIDGET_ID = "6abfb46003da7099e0004e1f";

export default function ChatWidget() {
    const pathname = usePathname();
    const onHome = pathname === "/";
    // Latches once the visitor has been on "/", so the script isn't torn down by later navigation.
    const [load, setLoad] = useState(onHome);
    if (onHome && !load) setLoad(true);

    useEffect(() => {
        document.querySelectorAll<HTMLElement>("chat-widget").forEach((el) => {
            el.style.display = onHome ? "" : "none";
        });
    }, [onHome]);

    if (!load) return null;
    return (
        <Script
            id="ghl-chat-widget"
            src="https://widgets.leadconnectorhq.com/loader.js"
            data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
            data-widget-id={WIDGET_ID}
            data-source="WEB_USER"
            strategy="lazyOnload"
        />
    );
}
