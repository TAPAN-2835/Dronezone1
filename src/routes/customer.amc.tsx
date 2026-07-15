import { definePage, useRouter } from "@/lib/router";
import { useState } from "react";
import { Check, Shield } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Switch } from "@/components/ui/switch";
import { getAmcOverview, setAmcAutoRenew, subscribeAmc } from "@/lib/api/platform";
import { toast } from "sonner";

const money = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    value,
  );
export const Page = definePage("/customer/amc")({
  head: () => ({ meta: [{ title: "My AMC — DroneZone" }] }),
  loader: () => getAmcOverview(),
  component: () => (
    <CustomerShell title="My AMC">
      <Amc />
    </CustomerShell>
  ),
});
function Amc() {
  const { plans, subscriptions } = Page.useLoaderData<Awaited<ReturnType<typeof getAmcOverview>>>();
  const current = subscriptions.find((s: any) => ["active", "pending_payment"].includes(s.status));
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function choose(id: string) {
    setBusy(true);
    try {
      await subscribeAmc(id, false);
      toast.success("Plan selected. Payment is pending secure checkout confirmation.");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to select plan");
    } finally {
      setBusy(false);
    }
  }
  async function toggle(value: boolean) {
    if (!current) return;
    try {
      await setAmcAutoRenew(current.id, value);
      await router.invalidate();
      toast.success(value ? "Auto renewal enabled" : "Auto renewal disabled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update subscription");
    }
  }
  return (
    <div className="space-y-5 px-5 py-5">
      {current ? (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.22_255)] p-5 text-white">
            <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold capitalize">
              {current.status.replaceAll("_", " ")}
            </span>
            <div className="text-xs uppercase text-white/70">Current AMC</div>
            <div className="mt-1 font-display text-2xl font-bold">{current.amc_plans?.name}</div>
            <div className="mt-1 text-xs text-white/80">
              {current.expires_on
                ? `Valid till ${new Date(current.expires_on).toLocaleDateString("en-IN")}`
                : "Activation awaits payment confirmation"}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div>
              <div className="text-sm font-semibold">Auto Renewal</div>
              <p className="text-xs text-muted-foreground">Renew when the active plan expires</p>
            </div>
            <Switch
              checked={current.auto_renew}
              disabled={current.status !== "active"}
              onCheckedChange={(v) => void toggle(v)}
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border bg-card p-5 text-center text-sm text-muted-foreground">
          No active AMC subscription. Choose a plan below.
        </div>
      )}
      <div>
        <div className="mb-3 text-sm font-semibold">AMC Plans</div>
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 ${current?.plan_id === plan.id ? "border-primary bg-primary/5" : "bg-card"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="font-display text-xl font-bold">
                    {money(plan.price, plan.currency)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / {plan.duration_months} months
                    </span>
                  </div>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              <ul className="mt-3 space-y-1">
                {plan.amc_plan_benefits
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <li key={item.id} className="flex gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-success" />
                      {item.benefit}
                    </li>
                  ))}
              </ul>
              {!current && (
                <button
                  disabled={busy}
                  onClick={() => void choose(plan.id)}
                  className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Processing…" : "Choose plan"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        Payments are activated only after trusted server-side payment confirmation. The browser
        cannot mark a transaction paid.
      </p>
    </div>
  );
}
