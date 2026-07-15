import { definePage } from "@/lib/router";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { UnavailableModule } from "@/components/shared/UnavailableModule";
export const Page = definePage("/customer/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Chat" showBack>
      <div className="p-4">
        <UnavailableModule
          title="Chat is not enabled"
          reason="Demo messages were removed. Chat requires an approved secure database and retention model."
        />
      </div>
    </CustomerShell>
  ),
});
