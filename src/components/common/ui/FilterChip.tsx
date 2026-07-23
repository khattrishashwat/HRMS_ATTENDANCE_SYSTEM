import type { ButtonHTMLAttributes, ReactNode } from "react";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
};

/** Outlined pill control for Filter / Sort / Date / Columns toolbars. */
export default function FilterChip({
  icon,
  badge,
  children,
  className = "",
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${className}`}
      {...props}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
      {badge}
    </button>
  );
}
