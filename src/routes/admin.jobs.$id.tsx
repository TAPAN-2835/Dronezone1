import { definePage, Link, useLoaderData } from "@/lib/router";
import { ArrowLeft, User, Wrench, IndianRupee, Shield, Clock } from "lucide-react";
import { grievances } from "@/data/admin";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inr } from "@/data/demo";
import { getAdminJobDetails } from "@/lib/api/admin";

export const Page = definePage("/admin/jobs/$id")({
  head: ({ params }) => ({ meta: [{ title: `Job ${params.id} â€” Admin` }] }),
  loader: ({ params }) => getAdminJobDetails({ data: { jobId: params.id } }),
  component: AdminJobDetail,
});

function AdminJobDetail() {
  const { job } = useLoaderData({ from: "/admin/jobs/$id" }) as any;
  const relatedGrievances = grievances.filter((g) => g.jobId === job?.id);

  if (!job) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Job not found.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  const cName = `${job.service_requests?.customer?.first_name} ${job.service_requests?.customer?.last_name}`;
  const pName = `${job.provider?.first_name} ${job.provider?.last_name}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/jobs">
          <ArrowLeft className="h-4 w-4" /> All jobs
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{job.id.split("-")[0]}</h1>
          <p className="mt-1 text-lg">{job.service_requests?.service_categories?.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {job.status}
            </span>
            <JobAgeBadge createdAt={job.created_at} />
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              {job.service_requests?.service_categories?.name}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/grievances/new">Raise Grievance</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <Field label="Customer" value={cName} />
              <Field label="Service Provider" value={pName} />
              <Field
                label="Request Date"
                value={new Date(job.created_at).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              />
              <Field label="Category" value={job.service_requests?.service_categories?.name} />
              <Field label="Payment Status" value={job.paymentStatus || "Paid"} />
              <Field label="AMC Status" value={job.amcStatus || "Active"} />
              {job.amount && <Field label="Amount" value={inr(job.amount)} />}
            </CardContent>
          </Card>

          {relatedGrievances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Related Grievances</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {relatedGrievances.map((g) => (
                  <Link
                    key={g.id}
                    to="/admin/grievances/$id"
                    params={{ id: g.id }}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:text-primary"
                  >
                    <div>
                      <div className="font-semibold">{g.id}</div>
                      <div className="text-xs text-muted-foreground">{g.issue}</div>
                    </div>
                    <span className="text-xs font-medium">{g.status}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" /> Aging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobAgeBadge createdAt={job.created_at} className="text-sm px-3 py-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-semibold">
              {job.paymentStatus || "Paid"}
              {job.amount ? ` Â· ${inr(job.amount)}` : ""}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" /> AMC
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{job.amcStatus || "Active"}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
