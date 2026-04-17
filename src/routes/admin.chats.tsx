import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send, UserCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/chats")({ component: AdminChats });

type Conversation = {
  id: string;
  session_id: string;
  user_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  status: "active" | "needs_human" | "handled_by_admin" | "closed";
  last_message_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
  created_at: string;
};

function AdminChats() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    const { data } = await supabase.from("chat_conversations").select("*").order("last_message_at", { ascending: false }).limit(100);
    setConvs((data ?? []) as Conversation[]);
  };
  const loadMessages = async (id: string) => {
    const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", id).order("created_at");
    setMessages((data ?? []) as Message[]);
  };

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (activeId) loadMessages(activeId); }, [activeId]);

  // realtime
  useEffect(() => {
    const ch = supabase.channel("admin-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, loadConvs)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const m = payload.new as Message;
        if (m.conversation_id === activeId) setMessages((prev) => [...prev, m]);
        loadConvs();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const takeOver = async () => {
    if (!activeId || !user) return;
    await supabase.from("chat_conversations").update({ status: "handled_by_admin", assigned_admin_id: user.id }).eq("id", activeId);
    await supabase.from("chat_messages").insert({ conversation_id: activeId, role: "system", content: "An admin has joined the conversation." });
    loadConvs();
  };

  const close = async () => {
    if (!activeId) return;
    await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", activeId);
    loadConvs();
  };

  const send = async () => {
    if (!draft.trim() || !activeId) return;
    await supabase.from("chat_messages").insert({ conversation_id: activeId, role: "admin", content: draft.trim() });
    await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeId);
    setDraft("");
  };

  const active = convs.find((c) => c.id === activeId);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="font-display text-3xl font-extrabold mb-4">Live Chat</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        <aside className="glass rounded-2xl overflow-y-auto">
          <div className="p-3 text-xs uppercase text-muted-foreground border-b border-white/5">Conversations ({convs.length})</div>
          {convs.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={cn("w-full text-left p-3 border-b border-white/5 hover:bg-white/5", activeId === c.id && "bg-white/8")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{c.visitor_name ?? c.visitor_email ?? c.session_id.slice(0, 8)}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{new Date(c.last_message_at).toLocaleString()}</div>
            </button>
          ))}
          {convs.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</div>}
        </aside>

        <section className="md:col-span-2 glass rounded-2xl flex flex-col min-h-0">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted-foreground"><MessagesSquare className="h-10 w-10 opacity-30" /></div>
          ) : (
            <>
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{active.visitor_name ?? "Anonymous visitor"}</div>
                  <div className="text-xs text-muted-foreground">{active.visitor_email ?? active.session_id.slice(0, 8)}</div>
                </div>
                <div className="flex gap-2">
                  {active.status !== "handled_by_admin" && active.status !== "closed" && (
                    <button onClick={takeOver} className="text-xs px-3 h-8 rounded-md bg-cyan/15 text-cyan hover:bg-cyan/25 inline-flex items-center gap-1"><UserCheck className="h-3 w-3" /> Take over</button>
                  )}
                  {active.status !== "closed" && (
                    <button onClick={close} className="text-xs px-3 h-8 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25 inline-flex items-center gap-1"><X className="h-3 w-3" /> Close</button>
                  )}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
                    <div className={cn("max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                      m.role === "user" ? "bg-white/5" :
                      m.role === "admin" ? "bg-cyan/20 text-cyan-foreground" :
                      m.role === "system" ? "bg-muted text-muted-foreground text-xs italic mx-auto" :
                      "bg-gradient-brand text-primary-foreground")}>
                      {m.role !== "system" && m.role !== "user" && <div className="text-[10px] opacity-70 mb-0.5 uppercase">{m.role}</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No messages yet.</div>}
              </div>
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply as admin…" className="flex-1 glass rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-cyan/40" />
                <button onClick={send} className="h-10 px-4 rounded-xl bg-gradient-brand text-primary-foreground inline-flex items-center gap-1"><Send className="h-4 w-4" /></button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Conversation["status"] }) {
  const map = {
    active: "bg-white/10 text-muted-foreground",
    needs_human: "bg-destructive/15 text-destructive animate-pulse",
    handled_by_admin: "bg-cyan/15 text-cyan",
    closed: "bg-muted text-muted-foreground",
  };
  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md", map[status])}>{status.replace("_", " ")}</span>;
}
