import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, MapPin, Calendar, AlertTriangle } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/new-request")({
  head: () => ({ meta: [{ title: "New Request — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Raise Service Request" showBack>
      <NewRequest />
    </CustomerShell>
  ),
});

function NewRequest() {
  const nav = useNavigate();
  const [urgent, setUrgent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Request submitted!");
        nav({ to: "/customer/requests" });
      }}
      className="space-y-4 px-5 py-5"
    >
      <Field label="Drone Model">
        <select className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15">
          <option>DJI Mavic 3 Pro</option>
          <option>DJI Mini 4 Pro</option>
          <option>DJI Air 3</option>
          <option>DJI Inspire 3</option>
        </select>
      </Field>
      <Field label="Issue Type">
        <select className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15">
          <option>Propeller Issue</option>
          <option>Battery Issue</option>
          <option>Camera/Gimbal</option>
          <option>Motor Failure</option>
          <option>Firmware</option>
          <option>General Checkup</option>
        </select>
      </Field>
      <Field label="Problem Description">
        <textarea
          rows={4}
          placeholder="Describe the issue…"
          className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </Field>
      <Field label="Upload Photos / Videos">
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-xl border-2 border-dashed bg-muted/40" />
          ))}
          <button
            type="button"
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        </div>
      </Field>
      <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
        <input
          defaultValue="Koramangala, Bengaluru"
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </Field>
      <Field label="Expected Completion Date" icon={<Calendar className="h-4 w-4" />}>
        <input
          type="date"
          defaultValue="2026-05-25"
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </Field>
      <label className="flex items-center gap-3 rounded-xl border bg-card p-3">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="flex-1 text-sm font-medium">Urgent / Priority Service</span>
      </label>
      <button
        type="submit"
        className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Submit Request
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
