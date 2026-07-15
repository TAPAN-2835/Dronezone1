import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUserEmail, getStoredProviders } from "@/lib/auth-store";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    // Auth Check
    const email = getCurrentUserEmail();
    const providers = getStoredProviders();
    const user = providers.find((p) => p.email === email);

    if (!user || user.status !== "Approved") {
      throw redirect({ to: "/login" });
    }

    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: () => <AppShell />,
});
