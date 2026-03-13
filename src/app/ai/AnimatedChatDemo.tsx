"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type Sender = "user" | "ai";

interface Message {
    id: number;
    sender: Sender;
    text: string;
    /** ms after previous message ends before this one starts appearing */
    delay: number;
}

/* ─── Script ────────────────────────────────────────────── */
const SCRIPT: Message[] = [
    {
        id: 1,
        sender: "user",
        text: "Hi, is anyone available today? I've got a pretty bad leak under my kitchen sink.",
        delay: 600,
    },
    {
        id: 2,
        sender: "ai",
        text: "Hi there! 👋 Thanks for reaching out to Peak Plumbing. I'm sorry to hear about the leak — let's get that taken care of! Is water actively dripping or pooling right now?",
        delay: 900,
    },
    {
        id: 3,
        sender: "user",
        text: "Yeah, there's water pooling under the cabinet. I put a towel down but it's getting worse.",
        delay: 800,
    },
    {
        id: 4,
        sender: "ai",
        text: "Got it — sounds urgent. We can definitely get someone out to you today. Are you located in the Villa Rica or Carrollton area?",
        delay: 700,
    },
    {
        id: 5,
        sender: "user",
        text: "Yes, Villa Rica.",
        delay: 600,
    },
    {
        id: 6,
        sender: "ai",
        text: "Perfect! We have a licensed technician available this afternoon between 2–5 PM. Want me to go ahead and lock in that slot for you?",
        delay: 700,
    },
    {
        id: 7,
        sender: "user",
        text: "Yes please, that works!",
        delay: 500,
    },
    {
        id: 8,
        sender: "ai",
        text: "You're all set! ✅ A technician will arrive between 2–5 PM today. You'll receive a text confirmation shortly with their name and a heads-up when they're on the way. Is there anything else I can help with?",
        delay: 900,
    },
    {
        id: 9,
        sender: "user",
        text: "No that's perfect, thank you!",
        delay: 600,
    },
    {
        id: 10,
        sender: "ai",
        text: "Happy to help! 😊 We'll see you this afternoon. If anything changes or you need to reach us, just call (470) 555-0100. Have a great rest of your day!",
        delay: 800,
    },
];

/* ─── Typing speed (chars/ms) ───────────────────────────── */
const TYPE_SPEED = 22; // ms per character

/* ─── Small avatar ──────────────────────────────────────── */
function AIAvatar() {
    return (
        <Image
            src="/peak-plumbing-logo.png"
            alt="Peak Plumbing AI"
            width={32}
            height={32}
            style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
        />
    );
}

/* ─── Typing indicator ──────────────────────────────────── */
function TypingIndicator() {
    return (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "rgba(86,204,242,0.70)",
                        animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Single bubble ─────────────────────────────────────── */
function Bubble({
    msg,
    typing,
    visible,
}: {
    msg: Message;
    typing: boolean;
    visible: boolean;
}) {
    const isAI = msg.sender === "ai";

    if (!visible) return null;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isAI ? "row" : "row-reverse",
                alignItems: "flex-end",
                gap: "10px",
                marginBottom: "16px",
                animation: "chatFadeUp 0.3s ease both",
            }}
        >
            {isAI && <AIAvatar />}

            <div
                style={{
                    maxWidth: "82%",
                    padding: typing ? "12px 16px" : "12px 16px",
                    borderRadius: isAI ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                    background: isAI
                        ? "rgba(86,204,242,0.10)"
                        : "rgba(241,95,42,0.18)",
                    border: isAI
                        ? "1px solid rgba(86,204,242,0.22)"
                        : "1px solid rgba(241,95,42,0.28)",
                    color: "#fff",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    position: "relative",
                }}
            >
                {typing ? <TypingIndicator /> : msg.text}
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────── */
export default function AnimatedChatDemo() {
    const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
    const [typingId, setTypingId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const runningRef = useRef(false);

    /* Auto-scroll to bottom whenever a new message appears */
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleIds, typingId]);

    /* Cleanup on unmount */
    useEffect(() => {
        return () => {
            runningRef.current = false;
            timeouts.current.forEach(clearTimeout);
            observerRef.current?.disconnect();
        };
    }, []);

    function runScript() {
        if (runningRef.current) return;
        runningRef.current = true;

        function playOnce() {
            // Reset messages for this iteration
            setVisibleIds(new Set());
            setTypingId(null);

            let cursor = 0;

            SCRIPT.forEach((msg) => {
                cursor += msg.delay;
                const t1 = setTimeout(() => {
                    setTypingId(msg.id);
                }, cursor);
                timeouts.current.push(t1);

                const typeDuration = msg.text.length * TYPE_SPEED;
                cursor += typeDuration;
                const t2 = setTimeout(() => {
                    setTypingId(null);
                    setVisibleIds((prev) => new Set([...prev, msg.id]));
                }, cursor);
                timeouts.current.push(t2);
            });

            // After last message, pause 3s then loop
            const tLoop = setTimeout(() => {
                if (runningRef.current) playOnce();
            }, cursor + 3000);
            timeouts.current.push(tLoop);
        }

        playOnce();
    }

    /* Trigger on scroll into view */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    runScript();
                    observerRef.current?.disconnect();
                }
            },
            { threshold: 0.35 }
        );
        observerRef.current.observe(el);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={containerRef}>
            <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* Phone frame */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    margin: "0 auto",
                    background: "#0d1118",
                    borderRadius: "28px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(86,204,242,0.08)",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* Chat header */}
                <div
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <AIAvatar />
                    <div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                            Peak Plumbing AI
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                            <span
                                style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: "#2ED573",
                                    display: "inline-block",
                                }}
                            />
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>Online — replies instantly</span>
                        </div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                        AI by Creative Cowboys
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    style={{
                        padding: "20px 16px",
                        height: "440px",
                        overflowY: "auto",
                        scrollBehavior: "smooth",
                    }}
                >
                    {/* Date stamp */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <span
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.25)",
                                background: "rgba(255,255,255,0.04)",
                                padding: "4px 12px",
                                borderRadius: "20px",
                            }}
                        >
                            Today
                        </span>
                    </div>

                    {SCRIPT.map((msg) => {
                        const isTyping = typingId === msg.id;
                        const isVisible = visibleIds.has(msg.id);
                        return (
                            <Bubble
                                key={msg.id}
                                msg={msg}
                                typing={isTyping}
                                visible={isTyping || isVisible}
                            />
                        );
                    })}

                    {/* Loop restarts automatically after a 3s pause */}

                </div>

                {/* Input bar (decorative) */}
                <div
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                        padding: "12px 16px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.02)",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "20px",
                            padding: "9px 16px",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.25)",
                        }}
                    >
                        Type a message…
                    </div>
                    <div
                        style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #56CCF2, #F15F2A)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
