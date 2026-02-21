"use client";

import { useEffect } from "react";

export default function VoiceflowWidget() {
    useEffect(() => {
        // Inject CSS — hide bubble, pin widget open in center of hero
        const style = document.createElement("style");
        style.innerHTML = `
            /* Hide the launcher bubble */
            #voiceflow-chat .vfrc-launcher { display: none !important; }

            /* Pin the chat widget open in the center of the hero */
            #voiceflow-chat {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 500px !important;
                height: auto !important;
                z-index: 100 !important;
            }

            #voiceflow-chat .vfrc-chat-window {
                position: relative !important;
                width: 500px !important;
                border-radius: 16px !important;
                box-shadow: 0 4px 24px rgba(0,0,0,0.1) !important;
            }
        `;
        document.head.appendChild(style);

        // Load and immediately open the Voiceflow widget
        const d = document;
        const v = d.createElement("script") as HTMLScriptElement;
        const s = d.getElementsByTagName("script")[0];

        v.onload = function () {
            (window as any).voiceflow.chat.load({
                verify: { projectID: "6998c611c348c0cb0a667c8c" },
                url: "https://general-runtime.voiceflow.com",
                versionID: "production",
                voice: {
                    url: "https://runtime-api.voiceflow.com",
                },
                assistant: {
                    stylesheet: "https://cowboys-site.vercel.app/wrangler.css",
                },
                autostart: true,
            });
            (window as any).voiceflow.chat.open();
        };

        v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
        v.type = "text/javascript";
        s.parentNode?.insertBefore(v, s);

        return () => {
            if (v.parentNode) v.parentNode.removeChild(v);
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    }, []);

    return null;
}
