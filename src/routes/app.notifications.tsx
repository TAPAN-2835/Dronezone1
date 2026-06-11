import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Inbox, IndianRupee, BellRing, Settings as SettingsIcon, Check, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notifications as initial } from "@/data/demo";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DroneZone" }] }),
  component: Notifications,
});

const cats = [
  { id: "all", label: "All", icon: Bell },
  { id: "request", label: "Requests", icon: Inbox },
  { id: "payment", label: "Payments", icon: IndianRupee },
  { id: "reminder", label: "Reminders", icon: BellRing },
  { id: "grievance", label: "Grievances", icon: AlertOctagon },
  { id: "system", label: "System", icon: SettingsIcon },
] as const;

const iconByCat = {
  request: Inbox,
  payment: IndianRupee,
  reminder: BellRing,
  system: SettingsIcon,
  grievance: AlertOctagon,
};

function Notifications() {
  const [items, setItems] = useState(initial);
  const [cat, setCat] = useState<(typeof cats)[number]["id"]>("all");
  const visible = items.filter((n) => cat === "all" || n.category === cat);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay on top of new requests, payments, and reminders."
        actions={
          <Button variant="outline" onClick={() => setItems((x) => x.map((n) => ({ ...n, read: true })))}>
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {cats.map((c) => {
          const Icon = c.icon;
          const count = c.id === "all" ? items.filter((n) => !n.read).length : items.filter((n) => n.category === c.id && !n.read).length;
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition ${
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {c.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {visible.map((n) => {
            const Icon = iconByCat[n.category as keyof typeof iconByCat] ?? Bell;
            const content = (
              <>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  n.category === "payment" ? "bg-success/15 text-success"
                    : n.category === "request" ? "bg-primary/10 text-primary"
                    : n.category === "grievance" ? "bg-destructive/10 text-destructive"
                    : n.category === "reminder" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.time}</div>
                </div>
              </>
            );

            return n.href ? (
              <Link
                key={n.id}
                to={n.href}
                onClick={() => setItems((x) => x.map((item) => item.id === n.id ? { ...item, read: true } : item))}
                className={`flex items-start gap-4 p-4 transition hover:bg-muted/30 ${!n.read ? "bg-primary/5" : ""}`}
              >
                {content}
              </Link>
            ) : (
              <div key={n.id} className={`flex items-start gap-4 p-4 ${!n.read ? "bg-primary/5" : ""}`}>
                {content}
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
