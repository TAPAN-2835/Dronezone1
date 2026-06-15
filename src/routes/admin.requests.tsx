import { createFileRoute, Link } from "@tanstack/react-router";
import { adminRequests } from "@/data/admin";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";

const activeRequests = adminRequests.filter(
  (r) => !["Completed", "Resolved", "Archived", "Closed"].includes(r.status),
);

const priorityClass = (p: string) =>
  p === "High" ? "text-destructive" : p === "Medium" ? "text-warning" : "text-muted-foreground";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">All Requests</h1>

      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Request ID</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Issue</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Aging</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRequests.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{r.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/users/$id"
                      params={{ id: r.userId }}
                      className="hover:text-primary hover:underline"
                    >
                      {r.user}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.issue}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${priorityClass(r.priority)}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <JobAgeBadge createdAt={r.createdAt} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" asChild>
                      <Link to="/admin/requests/$id" params={{ id: r.id }}>
                        View Details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {activeRequests.map((r) => (
          <Link
            key={r.id}
            to="/admin/requests/$id"
            params={{ id: r.id }}
            className="block rounded-xl border bg-card p-4 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{r.id}</div>
                <div className="text-xs text-muted-foreground">{r.user}</div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {r.status}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground line-clamp-1">{r.issue}</div>
            <div className="mt-2 flex items-center justify-between">
              <JobAgeBadge createdAt={r.createdAt} />
              <span className={`text-xs font-semibold ${priorityClass(r.priority)}`}>
                {r.priority}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  ),
});
