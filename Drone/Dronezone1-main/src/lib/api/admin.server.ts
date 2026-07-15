import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

/**
 * Validates that the current user has the 'admin' role.
 */
async function requireAdmin() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("roles!inner(name)")
    .eq("user_id", userId)
    .single();

  const roleName = (roleData as any)?.roles?.name?.toLowerCase();

  if (roleName !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return userId;
}

export const getAdminDashboardStats = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();

    const { count: usersCount } = await supabase
      .from("user_roles")
      .select("roles!inner(name)", { count: "exact", head: true })
      .ilike("roles.name", "customer");

    const { count: providersCount } = await supabase
      .from("user_roles")
      .select("roles!inner(name)", { count: "exact", head: true })
      .ilike("roles.name", "provider");

    const { count: requestsCount } = await supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["completed"]);

    // Aggregate mock revenue
    // A real app would sum a `payments` table or `job_assignments.amount`.
    const { data: assignments } = await supabase
      .from("job_assignments")
      .select("amount")
      .eq("status", "completed");

    const totalRevenue = assignments?.reduce((sum, job) => sum + (job.amount || 0), 0) || 0;

    return {
      usersCount: usersCount || 0,
      providersCount: providersCount || 0,
      resolvedRequestsCount: requestsCount || 0,
      totalRevenue
    };
  });

export const getAdminProviders = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();

    const { data: providers } = await supabase
      .from("provider_profiles")
      .select("*, users(*)")
      .order("created_at", { ascending: false });

    return { providers: providers || [] };
  });

export const updateProviderVerification = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    providerId: z.string().uuid(),
    status: z.enum(["Pending Verification", "Approved", "Rejected", "Additional Documents Required", "Suspended", "Active", "Inactive"])
  }))
  .handler(async ({ data: { providerId, status } }) => {
    await requireAdmin();

    const { error } = await supabase
      .from("provider_profiles")
      .update({ status })
      .eq("id", providerId);

    if (error) throw error;
    return { success: true };
  });

export const getAdminProviderDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ providerId: z.string().uuid() }))
  .handler(async ({ data: { providerId } }) => {
    await requireAdmin();

    const { data: provider, error } = await supabase
      .from("provider_profiles")
      .select("*, users(*)")
      .eq("id", providerId)
      .single();

    if (error || !provider) throw new Error("Provider not found");
    return { provider };
  });

export const getAdminUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();

    // Fetch users with role customer
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, roles!inner(name)")
      .ilike("roles.name", "customer");
    
    const userIds = roles?.map(r => r.user_id) || [];

    if (userIds.length === 0) return { users: [] };

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds)
      .order("created_at", { ascending: false });

    return { users: users || [] };
  });

export const getAdminUserDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data: { userId } }) => {
    await requireAdmin();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) throw new Error("User not found");
    
    const { data: requests } = await supabase
      .from("service_requests")
      .select("*, drones(*), service_categories(*)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    return { user, requests: requests || [] };
  });

export const getAdminRequests = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();

    const { data: requests } = await supabase
      .from("service_requests")
      .select("*, users!service_requests_customer_id_fkey(*), drones(*), service_categories(*)")
      .order("created_at", { ascending: false });

    return { requests: requests || [] };
  });

export const getAdminRequestDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ requestId: z.string().uuid() }))
  .handler(async ({ data: { requestId } }) => {
    await requireAdmin();

    const { data: request, error } = await supabase
      .from("service_requests")
      .select("*, users!service_requests_customer_id_fkey(*), drones(*), addresses(*), service_categories(*), job_assignments(*, provider:users!job_assignments_provider_id_fkey(first_name, last_name, phone))")
      .eq("id", requestId)
      .single();

    if (error || !request) throw new Error("Request not found");
    return { request };
  });

export const assignRequestToProvider = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    requestId: z.string().uuid(),
    providerId: z.string().uuid()
  }))
  .handler(async ({ data: { requestId, providerId } }) => {
    const adminId = await requireAdmin();

    // Verify provider is approved/active
    const { data: provider } = await supabase
      .from("provider_profiles")
      .select("status")
      .eq("user_id", providerId)
      .single();
      
    if (!provider || (provider.status !== "Approved" && provider.status !== "Active")) {
      throw new Error("Provider is not verified or active");
    }

    // Assign job
    const { error } = await supabase
      .from("job_assignments")
      .insert({
        service_request_id: requestId,
        provider_id: providerId,
        assigned_by: adminId,
        status: "pending"
      });

    if (error) throw error;

    // Update service request status
    await supabase
      .from("service_requests")
      .update({ status: "review" })
      .eq("id", requestId);

    return { success: true };
  });

export const getAdminJobs = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();

    const { data: jobs } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), service_categories(*), customer:users!service_requests_customer_id_fkey(first_name, last_name, phone)), provider:users!job_assignments_provider_id_fkey(first_name, last_name)")
      .order("created_at", { ascending: false });

    return { jobs: jobs || [] };
  });

export const getAdminJobDetails = createServerFn({ method: "GET" })
  .inputValidator(z.object({ jobId: z.string().uuid() }))
  .handler(async ({ data: { jobId } }) => {
    await requireAdmin();

    const { data: job, error } = await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), service_categories(*), customer:users!service_requests_customer_id_fkey(*)), provider:users!job_assignments_provider_id_fkey(*)")
      .eq("id", jobId)
      .single();

    if (error || !job) throw new Error("Job not found");
    return { job };
  });
