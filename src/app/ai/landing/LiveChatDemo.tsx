"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";
import type { IndustryContent } from "./content";

const CARD = "#15181e";

/* ── Types ─────────────────────────────────────────────────── */

interface ChatMsg {
  role: "user" | "agent";
  text: string;
}

/* ── Chat Interface (inside ConversationProvider) ────────── */

function ChatInterface({
  content,
  messages,
  onSendUserMessage,
}: {
  content: IndustryContent;
  messages: ChatMsg[];
  onSendUserMessage: (text: string) => void;
}) {
  const { startSession, endSession, sendUserMessage } =
    useConversationControls();
  const { status } = useConversationStatus();
  const [inputText, setInputText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accent = content.accent;

  // Auto-scroll chat container to bottom when messages change (without moving the page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (status === "connected") {
      inputRef.current?.focus();
    }
  }, [status]);

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      if (status === "connected") {
        endSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    setHasStarted(true);
    try {
      await startSession();
    } catch (err) {
      console.error("Failed to start ElevenLabs session:", err);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || status !== "connected") return;
    onSendUserMessage(trimmed);
    sendUserMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Status text ── */
  const statusText =
    status === "connected"
      ? "Online now · AI is ready"
      : status === "connecting"
        ? "Connecting..."
        : hasStarted
          ? "Reconnecting..."
          : "Click below to start chatting";

  const statusDotColor =
    status === "connected"
      ? "#22c55e"
      : status === "connecting"
        ? "#f59e0b"
        : "rgba(255,255,255,0.25)";

  return (
    <>
      {/* Header */}
      <div
        className="lp-chat-header"
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}
      >
        <span className="lp-chat-header-icon" style={{ fontSize: "28px" }}>
          {content.chatHeader.icon}
        </span>
        <div style={{ flex: 1 }}>
          <p
            className="lp-chat-header-name"
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}
          >
            {content.chatHeader.name}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.40)",
              margin: "3px 0 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: statusDotColor,
                display: "inline-block",
                boxShadow:
                  status === "connected"
                    ? "0 0 6px rgba(34,197,94,0.5)"
                    : "none",
                transition: "background 300ms ease, box-shadow 300ms ease",
              }}
            />
            {statusText}
          </p>
        </div>
        {/* Live badge */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accent === "#C9A84C" ? "#09090C" : "#fff",
            background: accent,
            padding: "4px 10px",
            borderRadius: "6px",
          }}
        >
          LIVE
        </span>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="lp-chat-messages"
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: messages.length > 0 ? "flex-start" : "center",
          gap: "16px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Empty state — before session starts */}
        {!hasStarted && messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              {content.chatHeader.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 6px",
                }}
              >
                Try the AI — Live Demo
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.40)",
                  margin: "0 0 20px",
                  lineHeight: 1.6,
                }}
              >
                Chat with a real AI assistant trained for{" "}
                {content.formHiddenIndustry.toLowerCase()} businesses. Ask
                anything.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="live-demo-start-btn"
              style={{
                padding: "14px 28px",
                background: accent,
                color: accent === "#C9A84C" ? "#09090C" : "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition:
                  "transform 200ms ease, box-shadow 200ms ease, filter 200ms ease",
              }}
            >
              ✨ Start Live Chat
            </button>
          </div>
        )}

        {/* Connecting state */}
        {hasStarted && status !== "connected" && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
              <span
                className="typing-dot typing-dot-1"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accent,
                  display: "inline-block",
                }}
              />
              <span
                className="typing-dot typing-dot-2"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accent,
                  display: "inline-block",
                }}
              />
              <span
                className="typing-dot typing-dot-3"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accent,
                  display: "inline-block",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Connecting to AI...
            </p>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className="chat-msg-in"
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-start" : "flex-end",
              }}
            >
              <div
                className="lp-chat-bubble"
                style={{
                  maxWidth: "82%",
                  padding: "14px 18px",
                  borderRadius: isUser
                    ? "4px 20px 20px 20px"
                    : "20px 4px 20px 20px",
                  background: isUser
                    ? "rgba(255,255,255,0.06)"
                    : `${accent}22`,
                  border: isUser
                    ? "1px solid rgba(255,255,255,0.08)"
                    : `1px solid ${accent}35`,
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: isUser ? "rgba(255,255,255,0.80)" : accent,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input footer */}
      <div
        className="lp-chat-footer"
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {status === "connected" ? (
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="live-chat-input"
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 200ms ease",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: inputText.trim()
                  ? accent
                  : "rgba(255,255,255,0.06)",
                border: "none",
                cursor: inputText.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 200ms ease, transform 150ms ease",
                flexShrink: 0,
              }}
            >
              <Send
                size={16}
                color={
                  inputText.trim()
                    ? accent === "#C9A84C"
                      ? "#09090C"
                      : "#fff"
                    : "rgba(255,255,255,0.25)"
                }
              />
            </button>
          </div>
        ) : hasStarted ? (
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.30)",
              margin: 0,
              textAlign: "center",
            }}
          >
            Connecting...
          </p>
        ) : (
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.30)",
              margin: 0,
              textAlign: "center",
            }}
          >
            Click &quot;Start Live Chat&quot; to begin
          </p>
        )}
      </div>
    </>
  );
}

/* ── Main Exported Component ─────────────────────────────── */

export default function LiveChatDemo({
  content,
}: {
  content: IndustryContent;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  // Accumulate agent messages via the onMessage callback
  // (User messages are added immediately at send time)
  const handleMessage = useCallback(
    (payload: { message: string; role: "user" | "agent" }) => {
      if (payload.role === "agent") {
        setMessages((prev) => [
          ...prev,
          { role: "agent", text: payload.message },
        ]);
      }
    },
    []
  );

  if (!content.agentId) return null;

  return (
    <div
      className="lp-chat-mockup"
      style={{
        background: CARD,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        maxWidth: "500px",
        width: "100%",
        height: "580px",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 24px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <ConversationProvider
        agentId={content.agentId}
        textOnly={true}
        onMessage={handleMessage}
      >
        <ChatInterface
          content={content}
          messages={messages}
          onSendUserMessage={(text) =>
            setMessages((prev) => [...prev, { role: "user", text }])
          }
        />
      </ConversationProvider>
    </div>
  );
}
