import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";
import { announcements } from "../../pages/Dashboard/dashboardData.ts";

export default function AnnouncementCard() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle title="Announcements" subtitle="Published in the last 30 Days" />
      <ul className="flex flex-col divide-y divide-[#F3F4F6]">
        {announcements.map((item) => (
          <li key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.badgeClass}`}
            >
              {item.badge}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#111827]">{item.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#6B7280]">
                {item.description}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-[#9CA3AF]">{item.date}</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
