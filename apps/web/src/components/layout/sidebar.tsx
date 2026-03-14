"use client";

import { useState } from "react";
import Image from "next/image";
import { AGENTS } from "@/lib/config/agents";
import { AgentRole, AgentState } from "@obscura/shared";

const STATE_COLORS: Record<AgentState, string> = {
  [AgentState.Idle]: "bg-zinc-500",
  [AgentState.Working]: "bg-green-500 animate-pulse",
  [AgentState.Evaluating]: "bg-yellow-500 animate-pulse",
  [AgentState.Executing]: "bg-violet-500 animate-pulse",
};

const STATE_TEXT_COLORS: Record<AgentState, string> = {
  [AgentState.Idle]: "text-zinc-500",
  [AgentState.Working]: "text-green-400",
  [AgentState.Evaluating]: "text-yellow-400",
  [AgentState.Executing]: "text-violet-400",
};

const AGENT_IMAGES: Record<AgentRole, string> = {
  [AgentRole.Scout]: "/scoutsmall.png",
  [AgentRole.Analyst]: "/analystsmall.png",
  [AgentRole.Ghost]: "/ghostsmall.png",
  [AgentRole.Sentinel]: "/sentinelsmall.png",
};

const AGENT_COLORS: Record<AgentRole, string> = {
  [AgentRole.Scout]: "#aaaaaa",
  [AgentRole.Analyst]: "#888888",
  [AgentRole.Ghost]: "#ff0033",
  [AgentRole.Sentinel]: "#cccccc",
};

const AGENT_CLASS: Record<AgentRole, string> = {
  [AgentRole.Scout]: "RECON",
  [AgentRole.Analyst]: "INTEL",
  [AgentRole.Ghost]: "STEALTH",
  [AgentRole.Sentinel]: "ENFORCER",
};

const AGENT_STATS: Record<AgentRole, { success: number; fee: string; avgTime: string; bars: number[] }> = {
  [AgentRole.Scout]: { success: 91, fee: "0.05 USDC", avgTime: "45s", bars: [75, 82, 79, 88, 91, 91] },
  [AgentRole.Analyst]: { success: 88, fee: "0.07 USDC", avgTime: "52s", bars: [60, 72, 80, 84, 85, 88] },
  [AgentRole.Ghost]: { success: 97, fee: "0.10 USDC", avgTime: "30s", bars: [88, 92, 93, 95, 96, 97] },
  [AgentRole.Sentinel]: { success: 92, fee: "—", avgTime: "18s eval", bars: [80, 84, 88, 90, 91, 92] },
};

function Sparkbar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-4">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : color + "44",
          }}
        />
      ))}
    </div>
  );
}

