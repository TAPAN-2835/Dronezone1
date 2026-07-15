export const adminStats = {
  totalUsers: 2548,
  providers: 326,
  requests: 1284,
  revenue: 1245300,
  active: 312,
  completedToday: 48,
  avgCompletion: "2.4 hrs",
  openGrievances: 5,
};

export const adminRevenueTrend = [
  { month: "Jan", revenue: 720000, requests: 142 },
  { month: "Feb", revenue: 845000, requests: 168 },
  { month: "Mar", revenue: 980000, requests: 192 },
  { month: "Apr", revenue: 1024000, requests: 210 },
  { month: "May", revenue: 1245300, requests: 248 },
  { month: "Jun", revenue: 1380000, requests: 264 },
];

export const requestsByStatus = [
  { name: "New", value: 25, color: "oklch(0.65_0.18_220)" },
  { name: "In Progress", value: 30, color: "oklch(0.78_0.16_75)" },
  { name: "Completed", value: 45, color: "oklch(0.72_0.18_152)" },
];

export const topCategories = [
  { name: "Maintenance", value: 40 },
  { name: "Repair", value: 30 },
  { name: "Battery Services", value: 20 },
  { name: "Calibration", value: 10 },
];

export const adminRequests = [
  {
    id: "REQ-1024",
    user: "Rohit Verma",
    userId: "USR-1001",
    issue: "Drone not starting",
    status: "New",
    priority: "High",
    createdAt: "2026-06-02T09:30:00",
    location: "Koramangala, Bengaluru",
    drone: "DJI Mavic 3 Pro",
  },
  {
    id: "REQ-1023",
    user: "Sneha Iyer",
    userId: "USR-1002",
    issue: "Propeller Replacement",
    status: "New",
    priority: "Medium",
    createdAt: "2026-06-01T14:00:00",
    location: "Whitefield, Bengaluru",
    drone: "DJI Mini 4 Pro",
  },
  {
    id: "REQ-1022",
    user: "Amit Kumar",
    userId: "USR-1003",
    issue: "Battery issue",
    status: "In Progress",
    priority: "High",
    createdAt: "2026-05-28T11:00:00",
    location: "Gachibowli, Hyderabad",
    drone: "DJI Air 3",
  },
  {
    id: "REQ-1021",
    user: "Vikram Shah",
    userId: "USR-1004",
    issue: "Camera calibration",
    status: "Completed",
    priority: "Low",
    createdAt: "2026-05-20T10:00:00",
    location: "Bandra, Mumbai",
    drone: "DJI Inspire 3",
  },
  {
    id: "REQ-1020",
    user: "Neha Joshi",
    userId: "USR-1005",
    issue: "GPS signal weak",
    status: "New",
    priority: "Medium",
    createdAt: "2026-06-02T08:00:00",
    location: "Pune, Baner",
    drone: "Autel EVO II",
  },
  {
    id: "REQ-1019",
    user: "Karan Mehta",
    userId: "USR-1001",
    issue: "Firmware recovery",
    status: "In Progress",
    priority: "High",
    createdAt: "2026-05-25T16:00:00",
    location: "Indiranagar, Bengaluru",
    drone: "DJI Mavic 3",
  },
];

export const adminJobs = [
  {
    id: "REQ-1024",
    customer: "Rohit Verma",
    provider: "Rahul Sharma",
    issue: "Propeller Replacement",
    status: "In Progress",
    category: "Repair",
    createdAt: "2026-05-20T09:30:00",
    amount: 2950,
    paymentStatus: "Pending",
    amcStatus: "Covered",
  },
  {
    id: "REQ-1022",
    customer: "Amit Kumar",
    provider: "Arjun Patel",
    issue: "Battery Issue",
    status: "In Progress",
    category: "Battery Services",
    createdAt: "2026-05-28T11:00:00",
    amount: 4800,
    paymentStatus: "Pending",
    amcStatus: "Not Covered",
  },
  {
    id: "REQ-1021",
    customer: "Vikram Shah",
    provider: "Vikram Singh",
    issue: "Camera Calibration",
    status: "Completed",
    category: "Calibration",
    createdAt: "2026-05-15T10:00:00",
    amount: 1850,
    paymentStatus: "Paid",
    amcStatus: "Covered",
  },
  {
    id: "REQ-1019",
    customer: "Karan Mehta",
    provider: "Rahul Sharma",
    issue: "Firmware Update",
    status: "In Progress",
    category: "Maintenance",
    createdAt: "2026-05-25T16:00:00",
    amount: 1200,
    paymentStatus: "Pending",
    amcStatus: "Expired",
  },
  {
    id: "REQ-1018",
    customer: "Priya Nair",
    provider: "Neha Gupta",
    issue: "Motor Failure",
    status: "Completed",
    category: "Repair",
    createdAt: "2026-05-10T08:00:00",
    amount: 6200,
    paymentStatus: "Paid",
    amcStatus: "Not Covered",
  },
  {
    id: "REQ-1017",
    customer: "Aditi Sharma",
    provider: "Arjun Patel",
    issue: "GPS Signal Loss",
    status: "New",
    category: "Repair",
    createdAt: "2026-06-01T12:00:00",
    amount: undefined,
    paymentStatus: "Not Applicable",
    amcStatus: "Covered",
  },
  {
    id: "REQ-1016",
    customer: "Sneha Iyer",
    provider: "Rahul Sharma",
    issue: "Annual Service",
    status: "Completed",
    category: "Maintenance",
    createdAt: "2026-04-28T09:00:00",
    amount: 3500,
    paymentStatus: "Paid",
    amcStatus: "Covered",
  },
  {
    id: "REQ-1015",
    customer: "Arjun Reddy",
    provider: "Vikram Singh",
    issue: "Propeller Replacement",
    status: "Rejected",
    category: "Repair",
    createdAt: "2026-05-05T14:00:00",
    amount: undefined,
    paymentStatus: "Not Applicable",
    amcStatus: "Expired",
  },
];

