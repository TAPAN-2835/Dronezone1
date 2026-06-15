import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, MapPin, Clock, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { jobs, type JobStatus } from "@/data/demo";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/requests")({
  head: () => ({ meta: [{ title: "Job Requests — DroneZone" }] }),
  component: Requests,
});

const tabs: {
  id: "all" | "new" | "accepted" | "rejected";
  label: string;
  filter: (s: JobStatus) => boolean;
}[] = [
  { id: "all", label: "All", filter: () => true },
  { id: "new", label: "New", filter: (s) => s === "new" },
  {
    id: "accepted",
    label: "Accepted",
    filter: (s) => ["accepted", "in_progress", "en_route", "on_site", "testing"].includes(s),
  },
  { id: "rejected", label: "Rejected", filter: (s) => s === "rejected" || s === "cancelled" },
];

function Requests() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const [q, setQ] = useState("");

  const filter = tabs.find((t) => t.id === tab)!.filter;
  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          filter(j.status) &&
          (q === "" ||
            j.id.toLowerCase().includes(q.toLowerCase()) ||
            j.issue.toLowerCase().includes(q.toLowerCase()) ||
            j.customer.name.toLowerCase().includes(q.toLowerCase()) ||
            j.location.toLowerCase().includes(q.toLowerCase())),
      ),
    [tab, q, filter],
  );

  const counts = {
    all: jobs.length,
    new: jobs.filter((j) => j.status === "new").length,
    accepted: jobs.filter((j) =>
      ["accepted", "in_progress", "en_route", "on_site", "testing"].includes(j.status),
    ).length,
    rejected: jobs.filter((j) => j.status === "rejected" || j.status === "cancelled").length,
  } as const;

  return (
    <>
      <PageHeader
        title="Job Requests"
        description="Review incoming requests and decide which jobs to accept."
        actions={
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer, issue or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
        <div className="flex overflow-x-auto rounded-lg border bg-card p-1 text-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[t.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {filtered.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{j.id}</span>
                      <StatusBadge status={j.status} />
                      <JobAgeBadge createdAt={j.createdAt} />
                    </div>
                    <h3 className="mt-1 truncate font-display text-base font-semibold">
                      {j.issue}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {j.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(j.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="mt-3 text-sm">
                      <span className="font-medium">{j.customer.name}</span>
                      <span className="text-muted-foreground"> · {j.drone.model}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  {j.status === "new" ? (
                    <Button asChild size="sm" className="flex-1 sm:flex-none">
                      <Link to="/app/requests/$id" params={{ id: j.id }}>
                        Review request
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
                      <Link to="/app/jobs/$id" params={{ id: j.id }}>
                        View details
                      </Link>
                    </Button>
                  )}
                  {j.status === "new" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => toast.success(`${j.id} rejected`)}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => toast.success(`${j.id} accepted`)}>
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No requests match your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
