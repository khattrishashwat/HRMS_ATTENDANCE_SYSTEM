import { FiX } from "react-icons/fi";
import ActionButton from "./ActionButton.tsx";
import FilterSelect from "./FilterSelect.tsx";
import type { FilterFieldConfig, FilterValues } from "./dropdownTypes.ts";

type FilterPanelProps = {
  title?: string;
  filters: FilterFieldConfig[];
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
  className?: string;
};

/**
 * Configurable "Filter Records" panel.
 * Holds draft values only — parent applies filters on Apply.
 */
export default function FilterPanel({
  title = "Filter Records",
  filters,
  values,
  onChange,
  onReset,
  onApply,
  onClose,
  className = "",
}: FilterPanelProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#374151]">{title}</h3>
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6]"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filters.map((field) => (
            <FilterSelect
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              options={field.options}
              value={values[field.key] ?? ""}
              onChange={(next) => onChange(field.key, next)}
            />
          ))}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pb-0">
          <ActionButton
            variant="outline"
            onClick={onReset}
            className="border-[#E9D5FF] text-primary hover:bg-tertiary"
          >
            Reset
          </ActionButton>
          <ActionButton variant="primary" onClick={onApply}>
            Apply Filters
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
