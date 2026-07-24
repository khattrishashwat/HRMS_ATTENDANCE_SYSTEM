import { useEffect, useId, useState, type FormEvent } from "react";
import { FiCalendar, FiInfo } from "react-icons/fi";
import BaseModal from "./BaseModal.tsx";
import ResignationEmployeeSummary from "./ResignationEmployeeSummary.tsx";

export type EditLastWorkingDayFormData = {
  newLastWorkingDate: string;
  reason: string;
};

type EditLastWorkingDayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  designation: string;
  employeeCode: string;
  isSubmitting?: boolean;
  onSubmit: (data: EditLastWorkingDayFormData) => void | Promise<void>;
};

export default function EditLastWorkingDayModal({
  isOpen,
  onClose,
  employeeName,
  designation,
  employeeCode,
  isSubmitting = false,
  onSubmit,
}: EditLastWorkingDayModalProps) {
  const [newLastWorkingDate, setNewLastWorkingDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{
    newLastWorkingDate?: string;
    reason?: string;
  }>({});

  const dateId = useId();
  const reasonId = useId();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    setNewLastWorkingDate("");
    setReason("");
    setErrors({});
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: { newLastWorkingDate?: string; reason?: string } = {};
    if (!newLastWorkingDate.trim()) {
      nextErrors.newLastWorkingDate = "Last working date is required";
    }
    if (!reason.trim()) nextErrors.reason = "Reason is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      newLastWorkingDate: newLastWorkingDate.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Last Working Day"
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
            form="edit-lwd-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      <form
        id="edit-lwd-form"
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
            htmlFor={dateId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            New Last Working Date <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <input
              id={dateId}
              type="date"
              value={newLastWorkingDate}
              onChange={(event) => setNewLastWorkingDate(event.target.value)}
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 pr-10 text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <FiCalendar
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
          </div>
          {errors.newLastWorkingDate ? (
            <p className="mt-1 text-xs text-[#DC2626]">
              {errors.newLastWorkingDate}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={reasonId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            Reason for Change <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            disabled={isSubmitting}
            placeholder="Enter reason for changing the last working day."
            className="w-full resize-none rounded-xl border border-[#D1D5DB] px-3.5 py-3 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          {errors.reason ? (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.reason}</p>
          ) : null}
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#FCD34D] bg-[#FFF1DE] px-3.5 py-3">
          <FiInfo
            className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]"
            aria-hidden
          />
          <p className="text-sm text-[#B45309]">
            Changing the last working day will update the resignation timeline
            and may affect final settlement calculations.
          </p>
        </div>
      </form>
    </BaseModal>
  );
}
