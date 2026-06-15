import { inr } from "./demo";
export { inr };

export interface CustomerRequest {
  id: string;
  drone: string;
  issue: string;
  description: string;
  status: "draft" | "submitted" | "review" | "quotation_pending" | "awaiting_approval" | "active_job" | "resolved" | "feedback_submitted" | "closed" | string;
  createdAt: string;
  scheduledAt: string;
  location: string;
  urgent: boolean;
  provider?: { name: string; phone: string; rating: number };
  amount?: number;
  attachments?: { id: string; name: string; type: "image" | "document" }[];
  originalDescription?: string;
}

export const trackingStages = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Review" },
  { key: "quotation_pending", label: "Quotation Pending" },
  { key: "awaiting_approval", label: "Awaiting Customer Approval" },
  { key: "active_job", label: "Active Job" },
  { key: "resolved", label: "Resolved" },
  { key: "feedback_submitted", label: "Feedback Submitted" },
  { key: "closed", label: "Closed" },
] as const;

export const customer = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+91 99888 11223",
  joined: "Mar 2024",
  business: {
    name: "AeroVision Media",
    gst: "29AABCA1234A1Z5",
    type: "Media Production",
  },
  certifications: ["DGCA Remote Pilot License", "Commercial Drone Operator"],
  serviceAreas: ["Bengaluru", "Mysuru"],
  documents: [
    { name: "Aadhaar Card", status: "Verified" as const },
    { name: "Business Registration", status: "Verified" as const },
    { name: "Drone Insurance", status: "Pending" as const },
  ],
  bank: { name: "ICICI Bank", account: "•••• 7890", ifsc: "ICIC0001234" },
  amcPreferences: { autoRenewal: true, preferredPlan: "Premium AMC", notifyBeforeExpiry: true },
  notificationPrefs: {
    push: true,
    email: true,
    sms: false,
    jobUpdates: true,
    payments: true,
    amcReminders: true,
    promotions: false,
  },
  drones: [
    { model: "DJI Mavic 3 Pro", serial: "DJM3-7821", purchaseDate: "Jan 2024", warranty: "Active" },
    { model: "DJI Mini 4 Pro", serial: "DJM4-2231", purchaseDate: "Aug 2024", warranty: "Active" },
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
    description: "One of the propellers is vibrating abnormally during flight.",
    originalDescription: "One of the propellers is vibrating abnormally. Noticed after a minor collision with a tree branch. Drone still flies but vibration is concerning.",
    status: "review",
    createdAt: "20 May 2026, 09:30 AM",
    scheduledAt: "20 May 2026, 11:00 AM",
    location: "Koramangala, Bengaluru",
    urgent: true,
    provider: { name: "Rahul Kumar", phone: "+91 98765 43210", rating: 4.8 },
    attachments: [
      { id: "ca1", name: "Propeller Damage Photo", type: "image" },
      { id: "ca2", name: "Flight Log Screenshot", type: "image" },
      { id: "ca3", name: "Purchase Receipt", type: "document" },
    ],
  },
  {
    id: "REQ-1023",
    drone: "DJI Mini 4 Pro",
    issue: "Battery Not Charging",
    description: "Battery shows red indicator and won't charge past 20%.",
    originalDescription: "Battery shows red indicator and won't charge past 20%. Tried different charger and cable.",
    status: "resolved",
    createdAt: "10 Apr 2026, 02:00 PM",
    scheduledAt: "11 Apr 2026, 10:00 AM",
    location: "Whitefield, Bengaluru",
    urgent: false,
    provider: { name: "Arjun Patel", phone: "+91 98201 55678", rating: 4.7 },
    amount: 2950,
    attachments: [
      { id: "ca4", name: "Battery Photo", type: "image" },
    ],
  },
  {
    id: "REQ-0987",
    drone: "DJI Mavic 3 Pro",
    issue: "Camera Calibration",
    description: "Gimbal drift on yaw axis affecting video quality.",
    originalDescription: "Gimbal drift on yaw axis. Footage is unusable for client deliverables.",
    status: "resolved",
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
    originalDescription: "Annual maintenance and firmware update requested as part of AMC plan.",
    status: "resolved",
    createdAt: "12 Feb 2026",
    scheduledAt: "13 Feb 2026",
    location: "Koramangala, Bengaluru",
    urgent: false,
    amount: 1200,
  },
];

