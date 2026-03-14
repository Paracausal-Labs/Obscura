"use client";

import { useJobs } from "@/hooks/useJobs";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<number, { label: string; class: string; color: string }> = {
  0: { label: "Created", class: "bg-zinc-500/5 text-zinc-500 border-zinc-500/10", color: "#71717a" },
  1: { label: "Funded", class: "bg-blue-500/5 text-blue-400 border-blue-500/10", color: "#60a5fa" },
  2: { label: "Submitted", class: "bg-yellow-500/5 text-yellow-400 border-yellow-500/10", color: "#facc15" },
  3: { label: "Completed", class: "bg-green-500/5 text-green-400 border-green-500/10", color: "#4ade80" },
  4: { label: "Rejected", class: "bg-red-500/5 text-red-400 border-red-500/10", color: "#f87171" },
  5: { label: "Expired", class: "bg-zinc-500/5 text-zinc-600 border-zinc-500/10", color: "#52525b" },
};

export function PortfolioChart() {
  const { jobs, loading } = useJobs();

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden min-h-[460px] flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0033]/[0.01] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#ff0033] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            Protocol Ledger
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">Recent Jobs</h3>
        </div>
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-8 rounded-full border border-[#0c0d12] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500"
              style={{ background: `linear-gradient(135deg, #18181b, #09090b)` }}
            >
              A{i+1}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative z-10">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <span className="text-zinc-700 text-xl font-mono">?</span>
            </div>
            <p className="text-xs text-zinc-600 max-w-[200px] leading-relaxed">
              No jobs found. Post your first agent job from the Marketplace.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
            {jobs.map((job) => {
              const status = STATUS_LABELS[job.status] ?? STATUS_LABELS[0];
              const budgetEth = Number(job.budget) / 1e6;
              return (
                <div
                  key={String(job.id)}
                  className="group flex items-center justify-between rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.03] px-4 py-3.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{String(job.id).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate pr-4 group-hover:text-white transition-colors">
                        {job.description || "Untitled Agent Job"}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                        {job.expiredAt ? new Date(Number(job.expiredAt) * 1000 - 3600000).toLocaleDateString() : "Pending..."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white tabular-nums">
                        {budgetEth > 0 ? `${budgetEth.toFixed(2)}` : "0.00"} <span className="text-[9px] text-zinc-500">USDC</span>
                      </p>
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${status.class}`}
                    >
                      {status.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="mt-6 w-full py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 hover:text-white hover:border-white/[0.12] transition-all relative overflow-hidden group">
        <span className="relative z-10">Export Full Ledger</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    </div>
  );
}
