"use client";

import { useReadContract, useAccount } from "wagmi";
import Image from "next/image";
import type { AgentMetadata } from "@obscura/shared";
import { useEnsAgentVerification } from "@/hooks/useEnsIdentity";
import { reputationConfig } from "@/lib/contracts/reputation";

interface AgentCardProps {
  agent: AgentMetadata;
}

const AGENT_IMAGES: Record<string, string> = {
  Scout: "/scout.png",
  Analyst: "/analyst.png",
  Ghost: "/ghost.png",
  Sentinel: "/sentinel.png",
};

const AGENT_COLORS: Record<string, string> = {
  Scout: "#aaaaaa",
  Analyst: "#888888",
  Ghost: "#ff0033",
  Sentinel: "#cccccc",
};

const AGENT_CLASS: Record<string, string> = {
  Scout: "RECON",
  Analyst: "INTEL",
  Ghost: "STEALTH",
  Sentinel: "ENFORCER",
};

const AGENT_STATS: Record<string, { success: number; avgTime: string }> = {
  Scout: { success: 91, avgTime: "45s" },
  Analyst: { success: 88, avgTime: "52s" },
  Ghost: { success: 97, avgTime: "30s" },
  Sentinel: { success: 92, avgTime: "18s eval" },
};

export function AgentCard({ agent }: AgentCardProps) {
  const { verified } = useEnsAgentVerification(agent.ensName);
  const { address } = useAccount();

  const { data: reputationData } = useReadContract({
    ...reputationConfig,
    functionName: "getSummary",
    args: [
      BigInt(agent.id),
      address ? [address] : [],
      "obscura.job",
      agent.role as string,
    ],
    query: { enabled: !!address },
  });

  const jobCount = reputationData ? Number(reputationData[0]) : 0;
  const avgScore = reputationData ? Number(reputationData[1]) : 0;
  const displayScore = jobCount > 0 ? Math.min(avgScore, 100) : 0;

  const color = AGENT_COLORS[agent.name] || "#ffffff";
  const charImage = AGENT_IMAGES[agent.name] || "/scout.png";
  const charClass = AGENT_CLASS[agent.name] || "AGENT";
  const charStats = AGENT_STATS[agent.name] || { success: 90, avgTime: "45s" };

  return (
    <div className="relative rounded-2xl border border-white/5 bg-[#0a0b0f] overflow-hidden hover:border-white/10 transition-all duration-300 group flex flex-row min-h-[200px]">
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(to right, transparent, ${color}55, transparent)`,
        }}
      />

      {/* ──────── LEFT: character image ──────── */}
      <div
        className="relative flex-shrink-0 w-[120px] md:w-[140px] flex items-end justify-center overflow-hidden"
        style={{ background: `${color}11` }}
      >
        {/* vertical glow strip */}
        <div
          className="absolute inset-y-0 right-0 w-8 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${color}33, transparent)`,
          }}
        />

        {/* class badge */}
        <span
          className="absolute top-2.5 left-2.5 text-[7px] font-black tracking-[0.25em] px-1 py-0.5 rounded border"
          style={{
            color: color,
            borderColor: color + "44",
            background: color + "11",
          }}
        >
          {charClass}
        </span>

        <Image
          src={charImage}
          alt={agent.name}
          width={140}
          height={180}
          className="object-contain object-bottom w-full h-full max-h-[180px] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
          style={{ filter: "drop-shadow(0 0 12px " + color + "44)" }}
        />

        {/* separator line */}
        <div
          className="absolute right-0 top-4 bottom-4 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, ${color}33, transparent)`,
          }}
        />
      </div>

      {/* ──────── RIGHT: info ──────── */}
      <div className="flex-1 flex flex-col p-4 md:p-5 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3
                className="font-black text-lg tracking-tight uppercase truncate"
                style={{
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                  color: color === "#ff0033" ? "#ff0033" : "#ffffff",
                }}
              >
                {agent.name}
              </h3>
              {verified && (
                <span className="text-green-400 text-[10px]" title="Verified">
                  {"\u2713"}
                </span>
              )}
            </div>
            <p className="text-zinc-600 text-[8px] font-mono truncate">
              {agent.ensName}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-zinc-600 text-[8px] uppercase tracking-widest mb-0.5">
              Summary
            </p>
            <p
              className="font-black text-xl tabular-nums tabular-nums"
              style={{ color: color }}
            >
              {displayScore > 0 ? displayScore : charStats.success}%
            </p>
          </div>
        </div>

        <p className="text-zinc-500 text-[10px] leading-relaxed mb-3 flex-1 line-clamp-3">
          {agent.description}
        </p>

        {/* skills/capabilities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-zinc-500 text-[8px]"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* stats footer */}
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div className="flex gap-4">
            <div>
              <p className="text-zinc-700 text-[8px] uppercase tracking-wider">
                Fee
              </p>
              <p className="text-white font-semibold text-[10px] mt-0.5">
                {agent.baseFee} USDC
              </p>
            </div>
            <div>
              <p className="text-zinc-700 text-[8px] uppercase tracking-wider">
                ID
              </p>
              <p className="text-white font-semibold text-[10px] mt-0.5">
                #{agent.id}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-zinc-700 text-[8px] uppercase tracking-wider">
              Reviews
            </p>
            <p className="text-white font-semibold text-[10px] mt-0.5">
              {jobCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
