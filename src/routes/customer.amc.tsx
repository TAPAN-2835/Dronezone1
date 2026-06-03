import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Calendar, FileText, Wrench } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { amc } from "@/data/customer";

export const Route = createFileRoute("/customer/amc")({
  head: () => ({ meta: [{ title: "My AMC — DroneZone" }] }),
  component: () => (
    <CustomerShell title="My AMC">
      <AMC />
    </CustomerShell>
  ),
});

function AMC() {
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.22_255)] p-5 text-white shadow-lg shadow-primary/20">
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">Active</span>
        <div className="text-xs uppercase tracking-wide text-white/70">DroneZone AMC</div>
        <div className="mt-1 font-display text-2xl font-bold">{amc.plan}</div>
        <div className="mt-1 text-xs text-white/80">Valid till {amc.validTill}</div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xs text-white/70">Remaining Visits</div>
            <div className="font-display text-2xl font-bold">{amc.visitsTotal - amc.visitsUsed} <span className="text-sm font-normal text-white/70">/ {amc.visitsTotal}</span></div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">Plan Benefits</div>
        <div className="grid grid-cols-2 gap-2">
          {amc.benefits.map((b) => (
            <div key={b} className="rounded-xl border bg-card p-3 text-center text-xs font-medium">{b}</div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Row icon={Calendar} label="Schedule Service" />
        <Row icon={Wrench} label="Raise AMC Ticket" />
        <Row icon={FileText} label="AMC Documents" sub="Download Agreement" />
      </div>

      <Link to="/customer/amc" className="block h-12 rounded-xl bg-primary text-center text-sm font-semibold leading-[3rem] text-primary-foreground hover:bg-primary/90">
        Renew AMC
      </Link>
    </div>
  );
}

function Row({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left hover:bg-accent/40">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}