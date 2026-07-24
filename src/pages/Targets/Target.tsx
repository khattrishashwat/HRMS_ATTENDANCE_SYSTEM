import { useMemo, useState } from "react";
import { FiColumns, FiFilter, FiPlus, FiDownload } from "react-icons/fi";

import PageHeader from "../../components/common/PageHeader.tsx";
import ActionButton from "../../components/common/ActionButton.tsx";
import SearchBox from "../../components/common/SearchBox.tsx";
import FilterChip from "../../components/common/FilterChip.tsx";
import DateRangeDropdown, {
  type DateRangeValue,
} from "../../components/common/DateRangeDropdown.tsx";
import SortDropdown from "../../components/common/SortDropdown.tsx";
import FilterPanel from "../../components/common/FilterPanel.tsx";
import DataTable from "../../components/tables/DataTable.tsx";

import type {
  FilterFieldConfig,
  FilterValues,
} from "../../../components/common/dropdownTypes.tsx";

const TARGET_COLUMN_CONFIG: ManageColumnConfig[] = [
  {
    id: "targetCategory",
    label: "Target Category",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "duration",
    label: "Duration",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "assignedTo",
    label: "Assigned to",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "startDate",
    label: "Start Date",
    defaultVisible: true,
  },
  {
    id: "endDate",
    label: "End Date",
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

const DEFAULT_VISIBLE_COLUMN_IDS = TARGET_COLUMN_CONFIG.filter(
  (column) => column.pinned || column.defaultVisible !== false
).map((column) => column.id);

const EMPTY_FILTERS: FilterValues = {
  status: "",
  targetCategory: "",
  assignedTo: "",
};

const TARGET_FILTER_CONFIG: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    placeholder: "All Statuses",
    options: [
      {
        label: "Assigned",
        value: "assigned",
      },
      {
        label: "In Progress",
        value: "in_progress",
      },
      {
        label: "Completed",
        value: "completed",
      },
      {
        label: "Expired",
        value: "expired",
      },
    ],
  },
  {
    key: "targetCategory",
    label: "Target Category",
    placeholder: "All Categories",
    options: [
      {
        label: "Soundbox",
        value: "soundbox",
      },
      {
        label: "Ezycharge",
        value: "ezycharge",
      },
      {
        label: "Sales",
        value: "sales",
      },
    ],
  },
  {
    key: "assignedTo",
    label: "Assigned To",
    placeholder: "All Employees",
    options: [
      {
        label: "Harshit Trivedi",
        value: "harshit_trivedi",
      },
      {
        label: "John Doe",
        value: "john_doe",
      },
    ],
  },
];

export default function AssignedTargets() {
  const [search, setSearch] = useState("");

  const [goToValue, setGoToValue] = useState("--");
  const [pageSize, setPageSize] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

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
      TARGET_COLUMN_CONFIG.filter((column) =>
        visibleColumnIds.includes(column.id)
      ).map((column) => ({
        key: column.id,
        label: column.label,
      })),
    [visibleColumnIds]
  );

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

    if (!Number.isNaN(page) && page >= 1 && page <= 8) {
      setCurrentPage(page);
    }
  };

  // Placeholder handlers for new actions
  const handleExportCSV = () => {
    console.log("Export CSV clicked");
  };

  const handleAssignTarget = () => {
    console.log("Assign Target clicked");
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Header + Toolbar */}
      <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
        <PageHeader
          title="Assigned Targets"
          description="Track assigned targets, monitor progress, and review completion status across the organization."
          actions={
            <>
              <ActionButton
                icon={<FiDownload className="h-4 w-4" />}
                onClick={handleExportCSV}
              >
                Export CSV
              </ActionButton>
              <ActionButton
                variant="primary"
                icon={<FiPlus className="h-4 w-4" />}
                onClick={handleAssignTarget}
              >
                Assign Target
              </ActionButton>
            </>
          }
        />

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          <SearchBox
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by target category"
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

        </div>
      </div>

      {filterOpen && (
        <FilterPanel
          filters={TARGET_FILTER_CONFIG}
          values={draftFilters}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
          onApply={handleFilterApply}
          onClose={() => setFilterOpen(false)}
        />
      )}

      <DataTable
        columns={visibleColumns}
        empty
        pagination={{
          pageSize,
          totalRecords: 80,
          currentPage,
          totalPages: 8,
          pageNumbers: [1, 2, 3, "...", 6, 7, 8],
          goToValue,

          onPageSizeChange: (value) => {
            setPageSize(value);
            setCurrentPage(1);
          },

          onPageChange: setCurrentPage,

          onGoToChange: setGoToValue,

          onGoToSubmit: handleGoToPage,
        }}
      />

    </div>
  );
}