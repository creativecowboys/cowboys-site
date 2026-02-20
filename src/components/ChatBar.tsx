"use client";

import { Mic, Paperclip, Globe, Settings, FolderOpen } from "lucide-react";
import { useState } from "react";

export default function ChatBar() {
    const [hovered, setHovered] = useState(false);

    function openGHLChat() {
        // Try the GHL launcher first
        const launcher =
            document.querySelector<HTMLElement>("#lc-chat-launcher") ||
            document.querySelector<HTMLElement>(".lc-launcher") ||
            document.querySelector<HTMLElement>(".chat-widget-launcher");
        if (launcher) { launcher.click(); return; }

        // Fallback: shadow-DOM button
        const widget = document.querySelector("chat-widget") as HTMLElement & {
            shadowRoot: ShadowRoot | null;
        };
        if (widget) {
            widget.style.setProperty("opacity", "1", "important");
            widget.style.setProperty("pointer-events", "auto", "important");
            widget.shadowRoot?.querySelector<HTMLElement>("button")?.click();
        }
    }

    return (
        <div
            onClick={openGHLChat}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openGHLChat()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            aria-label="Start a conversation — Creative Cowboys"
            style={{
                cursor: "pointer",
                background: "#09090B",
                borderRadius: "18px",
                padding: "18px 18px 14px",
                width: "min(520px, 90vw)",
                boxShadow: hovered
                    ? "0 24px 60px rgba(0,0,0,0.28)"
                    : "0 12px 36px rgba(0,0,0,0.18)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                transition: "box-shadow 200ms ease, transform 200ms ease",
                position: "relative",
                zIndex: 10,
            }}
        >
            {/* Text Input Row */}
            <p
                style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 400,
                    letterSpacing: "0.01em",
                    userSelect: "none",
                }}
            >
                Type your message here...
            </p>

            {/* Bottom Row — icons left, mic right */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Left icon group */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <IconBtn icon={<Paperclip size={16} />} />
                    <IconBtn icon={<Globe size={16} />} />
                    <span style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.12)" }} />
                    <IconBtn icon={<Settings size={16} />} />
                    <span style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.12)" }} />
                    <IconBtn icon={<FolderOpen size={16} />} />
                </div>

                {/* Mic button — right */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Mic size={17} color="#09090B" strokeWidth={2} aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}

function IconBtn({ icon }: { icon: React.ReactNode }) {
    const [h, setH] = useState(false);
    return (
        <span
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
                color: h ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.38)",
                transition: "color 150ms ease",
                display: "inline-flex",
                alignItems: "center",
            }}
        >
            {icon}
        </span>
    );
}
