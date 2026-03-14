"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
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

  const maxCost = Math.max(...data.map(d => d.cost), 1);

  return (
    <div className="relative rounded-[1.5rem] border border-white/[0.05] bg-[#0c0d12]/60 backdrop-blur-xl p-6 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
        Resource Burn
      </p>
      <h3 className="text-xl font-light text-white tracking-tight mb-6">Job Costs by Day</h3>
      
      {loading ? (
        <div className="h-[148px] rounded-xl bg-white/[0.03] animate-pulse" />
      ) : !hasData ? (
        <div className="h-[148px] flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-zinc-600 font-mono">NO_DATA_STREAM</p>
        </div>
      ) : (
        <div className="h-[148px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#52525b", fontSize: 9, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                contentStyle={{ 
                  background: "rgba(12,13,18,0.9)", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
                itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                labelStyle={{ color: "#52525b", fontSize: "9px", marginBottom: "4px", textTransform: "uppercase" }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.cost === maxCost && maxCost > 0 ? "#ff0033" : "rgba(255,255,255,0.1)"} 
                    className="transition-all duration-500 hover:fill-[#ff0033] cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
