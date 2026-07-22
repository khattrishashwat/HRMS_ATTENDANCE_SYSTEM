export const metrics = [
  {
    id: "employees",
    label: "Total Employees",
    value: "81",
    iconBg: "bg-[#F3E8FF]",
    iconColor: "text-[#7C3AED]",
    icon: "users" as const,
  },
  {
    id: "attendance",
    label: "Today's Attendance",
    value: "70",
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#059669]",
    icon: "check" as const,
  },
  {
    id: "productivity",
    label: "Org. Productivity",
    value: "84%",
    iconBg: "bg-[#FFEDD5]",
    iconColor: "text-[#EA580C]",
    icon: "trending" as const,
  },
  {
    id: "departments",
    label: "Departments",
    value: "7",
    iconBg: "bg-[#DBEAFE]",
    iconColor: "text-[#2563EB]",
    icon: "building" as const,
  },
  {
    id: "probation",
    label: "On Probation",
    value: "9",
    iconBg: "bg-[#FEE2E2]",
    iconColor: "text-[#DC2626]",
    icon: "clock" as const,
  },
];

export const workforceDistribution = [
  { label: "Full-Time", value: 47, color: "#4B1B91" },
  { label: "Part-Time", value: 12, color: "#A78BFA" },
  { label: "Contract", value: 9, color: "#22C55E" },
  { label: "Intern", value: 5, color: "#F59E0B" },
  { label: "Probation", value: 8, color: "#60A5FA" },
];

export const departmentDistribution = [
  { name: "Engineering", value: 28, color: "#4B1B91" },
  { name: "Sales", value: 22, color: "#7C3AED" },
  { name: "Operations", value: 16, color: "#A78BFA" },
  { name: "Human Resources", value: 10, color: "#F9A8D4" },
  { name: "Finance", value: 10, color: "#93C5FD" },
  { name: "Marketing", value: 8, color: "#C4B5FD" },
  { name: "Support", value: 6, color: "#DDD6FE" },
];

export const productivitySeries = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 72 },
  { day: "Sat", value: 45 },
  { day: "Sun", value: 68 },
];

export const pendingRequests = [
  { label: "Leave", value: 17, color: "#4B1B91" },
  { label: "Expense", value: 21, color: "#A78BFA" },
  { label: "Attendance Regularization", value: 9, color: "#F59E0B" },
  { label: "Tax Declaration", value: 5, color: "#EF4444" },
  { label: "Appraisal", value: 8, color: "#3B82F6" },
];

export const attendanceStatus = [
  { label: "Present", value: 80, color: "#22C55E" },
  { label: "WFH", value: 20, color: "#3B82F6" },
  { label: "Leave", value: 8, color: "#4B1B91" },
  { label: "Half Day", value: 3, color: "#F59E0B" },
  { label: "Absent", value: 4, color: "#EF4444" },
];

export const announcements = [
  {
    badge: "Notice",
    badgeClass: "bg-[#FFEDD5] text-[#C2410C]",
    title: "Office Renovation Schedule",
    description: "Floor 3 will be under renovation from 5–12 Jul. Please use alternate workspaces.",
    date: "1 Jul",
  },
  {
    badge: "Circular",
    badgeClass: "bg-[#D1FAE5] text-[#047857]",
    title: "Updated Leave Policy",
    description: "Annual leave accrual rules have been revised effective 1 August 2026.",
    date: "28 Jun",
  },
  {
    badge: "Holiday",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    title: "Independence Day Holiday",
    description: "Office will remain closed on 15 August 2026. Wish you a happy holiday!",
    date: "20 Jun",
  },
  {
    badge: "Announcement",
    badgeClass: "bg-[#FEF9C3] text-[#A16207]",
    title: "Town Hall Meeting",
    description: "All-hands town hall on 10 July at 4:00 PM in the main auditorium.",
    date: "15 Jun",
  },
];

export const workFromHome = [
  { name: "Priya Nair", dept: "Engineering", initials: "PN", bg: "bg-[#EDE9FE]", text: "text-[#4B1B91]" },
  { name: "Kabir Singh", dept: "Sales", initials: "KS", bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
  { name: "Ananya Rao", dept: "Finance", initials: "AR", bg: "bg-[#FCE7F3]", text: "text-[#BE185D]" },
  { name: "Rohan Mehta", dept: "Operations", initials: "RM", bg: "bg-[#D1FAE5]", text: "text-[#047857]" },
  { name: "Sneha Iyer", dept: "Human Resources", initials: "SI", bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
];

export const onLeave = [
  { name: "Vikram Patel", dept: "Engineering", initials: "VP", bg: "bg-[#EDE9FE]", text: "text-[#4B1B91]", type: "Sick Leave", typeClass: "bg-[#EDE9FE] text-[#5B21B6]" },
  { name: "Meera Joshi", dept: "Sales", initials: "MJ", bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", type: "Annual Leave", typeClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { name: "Arjun Desai", dept: "Operations", initials: "AD", bg: "bg-[#D1FAE5]", text: "text-[#047857]", type: "Casual Leave", typeClass: "bg-[#D1FAE5] text-[#047857]" },
  { name: "Neha Kapoor", dept: "Finance", initials: "NK", bg: "bg-[#FCE7F3]", text: "text-[#BE185D]", type: "Sick Leave", typeClass: "bg-[#EDE9FE] text-[#5B21B6]" },
  { name: "Rahul Verma", dept: "Marketing", initials: "RV", bg: "bg-[#FFEDD5]", text: "text-[#C2410C]", type: "Annual Leave", typeClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
];

export const celebrations = [
  { name: "Aisha Khan", dept: "Engineering", initials: "AK", bg: "bg-[#EDE9FE]", text: "text-[#4B1B91]", date: "Jul 1", tag: "Birthday", tagClass: "bg-[#EDE9FE] text-[#5B21B6]" },
  { name: "Dev Sharma", dept: "Sales", initials: "DS", bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", date: "Jul 3", tag: "5 years", tagClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { name: "Isha Gupta", dept: "Human Resources", initials: "IG", bg: "bg-[#FCE7F3]", text: "text-[#BE185D]", date: "Jul 8", tag: "Birthday", tagClass: "bg-[#EDE9FE] text-[#5B21B6]" },
  { name: "Kunal Shah", dept: "Finance", initials: "KS", bg: "bg-[#D1FAE5]", text: "text-[#047857]", date: "Jul 12", tag: "3 years", tagClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { name: "Pooja Reddy", dept: "Operations", initials: "PR", bg: "bg-[#FFEDD5]", text: "text-[#C2410C]", date: "Jul 18", tag: "Birthday", tagClass: "bg-[#EDE9FE] text-[#5B21B6]" },
];
