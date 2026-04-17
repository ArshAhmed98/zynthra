import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Zap, Users, Plus, BookOpen, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NxButton } from "@/components/site/NxButton";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8 border-gradient">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Welcome back, <span className="text-gradient">{name}</span> 👋</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening across your Zynthra workspace.</p>
          </div>
          <div className="flex gap-2">
            <NxButton variant="ghost" size="md"><BookOpen className="h-4 w-4" /> Docs</NxButton>
            <NxButton size="md"><Plus className="h-4 w-4" /> New Agent</NxButton>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Activity} label="API calls today" value="12,340" trend="+8.2%" />
        <Stat icon={Zap} label="Active agents" value="4" trend="+1" />
        <Stat icon={Users} label="Conversations" value="3,201" trend="+12%" />
        <Stat icon={TrendingUp} label="Avg latency" value="412ms" trend="-22ms" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-display font-bold mb-4">Usage this month</h3>
          <div className="h-48 rounded-xl bg-gradient-to-br from-cyan/10 via-accent/10 to-destructive/10 grid place-items-center text-xs text-muted-foreground font-mono">
            chart placeholder
          </div>
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="font-display font-bold mb-2">Quick actions</h3>
          <NxButton variant="ghost" size="md" className="w-full justify-start"><KeyRound className="h-4 w-4" /> Generate API key</NxButton>
          <NxButton variant="ghost" size="md" className="w-full justify-start"><Plus className="h-4 w-4" /> Create agent</NxButton>
          <NxButton variant="ghost" size="md" className="w-full justify-start"><BookOpen className="h-4 w-4" /> Read quickstart</NxButton>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, trend }: { icon: typeof Activity; label: string; value: string; trend: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-cyan/15 text-cyan grid place-items-center"><Icon className="h-4 w-4" /></div>
        <span className="text-xs font-mono text-cyan">{trend}</span>
      </div>
      <div className="mt-4 font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
