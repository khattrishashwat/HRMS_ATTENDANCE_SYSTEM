export interface NavChildItem {
  id: string;
  label: string;
  path: string;
  serviceCode?: string;
}

export interface NavItem {
  id: string;
  title: string;
  icon: string;
  section: string;
  permission?: string;
  serviceCode?: string;
  alwaysVisible?: boolean;
  path?: string;
  children?: NavChildItem[];
}

export const navItems: NavItem[] = [
  // =========================================================
  // EMPLOYEE MANAGEMENT
  // =========================================================

  {
    id: "MEN_DAS",
    title: "Dashboard",
    icon: "Dashboard",
    section: "Employee Management",
    permission: "MEN_DAS",
    path: "/dashboard",
  },

  {
    id: "MEN_EMP",
    title: "Employees",
    icon: "Employees",
    section: "Employee Management",
    permission: "MEN_EMP",
    serviceCode: "EMPLOYEES",
    children: [
      {
        id: "MEN_EMP_LIST",
        label: "All Employee",
        path: "/employees",
      },
      {
        id: "MEN_RES",
        label: "Resignation Request",
        path: "/resignationRequest",
      },
    ],
  },

  {
    id: "MEN_ATT",
    title: "Attendance",
    icon: "Attendance",
    section: "Employee Management",
    permission: "MEN_ATT",
    serviceCode: "ATTENDANCE",
    children: [
      {
        id: "MEN_ATT_LIST",
        label: "Attendance Details",
        path: "/attendanceList",
      },
      {
        id: "MEN_ATT_MISS_LIST",
        label: "Missed Attendance",
        path: "/attendance/missed",
      },
      {
        id: "MEN_ATT_SBM_SFT_DUR_RPT_DLD",
        label: "Shift Duration",
        path: "/attendance/shift",
      },
    ],
  },

  {
    id: "MEN_LEV",
    title: "Leaves",
    icon: "Calendar",
    section: "Employee Management",
    permission: "MEN_LEV",
    serviceCode: "LEAVES",
    children: [
      {
        id: "MEN_LEV_LIST",
        label: "Leaves",
        path: "/leaveList",
      },
      {
        id: "MEN_LEV_SBM_WFH_LIST",
        label: "Work From Home",
        path: "/leaves/wfh",
      },
    ],
  },

  {
    id: "MEN_AGT",
    title: "Productivity Tracker",
    icon: "Productivity",
    section: "Employee Management",
    permission: "MEN_AGT",
    serviceCode: "AGENT",
    path: "/productivity/team",
  },

  // =========================================================
  // FINANCE & COMPLIANCE
  // =========================================================

  {
    id: "MEN_PAY",
    title: "Payroll Processing",
    icon: "Payroll",
    section: "Finance & Compliance",
    permission: "MEN_PAY",
    serviceCode: "PAYROLL",
    children: [
      {
        id: "MEN_PAY_SBM_SAL_STR_LIST",
        label: "Salary Structure",
        path: "/salary/structure",
      },
      {
        id: "MEN_PAY_SBM_EMP_SAL_LIST",
        label: "Employees Salary",
        path: "/salary/employee",
      },
      {
        id: "MEN_PAY_SBM_PAY_PRD_LIST",
        label: "Payroll Periods",
        path: "/payroll/periods",
      },
      {
        id: "MEN_PAY_SBM_PAY_RUN_LIST",
        label: "Review and Approve",
        path: "/payroll/run",
      },
      {
        id: "MEN_PAY_SBM_PAY_RUN_LIST",
        label: "Payslips Viewer",
        path: "/payroll/payslips",
      },
      {
        id: "MEN_PAY_SBM_TAX_DASH_VIEW_BTN",
        label: "Tax Management",
        path: "/payroll/taxes",
      },
      {
        id: "MEN_PAY_EMP_TAX_MENU",
        label: "Tax Declaration",
        path: "/payroll/taxation",
      },
    ],
  },

  {
    id: "MEN_EXP",
    title: "Expenses",
    icon: "Expenses",
    section: "Finance & Compliance",
    permission: "MEN_EXP",
    serviceCode: "EXPENSE",
    children: [
      {
        id: "MEN_EXP",
        label: "Expense Requests",
        path: "/expense/expense-requests",
      },
    ],
  },

  {
    id: "MEN_APP",
    title: "Appraisal",
    icon: "Appraisal",
    section: "Finance & Compliance",
    permission: "MEN_APP",
    serviceCode: "APP",
    children: [
      {
        id: "MEN_APP_SBM_DASH",
        label: "Dashboard",
        path: "/appraisal/dashboard",
      },
      {
        id: "MEN_APP_SBM_CYC",
        label: "Appraisal Cycle",
        path: "/appraisal/cycle",
      },
      {
        id: "MEN_APP_SBM_RUN",
        label: "Appraisal Progress",
        path: "/appraisal/progress",
      },
      {
        id: "MEN_APP_SBM_APP",
        label: "My Appraisals",
        path: "/appraisal/my-appraisals",
      },
      {
        id: "MEN_APP_SBM_REV",
        label: "Appraisal Requests",
        path: "/appraisal/appraisal-requests",
      },
    ],
  },

  // =========================================================
  // ORGANIZATIONAL MANAGEMENT
  // =========================================================

  {
    id: "MEN_WRK_RPT",
    title: "Reports",
    icon: "Reports",
    section: "Organizational Management",
    permission: "MEN_WRK_RPT",
    children: [
      {
        id: "MEN_WRK_RPT",
        label: "Work Reports",
        path: "/reports",
      },
      {
        id: "MEN_WRK_RPT",
        label: "Download Reports",
        path: "/downloadReports",
      },
    ],
  },

  {
    id: "MEN_ORG_CHART",
    title: "Organization Chart",
    icon: "Org",
    section: "Organizational Management",
    alwaysVisible: true,
    path: "/orgChart",
  },

  {
    id: "MEN_ANN",
    title: "Announcements",
    // Filename in assets/sidebarImage is Annoucement.svg (typo preserved)
    icon: "Annoucement",
    section: "Organizational Management",
    permission: "MEN_ANN",
    serviceCode: "ANNOUNCEMENTS",
    path: "/announcement",
  },

  {
    id: "MEN_TAR",
    title: "Targets",
    icon: "Target",
    section: "Organizational Management",
    permission: "MEN_TAR",
    serviceCode: "TARGETS",
    path: "/target",
  },

  {
    id: "MEN_SYS_CONF",
    title: "Settings",
    icon: "Frame",
    section: "Organizational Management",
    permission: "MEN_SYS_CONF",
    path: "/settings",
  },

  // =========================================================
  // USER MANAGEMENT
  // Keep if required by your existing application
  // =========================================================

  {
    id: "MEN_USR",
    title: "User Management",
    icon: "UserManagement",
    section: "User Management",
    permission: "MEN_USR_SBM_USR",
    children: [
      {
        id: "MEN_ORG_SBM_ENT",
        label: "Organization",
        path: "/user/organization",
      },
      {
        id: "MEN_USR_SBM_ROL_PER",
        label: "Roles & Permissions",
        path: "/user/roles",
      },
      {
        id: "MEN_USR_SBM_USR",
        label: "Users",
        path: "/user/users",
      },
    ],
  },
];