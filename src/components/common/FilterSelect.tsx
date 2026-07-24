import { FiChevronDown } from "react-icons/fi";
import type { DropdownOption } from "./dropdownTypes.ts";

type FilterSelectProps = {
  id?: string;
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Labeled pill select used inside FilterPanel. */
export default function FilterSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  className = "",
}: FilterSelectProps) {
  const selectId = id ?? `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-[#4B5563]"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full appearance-none rounded-full border border-[#E5E7EB] bg-white py-2 pl-4 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            value ? "text-[#374151]" : "text-[#9CA3AF]"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
          aria-hidden
        />
      </div>
    </div>
  );
}
