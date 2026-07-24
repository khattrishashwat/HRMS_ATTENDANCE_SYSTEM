import { CalendarDays, ChevronDown } from "lucide-react";

type OverviewHeaderProps = {
  displayName: string;
  dateLabel?: string;
};

export default function OverviewHeader({
  displayName,
  dateLabel = "Yesterday",
}: OverviewHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-primary sm:text-[28px]">
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
        <CalendarDays className="h-4 w-4 text-[#6B7280]" strokeWidth={2} />
        <span className="whitespace-nowrap">{dateLabel}</span>
        <ChevronDown className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2} />
      </button>
    </div>
  );
}
