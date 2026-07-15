import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AppRole = "customer" | "provider" | "admin";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  refreshRole: () => Promise<AppRole | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRole(value: unknown): AppRole | null {
  const role = typeof value === "string" ? value.toLowerCase() : "";
  return role === "customer" || role === "provider" || role === "admin" ? role : null;
}

export async function resolveUserRole(user: User): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles!inner(name)")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .limit(1)
    .maybeSingle();

  if (error) console.warn("Unable to load the user's database role:", error.message);
  const relation = (data as { roles?: { name?: string } | { name?: string }[] } | null)?.roles;
  const databaseRole = Array.isArray(relation) ? relation[0]?.name : relation?.name;
  return normalizeRole(databaseRole) ?? normalizeRole(user.user_metadata?.role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setRole(nextSession?.user ? await resolveUserRole(nextSession.user) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.warn("Unable to restore the Supabase session:", error.message);
      void applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) void applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshRole = useCallback(async () => {
    if (!session?.user) {
      setRole(null);
      return null;
    }
    const nextRole = await resolveUserRole(session.user);
    setRole(nextRole);
    return nextRole;
  }, [session]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, loading, role, refreshRole, signOut }),
    [loading, refreshRole, role, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
