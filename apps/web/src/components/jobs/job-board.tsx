"use client";

import { useActivityStream } from "@/hooks/useActivityStream";
import { useAccount } from "wagmi";
import { RateAgent } from "./rate-agent";
import { ViewReport } from "./view-report";
import type { AgentRole } from "@obscura/shared";

const STATUS_BADGES: Record<string, { label: string; class: string; color: string }> = {
  complete: { label: "Done", class: "bg-green-500/5 text-green-400 border-green-500/10", color: "#4ade80" },
  submit: { label: "Success", class: "bg-blue-500/5 text-blue-400 border-blue-500/10", color: "#60a5fa" },
  pickup: { label: "Working", class: "bg-yellow-500/5 text-yellow-400 border-yellow-500/10", color: "#facc15" },
  reject: { label: "Failed", class: "bg-red-500/5 text-red-400 border-red-500/10", color: "#f87171" },
  evaluate: { label: "Audit", class: "bg-amber-500/5 text-amber-400 border-amber-500/10", color: "#fbbf24" },
  tool_call: { label: "Compute", class: "bg-violet-500/5 text-violet-400 border-violet-500/10", color: "#a78bfa" },
};

const AGENT_COLORS: Record<string, string> = {
  scout: "#aaaaaa",
  analyst: "#888888",
  ghost: "#ff0033",
  sentinel: "#cccccc",
};

const SETTLED_TYPES = new Set(["complete", "reject"]);

export function JobBoard() {
  const { events } = useActivityStream();
  const { address } = useAccount();

  // Group events by jobId to show job status
  const jobEvents = events.filter((e) => e.jobId);
  const jobMap = new Map<number, typeof events>();
  for (const event of jobEvents) {
    if (!event.jobId) continue;
    if (!jobMap.has(event.jobId)) jobMap.set(event.jobId, []);
    jobMap.get(event.jobId)!.push(event);
  }

  const jobs = Array.from(jobMap.entries())
    .map(([jobId, evts]) => {
      const orchestratorPickup = evts.find(
        (e) => e.type === "pickup" && e.metadata?.client
      );
      const workerAgent =
        orchestratorPickup?.agent ??
        evts.find((e) => e.type === "pickup" && e.agent !== "sentinel")?.agent ??
        evts[evts.length - 1].agent;
      const submitEvent = evts.find(
        (e) => e.type === "submit" && e.metadata?.fileverseFileId
      );
      const fileId = submitEvent?.metadata?.fileverseFileId as string | undefined;
      const clientAddress = orchestratorPickup?.metadata?.client as string | undefined;
      const settledEvent = evts.find((e) => SETTLED_TYPES.has(e.type));
      return {
        jobId,
        latestEvent: evts[0],
        agent: workerAgent,
        status: settledEvent?.type ?? evts[0].type,
        isSettled: !!settledEvent,
        fileId,
        clientAddress,
      };
    })
    .slice(0, 10);

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
      <div className="absolute top-0 left-0 w-48 h-48 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.02] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            Execution Ledger
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">Active Jobs</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
           <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Buffer_Sync: ACTIVE</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mb-4" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              NO_JOBS_LOADED
            </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const badge = STATUS_BADGES[job.status] || STATUS_BADGES.pickup;
            const agentColor = AGENT_COLORS[job.agent as string] || "#ffffff";
            return (
              <div
                key={job.jobId}
                className="group/job rounded-2xl bg-white/[0.01] border border-white/[0.03] p-4 hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#07080a] border border-white/[0.05] flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{String(job.jobId).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-300 truncate pr-4 group-hover/job:text-white transition-colors">
                        {job.latestEvent.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: agentColor }}>
                          {job.agent}.eth
                        </span>
                        <span className="text-zinc-800 text-[10px] font-mono">::</span>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                          TX_ID: {job.latestEvent.id.slice(0, 12)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div 
                      className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badge.class}`}
                      style={{ boxShadow: `0 0 10px ${badge.color}15` }}
                    >
                      {badge.label}
                    </div>
                  </div>
                </div>

                {job.isSettled && address?.toLowerCase() === job.clientAddress?.toLowerCase() && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">Settlement Engine</span>
                        <RateAgent
                          jobId={job.jobId}
                          agentRole={job.agent as AgentRole}
                        />
                      </div>
                      {job.fileId && (
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">Encrypted Intelligence</span>
                          <ViewReport jobId={job.jobId} fileId={job.fileId} />
                        </div>
                      )}
                    </div>
                    <div className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.2em] ml-auto">
                      ERC-8183_SETTLED_BY_SENTINEL
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
