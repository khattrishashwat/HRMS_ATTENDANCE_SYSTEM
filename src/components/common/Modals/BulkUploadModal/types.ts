export const DEFAULT_ACCEPTED_FILE_TYPES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".zip",
] as const;

export type AcceptedFileType = (typeof DEFAULT_ACCEPTED_FILE_TYPES)[number] | string;

export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onDownloadTemplate?: () => void | Promise<void>;
  title?: string;
  description?: string;
  uploadText?: string;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  templateButtonLabel?: string;
  isTemplateDownloading?: boolean;
  closeOnBackdropClick?: boolean;
  /** Override the formats line under the drop zone (defaults from acceptedFileTypes). */
  formatsLabel?: string;
}

export interface ConfirmUploadModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  onRemoveFile?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isUploading?: boolean;
  closeOnBackdropClick?: boolean;
}

export type FileValidationResult =
  | { ok: true }
  | { ok: false; message: string };
