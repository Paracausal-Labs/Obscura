export type Address = `0x${string}`;

export enum JobStatus {
  Open = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Rejected = 4,
  Expired = 5,
}

export enum AgentRole {
  Scout = "scout",
  Analyst = "analyst",
  Ghost = "ghost",
  Sentinel = "sentinel",
}

export enum AgentState {
  Idle = "IDLE",
  Working = "WORKING",
  Evaluating = "EVAL",
  Executing = "EXEC",
}

export interface Job {
  id: bigint;
  client: Address;
  provider: Address;
  evaluator: Address;
  budget: bigint;
  expiredAt: bigint;
  description: string;
  deliverable: string;
  status: JobStatus;
}

export interface AgentMetadata {
  id: number;
  role: AgentRole;
  name: string;
  ensName: string;
  address: Address;
  description: string;
  skills: string[];
  baseFee: number;
  systemPrompt: string;
}

export interface AgentReputation {
  agentId: number;
  avgScore: number;
  reviewCount: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  agent: AgentRole;
  type: "pickup" | "tool_call" | "submit" | "evaluate" | "complete" | "reject" | "error" | "killswitch";
  message: string;
  jobId?: number;
  metadata?: Record<string, unknown>;
}

export interface UserPrefs {
  risk: string;
  assets: string;
  maxTrade: string;
  protocols: string;
  killswitch: boolean;
  preferred: string;
}

export interface AgentResult {
  success: boolean;
  deliverableHash: string;
  fileverseFileId?: string;
  metadata: {
    toolsCalled: string[];
    duration: number;
    reasoning: string;
  };
}

export interface EncryptedPayload {
  iv: string;
  tag: string;
  encrypted: string;
}
