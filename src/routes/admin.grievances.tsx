import { definePage, Link } from "@/lib/router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listGrievances } from "@/lib/api/platform";

export const Page = definePage("/admin/grievances")({
  head: () => ({ meta: [{ title: "Grievances — DroneZone Admin" }] }),
  loader: () => listGrievances(),
  component: GrievancesList,
});

function GrievancesList() {
  const grievances = Page.useLoaderData<Awaited<ReturnType<typeof listGrievances>>>();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(
    () =>
      grievances.filter(
        (g) =>
          (status === "all" || g.status === status) &&
          (!q ||
            `${g.grievance_number} ${g.subject} ${g.category}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [grievances, q, status],
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Grievances</h1>
          <p className="text-sm text-muted-foreground">Live customer and provider cases</p>
        </div>
        <Button asChild>
          <Link to="/admin/grievances/new">
            <Plus className="h-4 w-4" />
            Raise Grievance
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search grievances…"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {["open", "assigned", "in_progress", "waiting_user", "resolved", "closed"].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="p-3 font-semibold">{g.grievance_number}</td>
                <td className="p-3">{g.subject}</td>
                <td className="p-3 text-muted-foreground">{g.category}</td>
                <td className="p-3 capitalize">{g.priority}</td>
                <td className="p-3 capitalize">{g.status.replaceAll("_", " ")}</td>
                <td className="p-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/grievances/$id" params={{ id: g.id }}>
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="p-10 text-center text-sm text-muted-foreground">No grievances found.</div>
        )}
      </div>
    </div>
  );
}
