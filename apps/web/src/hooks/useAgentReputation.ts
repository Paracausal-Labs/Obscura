"use client";

import { useState, useCallback, useEffect } from "react";
import { pad, stringToHex } from "viem";
import { getBaseSepoliaClient } from "@/lib/config/chains";
import { reputationConfig } from "@/lib/contracts/reputation";
import { AGENTS } from "@/lib/config/agents";
import type { AgentRole } from "@obscura/shared";

interface ReputationData {
  agentId: number;
  role: AgentRole;
  name: string;
  avgScore: number;
  reviewCount: number;
}

export function useAgentReputation() {
  const [reputations, setReputations] = useState<ReputationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReputations = useCallback(async () => {
    try {
      setLoading(true);
      const client = getBaseSepoliaClient();

      const results = await Promise.allSettled(
        Object.values(AGENTS).map(async (agent) => {
          const tag1 = pad(stringToHex("obscura.job"), { size: 32 });
          const tag2 = pad(stringToHex(agent.role), { size: 32 });

          try {
            const result = await client.readContract({
              ...reputationConfig,
              functionName: "getSummary",
              args: [BigInt(agent.id), [], tag1, tag2],
            }) as [bigint, bigint];

            return {
              agentId: agent.id,
              role: agent.role,
              name: agent.name,
              avgScore: Number(result[0]),
              reviewCount: Number(result[1]),
            };
          } catch {
            return {
              agentId: agent.id,
              role: agent.role,
              name: agent.name,
              avgScore: 0,
              reviewCount: 0,
            };
          }
        })
      );

      const reps = results
        .filter((r): r is PromiseFulfilledResult<ReputationData> => r.status === "fulfilled")
        .map((r) => r.value)
        .sort((a, b) => b.avgScore - a.avgScore);

      setReputations(reps);
    } catch {
      setReputations(
        Object.values(AGENTS).map((agent) => ({
          agentId: agent.id,
          role: agent.role,
          name: agent.name,
          avgScore: 0,
          reviewCount: 0,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReputations(); }, [fetchReputations]);

  return { reputations, loading, refetch: fetchReputations };
}
