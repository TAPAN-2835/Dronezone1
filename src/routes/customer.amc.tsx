import { definePage, Link } from "@/lib/router";
import { useState } from "react";
import { ChevronRight, Calendar, FileText, Wrench, Check, Shield } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { amc, amcPlans, inr } from "@/data/customer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Page = definePage("/customer/amc")({
  head: () => ({ meta: [{ title: "My AMC â€” DroneZone" }] }),
  component: () => (
    <CustomerShell title="My AMC">
      <AMC />
    </CustomerShell>
  ),
});

function AMC() {
  const [autoRenewal, setAutoRenewal] = useState(amc.autoRenewal);
  const [showRenew, setShowRenew] = useState(false);

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.22_255)] p-5 text-white shadow-lg shadow-primary/20">
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
          {amc.active ? "Active" : "Expired"}
        </span>
        <div className="text-xs uppercase tracking-wide text-white/70">Current AMC Status</div>
        <div className="mt-1 font-display text-2xl font-bold">{amc.plan}</div>
        <div className="mt-1 text-xs text-white/80">Valid till {amc.validTill}</div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xs text-white/70">Remaining Visits</div>
            <div className="font-display text-2xl font-bold">
              {amc.visitsTotal - amc.visitsUsed}{" "}
              <span className="text-sm font-normal text-white/70">/ {amc.visitsTotal}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div>
          <Label htmlFor="auto-renew" className="text-sm font-semibold">
            Auto Renewal
          </Label>
          <p className="text-xs text-muted-foreground">Automatically renew when plan expires</p>
        </div>
        <Switch
          id="auto-renew"
          checked={autoRenewal}
          onCheckedChange={(v) => {
            setAutoRenewal(v);
            toast.success(v ? "Auto renewal enabled" : "Auto renewal disabled");
          }}
        />
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">Plan Benefits</div>
        <div className="grid grid-cols-2 gap-2">
          {amc.benefits.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 rounded-xl border bg-card p-3 text-xs font-medium"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {b}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold">Compare AMC Plans</div>
        <div className="space-y-3">
          {amcPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 ${plan.id === amc.planId ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.popular && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Popular
                      </span>
                    )}
                    {plan.id === amc.planId && (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-display text-xl font-bold">
                    {inr(plan.price)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / {plan.duration}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {plan.visits} service visits included
                  </div>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <ul className="mt-3 space-y-1">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-success" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Row
          icon={Calendar}
          label="Schedule Service"
          onClick={() => toast.info("Service scheduling opens calendar picker.")}
        />
        <Row
          icon={Wrench}
          label="Raise AMC Ticket"
          onClick={() => toast.info("AMC ticket created for your active plan.")}
        />
        <Row
          icon={FileText}
          label="AMC Documents"
          sub="Download Agreement"
          onClick={() => toast.success("AMC agreement downloaded.")}
        />
      </div>

      {!showRenew ? (
        <button
          onClick={() => setShowRenew(true)}
          className="block h-12 w-full rounded-xl bg-primary text-center text-sm font-semibold leading-[3rem] text-primary-foreground hover:bg-primary/90"
        >
          Renew AMC
        </button>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="text-sm font-semibold">Renew Premium AMC</div>
          <p className="text-xs text-muted-foreground">
            Extend your plan for another 12 months at {inr(14999)}
          </p>
          <button
            onClick={() => toast.success("AMC renewed successfully! Valid till Dec 2027.")}
            className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
          >
            Confirm Renewal Â· {inr(14999)}
          </button>
          <button
            onClick={() => setShowRenew(false)}
            className="h-8 w-full text-xs text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  icon: typeof Calendar;
  label: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left hover:bg-accent/40"
    >
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
