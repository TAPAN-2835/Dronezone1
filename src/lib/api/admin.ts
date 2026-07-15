import { supabase } from "@/lib/supabase";
import { requireRole, unwrap } from "./shared";

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
      .select("*, users(*)")
      .order("created_at", { ascending: false }),
  );
  return { providers: providers ?? [] };
}

export async function updateProviderVerification({
  data,
}: {
  data: { providerId: string; status: string };
}) {
  const currentAdmin = await admin();
  const normalized = data.status.toLowerCase().replaceAll(" ", "_");
  if (!["pending", "in_review", "approved", "rejected", "suspended"].includes(normalized))
    throw new Error("Invalid provider status");
  unwrap(
    await supabase
      .from("provider_profiles")
      .update({
        status: normalized,
        verified_by: currentAdmin.id,
        verified_at: normalized === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", data.providerId),
  );
  return { success: true };
}

export async function getAdminProviderDetails({ data }: { data: { providerId: string } }) {
  await admin();
  const provider = unwrap(
    await supabase
      .from("provider_profiles")
      .select("*, users(*)")
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
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false }),
  );
  return { users: users ?? [] };
}

export async function getAdminUserDetails({ data }: { data: { userId: string } }) {
  await admin();
  const [user, requests] = await Promise.all([
    supabase.from("users").select("*").eq("id", data.userId).single(),
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
      .select("*, users!service_requests_customer_id_fkey(*), drones(*), service_categories(*)")
      .order("created_at", { ascending: false }),
  );
  return { requests: requests ?? [] };
}

export async function getAdminRequestDetails({ data }: { data: { requestId: string } }) {
  await admin();
  const request = unwrap(
    await supabase
      .from("service_requests")
      .select(
        "*, users!service_requests_customer_id_fkey(*), drones(*), addresses(*), service_categories(*), job_assignments(*)",
      )
      .eq("id", data.requestId)
      .single(),
  );
  return { request };
}

export async function assignRequestToProvider({
  data,
}: {
  data: { requestId: string; providerId: string };
}) {
  const currentAdmin = await admin();
  const provider = unwrap(
    await supabase
      .from("provider_profiles")
      .select("user_id, status")
      .eq("user_id", data.providerId)
      .maybeSingle(),
  );
  if (!provider || provider.status !== "approved") throw new Error("Provider is not approved");
  unwrap(
    await supabase.from("job_assignments").insert({
      service_request_id: data.requestId,
      provider_id: provider.user_id,
      assigned_by: currentAdmin.id,
      status: "pending",
    }),
  );
  unwrap(
    await supabase
      .from("service_requests")
      .update({ status: "review", assigned_at: new Date().toISOString() })
      .eq("id", data.requestId),
  );
  return { success: true };
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
