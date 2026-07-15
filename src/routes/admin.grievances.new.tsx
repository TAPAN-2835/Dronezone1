import { definePage, Link } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { GrievanceForm } from "@/components/shared/GrievanceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Page = definePage("/admin/grievances/new")({
  head: () => ({ meta: [{ title: "Raise Grievance â€” Admin" }] }),
  component: () => (
    <div className="mx-auto max-w-lg space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin/grievances">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
      <div>
        <h1 className="font-display text-2xl font-bold">Raise Grievance</h1>
        <p className="text-sm text-muted-foreground">
          Submit a grievance on behalf of a user or provider
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Grievance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <GrievanceForm raisedByType="admin" onSuccess={() => window.history.back()} />
        </CardContent>
      </Card>
    </div>
  ),
});
