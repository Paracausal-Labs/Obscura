"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityStream } from "@/hooks/useActivityStream";

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  complete: { label: "Done", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  submit: { label: "Submitted", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  pickup: { label: "Working", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  reject: { label: "Rejected", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  evaluate: { label: "Evaluating", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

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
    .map(([jobId, evts]) => ({
      jobId,
      latestEvent: evts[0],
      agent: evts[0].agent,
      status: evts[0].type,
    }))
    .slice(0, 20);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Jobs</h3>
        {jobs.length === 0 ? (
          <p className="text-xs text-zinc-600 py-4 text-center">No jobs yet</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => {
              const badge = STATUS_BADGES[job.status] || STATUS_BADGES.pickup;
              return (
                <div
                  key={job.jobId}
                  className="flex items-center justify-between py-2 px-3 rounded bg-zinc-800/50"
                >
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
