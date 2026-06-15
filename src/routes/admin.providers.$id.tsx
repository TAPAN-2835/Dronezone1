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
  const providerGrievances = grievances.filter(
    (g) => g.raisedById === id || g.against === provider?.business,
  );

  if (!provider) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Provider {id} not found.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/providers">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/providers">
            <ArrowLeft className="h-4 w-4" /> All providers
          </Link>
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          Export PDF
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{provider.provider}</h1>
          <p className="text-muted-foreground">{provider.business}</p>
          <div className="mt-2 flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${provider.status === "Pending" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" : provider.status === "Rejected" ? "bg-destructive/15 text-destructive" : provider.status === "In Review" ? "bg-primary/10 text-primary" : "bg-success/15 text-success"}`}
            >
              {provider.status}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{provider.id}</span>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button className="bg-success text-success-foreground hover:bg-success/90">
            Approve
          </Button>
          <Button variant="destructive">Reject</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Provider Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Full Name: </span>
              {provider.provider}
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              {provider.email}
            </div>
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {provider.phone}
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Address: </span>123 Drone Street,{" "}
              {provider.city}, India 500001
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Service Areas: </span>
              {provider.city}, Suburbs
            </div>
            <div>
              <span className="text-muted-foreground">Experience: </span>4 Years
            </div>
            <div>
              <span className="text-muted-foreground">Specializations: </span>Repair, Calibration
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Status: </span>
              {provider.status}
            </div>
            <div>
              <span className="text-muted-foreground">Submission Date: </span>
              {provider.submitted}
            </div>
            <div>
              <span className="text-muted-foreground">Review Date: </span>14 May 2026
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Reviewer Notes: </span>All documents verified.
              Waiting on final background check clearance.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 text-sm">
            <div>
              <div className="mb-2 font-semibold text-muted-foreground">Uploaded Documents</div>
              <ul className="space-y-2">
                {providerDocs
                  .filter((d) => d.status === "Verified")
                  .map((d) => (
                    <li key={d.name} className="flex justify-between rounded-lg border p-2">
                      <span>{d.name}</span>
                      <span className="text-xs font-semibold text-success">{d.status}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 font-semibold text-muted-foreground">Pending Documents</div>
              <ul className="space-y-2">
                {providerDocs
                  .filter((d) => d.status !== "Verified")
                  .map((d) => (
                    <li
                      key={d.name}
                      className="flex justify-between rounded-lg border border-warning/30 bg-warning/5 p-2"
                    >
                      <span>{d.name}</span>
                      <span className="text-xs font-semibold text-warning">{d.status}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 print:hidden">
          <CardHeader>
            <CardTitle className="text-sm">Grievance History</CardTitle>
          </CardHeader>
          <CardContent>
            {providerGrievances.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No grievances linked to this provider.
              </p>
            ) : (
              <div className="divide-y">
                {providerGrievances.map((g) => (
                  <Link
                    key={g.id}
                    to="/admin/grievances/$id"
                    params={{ id: g.id }}
                    className="flex justify-between py-3 text-sm hover:text-primary"
                  >
                    <div>
                      <span className="font-semibold">{g.id}</span> · {g.issue}
                    </div>
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
