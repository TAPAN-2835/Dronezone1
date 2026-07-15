import { definePage } from "@/lib/router";
import { UnavailableModule } from "@/components/shared/UnavailableModule";
export const Page = definePage("/app/quotations")({
  head: () => ({ meta: [{ title: "Fixed Pricing — DroneZone" }] }),
  component: () => (
    <UnavailableModule
      title="Quotation negotiation was retired"
      reason="Mentor-approved workflow uses admin-managed fixed pricing. Providers can view the immutable amount on assigned requests; negotiation is not available."
    />
  ),
});
