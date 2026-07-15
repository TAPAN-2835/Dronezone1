import { definePage } from "@/lib/router";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getAdminAnalytics } from "@/lib/api/platform";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
export const Page = definePage("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — DroneZone Admin" }] }),
  loader: () => getAdminAnalytics(),
  component: Analytics,
});
function Analytics() {
  const a = Page.useLoaderData<Awaited<ReturnType<typeof getAdminAnalytics>>>();
  const cards = [
    ["Users", a.users],
    ["Customers", a.customers],
    ["Providers", a.providers],
    ["Requests", a.requests],
    ["Completed", a.completed],
    ["Pending", a.pending],
    [
      "Revenue",
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(a.revenue),
    ],
    ["Avg rating", a.average_rating],
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics & Reports</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart title="Monthly request growth">
          <ResponsiveContainer>
            <LineChart data={a.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Request status">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={a.request_status}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                label
              >
                {a.request_status.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Chart>
        <BarPanel title="Top categories" data={a.categories} />
        <BarPanel title="Top cities" data={a.cities} />
        <BarPanel title="Top states" data={a.regions} />
        <BarPanel title="Most serviced drones" data={a.models} />
      </div>
      <div className="rounded-xl border bg-card p-4 text-sm">
        <b>Average completion:</b> {a.average_completion_days} days
      </div>
    </div>
  );
}
function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 font-semibold">{title}</div>
      <div className="h-64">{children}</div>
    </div>
  );
}
function BarPanel({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Chart title={title}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Chart>
  );
}
