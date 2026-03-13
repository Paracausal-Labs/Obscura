"use client";

import { useState, useCallback, useEffect } from "react";
import { getBaseSepoliaClient } from "@/lib/config/chains";
import { agentJobsConfig } from "@/lib/contracts/agent-jobs";

interface JobData {
  id: bigint;
  client: string;
  provider: string;
  evaluator: string;
  budget: bigint;
  expiredAt: bigint;
  description: string;
  deliverable: string;
  status: number;
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const client = getBaseSepoliaClient();
      const count = await client.readContract({
        ...agentJobsConfig,
        functionName: "jobCount",
      }) as bigint;

      const jobPromises = [];
      const start = count > 20n ? count - 20n : 1n;
      for (let i = count; i >= start; i--) {
        jobPromises.push(
          client.readContract({
            ...agentJobsConfig,
            functionName: "getJob",
            args: [i],
          })
        );
      }

      const results = await Promise.allSettled(jobPromises);
      const fetchedJobs = results
        .filter((r): r is PromiseFulfilledResult<JobData> => r.status === "fulfilled")
        .map((r) => r.value);

      setJobs(fetchedJobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
