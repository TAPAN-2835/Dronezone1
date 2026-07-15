import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AppRole = "customer" | "provider" | "admin";

export type DatabaseAuthContext = {
  role: AppRole | null;
  profileProvisioned: boolean;
};

function normalizeRole(value: unknown): AppRole | null {
  const role = typeof value === "string" ? value.toLowerCase() : "";
  return role === "customer" || role === "provider" || role === "admin" ? role : null;
}

export async function getDatabaseAuthContext(_user?: User): Promise<DatabaseAuthContext> {
  const { data, error } = await supabase.rpc("get_my_auth_context");
  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    role: normalizeRole(row?.role_name),
    profileProvisioned: Boolean(row?.profile_provisioned),
  };
}

export function defaultRouteForRole(role: AppRole | null) {
  if (role === "customer") return "/customer/dashboard";
  if (role === "provider") return "/app/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/login";
}
