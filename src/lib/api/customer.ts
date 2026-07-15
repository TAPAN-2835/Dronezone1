import { supabase } from "@/lib/supabase";
import { requireRole, unwrap } from "./shared";

export async function getCustomerDashboard() {
  const user = await requireRole("customer");
  const [profileResult, requestResult] = await Promise.all([
    supabase.from("customer_profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("service_requests")
      .select("id, request_number, title, status, created_at, drones(model)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  if (profileResult.error) throw new Error(profileResult.error.message);
  return {
    profile: profileResult.data ?? { display_name: user.user_metadata?.first_name || "Customer" },
    requests: unwrap(requestResult) ?? [],
  };
}

export async function getCustomerRequests() {
  const user = await requireRole("customer");
  return (
    unwrap(
      await supabase
        .from("service_requests")
        .select("id, request_number, title, status, created_at, drones(model)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
    ) ?? []
  );
}

export async function getRequestDetails(input: { data: { id: string } }) {
  const user = await requireRole("customer");
  const request = unwrap(
    await supabase
      .from("service_requests")
      .select("*, drones(*), service_categories(*), addresses(*), job_assignments(*)")
      .eq("id", input.data.id)
      .eq("customer_id", user.id)
      .single(),
  ) as any;
  const assignment = request.job_assignments?.find(
    (item: any) => !["rejected", "cancelled"].includes(item.status),
  );
  const [providerResult, historyResult] = assignment
    ? await Promise.all([
        supabase.rpc("get_assigned_provider_for_request", { p_request_id: request.id }),
        supabase
          .from("job_status_history")
          .select("*")
          .eq("job_assignment_id", assignment.id)
          .order("created_at", { ascending: true }),
      ])
    : [
        { data: null, error: null },
        { data: [], error: null },
      ];
  if (providerResult.error) throw new Error(providerResult.error.message);
  if (historyResult.error) throw new Error(historyResult.error.message);
  const providerRows = providerResult.data as any;
  return {
    request,
    assignment: assignment ?? null,
    provider: Array.isArray(providerRows) ? (providerRows[0] ?? null) : providerRows,
    history: historyResult.data ?? [],
  };
}

export async function getCustomerAssets() {
  const user = await requireRole("customer");
  const [drones, addresses, categories] = await Promise.all([
    supabase.from("drones").select("id, model").eq("owner_id", user.id).is("deleted_at", null),
    supabase.from("addresses").select("id, address_line_1, city").eq("user_id", user.id),
    supabase.from("service_categories").select("id, name").eq("is_active", true),
  ]);
  return {
    drones: unwrap(drones) ?? [],
    addresses: unwrap(addresses) ?? [],
    categories: unwrap(categories) ?? [],
  };
}

type AssetInput = {
  type: "drone" | "address";
  model?: string;
  serial_number?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};

export async function createCustomerAsset({ data }: { data: AssetInput }) {
  const user = await requireRole("customer");
  if (data.type === "drone") {
    const drone = unwrap(
      await supabase
        .from("drones")
        .insert({
          owner_id: user.id,
          model: data.model || "Unknown Model",
          manufacturer: "Unknown",
          serial_number: data.serial_number || `SN-${Date.now()}`,
        })
        .select("id")
        .single(),
    );
    if (!drone) throw new Error("The drone could not be created");
    return { id: drone.id };
  }
  const address = unwrap(
    await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        address_line_1: data.address_line_1 || "Unknown Address",
        city: data.city || "Unknown City",
        state: data.state || "Unknown State",
        postal_code: data.postal_code || "000000",
      })
      .select("id")
      .single(),
  );
  if (!address) throw new Error("The address could not be created");
  return { id: address.id };
}
