import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { grievances } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUserDetails } from "@/lib/api/admin.server";

export const Route = createFileRoute("/admin/users/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — User` }] }),
  loader: ({ params }) => getAdminUserDetails({ data: { userId: params.id } }),
  component: UserDetail,
});

function UserDetail() {
  const loaderData = useLoaderData({ from: "/admin/users/$id" }) as any;
  const dbUser = loaderData?.user;
  const requests = loaderData?.requests;
  const userGrievances = grievances.filter((g) => g.raisedById === dbUser?.id || g.raisedBy === `${dbUser?.first_name} ${dbUser?.last_name}`);

  if (!dbUser) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/users">Back</Link>
        </Button>
      </div>
    );
  }

  const fullName = `${dbUser.first_name} ${dbUser.last_name}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4" /> All users
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {dbUser.first_name?.[0]}{dbUser.last_name?.[0]}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground">{dbUser.email}</p>
          <p className="text-sm text-muted-foreground">
            {dbUser.id} · Joined {new Date(dbUser.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
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
              {dbUser.phone}
            </div>
            <div>
              <span className="text-muted-foreground">City: </span>
              {"N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Total Requests: </span>
              <span className="font-semibold">{requests?.length || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AMC Plan: </span>
              {"Basic Plan"}
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
                      {g.id} · {g.issue}
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
