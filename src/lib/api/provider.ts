import { supabase } from "@/lib/supabase";
import { requireRole, unwrap } from "./shared";

async function providerUser() {
  return requireRole("provider");
}

const assignmentSelect = "*, service_requests(*, drones(*), addresses(*), service_categories(*))";

export async function getProviderDashboard() {
  const user = await providerUser();
  const [profile, pending, active, completed] = await Promise.all([
    supabase.from("provider_profiles").select("*, users(*)").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("provider_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("provider_id", user.id)
      .in("status", ["accepted", "in_progress", "on_hold"])
      .order("updated_at", { ascending: false }),
    supabase
      .from("job_assignments")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", user.id)
      .eq("status", "completed"),
  ]);
  return {
    profile: unwrap(profile),
    newRequests: unwrap(pending) ?? [],
    activeJobs: unwrap(active) ?? [],
    stats: {
      newCount: pending.data?.length ?? 0,
      activeCount: active.data?.length ?? 0,
      completedCount: completed.count ?? 0,
      revenueMonth: 0,
    },
  };
}

export async function getProviderRequests() {
  const user = await providerUser();
  const requests = unwrap(
    await supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("provider_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  );
  return { requests: requests ?? [] };
}

export async function getProviderJobDetails({ data }: { data: { assignmentId: string } }) {
  const user = await providerUser();
  const assignment = unwrap(
    await supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("id", data.assignmentId)
      .eq("provider_id", user.id)
      .single(),
  );
  return { assignment };
}

export async function updateAssignmentStatus({
  data,
}: {
  data: {
    assignmentId: string;
    newStatus: "accepted" | "rejected" | "in_progress" | "completed" | "cancelled" | "on_hold";
  };
}) {
  const user = await providerUser();
  const assignment = unwrap(
    await supabase
      .from("job_assignments")
      .select("service_request_id")
      .eq("id", data.assignmentId)
      .eq("provider_id", user.id)
      .single(),
  );
  if (!assignment) throw new Error("Assignment not found");
  unwrap(
    await supabase
      .from("job_assignments")
      .update({ status: data.newStatus })
      .eq("id", data.assignmentId)
      .eq("provider_id", user.id),
  );
  const requestStatus =
    data.newStatus === "accepted"
      ? "approved"
      : data.newStatus === "rejected"
        ? "review"
        : ["in_progress", "on_hold"].includes(data.newStatus)
          ? "in_progress"
          : data.newStatus === "completed"
            ? "completed"
            : data.newStatus === "cancelled"
              ? "cancelled"
              : null;
  if (requestStatus)
    unwrap(
      await supabase
        .from("service_requests")
        .update({ status: requestStatus })
        .eq("id", assignment.service_request_id),
    );
  return { success: true };
}

async function jobsByStatuses(statuses: string[]) {
  const user = await providerUser();
  const jobs = unwrap(
    await supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("provider_id", user.id)
      .in("status", statuses)
      .order("updated_at", { ascending: false }),
  );
  return { jobs: jobs ?? [] };
}

export const getProviderActiveJobs = () => jobsByStatuses(["accepted", "in_progress", "on_hold"]);
export const getProviderHistory = () => jobsByStatuses(["completed", "rejected", "cancelled"]);
