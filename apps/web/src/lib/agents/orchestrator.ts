import { keccak256, toHex } from "viem";
import { AgentRole } from "@obscura/shared";
import type { ActivityEvent, AgentResult, Job } from "@obscura/shared";
import type { AgentContext, ActivityEmitter, OrchestratorState } from "./types";
import { classifyJobAgent } from "../config/agents";
import { getAgentRoleByAddress } from "../config/addresses";
import { getUserPreferences } from "../integrations/ens";
import { getAgentWalletClient, getBaseSepoliaClient } from "../config/chains";
import { agentJobsConfig } from "../contracts/agent-jobs";
import { ScoutAgent } from "./scout";
import { AnalystAgent } from "./analyst";
import { GhostAgent } from "./ghost";
import { SentinelAgent } from "./sentinel";
import { BaseAgent } from "./base-agent";

type ActivityCallback = (event: ActivityEvent) => void;

let eventCounter = 0;

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
    for (const callback of Array.from(this.subscribers)) {
      try {
        callback(event);
      } catch {
        // Never let subscriber errors break the pipeline
      }
    }
  };

  async processJob(
    job: Job,
    userEnsName: string,
    userSignature: string
  ): Promise<{
    agentResult: AgentResult;
    sentinelResult: AgentResult;
    assignedRole: AgentRole;
  }> {
    const jobId = Number(job.id);

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

    // Submit deliverable on-chain (provider role)
    await this.submitOnChain(job, agentResult, jobId);

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

    // Complete or reject on-chain (evaluator role)
    await this.settleOnChain(job, sentinelResult, jobId);

    // Clean up active job tracking
    this.state.activeJobs.delete(jobId);

    return { agentResult, sentinelResult, assignedRole };
  }

  private async submitOnChain(
    job: Job,
    agentResult: AgentResult,
    jobId: number
  ): Promise<void> {
    try {
      const walletClient = getAgentWalletClient();
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
        agent: AgentRole.Sentinel,
        type: "tool_call",
        message: `On-chain submit for Job #${jobId} (tx: ${hash.slice(0, 10)}...)`,
        jobId,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      this.emitActivity({
        agent: AgentRole.Sentinel,
        type: "error",
        message: `On-chain submit failed for Job #${jobId}: ${msg}`,
        jobId,
      });
    }
  }

  private async settleOnChain(
    job: Job,
    sentinelResult: AgentResult,
    jobId: number
  ): Promise<void> {
    try {
      const walletClient = getAgentWalletClient();
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
        agent: AgentRole.Sentinel,
        type: sentinelResult.success ? "complete" : "reject",
        message: `On-chain ${functionName} for Job #${jobId} (tx: ${hash.slice(0, 10)}...)`,
        jobId,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      this.emitActivity({
        agent: AgentRole.Sentinel,
        type: "error",
        message: `On-chain ${sentinelResult.success ? "complete" : "reject"} failed for Job #${jobId}: ${msg}`,
        jobId,
      });
    }
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

// Singleton orchestrator instance
export const orchestrator = new Orchestrator();
