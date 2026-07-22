export const getPageTitle = (pathname: string) => {
  // ================= Dashboard =================
  if (pathname.startsWith("/dashboard")) return { pageTitle: "Dashboard" };
  if (pathname.startsWith("/profile")) return { pageTitle: "Personal Information" };
  if (pathname.startsWith("/orgChart")) return { pageTitle: "Organization Chart" };

  // ================= Employees =================
  if (pathname === "/employees") return { pageTitle: "Employee Management" };
  if (pathname.startsWith("/employees/addNewEmployee"))
    return { pageTitle: "Employees" };
  if (/^\/employees\/\d+\/edit$/.test(pathname))
    return { pageTitle: "Edit Employee" };
  if (/^\/employees\/\d+\/view$/.test(pathname))
    return { pageTitle: "Employee Management" };
  if (pathname.startsWith("/resignationRequest"))
    return { pageTitle: "Employee Management" };

  // ================= Settings =================
  if (pathname.toLowerCase().startsWith("/settings"))
    return { pageTitle: "Settings" };

  // ================= Reports =================
  if (pathname.startsWith("/downloadReports"))
    return { pageTitle: "Reports" };

  // ================= Attendance =================
  if (pathname === "/attendanceList")
    return { pageTitle: "Attendance Management" };

  if (
    pathname.startsWith("/attendance/missed") ||
    pathname === "/attendance/shift"
  )
    return { pageTitle: "Attendance Management" };

  if (pathname.startsWith("/attendanceList/details/"))
    return { pageTitle: "Attendance Details" };

  if (pathname.startsWith("/attendance/shift/details/"))
    return { pageTitle: "Employee Shift Details" };

  if (pathname.startsWith("/attendance/location-logs/"))
    return { pageTitle: "Location Logs" };

  if (pathname === "/_Leaves/wfh")
    return { pageTitle: "Work From Home Management" };

  // ================= API Verification =================
  if (pathname.startsWith("/api-verification-suite"))
    return { pageTitle: "API Verification Suite" };

  if (pathname.startsWith("/verification-apis"))
    return { pageTitle: "API Verifications" };

  // ================= Leave =================
  if (pathname === "/leaveList")
    return { pageTitle: "Leaves Management" };

  if (/^\/leaveList\/\d+$/.test(pathname))
    return { pageTitle: "Leave Details" };

  // ================= Work From Home =================
  if (pathname === "/leaves/wfh")
    return { pageTitle: "Work From Home" };

  if (/^\/leaves\/wfh\/\d+$/.test(pathname))
    return { pageTitle: "Work From Home Details" };

  // ================= Target =================
  if (pathname === "/target")
    return { pageTitle: "Target Mangement" };

  if (pathname === "/target/assignTarget")
    return { pageTitle: "Assign Target" };

  if (pathname.startsWith("/target/assignTargetDetails"))
    return { pageTitle: "Assign Target Details" };

  if (pathname.startsWith("/target/editAssignTarget/"))
    return { pageTitle: "Edit Assigned Target" };

  // ================= Work Reports =================
  if (pathname === "/reports")
    return { pageTitle: "Work Reports" };

  if (pathname.startsWith("/reports/detail/"))
    return { pageTitle: "Work Report Details" };

  // ================= Announcement =================
  if (pathname === "/announcement")
    return { pageTitle: "Announcements" };

  if (pathname === "/announcement/createAnnouncements")
    return { pageTitle: "Create Announcement" };

  if (pathname.startsWith("/announcement/edit/"))
    return { pageTitle: "Edit Announcement" };

  // ================= User =================
  if (pathname === "/user/users")
    return { pageTitle: "User Management" };

  if (pathname.startsWith("/user/organization/activateMerchant"))
    return { pageTitle: "Users" };

  if (pathname === "/user/roles")
    return { pageTitle: "Roles & Permissions" };

  // ================= Organization =================
  if (pathname === "/user/organization")
    return { pageTitle: "Organization" };

  if (pathname === "/user/organizationcreate")
    return { pageTitle: "Create Organization" };

  if (
    pathname.startsWith("/user/organization/") &&
    pathname.endsWith("/view")
  )
    return { pageTitle: "Organization Details" };

  if (
    pathname.startsWith("/user/organization/") &&
    pathname.endsWith("/edit")
  )
    return { pageTitle: "Edit Organization" };

  // ================= Payroll =================
  if (
    pathname.startsWith("/salary/") ||
    pathname.startsWith("/payroll/")
  ) {
    return { pageTitle: "Payroll Processing" };
  }

  // ================= Productivity =================
  if (pathname === "/productivity/team")
    return { pageTitle: "Team Productivity" };

  if (pathname === "/productivity/employee")
    return { pageTitle: "Employee Productivity" };

  // ================= Appraisal =================
  if (pathname.startsWith("/settings/appraisal_management"))
    return { pageTitle: "Appraisal Configuration" };

  if (
    pathname === "/appraisal/dashboard" ||
    pathname === "/appraisal/manager-review" ||
    pathname === "/appraisal/my-appraisals" ||
    pathname === "/appraisal/fill-review" ||
    pathname === "/appraisal/self-review"
  ) {
    return { pageTitle: "Appraisal" };
  }

  if (
    pathname === "/appraisal/cycle" ||
    pathname === "/appraisal/cycle/create_cycle" ||
    pathname.startsWith("/appraisal/cycle/edit/") ||
    pathname.startsWith("/appraisal/cycle/view/")
  ) {
    return { pageTitle: "Appraisal Cycle" };
  }

  if (
    pathname === "/appraisal/progress" ||
    pathname === "/appraisal/progress_view"
  ) {
    return { pageTitle: "Appraisal Progress" };
  }

  if (pathname === "/appraisal/appraisal-requests")
    return { pageTitle: "Appraisal Requests" };

  if (pathname === "/appraisal/feedback")
    return { pageTitle: "Feedback Management" };

  // ================= Tax =================
  if (
    pathname.startsWith("/payroll/taxation") ||
    pathname.startsWith("/payroll/taxes") ||
    pathname.startsWith("/payroll/view-taxes")
  ) {
    return { pageTitle: "Tax Management" };
  }

  // ================= Expense =================
  if (
    pathname.startsWith("/expense/expense-requests") ||
    pathname.startsWith("/expense/view-details")
  ) {
    return { pageTitle: "Expense Management" };
  }

  // ================= Default =================
  return { pageTitle: "Page" };
};