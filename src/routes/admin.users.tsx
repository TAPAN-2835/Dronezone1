import { definePage, Link } from "@/lib/router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/lib/api/admin";

export const Page = definePage("/admin/users")({
  head: () => ({ meta: [{ title: "Users â€” DroneZone Admin" }] }),
  loader: () => getAdminUsers(),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { users } = Page.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>

      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{user.phone}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/users/$id" params={{ id: user.id }}>
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="space-y-3 sm:hidden">
        {users.map((user: any) => (
          <Link
            key={user.id}
            to="/admin/users/$id"
            params={{ id: user.id }}
            className="block rounded-xl border bg-card p-4 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">
                  {user.first_name} {user.last_name}
                </div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Active
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{user.phone}</span>
              <span>
                Joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "short" })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
