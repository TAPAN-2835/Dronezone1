import { createFileRoute } from "@tanstack/react-router";
import { adminUsers } from "@/data/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Joined</th><th className="px-4 py-3 text-right">Requests</th></tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-t"><td className="px-4 py-3 font-semibold">{u.id}</td><td className="px-4 py-3">{u.name}</td><td className="px-4 py-3 text-muted-foreground">{u.email}</td><td className="px-4 py-3 text-muted-foreground">{u.joined}</td><td className="px-4 py-3 text-right font-semibold">{u.requests}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});