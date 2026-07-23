import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  disableClose?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Lightweight portal modal shell (same pattern as LoginModeModal).
 * No project-wide BaseModal exists; keep backdrop/escape here.
 */
export default function ModalShell({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  closeOnBackdropClick = true,
  showCloseButton = false,
  disableClose = false,
  children,
  className = "",
}: ModalShellProps) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative w-[calc(100vw-32px)] max-w-[540px] rounded-3xl bg-white p-6 shadow-xl sm:p-8 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            aria-label="Close"
            disabled={disableClose}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#6B7280] disabled:opacity-50"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

export function useModalIds(prefix: string) {
  const titleId = useId();
  const descriptionId = useId();
  return {
    titleId: `${prefix}-title-${titleId}`,
    descriptionId: `${prefix}-desc-${descriptionId}`,
  };
}
