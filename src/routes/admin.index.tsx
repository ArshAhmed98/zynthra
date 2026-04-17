import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, DollarSign, Users, Inbox, MessagesSquare, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, tiers: 0, customers: 0, contacts: 0, chats: 0, videos: 0 });

  useEffect(() => {
    (async () => {
      const [p, t, c, ct, ch, v] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("pricing_tiers").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("*", { count: "exact", head: true }),
        supabase.from("site_videos").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        products: p.count ?? 0,
        tiers: t.count ?? 0,
        customers: c.count ?? 0,
        contacts: ct.count ?? 0,
        chats: ch.count ?? 0,
        videos: v.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { to: "/admin/products", label: "Products", value: stats.products, icon: Boxes, color: "text-cyan bg-cyan/15" },
    { to: "/admin/pricing", label: "Pricing tiers", value: stats.tiers, icon: DollarSign, color: "text-accent bg-accent/15" },
    { to: "/admin/customers", label: "Customers", value: stats.customers, icon: Users, color: "text-cyan bg-cyan/15" },
    { to: "/admin/submissions", label: "Submissions", value: stats.contacts, icon: Inbox, color: "text-destructive bg-destructive/15" },
    { to: "/admin/chats", label: "Conversations", value: stats.chats, icon: MessagesSquare, color: "text-accent bg-accent/15" },
    { to: "/admin/videos", label: "Videos", value: stats.videos, icon: Video, color: "text-cyan bg-cyan/15" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-extrabold">Admin Overview</h1>
      <p className="text-muted-foreground mt-1">Manage everything that powers the Zynthra site.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="glass rounded-2xl p-6 hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <div className={`h-11 w-11 rounded-xl grid place-items-center ${c.color}`}><c.icon className="h-5 w-5" /></div>
              <span className="font-display text-3xl font-extrabold">{c.value}</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
