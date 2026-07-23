import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { DropdownOption } from "./dropdownTypes.ts";

type DropdownMenuProps<T extends string> = {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Trigger element (typically a FilterChip). Receives open state. */
  trigger: (ctx: { open: boolean; toggle: () => void }) => ReactNode;
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
  "aria-label"?: string;
};

/**
 * Shared option menu used by DateRangeDropdown / SortDropdown.
 * Portals to document.body so lists are not clipped by overflow wrappers.
 */
export default function DropdownMenu<T extends string>({
  options,
  value,
  onChange,
  trigger,
  align = "left",
  className = "",
  menuClassName = "",
  "aria-label": ariaLabel = "Options",
}: DropdownMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 200);
    let left = align === "right" ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);
    setCoords({
      top: rect.bottom + 6,
      left,
      width: menuWidth,
    });
  }, [align]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) updatePosition();
      return next;
    });
  };

  const close = () => setOpen(false);

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

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    close();
  };

  return (
    <div ref={triggerRef} className={`relative inline-flex shrink-0 ${className}`}>
      {trigger({ open, toggle })}

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              maxWidth: `min(320px, calc(100vw - 16px))`,
            }}
            className={`z-[1000] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg ${menuClassName}`}
          >
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm whitespace-nowrap transition-colors ${
                    selected
                      ? "bg-primary text-white"
                      : "text-[#4B5563] hover:bg-[#F5F3FF]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
