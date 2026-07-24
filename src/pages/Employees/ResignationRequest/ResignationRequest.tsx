import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiColumns, FiEye, FiFilter } from "react-icons/fi";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

import PageHeader from "../../../components/common/PageHeader.tsx";
import SearchBox from "../../../components/common/SearchBox.tsx";
import FilterChip from "../../../components/common/FilterChip.tsx";
import DateRangeDropdown, {
  type DateRangeValue,
} from "../../../components/common/DateRangeDropdown.tsx";
import SortDropdown from "../../../components/common/SortDropdown.tsx";
import FilterPanel from "../../../components/common/FilterPanel.tsx";
import DataTable from "../../../components/tables/DataTable.tsx";
import ManageColumnsDrawer from "../../../components/drawers/ManageColumnsDrawer.tsx";
import StatusBadge from "../../../components/common/StatusBadge.tsx";
import ActionMenu from "../../../components/common/ActionMenu.tsx";

import type { ManageColumnConfig } from "../../../components/drawers/manageColumnsTypes.ts";
import type {
  FilterFieldConfig,
  FilterValues,
} from "../../../components/common/dropdownTypes.ts";
import useDebounce from "../../../hooks/useDebounce.ts";
import {
  getResignationRequests,
  type ResignationRequestItem,
} from "../../../servicesAPI/resignationApi.ts";
import {
  buildPageNumbers,
  extractDepartment,
  formatResignationDate,
} from "./resignationHelpers.ts";

const RESIGNATION_COLUMN_CONFIG: ManageColumnConfig[] = [
  {
    id: "employeeId",
    label: "Employee ID",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "name",
    label: "Name",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "department",
    label: "Department",
    defaultVisible: true,
  },
  {
    id: "resignationDate",
    label: "Resignation Date",
    defaultVisible: true,
  },
  {
    id: "lastWorkingDay",
    label: "Last Working Day",
    defaultVisible: true,
  },
  {
    id: "status",
    label: "Status",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "actions",
    label: "Actions",
    pinned: true,
    defaultVisible: true,
  },
];

const DEFAULT_VISIBLE_COLUMN_IDS = RESIGNATION_COLUMN_CONFIG.filter(
  (column) => column.pinned || column.defaultVisible !== false
).map((column) => column.id);

const EMPTY_FILTERS: FilterValues = {
  status: "",
  department: "",
};

const RESIGNATION_FILTER_CONFIG: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    placeholder: "All Statuses",
    options: [
      {
        label: "Approved",
        value: "approved",
      },
      {
        label: "Rejected",
        value: "rejected",
      },
      {
        label: "Withdrawn",
        value: "withdrawn",
      },
      {
        label: "On Hold",
        value: "on_hold",
      },
    ],
  },
  {
    key: "department",
    label: "Department",
    placeholder: "All Departments",
    options: [
      {
        label: "Sales",
        value: "sales",
      },
    ],
  },
];

const CELL_CLASS =
  "whitespace-nowrap px-4 py-3 text-sm text-[#111827] sm:px-5";

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return (
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    "Failed to fetch resignation requests"
  );
}

