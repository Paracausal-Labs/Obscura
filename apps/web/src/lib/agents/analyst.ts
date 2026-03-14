import { z } from "zod";
import { tool } from "ai";
import { AgentRole } from "@obscura/shared";
import type { AgentResult } from "@obscura/shared";
import { BaseAgent } from "./base-agent";
import type { AgentContext } from "./types";
import { runAgent } from "../integrations/groq";
import { AGENTS } from "../config/agents";
import {
  analyzeWallet,
  getPortfolio,
  getPnlReport,
} from "../integrations/heyelsa";
import { webSearch, scrapeUrl } from "../integrations/agentcash";
import {
  getTopYields as llamaYields,
  getProtocolTvl as llamaProtocol,
} from "../integrations/defillama";
import { createEncryptedReport } from "../integrations/fileverse";
import { deriveKeyFromSignature, encrypt, encodePayload } from "../integrations/crypto";
import { storeLocalReport } from "../integrations/local-reports";

export class AnalystAgent extends BaseAgent {
  role = AgentRole.Analyst;

  protected async execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult> {
    const { job, userPrefs, userSignature } = context;
    const jobId = Number(job.id);
    const config = AGENTS[AgentRole.Analyst];

    const systemPrompt = `${config.systemPrompt}

User preferences (from ENS text records):
- Risk tolerance: ${userPrefs.risk}
- Preferred assets: ${userPrefs.assets}
- Max trade size: ${userPrefs.maxTrade}
- Preferred protocols: ${userPrefs.protocols}`;

    let deliverableHash = "";
    let fileverseFileId = "";

    const tools = {
      defiYields: tool({
        description:
          "Get top DeFi yield opportunities from DeFiLlama. Free and reliable.",
        inputSchema: z.object({
          chain: z.string().optional().describe("Filter by chain"),
          stablecoinOnly: z.boolean().default(false).describe("Only stablecoin pools"),
        }),
        execute: async ({ chain, stablecoinOnly }: { chain?: string; stablecoinOnly: boolean }) => {
          this.emitToolCall("defiYields", jobId);
          toolsCalled.push("defiYields");
          try { return await llamaYields(chain, stablecoinOnly); }
          catch (e) { return { error: `DeFiLlama unavailable: ${e instanceof Error ? e.message : "unknown"}` }; }
        },
      }),

      defiProtocol: tool({
        description: "Get TVL and details for a DeFi protocol from DeFiLlama.",
        inputSchema: z.object({
          protocol: z.string().describe("Protocol slug (e.g. 'aave', 'morpho')"),
        }),
        execute: async ({ protocol }: { protocol: string }) => {
          this.emitToolCall("defiProtocol", jobId);
          toolsCalled.push("defiProtocol");
          try { return await llamaProtocol(protocol); }
          catch (e) { return { error: `DeFiLlama protocol lookup failed: ${e instanceof Error ? e.message : "unknown"}` }; }
        },
      }),

      analyzeWallet: tool({
        description: "Deep analysis of a wallet's on-chain activity (HeyElsa, paid via x402)",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address to analyze"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ walletAddress, chain }: { walletAddress: string; chain: string }) => {
          this.emitToolCall("analyzeWallet", jobId);
          toolsCalled.push("analyzeWallet");
          try { return await analyzeWallet(walletAddress, chain); }
          catch (e) { return { error: `analyzeWallet failed (x402): ${e instanceof Error ? e.message : "payment/network error"}` }; }
        },
      }),

      getPortfolio: tool({
        description: "Get full portfolio breakdown for a wallet (HeyElsa, paid via x402)",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
        }),
        execute: async ({ walletAddress }: { walletAddress: string }) => {
          this.emitToolCall("getPortfolio", jobId);
          toolsCalled.push("getPortfolio");
          try { return await getPortfolio(walletAddress); }
          catch (e) { return { error: `getPortfolio failed (x402): ${e instanceof Error ? e.message : "payment/network error"}` }; }
        },
      }),

      getPnlReport: tool({
        description: "Get profit & loss report for a wallet (HeyElsa, paid via x402)",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
        }),
        execute: async ({ walletAddress }: { walletAddress: string }) => {
          this.emitToolCall("getPnlReport", jobId);
          toolsCalled.push("getPnlReport");
          try { return await getPnlReport(walletAddress); }
          catch (e) { return { error: `getPnlReport failed (x402): ${e instanceof Error ? e.message : "payment/network error"}` }; }
        },
      }),

      webSearch: tool({
        description: "Search the web (paid via x402). Try defiYields/defiProtocol first.",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("webSearch", jobId);
          toolsCalled.push("webSearch");
          try { return await webSearch(query); }
          catch (e) { return { error: `webSearch failed (x402): ${e instanceof Error ? e.message : "payment/network error"}` }; }
        },
      }),

      scrapeUrl: tool({
        description: "Scrape a URL for detailed content (paid via x402)",
        inputSchema: z.object({
          url: z.string().describe("URL to scrape"),
        }),
        execute: async ({ url }: { url: string }) => {
          this.emitToolCall("scrapeUrl", jobId);
          toolsCalled.push("scrapeUrl");
          try { return await scrapeUrl(url); }
          catch (e) { return { error: `scrapeUrl failed: ${e instanceof Error ? e.message : "network error"}` }; }
        },
      }),

      writeEncryptedReport: tool({
        description: "Write analysis to an encrypted Fileverse report",
        inputSchema: z.object({
          title: z.string().describe("Report title"),
          content: z.string().describe("Report content in markdown"),
        }),
        execute: async ({ title, content }: { title: string; content: string }) => {
          this.emitToolCall("writeEncryptedReport", jobId);
          toolsCalled.push("writeEncryptedReport");
          try {
            const result = await createEncryptedReport(
              title,
              content,
              userSignature,
              job.id.toString()
            );
            deliverableHash = result.encryptedContent;
            fileverseFileId = result.fileId;
            return { fileId: result.fileId, status: "saved" };
          } catch {
            const key = deriveKeyFromSignature(userSignature, job.id.toString());
            const markdown = `# ${title}\n\n${content}\n\n---\n*Generated by Obscura at ${new Date().toISOString()}*`;
            const payload = encrypt(markdown, key);
            deliverableHash = encodePayload(payload);
            fileverseFileId = `local:${job.id}`;
            storeLocalReport(job.id.toString(), deliverableHash);
            return { fileId: fileverseFileId, status: "saved (local fallback)" };
          }
        },
      }),
    };

    const result = await runAgent({
      system: systemPrompt,
      prompt: job.description,
      tools,
      maxSteps: 10,
    });

    // Force report if model didn't call writeEncryptedReport
    if (deliverableHash === "" && result.text) {
      this.emitToolCall("writeEncryptedReport", jobId);
      toolsCalled.push("writeEncryptedReport");
      try {
        const fvResult = await createEncryptedReport(
          `Analyst Report — Job #${jobId}`,
          result.text,
          userSignature,
          job.id.toString()
        );
        deliverableHash = fvResult.encryptedContent;
        fileverseFileId = fvResult.fileId;
      } catch {
        const key = deriveKeyFromSignature(userSignature, job.id.toString());
        const markdown = `# Analyst Report — Job #${jobId}\n\n${result.text}\n\n---\n*Generated by Obscura at ${new Date().toISOString()}*`;
        const payload = encrypt(markdown, key);
        deliverableHash = encodePayload(payload);
        fileverseFileId = `local:${job.id}`;
        storeLocalReport(job.id.toString(), deliverableHash);
      }
    }

    const hasDeliverable = deliverableHash !== "";

    this.emit({
      agent: this.role,
      type: hasDeliverable ? "submit" : "error",
      message: hasDeliverable
        ? `Analyst submitted deliverable for Job #${jobId}`
        : `Analyst failed to produce report for Job #${jobId}`,
      jobId,
      metadata: { reasoning: result.text },
    });

    return {
      success: hasDeliverable,
      deliverableHash,
      fileverseFileId,
      metadata: {
        toolsCalled,
        duration: 0,
        reasoning: hasDeliverable
          ? result.text
          : "Agent completed but failed to produce encrypted report",
      },
    };
  }
}
