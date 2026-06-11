import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, User, Briefcase } from "lucide-react";
import { grievances } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/grievances/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Grievance` }] }),
  component: GrievanceDetail,
});

function GrievanceDetail() {
  const { id } = Route.useParams();
  const g = grievances.find((x) => x.id === id);

  if (!g) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Grievance {id} not found.</p>
        <Button asChild className="mt-4"><Link to="/admin/grievances">Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/grievances"><ArrowLeft className="h-4 w-4" /> All grievances</Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{g.id}</h1>
          <p className="mt-1 text-muted-foreground">{g.issue}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{g.status}</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{g.priority} Priority</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{g.category}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Mark In Progress</Button>
          <Button>Resolve</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed">{g.description}</p></CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><User className="h-4 w-4" /> Parties</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Raised by ({g.raisedByType})</div>
                <div className="font-semibold">{g.raisedBy}</div>
                {g.raisedById && (
                  <Link to={g.raisedByType === "customer" ? "/admin/users/$id" : "/admin/providers/$id"} params={{ id: g.raisedById }} className="text-xs text-primary hover:underline">
                    View profile
                  </Link>
                )}
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Against ({g.againstType})</div>
                <div className="font-semibold">{g.against}</div>
              </div>
            </CardContent>
          </Card>

          {g.jobId && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4" /> Related Job</CardTitle></CardHeader>
              <CardContent>
                <Link to="/admin/jobs/$id" params={{ id: g.jobId }} className="font-semibold text-primary hover:underline">{g.jobId}</Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> Timeline</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <div className="text-muted-foreground">Created</div>
              <div>{new Date(g.createdAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</div>
              {g.resolvedAt && (
                <>
                  <div className="mt-3 text-muted-foreground">Resolved</div>
                  <div>{new Date(g.resolvedAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
