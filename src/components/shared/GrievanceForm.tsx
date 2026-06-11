import { useState } from "react";
import { grievanceCategories } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface GrievanceFormProps {
  raisedByType: "customer" | "provider" | "admin";
  onSuccess?: () => void;
  defaultJobId?: string;
}

export function GrievanceForm({ raisedByType, onSuccess, defaultJobId = "" }: GrievanceFormProps) {
  const [jobId, setJobId] = useState(defaultJobId);
  const [category, setCategory] = useState(grievanceCategories[0]);
  const [priority, setPriority] = useState("Medium");
  const [against, setAgainst] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Grievance submitted successfully. Reference: GRV-NEW");
    onSuccess?.();
  };

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
          {grievanceCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1.5 flex h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          {["Low", "Medium", "High", "Critical"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="against">Against (party name)</Label>
        <Input id="against" value={against} onChange={(e) => setAgainst(e.target.value)} placeholder="Name of customer or provider" className="mt-1.5" required />
      </div>

      <div>
        <Label htmlFor="jobId">Related Job ID (optional)</Label>
        <Input id="jobId" value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="e.g. REQ-1024" className="mt-1.5" />
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
        />
      </div>

      <div>
        <Label>Attachment (optional)</Label>
        <Input type="file" className="mt-1.5" accept="image/*,.pdf" />
        <p className="mt-1 text-xs text-muted-foreground">Upload photos or documents as evidence</p>
      </div>

      <input type="hidden" value={raisedByType} />

      <Button type="submit" className="w-full">Submit Grievance</Button>
    </form>
  );
}
