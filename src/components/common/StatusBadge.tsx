import type { CSSProperties } from "react";
import {
  formatStatusLabel,
  getStatusColors,
} from "../../constants/statusConfig.ts";

type StatusBadgeProps = {
  /** Backend or domain status (e.g. APPROVED, pending, On Hold). */
  status: string | null | undefined;
  /** Optional label override; defaults to formatted status. */
  label?: string;
  className?: string;
};

/**
 * Global reusable status pill.
 * Colors come only from `constants/statusConfig` — do not hardcode per page.
 */
export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const colors = getStatusColors(status);
  const displayLabel = label ?? formatStatusLabel(status);

  const style: CSSProperties = {
    backgroundColor: colors.background,
    color: colors.text,
  };

  return (
    <span
      style={style}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {displayLabel}
    </span>
  );
}
