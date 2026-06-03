import { createFileRoute } from "@tanstack/react-router";
import { Bell, IndianRupee, Star, Shield } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { customerNotifications } from "@/data/customer";

const iconMap = { request: Bell, payment: IndianRupee, review: Star, amc: Shield } as const;

export const Route = createFileRoute("/customer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Notifications" showBack rightSlot={<button className="text-xs font-semibold text-primary">Mark all read</button>}>
      <div className="px-4 py-3">
        {customerNotifications.map((n) => {
          const Icon = iconMap[n.category];
          return (
            <div key={n.id} className={`flex gap-3 rounded-xl p-3 ${!n.read ? "bg-primary/5" : ""}`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{n.time}</div>
              </div>
              {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </CustomerShell>
  ),
});