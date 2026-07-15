import { supabase } from "@/lib/supabase";
import { callRpc, requireRole, requireUser, unwrap } from "./shared";

export type Notification = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "urgent";
  deep_link: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export async function listNotifications(limit = 100) {
  await requireUser();
  return unwrap(
    await supabase
      .from("notifications")
      .select("id,notification_type,title,body,priority,deep_link,read_at,archived_at,created_at")
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(limit),
  ) as Notification[];
}

export const markNotificationRead = (id: string) =>
  callRpc<void>("mark_notification_read", { p_notification_id: id, p_read: true });
export const markAllNotificationsRead = () => callRpc<number>("mark_all_notifications_read");
export const archiveNotification = (id: string) =>
  callRpc<void>("archive_notification", { p_notification_id: id });

export type CompletedJobForFeedback = {
  id: string;
  completed_at: string | null;
  service_requests: { id: string; request_number: string; title: string } | null;
  feedback: { id: string; rating: number }[];
};

export async function listFeedbackEligibleJobs() {
  await requireRole("customer");
  return unwrap(
    await supabase
      .from("job_assignments")
      .select("id,completed_at,service_requests!inner(id,request_number,title),feedback(id,rating)")
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
  ) as unknown as CompletedJobForFeedback[];
}

export function submitFeedback(input: {
  assignmentId: string;
  rating: number;
  comments: string;
  tags: string[];
}) {
  return callRpc("submit_feedback", {
    p_assignment_id: input.assignmentId,
    p_rating: input.rating,
    p_comments: input.comments,
    p_tags: input.tags,
  });
}

export type Grievance = {
  id: string;
  grievance_number: string;
  raised_by: string;
  against_user_id: string | null;
  service_request_id: string | null;
  category: string;
  subject: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "waiting_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assigned_admin_id: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
};

export async function listGrievances() {
  await requireUser();
  return unwrap(
    await supabase.from("grievances").select("*").order("created_at", { ascending: false }),
  ) as Grievance[];
}

export async function getGrievance(id: string) {
  await requireUser();
  const grievance = unwrap(
    await supabase.from("grievances").select("*").eq("id", id).single(),
  ) as Grievance;
  const [replies, history] = await Promise.all([
    supabase.from("grievance_replies").select("*").eq("grievance_id", id).order("created_at"),
    supabase
      .from("grievance_status_history")
      .select("*")
      .eq("grievance_id", id)
      .order("created_at"),
  ]);
  return { grievance, replies: unwrap(replies) ?? [], history: unwrap(history) ?? [] };
}

export function createGrievance(input: {
  category: string;
  subject: string;
  description: string;
  priority: string;
  againstUserId?: string;
  serviceRequestId?: string;
}) {
  return callRpc<Grievance>("create_grievance", {
    p_category: input.category,
    p_subject: input.subject,
    p_description: input.description,
    p_priority: input.priority.toLowerCase(),
    p_against_user_id: input.againstUserId || null,
    p_service_request_id: input.serviceRequestId || null,
  });
}

export const updateGrievance = (id: string, status: string, notes?: string) =>
  callRpc<Grievance>("update_grievance", {
    p_grievance_id: id,
    p_status: status,
    p_priority: null,
    p_assigned_admin: null,
    p_notes: notes || null,
  });

export type AmcPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  tax_percent: number;
  currency: string;
  duration_months: number;
  amc_plan_benefits: { id: string; benefit: string; sort_order: number }[];
};

export async function getAmcOverview() {
  await requireRole("customer");
  const [plans, subscriptions] = await Promise.all([
    supabase
      .from("amc_plans")
      .select("*,amc_plan_benefits(id,benefit,sort_order)")
      .eq("is_active", true)
      .order("price"),
    supabase
      .from("amc_subscriptions")
      .select(
        "*,amc_plans(name,description,price,currency,duration_months,amc_plan_benefits(benefit,sort_order)),amc_transactions(*)",
      )
      .order("created_at", { ascending: false }),
  ]);
  return { plans: unwrap(plans) as AmcPlan[], subscriptions: unwrap(subscriptions) as any[] };
}

export const subscribeAmc = (planId: string, autoRenew: boolean) =>
  callRpc("subscribe_amc", { p_plan_id: planId, p_auto_renew: autoRenew });
export const setAmcAutoRenew = (subscriptionId: string, enabled: boolean) =>
  callRpc<void>("set_amc_auto_renew", { p_subscription_id: subscriptionId, p_enabled: enabled });

export type Campaign = {
  id: string;
  name: string;
  campaign_type: string;
  audience_type: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  campaign_recipients: { delivery_status: string }[];
};

export async function listCampaigns() {
  await requireRole("admin");
  return unwrap(
    await supabase
      .from("campaigns")
      .select("*,campaign_recipients(delivery_status)")
      .order("created_at", { ascending: false }),
  ) as Campaign[];
}

export const createCampaign = (input: {
  name: string;
  type: string;
  audience: string;
  subject: string;
  body: string;
}) =>
  callRpc<Campaign>("create_campaign", {
    p_name: input.name,
    p_type: input.type,
    p_audience: input.audience,
    p_subject: input.subject,
    p_body: input.body,
    p_scheduled_at: null,
  });
export const queueCampaign = (id: string) =>
  callRpc<number>("queue_campaign", { p_campaign_id: id });
export const importCampaignRecipients = (id: string, emails: string[]) =>
  callRpc<number>("import_campaign_recipients", { p_campaign_id: id, p_emails: emails });

export type AdminAnalytics = {
  users: number;
  customers: number;
  providers: number;
  requests: number;
  completed: number;
  rejected: number;
  pending: number;
  revenue: number;
  average_rating: number;
  average_completion_days: number;
  request_status: { name: string; value: number }[];
  provider_status: { name: string; value: number }[];
  categories: { name: string; value: number }[];
  regions: { name: string; value: number }[];
  cities: { name: string; value: number }[];
  models: { name: string; value: number }[];
  monthly: { name: string; value: number }[];
};

export const getAdminAnalytics = () => callRpc<AdminAnalytics>("get_admin_analytics");

export async function listServicePricing() {
  await requireUser();
  return unwrap(
    await supabase
      .from("service_pricing")
      .select("*,service_categories(name)")
      .order("effective_from", { ascending: false }),
  ) as any[];
}

export async function getPricingAdminData() {
  await requireRole("admin");
  const [categories, pricing] = await Promise.all([
    supabase.from("service_categories").select("*").order("sort_order"),
    supabase
      .from("service_pricing")
      .select("*,service_categories(name)")
      .order("effective_from", { ascending: false }),
  ]);
  return { categories: unwrap(categories) as any[], pricing: unwrap(pricing) as any[] };
}

export const setServiceCategory = (input: {
  id?: string;
  name: string;
  description?: string;
  active: boolean;
}) =>
  callRpc("set_service_category", {
    p_id: input.id || null,
    p_name: input.name,
    p_description: input.description || null,
    p_active: input.active,
  });

export function setServicePricing(input: {
  categoryId: string;
  pricingType: string;
  amount: number;
  taxPercent: number;
}) {
  return callRpc("set_service_pricing", {
    p_category_id: input.categoryId,
    p_pricing_type: input.pricingType,
    p_amount: input.amount,
    p_tax_percent: input.taxPercent,
    p_currency: "INR",
    p_effective_from: new Date().toISOString().slice(0, 10),
    p_provider_id: null,
    p_effective_to: null,
  });
}
