import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/dashboard/api-keys")({
  component: Keys,
});

type Key = { id: string; name: string; key_prefix: string; created_at: string };

function Keys() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<{ key: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("api_keys").select("id,name,key_prefix,created_at").order("created_at", { ascending: false });
    if (!error && data) setKeys(data);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user || !name.trim()) return toast.error("Name required");
    const raw = "nxk_live_" + crypto.randomUUID().replace(/-/g, "");
    const prefix = raw.slice(0, 16);
    const hash = await sha256(raw);
    const { data, error } = await supabase.from("api_keys").insert({
      user_id: user.id, name: name.trim(), key_prefix: prefix, key_hash: hash,
    }).select().single();
    if (error) return toast.error(error.message);
    setName("");
    setRevealed({ key: raw, id: data.id });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Key revoked");
    load();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">API Keys</h1>
        <p className="text-muted-foreground mt-1">Manage credentials for your apps. Keys are shown once on creation.</p>
      </div>

      <div className="glass-strong rounded-2xl p-6 flex flex-col sm:flex-row gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production server"
          className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan/50" />
        <NxButton onClick={create}><Plus className="h-4 w-4" /> Generate key</NxButton>
      </div>

      {revealed && (
        <div className="glass rounded-2xl p-5 border border-cyan/30 glow-cyan">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan mb-2">Save this key now — it won't be shown again</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm break-all bg-black/30 p-3 rounded-lg">{revealed.key}</code>
            <button onClick={() => { navigator.clipboard.writeText(revealed.key); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="p-3 rounded-lg glass hover:text-cyan" aria-label="Copy">
              {copied ? <Check className="h-4 w-4 text-cyan" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={() => setRevealed(null)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">I've saved it, dismiss</button>
        </div>
      )}

      <div className="glass rounded-2xl divide-y divide-white/5">
        {keys.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No keys yet — generate your first one above.</div>}
        {keys.map((k) => (
          <div key={k.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-display font-bold">{k.name}</div>
              <div className="text-xs font-mono text-muted-foreground">{k.key_prefix}••••••••••• · {new Date(k.created_at).toLocaleDateString()}</div>
            </div>
            <button onClick={() => remove(k.id)} className="p-2 rounded-lg hover:bg-destructive/15 hover:text-destructive" aria-label="Revoke">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
