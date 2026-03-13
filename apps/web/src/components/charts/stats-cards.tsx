"use client";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden group hover:border-white/[0.12] transition-colors">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-white font-black text-3xl leading-none tabular-nums">
        {value}
      </p>
      {change && (
        <p className={`text-xs mt-2 ${change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
          {change}
        </p>
      )}
    </div>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total Value" value="$12,847" change="+2.3%" />
      <StatCard label="Jobs Completed" value="47" change="+5 today" />
      <StatCard label="Agents Active" value="4/4" />
      <StatCard label="Savings" value="$847" change="+$42" />
    </div>
  );
}
