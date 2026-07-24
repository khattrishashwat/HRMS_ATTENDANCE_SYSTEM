import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import DropdownMenu from "./DropdownMenu.tsx";
import FilterChip from "./FilterChip.tsx";
import type { DropdownOption } from "./dropdownTypes.ts";

export const DEFAULT_SORT_OPTIONS: DropdownOption[] = [
  { label: "Date Joined - Newest", value: "date_desc" },
  { label: "Date Joined - Oldest", value: "date_asc" },
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
  { label: "Employee ID - Ascending", value: "employee_id_asc" },
  { label: "Employee ID - Descending", value: "employee_id_desc" },
];

type SortDropdownProps<T extends string = string> = {
  options?: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
};

export default function SortDropdown<T extends string = string>({
  options = DEFAULT_SORT_OPTIONS as DropdownOption<T>[],
  value,
  onChange,
  label = "Sort",
  className = "",
}: SortDropdownProps<T>) {
  const selected = options.find((o) => o.value === value);

  return (
    <DropdownMenu
      options={options}
      value={value}
      onChange={onChange}
      aria-label="Sort"
      className={className}
      trigger={({ open, toggle }) => (
        <FilterChip
          icon={<HiOutlineArrowsUpDown className="h-4 w-4 shrink-0 text-[#6B7280]" />}
          active={open}
          showChevron
          chevronOpen={open}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {selected?.label ?? label}
        </FilterChip>
      )}
    />
  );
}