export const providerApplications = [
  {
    id: "PRV-2001",
    provider: "Ramesh Kumar",
    business: "SkyHigh Drones",
    submitted: "12 May 2026",
    status: "Pending",
    email: "ramesh@skyhigh.com",
    phone: "+91 98765 11111",
    city: "Bengaluru",
    equipmentClass: 1,
    equipment: [
      { name: "DJI Inspire 3", image: "" },
      { name: "Advanced Toolkit", image: "" },
    ],
  },
  {
    id: "PRV-2002",
    provider: "Arjun Patel",
    business: "AeroFly Services",
    submitted: "11 May 2026",
    status: "Pending",
    email: "arjun@aerofly.com",
    phone: "+91 98201 22222",
    city: "Mumbai",
  },
  {
    id: "PRV-2003",
    provider: "Vikrant Singh",
    business: "DroneTech India",
    submitted: "10 May 2026",
    status: "In Review",
    email: "vikrant@dronetech.com",
    phone: "+91 97400 33333",
    city: "Hyderabad",
  },
  {
    id: "PRV-2004",
    provider: "Prakash Nair",
    business: "DroneWorks",
    submitted: "09 May 2026",
    status: "Pending",
    email: "prakash@droneworks.com",
    phone: "+91 99102 44444",
    city: "Chennai",
  },
];

export const providerDocs = [
  { name: "Business Registration", status: "Verified" },
  { name: "GST Certificate", status: "Verified" },
  { name: "PAN Card", status: "Verified" },
  { name: "Insurance Certificate", status: "Pending" },
  { name: "Address Proof", status: "Verified" },
];

export type GrievanceStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type GrievancePriority = "Low" | "Medium" | "High" | "Critical";

export interface Grievance {
  id: string;
  raisedBy: string;
  raisedByType: "customer" | "provider";
  raisedById?: string;
  against: string;
  againstType: "customer" | "provider";
  jobId?: string;
  category: string;
  priority: GrievancePriority;
  description: string;
  issue: string;
  status: GrievanceStatus;
  createdAt: string;
  resolvedAt?: string;
}

export const grievances: Grievance[] = [
  {
    id: "GRV-1005",
    raisedBy: "SkyHigh Drones",
    raisedByType: "provider",
    raisedById: "PRV-2001",
    against: "Rohit Verma",
    againstType: "customer",
    jobId: "REQ-1024",
    category: "Service Quality",
    priority: "High",
    description: "Customer refused to pay after service completion despite signed quotation.",
    issue: "Payment dispute after service",
    status: "Open",
    createdAt: "2026-05-28T10:00:00",
  },
  {
    id: "GRV-1004",
    raisedBy: "Sneha Iyer",
    raisedByType: "customer",
    raisedById: "USR-1002",
    against: "AeroFly Services",
    againstType: "provider",
    jobId: "REQ-1023",
    category: "Billing",
    priority: "Medium",
    description: "Charged ₹800 extra for travel without prior approval.",
    issue: "Overcharging",
    status: "In Progress",
    createdAt: "2026-05-25T14:00:00",
  },
  {
    id: "GRV-1003",
    raisedBy: "Amit Kumar",
    raisedByType: "customer",
    raisedById: "USR-1003",
    against: "DroneTech India",
    againstType: "provider",
    jobId: "REQ-1022",
    category: "Delay",
    priority: "High",
    description: "Engineer arrived 3 hours late without notification.",
    issue: "Delay in service",
    status: "Open",
    createdAt: "2026-05-22T09:00:00",
  },
  {
    id: "GRV-1002",
    raisedBy: "Vikram Shah",
    raisedByType: "customer",
    raisedById: "USR-1004",
    against: "DroneWorks",
    againstType: "provider",
    jobId: "REQ-1021",
    category: "Support",
    priority: "Low",
    description: "No follow-up after repair. Issue recurred within a week.",
    issue: "Poor support",
    status: "Resolved",
    createdAt: "2026-05-15T11:00:00",
    resolvedAt: "2026-05-18T16:00:00",
  },
  {
    id: "GRV-1001",
    raisedBy: "Neha Joshi",
    raisedByType: "customer",
    raisedById: "USR-1005",
    against: "DroneWorks",
    againstType: "provider",
    jobId: "REQ-1018",
    category: "Quality",
    priority: "Medium",
    description: "Gimbal issue not fully resolved. Drone still unstable.",
    issue: "Incomplete work",
    status: "Resolved",
    createdAt: "2026-05-10T08:00:00",
    resolvedAt: "2026-05-14T12:00:00",
  },
];

