import { Users, BadgeCheck, TrendingUp, LayoutGrid, ListTodo } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/index.ts";
import { celebrations, metrics, onLeave, workFromHome } from "./dashboardData.ts";
import DashboardHeader from "./DashboardHeader.tsx";
import StatCard from "./StatCard.tsx";
import WorkforceDistribution from "./WorkforceDistribution.tsx";
import DepartmentDistribution from "./DepartmentDistribution.tsx";
import ProductivityOverview from "./ProductivityOverview.tsx";
import PendingRequests from "./PendingRequests.tsx";
import AttendanceAvailability from "./AttendanceAvailability.tsx";
import AnnouncementCard from "./AnnouncementCard.tsx";
import EmployeeListCard from "./EmployeeListCard.tsx";
import CelebrationCard from "./CelebrationCard.tsx";

const iconMap = {
  users: Users,
  check: BadgeCheck,
  trending: TrendingUp,
  building: LayoutGrid,
  clock: ListTodo,
};

/**
 * Dashboard page content only — rendered inside MainLayout <Outlet />.
 */
export default function Dashboard() {
  const userName = useSelector((state: RootState) => state.auth.userName);
  const displayName = userName?.trim() || "Harshit Trivedi";

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <DashboardHeader displayName={displayName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <StatCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            icon={iconMap[metric.icon]}
            iconBg={metric.iconBg}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-5 lg:gap-5">
        <div className="min-w-0 lg:col-span-3">
          <WorkforceDistribution />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <DepartmentDistribution />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-5 lg:gap-5">
        <div className="min-w-0 lg:col-span-3">
          <ProductivityOverview />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <PendingRequests />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
        <AttendanceAvailability />
        <AnnouncementCard />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        <EmployeeListCard
          title="Work From Home"
          subtitle="Currently remote today"
          employees={workFromHome}
        />
        <EmployeeListCard
          title="On Leave"
          subtitle="Approved leave today"
          employees={onLeave}
        />
        <CelebrationCard celebrations={celebrations} />
      </div>
    </div>
  );
}
