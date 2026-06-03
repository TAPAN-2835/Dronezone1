import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/customer" || location.pathname === "/customer/") {
      throw redirect({ to: "/customer/dashboard" });
    }
  },
  component: () => <Outlet />,
});