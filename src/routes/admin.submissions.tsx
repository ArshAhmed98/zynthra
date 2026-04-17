import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Mail, Building, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/submissions")({ component: AdminSubmissions });

type Tab = "contacts" | "demos" | "subscribers";

function AdminSubmissions() {
  const [tab, setTab] = useState<Tab>("contacts");
  const [data, setData] = useState<{ contacts: any[]; demos: any[]; subscribers: any[] }>({ contacts: [], demos: [], subscribers: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: contacts }, { data: demos }, { data: subs }] = await Promise.all([
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false }),
      ]);
      setData({
        contacts: contacts ?? [],
        demos: demos ?? [],
        subscribers: subs ?? [],
      });
    } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (table: "contacts" | "demo_requests" | "subscribers", id: string) => {
    if (!confirm("Delete this entry?")) return;
    await supabase.from(table).delete().eq("id", id);
    load();
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "contacts", label: "Contact form", count: data.contacts.length },
    { id: "demos", label: "Demo requests", count: data.demos.length },
    { id: "subscribers", label: "Newsletter", count: data.subscribers.length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-extrabold mb-6">Submissions</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("px-4 h-10 rounded-xl text-sm transition-colors", tab === t.id ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground hover:text-foreground")}>
            {t.label} <span className="text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {tab === "contacts" && data.contacts.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold">{c.name}</h3>
                    <a href={`mailto:${c.email}`} className="text-xs text-cyan inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</a>
                    {c.company && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Building className="h-3 w-3" /> {c.company}</span>}
                    {c.phone && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>}
                  </div>
                  {c.subject && <p className="text-sm font-medium mt-2">Re: {c.subject}</p>}
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{c.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => remove("contacts", c.id)} className="p-2 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {tab === "demos" && data.demos.map((d) => (
            <div key={d.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold">{d.name} — {d.company ?? "no company"}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <a href={`mailto:${d.email}`} className="text-cyan">{d.email}</a>
                  {d.phone && <span>{d.phone}</span>}
                </div>
                {d.use_case && <p className="text-sm text-muted-foreground mt-2">{d.use_case}</p>}
                <p className="text-[11px] text-muted-foreground mt-2">{new Date(d.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => remove("demo_requests", d.id)} className="p-2 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {tab === "subscribers" && data.subscribers.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <a href={`mailto:${s.email}`} className="text-sm text-cyan">{s.email}</a>
                <p className="text-[11px] text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => remove("subscribers", s.id)} className="p-2 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {((tab === "contacts" && data.contacts.length === 0) || (tab === "demos" && data.demos.length === 0) || (tab === "subscribers" && data.subscribers.length === 0)) && (
            <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No entries yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
