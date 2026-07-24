type ResignationEmployeeSummaryProps = {
  name: string;
  designation: string;
  employeeCode: string;
};

/** Shared light-purple employee summary used by resignation action modals. */
export default function ResignationEmployeeSummary({
  name,
  designation,
  employeeCode,
}: ResignationEmployeeSummaryProps) {
  const designationText = designation?.trim() || "-";
  const codeText = employeeCode?.trim() || "-";

  return (
    <div className="rounded-xl bg-tertiary px-4 py-3.5">
      <p className="text-base font-semibold text-primary">
        {name?.trim() || "-"}
      </p>
      <p className="mt-1 text-sm text-[#6B7280]">
        {designationText} | Employee ID: {codeText}
      </p>
    </div>
  );
}
