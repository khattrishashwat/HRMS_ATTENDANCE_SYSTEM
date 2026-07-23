import { FiCalendar } from "react-icons/fi";
import DropdownMenu from "./DropdownMenu.tsx";
import FilterChip from "./FilterChip.tsx";
import type { DropdownOption } from "./dropdownTypes.ts";

export type DateRangeValue =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_6_months"
  | "last_year"
  | "custom";

export const DEFAULT_DATE_RANGE_OPTIONS: DropdownOption<DateRangeValue>[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 6 months", value: "last_6_months" },
  { label: "Last Year", value: "last_year" },
  { label: "Custom Range", value: "custom" },
];

type DateRangeDropdownProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  options?: DropdownOption<DateRangeValue>[];
  /** Called when "Custom Range" is selected — wire an existing date picker here. */
  onCustomRange?: () => void;
  /** Chip label when no meaningful selection display is needed */
  placeholder?: string;
  className?: string;
};

export default function DateRangeDropdown({
  value,
  onChange,
  options = DEFAULT_DATE_RANGE_OPTIONS,
  onCustomRange,
  placeholder = "Select date range",
  className = "",
}: DateRangeDropdownProps) {
  const selected = options.find((o) => o.value === value);
  const chipLabel = selected?.label ?? placeholder;

  return (
    <DropdownMenu
      options={options}
      value={value}
      onChange={(next) => {
        onChange(next);
        if (next === "custom") onCustomRange?.();
      }}
      aria-label="Date range"
      className={className}
      trigger={({ open, toggle }) => (
        <FilterChip
          icon={<FiCalendar className="h-4 w-4 shrink-0 text-[#6B7280]" />}
          active={open}
          showChevron
          chevronOpen={open}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {chipLabel}
        </FilterChip>
      )}
    />
  );
}
