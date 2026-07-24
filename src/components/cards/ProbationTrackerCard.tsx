import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";

export type ProbationTrackerItem = {
  id: string;
  name: string;
  department: string;
  daysLeft: number;
};

type ProbationTrackerCardProps = {
  items: ProbationTrackerItem[];
};

export default function ProbationTrackerCard({ items }: ProbationTrackerCardProps) {
  return (
    <DashboardCard>
      <SectionTitle title="Probation Tracker" />
      <div className="divide-y divide-[#F3F4F6]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">
                {item.name}
              </p>
              <p className="truncate text-xs text-[#6B7280]">{item.department}</p>
            </div>
            <span className="inline-flex shrink-0 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
              {item.daysLeft} days left
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
