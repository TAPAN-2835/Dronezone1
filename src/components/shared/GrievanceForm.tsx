import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGrievance } from "@/lib/api/platform";
import { uploadGrievanceAttachment } from "@/lib/api/storage";
import { toast } from "sonner";

interface GrievanceFormProps {
  raisedByType: "customer" | "provider" | "admin";
  onSuccess?: () => void;
  defaultJobId?: string;
}

const categories = [
  "Service quality",
  "Provider conduct",
  "Customer conduct",
  "Delay",
  "Billing",
  "Other",
];

export function GrievanceForm({ onSuccess, defaultJobId = "" }: GrievanceFormProps) {
  const [requestId, setRequestId] = useState(defaultJobId);
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const grievance = await createGrievance({
        category,
        subject,
        description,
        priority,
        serviceRequestId: requestId || undefined,
      });
      if (file) await uploadGrievanceAttachment(grievance.id, file);
      toast.success(`Grievance submitted: ${grievance.grievance_number}`);
      onSuccess?.();
      setSubject("");
      setDescription("");
      setFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit grievance");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1.5 flex h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="grievance-file">Evidence (optional)</Label>
        <Input
          id="grievance-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, or PDF up to 10 MB.</p>
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1.5 flex h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          {["low", "medium", "high", "critical"].map((value) => (
            <option key={value} value={value}>
              {value[0].toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary of the issue"
          className="mt-1.5"
          required
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="requestId">Related request UUID (optional)</Label>
        <Input
          id="requestId"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          placeholder="Paste the request ID from request details"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail…"
          className="mt-1.5 min-h-[120px]"
          required
          maxLength={10000}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Submitting…" : "Submit Grievance"}
      </Button>
    </form>
  );
}
