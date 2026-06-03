import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: () => <AdminShell />,
});