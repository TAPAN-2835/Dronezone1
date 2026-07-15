import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Calendar,
  Plane,
  FileText,
  Clock,
  User,
  Paperclip,
  IndianRupee,
  Shield,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProviderJobDetails } from "@/lib/api/provider.server";

export const Route = createFileRoute("/app/jobs/$id")({
  head: ({ params }) => ({ meta: [{ title: `Job ${params.id} — DroneZone` }] }),
  loader: ({ params }) => getProviderJobDetails({ data: { assignmentId: params.id } }),
  component: JobDetails,
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Job not found.</div>,
});

const paymentLabels = {
  pending: { label: "Pending", className: "bg-warning/15 text-[oklch(0.45_0.15_75)]" },
  paid: { label: "Paid", className: "bg-success/15 text-success" },
  partial: { label: "Partial", className: "bg-primary/10 text-primary" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
  not_applicable: { label: "N/A", className: "bg-muted text-muted-foreground" },
};

const amcLabels = {
  covered: { label: "AMC Covered", className: "bg-success/15 text-success" },
  not_covered: { label: "Not Covered", className: "bg-muted text-muted-foreground" },
  expired: { label: "AMC Expired", className: "bg-destructive/10 text-destructive" },
};

function JobDetails() {
  const { assignment } = Route.useLoaderData();
  const job = assignment;

  if (!job) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Job not found.</p>
        <Button asChild className="mt-4">
          <Link to="/app/active">Back to active jobs</Link>
        </Button>
      </div>
    );
  }

  const payment = paymentLabels["not_applicable"];
  const amc = amcLabels["not_covered"];

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/active">
          <ArrowLeft className="h-4 w-4" /> Active jobs
        </Link>
      </Button>

      <PageHeader
        title={job.service_requests?.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{job.service_requests?.request_number}</span>
            <StatusBadge status={job.status} />
            <JobAgeBadge createdAt={job.created_at} />
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/chat">
                <MessageSquare className="h-4 w-4" /> Chat
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.className}`}>
          <IndianRupee className="mr-1 inline h-3 w-3" /> Payment: {payment.label}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${amc.className}`}>
          <Shield className="mr-1 inline h-3 w-3" /> {amc.label}
        </span>
        {job.service_requests?.service_categories?.name && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {job.service_requests.service_categories.name}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {job.service_requests?.users?.first_name?.[0]}
                    {job.service_requests?.users?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{job.service_requests?.users?.first_name} {job.service_requests?.users?.last_name}</div>
                  <div className="text-sm text-muted-foreground">{job.service_requests?.users?.phone}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Request date"
                  value={new Date(job.service_requests?.created_at).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                />
                <Field label="Current status" value={job.status.replace("_", " ")} />
                <Field label="Service category" value={job.service_requests?.service_categories?.name ?? "—"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plane className="h-4 w-4 text-primary" /> Drone Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Model" value={job.service_requests?.drones?.model} />
              <Field label="Serial" value={job.service_requests?.drones?.serial_number} />
              <Field label="Purchase date" value={job.service_requests?.drones?.purchase_date ?? "—"} />
              <Field label="Warranty" value={job.service_requests?.drones?.warranty_status ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issue & Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{job.service_requests?.description}</p>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-4">


          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-muted-foreground font-medium">•</span>
                {job.service_requests?.addresses?.city}, {job.service_requests?.addresses?.state}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${job.service_requests?.users?.phone}`}>
                <Phone className="h-4 w-4" /> Call
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/grievances/new">
                <FileText className="h-4 w-4" /> Grievance
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
