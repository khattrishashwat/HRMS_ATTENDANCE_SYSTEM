/**
 * Global application status system — single source of truth for
 * variant colors, status→variant mapping, and display labels.
 *
 * Change colors here once; every StatusBadge updates automatically.
 */

export type StatusVariant =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "pending"
  | "default";

export type StatusVariantColors = {
  background: string;
  text: string;
};

/**
 * Global status color tokens.
 * Pending background uses the existing tertiary design token (#F3E8FF).
 */
export const STATUS_VARIANTS: Record<StatusVariant, StatusVariantColors> = {
  success: {
    background: "#D7FFDE",
    text: "#15803D",
  },
  error: {
    background: "#FFD6D6",
    text: "#DC2626",
  },
  info: {
    background: "#E1EAFB",
    text: "#1D4ED8",
  },
  warning: {
    background: "#FFF1DE",
    text: "#D97706",
  },
  pending: {
    background: "#F3E8FF",
    text: "#4B1B91",
  },
  default: {
    background: "#F3F4F6",
    text: "#374151",
  },
};

/**
 * Backend / domain status → visual variant.
 * Keys must be normalized (uppercase, underscores).
 */
export const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  APPROVED: "success",
  ACTIVE: "success",
  MANAGER_APPROVED: "success",

  REJECTED: "error",
  INACTIVE: "error",
  IN_ACTIVE: "error",

  WITHDRAWN: "info",

  ON_HOLD: "warning",
  ONHOLD: "warning",

  PENDING: "pending",
  HR_REVIEW: "pending",
  REVISION_PENDING: "pending",
};

/** Optional exact display labels (overrides generic title-casing). */
const STATUS_LABEL_OVERRIDES: Record<string, string> = {
  INACTIVE: "InActive",
  IN_ACTIVE: "InActive",
};

const ACRONYMS = new Set(["HR", "TDS", "OTP", "WFH", "LWD", "API"]);

/** Normalize casing / spaces / hyphens → UPPER_SNAKE key. */
export function normalizeStatusKey(
  status: string | null | undefined
): string {
  if (!status?.trim()) return "";

  return status
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();
}

/**
 * Format backend enum for display.
 * PENDING → Pending, ON_HOLD → On Hold, HR_REVIEW → HR Review
 * INACTIVE → InActive (override)
 */
export function formatStatusLabel(
  status: string | null | undefined
): string {
  const key = normalizeStatusKey(status);
  if (!key) return "-";

  if (STATUS_LABEL_OVERRIDES[key]) {
    return STATUS_LABEL_OVERRIDES[key];
  }

  return key
    .split("_")
    .filter(Boolean)
    .map((part) => {
      if (ACRONYMS.has(part)) return part;
      return part.charAt(0) + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function getStatusVariant(
  status: string | null | undefined
): StatusVariant {
  const key = normalizeStatusKey(status);
  if (!key) return "default";
  return STATUS_VARIANT_MAP[key] ?? "default";
}

export function getStatusColors(
  status: string | null | undefined
): StatusVariantColors {
  return STATUS_VARIANTS[getStatusVariant(status)];
}
