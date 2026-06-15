import { createFileRoute, Link } from "@tanstack/react-router";
import { providerApplications, providerDocs } from "@/data/admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/providers")({
  head: () => ({ meta: [{ title: "Providers — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Service Providers</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border bg-card lg:col-span-2">
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
                {providerApplications.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">{p.provider}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.business}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.submitted}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "Pending" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" : p.status === "Rejected" ? "bg-destructive/15 text-destructive" : p.status === "In Review" ? "bg-primary/10 text-primary" : "bg-success/15 text-success"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/admin/providers/$id" params={{ id: p.id }}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y sm:hidden">
            {providerApplications.map((p) => (
              <Link
                key={p.id}
                to="/admin/providers/$id"
                params={{ id: p.id }}
                className="block p-4 hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold">{p.provider}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.business}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "Pending" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" : p.status === "Rejected" ? "bg-destructive/15 text-destructive" : p.status === "In Review" ? "bg-primary/10 text-primary" : "bg-success/15 text-success"}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{p.submitted}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="font-display font-semibold">Documents Required</div>
          <ul className="mt-3 space-y-2">
            {providerDocs.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{d.name}</span>
                <span
                  className={`shrink-0 text-xs font-semibold ${d.status === "Verified" ? "text-success" : "text-warning"}`}
                >
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ),
});
