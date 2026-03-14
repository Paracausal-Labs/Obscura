import { keccak256, toHex } from "viem";
import { AgentRole } from "@obscura/shared";
import type { ActivityEvent, AgentResult, Job } from "@obscura/shared";
import type { AgentContext, ActivityEmitter, OrchestratorState } from "./types";
import { classifyJobAgent, AGENTS } from "../config/agents";
import { getAgentRoleByAddress } from "../config/addresses";
import { getUserPreferences } from "../integrations/ens";
import { getWalletClientForRole, getBaseSepoliaClient } from "../config/chains";
import { agentJobsConfig } from "../contracts/agent-jobs";
import { reputationConfig } from "../contracts/reputation";
import { storeFileId } from "../integrations/local-reports";
import { ScoutAgent } from "./scout";
import { AnalystAgent } from "./analyst";
import { GhostAgent } from "./ghost";
import { SentinelAgent } from "./sentinel";
import { BaseAgent } from "./base-agent";

type ActivityCallback = (event: ActivityEvent) => void;

let eventCounter = 0;

export interface ProcessJobResult {
  agentResult: AgentResult;
  sentinelResult: AgentResult;
  assignedRole: AgentRole;
  onChainSettled: boolean;
  onChainError?: string;
  reputationRecorded: boolean;
  reputationError?: string;
}

class Orchestrator {
  private state: OrchestratorState = {
    activeJobs: new Map(),
    activityLog: [],
  };

  private subscribers = new Set<ActivityCallback>();

  private emitActivity: ActivityEmitter = (partial) => {
    const event: ActivityEvent = {
      ...partial,
      id: `evt_${++eventCounter}`,
      timestamp: Date.now(),
    };
    this.state.activityLog.push(event);
    if (this.state.activityLog.length > 500) {
      this.state.activityLog = this.state.activityLog.slice(-500);
    }
    for (const callback of Array.from(this.subscribers)) {
      try {
        callback(event);
      } catch {
        // Never let subscriber errors break the pipeline
      }
    }
  };

  isJobActive(jobId: number): boolean {
    return this.state.activeJobs.has(jobId);
  }

  async processJob(
    job: Job,
    userEnsName: string,
    userSignature: string
  ): Promise<ProcessJobResult> {
    const jobId = Number(job.id);

    // Idempotency guard: reject if job is already being processed
    if (this.state.activeJobs.has(jobId)) {
      throw new Error(`Job #${jobId} is already being processed`);
    }

    // Use on-chain provider address if set, fall back to description classification
    const assignedRole = getAgentRoleByAddress(job.provider) ?? classifyJobAgent(job.description);

    this.state.activeJobs.set(jobId, {
      agent: assignedRole,
      startedAt: Date.now(),
    });

    this.emitActivity({
      agent: assignedRole,
      type: "pickup",
      message: `Orchestrator assigned Job #${jobId} to ${assignedRole}`,
      jobId,
      metadata: { client: job.client },
    });

    // Fetch user preferences from ENS
    const userPrefs = await getUserPreferences(userEnsName);

    const context: AgentContext = {
      job,
      userPrefs,
      userEnsName,
      userSignature,
    };

    // Create and run the assigned agent
    const agent = this.createAgent(assignedRole);
    const agentResult = await agent.run(context);

    // Persist fileId and emit report availability for frontend
    if (agentResult.fileverseFileId) {
      await storeFileId(String(jobId), agentResult.fileverseFileId);
      this.emitActivity({
        agent: assignedRole,
        type: "submit",
        message: `Encrypted report ready for Job #${jobId}`,
        jobId,
        metadata: { fileverseFileId: agentResult.fileverseFileId },
      });
    }

    // Submit deliverable on-chain (provider role)
    const submitTx = await this.submitOnChain(job, agentResult, assignedRole, jobId);
    if (!submitTx.ok) {
      this.state.activeJobs.delete(jobId);
      return {
        agentResult,
        sentinelResult: agentResult,
        assignedRole,
        onChainSettled: false,
        onChainError: `submit failed: ${submitTx.error}`,
        reputationRecorded: false,
      };
    }

    // Build evaluation context for Sentinel
    const evalPayload = JSON.stringify({
      targetRole: assignedRole,
      toolsCalled: agentResult.metadata.toolsCalled,
      duration: agentResult.metadata.duration,
      deliverableHash: agentResult.deliverableHash,
      reasoning: agentResult.metadata.reasoning,
      userRisk: userPrefs.risk,
      agentSuccess: agentResult.success,
    });

    const sentinelJob: Job = {
      ...job,
      deliverable: evalPayload,
    };

    const sentinelContext: AgentContext = {
      job: sentinelJob,
      userPrefs,
      userEnsName,
      userSignature,
    };

    // Run Sentinel evaluation
    const sentinel = new SentinelAgent(this.emitActivity);
    const sentinelResult = await sentinel.run(sentinelContext);

    // Resolve evaluator role from on-chain evaluator address
    const evaluatorRole = getAgentRoleByAddress(job.evaluator) ?? AgentRole.Sentinel;

    // Complete or reject on-chain (evaluator role)
    const settleTx = await this.settleOnChain(job, sentinelResult, evaluatorRole, jobId);
    if (!settleTx.ok) {
      this.state.activeJobs.delete(jobId);
      return {
        agentResult,
        sentinelResult,
        assignedRole,
        onChainSettled: false,
        onChainError: `${sentinelResult.success ? "complete" : "reject"} failed: ${settleTx.error}`,
        reputationRecorded: false,
      };
    }

    // Write ERC-8004 reputation feedback on-chain (sentinel rates the worker agent)
    const repTx = await this.writeReputation(job, sentinelResult, assignedRole, jobId);

    // Clean up active job tracking
    this.state.activeJobs.delete(jobId);

    return {
      agentResult,
      sentinelResult,
      assignedRole,
      onChainSettled: true,
      reputationRecorded: repTx.ok,
      reputationError: repTx.ok ? undefined : repTx.error,
    };
  }

