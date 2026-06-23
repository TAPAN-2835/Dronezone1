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
import { jobs, quotations, inr } from "@/data/demo";

export const Route = createFileRoute("/app/jobs/$id")({
  head: ({ params }) => ({ meta: [{ title: `Job ${params.id} — DroneZone` }] }),
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
  const { id } = Route.useParams();
  const job = jobs.find((j) => j.id === id);
  const quote = quotations.find((q) => q.jobId === id);

  if (!job) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Job {id} not found.</p>
        <Button asChild className="mt-4">
          <Link to="/app/active">Back to active jobs</Link>
        </Button>
      </div>
    );
  }

  const payment = paymentLabels[job.paymentStatus ?? "not_applicable"];
  const amc = amcLabels[job.amcStatus ?? "not_covered"];

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/active">
          <ArrowLeft className="h-4 w-4" /> Active jobs
        </Link>
      </Button>

      <PageHeader
        title={job.issue}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{job.id}</span>
            <StatusBadge status={job.status} />
            <JobAgeBadge createdAt={job.createdAt} />
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
        {job.serviceCategory && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {job.serviceCategory}
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
                    {job.customer.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{job.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{job.customer.phone}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Request date"
                  value={new Date(job.createdAt).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                />
                <Field label="Current status" value={job.status.replace("_", " ")} />
                <Field label="Assigned engineer" value={job.assignedEngineer ?? "Not assigned"} />
                <Field label="Service category" value={job.serviceCategory ?? "—"} />
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
              <Field label="Model" value={job.drone.model} />
              <Field label="Serial" value={job.drone.serial} />
              <Field label="Purchase date" value={job.drone.purchaseDate ?? "—"} />
              <Field label="Warranty" value={job.drone.warranty ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issue & Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          {job.attachments && job.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-4 w-4 text-primary" /> Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {job.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex aspect-video flex-col items-center justify-center rounded-lg border bg-muted/40 p-3 text-center"
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-2 text-xs font-medium">{a.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.timeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l-2 border-border pl-6">
                  {job.timeline.map((event, i) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div className="text-sm font-semibold">{event.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {job.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StickyNote className="h-4 w-4 text-primary" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{job.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {quote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" /> Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hardware Cost</span>
                  <span>{inr(quote.hardwareCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labour</span>
                  <span>{inr(quote.laborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{inr(quote.shippingCost)}</span>
                </div>
                {quote.discountPercent > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({quote.discountPercent}%)</span>
                    <span>
                      −{" "}
                      {inr(
                        Math.round(
                          ((quote.hardwareCost + quote.laborCost + quote.shippingCost) *
                            quote.discountPercent) /
                            100,
                        ),
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total (incl. GST)</span>
                  <span>
                    {(() => {
                      const sub = quote.hardwareCost + quote.laborCost + quote.shippingCost;
                      const disc = Math.round((sub * quote.discountPercent) / 100);
                      const after = sub - disc;
                      return inr(after + Math.round((after * quote.gstPercent) / 100));
                    })()}
                  </span>
                </div>
                <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                  {quote.status.replace("_", " ")}
                </span>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-muted-foreground font-medium">•</span>
                {job.location}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${job.customer.phone.replace(/\s/g, "")}`}>
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
