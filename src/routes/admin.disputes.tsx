import { createFileRoute } from "@tanstack/react-router";
import { disputes } from "@/data/admin";

const statusClass = (s: string) =>
  s === "Resolved"
    ? "bg-success/15 text-success"
    : s === "Open"
    ? "bg-destructive/10 text-destructive"
    : "bg-warning/15 text-[oklch(0.45_0.15_75)]";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({ meta: [{ title: "Disputes — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Disputes</h1>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Raised By</th>
                <th className="px-4 py-3 text-left">Against</th>
                <th className="px-4 py-3 text-left">Issue</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{d.id}</td>
                  <td className="px-4 py-3">{d.raisedBy}</td>
                  <td className="px-4 py-3">{d.against}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.issue}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(d.status)}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-accent">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-3 sm:hidden">
        {disputes.map((d) => (
          <div key={d.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{d.id}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{d.issue}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(d.status)}`}>{d.status}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{d.raisedBy}</span>
              <span>vs</span>
              <span className="font-medium text-foreground">{d.against}</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-accent">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});