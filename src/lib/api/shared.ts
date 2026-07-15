import { supabase } from "@/lib/supabase";
import type { AppRole } from "@/lib/auth-store";

export async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user;
}

export async function requireRole(expected: AppRole) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles!inner(name)")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const relation = (data as any)?.roles;
  const role = (Array.isArray(relation) ? relation[0]?.name : relation?.name)?.toLowerCase();
  if (role !== expected) throw new Error(`Forbidden: ${expected} access required`);
  return user;
}

export function unwrap<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function callRpc<T>(name: string, params: Record<string, unknown> = {}) {
  const result = await supabase.rpc(name, params);
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
