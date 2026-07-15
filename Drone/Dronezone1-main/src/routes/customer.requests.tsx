import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { StatusPill } from "./customer.dashboard";
import { useState } from "react";
import { getCustomerRequests } from "@/lib/api/customer.server";
import { format } from "date-fns";

export const Route = createFileRoute("/customer/requests")({
  head: () => ({ meta: [{ title: "My Requests — DroneZone" }] }),
  loader: () => getCustomerRequests(),
  component: RequestsRoute,
});

function RequestsRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/customer/requests") return <Outlet />;
  return (
    <CustomerShell title="My Requests">
      <RequestsList />
    </CustomerShell>
  );
}

function RequestsList() {
  const requests = Route.useLoaderData();
  const [tab, setTab] = useState<"all" | "active" | "resolved">("all");
  
  const filtered = requests.filter((r: any) =>
    tab === "all" ? true : tab === "resolved" ? r.status === "completed" || r.status === "resolved" : r.status !== "completed" && r.status !== "resolved",
  );
  
  return (
    <div className="px-5 py-4">
      <div className="mb-4 inline-flex rounded-xl border bg-card p-1 text-xs">
        {(["all", "active", "resolved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 font-medium capitalize transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No requests found in this category.
          </div>
        ) : (
          filtered.map((r: any) => (
            <Link
              key={r.id}
              to="/customer/requests/$id"
              params={{ id: r.id }}
              className="block rounded-xl border bg-card p-4 hover:bg-accent/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.request_number}</div>
                  <div className="mt-0.5 text-sm">{r.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.drones?.model || "Unknown Drone"} · {format(new Date(r.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
