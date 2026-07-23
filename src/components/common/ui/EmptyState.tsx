type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

/** Centered empty-state message for tables and list panels. */
export default function EmptyState({
  title = "No Data Found",
  description = "There is currently no data available to display. Once records are added or synced, insights and reports will appear here.",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[320px] ${className}`}
    >
      <h3 className="text-base font-semibold text-[#374151] sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-5 text-[#9CA3AF]">{description}</p>
    </div>
  );
}