function AgentStatCard({ agent, color, stats, accentClass }: {
  agent: { name: string; ensName: string; description: string; skills: string[] };
  color: string;
  stats: { success: number; fee: string; avgTime: string; bars: number[] };
  accentClass: string;
}) {
  return (
    <div
      className="absolute left-full top-0 ml-3 z-50 w-60 rounded-2xl border overflow-hidden shadow-2xl pointer-events-none"
      style={{
        background: "rgba(10,11,15,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: color + "33",
        boxShadow: `0 0 0 1px ${color}22, 0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${color}18`,
      }}
    >
      {/* top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}88, transparent)` }}
      />

      {/* header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <span
            className="text-[8px] font-black tracking-[0.25em] px-1.5 py-0.5 rounded border mb-1 inline-block"
            style={{ color, borderColor: color + "44", background: color + "11" }}
          >
            {accentClass}
          </span>
          <h4
            className="font-black text-base tracking-tight uppercase text-white leading-none"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            {agent.name}
          </h4>
          <p className="text-zinc-600 text-[9px] font-mono mt-0.5">{agent.ensName}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-600 text-[8px] uppercase tracking-widest mb-0.5">Success</p>
          <p className="font-black text-xl tabular-nums" style={{ color }}>{stats.success}%</p>
        </div>
      </div>

      {/* description */}
      <p className="text-zinc-500 text-[10px] leading-relaxed px-4 pb-3">
        {agent.description}
      </p>

      {/* skills */}
      <div className="flex flex-wrap gap-1 px-4 pb-3">
        {agent.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="px-1.5 py-0.5 rounded border border-white/[0.06] bg-white/[0.02] text-zinc-500 text-[8px]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* divider + stats */}
      <div
        className="mx-4 mb-3 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}22, transparent)` }}
      />
      <div className="flex items-end justify-between px-4 pb-4">
        <div className="flex gap-4">
          <div>
            <p className="text-zinc-700 text-[8px] uppercase tracking-wider">Avg Time</p>
            <p className="text-white font-semibold text-[10px] mt-0.5">{stats.avgTime}</p>
          </div>
          <div>
            <p className="text-zinc-700 text-[8px] uppercase tracking-wider">Fee</p>
            <p className="text-white font-semibold text-[10px] mt-0.5">{stats.fee}</p>
          </div>
        </div>
        <div className="w-14 flex-shrink-0">
          <Sparkbar data={stats.bars} color={color} />
        </div>
      </div>

      {/* bottom glow */}
      <div
        className="absolute bottom-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-20 pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
}

export function Sidebar() {
  const [hoveredRole, setHoveredRole] = useState<AgentRole | null>(null);

  const agentStates: Record<AgentRole, AgentState> = {
    [AgentRole.Scout]: AgentState.Idle,
    [AgentRole.Analyst]: AgentState.Idle,
    [AgentRole.Ghost]: AgentState.Idle,
    [AgentRole.Sentinel]: AgentState.Idle,
  };

  return (
    <aside className="w-56 border-r border-white/[0.06] bg-[#0a0b0f] min-h-[calc(100vh-4rem)] p-4 hidden lg:block relative">
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-4">
        Agents
      </p>
      <div className="space-y-2">
        {Object.values(AGENTS).map((agent) => {
          const color = AGENT_COLORS[agent.role];
          const stats = AGENT_STATS[agent.role];
          const isHovered = hoveredRole === agent.role;

          return (
            <div
              key={agent.role}
              className="relative"
              onMouseEnter={() => setHoveredRole(agent.role)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {/* ── Agent row card ── */}
              <div
                className="relative flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] transition-all duration-200 cursor-default overflow-hidden group"
                style={{
                  background: isHovered ? color + "0d" : "#0c0d12",
                  borderColor: isHovered ? color + "44" : "rgba(255,255,255,0.06)",
                }}
              >
                {/* top hover line */}
                <div
                  className="absolute inset-x-0 top-0 h-px transition-opacity duration-200"
                  style={{
                    background: `linear-gradient(to right, transparent, ${color}66, transparent)`,
                    opacity: isHovered ? 1 : 0,
                  }}
                />

                {/* agent image */}
                <div
                  className="relative w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: color + "12" }}
                >
                  <Image
                    src={AGENT_IMAGES[agent.role]}
                    alt={agent.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
                  />
                </div>

                {/* name + status */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm tracking-wide uppercase leading-none transition-colors duration-200"
                    style={{
                      fontFamily: "Impact, 'Arial Black', sans-serif",
                      color: isHovered ? color : "#ffffff",
                    }}
                  >
                    {agent.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${STATE_COLORS[agentStates[agent.role]]}`}
                    />
                    <span className={`text-[10px] font-mono ${STATE_TEXT_COLORS[agentStates[agent.role]]}`}>
                      {agentStates[agent.role]}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-700 mt-0.5 truncate">{agent.ensName}</p>
                </div>
              </div>

              {/* ── Glassmorphism hover stat card ── */}
              {isHovered && (
                <AgentStatCard
                  agent={agent}
                  color={color}
                  stats={stats}
                  accentClass={AGENT_CLASS[agent.role]}
                />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
