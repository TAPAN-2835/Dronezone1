import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { AppShell } from "@/components/layout/AppShell";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth, type AppRole } from "@/lib/auth-store";
import { PageDataProvider } from "@/lib/router";

import { Page as HomePage } from "@/routes/index";
import { Page as LoginPage } from "@/routes/login";
import { Page as SignupPage } from "@/routes/signup";
import { Page as ProviderDashboardPage } from "@/routes/app.dashboard";
import { Page as ProviderRequestsPage } from "@/routes/app.requests.index";
import { Page as ProviderRequestPage } from "@/routes/app.requests.$id";
import { Page as ProviderActivePage } from "@/routes/app.active";
import { Page as ProviderJobPage } from "@/routes/app.jobs.$id";
import { Page as ProviderQuotationsPage } from "@/routes/app.quotations";
import { Page as ProviderChatPage } from "@/routes/app.chat";
import { Page as ProviderHistoryPage } from "@/routes/app.history";
import { Page as ProviderNotificationsPage } from "@/routes/app.notifications";
import { Page as ProviderProfilePage } from "@/routes/app.profile";
import { Page as ProviderSettingsPage } from "@/routes/app.settings";
import { Page as ProviderGrievancePage } from "@/routes/app.grievances.new";
import { Page as ProviderSignupPage } from "@/routes/app.signup";
import { Page as ProviderVerificationPage } from "@/routes/app.verification";
import { Page as AdminDashboardPage } from "@/routes/admin.dashboard";
import { Page as AdminRequestsPage } from "@/routes/admin.requests";
import { Page as AdminRequestPage } from "@/routes/admin.requests.$id";
import { Page as AdminProvidersPage } from "@/routes/admin.providers";
import { Page as AdminProviderPage } from "@/routes/admin.providers.$id";
import { Page as AdminUsersPage } from "@/routes/admin.users";
import { Page as AdminUserPage } from "@/routes/admin.users.$id";
import { Page as AdminJobsPage } from "@/routes/admin.jobs";
import { Page as AdminJobPage } from "@/routes/admin.jobs.$id";
import { Page as AdminGrievancesPage } from "@/routes/admin.grievances";
import { Page as AdminGrievancePage } from "@/routes/admin.grievances.$id";
import { Page as AdminNewGrievancePage } from "@/routes/admin.grievances.new";
import { Page as AdminCategoriesPage } from "@/routes/admin.categories";
import { Page as AdminMarketingPage } from "@/routes/admin.marketing";
import { Page as AdminAnalyticsPage } from "@/routes/admin.analytics";
import { Page as AdminProfilePage } from "@/routes/admin.profile";
import { Page as CustomerOnboardingPage } from "@/routes/customer.onboarding";
import { Page as CustomerLoginPage } from "@/routes/customer.login";
import { Page as CustomerDashboardPage } from "@/routes/customer.dashboard";
import { Page as CustomerRequestsPage } from "@/routes/customer.requests";
import { Page as CustomerRequestPage } from "@/routes/customer.requests.$id";
import { Page as CustomerNewRequestPage } from "@/routes/customer.new-request";
import { Page as CustomerChatPage } from "@/routes/customer.chat";
import { Page as CustomerAmcPage } from "@/routes/customer.amc";
import { Page as CustomerInvoicesPage } from "@/routes/customer.invoices";
import { Page as CustomerNotificationsPage } from "@/routes/customer.notifications";
import { Page as CustomerProfilePage } from "@/routes/customer.profile";
import { Page as CustomerProfileSectionPage } from "@/routes/customer.profile.$section";
import { Page as CustomerRatePage } from "@/routes/customer.rate";
import { Page as CustomerGrievancePage } from "@/routes/customer.grievances.new";

type PageModule = {
  component?: React.ComponentType;
  loader?: (context?: unknown) => unknown | Promise<unknown>;
};

function PageView({ page }: { page: PageModule }) {
  const Component = page.component;
  return Component ? (
    <PageDataProvider page={page}>
      <Component />
    </PageDataProvider>
  ) : null;
}

function ProtectedArea({ roles, children }: { roles: AppRole[]; children: React.ReactNode }) {
  const { user, role, loading, authError, provisioningFailed } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
    );
  }
  if (!user)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (provisioningFailed || (!role && authError))
    return <Navigate to="/forbidden?reason=provisioning" replace />;
  if (!role || !roles.includes(role)) return <Navigate to="/forbidden" replace />;
  return children;
}

