"use client";

import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { keccak256, toHex } from "viem";
import { Button } from "@/components/ui/button";
import { reputationConfig } from "@/lib/contracts/reputation";
import { AGENTS } from "@/lib/config/agents";
import type { AgentRole } from "@obscura/shared";

interface RateAgentProps {
  jobId: number;
  agentRole: AgentRole;
  onRated?: () => void;
}

const SCORES = [
  { label: "Poor", value: 25, color: "text-red-400" },
  { label: "Fair", value: 50, color: "text-amber-400" },
  { label: "Good", value: 75, color: "text-blue-400" },
  { label: "Great", value: 100, color: "text-green-400" },
] as const;

export function RateAgent({ jobId, agentRole, onRated }: RateAgentProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "signing" | "done" | "error">("idle");

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const agentMeta = AGENTS[agentRole];
  if (!agentMeta) return null;

  async function handleRate() {
    if (selectedScore === null || !publicClient) return;

    try {
      setStatus("signing");

      const hash = await writeContractAsync({
        ...reputationConfig,
        functionName: "giveFeedback",
        args: [
          BigInt(agentMeta.id),
          BigInt(selectedScore),
          0,
          "obscura.job",
          agentRole,
          `job/${jobId}`,
          `User rating for job #${jobId}`,
          keccak256(toHex(`user-rating-${jobId}`)),
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      setStatus("done");
      onRated?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className="text-[10px] text-green-400">
        Rated {selectedScore}/100 on-chain (ERC-8004)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {SCORES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => setSelectedScore(s.value)}
          className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
            selectedScore === s.value
              ? `${s.color} border-current bg-current/10`
              : "text-zinc-600 border-white/[0.06] hover:border-white/[0.12]"
          }`}
        >
          {s.label}
        </button>
      ))}
      {selectedScore !== null && (
        <Button
          size="sm"
          onClick={handleRate}
          disabled={status === "signing"}
          className="h-5 px-2 text-[10px] bg-[#ff0033] hover:bg-[#ff1a40] rounded-lg"
        >
          {status === "signing" ? "..." : "Submit"}
        </Button>
      )}
      {status === "error" && (
        <span className="text-[10px] text-red-400">Failed</span>
      )}
    </div>
  );
}
