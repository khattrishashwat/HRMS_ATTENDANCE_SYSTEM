import DashboardCard from "../cards/DashboardCard.tsx";

export type PeopleStatusPerson = {
  id: string;
  name: string;
  designation: string;
  initials: string;
  avatarBg?: string;
  avatarText?: string;
  badge: string;
  badgeClass?: string;
  date?: string;
};

export type PeopleStatusSection = {
  label: string;
  items: PeopleStatusPerson[];
};

type PeopleStatusCardProps = {
  title: string;
  badgeLabel: string;
  badgeClass?: string;
  sections: PeopleStatusSection[];
};

function PersonRow({ item }: { item: PeopleStatusPerson }) {
  return (
    <div className="flex min-h-[64px] items-center">
      {/* Avatar */}
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-full text-[12px] font-semibold
          ${item.avatarBg || "bg-[#F1ECF8]"}
          ${item.avatarText || "text-[#4C2392]"}
        `}
      >
        {item.initials}
      </div>

      {/* Employee Details */}
      <div className="ml-3 min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium leading-[18px] text-[#171333]">
          {item.name}
        </p>

        <p className="mt-[2px] truncate text-[12px] font-normal leading-[16px] text-[#666184]">
          {item.designation}
        </p>
      </div>

      {/* Leave Details */}
      <div className="ml-3 flex shrink-0 flex-col items-end">
        <span
          className={`
            inline-flex items-center justify-center
            whitespace-nowrap rounded-full
            px-[10px] py-[3px]
            text-[10px] font-semibold leading-[14px]
            ${
              item.badgeClass ||
              "bg-[#EEE9F5] text-[#4D218C]"
            }
          `}
        >
          {item.badge}
        </span>

        {item.date && (
          <span className="mt-[5px] text-[10px] font-medium leading-[13px] text-[#4C2392]">
            {item.date}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PeopleStatusCard({
  title,
  badgeLabel,
  badgeClass,
  sections,
}: PeopleStatusCardProps) {
  return (
    <DashboardCard className="min-h-[320px] bg-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold leading-[24px] text-[#171333]">
          {title}
        </h2>

        <span
          className={`
            inline-flex shrink-0 items-center justify-center
            rounded-full px-3 py-[6px]
            text-[12px] font-medium
            ${
              badgeClass ||
              "bg-[#FAF4FF] text-[#D878F2]"
            }
          `}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Sections */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <div
            key={section.label}
            className={index !== 0 ? "mt-4" : ""}
          >
            {/* Section Header */}
            <div className="mb-2 flex items-center gap-3">
              <span className="shrink-0 text-[11px] font-normal leading-[14px] text-[#99979F]">
                {section.label}
              </span>

              <div className="h-px flex-1 bg-[#E5E4E7]" />
            </div>

            {/* Employee Rows */}
            <div>
              {section.items.map((item) => (
                <PersonRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}