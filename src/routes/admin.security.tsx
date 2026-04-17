import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/admin/security")({ component: AdminSecurity });

type Attempt = { id: string; user_id: string | null; success: boolean; attempted_at: string; ip_address: string | null };

function AdminSecurity() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("admin_login_attempts")
        .select("*")
        .order("attempted_at", { ascending: false })
        .limit(100);
      setAttempts(data ?? []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) return setMsg({ type: "err", text: "New password must be at least 8 characters." });
    if (next !== confirm) return setMsg({ type: "err", text: "Passwords don't match." });
    setMsg({ type: "ok", text: "Password change unavailable in this mode." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-cyan" />
        <h1 className="font-display text-3xl font-extrabold">Security</h1>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Change admin password</h2>
        <form onSubmit={change} className="space-y-3 max-w-md">
          <PasswordRow label="Current password" value={current} onChange={setCurrent} show={show} setShow={setShow} />
          <PasswordRow label="New password" value={next} onChange={setNext} show={show} setShow={setShow} />
          <PasswordRow label="Confirm new password" value={confirm} onChange={setConfirm} show={show} setShow={setShow} />
          {msg && <p className={`text-xs ${msg.type === "ok" ? "text-cyan" : "text-destructive"}`}>{msg.text}</p>}
          <NxButton type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
          </NxButton>
        </form>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Recent login attempts</h2>
        {loading ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="text-left p-2">When</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t border-white/5">
                    <td className="p-2 text-muted-foreground">{new Date(a.attempted_at).toLocaleString()}</td>
                    <td className="p-2 font-mono text-xs">{a.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="p-2">
                      {a.success ? (
                        <span className="inline-flex items-center gap-1 text-cyan text-xs"><CheckCircle2 className="h-3 w-3" /> Success</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive text-xs"><XCircle className="h-3 w-3" /> Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {attempts.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No attempts logged.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PasswordRow({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (v: string) => void; show: boolean; setShow: (v: boolean) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl px-3 h-10 pr-10 outline-none focus:ring-2 focus:ring-cyan/40" required />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
