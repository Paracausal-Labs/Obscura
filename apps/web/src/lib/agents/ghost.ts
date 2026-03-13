import { AgentRole } from "@obscura/shared";
import type { AgentResult } from "@obscura/shared";
import { BaseAgent } from "./base-agent";
import type { AgentContext } from "./types";
import {
  getSwapQuote,
  executeSwap,
  getTransactionStatus,
} from "../integrations/heyelsa";
import { signAndBroadcast, createAddress, isBitGoEnabled } from "../integrations/bitgo";
import { createEncryptedReport } from "../integrations/fileverse";

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSwapParams(description: string): {
  from_token: string;
  to_token: string;
  amount: string;
  wallet_address: string;
} {
  const lower = description.toLowerCase();

  const amountMatch = lower.match(/([\d.]+)\s+(\w+)/);
  const toMatch = lower.match(/(?:to|for|into)\s+(\w+)/);

  return {
    from_token: amountMatch?.[2] ?? "ETH",
    to_token: toMatch?.[1] ?? "USDC",
    amount: amountMatch?.[1] ?? "0",
    wallet_address: description.match(/0x[a-fA-F0-9]{40}/)?.[0] ?? "",
  };
}

export class GhostAgent extends BaseAgent {
  role = AgentRole.Ghost;

  protected async execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult> {
    const { job, userPrefs, userSignature } = context;
    const jobId = Number(job.id);
    const swapParams = parseSwapParams(job.description);

    const amountNum = parseFloat(swapParams.amount);
    const maxTrade = parseFloat(userPrefs.maxTrade);
    if (amountNum > maxTrade) {
      this.emit({
        agent: this.role,
        type: "error",
        message: `Trade amount ${amountNum} exceeds user max trade limit ${maxTrade}`,
        jobId,
      });
      return {
        success: false,
        deliverableHash: "",
        metadata: {
          toolsCalled,
          duration: 0,
          reasoning: `Trade amount ${amountNum} exceeds max trade limit ${maxTrade}`,
        },
      };
    }

    // Step 1: Get swap quote (always runs — works regardless of BitGo)
    this.emitToolCall("getSwapQuote", jobId);
    toolsCalled.push("getSwapQuote");
    const quote = await getSwapQuote({
      from_token: swapParams.from_token,
      to_token: swapParams.to_token,
      amount: swapParams.amount,
    });

    // If BitGo is disabled, produce a quote + policy preview report only
    if (!isBitGoEnabled()) {
      this.emit({
        agent: this.role,
        type: "tool_call",
        message: `BitGo unavailable — Ghost producing quote preview for Job #${jobId}`,
        jobId,
      });

      this.emitToolCall("writeEncryptedReport", jobId);
      toolsCalled.push("writeEncryptedReport");

      const report = await createEncryptedReport(
        `Ghost Quote Preview — Job #${jobId}`,
        buildPreviewReport(swapParams, quote),
        userSignature,
        job.id.toString()
      );

      this.emit({
        agent: this.role,
        type: "submit",
        message: `Ghost submitted quote preview for Job #${jobId} (BitGo execution unavailable)`,
        jobId,
      });

      return {
        success: true,
        deliverableHash: report.encryptedContent,
        fileverseFileId: report.fileId,
        metadata: {
          toolsCalled,
          duration: 0,
          reasoning: "Quote and policy preview produced. BitGo execution currently unavailable — no funds were moved.",
        },
      };
    }

    // === Full BitGo execution path (BITGO_ENABLED=true) ===

    // Step 0: Create BitGo intermediary address for privacy (fail-closed)
    this.emitToolCall("createIntermediaryAddress", jobId);
    toolsCalled.push("createIntermediaryAddress");

    let intermediaryAddress: string;
    try {
      const addrResult = await createAddress(`job-${jobId}`) as { address?: string };
      if (!addrResult.address) {
        throw new Error("BitGo returned no address");
      }
      intermediaryAddress = addrResult.address;
      this.emit({
        agent: this.role,
        type: "tool_call",
        message: `Created BitGo intermediary address for Job #${jobId}: ${intermediaryAddress.slice(0, 10)}...`,
        jobId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.emit({
        agent: this.role,
        type: "error",
        message: `BitGo intermediary creation failed for Job #${jobId}: ${message}. Aborting to protect user privacy.`,
        jobId,
      });
      return {
        success: false,
        deliverableHash: "",
        metadata: {
          toolsCalled,
          duration: 0,
          reasoning: `Aborted: could not create intermediary address (${message}). User wallet privacy preserved.`,
        },
      };
    }

    // Step 2: Execute swap via intermediary address (dry_run to get pipeline_id)
    this.emitToolCall("executeSwap(dry_run)", jobId);
    toolsCalled.push("executeSwap");
    const dryRunResult = await executeSwap({
      from_token: swapParams.from_token,
      to_token: swapParams.to_token,
      amount: swapParams.amount,
      wallet_address: intermediaryAddress,
      dry_run: true,
    });

    const pipelineId = dryRunResult.pipeline_id as string;
    if (!pipelineId) {
      throw new Error("No pipeline_id returned from dry run execution");
    }

    // Step 3: Poll transaction status until sign_pending
    this.emitToolCall("getTransactionStatus", jobId);
    toolsCalled.push("getTransactionStatus");

    let txStatus: Record<string, string> = {};
    for (let i = 0; i < MAX_POLLS; i++) {
      txStatus = await getTransactionStatus(pipelineId);
      if (txStatus.status === "sign_pending") break;
      if (txStatus.status === "failed" || txStatus.status === "error") {
        throw new Error(
          `Transaction pipeline failed: ${txStatus.message ?? txStatus.status}`
        );
      }
      await sleep(POLL_INTERVAL_MS);
    }

    if (txStatus.status !== "sign_pending") {
      throw new Error(
        `Transaction did not reach sign_pending after ${MAX_POLLS} polls`
      );
    }

    // Step 4: Attempt BitGo signing
    let signResult: unknown = null;
    let signingFailed = false;

    try {
      this.emitToolCall("signAndBroadcast", jobId);
      toolsCalled.push("signAndBroadcast");
      signResult = await signAndBroadcast(txStatus.unsigned_tx);
    } catch (error) {
      signingFailed = true;
      const message = error instanceof Error ? error.message : "Unknown error";
      this.emit({
        agent: this.role,
        type: "error",
        message: `BitGo signing failed: ${message}. Recording attempt.`,
        jobId,
      });
    }

    // Step 5: Write encrypted confirmation report
    this.emitToolCall("writeEncryptedReport", jobId);
    toolsCalled.push("writeEncryptedReport");

    const reportContent = signingFailed
      ? buildFailureReport(swapParams, quote, pipelineId, intermediaryAddress)
      : buildSuccessReport(swapParams, quote, pipelineId, signResult, intermediaryAddress);

    const report = await createEncryptedReport(
      `Ghost Execution — Job #${jobId}`,
      reportContent,
      userSignature,
      job.id.toString()
    );

    this.emit({
      agent: this.role,
      type: "submit",
      message: `Ghost submitted ${signingFailed ? "partial" : "execution"} report for Job #${jobId}`,
      jobId,
    });

    return {
      success: !signingFailed,
      deliverableHash: signingFailed ? "" : report.encryptedContent,
      fileverseFileId: report.fileId,
      metadata: {
        toolsCalled,
        duration: 0,
        reasoning: signingFailed
          ? "Swap quote obtained but BitGo signing failed"
          : "Swap executed and signed via BitGo",
      },
    };
  }
}

function buildPreviewReport(
  params: ReturnType<typeof parseSwapParams>,
  quote: unknown
): string {
  return [
    `## Swap Quote Preview (BitGo Execution Unavailable)`,
    `- **From:** ${params.amount} ${params.from_token}`,
    `- **To:** ${params.to_token}`,
    `- **Quote:** ${JSON.stringify(quote)}`,
    `- **Mode:** Quote + policy preview only`,
    `- **BitGo Status:** Not configured — no intermediary address created, no funds moved`,
    `- **Privacy:** User EOA was never exposed to any DEX`,
  ].join("\n");
}

function buildSuccessReport(
  params: ReturnType<typeof parseSwapParams>,
  quote: unknown,
  pipelineId: string,
  signResult: unknown,
  intermediaryAddress: string
): string {
  return [
    `## Swap Execution Report`,
    `- **From:** ${params.amount} ${params.from_token}`,
    `- **To:** ${params.to_token}`,
    `- **Intermediary:** ${intermediaryAddress}`,
    `- **Quote:** ${JSON.stringify(quote)}`,
    `- **Pipeline ID:** ${pipelineId}`,
    `- **BitGo TX:** ${JSON.stringify(signResult)}`,
    `- **Status:** Signed and broadcast via BitGo intermediary`,
  ].join("\n");
}

function buildFailureReport(
  params: ReturnType<typeof parseSwapParams>,
  quote: unknown,
  pipelineId: string,
  intermediaryAddress: string
): string {
  return [
    `## Swap Attempt Report (Signing Failed)`,
    `- **From:** ${params.amount} ${params.from_token}`,
    `- **To:** ${params.to_token}`,
    `- **Intermediary:** ${intermediaryAddress}`,
    `- **Quote:** ${JSON.stringify(quote)}`,
    `- **Pipeline ID:** ${pipelineId}`,
    `- **Status:** Quote obtained, signing failed`,
    `- **Action Required:** Manual review needed`,
  ].join("\n");
}
