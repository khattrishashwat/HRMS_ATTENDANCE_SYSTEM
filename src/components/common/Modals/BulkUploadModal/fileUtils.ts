import type { FileValidationResult } from "./types.ts";

/** Format byte size for UI (e.g. 245 KB, 1.2 MB). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 bytes";
  if (bytes < 1024) return `${bytes} bytes`;

  const kb = bytes / 1024;
  if (kb < 1024) {
    const value = kb >= 100 ? Math.round(kb) : Number(kb.toFixed(kb >= 10 ? 0 : 1));
    return `${value} KB`;
  }

  const mb = kb / 1024;
  const value = mb >= 10 ? Math.round(mb) : Number(mb.toFixed(1));
  return `${value} MB`;
}

export function normalizeExtension(extOrType: string): string {
  const trimmed = extOrType.trim().toLowerCase();
  if (!trimmed) return "";
  return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
}

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) return "";
  return fileName.slice(idx).toLowerCase();
}

/** Human-readable formats for the drop-zone hint (JPG, PNG, …). */
export function formatAcceptedTypesLabel(acceptedFileTypes: string[]): string {
  return acceptedFileTypes
    .map((t) => normalizeExtension(t).replace(".", "").toUpperCase())
    .filter(Boolean)
    .join(", ");
}

export function validateUploadFile(
  file: File | null | undefined,
  acceptedFileTypes: string[],
  maxFileSizeMB: number
): FileValidationResult {
  if (!file) {
    return { ok: false, message: "Please select a valid file." };
  }

  const ext = getFileExtension(file.name);
  const allowed = acceptedFileTypes.map(normalizeExtension);

  if (!ext || !allowed.includes(ext)) {
    return { ok: false, message: "File type is not supported." };
  }

  const maxBytes = maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `File size must be less than ${maxFileSizeMB} MB.`,
    };
  }

  if (file.size <= 0) {
    return { ok: false, message: "Please select a valid file." };
  }

  return { ok: true };
}