export default function ResignationRequests() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [goToValue, setGoToValue] = useState("--");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [resignations, setResignations] = useState<ResignationRequestItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [dateRange, setDateRange] = useState<DateRangeValue>("today");
  const [sortBy, setSortBy] = useState("date_desc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<FilterValues>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterValues>(EMPTY_FILTERS);

  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    DEFAULT_VISIBLE_COLUMN_IDS
  );

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters]
  );

  const visibleColumns = useMemo(
    () =>
      RESIGNATION_COLUMN_CONFIG.filter((column) =>
        visibleColumnIds.includes(column.id)
      ).map((column) => ({
        key: column.id,
        label: column.label,
      })),
    [visibleColumnIds]
  );

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const fetchResignations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getResignationRequests({
        pageNumber: currentPage - 1,
        pageSize,
        searchText: debouncedSearch.trim() || undefined,
      });

      setResignations(result.data);
      setTotalRecords(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (error) {
      setResignations([]);
      setTotalRecords(0);
      setTotalPages(0);
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    void fetchResignations();
  }, [fetchResignations]);

  const handleFilterChange = (key: string, value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFilterReset = () => {
    setDraftFilters(EMPTY_FILTERS);
  };

  const handleFilterApply = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const handleFilterOpen = () => {
    setDraftFilters(appliedFilters);
    setFilterOpen((prev) => !prev);
  };

  const handleGoToPage = () => {
    const page = Number(goToValue);

    if (
      !Number.isNaN(page) &&
      page >= 1 &&
      totalPages > 0 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  const handleView = (resignationRequestId: number) => {
    navigate(`/resignationRequest/details`, { state: { resignationRequestId } });
  };

  const renderCell = (columnKey: string, item: ResignationRequestItem) => {
    switch (columnKey) {
      case "employeeId":
        return item.employeeCode || "-";
      case "name":
        return item.employeeName || "-";
      case "department":
        return extractDepartment(item.employeeSnapshot);
      case "resignationDate":
        return formatResignationDate(item.resignationDate);
      case "lastWorkingDay":
        return formatResignationDate(
          item.managerActionLWD ?? item.preferredLastWorkingDay
        );
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <ActionMenu
            actions={[
              {
                key: "view",
                label: "View",
                icon: <FiEye />,
                onClick: () => handleView(item.resignationRequestId),
              },
            ]}
          />
        );
      default:
        return "-";
    }
  };

  const isEmpty = !loading && resignations.length === 0;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Header + Toolbar */}
      <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
        <PageHeader
          title="Resignation Requests"
          description="View and manage all employee resignation requests"
        />

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          <SearchBox
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by employee ID or name"
            containerClassName="min-w-[220px]"
          />

          <DateRangeDropdown
            value={dateRange}
            onChange={(value) => {
              setDateRange(value);
              setCurrentPage(1);
            }}
          />

          <SortDropdown
            value={sortBy}
            onChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
          />

          <FilterChip
            icon={
              <FiFilter className="h-4 w-4 shrink-0 text-[#6B7280]" />
            }
            active={filterOpen}
            showChevron
            chevronOpen={filterOpen}
            onClick={handleFilterOpen}
            aria-expanded={filterOpen}
            badge={
              activeFilterCount > 0 ? (
                <span className="inline-flex shrink-0 items-center rounded-full bg-tertiary px-2 py-0.5 text-xs font-semibold text-primary">
                  {activeFilterCount}
                </span>
              ) : undefined
            }
          >
            Filter
          </FilterChip>

          <FilterChip
            icon={
              <FiColumns className="h-4 w-4 shrink-0 text-[#6B7280]" />
            }
            active={columnsOpen}
            showChevron
            chevronOpen={columnsOpen}
            onClick={() => setColumnsOpen(true)}
            aria-expanded={columnsOpen}
            badge={
              <span className="inline-flex shrink-0 items-center rounded-full bg-tertiary px-2 py-0.5 text-xs font-semibold text-primary">
                {visibleColumnIds.length}/
                {RESIGNATION_COLUMN_CONFIG.length}
              </span>
            }
          >
            Columns
          </FilterChip>
        </div>
      </div>

      {filterOpen && (
        <FilterPanel
          filters={RESIGNATION_FILTER_CONFIG}
          values={draftFilters}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
          onApply={handleFilterApply}
          onClose={() => setFilterOpen(false)}
        />
      )}

      <DataTable
        columns={visibleColumns}
        empty={isEmpty}
        pagination={{
          pageSize,
          totalRecords,
          currentPage,
          totalPages: Math.max(totalPages, 1),
          pageNumbers:
            totalPages > 0 ? pageNumbers : [1],
          goToValue,
          onPageSizeChange: (value) => {
            setPageSize(value);
            setCurrentPage(1);
          },
          onPageChange: setCurrentPage,
          onGoToChange: setGoToValue,
          onGoToSubmit: handleGoToPage,
        }}
      >
        {loading ? (
          <tr>
            <td
              colSpan={Math.max(visibleColumns.length, 1)}
              className="px-4 py-10 text-center text-sm text-[#6B7280] sm:px-5"
            >
              Loading resignation requests…
            </td>
          </tr>
        ) : (
          resignations.map((item) => (
            <tr
              key={item.resignationRequestId}
              className="border-t border-[#F3F4F6] transition hover:bg-[#F9FAFB]"
            >
              {visibleColumns.map((column) => (
                <td key={column.key} className={CELL_CLASS}>
                  {renderCell(column.key, item)}
                </td>
              ))}
            </tr>
          ))
        )}
      </DataTable>

      <ManageColumnsDrawer
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        title="Manage columns"
        description="Choose which fields appear in the Resignation Requests table."
        columns={RESIGNATION_COLUMN_CONFIG}
        selectedColumnIds={visibleColumnIds}
        onConfirm={setVisibleColumnIds}
      />
    </div>
  );
}
