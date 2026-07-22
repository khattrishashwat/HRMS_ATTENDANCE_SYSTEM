import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";
import { workforceDistribution } from "./dashboardData.ts";

const MAX = Math.max(...workforceDistribution.map((item) => item.value));

export default function WorkforceDistribution() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle title="Workforce Distribution" subtitle="By employment type" />
      <div className="flex flex-col gap-4">
        {workforceDistribution.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-[72px] shrink-0 text-[12px] font-medium text-[#374151]">
              {item.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / MAX) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-[12px] font-semibold text-[#111827]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
