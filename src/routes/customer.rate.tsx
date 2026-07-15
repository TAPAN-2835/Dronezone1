import { definePage, useNavigate } from "@/lib/router";
import { useState } from "react";
import { Star } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { ratingCriteria } from "@/data/customer";
import { toast } from "sonner";

export const Page = definePage("/customer/rate")({
  head: () => ({ meta: [{ title: "Rate â€” DroneZone" }] }),
  component: () => (
    <CustomerShell title="Rate Your Experience" showBack>
      <Rate />
    </CustomerShell>
  ),
});

function Rate() {
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>(["Service Quality", "Professionalism"]);
  const nav = useNavigate();
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="rounded-2xl border bg-card p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">REQ-1024</div>
        <div className="mt-1 font-display text-lg font-semibold">Overall Rating</div>
        <div className="mt-4 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star
                className={`h-9 w-9 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">How was your service?</div>
        <div className="flex flex-wrap gap-2">
          {ratingCriteria.map((c) => {
            const active = tags.includes(c);
            return (
              <button
                key={c}
                onClick={() => setTags((t) => (active ? t.filter((x) => x !== c) : [...t, c]))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">Your Feedback</div>
        <textarea
          rows={4}
          placeholder="Share your experienceâ€¦"
          defaultValue="Great service! The issue was resolved quickly."
          className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <button
        onClick={() => {
          toast.success("Thank you for your feedback!");
          nav({ to: "/customer/dashboard" });
        }}
        className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Submit Review
      </button>
    </div>
  );
}
