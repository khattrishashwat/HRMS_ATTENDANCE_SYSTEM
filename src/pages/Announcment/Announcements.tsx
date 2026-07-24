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

// Column configuration for Announcements
const ANNOUNCEMENT_COLUMN_CONFIG: ManageColumnConfig[] = [
  {
    id: "announcementTitle",
    label: "Announcement Title",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "startDate",
    label: "Start Date",
    pinned: true,
    defaultVisible: true,
  },
  {
    id: "endDate",
    label: "End Date",
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

const DEFAULT_VISIBLE_COLUMN_IDS = ANNOUNCEMENT_COLUMN_CONFIG.filter(
  (column) => column.pinned || column.defaultVisible !== false
).map((column) => column.id);

const EMPTY_FILTERS: FilterValues = {
  audience: "",
  status: "",
};

// Filter configuration for Announcements
const ANNOUNCEMENT_FILTER_CONFIG: FilterFieldConfig[] = [
  {
    key: "audience",
    label: "Audience",
    placeholder: "All Employees",
    options: [
      {
        label: "All Employees",
        value: "all_employees",
      },
      {
        label: "Soundbox Team",
        value: "soundbox",
      },
      {
        label: "Ezycharge Team",
        value: "ezycharge",
      },
      {
        label: "Sales Team",
        value: "sales",
      },
    ],
  },
  {
    key: "status",
    label: "Status",
    placeholder: "All Statuses",
    options: [
      {
        label: "Scheduled",
        value: "scheduled",
      },
      {
        label: "Live",
        value: "live",
      },
      {
        label: "Archived",
        value: "archived",
      },
      {
        label: "Draft",
        value: "draft",
      },
    ],
  },
];

export default function Announcements() {
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
      ANNOUNCEMENT_COLUMN_CONFIG.filter((column) =>
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

  // Placeholder handlers for announcements actions
  const handleExportCSV = () => {
    console.log("Export CSV clicked");
  };

  const handleCreateAnnouncement = () => {
    console.log("Create New Announcement clicked");
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Header + Toolbar */}
      <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
        <PageHeader
          title="Announcements"
          description="Create, manage and schedule company-wide announcements."
          actions={
            <>
              <ActionButton
                variant="primary"
                icon={<FiPlus className="h-4 w-4" />}
                onClick={handleCreateAnnouncement}
              >
                Create New Announcement
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
            placeholder="Search by title"
            containerClassName="min-w-[220px]"
          />

          <DateRangeDropdown
            value={dateRange}
            onChange={(value) => {
              setDateRange(value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {filterOpen && (
        <FilterPanel
          filters={ANNOUNCEMENT_FILTER_CONFIG}
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