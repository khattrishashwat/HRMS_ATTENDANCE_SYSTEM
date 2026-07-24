import { useEffect, useState } from "react";
import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";

export type DepartmentBarItem = {
  name: string;
  count: number;
  percent: number;
};

type DepartmentBarsCardProps = {
  departments: DepartmentBarItem[];
  totalEmployees: number;
};

export default function DepartmentBarsCard({
  departments,
  totalEmployees,
}: DepartmentBarsCardProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <DashboardCard>
      <SectionTitle title="Department Distribution" />
      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#374151]">{dept.name}</span>
              <span className="text-sm text-[#6B7280]">
                <span className="font-semibold text-[#111827]">{dept.count}</span>
                <span className="ml-2 text-[#9CA3AF]">{dept.percent}%</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: animate ? `${dept.percent}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-[#F3F4F6] pt-4 text-sm text-[#6B7280]">
        Total Employees:{" "}
        <span className="font-semibold text-[#111827]">{totalEmployees}</span>
      </p>
    </DashboardCard>
  );
}
