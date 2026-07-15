import { definePage, Link } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { GrievanceForm } from "@/components/shared/GrievanceForm";

export const Page = definePage("/customer/grievances/new")({
  head: () => ({ meta: [{ title: "Raise Grievance â€” DroneZone" }] }),
  component: () => (
    <CustomerShell title="Raise Grievance" showBack>
      <div className="px-5 py-5">
        <p className="mb-4 text-sm text-muted-foreground">
          Report an issue with a service provider, job, or billing.
        </p>
        <GrievanceForm raisedByType="customer" onSuccess={() => window.history.back()} />
      </div>
    </CustomerShell>
  ),
});
