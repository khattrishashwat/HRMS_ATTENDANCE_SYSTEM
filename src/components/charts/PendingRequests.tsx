import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";
import { pendingRequests } from "../../pages/Dashboard/dashboardData.ts";

const MAX = Math.max(...pendingRequests.map((item) => item.value));

export default function PendingRequests() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle title="Pending Requests" subtitle="Awaiting action by module" />
      <div className="flex flex-col gap-4">
        {pendingRequests.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-[#374151]">{item.label}</span>
              <span className="text-[12px] font-semibold text-[#111827]">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / MAX) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
