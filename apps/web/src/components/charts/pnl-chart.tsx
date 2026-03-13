"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useJobs } from "@/hooks/useJobs";

export function PnlChart() {
  const { jobs, loading } = useJobs();

  // Group job budgets by day-of-week
  const dayBuckets: Record<string, number> = {
    Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
  };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let hasData = false;
  for (const job of jobs) {
    if (job.status >= 1) {
      const budgetEth = Number(job.budget) / 1e6;
      if (budgetEth > 0) {
        // Use expiredAt as a proxy for creation time
        const ts = Number(job.expiredAt) > 0 ? Number(job.expiredAt) * 1000 : Date.now();
        const day = dayNames[new Date(ts).getDay()];
        dayBuckets[day] += budgetEth;
        hasData = true;
      }
    }
  }

  const data = dayNames.map((name) => ({
    name,
    cost: parseFloat(dayBuckets[name].toFixed(2)),
  }));

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        Costs
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-3">Job Costs by Day</h3>
      {loading ? (
        <div className="h-[180px] rounded bg-white/[0.03] animate-pulse" />
      ) : !hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-xs text-zinc-600">No cost data yet — jobs will appear here.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#52525b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#52525b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}
              labelStyle={{ color: "#a1a1aa" }}
              itemStyle={{ color: "#ff0033" }}
            />
            <Bar dataKey="cost" fill="#ff0033" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
