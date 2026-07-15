import { definePage, Link } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { adminUsers, grievances } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Page = definePage("/admin/users/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} â€” User` }] }),
  component: UserDetail,
});

function UserDetail() {
  const { id } = Page.useParams();
  const user = adminUsers.find((u) => u.id === id);
  const userGrievances = grievances.filter((g) => g.raisedById === id || g.raisedBy === user?.name);

  if (!user) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">User {id} not found.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/users">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4" /> All users
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            {user.id} Â· Joined {user.joined}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contact & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {user.phone}
            </div>
            <div>
              <span className="text-muted-foreground">City: </span>
              {user.city}
            </div>
            <div>
              <span className="text-muted-foreground">Total Requests: </span>
              <span className="font-semibold">{user.requests}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AMC Plan: </span>
              {user.amcPlan}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grievance History</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrievances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No grievances raised.</p>
            ) : (
              <div className="divide-y">
                {userGrievances.map((g) => (
                  <Link
                    key={g.id}
                    to="/admin/grievances/$id"
                    params={{ id: g.id }}
                    className="flex justify-between py-2 text-sm hover:text-primary"
                  >
                    <span>
                      {g.id} Â· {g.issue}
                    </span>
                    <span className="text-xs">{g.status}</span>
                  </Link>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/admin/grievances/new">Raise Grievance</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
