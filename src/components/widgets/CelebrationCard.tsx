import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";

export type CelebrationItem = {
  name: string;
  dept: string;
  initials: string;
  bg: string;
  text: string;
  date: string;
  tag: string;
  tagClass: string;
};

type CelebrationCardProps = {
  title?: string;
  subtitle?: string;
  celebrations: CelebrationItem[];
};

export default function CelebrationCard({
  title = "Celebrations",
  subtitle = "July 2026",
  celebrations,
}: CelebrationCardProps) {
  return (
    <DashboardCard>
      <SectionTitle title={title} subtitle={subtitle} />
      <ul className="divide-y divide-[#F3F4F6]">
        {celebrations.map((person) => (
          <li key={person.name} className="flex items-center gap-3 py-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${person.bg} ${person.text}`}
            >
              {person.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#111827]">{person.name}</p>
              <p className="truncate text-[11px] text-[#6B7280]">{person.dept}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[11px] font-medium text-[#6B7280]">{person.date}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${person.tagClass}`}
              >
                {person.tag}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
