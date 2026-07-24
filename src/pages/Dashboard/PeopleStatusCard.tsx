import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";
import type { PersonStatusItem } from "./workforceOverviewData.ts";

type PeopleStatusCardProps = {
  title: string;
  badgeLabel: string;
  badgeClass: string;
  yesterday: PersonStatusItem[];
  upcoming: PersonStatusItem[];
};

function PersonRow({ item }: { item: PersonStatusItem }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${item.avatarBg} ${item.avatarText}`}
      >
        {item.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#111827]">{item.name}</p>
        <p className="truncate text-xs text-[#6B7280]">{item.designation}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${item.badgeClass}`}
        >
          {item.badge}
        </span>
        {item.date ? (
          <span className="text-[11px] text-[#9CA3AF]">{item.date}</span>
        ) : null}
      </div>
    </div>
  );
}

export default function PeopleStatusCard({
  title,
  badgeLabel,
  badgeClass,
  yesterday,
  upcoming,
}: PeopleStatusCardProps) {
  return (
    <DashboardCard className="min-h-[320px]">
      <SectionTitle
        title={title}
        action={
          <span
            className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
          >
            {badgeLabel}
          </span>
        }
      />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-[#9CA3AF] uppercase">
            Yesterday
          </p>
          <div className="divide-y divide-[#F3F4F6]">
            {yesterday.map((item) => (
              <PersonRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-[#9CA3AF] uppercase">
            Upcoming
          </p>
          <div className="divide-y divide-[#F3F4F6]">
            {upcoming.map((item) => (
              <PersonRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
