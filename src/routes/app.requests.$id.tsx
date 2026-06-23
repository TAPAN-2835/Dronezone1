import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Calendar,
  Plane,
  FileText,
  Check,
  X,
  Clock,
  User,
  Paperclip,
  ExternalLink,
  Plus,
  Minus,
  Send,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobAgeBadge } from "@/components/shared/JobAgeBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobs, inr } from "@/data/demo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/requests/$id")({
  head: ({ params }) => ({ meta: [{ title: `Review ${params.id} — DroneZone` }] }),
  component: RequestReview,
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Request not found.</div>
  ),
});

function RequestReview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === id);

  /* --- local state --- */
  const [showTimeline, setShowTimeline] = useState(true);
  const [additionalDays, setAdditionalDays] = useState(job?.additionalDays ?? 0);
  const [timelineNotes, setTimelineNotes] = useState(job?.timelineNotes ?? "");
  const [timelineAction, setTimelineAction] = useState<"none" | "accept" | "propose">("none");
  const [providerNotes, setProviderNotes] = useState("");
  const [showQuotation, setShowQuotation] = useState(true);

  /* quotation fields */
  const [hardware, setHardware] = useState(2500);
  const [labor, setLabor] = useState(1000);
  const [shipping, setShipping] = useState(500);
  const [discountPct, setDiscountPct] = useState(0);
  const [gst, setGst] = useState(18);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteSent, setQuoteSent] = useState(false);
  const [customerResponse, setCustomerResponse] = useState<"pending" | "accepted" | "changes">("pending");

  if (!job) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Request {id} not found.</p>
        <Button asChild className="mt-4">
          <Link to="/app/requests">Back to requests</Link>
        </Button>
      </div>
    );
  }

  const isNew = job.status === "new";
  const requestedDate = job.requestedCompletionDate
    ? new Date(job.requestedCompletionDate)
    : new Date(job.scheduledAt);
  const proposedDate = new Date(requestedDate.getTime() + additionalDays * 86400000);

  /* quotation calculations */
  const subtotal = hardware + labor + shipping;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = Math.round((afterDiscount * gst) / 100);
  const total = afterDiscount + gstAmount;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/requests">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
      </Button>

      <PageHeader
        title={isNew ? "Request Review" : job.issue}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{job.id}</span>
            <StatusBadge status={job.status} />
            <JobAgeBadge createdAt={job.createdAt} />
            {job.timelineStatus === "customer_pending" && (
              <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-[oklch(0.45_0.15_75)]">
                Awaiting Customer Approval
              </span>
            )}
          </span>
        }
        actions={
          isNew ? (
            <>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => toast.success(`${job.id} rejected`)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => toast.success(`${job.id} accepted`)}>
                <Check className="h-4 w-4" /> Accept Request
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate({ to: "/app/jobs/$id", params: { id: job.id } })}>
              <FileText className="h-4 w-4" /> View Job Details
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* ── Customer Info ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {job.customer.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{job.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{job.customer.phone}</div>
                  {job.customer.email && (
                    <div className="text-xs text-muted-foreground">{job.customer.email}</div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${job.customer.phone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" /> Contact Customer
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Drone Info ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plane className="h-4 w-4 text-primary" /> Drone Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Model" value={job.drone.model} />
              <Field label="Serial number" value={job.drone.serial} />
              <Field label="Purchase date" value={job.drone.purchaseDate ?? "—"} />
              <Field label="Warranty" value={job.drone.warranty ?? "—"} />
              <Field label="Service category" value={job.serviceCategory ?? "—"} />
            </CardContent>
          </Card>

          {/* ── ITEM 1: Issue Description (enhanced) ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-primary" /> Issue Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-base">{job.issue}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{job.description}</p>
              </div>

              {/* Customer images placeholder grid */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Customer Images
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(job.attachments ?? [])
                    .filter((a) => a.type === "image")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-muted/60 to-muted/30 p-3 text-center transition hover:border-primary/30"
                      >
                        <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
                        <span className="mt-1 text-[10px] font-medium text-muted-foreground">
                          {a.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* ITEM 2: Expected Completion Date (date only, no time) */}
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                  <Calendar className="h-3.5 w-3.5" /> Requested Completion Date
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {requestedDate.toLocaleDateString("en-IN", { dateStyle: "full" })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  End of day assumption
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Attachments ── */}
          {job.attachments && job.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-4 w-4 text-primary" /> Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {job.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex aspect-video flex-col items-center justify-center rounded-lg border bg-gradient-to-br from-muted to-card p-3 text-center"
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-2 text-xs font-medium">{a.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">{a.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ITEM 3 & 4: More Days Required + Timeline Negotiation ── */}
          {isNew && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" /> Timeline & Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* More Days Required */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    More Days Required
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setAdditionalDays(Math.max(0, additionalDays - 1))}
                      disabled={additionalDays === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <div className="font-display text-3xl font-bold text-primary">
                        {additionalDays}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Additional days
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setAdditionalDays(additionalDays + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Requested Date</span>
                      <div className="font-medium">
                        {requestedDate.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Proposed Date</span>
                      <div className="font-medium text-primary">
                        {proposedDate.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </div>
                    </div>
                  </div>

                  {additionalDays > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Reason for additional days</Label>
                      <Textarea
                        value={timelineNotes}
                        onChange={(e) => setTimelineNotes(e.target.value)}
                        placeholder="Explain why additional time is needed…"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Timeline Negotiation Actions */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Timeline Decision
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant={timelineAction === "accept" ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => {
                        setTimelineAction("accept");
                        setAdditionalDays(0);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-semibold">Accept Original Timeline</div>
                        <div className="text-[10px] opacity-70">
                          Complete by customer's requested date
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={timelineAction === "propose" ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => setTimelineAction("propose")}
                    >
                      <Calendar className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-semibold">Propose New Timeline</div>
                        <div className="text-[10px] opacity-70">
                          Submit revised date for approval
                        </div>
                      </div>
                    </Button>
                  </div>

                  {timelineAction === "propose" && additionalDays > 0 && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        toast.success("Timeline revision submitted — Awaiting Customer Approval");
                      }}
                    >
                      <Send className="h-4 w-4" /> Submit Timeline Revision
                    </Button>
                  )}
                  {timelineAction === "propose" && additionalDays === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      Use the +/- controls above to add additional days before submitting.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Provider Notes ── */}
          {isNew && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Provider Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  placeholder="Add your observations, special instructions, or requirements…"
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* ── ITEM 5 & 6: Inline Quotation Builder ── */}
          {isNew && (
            <Card className="border-primary/20">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setShowQuotation(!showQuotation)}
              >
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Quotation
                  </span>
                  {showQuotation ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {showQuotation && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <MoneyField label="Hardware Cost" value={hardware} onChange={setHardware} />
                    <MoneyField label="Labor Charge" value={labor} onChange={setLabor} />
                    <MoneyField label="Shipping Charge" value={shipping} onChange={setShipping} />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Discount (%)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={discountPct}
                          onChange={(e) =>
                            setDiscountPct(Math.max(0, Math.min(100, +e.target.value || 0)))
                          }
                          className="h-10 pr-8"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">GST (%)</Label>
                    <Input
                      type="number"
                      value={gst}
                      onChange={(e) => setGst(+e.target.value || 0)}
                      className="h-10"
                    />
                  </div>

                  {/* Calculation display */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Hardware Cost</span>
                      <span className="font-medium text-foreground">{inr(hardware)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Labor Charge</span>
                      <span className="font-medium text-foreground">{inr(labor)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Charge</span>
                      <span className="font-medium text-foreground">{inr(shipping)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">{inr(subtotal)}</span>
                    </div>
                    {discountPct > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount ({discountPct}%)</span>
                        <span className="font-medium">− {inr(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST ({gst}%)</span>
                      <span className="font-medium text-foreground">{inr(gstAmount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">{inr(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes to customer</Label>
                    <Textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Optional terms, warranty, or instructions…"
                      rows={2}
                    />
                  </div>

                  {!quoteSent ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setQuoteSent(true);
                        toast.success("Quotation sent to customer — awaiting review");
                      }}
                    >
                      <Send className="h-4 w-4" /> Send Quotation to Customer
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                        <div className="text-xs uppercase tracking-wide text-primary font-medium">
                          Quotation Sent
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Waiting for customer response…
                        </div>
                      </div>

                      <div className="mt-2 rounded-lg bg-muted/50 p-2 text-center text-xs text-muted-foreground border border-muted flex items-center justify-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Fixed pricing — customers cannot negotiate quotation amounts
                      </div>

                      {/* Demo: simulate customer response */}
                      <div className="rounded-lg border bg-muted/30 p-3 space-y-2 mt-4">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          Demo: Simulate Customer Response
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={customerResponse === "accepted" ? "default" : "outline"}
                            onClick={() => {
                              setCustomerResponse("accepted");
                              toast.success("Customer accepted the quotation!");
                            }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Accept
                          </Button>
                          <Button
                            variant={customerResponse === "changes" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCustomerResponse("changes");
                              toast.info("Customer requested changes to quotation");
                            }}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" /> Request Changes
                          </Button>
                        </div>
                      </div>

                      {customerResponse === "accepted" && (
                        <Button
                          className="w-full bg-primary mt-3"
                          onClick={() => {
                            toast.success("Converted to active job!");
                            navigate({ to: "/app/active" });
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" /> Convert to Active Job
                        </Button>
                      )}

                      {customerResponse === "changes" && (
                        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-center mt-3">
                          <div className="text-xs text-[oklch(0.45_0.15_75)] font-medium">
                            Customer has requested changes
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Revise the quotation above and re-send
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setQuoteSent(false);
                              setCustomerResponse("pending");
                              toast.info("Quotation reopened for editing");
                            }}
                          >
                            Revise Quotation
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* ── Request Timeline ── */}
          {job.timeline && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowTimeline(!showTimeline)}>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Request Timeline
                  </span>
                  {showTimeline ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {showTimeline && (
                <CardContent>
                  <ol className="relative space-y-4 border-l-2 border-border pl-6">
                    {job.timeline.map((event, i) => (
                      <li key={event.id} className="relative">
                        <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <div className="text-sm font-semibold">{event.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                        {event.description && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {event.description}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground font-medium">•</span>
                <span>{job.location}</span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(job.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "full" })}
                </span>
              </div>
            </CardContent>
          </Card>

          {isNew && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">Ready to take this job?</p>
                <Button className="w-full" onClick={() => toast.success(`${job.id} accepted`)}>
                  <Check className="h-4 w-4" /> Accept Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={() => toast.success(`${job.id} rejected`)}
                >
                  <X className="h-4 w-4" /> Reject Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="h-10 pl-7"
        />
      </div>
    </div>
  );
}
