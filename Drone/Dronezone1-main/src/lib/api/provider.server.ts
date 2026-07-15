import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

/**
 * Returns dashboard stats and recent jobs for the provider.
 */
export const getProviderDashboard = createServerFn({ method: "GET" })
  .handler(async () => {
    // In a real app, we'd get the provider_id from the authenticated context
    // For now, we'll try to get the first provider profile we can find or fallback
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("provider_profiles")
      .select("*, users(*)")
      .eq("user_id", userId)
      .single();

    // 1. New Requests (pending)
    const { data: newRequests } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*))")
      .eq("provider_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // 2. Active Jobs (accepted, in_progress, on_hold)
    const { data: activeJobs } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*))")
      .eq("provider_id", userId)
      .in("status", ["accepted", "in_progress", "on_hold"])
      .order("updated_at", { ascending: false });
      
    // 3. Completed Jobs (completed)
    const { count: completedCount } = await supabase
      .from("job_assignments")
      .select("*", { count: 'exact', head: true })
      .eq("provider_id", userId)
      .eq("status", "completed");

    return {
      profile,
      newRequests: newRequests || [],
      activeJobs: activeJobs || [],
      stats: {
        newCount: newRequests?.length || 0,
        activeCount: activeJobs?.length || 0,
        completedCount: completedCount || 0,
        revenueMonth: 0 // Mock for now until quotations/payments are built
      }
    };
  });

/**
 * Returns all pending assignments for the provider.
 */
export const getProviderRequests = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: requests } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), users!service_requests_customer_id_fkey(first_name, last_name, phone))")
      .eq("provider_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return { requests: requests || [] };
  });

/**
 * Returns detailed info for a specific assignment for the provider.
 */
export const getProviderJobDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ assignmentId: z.string() }))
  .handler(async ({ data: { assignmentId } }) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: assignment, error } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), service_categories(*), users!service_requests_customer_id_fkey(*))")
      .eq("id", assignmentId)
      .eq("provider_id", userId)
      .single();

    if (error || !assignment) {
      throw new Error("Job not found or access denied");
    }

    return { assignment };
  });

/**
 * Updates the status of a job assignment, and optionally syncs the parent service request status.
 */
export const updateAssignmentStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    assignmentId: z.string(),
    newStatus: z.enum(["accepted", "rejected", "in_progress", "completed", "cancelled", "on_hold"])
  }))
  .handler(async ({ data: { assignmentId, newStatus } }) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Get the assignment first to find the parent service request
    const { data: assignment } = await supabase
      .from("job_assignments")
      .select("service_request_id")
      .eq("id", assignmentId)
      .eq("provider_id", userId)
      .single();

    if (!assignment) throw new Error("Assignment not found");

    // Update assignment
    const { error: assignError } = await supabase
      .from("job_assignments")
      .update({ status: newStatus })
      .eq("id", assignmentId);

    if (assignError) throw assignError;

    // Determine overarching service_request status based on assignment
    let srStatus = "";
    if (newStatus === "accepted") srStatus = "approved"; // Or "in_progress" depending on workflow
    else if (newStatus === "in_progress" || newStatus === "on_hold") srStatus = "in_progress";
    else if (newStatus === "completed") srStatus = "completed";
    else if (newStatus === "rejected") srStatus = "review"; // Go back to review so admin can re-assign
    
    if (srStatus) {
      await supabase
        .from("service_requests")
        .update({ status: srStatus })
        .eq("id", assignment.service_request_id);
    }
    
    return { success: true };
  });

/**
 * Returns all active jobs for the provider.
 */
export const getProviderActiveJobs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: activeJobs } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), users!service_requests_customer_id_fkey(first_name, last_name, phone))")
      .eq("provider_id", userId)
      .in("status", ["accepted", "in_progress", "on_hold"])
      .order("updated_at", { ascending: false });

    return { jobs: activeJobs || [] };
  });

/**
 * Returns historical jobs for the provider.
 */
export const getProviderHistory = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: historyJobs } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), users!service_requests_customer_id_fkey(first_name, last_name, phone))")
      .eq("provider_id", userId)
      .in("status", ["completed", "rejected", "cancelled"])
      .order("updated_at", { ascending: false });

    return { jobs: historyJobs || [] };
  });

/**
 * DEV ONLY: Self-assign a mock job to test the workflow
 * Since Admin dashboard is not built yet, we need a way to assign a job to the logged-in provider.
 */
export const devSelfAssignJob = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Get any service request that is unassigned or draft
    const { data: req } = await supabase
      .from("service_requests")
      .select("*")
      .in("status", ["draft", "review"])
      .limit(1)
      .single();

    if (!req) {
      throw new Error("No draft/review service requests available to assign. Please create one as a customer first.");
    }

    // Mark as review
    await supabase.from("service_requests").update({ status: "review" }).eq("id", req.id);

    // Create assignment
    const { error: assignError } = await supabase
      .from("job_assignments")
      .insert({
        service_request_id: req.id,
        provider_id: userId,
        assigned_by: req.customer_id, // Hack for DEV ONLY
        status: "pending"
      });

    if (assignError) {
      throw assignError;
    }

    return { success: true };
  });
