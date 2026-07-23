import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { FiUpload } from "react-icons/fi";
import ActionButton from "../../ui/ActionButton.tsx";
import ModalShell, { useModalIds } from "./ModalShell.tsx";
import {
  DEFAULT_ACCEPTED_FILE_TYPES,
  type BulkUploadModalProps,
} from "./types.ts";
import {
  formatAcceptedTypesLabel,
  validateUploadFile,
} from "./fileUtils.ts";

export default function BulkUploadModal({
  isOpen,
  onClose,
  onFileSelect,
  onDownloadTemplate,
  title = "Bulk Upload",
  description = "Upload your employee file or download the sample template to get started.",
  uploadText = "Choose a file or drag & drop it here",
  acceptedFileTypes = [...DEFAULT_ACCEPTED_FILE_TYPES],
  maxFileSizeMB = 5,
  templateButtonLabel = "Download Sample Template",
  isTemplateDownloading = false,
  closeOnBackdropClick = true,
  formatsLabel,
}: BulkUploadModalProps) {
  const { titleId, descriptionId } = useModalIds("bulk-upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragDepth = useRef(0);

  const acceptAttr = acceptedFileTypes.join(",");
  const formatsText =
    formatsLabel ?? formatAcceptedTypesLabel(acceptedFileTypes);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFile = (file: File | undefined | null) => {
    const result = validateUploadFile(file, acceptedFileTypes, maxFileSizeMB);
    if (!result.ok) {
      setError(result.message);
      resetInput();
      return;
    }
    setError(null);
    onFileSelect(file as File);
    resetInput();
  };

  const openFileBrowser = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFileBrowser();
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDownload = async () => {
    if (!onDownloadTemplate) return;
    await onDownloadTemplate();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      descriptionId={descriptionId}
      closeOnBackdropClick={closeOnBackdropClick}
      showCloseButton
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary">
          <FiUpload className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h2
          id={titleId}
          className="text-xl font-bold text-primary sm:text-2xl"
        >
          {title}
        </h2>

        <p
          id={descriptionId}
          className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]"
        >
          {description}
        </p>

        <div
          role="button"
          tabIndex={0}
          aria-label={uploadText}
          onClick={openFileBrowser}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-6 flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 transition outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            isDragging
              ? "border-primary bg-tertiary/70"
              : "border-primary/70 bg-white hover:bg-tertiary/40"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-tertiary">
            <FiUpload className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-primary sm:text-base">
            {uploadText}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF] sm:text-sm">
            {formatsText}
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            Up to {maxFileSizeMB} MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptAttr}
          onChange={(e) => processFile(e.target.files?.[0])}
        />

        {error && (
          <p className="mt-3 w-full text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {onDownloadTemplate && (
          <ActionButton
            variant="outline"
            onClick={handleDownload}
            disabled={isTemplateDownloading}
            className="mt-6 h-11 border-primary px-6 text-primary hover:bg-tertiary"
          >
            {isTemplateDownloading ? "Downloading…" : templateButtonLabel}
          </ActionButton>
        )}
      </div>
    </ModalShell>
  );
}
