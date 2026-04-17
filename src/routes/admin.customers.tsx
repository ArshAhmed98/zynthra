import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { listCustomers, deleteCustomer } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

type Customer = {
  id: string;
  user_id: string;
  display_name: string | null;
  company: string | null;
  plan: string | null;
  email: string;
  created_at: string;
};

function AdminCustomers() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCustomers();
      setItems(res.customers as Customer[]);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (userId: string) => {
    if (!confirm("Permanently delete this user account? This removes their auth account and all related data.")) return;
    await deleteCustomer({ data: { userId } });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Customers</h1>
          <p className="text-muted-foreground mt-1">{items.length} signed-up accounts</p>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-white/5">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="p-3 font-medium">{c.email}</td>
                  <td className="p-3 text-muted-foreground">{c.display_name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{c.company ?? "—"}</td>
                  <td className="p-3"><span className="text-xs px-2 py-1 rounded-md bg-cyan/15 text-cyan">{c.plan ?? "starter"}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(c.user_id)} className="p-2 hover:bg-destructive/15 rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
