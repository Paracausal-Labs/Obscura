"use client";

import { useJobs } from "@/hooks/useJobs";
import { useAgentReputation } from "@/hooks/useAgentReputation";

interface StatCardProps {
  label: string;
  value: string;
  loading?: boolean;
}

function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <div className="relative rounded-[1.5rem] border border-white/[0.05] bg-[#0c0d12]/60 backdrop-blur-xl p-6 overflow-hidden group hover:border-[#ff0033]/20 transition-all duration-300">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0033]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#ff0033]/40 to-transparent" />
      
      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">
        {label}
      </p>
      
      {loading ? (
        <div className="h-10 w-24 rounded bg-white/[0.03] animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1">
          <p 
            className="text-white font-black text-4xl leading-none tracking-tight tabular-nums"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            {value}
          </p>
          {label === "Avg Score" && value !== "—" && (
            <span className="text-[10px] text-zinc-600 font-mono">/100</span>
          )}
        </div>
      )}

      {/* Subtle corner detail */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#ff0033]/[0.03] to-transparent rounded-tl-full pointer-events-none" />
    </div>
  );
}

export function StatsCards() {
  const { jobs, loading: jobsLoading } = useJobs();
  const { reputations, loading: repLoading } = useAgentReputation();

  const jobCount = jobs.length;
  const completedCount = jobs.filter((j) => j.status === 3).length;
  const avgScore =
    reputations.length > 0
      ? Math.round(
          reputations.reduce((sum, r) => sum + r.avgScore, 0) /
            reputations.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Jobs On-Chain" value={String(jobCount).padStart(2, '0')} loading={jobsLoading} />
      <StatCard label="Completed" value={String(completedCount).padStart(2, '0')} loading={jobsLoading} />
      <StatCard label="Active Agents" value="04" />
      <StatCard label="Reputation Score" value={avgScore > 0 ? String(avgScore) : "—"} loading={repLoading} />
    </div>
  );
}
