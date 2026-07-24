import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CirclePause,
  CircleX,
  Clock3,
  FileText,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

import ApproveResignationModal, {
  type ApproveResignationFormData,
} from "../../../components/common/Modals/ResignationModals/ApproveResignationModal.tsx";
import RejectResignationModal, {
  type RejectResignationFormData,
} from "../../../components/common/Modals/ResignationModals/RejectResignationModal.tsx";
import PutResignationOnHoldModal, {
  type PutResignationOnHoldFormData,
} from "../../../components/common/Modals/ResignationModals/PutResignationOnHoldModal.tsx";
import EditLastWorkingDayModal, {
  type EditLastWorkingDayFormData,
} from "../../../components/common/Modals/ResignationModals/EditLastWorkingDayModal.tsx";
import {
  approveResignation,
  getResignationMasterOptions,
  getResignationRequestById,
  putResignationOnHold,
  rejectResignation,
  updateLastWorkingDay,
  type ResignationReasonOption,
  type ResignationRequestItem,
} from "../../../servicesAPI/resignationApi.ts";
import {
  extractDesignation,
  formatResignationDate,
} from "./resignationHelpers.ts";

type ResignationModal = "approve" | "reject" | "hold" | "editLwd" | null;

interface AssetItem {
  name: string;
  status: "Returned" | "Pending" | "N/A";
}

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return (
    axiosError?.response?.data?.message ||
    (error instanceof Error ? error.message : undefined) ||
    fallback
  );
}

