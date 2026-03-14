"use client";

import { useState, useEffect, useCallback } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useAccount } from "wagmi";
import { getAgentRoleByAddress } from "@/lib/config/addresses";
import { ViewReport } from "./view-report";

const STATUS_MAP: Record<number, { label: string; class: string }> = {
  0: { label: "Created", class: "text-zinc-500 border-zinc-700/30 bg-zinc-800/10" },
  1: { label: "Funded", class: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
  2: { label: "Submitted", class: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
  3: { label: "Completed", class: "text-green-400 border-green-500/20 bg-green-500/5" },
  4: { label: "Rejected", class: "text-red-400 border-red-500/20 bg-red-500/5" },
  5: { label: "Refunded", class: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5" },
};

export function JobHistory() {
  const { jobs, loading, refetch } = useJobs();
  const { address } = useAccount();
  const [fileIdMap, setFileIdMap] = useState<Record<string, string>>({});

  const fetchFileIds = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.fileIds) setFileIdMap(data.fileIds);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchFileIds(); }, [fetchFileIds]);

  // Re-fetch fileIds when jobs change (new job completed)
  useEffect(() => { fetchFileIds(); }, [jobs, fetchFileIds]);

  const myJobs = jobs.filter(
    (j) => j.client.toLowerCase() === (address?.toLowerCase() ?? "")
  );

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            On-Chain Record
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">Job History</h3>
        </div>
        <button
          onClick={() => { refetch(); fetchFileIds(); }}
          className="px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:border-[#ff0033]/20 hover:text-zinc-300 transition-all"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/[0.02] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : myJobs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
            {address ? "NO_JOBS_FOUND_FOR_WALLET" : "CONNECT_WALLET_TO_VIEW"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myJobs.map((job) => {
            const status = STATUS_MAP[job.status] ?? STATUS_MAP[0];
            const agentRole = getAgentRoleByAddress(job.provider);
            const agentName = agentRole ?? "unknown";
            const fileId = fileIdMap[String(Number(job.id))];
            const isSettled = job.status === 3 || job.status === 4;
            const budgetUsdc = (Number(job.budget) / 1e6).toFixed(2);

            return (
              <div
                key={Number(job.id)}
                className="rounded-2xl bg-white/[0.01] border border-white/[0.03] p-4 hover:border-white/[0.08] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#07080a] border border-white/[0.05] flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{String(Number(job.id)).padStart(3, "0")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-300 truncate pr-4">
                        {job.description.length > 80
                          ? job.description.slice(0, 80) + "..."
                          : job.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          {agentName}.eth
                        </span>
                        <span className="text-zinc-800 text-[10px]">/</span>
                        <span className="text-[10px] font-mono text-zinc-600">
                          {budgetUsdc} USDC
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0 ${status.class}`}
                  >
                    {status.label}
                  </div>
                </div>

                {isSettled && fileId && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-zinc-700 uppercase tracking-widest">
                        Encrypted Report
                      </span>
                      <ViewReport jobId={Number(job.id)} fileId={fileId} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
