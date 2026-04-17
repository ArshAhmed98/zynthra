import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { bootstrapAdmin, getAdminSetupState } from "@/lib/admin-api";
import { NxButton } from "@/components/site/NxButton";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin/setup")({
  head: () => ({ meta: [{ title: "Admin Setup — Zynthra" }, { name: "robots", content: "noindex" }] }),
  component: AdminSetup,
});

function AdminSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<{ adminExists: boolean; passwordSet: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminSetupState().then(setState).catch(() => setState({ adminExists: false, passwordSet: false }));
  }, []);

  if (authLoading || !state) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.adminExists) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <ShieldCheck className="h-10 w-10 text-cyan mx-auto mb-4" />
          <h1 className="font-display text-2xl font-extrabold">Admin already configured</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            An admin account already exists for this workspace. Ask the existing admin to grant you access.
          </p>
          <Link to="/admin/login" className="block mt-6"><NxButton className="w-full">Go to Admin Login</NxButton></Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <Logo />
          <h1 className="font-display text-2xl font-extrabold mt-6">Sign in first</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            You need to be signed in with the account you want to make the admin. Sign up or log in, then come back to this page.
          </p>
          <Link to="/" className="block mt-6"><NxButton variant="outline" className="w-full">Back to Home</NxButton></Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try {
      await bootstrapAdmin({ data: { password } });
      navigate({ to: "/admin/login" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-20">
      <div className="glass rounded-3xl p-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-cyan" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">Claim Admin Access</h1>
            <p className="text-xs text-muted-foreground">One-time setup for {user.email}</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <PasswordField label="Admin password" value={password} onChange={setPassword} show={show} setShow={setShow} />
          <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} show={show} setShow={setShow} />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <NxButton type="submit" className="w-full" disabled={busy}>
            {busy ? "Setting up…" : "Become Admin"}
          </NxButton>
          <p className="text-[11px] text-muted-foreground text-center">
            This grants you the admin role and sets the admin password. After this, /admin/setup will no longer work.
          </p>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (v: string) => void; show: boolean; setShow: (v: boolean) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass rounded-xl px-4 h-11 pr-11 outline-none focus:ring-2 focus:ring-cyan/40"
          required
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
