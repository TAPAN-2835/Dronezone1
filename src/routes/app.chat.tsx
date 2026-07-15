import { definePage } from "@/lib/router";
import { UnavailableModule } from "@/components/shared/UnavailableModule";
export const Page = definePage("/app/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: () => (
    <UnavailableModule
      title="Chat is not enabled"
      reason="The approved database contract has no chat model. Demo messages were removed; enable this only after a secure retention and access model is approved."
    />
  ),
});
