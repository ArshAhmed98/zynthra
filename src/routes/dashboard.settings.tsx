import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name,company").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) { setName(data.display_name ?? ""); setCompany(data.company ?? ""); }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ display_name: name, company }).eq("user_id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const changePw = async () => {
    if (pw.length < 6) return toast.error("Min 6 chars");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("Password updated");
  };

  const input = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan/50";

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Settings</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-display font-bold">Profile</h3>
        <input className={input} placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={input} placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className={input} value={user?.email ?? ""} disabled />
        <NxButton onClick={save} disabled={loading}>{loading ? "Saving..." : "Save changes"}</NxButton>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-display font-bold">Change password</h3>
        <input className={input} type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <NxButton onClick={changePw}>Update password</NxButton>
      </div>
    </div>
  );
}
