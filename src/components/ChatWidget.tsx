"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CHAT_WIDGET } from "@/lib/chat-widget";

/**
 * GoHighLevel chat widget: the SMS opt-in form our A2P 10DLC campaign is registered against.
 *
 * Homepage only, on purpose. The carrier registration says this widget is the ONLY form that
 * collects text-message consent on https://www.creativecowboys.co, and other pages (/contact,
 * /playbooks/*) have their own phone fields.
 *
 * The <script> tag itself is server-rendered by the homepage (see ChatWidgetScript in
 * src/app/page.tsx) because GHL's compliance scanner looks for it in the page HTML. This
 * component covers the two things a static tag can't: loading the widget when a visitor
 * arrives at "/" by client-side navigation, and hiding the bubble again when they leave.
 */

export default function ChatWidget() {
    const onHome = usePathname() === "/";

    useEffect(() => {
        if (onHome && !document.querySelector(`script[data-widget-id="${CHAT_WIDGET.widgetId}"]`)) {
            const s = document.createElement("script");
            s.id = CHAT_WIDGET.id;
            s.src = CHAT_WIDGET.src;
            s.dataset.resourcesUrl = CHAT_WIDGET.resourcesUrl;
            s.dataset.widgetId = CHAT_WIDGET.widgetId;
            s.dataset.source = "WEB_USER";
            document.body.appendChild(s);
        }
        document.querySelectorAll<HTMLElement>("chat-widget").forEach((el) => {
            el.style.display = onHome ? "" : "none";
        });
    }, [onHome]);

    return null;
}
