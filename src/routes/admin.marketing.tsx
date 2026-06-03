import { createFileRoute } from "@tanstack/react-router";
import { campaigns } from "@/data/admin";

export const Route = createFileRoute("/admin/marketing")({
  head: () => ({ meta: [{ title: "Marketing — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl font-bold sm:text-3xl">Marketing Dashboard</h1><button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create Campaign</button></div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Audience</th><th className="px-4 py-3 text-left">Sent On</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>{campaigns.map((c) => (
            <tr key={c.name} className="border-t"><td className="px-4 py-3 font-semibold">{c.name}</td><td className="px-4 py-3">{c.type}</td><td className="px-4 py-3 text-muted-foreground">{c.audience}</td><td className="px-4 py-3 text-muted-foreground">{c.sent}</td><td className="px-4 py-3"><span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">{c.status}</span></td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <div className="font-display font-semibold">Create New Campaign</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input placeholder="Title" className="h-11 rounded-lg border bg-background px-3 text-sm" /><select className="h-11 rounded-lg border bg-background px-3 text-sm"><option>Promotion</option><option>Email</option><option>Push</option></select></div>
        <textarea rows={3} placeholder="Message…" className="mt-3 w-full rounded-lg border bg-background p-3 text-sm" />
        <button className="mt-3 h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">Send Campaign</button>
      </div>
    </div>
  ),
});