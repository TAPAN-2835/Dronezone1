import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Phone, MessageSquare, MapPin, Check } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customerRequests, trackingStages } from "@/data/customer";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/requests/$id")({
  head: () => ({ meta: [{ title: "Request Tracking — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Request Details" showBack>
      <Tracking />
    </CustomerShell>
  ),
});

function Tracking() {
  const { id } = useParams({ from: "/customer/requests/$id" });
  const req = customerRequests.find((r) => r.id === id) ?? customerRequests[0];
  const currentIdx = trackingStages.findIndex((s) => s.key === req.status);
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="rounded-2xl border bg-gradient-to-br from-card to-accent/30 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{req.id}</div>
            <div className="mt-1 font-display text-lg font-semibold">{req.issue}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{req.drone}</div>
          </div>
          <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-[oklch(0.45_0.15_75)]">In Progress</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracking</div>
        <ol className="mt-4 space-y-4">
          {trackingStages.map((stage, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <li key={stage.key} className="relative flex gap-3">
                {i < trackingStages.length - 1 && (
                  <span className={`absolute left-[11px] top-6 h-full w-px ${done ? "bg-primary" : "bg-border"}`} />
                )}
                <div className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-primary text-white" : "border-2 border-border bg-card"} ${active ? "ring-4 ring-primary/20" : ""}`}>
                  {done && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="pb-1">
                  <div className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{stage.label}</div>
                  {done && <div className="text-xs text-muted-foreground">{req.createdAt}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {req.provider && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
              {req.provider.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{req.provider.name}</div>
              <div className="text-xs text-muted-foreground">Field Engineer · ★ {req.provider.rating}</div>
            </div>
            <button
              onClick={() => toast.success(`Calling ${req.provider?.name} (+91 98765 43210)...`)}
              className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success hover:bg-success/25 transition cursor-pointer"
            >
              <Phone className="h-4 w-4" />
            </button>
            <Link to="/customer/chat" className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><MessageSquare className="h-4 w-4" /></Link>
          </div>
        </div>
      )}

      <button
        onClick={() => toast.info("Real-time map tracking is simulated. The drone is en route.")}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
      >
        <MapPin className="h-4 w-4" /> View on Map
      </button>
    </div>
  );
}