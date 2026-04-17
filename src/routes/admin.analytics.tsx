import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

type Period = "today" | "week" | "month" | "year";

function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrder: 0,
    thisPeriodOrders: 0,
    thisPeriodRevenue: 0,
    lastPeriodOrders: 0,
    lastPeriodRevenue: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = (period: Period) => {
    const now = new Date();
    let start = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    switch (period) {
      case "today":
        start.setHours(0, 0, 0, 0);
        prevEnd.setDate(prevEnd.getDate() - 1);
        prevStart.setDate(prevStart.getDate() - 1);
        prevStart.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        prevStart.setDate(start.getDate() - 14);
        prevEnd.setDate(prevEnd.getDate() - 8);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        prevStart.setMonth(prevStart.getMonth() - 2);
        prevEnd.setMonth(prevEnd.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        prevStart.setFullYear(prevStart.getFullYear() - 2);
        prevEnd.setFullYear(prevEnd.getFullYear() - 1);
        break;
    }

    return {
      start: start.toISOString(),
      prevStart: prevStart.toISOString(),
      prevEnd: prevEnd.toISOString(),
    };
  };

  const load = async () => {
    setLoading(true);
    try {
      const ranges = getDateRange(period);
      
      const [thisPeriodRes, lastPeriodRes, allOrdersRes] = await Promise.all([
        supabase.from("orders").select("*").gte("created_at", ranges.start),
        supabase.from("orders").select("*").gte("created_at", ranges.prevStart).lt("created_at", ranges.prevEnd),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      const thisOrders = thisPeriodRes.data ?? [];
      const lastOrders = lastPeriodRes.data ?? [];

      const thisRevenue = thisOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const lastRevenue = lastOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      setStats({
        totalOrders: thisOrders.length,
        totalRevenue: thisRevenue,
        completedOrders: thisOrders.filter((o: any) => o.status === "delivered").length,
        pendingOrders: thisOrders.filter((o: any) => o.status === "pending").length,
        averageOrder: thisOrders.length > 0 ? thisRevenue / thisOrders.length : 0,
        thisPeriodOrders: thisOrders.length,
        thisPeriodRevenue: thisRevenue,
        lastPeriodOrders: lastOrders.length,
        lastPeriodRevenue: lastRevenue,
      });

      setOrders(allOrdersRes.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period]);

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const orderChange = getChange(stats.thisPeriodOrders, stats.lastPeriodOrders);
  const revenueChange = getChange(stats.thisPeriodRevenue, stats.lastPeriodRevenue);

  const periods: { id: Period; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  const statCards = [
    {
      label: `Orders (${period})`,
      value: stats.thisPeriodOrders,
      change: orderChange,
      icon: ShoppingCart,
      color: "text-cyan bg-cyan/15",
    },
    {
      label: `Revenue (${period})`,
      value: `₹${stats.thisPeriodRevenue.toLocaleString()}`,
      change: revenueChange,
      icon: DollarSign,
      color: "text-green-400 bg-green-400/15",
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders,
      icon: Users,
      color: "text-accent bg-accent/15",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Calendar,
      color: "text-yellow-400 bg-yellow-400/15",
    },
    {
      label: "Average Order Value",
      value: `₹${stats.averageOrder.toFixed(0)}`,
      icon: TrendingUp,
      color: "text-purple-400 bg-purple-400/15",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-pink-400 bg-pink-400/15",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Sales & Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your sales and revenue</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              "px-4 h-10 rounded-xl text-sm whitespace-nowrap transition-colors",
              period === p.id ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("h-11 w-11 rounded-xl grid place-items-center", card.color)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  {"change" in card && card.change !== 0 && (
                    <div className={cn("flex items-center gap-1 text-xs", card.change > 0 ? "text-green-400" : "text-destructive")}>
                      {card.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(card.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="mt-3 font-display text-2xl font-extrabold">{card.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold">Recent Orders</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-white/5">
                <tr>
                  <th className="text-left p-3">Order ID</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="p-3 font-mono text-xs">{o.id?.slice(0, 12)}...</td>
                    <td className="p-3">
                      <span className={cn("text-xs px-2 py-1 rounded-md", o.status === "delivered" ? "bg-cyan/15 text-cyan" : o.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-white/5")}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium">₹{o.total_amount}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}