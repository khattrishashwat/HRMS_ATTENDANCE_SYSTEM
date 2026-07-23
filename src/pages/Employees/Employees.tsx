import { useMemo, useState } from "react";
import {
  FiPlus,
  FiUpload,
  FiDownload,
  FiFilter,
  FiColumns,
} from "react-icons/fi";
import { toast } from "react-toastify";
import PageHeader from "../../components/common/ui/PageHeader.tsx";
import ActionButton from "../../components/common/ui/ActionButton.tsx";
import SearchBox from "../../components/common/ui/SearchBox.tsx";
import FilterChip from "../../components/common/ui/FilterChip.tsx";
import DateRangeDropdown, {
  type DateRangeValue,
} from "../../components/common/ui/DateRangeDropdown.tsx";
import SortDropdown from "../../components/common/ui/SortDropdown.tsx";
import FilterPanel from "../../components/common/ui/FilterPanel.tsx";
import DataTable from "../../components/common/ui/DataTable.tsx";
import type {
  FilterFieldConfig,
  FilterValues,
} from "../../components/common/ui/dropdownTypes.ts";
import {
  BulkUploadModal,
  ConfirmUploadModal,
} from "../../components/common/modals/BulkUploadModal";

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
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(EMPTY_FILTERS);

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters]
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
      // Example (do not call from modal):
      // const formData = new FormData();
      // formData.append("file", file);
      // await employeeService.bulkUpload(formData);
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
            showChevron
            badge={
              <span className="inline-flex shrink-0 items-center rounded-full bg-tertiary px-2 py-0.5 text-xs font-semibold text-primary">
                7/12
              </span>
            }
          >
            Columns
          </FilterChip>
        </div>

       
      </div>
 {filterOpen && (
          <div className="mt-4">
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
