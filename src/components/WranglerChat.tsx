"use client";

import { useState, useRef, useEffect } from "react";

const PROJECT_ID = "6998c611c348c0cb0a667c8c";
const API_KEY = "VF.DM.69992321096ed66355fd3477.aRPa9hhLlEq6U0kE";
const RUNTIME_URL = "https://general-runtime.voiceflow.com";

interface Message {
    role: "user" | "bot";
    text: string;
}

export default function WranglerChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const sessionID = useRef("cc_" + Math.random().toString(36).substr(2, 9));
    const conversationStarted = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    async function sendToVoiceflow(userMessage: string) {
        const headers = {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            versionID: "production",
        };
        const body = (type: string, payload?: string) =>
            JSON.stringify({
                action: payload ? { type, payload } : { type },
                config: { tts: false, stripSSML: true },
            });

        if (!conversationStarted.current) {
            conversationStarted.current = true;
            // Send launch action first, then the user's message
            await fetch(`${RUNTIME_URL}/state/user/${sessionID.current}/interact`, {
                method: "POST",
                headers,
                body: body("launch"),
            });
            const r2 = await fetch(
                `${RUNTIME_URL}/state/user/${sessionID.current}/interact`,
                { method: "POST", headers, body: body("text", userMessage) }
            );
            return r2.json();
        }

        const res = await fetch(
            `${RUNTIME_URL}/state/user/${sessionID.current}/interact`,
            { method: "POST", headers, body: body("text", userMessage) }
        );
        return res.json();
    }

    async function handleSend() {
        const text = input.trim();
        if (!text || disabled) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text }]);
        setTyping(true);
        setDisabled(true);

        try {
            const traces = await sendToVoiceflow(text);
            setTyping(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            traces.forEach((trace: any) => {
                if (trace.type === "text" || trace.type === "speak") {
                    setMessages((prev) => [
                        ...prev,
                        { role: "bot", text: trace.payload.message },
                    ]);
                }
            });
        } catch {
            setTyping(false);
            setMessages((prev) => [
                ...prev,
                { role: "bot", text: "Hmm, something went wrong. Try again in a moment!" },
            ]);
        }

        setDisabled(false);
        inputRef.current?.focus();
    }

    return (
        <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto", fontFamily: "inherit" }}>
            {/* Chat box */}
            <div
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "240px",
                }}
            >
                {/* Messages area */}
                <div
                    style={{
                        flex: 1,
                        padding: "20px 20px 0 20px",
                        overflowY: "auto",
                        scrollBehavior: "smooth",
                    }}
                >
                    <style>{`
                        @keyframes msgIn {
                            from { opacity: 0; transform: translateY(8px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes blink {
                            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                            40%           { opacity: 1;   transform: scale(1); }
                        }
                        .wrangler-msg { animation: msgIn 0.3s ease; }
                    `}</style>

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className="wrangler-msg"
                            style={{
                                display: "flex",
                                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                marginBottom: "14px",
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: "80%",
                                    padding: "10px 16px",
                                    borderRadius: "16px",
                                    borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                                    borderBottomLeftRadius: msg.role === "bot" ? "4px" : "16px",
                                    fontSize: "14px",
                                    lineHeight: 1.5,
                                    background: msg.role === "user" ? "#F15F2A" : "#f3f3f3",
                                    color: msg.role === "user" ? "white" : "#1a1a1a",
                                }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {typing && (
                        <div className="wrangler-msg" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "14px" }}>
                            <div style={{ background: "#f3f3f3", borderRadius: "16px", borderBottomLeftRadius: "4px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "4px" }}>
                                {[0, 0.2, 0.4].map((delay, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            width: "6px",
                                            height: "6px",
                                            background: "#aaa",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            animation: `blink 1.2s ${delay}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 16px",
                        gap: "10px",
                        borderTop: "1px solid rgba(0,0,0,0.07)",
                        flexShrink: 0,
                    }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                        placeholder="What are we working on today?"
                        disabled={disabled}
                        autoComplete="off"
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: "15px",
                            color: "#1a1a1a",
                            fontFamily: "inherit",
                            caretColor: "#F15F2A",
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={disabled}
                        aria-label="Send"
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#F15F2A",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "background 0.2s, transform 0.1s",
                            opacity: disabled ? 0.6 : 1,
                        }}
                    >
                        <svg viewBox="0 0 24 24" width={16} height={16} style={{ fill: "white" }}>
                            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", padding: "6px", fontSize: "11px", color: "#bbb", letterSpacing: "0.02em" }}>
                Powered by Wrangler AI · Creative Cowboys
            </div>
        </div>
    );
}
