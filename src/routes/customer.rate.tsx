import { definePage, useNavigate } from "@/lib/router";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { toast } from "sonner";
import { listFeedbackEligibleJobs, submitFeedback } from "@/lib/api/platform";
import { uploadFeedbackAttachment } from "@/lib/api/storage";

const criteria = ["Service Quality", "Professionalism", "Timeliness", "Communication", "Value"];

export const Page = definePage("/customer/rate")({
  head: () => ({ meta: [{ title: "Rate — DroneZone" }] }),
  loader: () => listFeedbackEligibleJobs(),
  component: () => (
    <CustomerShell title="Rate Your Experience" showBack>
      <Rate />
    </CustomerShell>
  ),
});

function Rate() {
  const jobs = Page.useLoaderData<Awaited<ReturnType<typeof listFeedbackEligibleJobs>>>();
  const eligible = useMemo(() => jobs.filter((job) => !job.feedback?.length), [jobs]);
  const [assignmentId, setAssignmentId] = useState(eligible[0]?.id ?? "");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit() {
    if (!assignmentId) return;
    setBusy(true);
    try {
      const feedback = (await submitFeedback({ assignmentId, rating, comments, tags })) as {
        id: string;
      };
      if (file) await uploadFeedbackAttachment(feedback.id, file);
      toast.success("Thank you for your feedback!");
      nav({ to: "/customer/requests" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit feedback");
    } finally {
      setBusy(false);
    }
  }

  if (!eligible.length)
    return (
      <div className="px-5 py-12 text-center text-sm text-muted-foreground">
        No completed jobs are waiting for feedback.
      </div>
    );
  const selected = eligible.find((job) => job.id === assignmentId);
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="rounded-2xl border bg-card p-5 text-center">
        <select
          value={assignmentId}
          onChange={(event) => setAssignmentId(event.target.value)}
          className="mb-3 h-10 w-full rounded-lg border bg-background px-3 text-sm"
        >
          {eligible.map((job) => (
            <option key={job.id} value={job.id}>
              {job.service_requests?.request_number} — {job.service_requests?.title}
            </option>
          ))}
        </select>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {selected?.service_requests?.request_number}
        </div>
        <div className="mt-1 font-display text-lg font-semibold">Overall Rating</div>
        <div className="mt-4 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
            >
              <Star
                className={`h-9 w-9 ${value <= rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">How was your service?</div>
        <div className="flex flex-wrap gap-2">
          {criteria.map((criterion) => (
            <button
              type="button"
              key={criterion}
              onClick={() =>
                setTags((current) =>
                  current.includes(criterion)
                    ? current.filter((tag) => tag !== criterion)
                    : [...current, criterion],
                )
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${tags.includes(criterion) ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`}
            >
              {criterion}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">Evidence (optional)</div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-xl border bg-card p-2 text-sm"
        />
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">Your Feedback</div>
        <textarea
          rows={5}
          maxLength={4000}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Share your experience…"
          className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary/40"
        />
      </div>
      <button
        disabled={busy || !assignmentId}
        onClick={() => void submit()}
        className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}
