import { useEffect, useId, useState, type FormEvent } from "react";
import { FiAlertCircle, FiChevronDown } from "react-icons/fi";
import BaseModal from "./BaseModal.tsx";
import ResignationEmployeeSummary from "./ResignationEmployeeSummary.tsx";
import type { ResignationReasonOption } from "./resignationModalTypes.ts";

export type RejectResignationFormData = {
  reason: string;
  comments: string;
  sendEmail: boolean;
};

type RejectResignationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  designation: string;
  employeeCode: string;
  reasonOptions?: ResignationReasonOption[];
  isSubmitting?: boolean;
  onSubmit: (data: RejectResignationFormData) => void | Promise<void>;
};

export default function RejectResignationModal({
  isOpen,
  onClose,
  employeeName,
  designation,
  employeeCode,
  reasonOptions = [],
  isSubmitting = false,
  onSubmit,
}: RejectResignationModalProps) {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [errors, setErrors] = useState<{ reason?: string; comments?: string }>(
    {}
  );

  const reasonId = useId();
  const commentsId = useId();
  const emailId = useId();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    setReason("");
    setComments("");
    setSendEmail(false);
    setErrors({});
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: { reason?: string; comments?: string } = {};
    if (!reason.trim()) nextErrors.reason = "Reason is required";
    if (!comments.trim()) nextErrors.comments = "Comments are required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      reason: reason.trim(),
      comments: comments.trim(),
      sendEmail,
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Resignation"
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
            form="reject-resignation-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#D9272E] px-5 text-sm font-medium text-white transition hover:bg-[#C51E25] disabled:opacity-50"
          >
            {isSubmitting ? "Rejecting…" : "Reject Resignation"}
          </button>
        </>
      }
    >
      <form
        id="reject-resignation-form"
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
            Reason for Rejection <span className="text-[#DC2626]">*</span>
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
            htmlFor={commentsId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            Additional Comments <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            id={commentsId}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            rows={4}
            disabled={isSubmitting}
            placeholder="Provide detailed explanation for the rejection. This will be shared with the employee..."
            className="w-full resize-none rounded-xl border border-[#D1D5DB] px-3.5 py-3 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          {errors.comments ? (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.comments}</p>
          ) : null}
        </div>

        <label
          htmlFor={emailId}
          className="flex cursor-pointer items-start gap-2.5 text-sm text-[#374151]"
        >
          <input
            id={emailId}
            type="checkbox"
            checked={sendEmail}
            onChange={(event) => setSendEmail(event.target.checked)}
            disabled={isSubmitting}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-primary accent-primary focus:ring-primary/20"
          />
          <span>
            Send email notification to employee with the rejection details
          </span>
        </label>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FFD6D6] px-3.5 py-3">
          <FiAlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
            aria-hidden
          />
          <p className="text-sm text-[#DC2626]">
            This action will reject the resignation request. The employee will
            be notified and can resubmit if needed.
          </p>
        </div>
      </form>
    </BaseModal>
  );
}
