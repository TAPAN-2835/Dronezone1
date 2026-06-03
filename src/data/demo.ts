export type JobStatus = "new" | "accepted" | "en_route" | "on_site" | "in_progress" | "testing" | "completed" | "rejected" | "cancelled";

export interface Job {
  id: string;
  customer: { name: string; phone: string; avatar?: string };
  drone: { model: string; serial: string };
  issue: string;
  description: string;
  location: string;
  city: string;
  createdAt: string;
  scheduledAt: string;
  status: JobStatus;
  amount?: number;
  images?: string[];
}

export interface Quotation {
  id: string;
  jobId: string;
  partsCost: number;
  laborCost: number;
  travelCost: number;
  discount: number;
  gstPercent: number;
  notes?: string;
  status: "draft" | "sent" | "accepted" | "rejected";
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
  category: "request" | "payment" | "reminder" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const cities = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Chennai", "Delhi", "Gurgaon", "Ahmedabad"];
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
  { title: "Propeller Replacement", desc: "Drone propeller is damaged after collision. Needs replacement and balance check." },
  { title: "Battery Issue", desc: "Battery drains rapidly and shows incorrect charge levels." },
  { title: "Camera Gimbal Calibration", desc: "Footage is shaky and gimbal does not stabilize properly." },
  { title: "Motor Failure", desc: "One of the motors stopped responding mid-flight." },
  { title: "Firmware Update", desc: "Drone stuck on boot. Needs firmware recovery." },
  { title: "GPS Signal Loss", desc: "Drone loses GPS lock frequently during flight." },
  { title: "Annual Service", desc: "Routine annual maintenance and diagnostic check." },
];
const customers = [
  { name: "Rohit Verma", phone: "+91 98765 43210" },
  { name: "Aditi Sharma", phone: "+91 99830 11245" },
  { name: "Karan Mehta", phone: "+91 98201 55678" },
  { name: "Priya Nair", phone: "+91 90080 33421" },
  { name: "Vikram Singh", phone: "+91 97400 66781" },
  { name: "Neha Gupta", phone: "+91 99102 87654" },
  { name: "Arjun Reddy", phone: "+91 98852 11223" },
  { name: "Sneha Iyer", phone: "+91 90420 78890" },
];

function pad(n: number) { return String(n).padStart(4, "0"); }

const today = new Date("2026-06-02T10:00:00");
function isoOffset(daysFromToday: number, h = 10, m = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const statuses: JobStatus[] = ["new", "new", "new", "accepted", "in_progress", "en_route", "on_site", "testing", "completed", "completed", "completed", "rejected"];

export const jobs: Job[] = Array.from({ length: 24 }).map((_, i) => {
  const city = cities[i % cities.length];
  const area = areas[city][i % areas[city].length];
  const cust = customers[i % customers.length];
  const issue = issues[i % issues.length];
  const status = statuses[i % statuses.length];
  const dayOffset = status === "completed" ? -(i + 1) : status === "new" ? 0 : -Math.floor(i / 3);
  return {
    id: `REQ-${pad(1024 + i)}`,
    customer: cust,
    drone: { model: drones[i % drones.length], serial: `SN-${1000 + i * 37}` },
    issue: issue.title,
    description: issue.desc,
    location: `${area}, ${city}`,
    city,
    createdAt: isoOffset(dayOffset, 9 + (i % 8), (i * 7) % 60),
    scheduledAt: isoOffset(dayOffset + (status === "new" ? 1 : 0), 10 + (i % 6), 0),
    status,
    amount: status === "completed" ? 2500 + (i % 6) * 750 : undefined,
  };
});

export const quotations: Quotation[] = jobs
  .filter((j) => ["accepted", "in_progress", "completed", "testing", "on_site"].includes(j.status))
  .map((j, i) => ({
    id: `QT-${pad(2001 + i)}`,
    jobId: j.id,
    partsCost: 1500 + (i % 5) * 400,
    laborCost: 800 + (i % 4) * 200,
    travelCost: 300 + (i % 3) * 100,
    discount: i % 4 === 0 ? 200 : 0,
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
  unread: i < 3 ? (i + 1) : 0,
}));

export const messagesByThread: Record<string, Message[]> = Object.fromEntries(
  chatThreads.map((t) => [
    t.id,
    [
      { id: "m1", threadId: t.id, from: "customer", text: `Hi, I've shared the drone location for ${t.id}.`, time: "10:20 AM" },
      { id: "m2", threadId: t.id, from: "me", text: "Great, I am on my way.", time: "10:22 AM" },
      { id: "m3", threadId: t.id, from: "customer", text: "Please call once you reach.", time: "10:25 AM" },
      { id: "m4", threadId: t.id, from: "me", text: "Sure, will do.", time: "10:31 AM" },
      { id: "m5", threadId: t.id, from: "customer", text: "Thanks!", time: "10:35 AM" },
    ],
  ]),
);

export const notifications: AppNotification[] = [
  { id: "n1", category: "request", title: "New job request REQ-1026", body: "Koramangala, Bengaluru", time: "10 min ago", read: false },
  { id: "n2", category: "request", title: "Quotation accepted", body: "Rohit Verma accepted quotation for REQ-1024", time: "45 min ago", read: false },
  { id: "n3", category: "system", title: "New message from Rohit Verma", body: "I've shared the drone location.", time: "1 hr ago", read: false },
  { id: "n4", category: "payment", title: "Payment received for JOB-1010", body: "₹3,300 credited to your account", time: "Yesterday", read: true },
  { id: "n5", category: "reminder", title: "Update your availability", body: "Please confirm your working hours for next week", time: "Yesterday", read: true },
  { id: "n6", category: "payment", title: "Payout processed", body: "Weekly payout of ₹18,420 has been sent", time: "2 days ago", read: true },
  { id: "n7", category: "system", title: "App updated to v2.4", body: "New scheduling features available", time: "3 days ago", read: true },
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
  business: {
    name: "SkyFix Drone Services",
    gst: "29AAACS1234A1Z5",
    address: "12, MG Road, Bengaluru, KA 560001",
  },
  bank: { name: "HDFC Bank", account: "•••• 4521", ifsc: "HDFC0001234" },
  serviceAreas: ["Bengaluru", "Mysuru", "Hosur"],
  certifications: ["DGCA Certified Pilot", "DJI Authorized Repair Technician", "ISO 9001 Trained"],
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
  return ({
    new: "New",
    accepted: "Accepted",
    en_route: "En Route",
    on_site: "On Site",
    in_progress: "In Progress",
    testing: "Testing",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
  } as const)[s];
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
