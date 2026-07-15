import { definePage, Link, Outlet, useRouterState } from "@/lib/router";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customerRequests } from "@/data/customer";
import { StatusPill } from "./customer.dashboard";
import { useState } from "react";

export const Page = definePage("/customer/requests")({
  head: () => ({ meta: [{ title: "My Requests â€” DroneZone" }] }),
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
  const [tab, setTab] = useState<"all" | "active" | "resolved">("all");
  const filtered = customerRequests.filter((r) =>
    tab === "all" ? true : tab === "resolved" ? r.status === "resolved" : r.status !== "resolved",
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
        {filtered.map((r) => (
          <Link
            key={r.id}
            to="/customer/requests/$id"
            params={{ id: r.id }}
            className="block rounded-xl border bg-card p-4 hover:bg-accent/40"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{r.id}</div>
                <div className="mt-0.5 text-sm">{r.issue}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.drone} Â· {r.createdAt}
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
