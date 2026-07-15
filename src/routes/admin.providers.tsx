import { definePage, Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { getAdminProviders } from "@/lib/api/admin";
const requiredDocuments = [
  "Government ID",
  "Business registration",
  "DGCA certification",
  "Professional certificate",
];

export const Page = definePage("/admin/providers")({
  head: () => ({ meta: [{ title: "Providers â€” DroneZone Admin" }] }),
  loader: () => getAdminProviders(),
  component: AdminProvidersPage,
});

function statusBadgeClass(status: string): string {
  if (status === "pending") return "bg-warning/15 text-[oklch(0.45_0.15_75)]";
  if (status === "rejected") return "bg-destructive/15 text-destructive";
  if (status === "in_review") return "bg-primary/10 text-primary";
  return "bg-success/15 text-success";
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AdminProvidersPage() {
  const { providers } = Page.useLoaderData();

  const displayProviders = providers;

  // Stats for the sidebar
  const pendingCount = providers.filter((p: any) => p.status === "pending").length;
  const approvedCount = providers.filter((p: any) => p.status === "approved").length;
  const rejectedCount = providers.filter((p: any) => p.status === "rejected").length;
  const docsRequiredCount = providers.filter((p: any) => p.status === "in_review").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Provider Verification Queue</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-[oklch(0.45_0.15_75)]">
            {pendingCount} Pending
          </span>
          <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            {approvedCount} Approved
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Provider table */}
        <div className="overflow-hidden rounded-xl border bg-card lg:col-span-2">
          {displayProviders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No pending verification applications.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Provider</th>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProviders.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {p.users?.first_name} {p.users?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.users?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{p.users?.phone}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {p.business_name || "â€”"}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(
                              p.status,
                            )}`}
                          >
                            {statusLabel(p.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/admin/providers/$id" params={{ id: p.id }}>
                              Review
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="divide-y sm:hidden">
                {displayProviders.map((p: any) => (
                  <Link
                    key={p.id}
                    to="/admin/providers/$id"
                    params={{ id: p.id }}
                    className="block p-4 hover:bg-accent/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {p.users?.first_name} {p.users?.last_name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p.business_name || "N/A"}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(p.status)}`}
                      >
                        {statusLabel(p.status)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Verification stats */}
          <div className="rounded-xl border bg-card p-5">
            <div className="font-display font-semibold">Verification Stats</div>
            <ul className="mt-3 space-y-2.5">
              <li className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Pending Review</span>
                <span className="font-semibold text-[oklch(0.45_0.15_75)]">{pendingCount}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-semibold text-success">{approvedCount}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Rejected</span>
                <span className="font-semibold text-destructive">{rejectedCount}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Docs Required</span>
                <span className="font-semibold text-primary">{docsRequiredCount}</span>
              </li>
            </ul>
          </div>

          {/* Required documents reference */}
          <div className="rounded-xl border bg-card p-5">
            <div className="font-display font-semibold">Documents Checklist</div>
            <ul className="mt-3 space-y-2">
              {requiredDocuments.map((name) => (
                <li key={name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">Required</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
