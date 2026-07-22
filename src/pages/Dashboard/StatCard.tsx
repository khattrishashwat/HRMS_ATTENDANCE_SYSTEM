import type { LucideIcon } from "lucide-react";
import DashboardCard from "./DashboardCard.tsx";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <DashboardCard className="flex items-center gap-3 !p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#6B7280]">{label}</p>
        <p className="mt-0.5 text-[22px] font-bold leading-none text-[#111827]">{value}</p>
      </div>
    </DashboardCard>
  );
}
