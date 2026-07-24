import type { LucideIcon } from "lucide-react";
import DashboardCard from "./DashboardCard.tsx";

type OverviewMetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export default function OverviewMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: OverviewMetricCardProps) {
  return (
    <DashboardCard className="!gap-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
      </div>
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">{value}</p>
      <p className="mt-2 text-xs text-[#9CA3AF]">{subtitle}</p>
    </DashboardCard>
  );
}
