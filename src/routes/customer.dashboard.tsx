import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Shield, Sparkles } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { amc, customer, customerRequests, inr } from "@/data/customer";

export const Route = createFileRoute("/customer/dashboard")({
  head: () => ({ meta: [{ title: "Home — DroneZone" }] }),
  component: () => (
    <CustomerShell title="">
      <Home />
    </CustomerShell>
  ),
});

function Home() {
  const recent = customerRequests.slice(0, 3);
  return (
    <div className="space-y-5 px-5 pb-6 pt-4">
      <div>
        <div className="text-sm text-muted-foreground">Good morning,</div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Hello, {customer.name.split(" ")[0]} 👋
        </h1>
      </div>

      <Link
        to="/customer/new-request"
        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.22_255)] p-5 text-white shadow-lg shadow-primary/20"
      >
        <Sparkles className="absolute right-4 top-4 h-4 w-4 opacity-40" />
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
          <Plus className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-semibold">Raise Service Request</div>
          <div className="text-xs text-white/80">Get your drone issues resolved quickly</div>
        </div>
        <ChevronRight className="h-5 w-5" />
      </Link>

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              My AMC
            </span>
          </div>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
            Active
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="font-display text-lg font-semibold">{amc.plan}</div>
            <div className="text-xs text-muted-foreground">Valid till {amc.validTill}</div>
          </div>
          <Link to="/customer/amc" className="text-xs font-semibold text-primary">
            View Details
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Recent Requests</h2>
          <Link to="/customer/requests" className="text-xs font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recent.map((r) => (
            <Link
              key={r.id}
              to="/customer/requests/$id"
              params={{ id: r.id }}
              className="flex items-center justify-between rounded-xl border bg-card p-3 hover:bg-accent/40"
            >
              <div>
                <div className="text-sm font-semibold">{r.id}</div>
                <div className="text-xs text-muted-foreground">{r.issue}</div>
              </div>
              <StatusPill status={r.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted: { label: "Submitted", cls: "bg-primary/10 text-primary" },
    assigned: { label: "Assigned", cls: "bg-primary/10 text-primary" },
    en_route: { label: "En Route", cls: "bg-warning/15 text-[oklch(0.45_0.15_75)]" },
    inspecting: { label: "Inspecting", cls: "bg-warning/15 text-[oklch(0.45_0.15_75)]" },
    repairing: { label: "In Progress", cls: "bg-warning/15 text-[oklch(0.45_0.15_75)]" },
    testing: { label: "Testing", cls: "bg-warning/15 text-[oklch(0.45_0.15_75)]" },
    resolved: { label: "Resolved", cls: "bg-success/15 text-success" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${s.cls}`}>{s.label}</span>
  );
}

export { StatusPill };
// silence unused inr
void inr;
