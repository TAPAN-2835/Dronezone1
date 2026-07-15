import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, Plus, ArrowUpDown } from "lucide-react";
import { grievances, type GrievanceStatus } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusClass = (s: GrievanceStatus) =>
  s === "Resolved" || s === "Closed"
    ? "bg-success/15 text-success"
    : s === "Open"
      ? "bg-destructive/10 text-destructive"
      : "bg-warning/15 text-[oklch(0.45_0.15_75)]";

const priorityClass = (p: string) =>
  p === "Critical" || p === "High"
    ? "text-destructive"
    : p === "Medium"
      ? "text-warning"
      : "text-muted-foreground";

export const Route = createFileRoute("/admin/grievances")({
  head: () => ({ meta: [{ title: "Grievances — DroneZone Admin" }] }),
  component: GrievancesList,
});

function GrievancesList() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GrievanceStatus>("all");

  const filtered = useMemo(
    () =>
      grievances.filter(
        (g) =>
          (statusFilter === "all" || g.status === statusFilter) &&
          (q === "" ||
            g.id.toLowerCase().includes(q.toLowerCase()) ||
            g.raisedBy.toLowerCase().includes(q.toLowerCase()) ||
            g.issue.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, statusFilter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Grievances</h1>
          <p className="text-sm text-muted-foreground">Manage customer and provider grievances</p>
        </div>
        <Button asChild>
          <Link to="/admin/grievances/new">
            <Plus className="h-4 w-4" /> Raise Grievance
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search grievances…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1 text-xs">
          {(["all", "Open", "In Progress", "Resolved", "Closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Raised By</th>
              <th className="px-4 py-3 text-left">Against</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-t hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-semibold">{g.id}</td>
                <td className="px-4 py-3">
                  {g.raisedBy}
                  <span className="ml-1 text-[10px] uppercase text-muted-foreground">
                    ({g.raisedByType})
                  </span>
                </td>
                <td className="px-4 py-3">{g.against}</td>
                <td className="px-4 py-3 text-muted-foreground">{g.category}</td>
                <td className={`px-4 py-3 text-xs font-semibold ${priorityClass(g.priority)}`}>
                  {g.priority}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(g.status)}`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/grievances/$id" params={{ id: g.id }}>
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {filtered.map((g) => (
          <Link
            key={g.id}
            to="/admin/grievances/$id"
            params={{ id: g.id }}
            className="block rounded-xl border bg-card p-4 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{g.id}</div>
                <div className="text-xs text-muted-foreground">{g.issue}</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(g.status)}`}
              >
                {g.status}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {g.raisedBy} vs {g.against}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
