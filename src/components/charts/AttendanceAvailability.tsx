import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import DashboardCard, { SectionTitle } from "../cards/DashboardCard.tsx";
import { attendanceStatus } from "../../pages/Dashboard/dashboardData.ts";

export default function AttendanceAvailability() {
  return (
    <DashboardCard className="h-full">
      <SectionTitle title="Attendance & Availability" subtitle="Employees by status" />
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={attendanceStatus} margin={{ top: 20, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              interval={0}
            />
            <YAxis hide domain={[0, 100]} />
            <Bar
              dataKey="value"
              radius={[8, 8, 8, 8]}
              barSize={36}
              label={{
                position: "top",
                fill: "#111827",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {attendanceStatus.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
