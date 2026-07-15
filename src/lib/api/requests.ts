import { supabase } from "@/lib/supabase";
import { callRpc, requireRole } from "./shared";

type RequestInput = {
  categoryId: string;
  droneId: string;
  title: string;
  description: string;
  serviceAddressId: string;
  urgent?: boolean;
};

export async function createServiceRequest({ data }: { data: RequestInput }) {
  await requireRole("customer");
  return callRpc("submit_service_request", {
    p_category_id: data.categoryId,
    p_drone_id: data.droneId,
    p_title: data.title,
    p_description: data.description,
    p_service_address_id: data.serviceAddressId,
    p_priority: data.urgent ? "urgent" : "medium",
  });
}
