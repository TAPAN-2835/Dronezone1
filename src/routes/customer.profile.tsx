import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, ChevronDown, User, MapPin, Plane, CreditCard, History, Bell, HelpCircle, LogOut,
  Edit2, Plus, Trash2, Mail, Phone, Calendar, CreditCard as CardIcon, Smartphone, MessageSquare,
} from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customer } from "@/data/customer";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({ meta: [{ title: "Profile — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Profile">
      <Profile />
    </CustomerShell>
  ),
});

function Profile() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  // Notification preference states
  const [notifPrefs, setNotifPrefs] = useState({
    serviceUpdates: true,
    promotions: false,
    amcReminders: true,
    paymentAlerts: true,
  });

  return (
    <div className="px-5 py-5">
      {/* Avatar card */}
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">JD</div>
        <div className="flex-1">
          <div className="font-display text-base font-semibold">{customer.name}</div>
          <div className="text-xs text-muted-foreground">{customer.email}</div>
          <div className="text-[10px] text-muted-foreground">Member since {customer.joined}</div>
        </div>
      </div>

      {/* Profile sections */}
      <div className="mt-4 divide-y rounded-2xl border bg-card">

        {/* Personal Information */}
        <AccordionItem
          icon={User}
          label="Personal Information"
          isOpen={expanded === "personal"}
          onToggle={() => toggle("personal")}
        >
          <div className="space-y-3 pt-2">
            <InfoRow icon={User} label="Full Name" value={customer.name} />
            <InfoRow icon={Mail} label="Email" value={customer.email} />
            <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            <InfoRow icon={Calendar} label="Member Since" value={customer.joined} />
            <button
              onClick={() => toast.info("Profile editing is simulated in demo mode.")}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-card text-sm font-semibold text-primary hover:bg-accent transition cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </button>
          </div>
        </AccordionItem>

        {/* Saved Locations */}
        <AccordionItem
          icon={MapPin}
          label="Saved Locations"
          isOpen={expanded === "locations"}
          onToggle={() => toggle("locations")}
        >
          <div className="space-y-2 pt-2">
            {customer.addresses.map((addr) => (
              <div key={addr.label} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{addr.label}</div>
                  <div className="text-xs text-muted-foreground">{addr.address}</div>
                </div>
                <button onClick={() => toast.info(`Editing ${addr.label} address...`)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toast.info(`Removing ${addr.label} address...`)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => toast.info("Add new location form will open...")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Location
            </button>
          </div>
        </AccordionItem>

        {/* My Drones */}
        <AccordionItem
          icon={Plane}
          label="My Drones"
          isOpen={expanded === "drones"}
          onToggle={() => toggle("drones")}
        >
          <div className="space-y-2 pt-2">
            {customer.drones.map((drone) => (
              <div key={drone.serial} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <Plane className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{drone.model}</div>
                  <div className="text-xs text-muted-foreground">Serial: {drone.serial}</div>
                </div>
                <button onClick={() => toast.info(`Editing ${drone.model}...`)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => toast.info("Add new drone form will open...")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Drone
            </button>
          </div>
        </AccordionItem>

        {/* Payment Methods */}
        <AccordionItem
          icon={CreditCard}
          label="Payment Methods"
          isOpen={expanded === "payments"}
          onToggle={() => toggle("payments")}
        >
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
              <Smartphone className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold">UPI</div>
                <div className="text-xs text-muted-foreground">john.doe@upi</div>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.15_152)]">Default</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
              <CardIcon className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Visa ending 4242</div>
                <div className="text-xs text-muted-foreground">Expires 12/28</div>
              </div>
              <button onClick={() => toast.info("Removing card...")} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => toast.info("Add payment method form will open...")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Payment Method
            </button>
          </div>
        </AccordionItem>

        {/* Service History — navigates to requests */}
        <Link to="/customer/requests" className="block">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Service History</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Notification Preferences */}
        <AccordionItem
          icon={Bell}
          label="Notification Preferences"
          isOpen={expanded === "notifs"}
          onToggle={() => toggle("notifs")}
        >
          <div className="space-y-1 pt-2">
            <ToggleRow
              label="Service Updates"
              sub="Status changes and engineer arrival"
              checked={notifPrefs.serviceUpdates}
              onChange={() => { setNotifPrefs(p => ({ ...p, serviceUpdates: !p.serviceUpdates })); toast.success("Preference updated"); }}
            />
            <ToggleRow
              label="Promotional Offers"
              sub="Discounts, deals, and campaigns"
              checked={notifPrefs.promotions}
              onChange={() => { setNotifPrefs(p => ({ ...p, promotions: !p.promotions })); toast.success("Preference updated"); }}
            />
            <ToggleRow
              label="AMC Reminders"
              sub="Renewal and visit reminders"
              checked={notifPrefs.amcReminders}
              onChange={() => { setNotifPrefs(p => ({ ...p, amcReminders: !p.amcReminders })); toast.success("Preference updated"); }}
            />
            <ToggleRow
              label="Payment Alerts"
              sub="Invoice and payment confirmations"
              checked={notifPrefs.paymentAlerts}
              onChange={() => { setNotifPrefs(p => ({ ...p, paymentAlerts: !p.paymentAlerts })); toast.success("Preference updated"); }}
            />
          </div>
        </AccordionItem>

        {/* Help & Support */}
        <AccordionItem
          icon={HelpCircle}
          label="Help & Support"
          isOpen={expanded === "help"}
          onToggle={() => toggle("help")}
        >
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FAQs</div>
            <FaqItem q="How do I track my service request?" a="Go to Requests tab and tap on any active request to view real-time tracking." />
            <FaqItem q="Can I cancel a service request?" a="Yes, you can cancel before the engineer is dispatched by contacting support." />
            <FaqItem q="How does the AMC plan work?" a="AMC covers scheduled visits and repairs. Visit the AMC tab for details." />

            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Contact Us</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Email</div>
                  <div className="text-xs text-muted-foreground">support@dronezone.in</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Phone</div>
                  <div className="text-xs text-muted-foreground">+91 1800-DRONE-ZONE</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Live Chat</div>
                  <div className="text-xs text-muted-foreground">Available 9 AM – 9 PM IST</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => toast.info("Report a Problem form will open...")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-card text-sm font-semibold text-destructive hover:bg-destructive/5 transition cursor-pointer"
            >
              Report a Problem
            </button>
          </div>
        </AccordionItem>
      </div>

      {/* Logout */}
      <Link to="/" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-card text-sm font-semibold text-destructive">
        <LogOut className="h-4 w-4" /> Logout
      </Link>
    </div>
  );
}

/* ── Helper components ── */

function AccordionItem({
  icon: Icon, label, isOpen, onToggle, children,
}: {
  icon: any; label: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl p-3 hover:bg-muted/20">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium">
        <span className="flex-1">{q}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-3 py-2.5 text-xs text-muted-foreground">{a}</div>}
    </div>
  );
}