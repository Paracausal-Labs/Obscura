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
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden group hover:border-white/[0.12] transition-colors">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-2">
        {label}
      </p>
      {loading ? (
        <div className="h-9 w-16 rounded bg-white/[0.04] animate-pulse" />
      ) : (
        <p className="text-white font-black text-3xl leading-none tabular-nums">
          {value}
        </p>
      )}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Jobs On-Chain" value={String(jobCount)} loading={jobsLoading} />
      <StatCard label="Completed" value={String(completedCount)} loading={jobsLoading} />
      <StatCard label="Agents" value="4" />
      <StatCard label="Avg Score" value={avgScore > 0 ? String(avgScore) : "—"} loading={repLoading} />
    </div>
  );
}
