import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/admin/pricing")({ component: AdminPricing });

type Tier = {
  id: string;
  tier_key: string;
  name: string;
  monthly_price: number | null;
  annual_price: number | null;
  suffix: string | null;
  cta_label: string;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  is_visible: boolean;
};

function AdminPricing() {
  const [items, setItems] = useState<Tier[]>([]);
  const [editing, setEditing] = useState<Tier | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pricing_tiers").select("*").order("sort_order");
    setItems((data ?? []).map((d) => ({ ...d, features: (d.features as string[]) ?? [] })) as Tier[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (t: Tier) => {
    const payload = { ...t, features: t.features };
    if (creating) await supabase.from("pricing_tiers").insert({ ...payload, id: undefined });
    else await supabase.from("pricing_tiers").update(payload).eq("id", t.id);
    setEditing(null); setCreating(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this tier?")) return;
    await supabase.from("pricing_tiers").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold">Pricing</h1>
        <NxButton onClick={() => { setCreating(true); setEditing({ id: "", tier_key: "", name: "", monthly_price: 0, annual_price: 0, suffix: "/mo", cta_label: "Get Started", features: [], is_popular: false, sort_order: items.length, is_visible: true }); }}>
          <Plus className="h-4 w-4" /> New Tier
        </NxButton>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t) => (
          <div key={t.id} className="glass rounded-2xl p-6 relative">
            {t.is_popular && <span className="absolute -top-2 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-brand text-primary-foreground">POPULAR</span>}
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{t.tier_key}</div>
            <h3 className="font-display text-2xl font-extrabold mt-1">{t.name}</h3>
            <div className="mt-3 text-3xl font-display font-extrabold">
              {t.monthly_price !== null ? `$${t.monthly_price}` : "Custom"}
              <span className="text-sm font-normal text-muted-foreground">{t.suffix}</span>
            </div>
            <ul className="mt-4 text-sm text-muted-foreground space-y-1">
              {t.features.map((f, i) => <li key={i}>• {f}</li>)}
            </ul>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(t)} className="p-2 rounded-md hover:bg-white/5"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => remove(t.id)} className="p-2 rounded-md hover:bg-destructive/15 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setEditing(null); setCreating(false); }}>
          <div className="glass-strong rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">{creating ? "New Tier" : "Edit Tier"}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tier key" value={editing.tier_key} onChange={(v) => setEditing({ ...editing, tier_key: v })} />
                <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Monthly $" value={editing.monthly_price?.toString() ?? ""} onChange={(v) => setEditing({ ...editing, monthly_price: v === "" ? null : Number(v) })} />
                <Field label="Annual $" value={editing.annual_price?.toString() ?? ""} onChange={(v) => setEditing({ ...editing, annual_price: v === "" ? null : Number(v) })} />
                <Field label="Suffix" value={editing.suffix ?? ""} onChange={(v) => setEditing({ ...editing, suffix: v })} />
              </div>
              <Field label="CTA label" value={editing.cta_label} onChange={(v) => setEditing({ ...editing, cta_label: v })} />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Features (one per line)</label>
                <textarea value={editing.features.join("\n")} onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n").filter(Boolean) })} className="w-full glass rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-cyan/40 min-h-[120px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_popular} onChange={(e) => setEditing({ ...editing, is_popular: e.target.checked })} /> Popular</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_visible} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} /> Visible</label>
              </div>
              <Field label="Sort order" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
            </div>
            <div className="flex gap-2 mt-6">
              <NxButton variant="ghost" onClick={() => { setEditing(null); setCreating(false); }} className="flex-1">Cancel</NxButton>
              <NxButton onClick={() => save(editing)} className="flex-1"><Save className="h-4 w-4" /> Save</NxButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-cyan/40" />
    </div>
  );
}
