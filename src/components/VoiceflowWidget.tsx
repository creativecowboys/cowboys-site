"use client";

import { useEffect } from "react";

export default function VoiceflowWidget() {
    useEffect(() => {
        const d = document;
        const t = "script";
        const v = d.createElement(t) as HTMLScriptElement;
        const s = d.getElementsByTagName(t)[0];

        v.onload = function () {
            (window as any).voiceflow.chat.load({
                verify: { projectID: "6998c611c348c0cb0a667c8b" },
                url: "https://general-runtime.voiceflow.com",
                versionID: "production",
                voice: {
                    url: "https://runtime-api.voiceflow.com",
                },
            });
        };

        v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
        v.type = "text/javascript";
        s.parentNode?.insertBefore(v, s);

        return () => {
            // Cleanup script tag on unmount
            if (v.parentNode) v.parentNode.removeChild(v);
        };
    }, []);

    return null;
}
