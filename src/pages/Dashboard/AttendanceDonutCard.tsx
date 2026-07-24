import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";
import type { AttendanceSlice } from "./workforceOverviewData.ts";

type AttendanceDonutCardProps = {
  slices: AttendanceSlice[];
  totalEmployees: number;
};

export default function AttendanceDonutCard({
  slices,
  totalEmployees,
}: AttendanceDonutCardProps) {
  return (
    <DashboardCard>
      <SectionTitle title="Attendance Overview" />
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-48 w-48 shrink-0 sm:h-52 sm:w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#111827]">{totalEmployees}</span>
            <span className="text-xs text-[#6B7280]">Employees</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-3 sm:max-w-[200px]">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-[#374151]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.label}
              </span>
              <span className="text-sm font-semibold text-[#111827]">
                {slice.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}
