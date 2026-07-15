import { definePage, Link, useLoaderData } from "@/lib/router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJobAgeDays } from "@/lib/job-aging";
import { getAdminJobs } from "@/lib/api/admin";

export const Page = definePage("/admin/jobs")({
  head: () => ({ meta: [{ title: "Jobs â€” DroneZone Admin" }] }),
  loader: () => getAdminJobs(),
  component: AdminJobs,
});

type SortKey = "date" | "status" | "aging";
type AgeFilter = "all" | "fresh" | "moderate" | "stale" | "critical";

function AdminJobs() {
  const { jobs: rawJobs } = useLoaderData({ from: "/admin/jobs" });

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [sort, setSort] = useState<SortKey>("date");

  const filtered = useMemo(() => {
    let list = rawJobs.filter((j: any) => {
      const cName = `${j.service_requests?.customer?.first_name} ${j.service_requests?.customer?.last_name}`;
      const pName = `${j.provider?.first_name} ${j.provider?.last_name}`;
      const issue = j.service_requests?.service_categories?.name || "";
      return (
        (statusFilter === "all" || j.status === statusFilter) &&
        (q === "" ||
          j.id.toLowerCase().includes(q.toLowerCase()) ||
          cName.toLowerCase().includes(q.toLowerCase()) ||
          issue.toLowerCase().includes(q.toLowerCase()) ||
          pName.toLowerCase().includes(q.toLowerCase()))
      );
    });

    if (ageFilter !== "all") {
      list = list.filter((j: any) => {
        const days = getJobAgeDays(j.created_at);
        if (ageFilter === "fresh") return days <= 2;
        if (ageFilter === "moderate") return days > 2 && days <= 7;
        if (ageFilter === "stale") return days > 7 && days <= 14;
        return days > 14;
      });
    }

    return [...list].sort((a: any, b: any) => {
      if (sort === "aging") return getJobAgeDays(b.created_at) - getJobAgeDays(a.created_at);
      if (sort === "status") return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rawJobs, q, statusFilter, ageFilter, sort]);

  const statuses = ["all", ...new Set(rawJobs.map((j: any) => j.status))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Jobs Master</h1>
        <p className="text-sm text-muted-foreground">
          Central jobs management â€” search, filter, and review all jobs
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer, provider, issueâ€¦"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-lg border bg-card px-3 text-sm"
          >
            <option value="date">Sort: Date</option>
            <option value="aging">Sort: Aging</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground self-center">Status:</span>
        {statuses.map((s: unknown) => {
          const str = s as string;
          return (
            <button
              key={str}
              onClick={() => setStatusFilter(str)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusFilter === str ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
            >
              {str}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground self-center">Aging:</span>
        {(["all", "fresh", "moderate", "stale", "critical"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAgeFilter(a)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${ageFilter === a ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
          >
            {a === "all" ? "All" : a}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Job ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Issue</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aging</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j: any) => (
              <tr key={j.id} className="border-t hover:bg-muted/20">
                <td className="px-4 py-3 font-semibold">
                  <span className="truncate block w-24">{j.id.split("-")[0]}</span>
                </td>
                <td className="px-4 py-3">
                  {j.service_requests?.customer?.first_name}{" "}
                  {j.service_requests?.customer?.last_name}
                </td>
                <td className="px-4 py-3">
                  {j.provider?.first_name} {j.provider?.last_name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {j.service_requests?.service_categories?.name}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {j.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <JobAgeBadge createdAt={j.created_at} />
                </td>
                <td className="px-4 py-3 text-xs">{j.paymentStatus || "Paid"}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/jobs/$id" params={{ id: j.id }}>
                      View Details
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {filtered.map((j: any) => (
          <Link
            key={j.id}
            to="/admin/jobs/$id"
            params={{ id: j.id }}
            className="block rounded-xl border bg-card p-4"
          >
            <div className="flex justify-between gap-2">
              <div className="font-semibold">{j.id.split("-")[0]}</div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {j.status}
              </span>
            </div>
            <div className="mt-1 text-sm">{j.service_requests?.service_categories?.name}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {j.service_requests?.customer?.first_name} {j.service_requests?.customer?.last_name}
              </span>
              <JobAgeBadge createdAt={j.created_at} />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No jobs match your filters.
        </div>
      )}
    </div>
  );
}
