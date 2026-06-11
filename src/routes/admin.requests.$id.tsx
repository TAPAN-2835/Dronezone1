import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { adminRequests } from "@/data/admin";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Request` }] }),
  component: AdminRequestDetail,
});

function AdminRequestDetail() {
  const { id } = Route.useParams();
  const req = adminRequests.find((r) => r.id === id);

  if (!req) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Request {id} not found.</p>
        <Button asChild className="mt-4"><Link to="/admin/requests">Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/requests"><ArrowLeft className="h-4 w-4" /> All requests</Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{req.id}</h1>
          <p className="mt-1 text-lg">{req.issue}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{req.status}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${req.priority === "High" ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>{req.priority} Priority</span>
            <JobAgeBadge createdAt={req.createdAt} />
          </div>
        </div>
        <Button>Assign Provider</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Request Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">User: </span><Link to="/admin/users/$id" params={{ id: req.userId }} className="font-semibold text-primary hover:underline">{req.user}</Link></div>
            <div><span className="text-muted-foreground">Drone: </span>{req.drone}</div>
            <div><span className="text-muted-foreground">Location: </span>{req.location}</div>
            <div><span className="text-muted-foreground">Submitted: </span>{new Date(req.createdAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/admin/jobs/$id" params={{ id: req.id }}>View as Job</Link></Button>
            <Button asChild variant="outline"><Link to="/admin/grievances/new">Raise Grievance</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
