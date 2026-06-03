import { createFileRoute } from "@tanstack/react-router";
import { providerApplications, providerDocs } from "@/data/admin";

export const Route = createFileRoute("/admin/providers")({
  head: () => ({ meta: [{ title: "Providers — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Provider Applications</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border bg-card lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 text-left">Provider</th><th className="px-4 py-3 text-left">Business</th><th className="px-4 py-3 text-left">Submitted</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody>{providerApplications.map((p) => (
              <tr key={p.provider} className="border-t"><td className="px-4 py-3 font-semibold">{p.provider}</td><td className="px-4 py-3 text-muted-foreground">{p.business}</td><td className="px-4 py-3 text-muted-foreground">{p.submitted}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status==="Pending"?"bg-warning/15 text-[oklch(0.45_0.15_75)]":"bg-primary/10 text-primary"}`}>{p.status}</span></td><td className="px-4 py-3 text-right"><button className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-accent">Review</button></td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="font-display text-base font-semibold">Documents Required</div>
          <ul className="mt-3 space-y-2">{providerDocs.map((d) => (
            <li key={d.name} className="flex items-center justify-between text-sm"><span>{d.name}</span><span className={`text-xs font-semibold ${d.status==="Verified"?"text-success":"text-warning"}`}>{d.status}</span></li>
          ))}</ul>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button className="h-10 rounded-lg bg-success text-xs font-semibold text-success-foreground">Approve</button>
            <button className="h-10 rounded-lg bg-destructive text-xs font-semibold text-destructive-foreground">Reject</button>
          </div>
        </div>
      </div>
    </div>
  ),
});