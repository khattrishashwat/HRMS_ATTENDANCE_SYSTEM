import { useState } from "react";
import { FiCheck, FiFileText, FiX } from "react-icons/fi";
import ActionButton from "../../ActionButton.tsx";
import ModalShell, { useModalIds } from "./ModalShell.tsx";
import type { ConfirmUploadModalProps } from "./types.ts";
import { formatFileSize } from "./fileUtils.ts";

export default function ConfirmUploadModal({
  isOpen,
  file,
  onClose,
  onCancel,
  onConfirm,
  onRemoveFile,
  title = "Confirm Upload",
  description = "Are you sure you want to upload this file?",
  confirmLabel = "Confirm Upload",
  cancelLabel = "Cancel",
  isUploading = false,
  closeOnBackdropClick = true,
}: ConfirmUploadModalProps) {
  const { titleId, descriptionId } = useModalIds("confirm-upload");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!file || isUploading) return;
    setLocalError(null);
    try {
      await onConfirm(file);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setLocalError(message);
    }
  };

  const handleRemove = () => {
    if (isUploading) return;
    onRemoveFile?.();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      descriptionId={descriptionId}
      closeOnBackdropClick={closeOnBackdropClick && !isUploading}
      showCloseButton
      disableClose={isUploading}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30">
            <FiCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        </div>

        <h2
          id={titleId}
          className="text-xl font-bold text-[#1F2937] sm:text-2xl"
        >
          {title}
        </h2>

        <p
          id={descriptionId}
          className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B7280]"
        >
          {description}
        </p>

        {file && (
          <div className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-[#E9D5FF] bg-[#F8F5FF] px-3 py-3 text-left sm:px-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tertiary">
              <FiFileText className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1F2937]">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {formatFileSize(file.size)}
              </p>
            </div>

            {onRemoveFile && (
              <button
                type="button"
                aria-label="Remove selected file"
                disabled={isUploading}
                onClick={handleRemove}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#6B7280] disabled:opacity-50"
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {localError && (
          <p className="mt-3 w-full text-sm text-red-600" role="alert">
            {localError}
          </p>
        )}

        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <ActionButton
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="h-11 min-w-[120px] border-[#E5E7EB] text-[#374151]"
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isUploading || !file}
            className="h-11 min-w-[160px]"
          >
            {isUploading ? "Uploading…" : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </ModalShell>
  );
}
