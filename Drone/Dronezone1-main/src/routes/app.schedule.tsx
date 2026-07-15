import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/schedule")({
  beforeLoad: () => {
    throw redirect({ to: "/app/dashboard" });
  },
});
