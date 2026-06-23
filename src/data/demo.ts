export type JobStatus =
  | "new"
  | "accepted"
  | "en_route"
  | "on_site"
  | "in_progress"
  | "testing"
  | "completed"
  | "rejected"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "partial" | "refunded" | "not_applicable";
export type AmcCoverage = "covered" | "not_covered" | "expired";
export type TimelineStatus = "original" | "proposed" | "customer_pending" | "approved";
export type VerificationStatus = "pending" | "approved" | "rejected" | "documents_required";

export interface JobAttachment {
  id: string;
  name: string;
  type: "image" | "document";
}

export interface JobTimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  description?: string;
}

export interface Job {
  id: string;
  customer: { name: string; phone: string; email?: string; avatar?: string };
  drone: { model: string; serial: string; purchaseDate?: string; warranty?: string };
  issue: string;
  description: string;
  location: string;
  city: string;
  createdAt: string;
  scheduledAt: string;
  status: JobStatus;
  amount?: number;
  images?: string[];
  assignedEngineer?: string;
  serviceCategory?: string;
  attachments?: JobAttachment[];
  timeline?: JobTimelineEvent[];
  notes?: string;
  paymentStatus?: PaymentStatus;
  amcStatus?: AmcCoverage;
  /* --- NEW: timeline negotiation --- */
  requestedCompletionDate?: string;
  proposedCompletionDate?: string;
  additionalDays?: number;
  timelineNotes?: string;
  timelineStatus?: TimelineStatus;
  /* --- NEW: rating & completion --- */
  customerRating?: number;
  customerRatingLabel?: string;
  completedAt?: string;
  feedbackSubmitted?: boolean;
}

export interface Quotation {
  id: string;
  jobId: string;
  hardwareCost: number;
  laborCost: number;
  shippingCost: number;
  discountPercent: number;
  gstPercent: number;
  notes?: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "customer_review" | "revision_requested";
  sentAt?: string;
}

