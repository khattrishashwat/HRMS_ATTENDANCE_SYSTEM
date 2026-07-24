import type { DateRangeValue } from "../../components/common/DateRangeDropdown.tsx";
import DateRangeDropdown from "../../components/common/DateRangeDropdown.tsx";

type DashboardHeaderProps = {

  displayName: string;
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
};

export default function DashboardHeader({ displayName,
  dateRange,
  onDateRangeChange, }: DashboardHeaderProps) {
  return (
    <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-primary sm:text-[28px]">
              Welcome, {displayName}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Here&apos;s your workforce overview.
            </p>
          </div>
    
          <DateRangeDropdown
            value={dateRange}
            onChange={onDateRangeChange}
            triggerClassName="rounded-xl shadow-sm"
          />
        </div>
    </div>
  );
}