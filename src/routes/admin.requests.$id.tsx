import { definePage, Link, useLoaderData } from "@/lib/router";
import { ArrowLeft, Check, Clock, AlertCircle, Circle } from "lucide-react";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminRequestDetails } from "@/lib/api/admin";

export const Page = definePage("/admin/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} â€” Request` }] }),
  loader: ({ params }) => getAdminRequestDetails({ data: { requestId: params.id } }),
  component: AdminRequestDetail,
});

type WorkflowStage = {
  label: string;
  description: string;
  done: boolean;
  active: boolean;
};

function getWorkflowStages(status: string): WorkflowStage[] {
  const isNew = status === "New";
  const isInProgress = status === "In Progress";
  const isActive = status === "Active";
  const isCompleted = status === "Completed";

  return [
    {
      label: "Request Submitted",
      description: "Customer submitted the service request",
      done: true,
      active: false,
    },
    {
      label: "Provider Review",
      description: "Service provider reviews the request and creates a quotation",
      done: !isNew,
      active: isNew,
    },
    {
      label: "Quotation",
      description: "Provider sends quotation to customer",
      done: isInProgress || isActive || isCompleted,
      active: false,
    },
    {
      label: "Customer Approval",
      description: "Customer approves the quotation",
      done: isActive || isCompleted,
      active: isInProgress,
    },
    {
      label: "Active Job",
      description: "Job is in progress at customer site",
      done: isActive || isCompleted,
      active: isActive && !isCompleted,
    },
    {
      label: "Completed",
      description: "Service completed and feedback submitted",
      done: isCompleted,
      active: false,
    },
  ];
}

function getBottleneckMessage(status: string): {
  msg: string;
  variant: "warning" | "info" | "success";
} {
  if (status === "New")
    return { msg: "Waiting for Provider to Review & Create Quotation", variant: "warning" };
  if (status === "In Progress")
    return { msg: "Waiting for Customer to Approve Quotation", variant: "info" };
  if (status === "Active") return { msg: "Job is Active â€” In Progress", variant: "success" };
  if (status === "Completed") return { msg: "Completed", variant: "success" };
  return { msg: "Unknown Stage", variant: "warning" };
}

const bottleneckStyles = {
  warning:
    "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  info: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function AdminRequestDetail() {
  const { request: req } = useLoaderData({ from: "/admin/requests/$id" }) as any;

  if (!req) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Request not found.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/requests">Back</Link>
        </Button>
      </div>
    );
  }

  const stages = getWorkflowStages(req.status);
  const bottleneck = getBottleneckMessage(req.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/requests">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{req.id.split("-")[0]}</h1>
          <p className="mt-1 text-lg">{req.service_categories?.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {req.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold bg-warning/10 text-warning`}
            >
              Medium Priority
            </span>
            <JobAgeBadge createdAt={req.created_at} />
          </div>
        </div>
        <Button>Assign Provider</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Request Details card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">User: </span>
              <Link
                to="/admin/users/$id"
                params={{ id: req.customer_id }}
                className="font-semibold text-primary hover:underline"
              >
                {req.users?.first_name} {req.users?.last_name}
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">Drone: </span>
              {req.drones?.model}
            </div>
            <div>
              <span className="text-muted-foreground">Location: </span>
              {req.addresses?.city}
            </div>
            <div>
              <span className="text-muted-foreground">Submitted: </span>
              {new Date(req.created_at).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Status card â€” enhanced vertical stepper */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Workflow Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vertical stepper */}
            <ol className="relative space-y-3 border-l-2 border-border pl-5 text-sm">
              {stages.map((stage, i) => (
                <li key={i} className="relative">
                  {/* Step dot */}
                  <span
                    className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      stage.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : stage.active
                          ? "border-yellow-400 bg-yellow-400 text-yellow-900"
                          : "border-border bg-card"
                    }`}
                  >
                    {stage.done ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : stage.active ? (
                      <Clock className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />
                    )}
                  </span>

                  {/* Label row */}
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        stage.done
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : stage.active
                            ? "font-semibold text-yellow-600 dark:text-yellow-400"
                            : "text-muted-foreground"
                      }
                    >
                      {stage.label}
                    </span>
                    {stage.active && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Description shown only for active stage */}
                  {stage.active && (
                    <div className="mt-0.5 text-xs text-muted-foreground">{stage.description}</div>
                  )}
                </li>
              ))}
            </ol>

            {/* Current Bottleneck highlight */}
            <div
              className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${bottleneckStyles[bottleneck.variant]}`}
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <span className="mr-1 font-bold uppercase tracking-wide opacity-60">
                  Bottleneck:
                </span>
                {bottleneck.msg}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {req.job_assignments?.[0]?.id && (
              <Button asChild variant="outline">
                <Link to="/admin/jobs/$id" params={{ id: req.job_assignments[0].id }}>
                  View as Job
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/admin/grievances/new">Raise Grievance</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
