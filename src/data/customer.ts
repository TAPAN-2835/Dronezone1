import { inr } from "./demo";
export { inr };

export interface CustomerRequest {
  id: string;
  drone: string;
  issue: string;
  description: string;
  status: "submitted" | "assigned" | "en_route" | "inspecting" | "repairing" | "testing" | "completed";
  createdAt: string;
  scheduledAt: string;
  location: string;
  urgent: boolean;
  provider?: { name: string; phone: string; rating: number };
  amount?: number;
}

export const trackingStages = [
  { key: "submitted", label: "Request Submitted" },
  { key: "assigned", label: "Provider Assigned" },
  { key: "en_route", label: "Engineer En Route" },
  { key: "inspecting", label: "Inspection Started" },
  { key: "repairing", label: "Repair In Progress" },
  { key: "testing", label: "Testing" },
  { key: "completed", label: "Completed" },
] as const;

export const customer = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+91 99888 11223",
  joined: "Mar 2024",
  drones: [
    { model: "DJI Mavic 3 Pro", serial: "DJM3-7821" },
    { model: "DJI Mini 4 Pro", serial: "DJM4-2231" },
  ],
  addresses: [
    { label: "Home", address: "Koramangala, Bengaluru 560034" },
    { label: "Office", address: "Whitefield, Bengaluru 560066" },
  ],
};

export const customerRequests: CustomerRequest[] = [
  {
    id: "REQ-1024",
    drone: "DJI Mavic 3 Pro",
    issue: "Propeller Issue",
    description: "One of the propellers is vibrating abnormally.",
    status: "repairing",
    createdAt: "20 May 2026, 09:30 AM",
    scheduledAt: "20 May 2026, 11:00 AM",
    location: "Koramangala, Bengaluru",
    urgent: true,
    provider: { name: "Rahul Kumar", phone: "+91 98765 43210", rating: 4.8 },
  },
  {
    id: "REQ-1023",
    drone: "DJI Mini 4 Pro",
    issue: "Battery Not Charging",
    description: "Battery shows red and won't charge.",
    status: "completed",
    createdAt: "10 Apr 2026, 02:00 PM",
    scheduledAt: "11 Apr 2026, 10:00 AM",
    location: "Whitefield, Bengaluru",
    urgent: false,
    provider: { name: "Arjun Patel", phone: "+91 98201 55678", rating: 4.7 },
    amount: 2950,
  },
  {
    id: "REQ-0987",
    drone: "DJI Mavic 3 Pro",
    issue: "Camera Calibration",
    description: "Gimbal drift on yaw axis.",
    status: "completed",
    createdAt: "5 Mar 2026",
    scheduledAt: "6 Mar 2026",
    location: "Indiranagar, Bengaluru",
    urgent: false,
    amount: 1850,
  },
  {
    id: "REQ-0856",
    drone: "DJI Mini 4 Pro",
    issue: "General Checkup",
    description: "Annual maintenance and firmware update.",
    status: "completed",
    createdAt: "12 Feb 2026",
    scheduledAt: "13 Feb 2026",
    location: "Koramangala, Bengaluru",
    urgent: false,
    amount: 1200,
  },
];

export const customerNotifications = [
  { id: "n1", category: "request" as const, title: "Your request REQ-1024 has been assigned", body: "Rahul Kumar will be in touch shortly.", time: "10 min ago", read: false },
  { id: "n2", category: "request" as const, title: "Engineer is on the way", body: "Estimated arrival: 15 minutes.", time: "1 hr ago", read: false },
  { id: "n3", category: "payment" as const, title: "Payment of ₹2,950 was successful", body: "Invoice #INV-2045 has been generated.", time: "Yesterday", read: true },
  { id: "n4", category: "review" as const, title: "Please rate your recent service", body: "Help us improve by sharing your experience.", time: "Yesterday", read: true },
  { id: "n5", category: "amc" as const, title: "AMC renewal coming up", body: "Your Premium AMC expires on 25 Dec 2026.", time: "3 days ago", read: true },
];

export const invoice = {
  id: "INV-2045",
  date: "20 May 2026",
  status: "Paid" as const,
  subtotal: 2500,
  gst: 450,
  total: 2950,
  method: "UPI",
  items: [
    { label: "Propeller replacement (2 pcs)", amount: 1400 },
    { label: "Labour & diagnostics", amount: 800 },
    { label: "Service visit", amount: 300 },
  ],
};

export const amc = {
  plan: "Premium AMC",
  validTill: "25 Dec 2026",
  active: true,
  visitsUsed: 2,
  visitsTotal: 4,
  benefits: ["Unlimited Repairs", "2 Free Services", "Priority Support", "Free Inspection"],
};

export const ratingCriteria = ["Service Quality", "Timeliness", "Professionalism", "Value for Money"];

export const chatMessages = [
  { from: "provider" as const, text: "Hi John, I am on the way", time: "10:30 AM" },
  { from: "me" as const, text: "Great, thanks!", time: "10:31 AM" },
  { from: "provider" as const, text: "I will reach in 15 mins.", time: "10:45 AM" },
  { from: "provider" as const, text: "Found the issue.", time: "11:05 AM" },
  { from: "me" as const, text: "Okay, please proceed.", time: "11:06 AM" },
];