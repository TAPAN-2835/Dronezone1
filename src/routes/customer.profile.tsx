import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, User, MapPin, Plane, CreditCard, History, Bell, HelpCircle, LogOut } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customer } from "@/data/customer";
import { toast } from "sonner";

const items = [
  { icon: User, label: "Personal Information" },
  { icon: MapPin, label: "Saved Locations" },
  { icon: Plane, label: "My Drones" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: History, label: "Service History", to: "/customer/requests" as const },
  { icon: Bell, label: "Notification Preferences" },
  { icon: HelpCircle, label: "Help & Support" },
];

export const Route = createFileRoute("/customer/profile")({
  head: () => ({ meta: [{ title: "Profile — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Profile">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">JD</div>
          <div className="flex-1">
            <div className="font-display text-base font-semibold">{customer.name}</div>
            <div className="text-xs text-muted-foreground">{customer.email}</div>
          </div>
        </div>
        <div className="mt-4 divide-y rounded-2xl border bg-card">
          {items.map((it) => {
            const content = (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <it.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{it.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
            return it.to ? (
              <Link key={it.label} to={it.to}>
                {content}
              </Link>
            ) : (
              <button
                key={it.label}
                onClick={() => toast.info(`${it.label} is currently read-only in demo mode.`)}
                className="w-full text-left hover:bg-muted/30 transition-colors"
              >
                {content}
              </button>
            );
          })}
        </div>
        <Link to="/" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-card text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Logout
        </Link>
      </div>
    </CustomerShell>
  ),
});