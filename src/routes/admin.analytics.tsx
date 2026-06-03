import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { adminRevenueTrend, requestsByStatus, topCategories } from "@/data/admin";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics & Reports</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 font-display font-semibold">Revenue Trend</div>
          <div className="h-64"><ResponsiveContainer><AreaChart data={adminRevenueTrend}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="oklch(0.546 0.214 263)" fill="oklch(0.546 0.214 263)" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 font-display font-semibold">Requests by Status</div>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={requestsByStatus} dataKey="value" innerRadius={50} outerRadius={90}>{requestsByStatus.map((e, i) => <Cell key={i} fill={`var(--chart-${(i%5)+1})`} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="mb-3 font-display font-semibold">Top Service Categories</div>
          <div className="h-64"><ResponsiveContainer><BarChart data={topCategories}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="oklch(0.546 0.214 263)" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  ),
});