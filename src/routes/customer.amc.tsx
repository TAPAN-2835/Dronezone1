import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Calendar, FileText, Wrench, X, Check, RotateCcw, Crown } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { amc, amcPlans, inr } from "@/data/customer";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/amc")({
  head: () => ({ meta: [{ title: "My AMC — DroneZone" }] }),
  component: () => (
    <CustomerShell title="My AMC">
      <AMC />
    </CustomerShell>
  ),
});

function AMC() {
  const [showPlans, setShowPlans] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <div className="space-y-5 px-5 py-5">
      {/* Current plan hero card */}
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

      {/* Auto-renewal toggle */}
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <RotateCcw className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Auto-Renewal</div>
            <div className="text-xs text-muted-foreground">
              {autoRenew ? "Plan renews automatically on expiry" : "You'll need to renew manually"}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setAutoRenew(!autoRenew);
            toast.success(autoRenew ? "Auto-renewal turned off" : "Auto-renewal turned on");
          }}
          className={`relative h-6 w-11 rounded-full transition-colors ${autoRenew ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoRenew ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      {/* Plan benefits */}
      <div>
        <div className="mb-2 text-sm font-semibold">Plan Benefits</div>
        <div className="grid grid-cols-2 gap-2">
          {amc.benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-xs font-medium">
              <Check className="h-3.5 w-3.5 text-success shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <Row icon={Calendar} label="Schedule Service" onTap={() => toast.info("Scheduling service under AMC...")} />
        <Row icon={Wrench} label="Raise AMC Ticket" onTap={() => toast.info("AMC ticket form opening...")} />
        <Row icon={FileText} label="AMC Documents" sub="Download Agreement" onTap={() => toast.success("Downloading AMC agreement...")} />
      </div>

      {/* Renew AMC button */}
      <button
        onClick={() => setShowPlans(true)}
        className="block h-12 w-full rounded-xl bg-primary text-center text-sm font-semibold leading-[3rem] text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
      >
        Renew AMC
      </button>

      {/* Plan selection overlay */}
      {showPlans && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Header */}
          <div className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <button onClick={() => setShowPlans(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
            <span className="font-display text-base font-semibold">Choose a Plan</span>
          </div>

          {/* Plans list */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div className="text-center">
              <div className="font-display text-lg font-bold">Select Your AMC Plan</div>
              <div className="text-sm text-muted-foreground mt-1">Choose the plan that best fits your needs</div>
            </div>

            {amcPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border-2 bg-card p-5 transition ${
                  plan.recommended ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                {plan.recommended && (
                  <div className="mb-3 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Recommended</span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg font-bold">{plan.name}</div>
                    <div className="text-xs text-muted-foreground">{plan.visits} visits {plan.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-bold text-primary">{inr(plan.price)}</div>
                    <div className="text-[10px] text-muted-foreground">{plan.period}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {plan.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-sm">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${plan.recommended ? "text-primary" : "text-success"}`} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowPlans(false);
                    toast.success(`${plan.name} selected! Redirecting to payment...`);
                  }}
                  className={`mt-4 h-11 w-full rounded-xl text-sm font-semibold transition cursor-pointer ${
                    plan.recommended
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  Select {plan.name}
                </button>
              </div>
            ))}

            {/* Compare note */}
            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <div className="text-xs text-muted-foreground">
                All plans include GST. Plans auto-renew if enabled.
                <br />Contact support for custom enterprise plans.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, sub, onTap }: { icon: any; label: string; sub?: string; onTap?: () => void }) {
  return (
    <button onClick={onTap} className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left hover:bg-accent/40 transition cursor-pointer">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}