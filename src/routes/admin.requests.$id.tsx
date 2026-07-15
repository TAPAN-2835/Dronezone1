import { useState } from "react";
import { ArrowLeft, Check, Clock, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { definePage, Link, useRouter } from "@/lib/router";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  approveServiceRequest,
  assignRequestToProvider,
  getAdminRequestDetails,
  rejectServiceRequest,
  reviewServiceRequest,
} from "@/lib/api/admin";
import { RequestAttachments } from "@/components/shared/RequestAttachments";

export const Page = definePage("/admin/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Request` }] }),
  loader: ({ params }) => getAdminRequestDetails({ data: { requestId: params.id } }),
  component: AdminRequestDetail,
});

const stages = ["in_approval", "review", "approved", "in_progress", "completed"];

function AdminRequestDetail() {
  const { request: req, providers } = Page.useLoaderData();
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [busy, setBusy] = useState(false);

  if (!req)
    return <div className="rounded-xl border bg-card p-8 text-center">Request not found.</div>;

  const currentIndex = stages.indexOf(req.status);
  const activeAssignment = req.job_assignments?.find((item: any) => item.is_active);
  const mutate = async (operation: () => Promise<unknown>, success: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await operation();
      toast.success(success);
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Workflow action failed");
    } finally {
      setBusy(false);
    }
  };

  const waitingFor =
    req.status === "in_approval"
      ? "Admin review"
      : req.status === "review"
        ? "Admin approval"
        : req.status === "approved" && !activeAssignment
          ? "Provider assignment"
          : activeAssignment?.status === "pending"
            ? "Provider response"
            : req.status === "in_progress"
              ? "Provider completion"
              : "No pending action";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/requests">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{req.request_number}</h1>
          <p className="mt-1 text-lg">{req.title}</p>
          <div className="mt-2 flex gap-2">
            <StatusBadge status={req.status} />
            <JobAgeBadge createdAt={req.created_at} />
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
          <span className="text-muted-foreground">Waiting for: </span>
          <strong>{waitingFor}</strong>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Customer: </span>
              {req.users?.first_name} {req.users?.last_name}
            </div>
            <div>
              <span className="text-muted-foreground">Category: </span>
              {req.service_categories?.name}
            </div>
            <div>
              <span className="text-muted-foreground">Drone: </span>
              {req.drones?.model}
            </div>
            <div>
              <span className="text-muted-foreground">Location: </span>
              {req.addresses?.city}
            </div>
            <p className="rounded-lg bg-muted/30 p-3">{req.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" /> Transactional Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {stages.map((stage, index) => (
                <li key={stage} className="flex items-center gap-2 text-sm">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full border ${index <= currentIndex ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {index < currentIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="capitalize">{stage.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Request Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestAttachments requestId={req.id} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Lifecycle Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            {req.status === "in_approval" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void mutate(() => reviewServiceRequest(req.id), "Request moved to review")
                }
              >
                <UserCheck className="h-4 w-4" /> Review
              </Button>
            )}
            {req.status === "review" && (
              <>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void mutate(() => approveServiceRequest(req.id), "Request approved")
                  }
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  disabled={busy}
                  onClick={() => {
                    const reason = window.prompt("Rejection reason:")?.trim();
                    if (reason)
                      void mutate(() => rejectServiceRequest(req.id, reason), "Request rejected");
                  }}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            {req.status === "approved" && !activeAssignment && (
              <>
                <div className="min-w-64 space-y-1.5">
                  <Label>Approved provider</Label>
                  <Select value={providerId} onValueChange={setProviderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider: any) => (
                        <SelectItem key={provider.user_id} value={provider.user_id}>
                          {provider.business_name} (Class {provider.equipment_class ?? "unassigned"}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={busy || !providerId}
                  onClick={() =>
                    void mutate(
                      () => assignRequestToProvider({ data: { requestId: req.id, providerId } }),
                      "Provider assigned",
                    )
                  }
                >
                  <UserCheck className="h-4 w-4" /> Assign Provider
                </Button>
              </>
            )}
            {activeAssignment?.id && (
              <Button asChild variant="outline">
                <Link to="/admin/jobs/$id" params={{ id: activeAssignment.id }}>
                  View job assignment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
