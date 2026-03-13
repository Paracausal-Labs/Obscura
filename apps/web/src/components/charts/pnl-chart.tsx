"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", gain: 120, loss: 0 },
  { name: "Tue", gain: 0, loss: -45 },
  { name: "Wed", gain: 280, loss: 0 },
  { name: "Thu", gain: 190, loss: 0 },
  { name: "Fri", gain: 0, loss: -20 },
  { name: "Sat", gain: 340, loss: 0 },
  { name: "Sun", gain: 85, loss: 0 },
];

export function PnlChart() {
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        Performance
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-3">Weekly P&L</h3>
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
          <Bar dataKey="gain" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="pnl" />
          <Bar dataKey="loss" fill="#ef4444" radius={[0, 0, 4, 4]} stackId="pnl" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
