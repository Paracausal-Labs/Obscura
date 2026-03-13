"use client";

import { useAgentReputation } from "@/hooks/useAgentReputation";

export function ReputationChart() {
  const { reputations, loading } = useAgentReputation();

  if (loading) {
    return (
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          Reputation
        </p>
        <h3 className="text-lg font-light text-white tracking-tight mb-4">Agent Reputation</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-white/[0.03] rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        Reputation
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-4">Agent Reputation</h3>
      <div className="space-y-3">
        {reputations.map((rep) => (
          <div key={rep.agentId} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-20 shrink-0 font-medium">{rep.name}.eth</span>
            <div className="flex-1 h-5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rep.avgScore}%`,
                  background: "linear-gradient(90deg, #ff0033, #ff1a40)",
                }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-300 w-8 text-right">{rep.avgScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
