import { AgentRole } from "@obscura/shared";
import type { AgentResult } from "@obscura/shared";
import { BaseAgent } from "./base-agent";
import type { AgentContext } from "./types";

const EXPECTED_TOOLS: Record<string, string[]> = {
  [AgentRole.Scout]: [
    "searchToken",
    "getTokenPrice",
    "getYieldSuggestions",
    "webSearch",
    "writeEncryptedReport",
  ],
  [AgentRole.Analyst]: [
    "analyzeWallet",
    "getPortfolio",
    "getPnlReport",
    "writeEncryptedReport",
  ],
  [AgentRole.Ghost]: [
    "getSwapQuote",
    "executeSwap",
    "getTransactionStatus",
    "signAndBroadcast",
    "writeEncryptedReport",
  ],
};

const TIMELINESS_THRESHOLD_MS = 60_000;
const PASS_THRESHOLD = 50;

interface EvaluationContext {
  targetRole: AgentRole;
  toolsCalled: string[];
  duration: number;
  deliverableHash: string;
  reasoning: string;
  userRisk: string;
  agentSuccess?: boolean;
}

export class SentinelAgent extends BaseAgent {
  role = AgentRole.Sentinel;

  protected async execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult> {
    const jobId = Number(context.job.id);
    const evalCtx = context.job.deliverable
      ? (JSON.parse(context.job.deliverable) as EvaluationContext)
      : ({} as EvaluationContext);

    toolsCalled.push("evaluate");

    if (evalCtx.agentSuccess === false) {
      this.emit({
        agent: this.role,
        type: "reject",
        message: `Sentinel auto-rejected Job #${jobId} — agent reported failure`,
        jobId,
      });
      return {
        success: false,
        deliverableHash: "",
        metadata: {
          toolsCalled,
          duration: 0,
          reasoning: "Auto-rejected: agent reported execution failure",
        },
      };
    }

    this.emit({
      agent: this.role,
      type: "evaluate",
      message: `Sentinel evaluating ${evalCtx.targetRole} output for Job #${jobId}`,
      jobId,
    });

    // Hard reject: no deliverable means nothing to evaluate
    const hasDeliverable = Boolean(evalCtx.deliverableHash);
    if (!hasDeliverable) {
      this.emit({
        agent: this.role,
        type: "reject",
        message: `Sentinel rejected Job #${jobId} — no deliverable produced`,
        jobId,
      });
      return {
        success: false,
        deliverableHash: "",
        metadata: {
          toolsCalled,
          duration: 0,
          reasoning: "Rejected: agent produced no deliverable (score 0/100)",
        },
      };
    }

    // Score component 1: Deliverable exists (+30)
    const deliverableScore = 30;

    // Score component 2: Expected tools called (+25)
    const expected = EXPECTED_TOOLS[evalCtx.targetRole] ?? [];
    const calledSet = new Set(evalCtx.toolsCalled ?? []);
    const toolHits = expected.filter((t) => calledSet.has(t)).length;
    const toolScore =
      expected.length > 0
        ? Math.round((toolHits / expected.length) * 25)
        : 25;

    // Score component 3: Timeliness (+20)
    const timely =
      typeof evalCtx.duration === "number" &&
      evalCtx.duration < TIMELINESS_THRESHOLD_MS;
    const timelinessScore = timely ? 20 : 0;

    // Score component 4: Risk compliance (+25)
    const riskScore = evaluateRiskCompliance(
      evalCtx.reasoning ?? "",
      evalCtx.userRisk ?? "moderate"
    );

    const totalScore =
      deliverableScore + toolScore + timelinessScore + riskScore;
    const passed = totalScore >= PASS_THRESHOLD;

    const breakdown = {
      deliverableScore,
      toolScore,
      timelinessScore,
      riskScore,
      totalScore,
      passed,
    };

    const eventType = passed ? "complete" : "reject";
    this.emit({
      agent: this.role,
      type: eventType,
      message: `Sentinel ${eventType}d Job #${jobId} — score ${totalScore}/100`,
      jobId,
      metadata: breakdown,
    });

    return {
      success: passed,
      deliverableHash: evalCtx.deliverableHash ?? "",
      metadata: {
        toolsCalled,
        duration: 0,
        reasoning: `Score ${totalScore}/100: deliverable=${deliverableScore}, tools=${toolScore}, timeliness=${timelinessScore}, risk=${riskScore}`,
      },
    };
  }
}

function evaluateRiskCompliance(reasoning: string, userRisk: string): number {
  const lower = reasoning.toLowerCase();

  if (userRisk === "low" || userRisk === "conservative") {
    const riskyTerms = ["high risk", "leverag", "degen", "volatile", "memecoin"];
    const hasRisky = riskyTerms.some((term) => lower.includes(term));
    return hasRisky ? 5 : 25;
  }

  if (userRisk === "high" || userRisk === "aggressive") {
    return 25;
  }

  // moderate: penalize only extremes
  const extremeTerms = ["100x", "all-in", "max leverage"];
  const hasExtreme = extremeTerms.some((term) => lower.includes(term));
  return hasExtreme ? 10 : 25;
}