  private async submitOnChain(
    job: Job,
    agentResult: AgentResult,
    providerRole: AgentRole,
    jobId: number
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const walletClient = getWalletClientForRole(providerRole);
      const publicClient = getBaseSepoliaClient();

      const deliverableContent = agentResult.deliverableHash || "no-deliverable";
      const deliverableBytes = keccak256(toHex(deliverableContent));

      const hash = await walletClient.writeContract({
        ...agentJobsConfig,
        functionName: "submit",
        args: [job.id, deliverableBytes],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      this.emitActivity({
        agent: providerRole,
        type: "tool_call",
        message: `On-chain submit for Job #${jobId} (tx: ${hash.slice(0, 10)}...)`,
        jobId,
      });

      return { ok: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      this.emitActivity({
        agent: providerRole,
        type: "error",
        message: `On-chain submit failed for Job #${jobId}: ${msg}`,
        jobId,
      });
      return { ok: false, error: msg };
    }
  }

  private async settleOnChain(
    job: Job,
    sentinelResult: AgentResult,
    evaluatorRole: AgentRole,
    jobId: number
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const walletClient = getWalletClientForRole(evaluatorRole);
      const publicClient = getBaseSepoliaClient();

      const reasonBytes = keccak256(toHex(sentinelResult.metadata.reasoning));
      const functionName = sentinelResult.success ? "complete" : "reject";

      const hash = await walletClient.writeContract({
        ...agentJobsConfig,
        functionName,
        args: [job.id, reasonBytes],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      this.emitActivity({
        agent: evaluatorRole,
        type: sentinelResult.success ? "complete" : "reject",
        message: `On-chain ${functionName} for Job #${jobId} (tx: ${hash.slice(0, 10)}...)`,
        jobId,
      });

      return { ok: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      this.emitActivity({
        agent: evaluatorRole,
        type: "error",
        message: `On-chain ${sentinelResult.success ? "complete" : "reject"} failed for Job #${jobId}: ${msg}`,
        jobId,
      });
      return { ok: false, error: msg };
    }
  }

  private async writeReputation(
    _job: Job,
    sentinelResult: AgentResult,
    providerRole: AgentRole,
    jobId: number
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const walletClient = getWalletClientForRole(AgentRole.Sentinel);
        const publicClient = getBaseSepoliaClient();

        const agentMeta = AGENTS[providerRole];
        // Extract actual granular score from Sentinel's reasoning (e.g. "Score 82/100: ...")
        const scoreMatch = sentinelResult.metadata.reasoning.match(/Score (\d+)\/100/);
        const score = BigInt(scoreMatch ? Number(scoreMatch[1]) : (sentinelResult.success ? 75 : 0));

        // Get fresh nonce to avoid stale nonce errors from rapid sequential txs
        const nonce = await publicClient.getTransactionCount({
          address: walletClient.account.address,
        });

        const hash = await walletClient.writeContract({
          ...reputationConfig,
          functionName: "giveFeedback",
          args: [
            BigInt(agentMeta.id),
            score,
            0,
            "obscura.job",
            providerRole,
            `job/${jobId}`,
            sentinelResult.metadata.reasoning,
            keccak256(toHex(sentinelResult.deliverableHash || "none")),
          ],
          nonce,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        this.emitActivity({
          agent: AgentRole.Sentinel,
          type: "tool_call",
          message: `ERC-8004 reputation recorded for ${providerRole} on Job #${jobId} (score: ${score})`,
          jobId,
        });
        return { ok: true };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        if (attempt < MAX_RETRIES && msg.includes("nonce")) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        this.emitActivity({
          agent: AgentRole.Sentinel,
          type: "error",
          message: `ERC-8004 reputation write failed for Job #${jobId}: ${msg}`,
          jobId,
        });
        return { ok: false, error: msg };
      }
    }
    return { ok: false, error: "Max retries exceeded" };
  }

  getActivityLog(): ActivityEvent[] {
    return [...this.state.activityLog];
  }

  subscribeToActivity(callback: ActivityCallback): void {
    this.subscribers.add(callback);
  }

  unsubscribeFromActivity(callback: ActivityCallback): void {
    this.subscribers.delete(callback);
  }

  private createAgent(role: AgentRole): BaseAgent {
    switch (role) {
      case AgentRole.Scout:
        return new ScoutAgent(this.emitActivity);
      case AgentRole.Analyst:
        return new AnalystAgent(this.emitActivity);
      case AgentRole.Ghost:
        return new GhostAgent(this.emitActivity);
      default:
        throw new Error(`No agent implementation for role: ${role}`);
    }
  }
}

// Singleton orchestrator instance — stored on globalThis to survive Next.js
// hot module replacement in dev mode. Without this, /api/agents (SSE) and
// /api/jobs (POST) can get different instances, breaking event streaming.
const globalForOrchestrator = globalThis as unknown as {
  orchestrator: Orchestrator | undefined;
};
export const orchestrator =
  globalForOrchestrator.orchestrator ?? new Orchestrator();
globalForOrchestrator.orchestrator = orchestrator;
