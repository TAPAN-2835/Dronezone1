import { supabase } from "@/lib/supabase";
import { callRpc, requireRole, unwrap } from "./shared";

const admin = () => requireRole("admin");

export async function getAdminDashboardStats() {
  await admin();
  const [customers, providers, resolved, assignments] = await Promise.all([
    supabase
      .from("user_roles")
      .select("roles!inner(name)", { count: "exact", head: true })
      .eq("roles.name", "customer")
      .is("revoked_at", null),
    supabase
      .from("user_roles")
      .select("roles!inner(name)", { count: "exact", head: true })
      .eq("roles.name", "provider")
      .is("revoked_at", null),
    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("job_assignments").select("estimated_cost").eq("status", "completed"),
  ]);
  const rows = unwrap(assignments) ?? [];
  return {
    usersCount: customers.count ?? 0,
    providersCount: providers.count ?? 0,
    resolvedRequestsCount: resolved.count ?? 0,
    totalRevenue: rows.reduce((sum, row) => sum + Number(row.estimated_cost ?? 0), 0),
  };
}

export async function getAdminProviders() {
  await admin();
  const providers = unwrap(
    await supabase
      .from("provider_profiles")
      .select("*, users(id,email,phone,first_name,last_name,is_active,created_at,updated_at)")
      .order("created_at", { ascending: false }),
  );
  return { providers: providers ?? [] };
}

export async function updateProviderVerification({
  data,
}: {
  data: { providerId: string; status: string; rejectionReason?: string };
}) {
  await admin();
  const normalized = data.status.toLowerCase().replaceAll(" ", "_");
  if (!["pending", "in_review", "approved", "rejected", "suspended"].includes(normalized))
    throw new Error("Invalid provider status");
  if (normalized === "approved")
    return callRpc("approve_provider", { p_provider_profile_id: data.providerId });
  if (normalized === "rejected") {
    if (!data.rejectionReason?.trim()) throw new Error("A rejection reason is required");
    return callRpc("reject_provider", {
      p_provider_profile_id: data.providerId,
      p_rejection_reason: data.rejectionReason.trim(),
    });
  }
  throw new Error("This provider transition is not available in the hardened workflow");
}

export async function getAdminProviderDetails({ data }: { data: { providerId: string } }) {
  await admin();
  const provider = unwrap(
    await supabase
      .from("provider_profiles")
      .select("*, users(id,email,phone,first_name,last_name,is_active,created_at,updated_at)")
      .eq("id", data.providerId)
      .single(),
  );
  return { provider };
}

export async function getAdminUsers() {
  await admin();
  const roles = unwrap(
    await supabase
      .from("user_roles")
      .select("user_id, roles!inner(name)")
      .eq("roles.name", "customer")
      .is("revoked_at", null),
  );
  const ids = (roles ?? []).map((row) => row.user_id);
  if (!ids.length) return { users: [] };
  const users = unwrap(
    await supabase
      .from("users")
      .select(
        "id,email,phone,first_name,last_name,is_active,email_verified,phone_verified,created_at,updated_at",
      )
      .in("id", ids)
      .order("created_at", { ascending: false }),
  );
  return { users: users ?? [] };
}

export async function getAdminUserDetails({ data }: { data: { userId: string } }) {
  await admin();
  const [user, requests] = await Promise.all([
    supabase
      .from("users")
      .select(
        "id,email,phone,first_name,last_name,is_active,email_verified,phone_verified,created_at,updated_at",
      )
      .eq("id", data.userId)
      .single(),
    supabase
      .from("service_requests")
      .select("*, drones(*), service_categories(*)")
      .eq("customer_id", data.userId)
      .order("created_at", { ascending: false }),
  ]);
  return { user: unwrap(user), requests: unwrap(requests) ?? [] };
}

export async function getAdminRequests() {
  await admin();
  const requests = unwrap(
    await supabase
      .from("service_requests")
      .select(
        "*, users!service_requests_customer_id_fkey(id,email,phone,first_name,last_name,is_active,created_at,updated_at), drones(*), service_categories(*)",
      )
      .order("created_at", { ascending: false }),
  );
  return { requests: requests ?? [] };
}

export async function getAdminRequestDetails({ data }: { data: { requestId: string } }) {
  await admin();
  const [requestResult, providersResult] = await Promise.all([
    supabase
      .from("service_requests")
      .select(
        "*, users!service_requests_customer_id_fkey(id,email,phone,first_name,last_name,is_active,created_at,updated_at), drones(*), addresses(*), service_categories(*), job_assignments(*)",
      )
      .eq("id", data.requestId)
      .single(),
    supabase
      .from("provider_profiles")
      .select("id, user_id, business_name, equipment_class")
      .eq("status", "approved")
      .order("business_name"),
  ]);
  return { request: unwrap(requestResult), providers: unwrap(providersResult) ?? [] };
}

export async function assignRequestToProvider({
  data,
}: {
  data: { requestId: string; providerId: string };
}) {
  await admin();
  return callRpc("assign_provider", {
    p_request_id: data.requestId,
    p_provider_id: data.providerId,
  });
}

export const reviewServiceRequest = (requestId: string) =>
  callRpc("review_service_request", { p_request_id: requestId });

export const approveServiceRequest = (requestId: string) =>
  callRpc("approve_service_request", { p_request_id: requestId });

export const rejectServiceRequest = (requestId: string, reason: string) =>
  callRpc("reject_service_request", { p_request_id: requestId, p_rejection_reason: reason });

export const assignProviderClass = (providerProfileId: string, equipmentClass: number) =>
  callRpc("assign_provider_class", {
    p_provider_profile_id: providerProfileId,
    p_equipment_class: equipmentClass,
  });

export async function getApprovedProviders() {
  await admin();
  return (
    unwrap(
      await supabase
        .from("provider_profiles")
        .select("id, user_id, business_name, equipment_class")
        .eq("status", "approved")
        .order("business_name"),
    ) ?? []
  );
}

export async function getAdminJobs() {
  await admin();
  const jobs = unwrap(
    await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), service_categories(*))")
      .order("created_at", { ascending: false }),
  );
  return { jobs: jobs ?? [] };
}

export async function getAdminJobDetails({ data }: { data: { jobId: string } }) {
  await admin();
  const job = unwrap(
    await supabase
      .from("job_assignments")
      .select("*, service_requests(*, drones(*), addresses(*), service_categories(*))")
      .eq("id", data.jobId)
      .single(),
  );
  return { job };
}
