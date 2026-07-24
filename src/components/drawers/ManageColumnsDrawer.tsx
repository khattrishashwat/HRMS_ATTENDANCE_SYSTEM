import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiSearch, FiX } from "react-icons/fi";
import { Pin } from "lucide-react";
import ActionButton from "../common/ActionButton.tsx";
import type { ManageColumnsDrawerProps } from "./manageColumnsTypes.ts";

function getDefaultSelectedIds(
  columns: ManageColumnsDrawerProps["columns"]
): string[] {
  return columns
    .filter((col) => col.pinned || col.defaultVisible !== false)
    .map((col) => col.id);
}

/**
 * Reusable right-side Manage Columns drawer.
 * Temporary selection until Confirm; close discards drafts.
 */
export default function ManageColumnsDrawer({
  open,
  onClose,
  title = "Manage columns",
  description = "Choose which fields appear in the table.",
  columns,
  selectedColumnIds,
  onConfirm,
  searchPlaceholder = "Search Column",
}: ManageColumnsDrawerProps) {
  const [draftIds, setDraftIds] = useState<string[]>(selectedColumnIds);
  const [search, setSearch] = useState("");
  /** Prevents the Columns click that opens the drawer from also hitting the overlay. */
  const allowOverlayCloseRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectedColumnIds);
    setSearch("");
  }, [open, selectedColumnIds]);

  useEffect(() => {
    if (!open) {
      allowOverlayCloseRef.current = false;
      return;
    }

    // Defer overlay close until after the opening click/mouseup finishes,
    // otherwise the same user gesture can hit the new full-screen overlay
    // and immediately call onClose (drawer appears to never open).
    allowOverlayCloseRef.current = false;
    const enableCloseTimer = window.setTimeout(() => {
      allowOverlayCloseRef.current = true;
    }, 100);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(enableCloseTimer);
      allowOverlayCloseRef.current = false;
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const pinnedIds = useMemo(
    () => new Set(columns.filter((c) => c.pinned).map((c) => c.id)),
    [columns]
  );

  const filteredColumns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter((c) => c.label.toLowerCase().includes(q));
  }, [columns, search]);

  const visibleCount = draftIds.length;
  const totalCount = columns.length;

  const toggleColumn = (id: string) => {
    if (pinnedIds.has(id)) return;
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    const defaults = getDefaultSelectedIds(columns);
    const withPinned = Array.from(
      new Set([...defaults, ...Array.from(pinnedIds)])
    );
    setDraftIds(withPinned);
  };

  const handleConfirm = () => {
    const withPinned = Array.from(
      new Set([...draftIds, ...Array.from(pinnedIds)])
    );
    const ordered = columns
      .filter((c) => withPinned.includes(c.id))
      .map((c) => c.id);
    onConfirm(ordered);
    onClose();
  };

  const handleOverlayClose = () => {
    if (!allowOverlayCloseRef.current) return;
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          key="manage-columns-drawer"
          className="fixed inset-0 z-[9999] flex justify-end"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Close columns panel"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-columns-title"
            className="relative z-10 flex h-full w-[min(100%,400px)] flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#E5E7EB] px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="manage-columns-title"
                    className="text-lg font-bold text-primary"
                  >
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
                  <span className="mt-3 inline-flex rounded-full bg-tertiary px-2.5 py-1 text-xs font-semibold text-primary">
                    {visibleCount} of {totalCount} visible
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F9FAFB] hover:text-[#6B7280]"
                >
                  <FiX className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
              <div className="relative mb-3">
                <FiSearch
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 w-full rounded-full border border-[#E5E7EB] bg-white pr-4 pl-10 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pb-4">
                {filteredColumns.map((col) => {
                  const checked = draftIds.includes(col.id);
                  const pinned = !!col.pinned;

                  return (
                    <li key={col.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#F9FAFB] ${
                          pinned ? "cursor-default" : ""
                        }`}
                      >
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={checked}
                            disabled={pinned}
                            onChange={() => toggleColumn(col.id)}
                          />
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                              pinned
                                ? "border-[#D1D5DB] bg-[#E5E7EB] text-[#9CA3AF]"
                                : checked
                                  ? "border-primary bg-primary text-white"
                                  : "border-primary bg-white"
                            }`}
                            aria-hidden
                          >
                            {checked ? <FiCheck className="h-3.5 w-3.5" /> : null}
                          </span>
                        </span>

                        <span
                          className={`min-w-0 flex-1 truncate text-sm font-medium ${
                            pinned ? "text-[#9CA3AF]" : "text-[#111827]"
                          }`}
                        >
                          {col.label}
                        </span>

                        {pinned ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tertiary px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <Pin className="h-3 w-3" aria-hidden />
                            Pinned
                          </span>
                        ) : null}
                      </label>
                    </li>
                  );
                })}

                {filteredColumns.length === 0 ? (
                  <li className="px-2 py-6 text-center text-sm text-[#9CA3AF]">
                    No columns match your search.
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-white px-5 py-4">
              <ActionButton
                variant="outline"
                onClick={handleReset}
                className="border-primary text-primary hover:bg-tertiary"
              >
                Reset to default
              </ActionButton>
              <ActionButton variant="primary" onClick={handleConfirm}>
                Confirm
              </ActionButton>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
