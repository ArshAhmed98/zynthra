import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
  version: string;
  sort_order: number;
  is_visible: boolean;
};

const CATEGORIES = ["ai", "comms", "platform", "dev"];
const ACCENTS = ["cyan", "violet", "coral"];

function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setItems((data ?? []) as Product[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (p: Product) => {
    if (creating) {
      await supabase.from("products").insert({ ...p, id: undefined });
    } else {
      await supabase.from("products").update(p).eq("id", p.id);
    }
    setEditing(null); setCreating(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggle = async (p: Product) => {
    await supabase.from("products").update({ is_visible: !p.is_visible }).eq("id", p.id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Products</h1>
          <p className="text-muted-foreground mt-1">{items.length} products on the site</p>
        </div>
        <NxButton onClick={() => { setCreating(true); setEditing({ id: "", name: "", description: "", category: "ai", icon: "Bot", accent: "cyan", version: "v1", sort_order: items.length, is_visible: true }); }}>
          <Plus className="h-4 w-4" /> New Product
        </NxButton>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-white/5">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Visible</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3"><span className="text-xs px-2 py-1 rounded-md bg-white/5">{p.category}</span></td>
                <td className="p-3 text-muted-foreground max-w-md truncate">{p.description}</td>
                <td className="p-3">
                  <button onClick={() => toggle(p)} className={p.is_visible ? "text-cyan" : "text-muted-foreground"}>
                    {p.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="p-2 hover:bg-white/5 rounded-md"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setEditing(null); setCreating(false); }}>
          <div className="glass-strong rounded-3xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">{creating ? "New Product" : "Edit Product"}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} textarea />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Category" value={editing.category} options={CATEGORIES} onChange={(v) => setEditing({ ...editing, category: v })} />
                <Select label="Accent" value={editing.accent} options={ACCENTS} onChange={(v) => setEditing({ ...editing, accent: v })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Icon (lucide name)" value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} />
                <Field label="Version" value={editing.version} onChange={(v) => setEditing({ ...editing, version: v })} />
                <Field label="Sort order" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_visible} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} /> Visible on site
              </label>
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

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-cyan/40 min-h-[80px]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-cyan/40" />
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-cyan/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
