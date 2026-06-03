export const adminStats = {
  totalUsers: 2548,
  providers: 326,
  requests: 1284,
  revenue: 1245300,
  active: 312,
  completedToday: 48,
  avgCompletion: "2.4 hrs",
  openDisputes: 5,
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
  { id: "REQ-1024", user: "Rohit Verma", issue: "Drone not starting", status: "New", priority: "High" },
  { id: "REQ-1023", user: "Sneha Iyer", issue: "Propeller Replacement", status: "New", priority: "Medium" },
  { id: "REQ-1022", user: "Amit Kumar", issue: "Battery issue", status: "In Progress", priority: "High" },
  { id: "REQ-1021", user: "Vikram Shah", issue: "Camera calibration", status: "Completed", priority: "Low" },
  { id: "REQ-1020", user: "Neha Joshi", issue: "GPS signal weak", status: "New", priority: "Medium" },
  { id: "REQ-1019", user: "Karan Mehta", issue: "Firmware recovery", status: "In Progress", priority: "High" },
];

export const providerApplications = [
  { provider: "Ramesh Kumar", business: "SkyHigh Drones", submitted: "12 May 2026", status: "Pending" },
  { provider: "Arjun Patel", business: "AeroFly Services", submitted: "11 May 2026", status: "Pending" },
  { provider: "Vikrant Singh", business: "DroneTech India", submitted: "10 May 2026", status: "In Review" },
  { provider: "Prakash Nair", business: "DroneWorks", submitted: "09 May 2026", status: "Pending" },
];

export const providerDocs = [
  { name: "Business Registration", status: "Verified" },
  { name: "GST Certificate", status: "Verified" },
  { name: "PAN Card", status: "Verified" },
  { name: "Insurance Certificate", status: "Pending" },
  { name: "Address Proof", status: "Verified" },
];

export const disputes = [
  { id: "DISP-1005", raisedBy: "SkyHigh Drones", against: "Rohit Verma", issue: "Service quality", status: "Open" },
  { id: "DISP-1004", raisedBy: "Sneha Iyer", against: "AeroFly Services", issue: "Overcharging", status: "In Progress" },
  { id: "DISP-1003", raisedBy: "Amit Kumar", against: "DroneTech India", issue: "Delay in service", status: "Open" },
  { id: "DISP-1002", raisedBy: "Vikram Shah", against: "DroneWorks", issue: "Poor support", status: "Resolved" },
  { id: "DISP-1001", raisedBy: "Neha Joshi", against: "DroneWorks", issue: "Incomplete work", status: "Resolved" },
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
  { name: "May Promo Offer", type: "Promotion", audience: "All Users", sent: "10 May 2026", status: "Sent" },
  { name: "Battery Discount", type: "Promotion", audience: "Active Users", sent: "08 May 2026", status: "Sent" },
  { name: "AMC Renewal Offer", type: "Email", audience: "AMC Users", sent: "05 May 2026", status: "Sent" },
];

export const adminUsers = [
  { id: "USR-1001", name: "Rohit Verma", email: "rohit@email.com", joined: "Mar 2024", requests: 12 },
  { id: "USR-1002", name: "Sneha Iyer", email: "sneha@email.com", joined: "Apr 2024", requests: 8 },
  { id: "USR-1003", name: "Amit Kumar", email: "amit@email.com", joined: "May 2024", requests: 15 },
  { id: "USR-1004", name: "Vikram Shah", email: "vikram@email.com", joined: "Jun 2024", requests: 5 },
  { id: "USR-1005", name: "Neha Joshi", email: "neha@email.com", joined: "Jul 2024", requests: 9 },
];