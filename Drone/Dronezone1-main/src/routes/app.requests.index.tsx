import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Clock, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getProviderRequests, updateAssignmentStatus } from "@/lib/api/provider.server";

export const Route = createFileRoute("/app/requests/")({
  head: () => ({ meta: [{ title: "New Requests — DroneZone" }] }),
  loader: () => getProviderRequests(),
  component: Requests,
});

function Requests() {
  const { requests } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const router = useRouter();

  const filtered = useMemo(
    () =>
      requests.filter(
        (j: any) =>
          q === "" ||
          j.service_requests?.request_number?.toLowerCase().includes(q.toLowerCase()) ||
          j.service_requests?.title?.toLowerCase().includes(q.toLowerCase()) ||
          j.service_requests?.users?.first_name?.toLowerCase().includes(q.toLowerCase()) ||
          j.service_requests?.addresses?.city?.toLowerCase().includes(q.toLowerCase()),
      ),
    [requests, q],
  );

  const handleAction = (assignmentId: string, newStatus: "accepted" | "rejected") => {
    toast.promise(updateAssignmentStatus({ data: { assignmentId, newStatus } }), {
      loading: "Updating status...",
      success: `Request ${newStatus}`,
      error: "Failed to update status",
      finally: () => router.invalidate(),
    });
  };

  return (
    <>
      <PageHeader
        title="New Requests"
        description="Review incoming requests assigned to you."
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
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {filtered.map((j: any, i: number) => (
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
                      <span className="font-mono text-xs text-muted-foreground">{j.service_requests?.request_number}</span>
                      <StatusBadge status={j.status} />
                      <JobAgeBadge createdAt={j.created_at} />
                    </div>
                    <h3 className="mt-1 truncate font-display text-base font-semibold">
                      {j.service_requests?.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {j.service_requests?.addresses?.city}
                      </span>
                      {j.service_requests?.requested_completion_date && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Expected: {new Date(j.service_requests?.requested_completion_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-sm">
                      <span className="font-medium">{j.service_requests?.users?.first_name}</span>
                      <span className="text-muted-foreground"> · {j.service_requests?.drones?.model}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Button asChild size="sm" className="flex-1 sm:flex-none">
                    <Link to="/app/requests/$id" params={{ id: j.id }}>
                      Review request
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleAction(j.id, "rejected")}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => handleAction(j.id, "accepted")}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
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
