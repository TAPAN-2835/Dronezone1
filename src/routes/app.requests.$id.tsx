import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, MessageSquare, Calendar, Plane, FileText, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { jobs, inr } from "@/data/demo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — DroneZone` }] }),
  component: RequestDetail,
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Request not found.</div>,
});

function RequestDetail() {
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

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/requests">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
      </Button>

      <PageHeader
        title={job.issue}
        description={
          <span className="inline-flex items-center gap-2">
            <span className="font-mono">{job.id}</span>
            <StatusBadge status={job.status} />
          </span>
        }
        actions={
          job.status === "new" ? (
            <>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => toast.success(`${job.id} rejected`)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => toast.success(`${job.id} accepted`)}>
                <Check className="h-4 w-4" /> Accept request
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate({ to: "/app/quotations" })}>
              <FileText className="h-4 w-4" /> Send quotation
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Problem description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">{job.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex aspect-video items-center justify-center rounded-lg border bg-gradient-to-br from-muted to-card text-xs text-muted-foreground"
                  >
                    Attachment {n}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Drone information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Plane className="h-4 w-4" />} label="Model" value={job.drone.model} />
              <Field label="Serial number" value={job.drone.serial} />
              <Field label="Last serviced" value="Mar 12, 2026" />
              <Field label="Warranty" value="Active · until Aug 2026" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Service history</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {[
                { id: "JOB-0992", title: "Camera Gimbal Calibration", date: "Mar 12, 2026", amount: 2400 },
                { id: "JOB-0871", title: "Battery Replacement", date: "Dec 04, 2025", amount: 4800 },
              ].map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">{h.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.id} · {h.date}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{inr(h.amount)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer</CardTitle>
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
                  <div className="text-xs text-muted-foreground">{job.customer.phone}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4" /> Call
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/app/chat">
                    <MessageSquare className="h-4 w-4" /> Chat
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Visit details</CardTitle>
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
              <div className="overflow-hidden rounded-lg border bg-[radial-gradient(circle_at_50%_50%,oklch(0.95_0.04_255)_0%,oklch(0.97_0.01_255)_100%)] p-0">
                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
                  Map preview · {job.city}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
