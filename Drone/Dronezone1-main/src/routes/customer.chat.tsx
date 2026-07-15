import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Camera, Send } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { chatMessages } from "@/data/customer";

export const Route = createFileRoute("/customer/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Rahul Kumar">
      <Chat />
    </CustomerShell>
  ),
});

import { useState } from "react";

type ChatStatus = 
    | "Draft"
    | "Submitted"
    | "Review"
    | "Quotation Pending"
    | "Awaiting Customer Approval"
    | "Active Job"
    | "Completed"
    | "Feedback Submitted"
    | "Closed";

function Chat() {
  const [demoStatus, setDemoStatus] = useState<ChatStatus>("Active Job");

  const isPreActive = [
    "Draft",
    "Submitted",
    "Review",
    "Quotation Pending",
    "Awaiting Customer Approval",
  ].includes(demoStatus);
  const isPostActive = ["Completed", "Feedback Submitted", "Closed"].includes(demoStatus);

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col bg-[oklch(0.97_0.012_255)]">
      <div className="flex justify-between border-b bg-card px-4 py-2 text-center text-[10px] font-medium text-muted-foreground">
        <div>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Online
        </div>
        <select
          value={demoStatus}
          onChange={(e) => setDemoStatus(e.target.value as ChatStatus)}
          className="ml-4 rounded border bg-background px-2 py-1 text-[10px] outline-none"
        >
          <option value="Submitted">Status: Submitted</option>
          <option value="Active Job">Status: Active Job</option>
          <option value="Completed">Status: Completed</option>
        </select>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 relative">
        {isPreActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="max-w-[80%] rounded-xl bg-card p-4 text-center text-sm shadow-sm border">
              Chat will become available once your service request is accepted and moved to Active
              Jobs.
            </div>
          </div>
        )}

        {chatMessages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${m.from === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card border"}`}
            >
              {m.text}
              <div
                className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isPostActive && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
              This conversation has been closed because the service request has been completed.
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t bg-card p-3">
        <button
          disabled={isPreActive || isPostActive}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          disabled={isPreActive || isPostActive}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          disabled={isPreActive || isPostActive}
          placeholder="Type a message…"
          className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus:border-primary/40 disabled:opacity-50"
        />
        <button
          disabled={isPreActive || isPostActive}
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
