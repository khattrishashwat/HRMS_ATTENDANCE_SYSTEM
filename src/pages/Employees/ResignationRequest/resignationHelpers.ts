import { formatDate } from "../../../utils/userFunctions.ts";

export function extractDepartment(
  employeeSnapshot: string | null | undefined
): string {
  if (!employeeSnapshot?.trim()) return "-";

  const match = employeeSnapshot.match(/Dept:\s*([^|]+)/i);
  const department = match?.[1]?.trim();
  return department || "-";
}

export function extractDesignation(
  employeeSnapshot: string | null | undefined
): string {
  if (!employeeSnapshot?.trim()) return "-";

  const match = employeeSnapshot.match(/Designation:\s*([^|]+)/i);
  const designation = match?.[1]?.trim();
  return designation || "-";
}

export function formatResignationDate(
  value: string | null | undefined
): string {
  if (!value?.trim()) return "-";
  const formatted = formatDate(value);
  return formatted || "-";
}

export function buildPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "..."> {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
