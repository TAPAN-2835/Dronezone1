import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { providerApplications, providerDocs, grievances } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/providers/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Provider` }] }),
  component: ProviderDetail,
});

function ProviderDetail() {
  const { id } = Route.useParams();
  const provider = providerApplications.find((p) => p.id === id);
  const providerGrievances = grievances.filter((g) => g.raisedById === id || g.against === provider?.business);

  if (!provider) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Provider {id} not found.</p>
        <Button asChild className="mt-4"><Link to="/admin/providers">Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/providers"><ArrowLeft className="h-4 w-4" /> All providers</Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{provider.provider}</h1>
          <p className="text-muted-foreground">{provider.business}</p>
          <div className="mt-2 flex gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${provider.status === "Pending" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" : "bg-primary/10 text-primary"}`}>{provider.status}</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{provider.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-success text-success-foreground hover:bg-success/90">Approve</Button>
          <Button variant="destructive">Reject</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Provider Information</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-muted-foreground">Email: </span>{provider.email}</div>
            <div><span className="text-muted-foreground">Phone: </span>{provider.phone}</div>
            <div><span className="text-muted-foreground">City: </span>{provider.city}</div>
            <div><span className="text-muted-foreground">Submitted: </span>{provider.submitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Documents</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {providerDocs.map((d) => (
                <li key={d.name} className="flex justify-between text-sm">
                  <span>{d.name}</span>
                  <span className={`text-xs font-semibold ${d.status === "Verified" ? "text-success" : "text-warning"}`}>{d.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-sm">Grievance History</CardTitle></CardHeader>
          <CardContent>
            {providerGrievances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No grievances linked to this provider.</p>
            ) : (
              <div className="divide-y">
                {providerGrievances.map((g) => (
                  <Link key={g.id} to="/admin/grievances/$id" params={{ id: g.id }} className="flex justify-between py-3 text-sm hover:text-primary">
                    <div><span className="font-semibold">{g.id}</span> · {g.issue}</div>
                    <span className="text-xs">{g.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
