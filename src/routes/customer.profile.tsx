import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, User, MapPin, Plane, CreditCard, History, Bell, HelpCircle, LogOut, Building2, Award, FileText, Shield, AlertOctagon } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customer } from "@/data/customer";

const iconMap = {
  User, MapPin, Plane, CreditCard, History, Bell, HelpCircle, Building2, Award, FileText, Shield, AlertOctagon,
};

const items = [
  { icon: "User" as const, label: "Personal Details", section: "personal" as const },
  { icon: "Building2" as const, label: "Business Details", section: "business" as const },
  { icon: "Award" as const, label: "Certifications", section: "certifications" as const },
  { icon: "MapPin" as const, label: "Service Areas", section: "areas" as const },
  { icon: "FileText" as const, label: "Documents", section: "documents" as const },
  { icon: "CreditCard" as const, label: "Bank Details", section: "bank" as const },
  { icon: "Shield" as const, label: "AMC Preferences", section: "amc-prefs" as const },
  { icon: "Bell" as const, label: "Notification Preferences", section: "notifications" as const },
  { icon: "History" as const, label: "Service History", to: "/customer/requests" as const },
  { icon: "AlertOctagon" as const, label: "Raise Grievance", to: "/customer/grievances/new" as const },
  { icon: "HelpCircle" as const, label: "Help & Support", section: "support" as const },
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
            const Icon = iconMap[it.icon];
            const content = (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{it.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
            if ("to" in it && it.to) {
              return <Link key={it.label} to={it.to}>{content}</Link>;
            }
            return (
              <Link key={it.label} to="/customer/profile/$section" params={{ section: it.section! }}>
                {content}
              </Link>
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
