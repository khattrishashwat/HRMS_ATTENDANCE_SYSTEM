/**
 * Temporary workforce-overview mock data.
 * No dashboard API exists yet (`dashboardApi.ts` is an empty stub).
 * Replace this module with API-backed data when endpoints are available.
 */

export type OverviewMetric = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  icon: "users" | "joiner" | "attendance" | "productivity";
};

export type PersonStatusItem = {
  id: string;
  name: string;
  designation: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  badge: string;
  badgeClass: string;
  date?: string;
};

export type CelebrationItem = {
  id: string;
  name: string;
  designation: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  badge: string;
  badgeClass: string;
  date: string;
};

export type DepartmentBar = {
  name: string;
  count: number;
  percent: number;
};

export type AttendanceSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type ProbationItem = {
  id: string;
  name: string;
  department: string;
  daysLeft: number;
};

export type ProductivityTier = {
  id: string;
  title: string;
  range: string;
  count: number;
  percent: number;
  barClass: string;
  textClass: string;
};

export const overviewMetrics: OverviewMetric[] = [
  {
    id: "total",
    title: "Total Employees",
    value: "449",
    subtitle: "All departments",
    iconBg: "bg-[#F3E8FF]",
    iconColor: "text-[#4B1B91]",
    icon: "users",
  },
  {
    id: "joiners",
    title: "New Joiners",
    value: "12",
    subtitle: "This month",
    iconBg: "bg-[#DBEAFE]",
    iconColor: "text-[#2563EB]",
    icon: "joiner",
  },
  {
    id: "attendance",
    title: "Attendance",
    value: "382",
    subtitle: "85% present",
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#059669]",
    icon: "attendance",
  },
  {
    id: "productivity",
    title: "Org Productivity",
    value: "84%",
    subtitle: "Today",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    icon: "productivity",
  },
];

