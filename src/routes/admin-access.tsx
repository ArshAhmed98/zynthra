import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { NxButton } from "@/components/site/NxButton";

const SESSION_KEY = "nx_admin_unlocked_until";
const SECRET_CODE = "Farcry6ahmed@988631";

export const Route = createFileRoute("/admin-access")({
  head: () => ({ meta: [{ title: "Admin Access — Zynthra" }, { name: "robots", content: "noindex" }] }),
  component: AdminAccess,
});

function AdminAccess() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== SECRET_CODE) {
      setErr("Invalid code");
      return;
    }
    const until = Date.now() + 4 * 60 * 60 * 1000;
    sessionStorage.setItem(SESSION_KEY, String(until));
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-20">
      <div className="glass rounded-3xl p-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-cyan" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">Admin Access</h1>
            <p className="text-xs text-muted-foreground">Enter secret code</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Code</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full glass rounded-xl px-4 h-11 pr-11 outline-none focus:ring-2 focus:ring-cyan/40"
                required
                autoFocus
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <NxButton type="submit" className="w-full">Access Admin</NxButton>
        </form>
      </div>
    </div>
  );
}