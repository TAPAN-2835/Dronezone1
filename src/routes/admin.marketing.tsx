import { createFileRoute } from "@tanstack/react-router";
import { campaigns } from "@/data/admin";

export const Route = createFileRoute("/admin/marketing")({
  head: () => ({ meta: [{ title: "Marketing — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      {/* Header row — wraps on small screens */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Marketing Dashboard</h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Create Campaign
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Audience</th>
                <th className="px-4 py-3 text-left">Sent On</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.name} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.audience}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.sent}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-3 sm:hidden">
        {campaigns.map((c) => (
          <div key={c.name} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.type} · {c.audience}</div>
              </div>
              <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">{c.status}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Sent: {c.sent}</div>
          </div>
        ))}
      </div>

      {/* Create campaign form */}
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="font-display font-semibold">Create New Campaign</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input placeholder="Title" className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
          <select className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40">
            <option>Promotion</option>
            <option>Email</option>
            <option>Push</option>
          </select>
        </div>
        <textarea
          rows={3}
          placeholder="Message…"
          className="mt-3 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
        <button className="mt-3 h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground sm:w-auto">
          Send Campaign
        </button>
      </div>
    </div>
  ),
});