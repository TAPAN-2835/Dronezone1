import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  Plane,
  FileText,
  Check,
  X,
  Clock,
  User,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { jobs, inr } from "@/data/demo";
import { getMapEmbedUrl, getMapSearchUrl } from "@/lib/map-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `Review ${params.id} — DroneZone` }] }),
  component: RequestReview,
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Request not found.</div>,
});

function RequestReview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Request {id} not found.</p>
        <Button asChild className="mt-4">
          <Link to="/app/requests">Back to requests</Link>
        </Button>
      </div>
    );
  }

  const isNew = job.status === "new";

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/requests">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
      </Button>

      <PageHeader
        title={isNew ? "Request Review" : job.issue}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{job.id}</span>
            <StatusBadge status={job.status} />
            <JobAgeBadge createdAt={job.createdAt} />
          </span>
        }
        actions={
          isNew ? (
            <>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => toast.success(`${job.id} rejected`)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => toast.success(`${job.id} accepted`)}>
                <Check className="h-4 w-4" /> Accept Request
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate({ to: "/app/jobs/$id", params: { id: job.id } })}>
              <FileText className="h-4 w-4" /> View Job Details
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {job.customer.name.split(" ").map((p) => p[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{job.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{job.customer.phone}</div>
                  {job.customer.email && <div className="text-xs text-muted-foreground">{job.customer.email}</div>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${job.customer.phone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" /> Contact Customer
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/chat">
                    <MessageSquare className="h-4 w-4" /> Chat
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plane className="h-4 w-4 text-primary" /> Drone Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Model" value={job.drone.model} />
              <Field label="Serial number" value={job.drone.serial} />
              <Field label="Purchase date" value={job.drone.purchaseDate ?? "—"} />
              <Field label="Warranty" value={job.drone.warranty ?? "—"} />
              <Field label="Service category" value={job.serviceCategory ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issue Description</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold">{job.issue}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{job.description}</p>
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
                      className="flex aspect-video flex-col items-center justify-center rounded-lg border bg-gradient-to-br from-muted to-card p-3 text-center"
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-2 text-xs font-medium">{a.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">{a.type}</span>
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
                  <Clock className="h-4 w-4 text-primary" /> Request Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l-2 border-border pl-6">
                  {job.timeline.map((event, i) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <div className="text-sm font-semibold">{event.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      {event.description && <div className="mt-0.5 text-xs text-muted-foreground">{event.description}</div>}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(job.scheduledAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  title="Location map"
                  src={getMapEmbedUrl(job.location, job.city)}
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={getMapSearchUrl(job.location, job.city)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open in Maps
                </a>
              </Button>
            </CardContent>
          </Card>

          {isNew && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">Ready to take this job?</p>
                <Button className="w-full" onClick={() => toast.success(`${job.id} accepted`)}>
                  <Check className="h-4 w-4" /> Accept Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={() => toast.success(`${job.id} rejected`)}
                >
                  <X className="h-4 w-4" /> Reject Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
