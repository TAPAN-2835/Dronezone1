import { createFileRoute } from "@tanstack/react-router";
import { adminUsers } from "@/data/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Requests</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{u.id}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3 text-right font-semibold">{u.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-3 sm:hidden">
        {adminUsers.map((u) => (
          <div key={u.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {u.requests} reqs
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{u.id}</span>
              <span>Joined {u.joined}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});