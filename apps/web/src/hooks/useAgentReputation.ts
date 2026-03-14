"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
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
  const { address } = useAccount();

  const fetchReputations = useCallback(async () => {
    try {
      setLoading(true);
      const client = getBaseSepoliaClient();
      // getSummary requires at least one client address
      const clientAddresses = address ? [address] : [];

      const results = await Promise.allSettled(
        Object.values(AGENTS).map(async (agent) => {
          try {
            const result = await client.readContract({
              ...reputationConfig,
              functionName: "getSummary",
              args: [BigInt(agent.id), clientAddresses, "obscura.job", agent.role],
            }) as [bigint, bigint, number];

            return {
              agentId: agent.id,
              role: agent.role,
              name: agent.name,
              avgScore: Number(result[1]),
              reviewCount: Number(result[0]),
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
  }, [address]);

  useEffect(() => { fetchReputations(); }, [fetchReputations]);

  return { reputations, loading, refetch: fetchReputations };
}
