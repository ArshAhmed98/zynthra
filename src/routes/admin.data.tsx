import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, CheckCircle, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/data")({ component: AdminData });

type Tab = "orders" | "users" | "subscribers" | "login_history";

function AdminData() {
  const [tab, setTab] = useState<Tab>("users");
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ordersRes, profilesRes, subsRes, contactsRes, demosRes, loginsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false }),
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_login_attempts").select("*").order("attempted_at", { ascending: false }).limit(100),
      ]);
      setOrders(ordersRes.data ?? []);
      setProfiles(profilesRes.data ?? []);
      setSubscribers(subsRes.data ?? []);
      setContacts(contactsRes.data ?? []);
      setDemoRequests(demosRes.data ?? []);
      setLoginAttempts(loginsRes.data ?? []);

      const userIds = [...new Set([...profilesRes.data?.map(p => p.user_id).filter(Boolean) ?? []])];
      if (userIds.length > 0) {
        const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
        const emailMap = new Map((usersData?.users ?? []).map(u => [u.id, u.email]));
        setProfiles(prev => prev.map(p => ({ ...p, email: emailMap.get(p.user_id) ?? "—" })));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "users", label: "Users", count: profiles.length },
    { id: "orders", label: "Orders", count: orders.length },
    { id: "subscribers", label: "Subscribers", count: subscribers.length + contacts.length + demoRequests.length },
    { id: "login_history", label: "Login", count: loginAttempts.length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Data & Analytics</h1>
          <p className="text-muted-foreground mt-1">All user data, orders, and activity</p>
        </div>
        <button onClick={() => load()} className="px-3 h-9 text-sm glass rounded-lg flex items-center gap-2">
          <Download className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 h-10 rounded-xl text-sm whitespace-nowrap transition-colors",
              tab === t.id ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} <span className="text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {tab === "users" && (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-white/5">
                  <tr>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Company</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-white/5">
                      <td className="p-3 text-cyan">{p.email}</td>
                      <td className="p-3">{p.display_name ?? "—"}</td>
                      <td className="p-3">{p.company ?? "—"}</td>
                      <td className="p-3"><span className="text-xs px-2 py-1 rounded-md bg-white/5">{p.plan ?? "free"}</span></td>
                      <td className="p-3"><span className="text-xs px-2 py-1 rounded-md bg-cyan/15 text-cyan">{p.role ?? "user"}</span></td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "orders" && (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-white/5">
                  <tr>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Currency</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-white/5">
                      <td className="p-3 font-mono text-xs">{o.id?.slice(0, 12)}...</td>
                      <td className="p-3">
                        <span className={cn("text-xs px-2 py-1 rounded-md", o.status === "delivered" ? "bg-cyan/15 text-cyan" : o.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-white/5")}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 font-medium">${o.total_amount}</td>
                      <td className="p-3">{o.currency}</td>
                      <td className="p-3 text-xs max-w-xs truncate">{JSON.stringify(o.items)}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "subscribers" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold mb-3">Newsletter Subscribers ({subscribers.length})</h3>
                {subscribers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-t border-white/5">
                    <span className="text-cyan">{s.email}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {subscribers.length === 0 && <p className="text-muted-foreground">No subscribers yet</p>}
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold mb-3">Contact Form ({contacts.length})</h3>
                {contacts.map((c) => (
                  <div key={c.id} className="py-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-cyan text-sm">{c.email}</div>
                    <p className="text-muted-foreground text-sm">{c.message}</p>
                  </div>
                ))}
                {contacts.length === 0 && <p className="text-muted-foreground">No contacts yet</p>}
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold mb-3">Demo Requests ({demoRequests.length})</h3>
                {demoRequests.map((d) => (
                  <div key={d.id} className="py-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-cyan text-sm">{d.email}</div>
                    {d.company && <div className="text-muted-foreground text-sm">{d.company}</div>}
                    {d.use_case && <p className="text-muted-foreground text-sm">{d.use_case}</p>}
                  </div>
                ))}
                {demoRequests.length === 0 && <p className="text-muted-foreground">No demo requests yet</p>}
              </div>
            </div>
          )}

          {tab === "login_history" && (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-white/5">
                  <tr>
                    <th className="text-left p-3">User ID</th>
                    <th className="text-left p-3">Result</th>
                    <th className="text-left p-3">IP Address</th>
                    <th className="text-left p-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loginAttempts.map((a) => (
                    <tr key={a.id} className="border-t border-white/5">
                      <td className="p-3 font-mono text-xs">{a.user_id?.slice(0, 8) ?? "—"}...</td>
                      <td className="p-3">
                        {a.success ? (
                          <span className="inline-flex items-center gap-1 text-cyan text-xs">
                            <CheckCircle className="h-3 w-3" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive text-xs">
                            <Clock className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs font-mono">{a.ip_address ?? "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(a.attempted_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {loginAttempts.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No login attempts</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}