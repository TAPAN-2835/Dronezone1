import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Inbox,
  Briefcase,
  CheckCircle2,
  IndianRupee,
  Star,
  ArrowUpRight,
  Plus,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, revenueTrend, weeklyJobs, provider, inr, notifications } from "@/data/demo";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DroneZone" }] }),
  component: Dashboard,
});

const stats = [
  { label: "New Requests", value: 8, delta: "+3 today", icon: Inbox, tone: "primary" },
  { label: "Active Jobs", value: 5, delta: "2 in progress", icon: Briefcase, tone: "warning" },
  { label: "Completed (Mo)", value: 23, delta: "+12% vs last", icon: CheckCircle2, tone: "success" },
  { label: "Revenue (Mo)", value: inr(64750), delta: "+9.4%", icon: IndianRupee, tone: "primary" },
] as const;

const toneStyles: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-[oklch(0.45_0.15_75)]",
};

function Dashboard() {
  const newJobs = jobs.filter((j) => j.status === "new").slice(0, 4);
  const upcoming = jobs
    .filter((j) => ["accepted", "en_route", "on_site", "in_progress", "testing"].includes(j.status))
    .slice(0, 4);
  const recentNotifs = notifications.slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Hi, ${provider.name.split(" ")[0]} 👋`}
        description="Here's how your service business is performing today."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/schedule">View schedule</Link>
            </Button>
            <Button asChild>
              <Link to="/app/requests">
                <Plus className="h-4 w-4" /> View requests
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {s.label}
                      </div>
                      <div className="mt-2 font-display text-2xl font-bold sm:text-3xl">{s.value}</div>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles[s.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="h-3 w-3" /> {s.delta}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Revenue overview</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <ArrowUpRight className="h-3 w-3" /> 12.4%
            </div>
          </CardHeader>
          <CardContent className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => inr(Number(v))}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs this week</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">New vs completed</p>
          </CardHeader>
          <CardContent className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyJobs} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="new" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="completed" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Two-column lists */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">New job requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/requests">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {newJobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{j.id}</span>
                    <StatusBadge status={j.status} />
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold">{j.issue}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {j.drone.model} · {j.location}
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/requests/$id" params={{ id: j.id }}>Review</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today's schedule</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-semibold text-foreground">{provider.rating}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((j) => (
              <div key={j.id} className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{j.issue}</div>
                  <div className="truncate text-xs text-muted-foreground">{j.location}</div>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/notifications">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="divide-y">
          {recentNotifs.map((n) => (
            <div key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </div>
              <div className="text-xs text-muted-foreground">{n.time}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
