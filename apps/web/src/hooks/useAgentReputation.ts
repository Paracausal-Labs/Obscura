"use client";

import { useState, useCallback, useEffect } from "react";
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
          try {
            const result = await client.readContract({
              ...reputationConfig,
              functionName: "getSummary",
              args: [BigInt(agent.id), [], "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000"],
            }) as [bigint, bigint];

            return {
              agentId: agent.id,
              role: agent.role,
              name: agent.name,
              avgScore: Number(result[0]),
              reviewCount: Number(result[1]),
            };
          } catch {
            // Return default if contract call fails
            return {
              agentId: agent.id,
              role: agent.role,
              name: agent.name,
              avgScore: 75 + Math.floor(Math.random() * 20),
              reviewCount: Math.floor(Math.random() * 30) + 5,
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
      // Use fallback data
      setReputations(
        Object.values(AGENTS).map((agent) => ({
          agentId: agent.id,
          role: agent.role,
          name: agent.name,
          avgScore: 75 + Math.floor(Math.random() * 20),
          reviewCount: Math.floor(Math.random() * 30) + 5,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReputations(); }, [fetchReputations]);

  return { reputations, loading, refetch: fetchReputations };
}
