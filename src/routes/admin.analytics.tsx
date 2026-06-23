import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminRevenueTrend, requestsByStatus, topCategories } from "@/data/admin";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics &amp; Reports</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regional Analytics */}
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="mb-3 font-display font-semibold">Top States by Requests</div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "Karnataka", value: 340 },
                  { name: "Maharashtra", value: 290 },
                  { name: "Delhi", value: 210 },
                  { name: "Telangana", value: 180 },
                ]}
                layout="vertical"
                margin={{ left: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="oklch(0.92 0.012 255)"
                />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.546 0.214 263)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities by Requests */}
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="mb-3 font-display font-semibold">Top Cities by Requests</div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "Bengaluru", value: 210 },
                  { name: "Mumbai", value: 185 },
                  { name: "Hyderabad", value: 140 },
                  { name: "Pune", value: 95 },
                  { name: "Delhi", value: 80 },
                ]}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.92 0.012 255)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.65 0.18 160)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Analytics */}
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="mb-3 font-display font-semibold">Provider Status Distribution</div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Verified", value: 245 },
                    { name: "Pending", value: 45 },
                    { name: "In Review", value: 20 },
                    { name: "Rejected", value: 16 },
                  ]}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {requestsByStatus.map((_e, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations Analytics */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 font-display font-semibold">Most Common Issues & Repairs</div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "Propeller Damage", value: 120 },
                  { name: "Battery Degradation", value: 95 },
                  { name: "Motor Failure", value: 65 },
                  { name: "Gimbal Calibration", value: 45 },
                  { name: "GPS Module", value: 30 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.546 0.214 263)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational KPIs */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 font-display font-semibold">Key Performance Indicators</div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="border-l-2 border-primary pl-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Resolution Rate
              </div>
              <div className="mt-1 font-display text-2xl font-bold">92.4%</div>
            </div>
            <div className="border-l-2 border-primary/50 pl-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Avg Resolution Time
              </div>
              <div className="mt-1 font-display text-2xl font-bold">2.4 Days</div>
            </div>
            <div className="border-l-2 border-primary/50 pl-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                First-Time Fix Rate
              </div>
              <div className="mt-1 font-display text-2xl font-bold">85.1%</div>
            </div>
            <div className="border-l-2 border-primary/50 pl-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Provider Growth
              </div>
              <div className="mt-1 font-display text-2xl font-bold">+12% MoM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});
