import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, KeyRound, BarChart3, CreditCard, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Dashboard — Zynthra" }] }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "My Products", icon: Boxes },
  { to: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  const { signOut, user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex pt-24">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 px-4 py-6 fixed left-0 top-20 bottom-0 bg-background/60 backdrop-blur-xl">
        <div className="px-2 mb-6"><Logo /></div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-colors",
                active ? "bg-white/8 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
          <div className="px-3 text-xs text-muted-foreground truncate">{user?.email}</div>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 lg:ml-64 px-4 sm:px-8 pb-20">
        <Outlet />
      </div>
    </div>
  );
}
