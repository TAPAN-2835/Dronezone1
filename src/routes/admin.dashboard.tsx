import { createFileRoute } from "@tanstack/react-router";
import { Users, Wrench, Inbox, IndianRupee, TrendingUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { adminStats, adminRevenueTrend, adminRequests } from "@/data/admin";
import { inr } from "@/data/demo";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — DroneZone" }] }),
  component: Dashboard,
});

const cards = [
  { label: "Total Users", value: adminStats.totalUsers.toLocaleString("en-IN"), delta: "+12.5%", icon: Users },
  { label: "Service Providers", value: adminStats.providers, delta: "+8.4%", icon: Wrench },
  { label: "Total Requests", value: adminStats.requests.toLocaleString("en-IN"), delta: "+15.3%", icon: Inbox },
  { label: "Total Revenue", value: inr(adminStats.revenue), delta: "+18.7%", icon: IndianRupee },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back — here's what's happening across the platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</div>
                <div className="mt-2 font-display text-2xl font-bold">{c.value}</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-success"><TrendingUp className="h-3 w-3" />{c.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="mb-4 font-display text-base font-semibold">Requests & Revenue Overview</div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={adminRevenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.546 0.214 263)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.546 0.214 263)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.546 0.214 263)" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 font-display text-base font-semibold">Recent Requests</div>
          <div className="space-y-3">
            {adminRequests.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">{r.id}</div>
                  <div className="text-xs text-muted-foreground">{r.user}</div>
                </div>
                <span className="text-xs text-muted-foreground">{r.issue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Active Jobs", value: adminStats.active },
          { label: "Completed Today", value: adminStats.completedToday },
          { label: "Avg. Completion", value: adminStats.avgCompletion },
          { label: "Open Disputes", value: adminStats.openDisputes },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}