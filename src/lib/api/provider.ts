import { supabase } from "@/lib/supabase";
import { callRpc, requireRole, unwrap } from "./shared";

async function providerUser() {
  return requireRole("provider");
}

const assignmentSelect =
  "*, service_requests(*, users!service_requests_customer_id_fkey(first_name,last_name,phone), drones(*), addresses(*), service_categories(*))";

export async function getProviderDashboard() {
  const user = await providerUser();
  const [profile, pending, active, completed, notifications] = await Promise.all([
    supabase
      .from("provider_profiles")
      .select("*, users(id,email,phone,first_name,last_name,is_active,created_at,updated_at)")
      .eq("user_id", user.id)
      .maybeSingle(),
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
      .select("id,completed_at,service_requests(fixed_price,tax_percent)")
      .eq("provider_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("notifications")
      .select("id,title,body,deep_link,read_at,created_at")
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  const completedRows = unwrap(completed) ?? [];
  const monthKey = new Date().toISOString().slice(0, 7);
  const revenueMonth = completedRows
    .filter((row: any) => row.completed_at?.startsWith(monthKey))
    .reduce(
      (sum: number, row: any) =>
        sum +
        Number(row.service_requests?.fixed_price ?? 0) *
          (1 + Number(row.service_requests?.tax_percent ?? 0) / 100),
      0,
    );
  const weeklyJobs = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      jobs: completedRows.filter((row: any) => row.completed_at?.startsWith(key)).length,
    };
  });
  const revenueTrend = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - offset));
    const key = date.toISOString().slice(0, 7);
    return {
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      revenue: completedRows
        .filter((row: any) => row.completed_at?.startsWith(key))
        .reduce((sum: number, row: any) => sum + Number(row.service_requests?.fixed_price ?? 0), 0),
    };
  });
  return {
    profile: unwrap(profile),
    newRequests: unwrap(pending) ?? [],
    activeJobs: unwrap(active) ?? [],
    stats: {
      newCount: pending.data?.length ?? 0,
      activeCount: active.data?.length ?? 0,
      completedCount: completedRows.length,
      revenueMonth,
    },
    weeklyJobs,
    revenueTrend,
    notifications: unwrap(notifications) ?? [],
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
  const [assignmentResult, historyResult] = await Promise.all([
    supabase
      .from("job_assignments")
      .select(assignmentSelect)
      .eq("id", data.assignmentId)
      .eq("provider_id", user.id)
      .single(),
    supabase
      .from("job_status_history")
      .select("*")
      .eq("job_assignment_id", data.assignmentId)
      .order("created_at", { ascending: true }),
  ]);
  return { assignment: unwrap(assignmentResult), history: unwrap(historyResult) ?? [] };
}

export const acceptAssignment = (assignmentId: string, providerNotes?: string) =>
  callRpc("provider_accept_assignment", {
    p_assignment_id: assignmentId,
    p_provider_notes: providerNotes ?? null,
  });

export const rejectAssignment = (assignmentId: string, reason: string) =>
  callRpc("provider_reject_assignment", {
    p_assignment_id: assignmentId,
    p_rejection_reason: reason,
  });

export const startJob = (assignmentId: string) =>
  callRpc("start_job", { p_assignment_id: assignmentId });

export const updateJobTimeline = (data: {
  assignmentId: string;
  proposedCompletionDate: string;
  additionalDaysRequested?: number;
  additionalDaysReason?: string;
  providerNotes?: string;
}) =>
  callRpc("update_job_timeline", {
    p_assignment_id: data.assignmentId,
    p_proposed_completion_date: data.proposedCompletionDate,
    p_additional_days_requested: data.additionalDaysRequested ?? 0,
    p_additional_days_reason: data.additionalDaysReason ?? null,
    p_provider_notes: data.providerNotes ?? null,
  });

export const completeJob = (assignmentId: string, completionSummary: string) =>
  callRpc("complete_job", {
    p_assignment_id: assignmentId,
    p_completion_summary: completionSummary,
  });

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
