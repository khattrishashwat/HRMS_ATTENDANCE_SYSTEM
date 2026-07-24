import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider modals for denser forms (default ~540px). */
  size?: "md" | "lg";
  disableClose?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
};

/**
 * Shared modal shell for common/Modals compositions.
 * Handles overlay, Escape, backdrop, title/close, scrollable body, footer.
 */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  disableClose = false,
  closeOnBackdropClick = true,
  className = "",
}: BaseModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !disableClose) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, disableClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!closeOnBackdropClick || disableClose) return;
    onClose();
  };

  const maxWidth = size === "lg" ? "max-w-[560px]" : "max-w-[520px]";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[min(900px,calc(100vh-32px))] w-[calc(100vw-32px)] ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <h2
            id={titleId}
            className="pr-3 text-lg font-semibold text-primary sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            disabled={disableClose}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#6B7280] disabled:opacity-50"
          >
            <FiX className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
