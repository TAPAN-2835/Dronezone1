import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { providerDocs, grievances } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getAdminProviderDetails, updateProviderVerification } from "@/lib/api/admin.server";

export const Route = createFileRoute("/admin/providers/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Provider` }] }),
  loader: ({ params }) => getAdminProviderDetails({ data: { providerId: params.id } }),
  component: ProviderDetail,
});

function ProviderDetail() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData() as any;
  const dbProvider = loaderData?.provider;
  const router = useRouter();

  const provider = {
    id: dbProvider.id,
    provider: `${dbProvider.users?.first_name} ${dbProvider.users?.last_name}`,
    business: dbProvider.business_name || "N/A",
    status: dbProvider.status,
    email: dbProvider.users?.email,
    phone: dbProvider.users?.phone,
    city: dbProvider.service_areas?.[0] || "Unknown",
    submitted: new Date(dbProvider.created_at).toLocaleDateString(),
    experience: dbProvider.experience_years ? `${dbProvider.experience_years} years` : "Not provided",
    categories: ["Mapping & Surveying"], // Fallback since it isn't directly on provider table in our simple schema
  };

  const providerGrievances = grievances.filter(
    (g) => g.raisedById === provider.id || g.against === provider.business,
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
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                provider.status === "Pending" || provider.status === "Pending Verification"
                  ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
                  : provider.status === "Rejected"
                    ? "bg-destructive/15 text-destructive"
                    : provider.status === "In Review" || provider.status === "Additional Documents Required"
                      ? "bg-primary/10 text-primary"
                      : "bg-success/15 text-success"
              }`}
            >
              {provider.status}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{provider.id}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap print:hidden">
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={async () => {
              await updateProviderVerification({ data: { providerId: provider.id, status: "Approved" } });
              router.invalidate();
              toast.success("Provider Approved", {
                description:
                  "Email sent: Your account has been verified successfully. You may now log in and access DroneZone services.",
              });
            }}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await updateProviderVerification({ data: { providerId: provider.id, status: "Rejected" } });
              router.invalidate();
              toast.success("Provider Rejected", {
                description:
                  "Email sent: Unfortunately, your application does not meet our requirements at this time.",
              });
            }}
          >
            Reject
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await updateProviderVerification({ data: { providerId: provider.id, status: "Additional Documents Required" } });
              router.invalidate();
              toast.success("Info Requested", {
                description:
                  "Email sent: We need a bit more information to complete your verification.",
              });
            }}
          >
            Request Docs
          </Button>
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
              <span className="text-muted-foreground">Address: </span>
              {provider.city}
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Service Areas: </span>
              {provider.city}, Suburbs
            </div>
            <div>
              <span className="text-muted-foreground">Experience: </span>
              {(provider as any).experience || "4 Years"}
            </div>
            <div>
              <span className="text-muted-foreground">Specializations: </span>
              {(provider as any).categories || "Repair, Calibration"}
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
            <CardTitle className="text-sm">Equipment & Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 text-sm">
              <div>
                <div className="mb-2 font-semibold text-muted-foreground">Class Assignment</div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 font-semibold ${
                    (provider as any).equipmentClass === 1 ? 'bg-primary/10 text-primary' :
                    (provider as any).equipmentClass === 2 ? 'bg-success/10 text-success' :
                    (provider as any).equipmentClass === 3 ? 'bg-warning/10 text-[oklch(0.45_0.15_75)]' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {(provider as any).equipmentClass ? `Class ${(provider as any).equipmentClass}` : 'Unassigned'}
                  </span>
                  <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Change Class...</option>
                    <option value="1">Class 1 — Premium</option>
                    <option value="2">Class 2 — Standard</option>
                    <option value="3">Class 3 — Basic</option>
                  </select>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Site Verification: </span>
                  {(provider as any).equipmentClass ? 'Verified by Sales Partner' : 'Pending Verification'}
                </div>
              </div>
              <div>
                <div className="mb-2 font-semibold text-muted-foreground">Submitted Equipment</div>
                {((provider as any).equipment && (provider as any).equipment.length > 0) ? (
                  <ul className="space-y-2">
                    {((provider as any).equipment).map((eq: any, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-lg border p-2">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          Img
                        </div>
                        <span className="font-medium">{eq.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No equipment listed.</p>
                )}
              </div>
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
