import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Check, Circle, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { getProviderActiveJobs, updateAssignmentStatus } from "@/lib/api/provider.server";
import { toast } from "sonner";

export const Route = createFileRoute("/app/active")({
  head: () => ({ meta: [{ title: "Active Jobs — DroneZone" }] }),
  loader: () => getProviderActiveJobs(),
  component: Active,
});

const activeStages = [
  { key: "accepted", label: "Job Accepted" },
  { key: "in_progress", label: "Service in Progress" },
  { key: "on_hold", label: "On Hold (Awaiting Parts)" },
  { key: "completed", label: "Completed" }
];

function Active() {
  const { jobs: active } = Route.useLoaderData();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(active[0]?.id);
  const selected = active.find((j: any) => j.id === selectedId) ?? active[0];

  if (!selected) {
    return (
      <>
        <PageHeader title="Active Jobs" description="No active jobs right now." />
      </>
    );
  }

  const currentIdx = activeStages.findIndex((s) => s.key === selected.status);

  return (
    <>
      <PageHeader
        title="Active Jobs"
        description="Track ongoing repairs and update workflow status."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/jobs/$id" params={{ id: selected.id }}>
              View full details <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">In progress · {active.length}</CardTitle>
          </CardHeader>
            <CardContent className="divide-y p-0">
              {active.map((j: any) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={`w-full px-4 py-3 text-left transition ${
                    selectedId === j.id ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{j.service_requests?.request_number}</span>
                    <StatusBadge status={j.status} />
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold">{j.service_requests?.title}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {j.service_requests?.users?.first_name} {j.service_requests?.users?.last_name}
                  </div>
                  <JobAgeBadge createdAt={j.created_at} className="mt-1.5" />
                </button>
              ))}
            </CardContent>
          </Card>
  
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{selected.service_requests?.request_number}</span>
                      <StatusBadge status={selected.status} />
                      <JobAgeBadge createdAt={selected.created_at} />
                    </div>
                    <h2 className="mt-1 font-display text-xl font-semibold">{selected.service_requests?.title}</h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {selected.service_requests?.addresses?.city}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${selected.service_requests?.users?.phone}`}>
                        <Phone className="h-4 w-4" /> Call
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/app/jobs/$id" params={{ id: selected.id }}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workflow timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l-2 border-border pl-6">
                {activeStages.map((s, i) => {
                  const done = i < currentIdx || currentIdx === activeStages.length - 1; // if completed, all are done
                  const current = i === currentIdx;
                  return (
                    <li key={s.key} className="relative">
                      <span
                        className={`absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          done
                            ? "border-success bg-success text-success-foreground"
                            : current
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : current ? (
                          <motion.span
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-current"
                          />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`text-sm font-semibold ${done || current ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {done ? "Completed" : current ? "Current stage" : "Pending"}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                {selected.status === "accepted" && (
                  <Button onClick={() => {
                    toast.promise(updateAssignmentStatus({ data: { assignmentId: selected.id, newStatus: "in_progress" }}), {
                      loading: "Updating...",
                      success: "Started service!",
                      error: "Failed to update",
                      finally: () => router.invalidate()
                    })
                  }}>
                    Start Service (In Progress)
                  </Button>
                )}
                {selected.status === "in_progress" && (
                  <>
                    <Button onClick={() => {
                      toast.promise(updateAssignmentStatus({ data: { assignmentId: selected.id, newStatus: "completed" }}), {
                        loading: "Marking completed...",
                        success: "Job marked as completed!",
                        error: "Failed to update",
                        finally: () => router.invalidate()
                      })
                    }}>
                      <Check className="h-4 w-4 mr-2" /> Mark as Completed
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast.promise(updateAssignmentStatus({ data: { assignmentId: selected.id, newStatus: "on_hold" }}), {
                        loading: "Updating...",
                        success: "Put job on hold",
                        error: "Failed to update",
                        finally: () => router.invalidate()
                      })
                    }}>
                      Put On Hold
                    </Button>
                  </>
                )}
                {selected.status === "on_hold" && (
                  <Button onClick={() => {
                    toast.promise(updateAssignmentStatus({ data: { assignmentId: selected.id, newStatus: "in_progress" }}), {
                      loading: "Resuming...",
                      success: "Job resumed!",
                      error: "Failed to update",
                      finally: () => router.invalidate()
                    })
                  }}>
                    Resume Service
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
