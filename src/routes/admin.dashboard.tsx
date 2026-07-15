import { definePage, Link } from "@/lib/router";
import { Users, Wrench, Inbox, IndianRupee, AlertTriangle } from "lucide-react";
import { getAdminAnalytics } from "@/lib/api/platform";

const money = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
export const Page = definePage("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — DroneZone" }] }),
  loader: () => getAdminAnalytics(),
  component: Dashboard,
});
function Dashboard() {
  const a = Page.useLoaderData<Awaited<ReturnType<typeof getAdminAnalytics>>>();
  const cards = [
    ["Total Users", a.users, Users],
    ["Service Providers", a.providers, Wrench],
    ["Completed Requests", a.completed, Inbox],
    ["Recorded Revenue", money(a.revenue), IndianRupee],
  ] as const;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live platform operations</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className="flex justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">{label}</div>
                <div className="mt-1 text-2xl font-bold">{value}</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Operational queue
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <K label="Pending" value={a.pending} />
          <K label="Rejected" value={a.rejected} />
          <K label="Avg completion" value={`${a.average_completion_days} days`} />
          <K label="Avg rating" value={a.average_rating} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/requests"
          className="rounded-xl border bg-card p-5 font-semibold hover:bg-muted/30"
        >
          Review service requests →
        </Link>
        <Link
          to="/admin/providers"
          className="rounded-xl border bg-card p-5 font-semibold hover:bg-muted/30"
        >
          Review providers →
        </Link>
        <Link
          to="/admin/analytics"
          className="rounded-xl border bg-card p-5 font-semibold hover:bg-muted/30"
        >
          Open analytics →
        </Link>
      </div>
    </div>
  );
}
function K({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-l-2 border-warning pl-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
