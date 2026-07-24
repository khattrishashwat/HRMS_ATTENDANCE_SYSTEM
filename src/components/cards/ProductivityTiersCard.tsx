import { useEffect, useState } from "react";
import DashboardCard, { SectionTitle } from "./DashboardCard.tsx";

export type ProductivityTierItem = {
  id: string;
  title: string;
  range: string;
  count: number;
  percent: number;
  barClass: string;
  textClass: string;
};

type ProductivityTiersCardProps = {
  totalTracked: number;
  tiers: ProductivityTierItem[];
};

export default function ProductivityTiersCard({
  totalTracked,
  tiers,
}: ProductivityTiersCardProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <DashboardCard>
      <SectionTitle title="Productivity Distribution" />
      <div className="mb-4 rounded-xl bg-tertiary px-4 py-3 text-sm font-semibold text-primary">
        Total Employees Tracked: {totalTracked}
      </div>
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.id}>
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{tier.title}</p>
                <p className="text-xs text-[#9CA3AF]">{tier.range}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${tier.textClass}`}>{tier.count}</p>
                <p className="text-xs text-[#9CA3AF]">{tier.percent}%</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${tier.barClass}`}
                style={{ width: animate ? `${tier.percent}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
