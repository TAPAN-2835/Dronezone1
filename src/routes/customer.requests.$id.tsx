import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MessageSquare, MapPin, Check, ChevronDown, ChevronUp, Calendar, AlertTriangle, Plane, FileText, X, Navigation } from "lucide-react";
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="space-y-5 px-5 py-5">
      {/* Status card */}
      <div className="rounded-2xl border bg-gradient-to-br from-card to-accent/30 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{req.id}</div>
            <div className="mt-1 font-display text-lg font-semibold">{req.issue}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{req.drone}</div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            req.status === "completed"
              ? "bg-success/15 text-[oklch(0.45_0.15_152)]"
              : "bg-warning/15 text-[oklch(0.45_0.15_75)]"
          }`}>
            {req.status === "completed" ? "Completed" : "In Progress"}
          </span>
        </div>
      </div>

      {/* Original Request Details — collapsible */}
      <div className="rounded-2xl border bg-card">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Original Request Details</span>
          </div>
          {detailsOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {detailsOpen && (
          <div className="border-t px-4 pb-4 pt-3 space-y-3">
            <DetailRow icon={Plane} label="Drone Model" value={req.drone} />
            <DetailRow icon={AlertTriangle} label="Issue Type" value={req.issue} />
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-0.5">Description</div>
              <div className="text-sm text-foreground bg-muted/30 rounded-lg p-3">{req.description}</div>
            </div>
            <DetailRow icon={MapPin} label="Service Location" value={req.location} />
            <DetailRow icon={Calendar} label="Requested Date" value={req.scheduledAt} />
            <DetailRow icon={Calendar} label="Submitted On" value={req.createdAt} />
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${req.urgent ? "text-warning" : "text-muted-foreground"}`} />
              <span className="text-[11px] font-medium text-muted-foreground">Priority:</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${req.urgent ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" : "bg-muted text-muted-foreground"}`}>
                {req.urgent ? "Urgent" : "Normal"}
              </span>
            </div>
            {req.amount && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground">Amount Charged</span>
                <span className="font-display font-bold text-foreground">₹{req.amount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracking timeline */}
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

      {/* Provider card */}
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

      {/* View on Map button */}
      <button
        onClick={() => setMapOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
      >
        <MapPin className="h-4 w-4" /> View on Map
      </button>

      {/* Map overlay */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Map header */}
          <div className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <button onClick={() => setMapOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
            <span className="font-display text-base font-semibold">Live Tracking</span>
          </div>

          {/* Simulated map area */}
          <div className="relative flex-1 bg-[oklch(0.95_0.01_220)] overflow-hidden">
            {/* Grid lines to simulate a map */}
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            {/* Simulated roads */}
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-white/80 shadow-sm" />
            <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-white/80 shadow-sm" />
            <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-white/80 shadow-sm" />
            <div className="absolute left-0 right-0 top-1/4 h-1.5 bg-white/60 shadow-sm" />
            <div className="absolute left-0 right-0 top-3/4 h-1.5 bg-white/60 shadow-sm" />

            {/* Service location marker (destination) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold shadow-md border">Your Location</div>
            </div>

            {/* Engineer marker (animated) */}
            <div className="absolute left-[30%] top-[35%] flex flex-col items-center animate-bounce" style={{ animationDuration: "2s" }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-success/30 animate-ping" style={{ animationDuration: "1.5s" }} />
                <div className="relative rounded-full bg-success p-2 shadow-lg">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold shadow-md border whitespace-nowrap">
                {req.provider?.name ?? "Engineer"} · 15 min
              </div>
            </div>

            {/* Dotted path between engineer and destination */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <line x1="33%" y1="40%" x2="50%" y2="50%" stroke="oklch(0.546 0.214 263)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            </svg>
          </div>

          {/* Bottom info card */}
          <div className="border-t bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              {req.provider && (
                <>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15 font-semibold text-success text-sm">
                    {req.provider.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{req.provider.name}</div>
                    <div className="text-xs text-muted-foreground">Arriving in ~15 minutes</div>
                  </div>
                  <button
                    onClick={() => toast.success(`Calling ${req.provider?.name}...`)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{req.location}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-[11px] font-medium text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}