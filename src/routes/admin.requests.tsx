import { createFileRoute } from "@tanstack/react-router";
import { adminRequests } from "@/data/admin";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">All Requests</h1>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 text-left">Request ID</th><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Issue</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Priority</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
          <tbody>{adminRequests.map((r) => (
            <tr key={r.id} className="border-t"><td className="px-4 py-3 font-semibold">{r.id}</td><td className="px-4 py-3">{r.user}</td><td className="px-4 py-3 text-muted-foreground">{r.issue}</td><td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.status}</span></td><td className="px-4 py-3"><span className={`text-xs font-semibold ${r.priority==="High"?"text-destructive":r.priority==="Medium"?"text-warning":"text-muted-foreground"}`}>{r.priority}</span></td><td className="px-4 py-3 text-right"><button className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Assign</button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  ),
});