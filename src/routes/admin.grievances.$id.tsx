import { definePage, Link, useRouter } from "@/lib/router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGrievance, updateGrievance } from "@/lib/api/platform";
import { toast } from "sonner";

export const Page = definePage("/admin/grievances/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Grievance` }] }),
  loader: ({ params }) => getGrievance(params.id),
  component: Detail,
});
function Detail() {
  const data = Page.useLoaderData<Awaited<ReturnType<typeof getGrievance>>>();
  const { grievance: g, replies, history } = data;
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function change(status: string) {
    setBusy(true);
    try {
      await updateGrievance(g.id, status);
      toast.success("Grievance updated");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/grievances">
          <ArrowLeft className="h-4 w-4" />
          All grievances
        </Link>
      </Button>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{g.grievance_number}</h1>
          <p className="text-muted-foreground">{g.subject}</p>
          <div className="mt-2 flex gap-2 text-xs capitalize">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
              {g.status.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1">{g.priority}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button disabled={busy} variant="outline" onClick={() => void change("in_progress")}>
            Mark In Progress
          </Button>
          <Button disabled={busy} onClick={() => void change("resolved")}>
            Resolve
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{g.description}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Case details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <b>Category:</b> {g.category}
            </p>
            <p>
              <b>Created:</b> {new Date(g.created_at).toLocaleString("en-IN")}
            </p>
            <p>
              <b>Replies:</b> {replies.length}
            </p>
            <p>
              <b>Status events:</b> {history.length}
            </p>
          </CardContent>
        </Card>
      </div>
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((item: any) => (
              <div key={item.id} className="border-l-2 border-primary pl-3 text-sm">
                <span className="capitalize">{String(item.to_status).replaceAll("_", " ")}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
