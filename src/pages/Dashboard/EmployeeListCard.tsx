import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";

export type EmployeeListItem = {
  name: string;
  dept: string;
  initials: string;
  bg: string;
  text: string;
  type?: string;
  typeClass?: string;
};

type EmployeeListCardProps = {
  title: string;
  subtitle: string;
  employees: EmployeeListItem[];
};

export default function EmployeeListCard({
  title,
  subtitle,
  employees,
}: EmployeeListCardProps) {
  return (
    <DashboardCard>
      <SectionTitle title={title} subtitle={subtitle} />
      <ul className="divide-y divide-[#F3F4F6]">
        {employees.map((person) => (
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
            {person.type ? (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${person.typeClass}`}
              >
                {person.type}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
