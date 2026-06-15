import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  User,
  Building2,
  Award,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
} from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customer, type ProfileSectionId } from "@/data/customer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const sectionMeta: Record<ProfileSectionId | "support", { title: string; icon: typeof User }> = {
  personal: { title: "Personal Details", icon: User },
  business: { title: "Business Details", icon: Building2 },
  certifications: { title: "Certifications", icon: Award },
  areas: { title: "Service Areas", icon: MapPin },
  documents: { title: "Documents", icon: FileText },
  bank: { title: "Bank Details", icon: CreditCard },
  "amc-prefs": { title: "AMC Preferences", icon: Shield },
  notifications: { title: "Notification Preferences", icon: Bell },
  support: { title: "Help & Support", icon: HelpCircle },
};

export const Route = createFileRoute("/customer/profile/$section")({
  head: ({ params }) => ({ meta: [{ title: `${params.section} — Profile` }] }),
  component: ProfileSection,
});

function ProfileSection() {
  const { section } = Route.useParams();
  const meta = sectionMeta[section as ProfileSectionId | "support"];

  if (!meta) {
    return (
      <CustomerShell title="Profile" showBack>
        <div className="p-5 text-sm text-muted-foreground">Section not found.</div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell title={meta.title} showBack>
      <div className="px-5 py-5">
        <Link
          to="/customer/profile"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Profile
        </Link>

        {section === "personal" && (
          <div className="space-y-4 rounded-2xl border bg-card p-4 text-sm">
            <Row label="Full Name" value={customer.name} />
            <Row label="Email" value={customer.email} />
            <Row label="Phone" value={customer.phone} />
            <Row label="Member Since" value={customer.joined} />
          </div>
        )}

        {section === "business" && (
          <div className="space-y-4 rounded-2xl border bg-card p-4 text-sm">
            <Row label="Business Name" value={customer.business.name} />
            <Row label="GSTIN" value={customer.business.gst} />
            <Row label="Business Type" value={customer.business.type} />
          </div>
        )}

        {section === "certifications" && (
          <div className="rounded-2xl border bg-card p-4">
            <ul className="space-y-3">
              {customer.certifications.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-success" /> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {section === "areas" && (
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Saved Locations
            </div>
            {customer.addresses.map((a) => (
              <div key={a.label} className="mb-3 text-sm">
                <div className="font-semibold">{a.label}</div>
                <div className="text-muted-foreground">{a.address}</div>
              </div>
            ))}
            <div className="mt-4 text-xs font-semibold uppercase text-muted-foreground">
              Service Areas
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {customer.serviceAreas.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {section === "documents" && (
          <div className="divide-y rounded-2xl border bg-card">
            {customer.documents.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-4 text-sm">
                <span>{d.name}</span>
                <span
                  className={`text-xs font-semibold ${d.status === "Verified" ? "text-success" : "text-warning"}`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {section === "bank" && (
          <div className="space-y-4 rounded-2xl border bg-card p-4 text-sm">
            <Row label="Bank" value={customer.bank.name} />
            <Row label="Account" value={customer.bank.account} />
            <Row label="IFSC" value={customer.bank.ifsc} />
          </div>
        )}

        {section === "amc-prefs" && (
          <div className="space-y-4 rounded-2xl border bg-card p-4 text-sm">
            <Row label="Preferred Plan" value={customer.amcPreferences.preferredPlan} />
            <div className="flex items-center justify-between">
              <Label>Auto Renewal</Label>
              <Switch checked={customer.amcPreferences.autoRenewal} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Expiry Notifications</Label>
              <Switch checked={customer.amcPreferences.notifyBeforeExpiry} />
            </div>
          </div>
        )}

        {section === "notifications" && (
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            {Object.entries(customer.notificationPrefs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm capitalize">
                <Label>{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                <Switch checked={val} />
              </div>
            ))}
          </div>
        )}

        {section === "support" && (
          <div className="rounded-2xl border bg-card p-4 text-sm space-y-3">
            <p className="text-muted-foreground">Need help? Reach our support team.</p>
            <Row label="Email" value="support@dronezone.com" />
            <Row label="Phone" value="+91 1800-123-4567" />
            <Row label="Hours" value="Mon–Sat, 9 AM – 7 PM IST" />
          </div>
        )}

        {section === "personal" && (
          <div className="mt-4 rounded-2xl border bg-card p-4">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              My Drones
            </div>
            {customer.drones.map((d) => (
              <div key={d.serial} className="border-t py-3 first:border-0 first:pt-0 text-sm">
                <div className="font-semibold">{d.model}</div>
                <div className="text-xs text-muted-foreground">
                  {d.serial} · {d.purchaseDate} · Warranty: {d.warranty}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
