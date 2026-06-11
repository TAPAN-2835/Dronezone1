import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Phone, MessageSquare, MapPin, Check, Paperclip, Clock, ExternalLink } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customerRequests, trackingStages } from "@/data/customer";
import { getMapEmbedUrl, getMapSearchUrl } from "@/lib/map-utils";

export const Route = createFileRoute("/customer/requests/$id")({
  head: () => ({ meta: [{ title: "Request Details — DroneZone" }] }),
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
          <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-[oklch(0.45_0.15_75)] capitalize">
            {req.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original Request</div>
        <p className="mt-2 text-sm leading-relaxed">{req.originalDescription ?? req.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Submitted: {req.createdAt}
        </div>
        {req.scheduledAt && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Scheduled: {req.scheduledAt}
          </div>
        )}
      </div>

      {req.attachments && req.attachments.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" /> Submitted Files
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {req.attachments.map((a) => (
              <div key={a.id} className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="mt-1.5 text-xs font-medium">{a.name}</span>
                <span className="text-[10px] uppercase text-muted-foreground">{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <a href={`tel:${req.provider.phone.replace(/\s/g, "")}`} className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
              <Phone className="h-4 w-4" />
            </a>
            <Link to="/customer/chat" className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border">
        <iframe
          title="Service location"
          src={getMapEmbedUrl(req.location)}
          className="h-44 w-full border-0"
          loading="lazy"
        />
      </div>
      <a
        href={getMapSearchUrl(req.location)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
      >
        <MapPin className="h-4 w-4" /> View on Map <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </a>

      <Link to="/customer/grievances/new" className="block text-center text-sm font-medium text-destructive hover:underline">
        Raise a grievance about this request
      </Link>
    </div>
  );
}
