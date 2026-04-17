import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Boxes, DollarSign, Users, Inbox, MessagesSquare, Video, Bot, KeyRound, LogOut, Database, TrendingUp } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const SESSION_KEY = "nx_admin_unlocked_until";
    const until = Number(sessionStorage.getItem(SESSION_KEY) ?? 0);
    if (!until || until < Date.now()) {
      throw redirect({ to: "/admin-access" });
    }
  },
  head: () => ({ meta: [{ title: "Admin — Zynthra" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp, exact: true },
  { to: "/admin/data", label: "Data", icon: Users },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox },
  { to: "/admin/chats", label: "Live Chat", icon: MessagesSquare },
  { to: "/admin/videos", label: "Videos", icon: Video },
  { to: "/admin/chatbot", label: "Chatbot", icon: Bot },
  { to: "/admin/security", label: "Security", icon: KeyRound },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const SESSION_KEY = "nx_admin_unlocked_until";

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 px-4 py-6 fixed left-0 top-0 bottom-0 bg-background/80 backdrop-blur-xl z-40">
        <div className="px-2 mb-6 flex items-center gap-2">
          <Logo />
        </div>
        <div className="px-2 mb-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-cyan/15 text-cyan">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
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
          <button
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Lock Admin
          </button>
        </div>
      </aside>
      <div className="flex-1 lg:ml-64 px-4 sm:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
