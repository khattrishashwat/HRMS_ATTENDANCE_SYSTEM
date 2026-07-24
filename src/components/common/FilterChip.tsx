import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  /** Highlights chip when its dropdown/panel is open */
  active?: boolean;
  showChevron?: boolean;
  chevronOpen?: boolean;
};

/** Outlined pill control for Filter / Sort / Date / Columns toolbars. */
export default function FilterChip({
  icon,
  badge,
  children,
  active = false,
  showChevron = false,
  chevronOpen = false,
  className = "",
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border bg-white px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
        active
          ? "border-primary/40 text-primary"
          : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
      } ${className}`}
      {...props}
    >
      {icon}
      <span className="inline-flex items-center gap-1 whitespace-nowrap">{children}</span>
      {badge}
      {showChevron && (
        <FiChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
            chevronOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      )}
    </button>
  );
}
