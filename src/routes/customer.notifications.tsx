import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, IndianRupee, Star, Shield, ChevronRight } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customerNotifications } from "@/data/customer";
import { toast } from "sonner";
import { useState } from "react";

const iconMap = { request: Bell, payment: IndianRupee, review: Star, amc: Shield } as const;

export const Route = createFileRoute("/customer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DroneZone" }] }),
  component: () => (
    <CustomerShell
      title="Notifications"
      showBack
      rightSlot={
        <button
          onClick={() => toast.success("All notifications marked as read")}
          className="text-xs font-semibold text-primary"
        >
          Mark all read
        </button>
      }
    >
      <Notifications />
    </CustomerShell>
  ),
});

function Notifications() {
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(customerNotifications.filter((n) => n.read).map((n) => n.id))
  );

  return (
    <div className="px-4 py-3">
      {customerNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30" />
          <div className="mt-3 font-display text-base font-semibold text-muted-foreground">No notifications</div>
          <div className="text-xs text-muted-foreground">You're all caught up!</div>
        </div>
      )}

      {customerNotifications.map((n) => {
        const Icon = iconMap[n.category];
        const isRead = readIds.has(n.id);

        return (
          <Link
            key={n.id}
            to={n.to}
            onClick={() => {
              if (!isRead) {
                setReadIds((prev) => new Set(prev).add(n.id));
              }
            }}
            className={`flex gap-3 rounded-xl p-3 transition-colors hover:bg-accent/40 ${!isRead ? "bg-primary/5" : ""}`}
          >
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${!isRead ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${!isRead ? "text-foreground" : "text-foreground/80"}`}>{n.title}</div>
              <div className="text-xs text-muted-foreground truncate">{n.body}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">{n.time}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}