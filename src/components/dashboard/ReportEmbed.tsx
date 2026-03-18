"use client";

import { useState } from "react";

interface ReportEmbedProps {
    url?: string;
    title: string;
}

export default function ReportEmbed({ url, title }: ReportEmbedProps) {
    const [loaded, setLoaded] = useState(false);

    if (!url) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "400px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    textAlign: "center",
                    padding: "40px",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(241,95,42,0.12)",
                        border: "1px solid rgba(241,95,42,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        marginBottom: "16px",
                    }}
                >
                    📊
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                    Report Coming Soon
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: "280px" }}>
                    Your {title} report is being set up. Check back soon or contact your account manager.
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", height: "100%", overflow: "hidden", border: "none" }}>
            {/* Loading state */}
            {!loaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(13,13,15,0.8)",
                        zIndex: 2,
                        borderRadius: "12px",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "3px solid rgba(241,95,42,0.2)",
                                borderTopColor: "#F15F2A",
                                margin: "0 auto 12px",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Loading report…</p>
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            <iframe
                src={url}
                title={title}
                onLoad={() => setLoaded(true)}
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "600px",
                    border: "none",
                    display: "block",
                    background: "#0D0D0F",
                }}
                allowFullScreen
            />
        </div>
    );
}