const ViewResignationRequest: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const resignationRequestId = useMemo(() => {
    const fromState = (
      location.state as { resignationRequestId?: number } | null
    )?.resignationRequestId;
    return typeof fromState === "number" ? fromState : null;
  }, [location.state]);

  const [resignationData, setResignationData] =
    useState<ResignationRequestItem | null>(null);
  const [rejectReasonOptions, setRejectReasonOptions] = useState<
    ResignationReasonOption[]
  >([]);
  const [holdReasonOptions, setHoldReasonOptions] = useState<
    ResignationReasonOption[]
  >([]);
  const [activeModal, setActiveModal] = useState<ResignationModal>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assets: AssetItem[] = [
    {
      name: "Dell Latitude 5440",
      status: "Pending",
    },
    {
      name: "Logitech M650 Mouse",
      status: "Returned",
    },
    {
      name: "ID Card",
      status: "Returned",
    },
    {
      name: "Access Card",
      status: "Returned",
    },
  ];

  const fetchDetails = useCallback(async () => {
    if (!resignationRequestId) return;
    try {
      const details = await getResignationRequestById(resignationRequestId);
      setResignationData(details);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to fetch resignation details")
      );
    }
  }, [resignationRequestId]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    const loadMasterOptions = async () => {
      try {
        const options = await getResignationMasterOptions();
        setRejectReasonOptions(options.rejectReasons);
        setHoldReasonOptions(options.holdReasons);
      } catch {
        // Reason dropdowns stay empty until master data is available.
      }
    };

    void loadMasterOptions();
  }, []);

  const employeeName =
    resignationData?.employeeName?.trim() || "Priya Mehta";
  const employeeCode = resignationData?.employeeCode?.trim() || "EMP001";
  const designation = extractDesignation(resignationData?.employeeSnapshot);
  const lastWorkingDayRaw =
    resignationData?.managerActionLWD ??
    resignationData?.preferredLastWorkingDay ??
    null;
  const formattedLastWorkingDay = formatResignationDate(lastWorkingDayRaw);

  const closeModal = () => {
    if (isSubmitting) return;
    setActiveModal(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditLastWorkingDay = () => {
    setActiveModal("editLwd");
  };

  const handlePutOnHold = () => {
    setActiveModal("hold");
  };

  const handleReject = () => {
    setActiveModal("reject");
  };

  const handleApprove = () => {
    setActiveModal("approve");
  };

  const handleReturnAsset = (asset: AssetItem) => {
    console.log("Return Asset:", asset);
  };

  const requireRequestId = (): number | null => {
    if (!resignationRequestId) {
      toast.error("Resignation request id is missing.");
      return null;
    }
    return resignationRequestId;
  };

  const handleApproveSubmit = async (formData: ApproveResignationFormData) => {
    const id = requireRequestId();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const message = await approveResignation({
        resignationRequestId: id,
        remarks: formData.comments,
      });
      toast.success(message);
      setActiveModal(null);
      await fetchDetails();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to approve resignation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (formData: RejectResignationFormData) => {
    const id = requireRequestId();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const message = await rejectResignation({
        resignationRequestId: id,
        reason: formData.reason,
        remarks: formData.comments,
      });
      toast.success(message);
      setActiveModal(null);
      await fetchDetails();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reject resignation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePutOnHoldSubmit = async (
    formData: PutResignationOnHoldFormData
  ) => {
    const id = requireRequestId();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const message = await putResignationOnHold({
        resignationRequestId: id,
        reason: formData.reason,
        followUpDate: formData.followUpDate,
        remarks: "",
      });
      toast.success(message);
      setActiveModal(null);
      await fetchDetails();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to put resignation on hold")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLwdSubmit = async (formData: EditLastWorkingDayFormData) => {
    const id = requireRequestId();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const message = await updateLastWorkingDay({
        resignationRequestId: id,
        newLastWorkingDate: formData.newLastWorkingDate,
        remarks: formData.reason,
      });
      toast.success(message);
      setActiveModal(null);
      await fetchDetails();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update last working day")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1536px]">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <section className="mb-7 rounded-[18px] bg-white px-6 py-5 md:px-7 md:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#666487] transition hover:text-[#211A55]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />

                <span>Back to Resignation Request</span>
              </button>

              <h1 className="text-[25px] font-semibold leading-none tracking-[-0.4px] text-[#181145] md:text-[28px]">
                Resignation Request Detail
              </h1>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleEditLastWorkingDay}
                className="
                  flex h-[48px] items-center justify-center gap-2
                  rounded-full
                  border border-[#514D79]
                  bg-white
                  px-5
                  text-[14px] font-medium
                  text-[#555276]
                  transition
                  hover:bg-[#F8F8FC]
                "
              >
                <Pencil className="h-[18px] w-[18px]" strokeWidth={1.8} />

                <span>Edit Last Working Day</span>
              </button>

              <button
                type="button"
                onClick={handlePutOnHold}
                className="
                  flex h-[48px] items-center justify-center gap-2
                  rounded-full
                  border border-[#E18A00]
                  bg-[#FFF8EB]
                  px-5
                  text-[14px] font-medium
                  text-[#DF7D00]
                  transition
                  hover:bg-[#FFF2D9]
                "
              >
                <CirclePause
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />

                <span>Put on Hold</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="
                  flex h-[48px] items-center justify-center gap-2
                  rounded-full
                  bg-[#D9272E]
                  px-5
                  text-[14px] font-medium
                  text-white
                  transition
                  hover:bg-[#C51E25]
                "
              >
                <CircleX className="h-[18px] w-[18px]" strokeWidth={1.8} />

                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="
                  flex h-[48px] items-center justify-center gap-2
                  rounded-full
                  bg-[#13A366]
                  px-5
                  text-[14px] font-medium
                  text-white
                  transition
                  hover:bg-[#0D9159]
                "
              >
                <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full border border-white">
                  <Check className="h-3 w-3" strokeWidth={2} />
                </span>

                <span>Approve</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================
            STATUS TIMELINE
        ========================================================= */}
        <section className="mb-6 rounded-[18px] bg-white px-7 py-7 md:px-8 md:py-8">
          <SectionTitle>Status Timeline</SectionTitle>

          <div className="mt-8 px-0 md:px-[85px]">
            {/* Desktop timeline */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Base line */}
                <div className="absolute left-[18px] right-[18px] top-[20px] h-[7px] bg-[#6170F7]" />

                {/* Steps */}
                <div className="relative z-10 grid grid-cols-3">
                  {/* Step 1 */}
                  <div className="flex flex-col items-start">
                    <TimelineCompletedIcon />

                    <div className="-ml-[77px] mt-5 w-[190px] text-center">
                      <p className="text-[17px] font-medium text-[#211A55]">
                        Employee Submitted
                      </p>

                      <p className="mt-2 text-[12px] font-normal text-[#999999]">
                        01 Apr 2026
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <TimelineCompletedIcon />

                    <div className="mt-5 text-center">
                      <p className="text-[17px] font-medium text-[#211A55]">
                        Manager Approval
                      </p>

                      <p className="mt-2 text-[12px] font-normal text-[#999999]">
                        02 Apr 2026
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-end">
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#6170F7] text-white">
                      <Clock3 className="h-[20px] w-[20px]" strokeWidth={1.8} />
                    </div>

                    <div className="-mr-[54px] mt-5 w-[150px] text-center">
                      <p className="text-[17px] font-medium text-[#6170F7]">
                        HR Approval
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile timeline */}
            <div className="space-y-5 md:hidden">
              <MobileTimelineItem
                title="Employee Submitted"
                date="01 Apr 2026"
                completed
              />

              <MobileTimelineItem
                title="Manager Approval"
                date="02 Apr 2026"
                completed
              />

              <MobileTimelineItem title="HR Approval" active />
            </div>
          </div>
        </section>

        {/* =========================================================
            MAIN GRID
        ========================================================= */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
          {/* =======================================================
              LEFT COLUMN
          ======================================================= */}
          <div className="space-y-5">
            {/* Employee Information */}
            <Card>
              <SectionTitle>Employee Information</SectionTitle>

              <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Employee Name" value={employeeName} />

                <InfoItem label="Employee ID" value={employeeCode} />

                <InfoItem
                  label="Designation"
                  value={
                    designation !== "-"
                      ? designation
                      : "Senior Software Engineer"
                  }
                />

                <InfoItem label="Joining Date" value="15 Jan 2022" />

                <InfoItem label="Department" value="Engineering" />

                <InfoItem
                  label="Work Email"
                  value="harshit.t@fintech.com"
                />
              </div>
            </Card>

            {/* Resignation Details */}
            <Card>
              <SectionTitle>Resignation Details</SectionTitle>

              <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                  label="Resignation Date"
                  value={
                    resignationData?.resignationDate
                      ? formatResignationDate(resignationData.resignationDate)
                      : "01 May 2026"
                  }
                />

                <InfoItem
                  label="Last Working Day (Employee)"
                  value={
                    resignationData?.preferredLastWorkingDay
                      ? formatResignationDate(
                          resignationData.preferredLastWorkingDay
                        )
                      : "10 May 2026"
                  }
                />

                <InfoItem
                  label="Manager Approved LWD"
                  value={
                    resignationData?.managerActionLWD
                      ? formatResignationDate(resignationData.managerActionLWD)
                      : "10 May 2026"
                  }
                />
              </div>

              <div className="mt-7">
                <InfoItem
                  label="Resignation Reason"
                  value={
                    <span className="block max-w-[850px] leading-[1.65]">
                      I have received a better opportunity that aligns with my
                      long-term career goals. I am grateful for the support and
                      growth I experienced at Fintech.
                    </span>
                  }
                />
              </div>

              <div className="mt-7">
                <InfoItem
                  label="Additional Comments"
                  value={
                    <span className="block max-w-[860px] leading-[1.65]">
                      I am committed to ensuring a smooth handover of all my
                      responsibilities and assisting in the transition during
                      my notice period.
                    </span>
                  }
                />
              </div>

              {/* Uploaded Document */}
              <div className="mt-7">
                <p className="mb-2 text-[12px] font-normal text-[#9A9A9A]">
                  Uploaded Document
                </p>

                <button
                  type="button"
                  className="
                    flex min-h-[62px] w-full max-w-[365px]
                    items-center gap-3
                    rounded-[8px]
                    border border-[#E1DFF0]
                    bg-[#F5F3FC]
                    px-3 py-2
                    text-left
                    transition
                    hover:bg-[#EFECFA]
                  "
                >
                  <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[7px] bg-[#E7DFF8]">
                    <FileText
                      className="h-[23px] w-[23px] text-[#673AB7]"
                      strokeWidth={1.8}
                    />
                  </span>

                  <span>
                    <span className="block text-[14px] font-medium text-[#403965]">
                      Resignation.pdf
                    </span>

                    <span className="mt-0.5 block text-[12px] text-[#77738D]">
                      245 KB
                    </span>
                  </span>
                </button>
              </div>
            </Card>

            {/* Manager Action */}
            <Card>
              <SectionTitle>Manager Action</SectionTitle>

              <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Manager Name" value="Amit Sharma" />

                <InfoItem
                  label="Action Taken"
                  value={
                    <span className="inline-flex min-w-[132px] justify-center rounded-full bg-[#D5FBDD] px-5 py-[7px] text-[13px] font-medium text-[#16A565]">
                      Approved
                    </span>
                  }
                />

                <InfoItem label="Action Date" value="02 Apr 2026" />
              </div>

              <div className="mt-7">
                <InfoItem
                  label="Manager Comments"
                  value={
                    <span className="block max-w-[850px] leading-[1.65]">
                      Harshit has been a valuable member of the team. I support
                      his decision and will ensure a smooth knowledge transfer.
                    </span>
                  }
                />
              </div>
            </Card>
          </div>

          {/* =======================================================
              RIGHT COLUMN
          ======================================================= */}
          <div className="space-y-5">
            {/* Notice Period */}
            <Card>
              <SectionTitle>Notice Period Details</SectionTitle>

              <div className="mt-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="text-[14px] font-medium text-[#26794C]">
                    Notice Period Status
                  </span>

                  <span className="inline-flex min-w-[132px] justify-center rounded-full bg-[#D4FBDD] px-5 py-[7px] text-[13px] font-medium text-[#19A967]">
                    Completed
                  </span>
                </div>

                <div className="space-y-5">
                  <NoticeRow label="Required" value="30 Days" />

                  <NoticeRow label="Served" value="15 Days" />

                  <NoticeRow
                    label="Remaining"
                    value="15 Days"
                    danger
                  />
                </div>
              </div>
            </Card>

            {/* Asset Checklist */}
            <Card>
              <SectionTitle>Asset Checklist</SectionTitle>

              <div className="mt-6 space-y-3">
                {assets.map((asset) => {
                  const isPending = asset.status === "Pending";

                  return (
                    <div
                      key={asset.name}
                      className={`
                        flex min-h-[58px] items-center justify-between gap-3
                        rounded-[8px] px-3 py-2
                        ${
                          isPending
                            ? "border border-[#F2A638] bg-[#FFF6E8]"
                            : "bg-[#FAFAFA]"
                        }
                      `}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-normal text-[#676486]">
                          {asset.name}
                        </p>

                        {isPending && (
                          <p className="mt-1 text-[10px] font-medium text-[#E48700]">
                            Pending
                          </p>
                        )}
                      </div>

                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleReturnAsset(asset)}
                          className="
                            flex shrink-0 items-center gap-1.5
                            rounded-full
                            bg-[#E68A00]
                            px-4 py-[8px]
                            text-[13px] font-medium
                            text-white
                            transition
                            hover:bg-[#D67F00]
                          "
                        >
                          <RotateCcw
                            className="h-[15px] w-[15px]"
                            strokeWidth={1.8}
                          />

                          <span>Return Asset</span>
                        </button>
                      ) : (
                        <span className="inline-flex min-w-[98px] shrink-0 justify-center rounded-full bg-[#D5FBDD] px-4 py-[7px] text-[13px] font-medium text-[#16A565]">
                          Returned
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <ApproveResignationModal
          isOpen={activeModal === "approve"}
          onClose={closeModal}
          employeeName={employeeName}
          designation={
            designation !== "-" ? designation : "Senior Software Engineer"
          }
          employeeCode={employeeCode}
          formattedLastWorkingDay={formattedLastWorkingDay}
          isSubmitting={isSubmitting}
          onSubmit={handleApproveSubmit}
        />

        <RejectResignationModal
          isOpen={activeModal === "reject"}
          onClose={closeModal}
          employeeName={employeeName}
          designation={
            designation !== "-" ? designation : "Senior Software Engineer"
          }
          employeeCode={employeeCode}
          reasonOptions={rejectReasonOptions}
          isSubmitting={isSubmitting}
          onSubmit={handleRejectSubmit}
        />

        <PutResignationOnHoldModal
          isOpen={activeModal === "hold"}
          onClose={closeModal}
          employeeName={employeeName}
          designation={
            designation !== "-" ? designation : "Senior Software Engineer"
          }
          employeeCode={employeeCode}
          reasonOptions={holdReasonOptions}
          isSubmitting={isSubmitting}
          onSubmit={handlePutOnHoldSubmit}
        />

        <EditLastWorkingDayModal
          isOpen={activeModal === "editLwd"}
          onClose={closeModal}
          employeeName={employeeName}
          designation={
            designation !== "-" ? designation : "Senior Software Engineer"
          }
          employeeCode={employeeCode}
          isSubmitting={isSubmitting}
          onSubmit={handleEditLwdSubmit}
        />
      </div>
    </div>
  );
};

/* ===============================================================
   REUSABLE COMPONENTS
================================================================ */

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <section
      className={`
        rounded-[18px]
        bg-white
        px-6 py-7
        md:px-7 md:py-8
        ${className}
      `}
    >
      {children}
    </section>
  );
};

const SectionTitle: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <h2 className="text-[17px] font-semibold leading-none text-[#181145]">
      {children}
    </h2>
  );
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="mb-2 text-[12px] font-normal leading-none text-[#999999]">
        {label}
      </p>

      <div className="text-[14px] font-normal leading-[1.45] text-[#676486]">
        {value}
      </div>
    </div>
  );
};

const NoticeRow: React.FC<{
  label: string;
  value: string;
  danger?: boolean;
}> = ({ label, value, danger = false }) => {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[14px] font-normal text-[#777391]">
        {label}
      </span>

      <span
        className={`
          text-[14px] font-medium
          ${danger ? "text-[#D9272E]" : "text-[#555174]"}
        `}
      >
        {value}
      </span>
    </div>
  );
};

const TimelineCompletedIcon = () => {
  return (
    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#13A366] text-white">
      <Check className="h-[20px] w-[20px]" strokeWidth={2} />
    </div>
  );
};

const MobileTimelineItem: React.FC<{
  title: string;
  date?: string;
  completed?: boolean;
  active?: boolean;
}> = ({ title, date, completed = false, active = false }) => {
  return (
    <div className="flex items-center gap-4">
      {completed ? (
        <TimelineCompletedIcon />
      ) : (
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#6170F7] text-white">
          <Clock3 className="h-[20px] w-[20px]" strokeWidth={1.8} />
        </div>
      )}

      <div>
        <p
          className={`text-[15px] font-medium ${
            active ? "text-[#6170F7]" : "text-[#211A55]"
          }`}
        >
          {title}
        </p>

        {date && (
          <p className="mt-1 text-[12px] text-[#999999]">
            {date}
          </p>
        )}
      </div>
    </div>
  );
};


export default ViewResignationRequest;