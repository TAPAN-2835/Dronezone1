import { definePage, Link, useRouter } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  assignProviderClass,
  getAdminProviderDetails,
  updateProviderVerification,
} from "@/lib/api/admin";
import {
  getProviderDocumentSignedUrl,
  getProviderEquipmentSignedUrl,
  listProviderDocuments,
  listProviderEquipment,
  reviewProviderDocument,
  reviewProviderEquipment,
} from "@/lib/api/storage";

export const Page = definePage("/admin/providers/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} â€” Provider` }] }),
  loader: async ({ params }) => {
    const { provider, grievances } = await getAdminProviderDetails({
      data: { providerId: params.id },
    });
    const [documents, equipment] = await Promise.all([
      listProviderDocuments(provider.user_id),
      listProviderEquipment(provider.user_id),
    ]);
    return { provider, documents, equipment, grievances };
  },
  component: ProviderDetail,
});

function ProviderDetail() {
  const { id } = Page.useParams();
  const loaderData = Page.useLoaderData() as any;
  const dbProvider = loaderData?.provider;
  const documents = loaderData?.documents ?? [];
  const equipment = loaderData?.equipment ?? [];
  const router = useRouter();

  const provider = {
    id: dbProvider.id,
    provider: `${dbProvider.users?.first_name} ${dbProvider.users?.last_name}`,
    business: dbProvider.business_name || "N/A",
    status: dbProvider.status,
    email: dbProvider.users?.email,
    phone: dbProvider.users?.phone,
    city:
      [dbProvider.service_area_city, dbProvider.service_area_state].filter(Boolean).join(", ") ||
      "Unknown",
    submitted: new Date(dbProvider.created_at).toLocaleDateString(),
    experience: dbProvider.years_of_experience
      ? `${dbProvider.years_of_experience} years`
      : "Not provided",
    categories: dbProvider.specializations || "Not provided",
    equipmentClass: dbProvider.equipment_class,
  };

  const providerGrievances = loaderData?.grievances ?? [];

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
                provider.status === "pending"
                  ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
                  : provider.status === "rejected"
                    ? "bg-destructive/15 text-destructive"
                    : provider.status === "in_review"
                      ? "bg-primary/10 text-primary"
                      : "bg-success/15 text-success"
              }`}
            >
              {provider.status.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{provider.id}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap print:hidden">
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={async () => {
              await updateProviderVerification({
                data: { providerId: provider.id, status: "Approved" },
              });
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
              const reason = window.prompt("Provider rejection reason:")?.trim();
              if (!reason) return;
              await updateProviderVerification({
                data: { providerId: provider.id, status: "Rejected", rejectionReason: reason },
              });
              router.invalidate();
              toast.success("Provider Rejected", {
                description:
                  "Email sent: Unfortunately, your application does not meet our requirements at this time.",
              });
            }}
          >
            Reject
          </Button>
          {[1, 2, 3].map((equipmentClass) => (
            <Button
              key={equipmentClass}
              variant="outline"
              onClick={async () => {
                await assignProviderClass(provider.id, equipmentClass);
                await router.invalidate();
                toast.success(`Provider assigned to class ${equipmentClass}`);
              }}
            >
              Class {equipmentClass}
            </Button>
          ))}
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
              <span className="text-muted-foreground">Review Date: </span>
              {dbProvider.verified_at
                ? new Date(dbProvider.verified_at).toLocaleDateString()
                : "Pending"}
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Reviewer Notes: </span>
              {dbProvider.rejection_reason || "See individual document and equipment review notes."}
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
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      (provider as any).equipmentClass === 1
                        ? "bg-primary/10 text-primary"
                        : (provider as any).equipmentClass === 2
                          ? "bg-success/10 text-success"
                          : (provider as any).equipmentClass === 3
                            ? "bg-warning/10 text-[oklch(0.45_0.15_75)]"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {(provider as any).equipmentClass
                      ? `Class ${(provider as any).equipmentClass}`
                      : "Unassigned"}
                  </span>
                  <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Change Class...</option>
                    <option value="1">Class 1 â€” Premium</option>
                    <option value="2">Class 2 â€” Standard</option>
                    <option value="3">Class 3 â€” Basic</option>
                  </select>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Site Verification: </span>
                  {(provider as any).equipmentClass
                    ? "Verified by Sales Partner"
                    : "Pending Verification"}
                </div>
              </div>
              <div>
                <div className="mb-2 font-semibold text-muted-foreground">Submitted Equipment</div>
                {equipment.length > 0 ? (
                  <ul className="space-y-2">
                    {equipment.map((eq: any) => (
                      <li key={eq.id} className="flex items-center gap-3 rounded-lg border p-2">
                        <button
                          className="h-10 w-10 flex-shrink-0 rounded bg-muted text-xs text-primary"
                          onClick={async () => {
                            try {
                              window.open(
                                await getProviderEquipmentSignedUrl(eq),
                                "_blank",
                                "noopener,noreferrer",
                              );
                            } catch (error) {
                              toast.error(
                                error instanceof Error ? error.message : "Preview failed",
                              );
                            }
                          }}
                        >
                          View
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{eq.equipment_name}</div>
                          <div className="text-xs capitalize text-muted-foreground">
                            {eq.verification_status}
                          </div>
                          {eq.admin_notes && (
                            <p className="text-xs text-destructive">{eq.admin_notes}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await reviewProviderEquipment(eq.id, "approved");
                            toast.success("Equipment approved");
                            await router.invalidate();
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const notes = window.prompt("Rejection notes:")?.trim();
                            if (!notes) return;
                            await reviewProviderEquipment(eq.id, "rejected", notes);
                            toast.success("Equipment rejected");
                            await router.invalidate();
                          }}
                        >
                          Reject
                        </Button>
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
          <CardContent className="text-sm">
            {documents.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((document: any) => (
                  <li
                    key={document.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                  >
                    <button
                      className="font-medium text-primary hover:underline"
                      onClick={async () => {
                        try {
                          window.open(
                            await getProviderDocumentSignedUrl(document),
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Preview failed");
                        }
                      }}
                    >
                      {document.document_name}
                    </button>
                    <span className="mr-auto text-xs capitalize text-muted-foreground">
                      {document.document_type.replaceAll("_", " ")} · {document.verification_status}
                    </span>
                    {document.admin_notes && (
                      <span className="w-full text-xs text-destructive">
                        Admin notes: {document.admin_notes}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await reviewProviderDocument(document.id, "approved");
                        toast.success("Document approved");
                        await router.invalidate();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const notes = window.prompt("Rejection notes:")?.trim();
                        if (!notes) return;
                        await reviewProviderDocument(document.id, "rejected", notes);
                        toast.success("Document rejected");
                        await router.invalidate();
                      }}
                    >
                      Reject
                    </Button>
                  </li>
                ))}
              </ul>
            )}
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
                {providerGrievances.map((g: any) => (
                  <Link
                    key={g.id}
                    to="/admin/grievances/$id"
                    params={{ id: g.id }}
                    className="flex justify-between py-3 text-sm hover:text-primary"
                  >
                    <div>
                      <span className="font-semibold">{g.grievance_number}</span> · {g.subject}
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
