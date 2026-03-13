"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityStream } from "@/hooks/useActivityStream";
import { RateAgent } from "./rate-agent";
import { ViewReport } from "./view-report";
import type { AgentRole } from "@obscura/shared";

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  complete: { label: "Done", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  submit: { label: "Submitted", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  pickup: { label: "Working", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  reject: { label: "Rejected", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  evaluate: { label: "Evaluating", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  tool_call: { label: "Running", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

const SETTLED_TYPES = new Set(["complete", "reject"]);

export function JobBoard() {
  const { events } = useActivityStream();

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
      // The pickup event has the actual worker agent; settle events come from Sentinel
      const pickupEvent = evts.find((e) => e.type === "pickup");
      const workerAgent = pickupEvent?.agent ?? evts[evts.length - 1].agent;
      // Find fileverse report ID from submit event metadata
      const submitEvent = evts.find(
        (e) => e.type === "submit" && e.metadata?.fileverseFileId
      );
      const fileId = submitEvent?.metadata?.fileverseFileId as string | undefined;
      return {
        jobId,
        latestEvent: evts[0],
        agent: workerAgent,
        status: evts[0].type,
        isSettled: evts.some((e) => SETTLED_TYPES.has(e.type)),
        fileId,
      };
    })
    .slice(0, 20);

  return (
    <Card className="relative rounded-[2rem] border border-white/[0.06] bg-[#0c0d12] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <CardContent className="p-5">
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          Jobs
        </p>
        <h3 className="text-lg font-light text-white tracking-tight mb-3">Recent Jobs</h3>
        {jobs.length === 0 ? (
          <p className="text-xs text-zinc-600 py-4 text-center">No jobs yet</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => {
              const badge = STATUS_BADGES[job.status] || STATUS_BADGES.pickup;
              return (
                <div
                  key={job.jobId}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2 hover:border-white/[0.08] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 font-mono">#{job.jobId}</span>
                      <span className="text-sm truncate max-w-[200px]">
                        {job.latestEvent.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{job.agent}.eth</span>
                      <Badge variant="outline" className={badge.class}>
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                  {job.isSettled && (
                    <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600">Rate this agent (ERC-8004):</span>
                        <RateAgent
                          jobId={job.jobId}
                          agentRole={job.agent as AgentRole}
                        />
                      </div>
                      {job.fileId && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-600">Encrypted deliverable (Fileverse):</span>
                          <ViewReport jobId={job.jobId} fileId={job.fileId} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
