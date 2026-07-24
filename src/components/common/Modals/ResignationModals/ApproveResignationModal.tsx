import { useEffect, useId, useState, type FormEvent } from "react";
import { FiInfo } from "react-icons/fi";
import BaseModal from "./BaseModal.tsx";
import ResignationEmployeeSummary from "./ResignationEmployeeSummary.tsx";

export type ApproveResignationFormData = {
  comments: string;
  sendEmail: boolean;
};

type ApproveResignationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  designation: string;
  employeeCode: string;
  /** Already-formatted display date, e.g. "01 May 2026". */
  formattedLastWorkingDay: string;
  isSubmitting?: boolean;
  onSubmit: (data: ApproveResignationFormData) => void | Promise<void>;
};

export default function ApproveResignationModal({
  isOpen,
  onClose,
  employeeName,
  designation,
  employeeCode,
  formattedLastWorkingDay,
  isSubmitting = false,
  onSubmit,
}: ApproveResignationModalProps) {
  const [comments, setComments] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const commentsId = useId();
  const emailId = useId();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    setComments("");
    setSendEmail(false);
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    await onSubmit({
      comments: comments.trim(),
      sendEmail,
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Approve Resignation"
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
            form="approve-resignation-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#13A366] px-5 text-sm font-medium text-white transition hover:bg-[#0D9159] disabled:opacity-50"
          >
            {isSubmitting ? "Approving…" : "Approve Resignation"}
          </button>
        </>
      }
    >
      <form
        id="approve-resignation-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <ResignationEmployeeSummary
          name={employeeName}
          designation={designation}
          employeeCode={employeeCode}
        />

        <div>
          <label
            htmlFor={commentsId}
            className="mb-2 block text-sm font-medium text-[#6B7280]"
          >
            Additional Comments (Optional)
          </label>
          <textarea
            id={commentsId}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            rows={4}
            disabled={isSubmitting}
            placeholder="Add any additional comments or wishes for the employee..."
            className="w-full resize-none rounded-xl border border-[#D1D5DB] px-3.5 py-3 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
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
            Send email notification to employee with the approval details
          </span>
        </label>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#86EFAC] bg-[#D7FFDE] px-3.5 py-3">
          <FiInfo
            className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]"
            aria-hidden
          />
          <div className="text-sm text-[#15803D]">
            <p>You are approving this resignation request</p>
            <p className="mt-1 font-semibold">
              Last Working Day: {formattedLastWorkingDay}
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
