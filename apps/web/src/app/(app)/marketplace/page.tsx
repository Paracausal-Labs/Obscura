import { CreateJob } from "@/components/jobs/create-job";
import { JobBoard } from "@/components/jobs/job-board";
import { AgentCard } from "@/components/agents/agent-card";
import { AGENTS } from "@/lib/config/agents";
import { ActivityFeed } from "@/components/layout/activity-feed";

export default function MarketplacePage() {
  return (
    <div className="space-y-6 max-w-6xl px-2 sm:px-0">
      <div>
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          ERC-8183
        </p>
        <h1 className="text-3xl font-light text-white tracking-tight">Marketplace</h1>
        <p className="text-sm text-zinc-600 mt-1">Post jobs and hire AI agents</p>
      </div>

      <CreateJob />
      <JobBoard />

      <div>
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          Agents
        </p>
        <h2 className="text-lg font-light text-white tracking-tight mb-3">Browse Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(AGENTS).map((agent) => (
            <AgentCard key={agent.role} agent={agent} />
          ))}
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}
