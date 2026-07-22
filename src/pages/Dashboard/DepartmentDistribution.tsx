import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";
import { departmentDistribution } from "./dashboardData.ts";

const legendItems = departmentDistribution.slice(0, 5);

export default function DepartmentDistribution() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle
        title="Department Distribution"
        subtitle="Headcount across 7 departments"
      />
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-[170px] w-[170px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                stroke="none"
              >
                {departmentDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold leading-none text-[#111827]">81</span>
            <span className="mt-1 text-[11px] text-[#6B7280]">Employees</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-2.5">
          {legendItems.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-3 text-[12px]">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-[#374151]">{item.name}</span>
              </div>
              <span className="shrink-0 font-semibold text-[#111827]">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}