export interface CustomerNotification {
  id: string;
  category: "request" | "payment" | "review" | "amc" | "grievance";
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
  relatedId?: string;
}

export const customerNotifications: CustomerNotification[] = [
  { id: "n1", category: "request", title: "Your request REQ-1024 has been assigned", body: "Rahul Kumar will be in touch shortly.", time: "10 min ago", read: false, href: "/customer/requests/REQ-1024", relatedId: "REQ-1024" },
  { id: "n2", category: "request", title: "Engineer is on the way", body: "Estimated arrival: 15 minutes.", time: "1 hr ago", read: false, href: "/customer/requests/REQ-1024", relatedId: "REQ-1024" },
  { id: "n3", category: "payment", title: "Payment of ₹2,950 was successful", body: "Invoice #INV-2045 has been generated.", time: "Yesterday", read: true, href: "/customer/invoices", relatedId: "INV-2045" },
  { id: "n4", category: "review", title: "Please rate your recent service", body: "Help us improve by sharing your experience.", time: "Yesterday", read: true, href: "/customer/rate", relatedId: "REQ-1023" },
  { id: "n5", category: "amc", title: "AMC renewal coming up", body: "Your Premium AMC expires on 25 Dec 2026.", time: "3 days ago", read: true, href: "/customer/amc" },
  { id: "n6", category: "grievance", title: "Grievance GRV-1004 updated", body: "Admin is reviewing your billing grievance.", time: "2 days ago", read: true, href: "/customer/grievances/new", relatedId: "GRV-1004" },
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

export interface AmcPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  visits: number;
  benefits: string[];
  popular?: boolean;
}

export const amcPlans: AmcPlan[] = [
  {
    id: "basic",
    name: "Basic AMC",
    price: 4999,
    duration: "12 months",
    visits: 2,
    benefits: ["2 Free Services", "10% Repair Discount", "Email Support", "Annual Inspection"],
  },
  {
    id: "standard",
    name: "Standard AMC",
    price: 8999,
    duration: "12 months",
    visits: 4,
    benefits: ["4 Free Services", "20% Repair Discount", "Priority Support", "Free Pickup & Drop", "Annual Inspection"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium AMC",
    price: 14999,
    duration: "12 months",
    visits: 6,
    benefits: ["6 Free Services", "Unlimited Repairs", "Priority Support", "Free Pickup & Drop", "Spare Parts Discount", "Dedicated Engineer"],
  },
];

export const amc = {
  plan: "Premium AMC",
  planId: "premium",
  validTill: "25 Dec 2026",
  active: true,
  visitsUsed: 2,
  visitsTotal: 6,
  autoRenewal: true,
  benefits: ["Unlimited Repairs", "6 Free Services", "Priority Support", "Free Inspection", "Spare Parts Discount", "Dedicated Engineer"],
};

export const ratingCriteria = ["Service Quality", "Timeliness", "Professionalism", "Value for Money"];

export const chatMessages = [
  { from: "provider" as const, text: "Hi John, I am on the way", time: "10:30 AM" },
  { from: "me" as const, text: "Great, thanks!", time: "10:31 AM" },
  { from: "provider" as const, text: "I will reach in 15 mins.", time: "10:45 AM" },
  { from: "provider" as const, text: "Found the issue.", time: "11:05 AM" },
  { from: "me" as const, text: "Okay, please proceed.", time: "11:06 AM" },
];

export const profileSections = [
  { id: "personal", label: "Personal Details", icon: "User" },
  { id: "business", label: "Business Details", icon: "Building2" },
  { id: "certifications", label: "Certifications", icon: "Award" },
  { id: "areas", label: "Service Areas", icon: "MapPin" },
  { id: "documents", label: "Documents", icon: "FileText" },
  { id: "bank", label: "Bank Details", icon: "CreditCard" },
  { id: "amc-prefs", label: "AMC Preferences", icon: "Shield" },
  { id: "notifications", label: "Notification Preferences", icon: "Bell" },
] as const;

export type ProfileSectionId = (typeof profileSections)[number]["id"];
