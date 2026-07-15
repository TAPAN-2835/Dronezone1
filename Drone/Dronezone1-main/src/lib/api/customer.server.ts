import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase";

export const getCustomerDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch profile
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    // Fetch recent requests
    const { data: requests } = await supabase
      .from("service_requests")
      .select(`
        id,
        request_number,
        title,
        status,
        created_at,
        drones(model)
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    return {
      profile: profile || { display_name: user.user_metadata?.first_name || "Customer" },
      requests: requests || [],
    };
  }
);

export const getCustomerRequests = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: requests } = await supabase
      .from("service_requests")
      .select(`
        id,
        request_number,
        title,
        status,
        created_at,
        drones(model)
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    return requests || [];
  }
);

export const getRequestDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id } }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: request, error } = await supabase
      .from("service_requests")
      .select(`
        *,
        drones(*),
        service_categories(*),
        addresses(*),
        job_assignments(
          id,
          status,
          provider_id,
          provider_profiles(business_name, average_rating),
          users!job_assignments_provider_id_fkey(first_name, last_name, phone)
        )
      `)
      .eq("id", id)
      .eq("customer_id", user.id)
      .single();

    if (error) throw new Error(error.message);

    // Get active assignment
    const activeAssignment = request.job_assignments?.find((a: any) => a.status !== "rejected" && a.status !== "cancelled");

    return {
      request,
      assignment: activeAssignment || null,
    };
  });

export const getCustomerAssets = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const [{ data: drones }, { data: addresses }, { data: categories }] = await Promise.all([
      supabase.from("drones").select("id, model").eq("owner_id", user.id),
      supabase.from("addresses").select("id, address_line_1, city").eq("user_id", user.id),
      supabase.from("service_categories").select("id, name").eq("is_active", true),
    ]);

    return {
      drones: drones || [],
      addresses: addresses || [],
      categories: categories || [],
    };
  }
);

export const createCustomerAsset = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      type: z.enum(["drone", "address"]),
      model: z.string().optional(),
      serial_number: z.string().optional(),
      address_line_1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    if (data.type === "drone") {
      const { data: drone, error } = await supabase
        .from("drones")
        .insert({
          owner_id: user.id,
          model: data.model || "Unknown Model",
          manufacturer: "Unknown",
          serial_number: data.serial_number || `SN-${Date.now()}`,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { id: drone.id };
    } else {
      const { data: address, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          address_line_1: data.address_line_1 || "Unknown Address",
          city: data.city || "Unknown City",
          state: data.state || "Unknown State",
          postal_code: data.postal_code || "000000",
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { id: address.id };
    }
  });
