import { useMemo, useState } from "react";
import {
  FiPlus,
  FiUpload,
  FiDownload,
  FiFilter,
  FiColumns,
} from "react-icons/fi";
import { toast } from "react-toastify";
import PageHeader from "../../../components/common/PageHeader.js";
import ActionButton from "../../../components/common/ActionButton.js";
import SearchBox from "../../../components/common/SearchBox.js";
import FilterChip from "../../../components/common/FilterChip.js";
import DateRangeDropdown, {
  type DateRangeValue,
} from "../../../components/common/DateRangeDropdown.js";
import SortDropdown from "../../../components/common/SortDropdown.js";
import FilterPanel from "../../../components/common/FilterPanel.js";
import DataTable from "../../../components/tables/DataTable.js";
import ManageColumnsDrawer from "../../../components/drawers/ManageColumnsDrawer.js";
import type { ManageColumnConfig } from "../../../components/drawers/manageColumnsTypes.js";
import type {
  FilterFieldConfig,
  FilterValues,
} from "../../../components/common/dropdownTypes.js";
import {
  BulkUploadModal,
  ConfirmUploadModal,
} from "../../../components/common/Modals/BulkUploadModal/index.js";

/** Employee table column config — source of truth for headers + Manage Columns. */
const EMPLOYEE_COLUMN_CONFIG: ManageColumnConfig[] = [
  { id: "id", label: "Employee ID", pinned: true, defaultVisible: true },
  { id: "name", label: "Name", pinned: true, defaultVisible: true },
  { id: "status", label: "Status", pinned: true, defaultVisible: true },
  { id: "actions", label: "Actions", pinned: true, defaultVisible: true },
  { id: "department", label: "Department", defaultVisible: true },
  { id: "doj", label: "Date of Joining", defaultVisible: true },
  { id: "manager", label: "Reporting Manager", defaultVisible: true },
  { id: "designation", label: "Designation", defaultVisible: true },
];

const DEFAULT_VISIBLE_COLUMN_IDS = EMPLOYEE_COLUMN_CONFIG.filter(
  (c) => c.pinned || c.defaultVisible !== false
).map((c) => c.id);

const EMPTY_FILTERS: FilterValues = {
  status: "",
  department: "",
  manager: "",
  employmentType: "",
};

/** Placeholder options — replace with API-driven lists when wiring data. */
const EMPLOYEE_FILTER_CONFIG: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Account Status",
    placeholder: "All Statuses",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "department",
    label: "Department",
    placeholder: "All Departments",
    options: [],
  },
  {
    key: "manager",
    label: "Reporting Manager",
    placeholder: "All Managers",
    options: [],
  },
  {
    key: "employmentType",
    label: "Employment Type",
    placeholder: "All Types",
    options: [],
  },
];

export default function Employees() {
  const [search, setSearch] = useState("");
  const [goToValue, setGoToValue] = useState("--");
  const [pageSize, setPageSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [dateRange, setDateRange] = useState<DateRangeValue>("today");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterValues>(EMPTY_FILTERS);

  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    DEFAULT_VISIBLE_COLUMN_IDS
  );

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters]
  );

  const visibleColumns = useMemo(
    () =>
      EMPLOYEE_COLUMN_CONFIG.filter((c) => visibleColumnIds.includes(c.id)).map(
        (c) => ({ key: c.id, label: c.label })
      ),
    [visibleColumnIds]
  );

  const handleFilterChange = (key: string, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setDraftFilters(EMPTY_FILTERS);
  };

  const handleFilterApply = () => {
    setAppliedFilters(draftFilters);
    setFilterOpen(false);
  };

  const handleFilterOpen = () => {
    setDraftFilters(appliedFilters);
    setFilterOpen((prev) => !prev);
  };

  const handleBulkUploadClose = () => {
    setBulkUploadOpen(false);
    setConfirmUploadOpen(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setBulkUploadOpen(false);
    setConfirmUploadOpen(true);
  };

  const handleCancelConfirm = () => {
    setConfirmUploadOpen(false);
    setSelectedFile(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setConfirmUploadOpen(false);
    setBulkUploadOpen(true);
  };

  /** Page-owned template download — wire employee API here when available. */
  const handleDownloadTemplate = async () => {
    setIsTemplateDownloading(true);
    try {
      toast.info("Wire employee template download API in this handler.");
    } finally {
      setIsTemplateDownloading(false);
    }
  };

  /** Page-owned upload — wire employee bulk-upload API here when available. */
  const handleConfirmUpload = async (file: File) => {
    setIsUploading(true);
    try {
      void file;
      toast.info("Wire employee bulk upload API in this handler.");
      handleBulkUploadClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
        <PageHeader
          title="All Employees"
          description="View and manage all employee records in one centralized workspace."
          actions={
            <>
              <ActionButton
                icon={<FiUpload className="h-4 w-4" />}
                onClick={() => setBulkUploadOpen(true)}
              >
                Bulk Upload
              </ActionButton>
              <ActionButton icon={<FiDownload className="h-4 w-4" />}>
                Export CSV
              </ActionButton>
              <ActionButton
                variant="primary"
                icon={<FiPlus className="h-4 w-4" />}
              >
                Create New Employee
              </ActionButton>
            </>
          }
        />

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          <SearchBox
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID"
            containerClassName="min-w-[220px]"
          />

          <DateRangeDropdown value={dateRange} onChange={setDateRange} />

          <SortDropdown value={sortBy} onChange={setSortBy} />

          <FilterChip
            icon={<FiFilter className="h-4 w-4 shrink-0 text-[#6B7280]" />}
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
            icon={<FiColumns className="h-4 w-4 shrink-0 text-[#6B7280]" />}
            active={columnsOpen}
            showChevron
            chevronOpen={columnsOpen}
            onClick={() => setColumnsOpen(true)}
            aria-expanded={columnsOpen}
            badge={
              <span className="inline-flex shrink-0 items-center rounded-full bg-tertiary px-2 py-0.5 text-xs font-semibold text-primary">
                {visibleColumnIds.length}/{EMPLOYEE_COLUMN_CONFIG.length}
              </span>
            }
          >
            Columns
          </FilterChip>
        </div>
      </div>

      {filterOpen && (
        <div>
          <FilterPanel
            filters={EMPLOYEE_FILTER_CONFIG}
            values={draftFilters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            onApply={handleFilterApply}
            onClose={() => setFilterOpen(false)}
          />
        </div>
      )}

      <DataTable
        columns={visibleColumns}
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

      <ManageColumnsDrawer
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        title="Manage columns"
        description="Choose which fields appear in the Employees table."
        columns={EMPLOYEE_COLUMN_CONFIG}
        selectedColumnIds={visibleColumnIds}
        onConfirm={setVisibleColumnIds}
      />

      <BulkUploadModal
        isOpen={bulkUploadOpen}
        onClose={handleBulkUploadClose}
        onFileSelect={handleFileSelect}
        onDownloadTemplate={handleDownloadTemplate}
        isTemplateDownloading={isTemplateDownloading}
      />

      <ConfirmUploadModal
        isOpen={confirmUploadOpen}
        file={selectedFile}
        onClose={handleBulkUploadClose}
        onCancel={handleCancelConfirm}
        onRemoveFile={handleRemoveFile}
        onConfirm={handleConfirmUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
