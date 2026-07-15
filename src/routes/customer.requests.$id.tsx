import { definePage, Link, useParams } from "@/lib/router";
import { useState } from "react";
import { Phone, MessageSquare, MapPin, Check, Paperclip, Clock, ExternalLink } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { trackingStages } from "@/data/customer";
import { getRequestDetails } from "@/lib/api/customer";
import { format } from "date-fns";

export const Page = definePage("/customer/requests/$id")({
  head: () => ({ meta: [{ title: "Request Details â€” DroneZone" }] }),
  loader: ({ params }) => getRequestDetails({ data: { id: params.id } }),
  component: () => (
    <CustomerShell title="Request Details" showBack>
      <Tracking />
    </CustomerShell>
  ),
});

const dbTrackingStages = [
  { key: "draft", label: "Request Drafted" },
  { key: "in_approval", label: "Pending Approval" },
  { key: "review", label: "Under Review" },
  { key: "approved", label: "Approved & Assigned" },
  { key: "in_progress", label: "Service In Progress" },
  { key: "completed", label: "Completed" },
];

function Tracking() {
  const { request, assignment } = Page.useLoaderData();

  // Find the max index that we've passed based on status
  let currentIdx = dbTrackingStages.findIndex((s) => s.key === request.status);

  // If cancelled or rejected, maybe handle specially, but for now just fallback
  if (currentIdx === -1) {
    if (request.status === "cancelled" || request.status === "rejected") {
      currentIdx = dbTrackingStages.length; // or handle custom UI
    } else {
      currentIdx = 0;
    }
  }

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="rounded-2xl border bg-gradient-to-br from-card to-accent/30 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {request.request_number}
            </div>
            <div className="mt-1 font-display text-lg font-semibold">{request.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {request.drones?.model || "Unknown Drone"}
            </div>
          </div>
          <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-[oklch(0.45_0.15_75)] capitalize">
            {request.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Original Request
        </div>
        <p className="mt-2 text-sm leading-relaxed">{request.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Submitted: {format(new Date(request.created_at), "PPP")}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Expected Completion:{" "}
          {request.requested_completion_date
            ? format(new Date(request.requested_completion_date), "PPP")
            : "Pending"}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tracking
        </div>
        <ol className="mt-4 space-y-4">
          {dbTrackingStages.map((stage, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <li key={stage.key} className="relative flex gap-3">
                {i < dbTrackingStages.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-full w-px ${done ? "bg-primary" : "bg-border"}`}
                  />
                )}
                <div
                  className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-primary text-white" : "border-2 border-border bg-card"} ${active ? "ring-4 ring-primary/20" : ""}`}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="pb-1">
                  <div
                    className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {stage.label}
                  </div>
                  {done && (
                    <div className="text-xs text-muted-foreground">
                      {active ? "Current" : "Completed"}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {assignment && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
              {assignment.users?.first_name?.[0] || "P"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {assignment.provider_profiles?.business_name || "Assigned Provider"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Field Engineer Â· â˜… {assignment.provider_profiles?.average_rating || "New"}
              </div>
            </div>
            <a
              href={`tel:${assignment.users?.phone?.replace(/\s/g, "")}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success"
            >
              <Phone className="h-4 w-4" />
            </a>
            <Link
              to="/customer/chat"
              className={`grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary`}
            >
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Service Location
          </div>
          <div className="font-medium">
            {request.addresses
              ? `${request.addresses.address_line_1}, ${request.addresses.city}`
              : "No address specified"}
          </div>
        </div>
      </div>

      <Link
        to="/customer/grievances/new"
        className="block text-center text-sm font-medium text-destructive hover:underline"
      >
        Raise a grievance about this request
      </Link>
    </div>
  );
}
