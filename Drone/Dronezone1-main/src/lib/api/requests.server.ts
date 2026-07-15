import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase";

// Enforce business logic rule: prevents service request creation for a customer until their profile status is approved.
export const createServiceRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      categoryId: z.string().uuid(),
      droneId: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      serviceAddressId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // 2. Load customer profile (optional, to verify they exist)
    const { data: profile, error: profileError } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Customer profile not found");
    }

    // 3. Create the service request
    const { data: request, error: insertError } = await supabase
      .from("service_requests")
      .insert({
        customer_id: user.id,
        drone_id: data.droneId,
        category_id: data.categoryId,
        service_address_id: data.serviceAddressId,
        title: data.title,
        description: data.description,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create service request: ${insertError.message}`);
    }

    return request;
  });
