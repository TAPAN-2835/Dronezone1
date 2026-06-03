import { createFileRoute } from "@tanstack/react-router";
import { adminRequests } from "@/data/admin";

const priorityClass = (p: string) =>
  p === "High" ? "text-destructive" : p === "Medium" ? "text-warning" : "text-muted-foreground";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">All Requests</h1>

      {/* Desktop table */}
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
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {adminRequests.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{r.id}</td>
                  <td className="px-4 py-3">{r.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.issue}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${priorityClass(r.priority)}`}>{r.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-3 sm:hidden">
        {adminRequests.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{r.id}</div>
                <div className="text-xs text-muted-foreground">{r.user}</div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.status}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground line-clamp-1">{r.issue}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs font-semibold ${priorityClass(r.priority)}`}>{r.priority} Priority</span>
              <button className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Assign</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});