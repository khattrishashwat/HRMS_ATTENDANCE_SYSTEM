import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type TablePaginationProps = {
  pageSize?: number;
  totalRecords?: number;
  currentPage?: number;
  totalPages?: number;
  pageNumbers?: Array<number | "...">;
  goToValue?: string;
  onPageSizeChange?: (size: number) => void;
  onPageChange?: (page: number) => void;
  onGoToChange?: (value: string) => void;
  onGoToSubmit?: () => void;
};

/** Enterprise table footer: page size, pages, go-to. */
export default function TablePagination({
  pageSize = 0,
  totalRecords = 0,
  currentPage = 1,
  totalPages = 8,
  pageNumbers = [1, 2, 3, "...", 6, 7, 8],
  goToValue = "--",
  onPageSizeChange,
  onPageChange,
  onGoToChange,
  onGoToSubmit,
}: TablePaginationProps) {
  const totalLabel = String(totalRecords).padStart(2, "0");

  return (
    <div className="flex flex-col gap-4 border-t border-[#F3F4F6] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <span>Showing</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="h-8 rounded-lg border border-[#E5E7EB] bg-white px-2 text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Records per page"
        >
          <option value={0}>0</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span>of {totalLabel} records</span>
      </div>

      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:opacity-40"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[#9CA3AF]">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                item === currentPage
                  ? "bg-tertiary text-primary"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:opacity-40"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <span className="whitespace-nowrap">Go to page:</span>
        <input
          value={goToValue}
          onChange={(e) => onGoToChange?.(e.target.value)}
          className="h-8 w-12 rounded-lg border border-[#E5E7EB] bg-white px-2 text-center text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Go to page"
        />
        <button
          type="button"
          onClick={onGoToSubmit}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Go
        </button>
      </div>
    </div>
  );
}
