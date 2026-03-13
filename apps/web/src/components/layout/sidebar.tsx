"use client";

import { AGENTS } from "@/lib/config/agents";
import { AgentRole, AgentState } from "@obscura/shared";

const STATE_COLORS: Record<AgentState, string> = {
  [AgentState.Idle]: "bg-zinc-500",
  [AgentState.Working]: "bg-green-500 animate-pulse",
  [AgentState.Evaluating]: "bg-yellow-500 animate-pulse",
  [AgentState.Executing]: "bg-violet-500 animate-pulse",
};

const ROLE_ICONS: Record<AgentRole, string> = {
  [AgentRole.Scout]: "\uD83D\uDD0D",
  [AgentRole.Analyst]: "\uD83D\uDCCA",
  [AgentRole.Ghost]: "\uD83D\uDC7B",
  [AgentRole.Sentinel]: "\uD83D\uDEE1",
};

export function Sidebar() {
  const agentStates: Record<AgentRole, AgentState> = {
    [AgentRole.Scout]: AgentState.Idle,
    [AgentRole.Analyst]: AgentState.Idle,
    [AgentRole.Ghost]: AgentState.Idle,
    [AgentRole.Sentinel]: AgentState.Idle,
  };

  return (
    <aside className="w-56 border-r border-white/[0.06] bg-[#0a0b0f] min-h-[calc(100vh-4rem)] p-4 hidden lg:block">
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-4">
        Agents
      </p>
      <div className="space-y-3">
        {Object.values(AGENTS).filter(a => a.role !== AgentRole.Sentinel || true).map((agent) => (
          <div
            key={agent.role}
            className="relative p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06] hover:border-white/[0.12] transition-colors overflow-hidden group"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ROLE_ICONS[agent.role]}</span>
              <span className="font-medium text-sm text-white">{agent.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span
                className={`w-2 h-2 rounded-full ${STATE_COLORS[agentStates[agent.role]]}`}
              />
              <span>{agentStates[agent.role]}</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">{agent.ensName}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
