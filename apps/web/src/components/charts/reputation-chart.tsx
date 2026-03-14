"use client";

import { useAgentReputation } from "@/hooks/useAgentReputation";

const AGENT_COLORS: Record<string, string> = {
  Scout: "#aaaaaa",
  Analyst: "#888888",
  Ghost: "#ff0033",
  Sentinel: "#cccccc",
};

export function ReputationChart() {
  const { reputations, loading } = useAgentReputation();

  return (
    <div className="relative rounded-[1.5rem] border border-white/[0.05] bg-[#0c0d12]/60 backdrop-blur-xl p-6 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0033] rounded-full blur-[80px] opacity-[0.02] pointer-events-none" />
      
      <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
        Social Proof
      </p>
      <h3 className="text-xl font-light text-white tracking-tight mb-6">Agent Reputation</h3>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-3 w-8 bg-white/[0.03] rounded animate-pulse" />
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {reputations.map((rep) => {
            const color = AGENT_COLORS[rep.name] || "#ff0033";
            return (
              <div key={rep.agentId} className="group/item">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-bold text-zinc-300 group-hover/item:text-white transition-colors uppercase tracking-wider">{rep.name}</span>
                    <span className="text-[9px] font-mono text-zinc-600">.eth</span>
                  </div>
                  <span className="text-[11px] font-black tabular-nums" style={{ color: color }}>{rep.avgScore}%</span>
                </div>
                <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${rep.avgScore}%`,
                      background: `linear-gradient(90deg, ${color}cc, ${color})`,
                      boxShadow: `0 0 10px ${color}44`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
