import type { AgentRole, ActivityEvent, AgentResult, UserPrefs, Job } from "@obscura/shared";

export interface AgentContext {
  job: Job;
  userPrefs: UserPrefs;
  userEnsName: string;
  userSignature: string;
}

export interface AgentHandler {
  role: AgentRole;
  execute(context: AgentContext): Promise<AgentResult>;
}

export type ActivityEmitter = (event: Omit<ActivityEvent, "id" | "timestamp">) => void;

export interface OrchestratorState {
  activeJobs: Map<number, { agent: AgentRole; startedAt: number }>;
  activityLog: ActivityEvent[];
}
