import type { ReactNode } from "react";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared white card shell for dashboard widgets (not an app layout). */
export default function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-5 text-[#111827]">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-4 text-[#6B7280]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
