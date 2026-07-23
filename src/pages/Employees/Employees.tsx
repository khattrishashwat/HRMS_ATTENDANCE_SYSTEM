import { useState } from "react";
import {
  FiPlus,
  FiUpload,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiCalendar,
  FiColumns,
} from "react-icons/fi";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import PageHeader from "../../components/common/ui/PageHeader.tsx";
import ActionButton from "../../components/common/ui/ActionButton.tsx";
import SearchBox from "../../components/common/ui/SearchBox.tsx";
import FilterChip from "../../components/common/ui/FilterChip.tsx";
import DataTable from "../../components/common/ui/DataTable.tsx";

const EMPLOYEE_COLUMNS = [
  { key: "id", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "doj", label: "Date of Joining" },
  { key: "manager", label: "Reporting Manager" },
  { key: "designation", label: "Designation" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

/**
 * All Employees list — Outlet content only (no app shell).
 * Matches reference: page header, toolbar chips, empty data table + pagination.
 */
export default function Employees() {
  const [search, setSearch] = useState("");
  const [goToValue, setGoToValue] = useState("--");
  const [pageSize, setPageSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <PageHeader
        title="All Employees"
        description="View and manage all employee records in one centralized workspace."
        actions={
          <>
            <ActionButton icon={<FiUpload className="h-4 w-4" />}>Bulk Upload</ActionButton>
            <ActionButton icon={<FiDownload className="h-4 w-4" />}>Export CSV</ActionButton>
            <ActionButton variant="primary" icon={<FiPlus className="h-4 w-4" />}>
              Create New Employee
            </ActionButton>
          </>
        }
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        <SearchBox
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID"
          containerClassName="min-w-[220px]"
        />
        <FilterChip icon={<FiFilter className="h-4 w-4 text-[#6B7280]" />}>Filter</FilterChip>
        <FilterChip icon={<HiOutlineArrowsUpDown className="h-4 w-4 text-[#6B7280]" />}>
          Sort
        </FilterChip>
        <FilterChip icon={<FiCalendar className="h-4 w-4 text-[#6B7280]" />}>
          Select date range
        </FilterChip>
        <FilterChip
          icon={<FiColumns className="h-4 w-4 text-[#6B7280]" />}
          badge={
            <span className="inline-flex items-center rounded-full bg-tertiary px-2 py-0.5 text-xs font-semibold text-primary">
              7/12
            </span>
          }
        >
          Columns
          <FiChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden />
        </FilterChip>
      </div>

      <DataTable
        columns={EMPLOYEE_COLUMNS}
        empty
        pagination={{
          pageSize,
          totalRecords: 0,
          currentPage,
          totalPages: 8,
          pageNumbers: [1, 2, 3, "...", 6, 7, 8],
          goToValue,
          onPageSizeChange: setPageSize,
          onPageChange: setCurrentPage,
          onGoToChange: setGoToValue,
          onGoToSubmit: () => {
            const page = Number(goToValue);
            if (!Number.isNaN(page) && page >= 1) setCurrentPage(page);
          },
        }}
      />
    </div>
  );
}
