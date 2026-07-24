import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";
import { productivitySeries } from "../../pages/Dashboard/dashboardData.ts";

export default function ProductivityOverview() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle
        title="Productivity Overview"
        subtitle="Daily productivity · last 7 days"
        action={
          <span className="shrink-0 text-[13px] font-semibold text-primary">84% Overall</span>
        }
      />
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={productivitySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="productivityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B1B91" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#4B1B91" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: "#E5E7EB" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #F3F4F6",
                fontSize: 12,
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}%`, "Productivity"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4B1B91"
              strokeWidth={3}
              fill="url(#productivityFill)"
              dot={{ r: 4, fill: "#4B1B91", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
