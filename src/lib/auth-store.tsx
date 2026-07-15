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
import { getDatabaseAuthContext, type AppRole } from "@/lib/api/auth";

export type { AppRole } from "@/lib/api/auth";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  authError: string | null;
  provisioningFailed: boolean;
  refreshRole: () => Promise<AppRole | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export async function resolveUserRole(user: User): Promise<AppRole | null> {
  const context = await getDatabaseAuthContext(user);
  return context.profileProvisioned ? context.role : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [provisioningFailed, setProvisioningFailed] = useState(false);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setLoading(true);
    setSession(nextSession);
    setAuthError(null);
    setProvisioningFailed(false);

    if (!nextSession?.user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const context = await getDatabaseAuthContext(nextSession.user);
      setRole(context.profileProvisioned ? context.role : null);
      if (!context.role || !context.profileProvisioned) {
        setProvisioningFailed(true);
        setAuthError("Your account exists in Auth but its application role/profile is incomplete.");
      }
    } catch (error) {
      setRole(null);
      setAuthError(error instanceof Error ? error.message : "Unable to load account authorization");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setSession(null);
        setRole(null);
        setAuthError(error.message);
        setLoading(false);
        return;
      }
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
    try {
      setAuthError(null);
      const context = await getDatabaseAuthContext(session.user);
      const nextRole = context.profileProvisioned ? context.role : null;
      setRole(nextRole);
      setProvisioningFailed(!context.role || !context.profileProvisioned);
      return nextRole;
    } catch (error) {
      setRole(null);
      setAuthError(error instanceof Error ? error.message : "Unable to refresh authorization");
      return null;
    }
  }, [session]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      role,
      authError,
      provisioningFailed,
      refreshRole,
      signOut,
    }),
    [authError, loading, provisioningFailed, refreshRole, role, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
