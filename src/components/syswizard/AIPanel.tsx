"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
  currentTopic?: string;
  seed?: string;
}

const SUGGESTIONS = [
  "Explain load balancing simply",
  "When should I use Kafka vs RabbitMQ?",
  "Design a URL shortener",
  "What is the CAP theorem?",
];

export function AIPanel({ open, onClose, currentTopic, seed }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🧙‍♂️ I'm **Rishi**, your system design AI mentor. Ask me about any topic — architecture, algorithms, scaling, interview prep — or describe an app you want to design!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seedSentRef = useRef("");

  // Auto-send seed prompt when opened from Design Generator
  useEffect(() => {
    if (open && seed && seed.trim() && seedSentRef.current !== seed) {
      seedSentRef.current = seed;
      void send(seed);
    }
  }, [open, seed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, topic: currentTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "⚠️ I couldn't reach my brain right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[92vw] z-50 flex flex-col bg-popover border-l border-border shadow-2xl sw-slide-in-right">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border"
        style={{ background: "var(--grad-primary)" }}>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">Rishi — System Design AI</h3>
          <p className="text-white/70 text-[11px]">Ask me anything about systems</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/15 h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto sw-scroll px-3 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <FormattedContent content={m.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[11px] px-2.5 py-1.5 rounded-full bg-muted hover:bg-accent/20 border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          placeholder="Ask about system design..."
          className="flex-1 h-10 bg-muted/50"
          disabled={loading}
        />
        <Button
          size="icon"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="h-10 w-10 text-white border-0 shrink-0"
          style={{ background: "var(--grad-primary)" }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}

/** Minimal markdown-ish formatter for **bold**, `code`, and line breaks */
function FormattedContent({ content }: { content: string }) {
  const html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code style="font-family:monospace;background:rgba(0,0,0,0.15);padding:0.1rem 0.3rem;border-radius:3px;font-size:0.85em">$1</code>')
    .replace(/\n/g, "<br />");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
