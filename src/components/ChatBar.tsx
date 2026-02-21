"use client";

import { Mic, Paperclip, Globe, Settings, FolderOpen } from "lucide-react";
import { useState } from "react";

export default function ChatBar() {
    const [hovered, setHovered] = useState(false);

    function openVoiceflowChat() {
        const vf = (window as any).voiceflow?.chat;
        if (vf) {
            vf.open();
        }
    }

    return (
        <div
            onClick={openVoiceflowChat}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openVoiceflowChat()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            aria-label="Start a conversation — Creative Cowboys"
            style={{
                cursor: "pointer",
                background: "#ffffff",
                borderRadius: "18px",
                padding: "18px 18px 14px",
                width: "min(520px, 90vw)",
                boxShadow: hovered
                    ? "0 24px 60px rgba(0,0,0,0.14)"
                    : "0 8px 32px rgba(0,0,0,0.10)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                transition: "box-shadow 200ms ease, transform 200ms ease",
                position: "relative",
                zIndex: 10,
                border: "1px solid rgba(0,0,0,0.08)",
            }}
        >
            {/* Placeholder text */}
            <p
                style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    color: "rgba(0,0,0,0.36)",
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
                    <span style={{ width: "1px", height: "16px", background: "rgba(0,0,0,0.12)" }} />
                    <IconBtn icon={<Settings size={16} />} />
                    <span style={{ width: "1px", height: "16px", background: "rgba(0,0,0,0.12)" }} />
                    <IconBtn icon={<FolderOpen size={16} />} />
                </div>

                {/* Mic button — right */}
                <div
                    style={{
                        background: "#09090B",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Mic size={17} color="#ffffff" strokeWidth={2} aria-hidden="true" />
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
                color: h ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.36)",
                transition: "color 150ms ease",
                display: "inline-flex",
                alignItems: "center",
            }}
        >
            {icon}
        </span>
    );
}
