import { definePage } from "@/lib/router";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { listNotifications } from "@/lib/api/platform";

export const Page = definePage("/customer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DroneZone" }] }),
  loader: () => listNotifications(),
  component: Notifications,
});

function Notifications() {
  const items = Page.useLoaderData<Awaited<ReturnType<typeof listNotifications>>>();
  return (
    <CustomerShell title="Notifications" showBack>
      <div className="px-4 py-4">
        <NotificationCenter initial={items} />
      </div>
    </CustomerShell>
  );
}
