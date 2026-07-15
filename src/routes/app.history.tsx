import { definePage } from "@/lib/router";
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  Star,
  Clock,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { inr, ratingLabels } from "@/data/demo";
import { getProviderHistory } from "@/lib/api/provider";

export const Page = definePage("/app/history")({
  head: () => ({ meta: [{ title: "Service History â€” DroneZone" }] }),
  loader: () => getProviderHistory(),
  component: History,
});

function getDelay(job: any): { days: number; label: string; color: string; bg: string } {
  if (!job.updated_at || !job.service_requests?.requested_completion_date)
    return { days: 0, label: "On Time", color: "text-success", bg: "bg-success/15" };
  const completed = new Date(job.updated_at);
  const requested = new Date(job.service_requests?.requested_completion_date);
  const diffMs = completed.getTime() - requested.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / 86400000));
  if (diffDays === 0)
    return { days: 0, label: "On Time", color: "text-success", bg: "bg-success/15" };
  if (diffDays === 1)
    return { days: 1, label: "1 Day Delay", color: "text-destructive", bg: "bg-destructive/10" };
  return {
    days: diffDays,
    label: `${diffDays} Days Delay`,
    color: "text-destructive",
    bg: "bg-destructive/30",
  };
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}

function History() {
  const { jobs } = Page.useLoaderData();
  const [q, setQ] = useState("");

  const completed = useMemo(
    () =>
      jobs
        .filter(
          (j: any) =>
            j.status === "completed" || j.status === "cancelled" || j.status === "rejected",
        )
        .filter(
          (j: any) =>
            q === "" ||
            j.service_requests?.request_number?.toLowerCase().includes(q.toLowerCase()) ||
            j.service_requests?.title?.toLowerCase().includes(q.toLowerCase()) ||
            j.service_requests?.users?.first_name?.toLowerCase().includes(q.toLowerCase()),
        ),
    [jobs, q],
  );

  const totalRevenue = completed.reduce(
    (s: number, j: any) => s + Number(j.estimated_cost ?? 0),
    0,
  );
  const avg = completed.length ? Math.round(totalRevenue / completed.length) : 0;

  const onTimeCount = completed.filter((j: any) => getDelay(j).days === 0).length;
  const onTimeRate = completed.length ? Math.round((onTimeCount / completed.length) * 100) : 0;

  const avgRating =
    completed.filter((j: any) => j.customerRating).length > 0
      ? (
          completed.reduce((s: number, j: any) => s + (j.customerRating ?? 0), 0) /
          completed.filter((j: any) => j.customerRating).length
        ).toFixed(1)
      : "â€”";

  return (
    <>
      <PageHeader
        title="Service History"
        description="Every completed visit, invoice, and customer record."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={CheckCircle2}
          label="Completed jobs"
          value={String(completed.length)}
          tone="success"
        />
        <Stat
          icon={IndianRupee}
          label="Lifetime revenue"
          value={inr(totalRevenue)}
          tone="primary"
        />
        <Stat icon={Star} label="Avg rating" value={`${avgRating} / 5`} tone="success" />
        <Stat
          icon={Timer}
          label="On-time rate"
          value={`${onTimeRate}%`}
          tone={onTimeRate >= 80 ? "success" : "danger"}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recordsâ€¦"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              All time
            </Button>
            <Button variant="outline" size="sm">
              All cities
            </Button>
          </div>
        </div>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Job</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Customer Rating</th>
                <th className="px-4 py-3 text-left font-medium">Timeline</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {completed.map((j: any) => {
                const delay = getDelay(j);
                return (
                  <tr key={j.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.service_requests?.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {j.service_requests?.request_number} Â· {j.service_requests?.drones?.model}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {j.service_requests?.users?.first_name}{" "}
                        {j.service_requests?.users?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {j.service_requests?.addresses?.city}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(j.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3">
                      {j.customerRating ? (
                        <div className="space-y-0.5">
                          <RatingStars rating={j.customerRating} />
                          <div className="text-xs font-medium text-muted-foreground">
                            {j.customerRatingLabel}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No rating</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${delay.bg} ${delay.color}`}
                      >
                        {delay.days === 0 ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {delay.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {j.amount ? inr(j.amount) : "â€”"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {completed.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No records match your search.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  tone: "primary" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "danger"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
