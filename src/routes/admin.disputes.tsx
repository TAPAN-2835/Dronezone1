import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/disputes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/grievances" });
  },
});
