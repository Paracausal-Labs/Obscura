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
  // TODO: Connect to real agent state via SSE
  const agentStates: Record<AgentRole, AgentState> = {
    [AgentRole.Scout]: AgentState.Idle,
    [AgentRole.Analyst]: AgentState.Idle,
    [AgentRole.Ghost]: AgentState.Idle,
    [AgentRole.Sentinel]: AgentState.Idle,
  };

  return (
    <aside className="w-56 border-r border-zinc-800 min-h-[calc(100vh-4rem)] p-4 hidden lg:block">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Agents
      </h2>
      <div className="space-y-3">
        {Object.values(AGENTS).filter(a => a.role !== AgentRole.Sentinel || true).map((agent) => (
          <div
            key={agent.role}
            className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ROLE_ICONS[agent.role]}</span>
              <span className="font-medium text-sm">{agent.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span
                className={`w-2 h-2 rounded-full ${STATE_COLORS[agentStates[agent.role]]}`}
              />
              <span>{agentStates[agent.role]}</span>
            </div>
            <div className="text-xs text-zinc-600 mt-1">{agent.ensName}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
