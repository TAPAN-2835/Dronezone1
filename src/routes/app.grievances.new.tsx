import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GrievanceForm } from "@/components/shared/GrievanceForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/grievances/new")({
  head: () => ({ meta: [{ title: "Raise Grievance — DroneZone" }] }),
  component: () => (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
      </Button>
      <PageHeader title="Raise Grievance" description="Report an issue with a customer, job, or platform service." />
      <Card className="max-w-lg">
        <CardContent className="p-6">
          <GrievanceForm raisedByType="provider" onSuccess={() => window.history.back()} />
        </CardContent>
      </Card>
    </>
  ),
});
