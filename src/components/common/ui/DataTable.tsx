import type { ReactNode } from "react";
import EmptyState from "./EmptyState.tsx";
import TablePagination from "./TablePagination.tsx";

export type DataTableColumn = {
  key: string;
  label: string;
  className?: string;
};

type DataTableProps = {
  columns: DataTableColumn[];
  children?: ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: React.ComponentProps<typeof TablePagination>;
};

/** Reusable bordered data table with empty state + pagination footer. */
export default function DataTable({
  columns,
  children,
  empty = false,
  emptyTitle,
  emptyDescription,
  pagination,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#F9FAFB]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold tracking-wide text-[#4B5563] sm:px-5 sm:text-sm ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          {!empty ? <tbody>{children}</tbody> : null}
        </table>
      </div>

      {empty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {pagination ? <TablePagination {...pagination} /> : null}
    </div>
  );
}