export interface ChatThread {
  id: string;
  jobId: string;
  customer: { name: string; phone: string; online: boolean };
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface Message {
  id: string;
  threadId: string;
  from: "me" | "customer";
  text: string;
  time: string;
}

export interface AppNotification {
  id: string;
  category: "request" | "payment" | "reminder" | "system" | "grievance";
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
  relatedId?: string;
}

const cities = [
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Delhi",
  "Gurgaon",
  "Ahmedabad",
];
const areas: Record<string, string[]> = {
  Bengaluru: ["Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Jayanagar"],
  Mumbai: ["Bandra", "Powai", "Andheri West", "Lower Parel"],
  Hyderabad: ["Gachibowli", "Banjara Hills", "Hitech City"],
  Pune: ["Koregaon Park", "Baner", "Viman Nagar"],
  Chennai: ["T. Nagar", "Anna Nagar", "Velachery"],
  Delhi: ["Saket", "Dwarka", "Rohini"],
  Gurgaon: ["Cyber City", "Sector 49", "Golf Course Rd"],
  Ahmedabad: ["Satellite", "SG Highway"],
};
const drones = ["DJI Mavic 3", "DJI Air 3", "DJI Mini 4 Pro", "DJI Inspire 3", "Autel EVO II"];
const issues = [
  {
    title: "Propeller Replacement",
    desc: "Drone propeller is damaged after collision. Needs replacement and balance check.",
  },
  { title: "Battery Issue", desc: "Battery drains rapidly and shows incorrect charge levels." },
  {
    title: "Camera Gimbal Calibration",
    desc: "Footage is shaky and gimbal does not stabilize properly.",
  },
  { title: "Motor Failure", desc: "One of the motors stopped responding mid-flight." },
  { title: "Firmware Update", desc: "Drone stuck on boot. Needs firmware recovery." },
  { title: "GPS Signal Loss", desc: "Drone loses GPS lock frequently during flight." },
  { title: "Annual Service", desc: "Routine annual maintenance and diagnostic check." },
];
const customers = [
  { name: "Rohit Verma", phone: "+91 98765 43210", email: "rohit@email.com" },
  { name: "Aditi Sharma", phone: "+91 99830 11245", email: "aditi@email.com" },
  { name: "Karan Mehta", phone: "+91 98201 55678", email: "karan@email.com" },
  { name: "Priya Nair", phone: "+91 90080 33421", email: "priya@email.com" },
  { name: "Vikram Singh", phone: "+91 97400 66781", email: "vikram@email.com" },
  { name: "Neha Gupta", phone: "+91 99102 87654", email: "neha@email.com" },
  { name: "Arjun Reddy", phone: "+91 98852 11223", email: "arjun@email.com" },
  { name: "Sneha Iyer", phone: "+91 90420 78890", email: "sneha@email.com" },
];

const categories = ["Repair", "Maintenance", "Battery Services", "Calibration", "Firmware"];
const engineers = ["Rahul Sharma", "Arjun Patel", "Vikram Singh", "Neha Gupta"];

const ratingLabels: Record<number, string> = {
  5: "Excellent",
  4: "Very Good",
  3: "Good",
  2: "Satisfactory",
  1: "Poor",
};

function pad(n: number) {
  return String(n).padStart(4, "0");
}

const today = new Date("2026-06-02T10:00:00");
function isoOffset(daysFromToday: number, h = 10, m = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const statuses: JobStatus[] = [
  "new",
  "new",
  "new",
  "accepted",
  "in_progress",
  "en_route",
  "on_site",
  "testing",
  "completed",
  "completed",
  "completed",
  "rejected",
];

function buildTimeline(status: JobStatus, createdAt: string): JobTimelineEvent[] {
  const base = [
    {
      id: "t1",
      label: "Request Submitted",
      timestamp: createdAt,
      description: "Customer submitted service request",
    },
  ];
  if (status === "new") return base;
  const events: JobTimelineEvent[] = [
    ...base,
    {
      id: "t2",
      label: "Request Accepted",
      timestamp: createdAt,
      description: "Provider accepted the job",
    },
  ];
  if (["en_route", "on_site", "in_progress", "testing", "completed"].includes(status)) {
    events.push({
      id: "t3",
      label: "Engineer En Route",
      timestamp: createdAt,
      description: "Assigned engineer dispatched",
    });
  }
  if (["on_site", "in_progress", "testing", "completed"].includes(status)) {
    events.push({
      id: "t4",
      label: "On Site",
      timestamp: createdAt,
      description: "Engineer arrived at location",
    });
  }
  if (["in_progress", "testing", "completed"].includes(status)) {
    events.push({
      id: "t5",
      label: "Repair In Progress",
      timestamp: createdAt,
      description: "Diagnostic and repair started",
    });
  }
  if (["testing", "completed"].includes(status)) {
    events.push({
      id: "t6",
      label: "Testing",
      timestamp: createdAt,
      description: "Quality check and flight test",
    });
  }
  if (status === "completed") {
    events.push({
      id: "t7",
      label: "Completed",
      timestamp: createdAt,
      description: "Job marked complete",
    });
  }
  if (status === "rejected") {
    return [
      { id: "t1", label: "Request Submitted", timestamp: createdAt },
      {
        id: "t2",
        label: "Request Rejected",
        timestamp: createdAt,
        description: "Provider declined this request",
      },
    ];
  }
  return events;
}

export const jobs: Job[] = Array.from({ length: 24 }).map((_, i) => {
  const city = cities[i % cities.length];
  const area = areas[city][i % areas[city].length];
  const cust = customers[i % customers.length];
  const issue = issues[i % issues.length];
  const status = statuses[i % statuses.length];
  const dayOffset =
    status === "completed" ? -(i + 1) : status === "new" ? -Math.min(i, 5) : -Math.floor(i / 3);
  const createdAt = isoOffset(dayOffset, 9 + (i % 8), (i * 7) % 60);
  const isActive = ["accepted", "en_route", "on_site", "in_progress", "testing"].includes(status);

  // Requested completion = scheduled + 1-3 days
  const reqDate = new Date(isoOffset(dayOffset + 1 + (i % 3), 23, 59));
  const requestedCompletionDate = reqDate.toISOString();

  // For some jobs, provider proposed a different date
  const hasProposal = isActive && i % 3 === 0;
  const addDays = hasProposal ? 1 + (i % 2) : 0;
  const proposedDate = hasProposal
    ? new Date(reqDate.getTime() + addDays * 86400000).toISOString()
    : undefined;

  // Customer rating for completed jobs
  const rating = status === "completed" ? 3 + (i % 3) : undefined; // 3, 4, or 5
  const delayDays =
    status === "completed" ? (i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : i % 4 === 2 ? 0 : 2) : undefined;
  const completedAt =
    status === "completed" ? isoOffset(dayOffset + 1 + (delayDays ?? 0), 17, 0) : undefined;

  return {
    id: `REQ-${pad(1024 + i)}`,
    customer: cust,
    drone: {
      model: drones[i % drones.length],
      serial: `SN-${1000 + i * 37}`,
      purchaseDate: "Jan 2025",
      warranty: i % 3 === 0 ? "Active · until Aug 2026" : "Expired",
    },
    issue: issue.title,
    description: issue.desc,
    location: `${area}, ${city}`,
    city,
    createdAt,
    scheduledAt: isoOffset(dayOffset + (status === "new" ? 1 : 0), 10 + (i % 6), 0),
    status,
    amount: status === "completed" ? 2500 + (i % 6) * 750 : undefined,
    assignedEngineer:
      isActive || status === "completed" ? engineers[i % engineers.length] : undefined,
    serviceCategory: categories[i % categories.length],
    attachments: [
      { id: "a1", name: "Issue Photo 1", type: "image" as const },
      { id: "a2", name: "Issue Photo 2", type: "image" as const },
      { id: "a3", name: "Purchase Invoice", type: "document" as const },
    ],
    timeline: buildTimeline(status, createdAt),
    notes: isActive ? "Customer prefers morning visit. Gate code: 4521." : undefined,
    paymentStatus:
      status === "completed" ? "paid" : status === "new" ? "not_applicable" : "pending",
    amcStatus: i % 4 === 0 ? "covered" : i % 4 === 1 ? "not_covered" : "expired",
    /* NEW fields */
    requestedCompletionDate,
    proposedCompletionDate: proposedDate,
    additionalDays: hasProposal ? addDays : undefined,
    timelineNotes: hasProposal ? "Need additional time for parts sourcing." : undefined,
    timelineStatus: hasProposal ? "customer_pending" : status === "new" ? "original" : "approved",
    customerRating: rating,
    customerRatingLabel: rating ? ratingLabels[rating] : undefined,
    completedAt,
    feedbackSubmitted: status === "completed" ? i % 2 === 0 : false,
  };
});

export const quotations: Quotation[] = jobs
  .filter((j) => ["accepted", "in_progress", "completed", "testing", "on_site"].includes(j.status))
  .map((j, i) => ({
    id: `QT-${pad(2001 + i)}`,
    jobId: j.id,
    hardwareCost: 1500 + (i % 5) * 400,
    laborCost: 800 + (i % 4) * 200,
    shippingCost: 300 + (i % 3) * 100,
    discountPercent: i % 4 === 0 ? 10 : i % 3 === 0 ? 5 : 0,
    gstPercent: 18,
    status: j.status === "completed" ? "accepted" : i % 2 === 0 ? "sent" : "draft",
    sentAt: isoOffset(-i - 1, 14, 0),
  }));

export const chatThreads: ChatThread[] = jobs.slice(0, 8).map((j, i) => ({
  id: `THR-${pad(i + 1)}`,
  jobId: j.id,
  customer: { ...j.customer, online: i % 3 === 0 },
  lastMessage: i % 2 === 0 ? "I've shared the drone location." : "Sure, will do.",
  lastAt: isoOffset(0, 9 + i, 15),
  unread: i < 3 ? i + 1 : 0,
}));

export const messagesByThread: Record<string, Message[]> = Object.fromEntries(
  chatThreads.map((t) => [
    t.id,
    [
      {
        id: "m1",
        threadId: t.id,
        from: "customer",
        text: `Hi, I've shared the drone location for ${t.id}.`,
        time: "10:20 AM",
      },
      { id: "m2", threadId: t.id, from: "me", text: "Great, I am on my way.", time: "10:22 AM" },
      {
        id: "m3",
        threadId: t.id,
        from: "customer",
        text: "Please call once you reach.",
        time: "10:25 AM",
      },
      { id: "m4", threadId: t.id, from: "me", text: "Sure, will do.", time: "10:31 AM" },
      { id: "m5", threadId: t.id, from: "customer", text: "Thanks!", time: "10:35 AM" },
    ],
  ]),
);

export const notifications: AppNotification[] = [
  {
    id: "n1",
    category: "request",
    title: "New job request REQ-1026",
    body: "Koramangala, Bengaluru",
    time: "10 min ago",
    read: false,
    href: "/app/requests/REQ-1026",
    relatedId: "REQ-1026",
  },
  {
    id: "n2",
    category: "request",
    title: "Quotation accepted",
    body: "Rohit Verma accepted quotation for REQ-1024",
    time: "45 min ago",
    read: false,
    href: "/app/jobs/REQ-1024",
    relatedId: "REQ-1024",
  },
  {
    id: "n3",
    category: "system",
    title: "New message from Rohit Verma",
    body: "I've shared the drone location.",
    time: "1 hr ago",
    read: false,
    href: "/app/chat",
  },
  {
    id: "n4",
    category: "payment",
    title: "Payment received for REQ-1010",
    body: "₹3,300 credited to your account",
    time: "Yesterday",
    read: true,
    href: "/app/jobs/REQ-1010",
    relatedId: "REQ-1010",
  },
  {
    id: "n5",
    category: "reminder",
    title: "Update your availability",
    body: "Please confirm your working hours for next week",
    time: "Yesterday",
    read: true,
    href: "/app/settings",
  },
  {
    id: "n6",
    category: "payment",
    title: "Payout processed",
    body: "Weekly payout of ₹18,420 has been sent",
    time: "2 days ago",
    read: true,
    href: "/app/profile",
  },
  {
    id: "n7",
    category: "grievance",
    title: "Grievance update GRV-1005",
    body: "Admin responded to your grievance",
    time: "3 days ago",
    read: true,
    href: "/app/grievances/new",
    relatedId: "GRV-1005",
  },
];

export const revenueTrend = [
  { month: "Jan", revenue: 38200, jobs: 12 },
  { month: "Feb", revenue: 42500, jobs: 14 },
  { month: "Mar", revenue: 51200, jobs: 18 },
  { month: "Apr", revenue: 46800, jobs: 16 },
  { month: "May", revenue: 58400, jobs: 21 },
  { month: "Jun", revenue: 64750, jobs: 23 },
];

export const weeklyJobs = [
  { day: "Mon", completed: 3, new: 5 },
  { day: "Tue", completed: 4, new: 6 },
  { day: "Wed", completed: 2, new: 4 },
  { day: "Thu", completed: 5, new: 7 },
  { day: "Fri", completed: 6, new: 8 },
  { day: "Sat", completed: 4, new: 5 },
  { day: "Sun", completed: 2, new: 3 },
];

export const provider = {
  name: "Rahul Sharma",
  email: "provider@dronezone.com",
  phone: "+91 98765 43210",
  rating: 4.8,
  totalJobs: 184,
  joinedAt: "Jan 2024",
  verified: true,
  verificationStatus: "approved" as VerificationStatus,
  business: {
    name: "SkyFix Drone Services",
    gst: "29AAACS1234A1Z5",
    address: "12, MG Road, Bengaluru, KA 560001",
  },
  bank: { name: "HDFC Bank", account: "•••• 4521", ifsc: "HDFC0001234" },
  serviceAreas: ["Bengaluru", "Mysuru", "Hosur"],
  certifications: ["DGCA Certified Pilot", "DJI Authorized Repair Technician", "ISO 9001 Trained"],
  equipmentClass: 1 as const,
  equipment: [
    { name: "DJI Mavic 3 Enterprise", image: "" },
    { name: "Thermal Imaging Camera", image: "" },
    { name: "Diagnostic Toolkit", image: "" }
  ],
};

export const availability = {
  online: true,
  workingHours: { start: "09:00", end: "19:00" },
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  maxJobsPerDay: 5,
  breakStart: "13:00",
  breakEnd: "14:00",
};

export const stages: { key: JobStatus; label: string }[] = [
  { key: "accepted", label: "Accepted" },
  { key: "en_route", label: "En Route" },
  { key: "on_site", label: "Reached Site" },
  { key: "in_progress", label: "Repair In Progress" },
  { key: "testing", label: "Testing" },
  { key: "completed", label: "Completed" },
];

export function statusLabel(s: JobStatus): string {
  return (
    {
      new: "New",
      accepted: "Accepted",
      en_route: "En Route",
      on_site: "On Site",
      in_progress: "In Progress",
      testing: "Testing",
      completed: "Completed",
      rejected: "Rejected",
      cancelled: "Cancelled",
    } as const
  )[s];
}

export function statusTone(s: JobStatus): "blue" | "green" | "amber" | "red" | "slate" {
  if (s === "completed") return "green";
  if (s === "rejected" || s === "cancelled") return "red";
  if (s === "new") return "blue";
  if (s === "in_progress" || s === "testing" || s === "on_site" || s === "en_route") return "amber";
  return "slate";
}

export function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export { ratingLabels };
