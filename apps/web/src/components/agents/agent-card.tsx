"use client";

import { useReadContract, useAccount } from "wagmi";
import { Badge } from "@/components/ui/badge";
import type { AgentMetadata } from "@obscura/shared";
import { useEnsAgentVerification } from "@/hooks/useEnsIdentity";
import { reputationConfig } from "@/lib/contracts/reputation";

interface AgentCardProps {
  agent: AgentMetadata;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { verified, protocol } = useEnsAgentVerification(agent.ensName);
  const { address } = useAccount();

  const { data: reputationData } = useReadContract({
    ...reputationConfig,
    functionName: "getSummary",
    args: [BigInt(agent.id), address ? [address] : [], "obscura.job", agent.role],
    query: { enabled: !!address },
  });

  // getSummary returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)
  const jobCount = reputationData ? Number(reputationData[0]) : 0;
  const avgScore = reputationData ? Number(reputationData[1]) : 0;
  const displayScore = jobCount > 0 ? Math.min(avgScore, 100) : 0;

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden group hover:border-white/[0.12] transition-colors">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-white">{agent.name}</h3>
            {verified && (
              <span className="text-green-400 text-xs" title="ENSIP-25 verified agent">
                {"\u2713"}
              </span>
            )}
          </div>
          <p className="text-xs text-[#ff0033]">{agent.ensName}</p>
          {protocol && (
            <p className="text-[10px] text-zinc-600">{protocol}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-white">{displayScore}/100</div>
          <div className="text-xs text-zinc-600">{jobCount} reviews</div>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mb-3">{agent.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-[10px] bg-white/[0.04] text-zinc-400 border-white/[0.06]">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="mb-3">
        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${displayScore}%`,
              background: "linear-gradient(90deg, #ff0033, #ff1a40)",
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-600">
        <span>Base fee: {agent.baseFee} USDC</span>
        <span>ERC-8004 ID: #{agent.id}</span>
      </div>
    </div>
  );
}
