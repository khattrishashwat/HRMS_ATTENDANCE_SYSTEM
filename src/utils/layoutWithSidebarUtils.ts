export const getPageTitle = (pathname: string) => {
  // Dashboard
  if (pathname.startsWith("/dashboard")) return { pageTitle: "Dashboard" };
  if (pathname.startsWith("/profile")) return { pageTitle: "Personal Information" };
  if (pathname.startsWith("/orgChart")) return { pageTitle: "Organization Chart" };
  // ================= EMPLOYEES =================
  if (pathname === "/employees") return { pageTitle: "Employee Management" };
  if (pathname.startsWith("/settings")) return { pageTitle: "Settings" };
  if(pathname.startsWith("/downloadReports"))return {pageTitle:"Reports"}
  if(pathname.startsWith("/resignationRequest")) return{pageTitle:"Employee Management"}
  if (pathname.startsWith("/Settings")) return { pageTitle: "Settings" };
  if (/^\/employees\/\d+\/edit$/.test(pathname)) return { pageTitle: "Edit Employee" };

  if (/^\/employees\/\d+\/view$/.test(pathname)) return { pageTitle: "Employee Management" };

  // ================= ATTENDANCE =================
  if (pathname === "/attendanceList") return { pageTitle: "Attendance Management" };
  if (pathname.startsWith("/settings/ShiftTypes/edit")) return { pageTitle: "Settings" };
  if (pathname === "/_Leaves/wfh") return { pageTitle: "Work From Home Management" };
  if (pathname.startsWith("/attendanceList/details/")) return { pageTitle: "Attendance Details" };
  if (pathname.startsWith("/attendance/missed")) return { pageTitle: "Attendance Management" };
  if (pathname === "/attendance/shift") return { pageTitle: "Attendance Management" };
  if (pathname.startsWith("/employees/addNewEmployee")) return { pageTitle: "Employees" };

  if (pathname.startsWith("/attendance/shift/details/"))
    return { pageTitle: "Employee Shift Details" };
  if (pathname.startsWith("/api-verification-suite"))
    return { pageTitle: "API Verification Suite" };
  if (pathname.startsWith("/verification-apis")) return { pageTitle: "API Verifications" };

  if (pathname.startsWith("/attendance/location-logs/")) return { pageTitle: "Location Logs" };

  // ================= LEAVES =================
  if (pathname === "/leaveList") return { pageTitle: "Leaves Management" };

  if (/^\/leaveList\/\d+$/.test(pathname)) return { pageTitle: "Leave Details" };

  // ================= WORK FROM HOME =================
  if (pathname === "/leaves/wfh") return { pageTitle: "Work From Home" };

  if (/^\/leaves\/wfh\/\d+$/.test(pathname)) return { pageTitle: "Work From Home Details" };

  // ================= TARGET =================
  if (pathname === "/target") return { pageTitle: "Target Mangement" };

  if (pathname === "/target/assignTarget") return { pageTitle: "Assign Target" };
  if (pathname.startsWith("/target/assignTargetDetails"))
    return { pageTitle: "Assign Target Details" };
  if (pathname.startsWith("/target/editAssignTarget/"))
    return { pageTitle: "Edit Assigned Target" };

  // ================= REPORTS =================
  if (pathname === "/reports") return { pageTitle: "Work Reports" };

  if (pathname.startsWith("/reports/detail/")) return { pageTitle: "Work Report Details" };

  // ================= ANNOUNCEMENTS =================
  if (pathname === "/announcement") return { pageTitle: "Announcements" };

  if (pathname === "/announcement/createAnnouncements") return { pageTitle: "Create Announcement" };

  if (pathname.startsWith("/announcement/edit/")) return { pageTitle: "Edit Announcement" };

  // ================= USERS =================
  if (pathname.startsWith("/user")) return { pageTitle: "User Management" };

  if (pathname === "/user/users") return { pageTitle: "User Management" };
  if (pathname.startsWith("/user/organization/activateMerchant")) return { pageTitle: "Users" };
  if (pathname === "/user/roles") return { pageTitle: "Roles & Permissions" };

  // ================= ORGANIZATION =================
  if (pathname === "/user/organization") return { pageTitle: "Organization" };

  if (pathname === "/user/organizationcreate") return { pageTitle: "Create Organization" };

  if (pathname.startsWith("/user/organization/") && pathname.endsWith("/view"))
    return { pageTitle: "Organization Details" };

  if (pathname.startsWith("/user/organization/") && pathname.endsWith("/edit"))
    return { pageTitle: "Edit Organization" };

  // ================= SETTINGS =================
  if (pathname.startsWith("/Settings")) return { pageTitle: "Settings" };

  // ================= Salary =================
  if (pathname === "/salary/structure") return { pageTitle: "Payroll Processing" };
  if (pathname === "/salary/employee") return { pageTitle: "Payroll Processing" };
  if (pathname === "/salary/employee/assign") return { pageTitle: "Payroll Processing" };
  if (pathname === "/salary/employee/view") return { pageTitle: "Payroll Processing" };
  if (pathname === "/salary/employee/edit") return { pageTitle: "Payroll Processing" };


  // ================= PAYROLL =================
  if (pathname === "/payroll/periods") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/periods/createNewPeriod") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/periods/view") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/periods/edit") return { pageTitle: "Payroll Processing" };

  if (pathname === "/payroll/run") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/review") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/payslips") return { pageTitle: "Payroll Processing" };
  if (pathname === "/payroll/override") return { pageTitle: "Payroll Processing" };

  // ================= PRODUCTIVITY =================
  if (pathname === "/productivity/team") return { pageTitle: "Team Productivity" };
  if (pathname === "/productivity/employee") return { pageTitle: "Employee Productivity" };

  // ============== Appraisal ==============
  if (pathname.startsWith("/settings/appraisal_management")) return { pageTitle: "Appraisal Configuration" };
  if (pathname === "/appraisal/dashboard") return { pageTitle: "Appraisal" };
  if (pathname === "/appraisal/cycle") return { pageTitle: "Appraisal Cycle" };
  if (pathname === "/appraisal/cycle/create_cycle") return { pageTitle: "Appraisal Cycle" };
  if (pathname.startsWith("/appraisal/cycle/edit/")) return { pageTitle: "Appraisal Cycle" };
  if (pathname.startsWith("/appraisal/cycle/view/")) return { pageTitle: "Appraisal Cycle" };
  if (pathname === "/appraisal/progress") return { pageTitle: "Appraisal Progress" };
  if (pathname === "/appraisal/progress_view") return { pageTitle: "Appraisal Progress" };
  if (pathname === "/appraisal/manager-review") return { pageTitle: "Appraisal" };
  if (pathname === "/appraisal/appraisal-requests") return { pageTitle: "Appraisal Requests" };
  if (pathname === "/appraisal/feedback") return { pageTitle: "Feedback Management" };
  if (pathname === "/appraisal/my-appraisals") return { pageTitle: "Appraisal" };
  if (pathname === "/appraisal/fill-review") return { pageTitle: "Appraisal" };
  if (pathname === "/appraisal/self-review") return { pageTitle: "Appraisal" };

  // ================= TDS =================
  if (pathname.startsWith("/payroll/taxation")) return { pageTitle: "Tax Management" };
  if (pathname.startsWith("/payroll/taxes")) return { pageTitle: "Tax Management" };
  if (pathname.startsWith("/payroll/view-taxes")) return { pageTitle: "Tax Management" };


  // ================= Expenses =================
  if (pathname.startsWith("/expense/expense-requests")) return { pageTitle: "Expense Management" };
  if (pathname.startsWith("/expense/view-details")) return { pageTitle: "Expense Management" };


  // ================= DEFAULT =================
  return { pageTitle: "Page" };
};