/** @deprecated Use grievances instead */
export const disputes = grievances;

export const grievanceCategories = [
  "Service Quality",
  "Billing",
  "Delay",
  "Support",
  "Quality",
  "Safety",
  "Other",
];

export const categories = [
  { name: "Maintenance", desc: "General maintenance services", active: true },
  { name: "Repair", desc: "Repair and troubleshooting", active: true },
  { name: "Battery Services", desc: "Battery replacement & check", active: true },
  { name: "Payload Services", desc: "Payload installation & setup", active: true },
  { name: "Calibration", desc: "Drone calibration services", active: true },
];

export const droneModels = [
  { brand: "DJI", model: "Mavic 3", active: true },
  { brand: "DJI", model: "Phantom 4 RTK", active: true },
  { brand: "DJI", model: "Mini 4 Pro", active: true },
  { brand: "DJI", model: "Air 3", active: true },
  { brand: "DJI", model: "Inspire 3", active: true },
  { brand: "Autel", model: "EVO II Pro", active: true },
  { brand: "Parrot", model: "Anafi USA", active: false },
];

export const campaigns = [
  {
    name: "May Promo Offer",
    type: "Promotion",
    audience: "All Users",
    sent: "10 May 2026",
    status: "Sent",
    subject: "Get 20% off on all repairs this May!",
    body: "Hi there, we're offering a special 20% discount on all drone repairs booked this month. Don't miss out on getting your drone ready for summer flights.",
    sentCount: 5000,
    openRate: "45%",
  },
  {
    name: "Battery Discount",
    type: "Promotion",
    audience: "Active Users",
    sent: "08 May 2026",
    status: "Sent",
    subject: "10% off new batteries",
    body: "Time to upgrade your power source! Enjoy 10% off on all battery replacements.",
    sentCount: 3200,
    openRate: "42%",
  },
  {
    name: "AMC Renewal Offer",
    type: "Email",
    audience: "AMC Users",
    sent: "05 May 2026",
    status: "Sent",
    subject: "Renew your AMC and get 1 month free",
    body: "Your Annual Maintenance Contract is due for renewal soon. Renew now and get an extra month completely free.",
    sentCount: 1500,
    openRate: "55%",
  },
];

export const adminUsers = [
  {
    id: "USR-1001",
    name: "Rohit Verma",
    email: "rohit@email.com",
    phone: "+91 98765 43210",
    joined: "Mar 2024",
    requests: 12,
    city: "Bengaluru",
    amcPlan: "Premium AMC",
  },
  {
    id: "USR-1002",
    name: "Sneha Iyer",
    email: "sneha@email.com",
    phone: "+91 90420 78890",
    joined: "Apr 2024",
    requests: 8,
    city: "Bengaluru",
    amcPlan: "Basic AMC",
  },
  {
    id: "USR-1003",
    name: "Amit Kumar",
    email: "amit@email.com",
    phone: "+91 98201 55678",
    joined: "May 2024",
    requests: 15,
    city: "Hyderabad",
    amcPlan: "None",
  },
  {
    id: "USR-1004",
    name: "Vikram Shah",
    email: "vikram@email.com",
    phone: "+91 97400 66781",
    joined: "Jun 2024",
    requests: 5,
    city: "Mumbai",
    amcPlan: "Premium AMC",
  },
  {
    id: "USR-1005",
    name: "Neha Joshi",
    email: "neha@email.com",
    phone: "+91 99102 87654",
    joined: "Jul 2024",
    requests: 9,
    city: "Pune",
    amcPlan: "Standard AMC",
  },
];