function Forbidden() {
  const { user, role, provisioningFailed, signOut } = useAuth();
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div className="max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Access unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {provisioningFailed
            ? "Your sign-in succeeded, but the required database role or profile was not provisioned. Contact an administrator."
            : "Your database role does not permit access to this page."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {user && role && (
            <a
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              href={
                role === "customer"
                  ? "/customer/dashboard"
                  : role === "provider"
                    ? "/app/dashboard"
                    : "/admin/dashboard"
              }
            >
              Open dashboard
            </a>
          )}
          <button className="rounded-md border px-4 py-2 text-sm" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

function ProviderArea() {
  return (
    <ProtectedArea roles={["provider"]}>
      <AppShell />
    </ProtectedArea>
  );
}

function AdminArea() {
  return (
    <ProtectedArea roles={["admin"]}>
      <AdminShell />
    </ProtectedArea>
  );
}

function CustomerArea() {
  return (
    <ProtectedArea roles={["customer"]}>
      <Outlet />
    </ProtectedArea>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div>
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">The page you requested could not be found.</p>
        <a
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground"
          href="/"
        >
          Go home
        </a>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PageView page={HomePage} />} />
        <Route path="/login" element={<PageView page={LoginPage} />} />
        <Route path="/signup" element={<PageView page={SignupPage} />} />
        <Route path="/forbidden" element={<Forbidden />} />

        <Route path="/app" element={<ProviderArea />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageView page={ProviderDashboardPage} />} />
          <Route path="requests" element={<PageView page={ProviderRequestsPage} />} />
          <Route path="requests/:id" element={<PageView page={ProviderRequestPage} />} />
          <Route path="active" element={<PageView page={ProviderActivePage} />} />
          <Route path="jobs/:id" element={<PageView page={ProviderJobPage} />} />
          <Route path="quotations" element={<PageView page={ProviderQuotationsPage} />} />
          <Route path="chat" element={<PageView page={ProviderChatPage} />} />
          <Route path="history" element={<PageView page={ProviderHistoryPage} />} />
          <Route path="notifications" element={<PageView page={ProviderNotificationsPage} />} />
          <Route path="profile" element={<PageView page={ProviderProfilePage} />} />
          <Route path="settings" element={<PageView page={ProviderSettingsPage} />} />
          <Route path="grievances/new" element={<PageView page={ProviderGrievancePage} />} />
          <Route path="signup" element={<PageView page={ProviderSignupPage} />} />
          <Route path="verification" element={<PageView page={ProviderVerificationPage} />} />
        </Route>

        <Route path="/admin" element={<AdminArea />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageView page={AdminDashboardPage} />} />
          <Route path="requests" element={<PageView page={AdminRequestsPage} />} />
          <Route path="requests/:id" element={<PageView page={AdminRequestPage} />} />
          <Route path="providers" element={<PageView page={AdminProvidersPage} />} />
          <Route path="providers/:id" element={<PageView page={AdminProviderPage} />} />
          <Route path="users" element={<PageView page={AdminUsersPage} />} />
          <Route path="users/:id" element={<PageView page={AdminUserPage} />} />
          <Route path="jobs" element={<PageView page={AdminJobsPage} />} />
          <Route path="jobs/:id" element={<PageView page={AdminJobPage} />} />
          <Route path="grievances" element={<PageView page={AdminGrievancesPage} />} />
          <Route path="grievances/new" element={<PageView page={AdminNewGrievancePage} />} />
          <Route path="grievances/:id" element={<PageView page={AdminGrievancePage} />} />
          <Route path="disputes" element={<Navigate to="../grievances" replace />} />
          <Route path="categories" element={<PageView page={AdminCategoriesPage} />} />
          <Route path="marketing" element={<PageView page={AdminMarketingPage} />} />
          <Route path="analytics" element={<PageView page={AdminAnalyticsPage} />} />
          <Route path="profile" element={<PageView page={AdminProfilePage} />} />
        </Route>

        <Route path="/customer">
          <Route path="onboarding" element={<PageView page={CustomerOnboardingPage} />} />
          <Route path="login" element={<PageView page={CustomerLoginPage} />} />
          <Route element={<CustomerArea />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PageView page={CustomerDashboardPage} />} />
            <Route path="requests" element={<PageView page={CustomerRequestsPage} />}>
              <Route path=":id" element={<PageView page={CustomerRequestPage} />} />
            </Route>
            <Route path="new-request" element={<PageView page={CustomerNewRequestPage} />} />
            <Route path="chat" element={<PageView page={CustomerChatPage} />} />
            <Route path="amc" element={<PageView page={CustomerAmcPage} />} />
            <Route path="invoices" element={<PageView page={CustomerInvoicesPage} />} />
            <Route path="notifications" element={<PageView page={CustomerNotificationsPage} />} />
            <Route
              path="profile/:section"
              element={<PageView page={CustomerProfileSectionPage} />}
            />
            <Route path="profile" element={<PageView page={CustomerProfilePage} />} />
            <Route path="rate" element={<PageView page={CustomerRatePage} />} />
            <Route path="grievances/new" element={<PageView page={CustomerGrievancePage} />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-right" />
      <RoleSwitcher />
    </>
  );
}
