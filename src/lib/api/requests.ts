import { supabase } from "@/lib/supabase";
import { requireRole, unwrap } from "./shared";

type RequestInput = {
  categoryId: string;
  droneId: string;
  title: string;
  description: string;
  serviceAddressId: string;
  urgent?: boolean;
};

export async function createServiceRequest({ data }: { data: RequestInput }) {
  const user = await requireRole("customer");
  const profile = unwrap(
    await supabase.from("customer_profiles").select("id").eq("user_id", user.id).maybeSingle(),
  );
  if (!profile) throw new Error("Customer profile not found");

  return unwrap(
    await supabase
      .from("service_requests")
      .insert({
        customer_id: user.id,
        drone_id: data.droneId,
        category_id: data.categoryId,
        service_address_id: data.serviceAddressId,
        title: data.title,
        description: data.description,
        priority: data.urgent ? "urgent" : "medium",
        status: "draft",
      })
      .select()
      .single(),
  );
}