export const onLeaveYesterday: PersonStatusItem[] = [
  {
    id: "ol-1",
    name: "Sarah Chen",
    designation: "Product Designer",
    initials: "SC",
    avatarBg: "bg-[#EDE9FE]",
    avatarText: "text-[#4B1B91]",
    badge: "Sick Leave",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
  },
  {
    id: "ol-2",
    name: "Marcus Johnson",
    designation: "Software Engineer",
    initials: "MJ",
    avatarBg: "bg-[#DBEAFE]",
    avatarText: "text-[#1D4ED8]",
    badge: "Annual Leave",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
];

export const onLeaveUpcoming: PersonStatusItem[] = [
  {
    id: "ol-3",
    name: "Emily Rodriguez",
    designation: "Marketing Manager",
    initials: "ER",
    avatarBg: "bg-[#FCE7F3]",
    avatarText: "text-[#BE185D]",
    badge: "Medical Leave",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
    date: "21 July",
  },
  {
    id: "ol-4",
    name: "David Kim",
    designation: "Sales Executive",
    initials: "DK",
    avatarBg: "bg-[#D1FAE5]",
    avatarText: "text-[#047857]",
    badge: "Personal Leave",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "22 July",
  },
  {
    id: "ol-5",
    name: "Lisa Wang",
    designation: "HR Specialist",
    initials: "LW",
    avatarBg: "bg-[#FFEDD5]",
    avatarText: "text-[#C2410C]",
    badge: "Maternity Leave",
    badgeClass: "bg-[#FCE7F3] text-[#BE185D]",
    date: "25 July",
  },
];

export const wfhYesterday: PersonStatusItem[] = [
  {
    id: "wfh-1",
    name: "Alex Thompson",
    designation: "Frontend Developer",
    initials: "AT",
    avatarBg: "bg-[#EDE9FE]",
    avatarText: "text-[#4B1B91]",
    badge: "Today",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  {
    id: "wfh-2",
    name: "Jordan Lee",
    designation: "UX Researcher",
    initials: "JL",
    avatarBg: "bg-[#DBEAFE]",
    avatarText: "text-[#1D4ED8]",
    badge: "Today",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  {
    id: "wfh-3",
    name: "Sam Patel",
    designation: "DevOps Engineer",
    initials: "SP",
    avatarBg: "bg-[#D1FAE5]",
    avatarText: "text-[#047857]",
    badge: "Today",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
];

export const wfhUpcoming: PersonStatusItem[] = [
  {
    id: "wfh-4",
    name: "Casey Morgan",
    designation: "Content Writer",
    initials: "CM",
    avatarBg: "bg-[#FCE7F3]",
    avatarText: "text-[#BE185D]",
    badge: "Today",
    badgeClass: "bg-[#DBEAFE] text-[#1D4ED8]",
    date: "21 July",
  },
  {
    id: "wfh-5",
    name: "Riley Brooks",
    designation: "Data Analyst",
    initials: "RB",
    avatarBg: "bg-[#FFEDD5]",
    avatarText: "text-[#C2410C]",
    badge: "Scheduled",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "22 July",
  },
  {
    id: "wfh-6",
    name: "Taylor Quinn",
    designation: "Account Manager",
    initials: "TQ",
    avatarBg: "bg-[#EDE9FE]",
    avatarText: "text-[#4B1B91]",
    badge: "Scheduled",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "23 July",
  },
];

export const celebrationYesterday: CelebrationItem[] = [
  {
    id: "c-1",
    name: "Nina Volkov",
    designation: "Senior Designer",
    initials: "NV",
    avatarBg: "bg-[#EDE9FE]",
    avatarText: "text-[#4B1B91]",
    badge: "Birthday",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "today",
  },
  {
    id: "c-2",
    name: "James Wilson",
    designation: "Tech Lead",
    initials: "JW",
    avatarBg: "bg-[#DBEAFE]",
    avatarText: "text-[#1D4ED8]",
    badge: "5th Anniversary",
    badgeClass: "bg-[#FCE7F3] text-[#BE185D]",
    date: "today",
  },
];

export const celebrationUpcoming: CelebrationItem[] = [
  {
    id: "c-3",
    name: "Sophia Martinez",
    designation: "Product Manager",
    initials: "SM",
    avatarBg: "bg-[#FCE7F3]",
    avatarText: "text-[#BE185D]",
    badge: "Birthday",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "22 July",
  },
  {
    id: "c-4",
    name: "Michael Brown",
    designation: "Sales Director",
    initials: "MB",
    avatarBg: "bg-[#D1FAE5]",
    avatarText: "text-[#047857]",
    badge: "3rd Anniversary",
    badgeClass: "bg-[#FCE7F3] text-[#BE185D]",
    date: "23 July",
  },
  {
    id: "c-5",
    name: "Olivia Davis",
    designation: "QA Engineer",
    initials: "OD",
    avatarBg: "bg-[#FFEDD5]",
    avatarText: "text-[#C2410C]",
    badge: "Birthday",
    badgeClass: "bg-[#EDE9FE] text-[#5B21B6]",
    date: "24 July",
  },
];

export const departmentBars: DepartmentBar[] = [
  { name: "Tech", count: 145, percent: 32 },
  { name: "Sales", count: 98, percent: 22 },
  { name: "Design", count: 67, percent: 15 },
  { name: "Finance", count: 54, percent: 12 },
  { name: "HR", count: 43, percent: 10 },
  { name: "Legal", count: 42, percent: 9 },
];

export const TOTAL_EMPLOYEES = 449;

export const attendanceSlices: AttendanceSlice[] = [
  { key: "present", label: "Present", value: 382, color: "#4B1B91" },
  { key: "wfh", label: "WFH", value: 45, color: "#22C55E" },
  { key: "leave", label: "On Leave", value: 18, color: "#F59E0B" },
  { key: "absent", label: "Absent", value: 4, color: "#EF4444" },
];

export const probationItems: ProbationItem[] = [
  { id: "p1", name: "Alex Turner", department: "Engineering", daysLeft: 12 },
  { id: "p2", name: "Maya Patel", department: "Product Design", daysLeft: 18 },
  { id: "p3", name: "Chris Evans", department: "Sales", daysLeft: 25 },
  { id: "p4", name: "Priya Sharma", department: "Marketing", daysLeft: 30 },
  { id: "p5", name: "Jordan Blake", department: "Finance", daysLeft: 45 },
];

export const productivityTrackedTotal = 45;

export const productivityTiers: ProductivityTier[] = [
  {
    id: "high",
    title: "High Productivity",
    range: ">80%",
    count: 22,
    percent: 49,
    barClass: "bg-[#22C55E]",
    textClass: "text-[#15803D]",
  },
  {
    id: "medium",
    title: "Medium Productivity",
    range: "60-80%",
    count: 15,
    percent: 33,
    barClass: "bg-[#F59E0B]",
    textClass: "text-[#B45309]",
  },
  {
    id: "low",
    title: "Low Productivity",
    range: "<60%",
    count: 8,
    percent: 18,
    barClass: "bg-[#EF4444]",
    textClass: "text-[#B91C1C]",
  },
];
