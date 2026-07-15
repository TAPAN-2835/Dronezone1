import { definePage } from "@/lib/router";
import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { listNotifications } from "@/lib/api/platform";

export const Page = definePage("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DroneZone" }] }),
  loader: () => listNotifications(),
  component: Notifications,
});

function Notifications() {
  const items = Page.useLoaderData<Awaited<ReturnType<typeof listNotifications>>>();
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Live job, verification, and platform updates."
      />
      <NotificationCenter initial={items} />
    </>
  );
}
