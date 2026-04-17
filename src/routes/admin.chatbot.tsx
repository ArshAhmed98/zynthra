import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/admin/chatbot")({ component: AdminChatbot });

function AdminChatbot() {
  const [prompt, setPrompt] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_settings").select("id, chatbot_system_prompt").limit(1).maybeSingle();
      if (data) { setId(data.id); setPrompt(data.chatbot_system_prompt ?? ""); }
    })();
  }, []);

  const save = async () => {
    if (!id) return;
    setSaving(true); setSaved(false);
    await supabase.from("admin_settings").update({ chatbot_system_prompt: prompt }).eq("id", id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-7 w-7 text-cyan" />
        <div>
          <h1 className="font-display text-3xl font-extrabold">Chatbot</h1>
          <p className="text-muted-foreground text-sm">System prompt that shapes NexaBot's personality and behavior</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <label className="text-xs text-muted-foreground mb-2 block">System prompt</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full glass rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan/40 min-h-[300px] font-mono text-sm" placeholder="You are NexaBot…" />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">{prompt.length} characters</span>
          <NxButton onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save prompt"}
          </NxButton>
        </div>
      </div>
    </div>
  );
}
