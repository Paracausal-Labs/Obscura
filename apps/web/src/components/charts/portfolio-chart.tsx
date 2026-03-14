"use client";

import { useJobs } from "@/hooks/useJobs";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<number, { label: string; class: string }> = {
  0: { label: "Created", class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  1: { label: "Funded", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  2: { label: "Submitted", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  3: { label: "Completed", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  4: { label: "Rejected", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  5: { label: "Expired", class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
};

export function PortfolioChart() {
  const { jobs, loading } = useJobs();

  return (
    <div className="relative rounded-[2rem] border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        On-Chain
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-3">Recent Jobs</h3>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-xs text-zinc-600 py-8 text-center">
          No jobs yet — post one from the Marketplace.
        </p>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {jobs.slice(0, 10).map((job) => {
            const status = STATUS_LABELS[job.status] ?? STATUS_LABELS[0];
            const budgetEth = Number(job.budget) / 1e6;
            return (
              <div
                key={String(job.id)}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-zinc-500 font-mono shrink-0">
                    #{String(job.id)}
                  </span>
                  <span className="text-sm text-zinc-300 truncate max-w-[180px]">
                    {job.description || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {budgetEth > 0 && (
                    <span className="text-xs text-zinc-500 font-mono">
                      {budgetEth.toFixed(2)} USDC
                    </span>
                  )}
                  <Badge variant="outline" className={status.class}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
