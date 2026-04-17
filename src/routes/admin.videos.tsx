import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/admin/videos")({ component: AdminVideos });

type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  section: string;
  sort_order: number;
  is_visible: boolean;
};

function AdminVideos() {
  const [items, setItems] = useState<Video[]>([]);
  const [editing, setEditing] = useState<Video | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("site_videos").select("*").order("sort_order");
    setItems((data ?? []) as Video[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (v: Video) => {
    if (creating) await supabase.from("site_videos").insert({ ...v, id: undefined });
    else await supabase.from("site_videos").update(v).eq("id", v.id);
    setEditing(null); setCreating(false); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("site_videos").delete().eq("id", id);
    load();
  };
  const toggle = async (v: Video) => {
    await supabase.from("site_videos").update({ is_visible: !v.is_visible }).eq("id", v.id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Videos</h1>
          <p className="text-muted-foreground mt-1">Demo & marketing videos shown on the site</p>
        </div>
        <NxButton onClick={() => { setCreating(true); setEditing({ id: "", title: "", description: "", video_url: "", thumbnail_url: "", section: "demo", sort_order: items.length, is_visible: true }); }}>
          <Plus className="h-4 w-4" /> New Video
        </NxButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => (
          <div key={v.id} className="glass rounded-2xl overflow-hidden">
            {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} className="aspect-video w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm">{v.title}</h3>
                <button onClick={() => toggle(v)} className={v.is_visible ? "text-cyan" : "text-muted-foreground"}>
                  {v.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5">{v.section}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(v)} className="p-1.5 hover:bg-white/5 rounded-md"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(v.id)} className="p-1.5 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No videos yet. Click "New Video" to add one.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setEditing(null); setCreating(false); }}>
          <div className="glass-strong rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">{creating ? "New Video" : "Edit Video"}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} textarea />
              <Field label="Video URL (YouTube embed, MP4, etc.)" value={editing.video_url} onChange={(v) => setEditing({ ...editing, video_url: v })} />
              <Field label="Thumbnail URL" value={editing.thumbnail_url ?? ""} onChange={(v) => setEditing({ ...editing, thumbnail_url: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section" value={editing.section} onChange={(v) => setEditing({ ...editing, section: v })} />
                <Field label="Sort order" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_visible} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} /> Visible on site</label>
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
