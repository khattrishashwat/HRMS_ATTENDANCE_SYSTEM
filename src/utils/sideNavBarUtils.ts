/** Active fill matching reference lavender */
export const ACTIVE_BG = "bg-[#E9C7FF]";
export const ACTIVE_TEXT = "text-[#5B21B6]";
export const IDLE_TEXT = "text-[#1F2937]";
export const HOVER_BG = "hover:bg-[#F5F3FF]";

export const getItemClass = (
  path?: string,
  isActive?: (path: string) => boolean,
  collapsed?: boolean,
  forceActive?: boolean
) => {
  const active = forceActive || !!(path && isActive?.(path));
  return `group flex h-10 w-full items-center rounded-lg transition-all duration-200 ${
    collapsed ? "justify-center px-2" : "justify-between gap-3 px-3"
  } ${active ? `${ACTIVE_BG} ${ACTIVE_TEXT}` : `${IDLE_TEXT} ${HOVER_BG}`}`;
};

export const getSubItemClass = (path: string, isActive?: (path: string) => boolean) =>
  `flex h-[38px] w-full items-center rounded-lg px-3 text-[15px] font-medium transition-all duration-200 ${
    isActive?.(path)
      ? `${ACTIVE_BG} ${ACTIVE_TEXT}`
      : `${IDLE_TEXT} ${HOVER_BG}`
  }`;

export const getImageClass = (
  path?: string,
  isActive?: (path: string) => boolean,
  forceActive?: boolean
) => {
  const active = forceActive || !!(path && isActive?.(path));

  return `transition-all duration-200 ${
    active
      ? "brightness-0 saturate-100"
      : "brightness-75 group-hover:brightness-50"
  }`;
};

export const professionColors: Record<string, string> = {
  "Software Engineer": "bg-blue-100 text-blue-700",
  "Frontend Developer": "bg-indigo-100 text-indigo-700",
  "Backend Developer": "bg-cyan-100 text-cyan-700",
  "Full Stack Developer": "bg-sky-100 text-sky-700",
  "DevOps Engineer": "bg-gray-200 text-gray-800",
  "Cloud Engineer": "bg-blue-50 text-blue-600",
  "Data Engineer": "bg-purple-100 text-purple-700",
  "Data Scientist": "bg-fuchsia-100 text-fuchsia-700",
  "AI Engineer": "bg-violet-100 text-violet-700",
  "ML Engineer": "bg-violet-50 text-violet-600",
  "Cyber Security Engineer": "bg-red-100 text-red-700",
  "QA Engineer": "bg-emerald-100 text-emerald-700",
  SDET: "bg-green-100 text-green-700",
  "Product Manager": "bg-amber-100 text-amber-700",
  "Associate Product Manager": "bg-yellow-100 text-yellow-700",
  "UI Designer": "bg-pink-100 text-pink-700",
  "UX Designer": "bg-rose-100 text-rose-700",
  "Graphic Designer": "bg-green-100 text-green-700",
  "Motion Designer": "bg-lime-100 text-lime-700",
  "Sales Executive": "bg-orange-100 text-orange-700",
  "Sales Manager": "bg-orange-200 text-orange-800",
  "Business Analyst": "bg-teal-100 text-teal-700",
  "Account Manager": "bg-teal-200 text-teal-800",
  "Marketing Manager": "bg-yellow-200 text-yellow-800",
  "Digital Marketer": "bg-yellow-50 text-yellow-600",
  "Growth Manager": "bg-lime-200 text-lime-800",
  HR: "bg-blue-100 text-blue-700",
  "HR Manager": "bg-blue-200 text-blue-800",
  Recruiter: "bg-indigo-200 text-indigo-800",
  "Talent Acquisition": "bg-sky-200 text-sky-800",
  Admin: "bg-gray-100 text-gray-700",
  "Office Manager": "bg-gray-200 text-gray-800",
  Accountant: "bg-emerald-100 text-emerald-700",
  "Financial Analyst": "bg-emerald-200 text-emerald-800",
  "Investment Banker": "bg-green-200 text-green-800",
  Auditor: "bg-green-50 text-green-600",
  "Tax Consultant": "bg-teal-100 text-teal-700",
  "Operations Manager": "bg-slate-200 text-slate-800",
  "Project Manager": "bg-slate-100 text-slate-700",
  "Program Manager": "bg-slate-300 text-slate-900",
  "Logistics Manager": "bg-stone-200 text-stone-800",
  Doctor: "bg-red-100 text-red-700",
  Nurse: "bg-pink-100 text-pink-700",
  Pharmacist: "bg-purple-100 text-purple-700",
  "Lab Technician": "bg-indigo-100 text-indigo-700",
  Teacher: "bg-blue-100 text-blue-700",
  Professor: "bg-indigo-100 text-indigo-700",
  Trainer: "bg-cyan-100 text-cyan-700",
  Lawyer: "bg-gray-200 text-gray-800",
  "Legal Advisor": "bg-gray-300 text-gray-900",
  Paralegal: "bg-slate-200 text-slate-800",
  Intern: "bg-violet-100 text-violet-700",
  Consultant: "bg-amber-200 text-amber-800",
  Architect: "bg-orange-100 text-orange-700",
};
