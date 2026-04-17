import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sound";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "nx-chat-history";
const MAX_LEN = 1000;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Msg[];
    } catch { /* ignore */ }
    return [{
      role: "assistant",
      content: "Hi! I'm NexaBot 👋 — ask me about Zynthra products, pricing, or what we can build for your team.",
    }];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexabot-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) {
        setMessages((m) => {
          const c = [...m]; c[c.length - 1] = { role: "assistant", content: "I'm being rate-limited — try again in a moment." };
          return c;
        });
        return;
      }
      if (resp.status === 402) {
        setMessages((m) => {
          const c = [...m]; c[c.length - 1] = { role: "assistant", content: "AI credits exhausted. Please add credits in your workspace." };
          return c;
        });
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Chat failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      const update = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((m) => {
          const c = [...m]; c[c.length - 1] = { role: "assistant", content: assistantSoFar };
          return c;
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) update(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => {
        const c = [...m]; c[c.length - 1] = { role: "assistant", content: "Sorry — something went wrong. Please try again." };
        return c;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. What would you like to know about Zynthra?" }]);
  };

  return (
    <>
      <button
        onClick={() => { playClick(); setOpen((o) => !o); }}
        className={cn(
          "fixed bottom-6 right-6 z-[80] h-14 w-14 rounded-full grid place-items-center text-primary-foreground",
          "bg-gradient-brand shadow-[0_0_24px_oklch(0.86_0.18_215/50%)] hover:scale-110 transition-transform animate-pulse-ring",
        )}
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed bottom-24 right-6 z-[80] w-[min(380px,calc(100vw-3rem))] h-[540px] max-h-[80vh] glass-strong rounded-3xl border border-white/10 shadow-glass flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">NexaBot</div>
                  <div className="text-[10px] text-muted-foreground">AI assistant • online</div>
                </div>
              </div>
              <button onClick={clearChat} className="p-2 rounded-lg hover:bg-white/10" aria-label="Clear chat" title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "user" ? "bg-gradient-brand text-primary-foreground" : "glass border border-white/10",
                  )}>
                    {m.content || <Dots />}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-2.5"><Dots /></div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Ask NexaBot anything..."
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan/50"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-brand text-primary-foreground disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5 text-right">{input.length}/{MAX_LEN}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  );
}
