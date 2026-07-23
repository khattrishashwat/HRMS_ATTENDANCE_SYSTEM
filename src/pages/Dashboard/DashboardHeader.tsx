import { CalendarDays } from "lucide-react";

type DashboardHeaderProps = {
  displayName: string;
};

export default function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-7 text-[#111827] sm:text-2xl">
            Welcome, {displayName}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Here&apos;s your workforce overview.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm transition hover:bg-[#F9FAFB]"
        >
          <CalendarDays
            className="h-4 w-4 text-[#6B7280]"
            strokeWidth={2}
          />
          Select date range
        </button>
      </div>
    </div>
  );
}