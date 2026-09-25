"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
}

const SUGGESTIONS = [
  "Tell me about solar energy",
  "What's your process?",
  "Security systems",
  "Smart automation",
  "How do I contact you?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hello! I'm TRES AI, your engineering assistant. I can help with questions about solar energy, electrical systems, security, automation, and all our services. How can I help you today? ⚡",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setShowSuggestions(false);

      const userMessage: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const apiMessages = [...messages, userMessage]
          .filter((m) => m.role === "user" || m.role === "bot")
          .map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.content,
          }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.reply || "Sorry, I couldn't process that. Please try again." },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "I'm having trouble connecting right now. Please contact us directly:\n📱 WhatsApp: +234 703 397 9488",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="chat-window" style={{ animation: "chatSlideIn .25s ease" }}>
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: scale(.92) translateY(16px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div className="chat-head">
            <div className="chat-head-left">
              <div className="chat-avatar">🤖</div>
              <div>
                <div className="chat-name">TRES AI</div>
                <div className="chat-status">
                  <span className="chat-online" />
                  Online · The Rock Engineering Solutions
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                {msg.role === "bot" && (
                  <div className="msg-avatar">⚡</div>
                )}
                <div className="msg-bubble" style={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg bot">
                <div className="msg-avatar">⚡</div>
                <div className="msg-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="chat-suggest-btn"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask about solar, security, automation…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ overflowY: "auto" }}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 300,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open
            ? "linear-gradient(135deg, #132a4d, #1a3560)"
            : "linear-gradient(135deg, #0e6b4a, #12865d)",
          border: "2px solid rgba(255,255,255,.15)",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 6px 28px rgba(14,107,74,.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .25s ease",
          transform: open ? "rotate(0deg)" : "rotate(0deg)",
        }}
        aria-label={open ? "Close chat" : "Open TRES AI chat"}
      >
        {open ? "✕" : "🤖"}
      </button>
    </>
  );
}
