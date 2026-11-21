"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PillarScore } from "@/lib/readiness";

export default function PillarChart({ data }: { data: PillarScore[] }) {
  return (
    <div className="h-64 w-full" aria-label="Pillar scores bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            stroke="#3f3f46"
            interval={0}
          />
          <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#3f3f46" />
          <Tooltip
            cursor={{ fill: "rgba(63, 63, 70, 0.3)" }}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              color: "#e4e4e7",
              fontSize: 12,
            }}
            formatter={(value: number | string | Array<number | string>) => [
              `${value}%`,
              "Score",
            ]}
          />
          <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
