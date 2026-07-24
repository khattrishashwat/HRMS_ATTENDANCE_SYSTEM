import { UserPlus, Users, FileCheck2, BriefcaseBusiness } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/index.ts";
import OverviewHeader from "./OverviewHeader.tsx";
import OverviewMetricCard from "./OverviewMetricCard.tsx";
import PeopleStatusCard from "./PeopleStatusCard.tsx";
import DepartmentBarsCard from "./DepartmentBarsCard.tsx";
import AttendanceDonutCard from "./AttendanceDonutCard.tsx";
import ProbationTrackerCard from "./ProbationTrackerCard.tsx";
import ProductivityTiersCard from "./ProductivityTiersCard.tsx";
import {
  TOTAL_EMPLOYEES,
  attendanceSlices,
  celebrationUpcoming,
  celebrationYesterday,
  departmentBars,
  onLeaveUpcoming,
  onLeaveYesterday,
  overviewMetrics,
  probationItems,
  productivityTiers,
  productivityTrackedTotal,
  wfhUpcoming,
  wfhYesterday,
} from "./workforceOverviewData.ts";

const metricIcons = {
  users: Users,
  joiner: UserPlus,
  attendance: FileCheck2,
  productivity: BriefcaseBusiness,
} as const;

/**
 * Active Dashboard — workforce overview (reference design).
 * Legacy widgets remain available via `./legacy`.
 */
export default function Dashboard() {
  const userName = useSelector((state: RootState) => state.auth.userName);
  const displayName = userName?.trim() || "User";

  const onLeaveCount = onLeaveYesterday.length + onLeaveUpcoming.length;
  const wfhCount = wfhYesterday.length + wfhUpcoming.length;
  const celebrationCount =
    celebrationYesterday.length + celebrationUpcoming.length;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <OverviewHeader displayName={displayName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <OverviewMetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metricIcons[metric.icon]}
            iconBg={metric.iconBg}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <PeopleStatusCard
          title="On Leave"
          badgeLabel={`${onLeaveCount} employees`}
          badgeClass="bg-tertiary text-primary"
          yesterday={onLeaveYesterday}
          upcoming={onLeaveUpcoming}
        />
        <PeopleStatusCard
          title="Work From Home"
          badgeLabel={`${wfhCount} employees`}
          badgeClass="bg-[#DBEAFE] text-[#1D4ED8]"
          yesterday={wfhYesterday}
          upcoming={wfhUpcoming}
        />
        <PeopleStatusCard
          title="Birthdays & Anniversaries"
          badgeLabel={`${celebrationCount} this week`}
          badgeClass="bg-[#FFEDD5] text-[#C2410C]"
          yesterday={celebrationYesterday}
          upcoming={celebrationUpcoming}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <DepartmentBarsCard
          departments={departmentBars}
          totalEmployees={TOTAL_EMPLOYEES}
        />
        <AttendanceDonutCard
          slices={attendanceSlices}
          totalEmployees={TOTAL_EMPLOYEES}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <ProbationTrackerCard items={probationItems} />
        <ProductivityTiersCard
          totalTracked={productivityTrackedTotal}
          tiers={productivityTiers}
        />
      </div>
    </div>
  );
}
