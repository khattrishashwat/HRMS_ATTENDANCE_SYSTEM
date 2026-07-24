import { useEffect, useId, useState, type FormEvent } from "react";
import { FiCalendar, FiChevronDown, FiInfo } from "react-icons/fi";
import BaseModal from "./BaseModal.tsx";
import ResignationEmployeeSummary from "./ResignationEmployeeSummary.tsx";
import type { ResignationReasonOption } from "./resignationModalTypes.ts";

export type PutResignationOnHoldFormData = {
  reason: string;
  followUpDate: string;
};

type PutResignationOnHoldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  designation: string;
  employeeCode: string;
  reasonOptions?: ResignationReasonOption[];
  isSubmitting?: boolean;
  onSubmit: (data: PutResignationOnHoldFormData) => void | Promise<void>;
};

export default function PutResignationOnHoldModal({
  isOpen,
  onClose,
  employeeName,
  designation,
  employeeCode,
  reasonOptions = [],
  isSubmitting = false,
  onSubmit,
}: PutResignationOnHoldModalProps) {
  const [reason, setReason] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [errors, setErrors] = useState<{
    reason?: string;
    followUpDate?: string;
  }>({});

  const reasonId = useId();
  const dateId = useId();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    setReason("");
    setFollowUpDate("");
    setErrors({});
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: { reason?: string; followUpDate?: string } = {};
    if (!reason.trim()) nextErrors.reason = "Reason is required";
    if (!followUpDate.trim()) nextErrors.followUpDate = "Follow-up date is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      reason: reason.trim(),
      followUpDate: followUpDate.trim(),
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Put Resignation On Hold"
      disableClose={isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="put-on-hold-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#E18A00] px-5 text-sm font-medium text-white transition hover:bg-[#D67F00] disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Put On Hold"}
          </button>
        </>
      }
    >
      <form
        id="put-on-hold-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <ResignationEmployeeSummary
          name={employeeName}
          designation={designation}
          employeeCode={employeeCode}
        />

        <div>
          <label
            htmlFor={reasonId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            Reason for Hold <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <select
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSubmitting}
              className="h-11 w-full appearance-none rounded-xl border border-[#D1D5DB] bg-white px-3.5 pr-10 text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="">Select Reason</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
          </div>
          {errors.reason ? (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.reason}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={dateId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            New resignation follow-up date{" "}
            <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <input
              id={dateId}
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 pr-10 text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <FiCalendar
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
          </div>
          {errors.followUpDate ? (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.followUpDate}</p>
          ) : null}
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#FCD34D] bg-[#FFF1DE] px-3.5 py-3">
          <FiInfo
            className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]"
            aria-hidden
          />
          <p className="text-sm text-[#B45309]">
            The resignation will be marked as &quot;On Hold&quot; and will
            require review on the follow-up date. The employee will be notified
            about this status.
          </p>
        </div>
      </form>
    </BaseModal>
  );
}
