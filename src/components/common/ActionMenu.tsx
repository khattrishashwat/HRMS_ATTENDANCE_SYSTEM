import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical } from "react-icons/fi";

export type ActionMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** When true, the action is omitted from the menu (e.g. no permission). */
  hidden?: boolean;
};

type ActionMenuProps = {
  actions: ActionMenuItem[];
  align?: "left" | "right";
  /** Accessible name for the three-dot trigger. */
  "aria-label"?: string;
  className?: string;
  menuClassName?: string;
};

const MENU_MIN_WIDTH = 160;
const MENU_ESTIMATED_ITEM_HEIGHT = 40;
const VIEWPORT_PAD = 8;

/**
 * Global reusable row Action Menu (⋮).
 * Pages pass allowed actions; this component owns trigger, portal menu, and styling.
 */
export default function ActionMenu({
  actions,
  align = "right",
  "aria-label": ariaLabel = "More actions",
  className = "",
  menuClassName = "",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const visibleActions = actions.filter((action) => !action.hidden);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const menuWidth = MENU_MIN_WIDTH;
    let left = align === "right" ? rect.right - menuWidth : rect.left;
    left = Math.min(
      Math.max(VIEWPORT_PAD, left),
      window.innerWidth - menuWidth - VIEWPORT_PAD
    );

    const estimatedHeight =
      Math.max(visibleActions.length, 1) * MENU_ESTIMATED_ITEM_HEIGHT + 8;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;
    const top = openUpward
      ? Math.max(VIEWPORT_PAD, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;

    setCoords({ top, left, width: menuWidth });
  }, [align, visibleActions.length]);

  const close = () => setOpen(false);

  const toggle = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    setOpen((prev) => {
      const next = !prev;
      if (next) updatePosition();
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onReposition = () => updatePosition();

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePosition]);

  const handleAction = (action: ActionMenuItem) => {
    if (action.disabled) return;
    action.onClick();
    close();
  };

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex shrink-0 ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
          open ? "bg-[#F3F4F6] text-[#111827]" : ""
        }`}
      >
        <FiMoreVertical className="h-4 w-4" aria-hidden />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              maxWidth: `min(240px, calc(100vw - 16px))`,
            }}
            className={`z-[1000] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg ${menuClassName}`}
          >
            {visibleActions.map((action) => (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  handleAction(action);
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  action.disabled
                    ? "cursor-not-allowed text-[#9CA3AF]"
                    : "text-[#374151] hover:bg-[#F5F3FF]"
                }`}
              >
                {action.icon ? (
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#6B7280] [&>svg]:h-4 [&>svg]:w-4">
                    {action.icon}
                  </span>
                ) : null}
                <span>{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
