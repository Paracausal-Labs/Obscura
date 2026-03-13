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
import { createEncryptedReport } from "../integrations/fileverse";

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
      analyzeWallet: tool({
        description: "Deep analysis of a wallet's on-chain activity",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address to analyze"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ walletAddress, chain }: { walletAddress: string; chain: string }) => {
          this.emitToolCall("analyzeWallet", jobId);
          toolsCalled.push("analyzeWallet");
          return analyzeWallet(walletAddress, chain);
        },
      }),

      getPortfolio: tool({
        description: "Get full portfolio breakdown for a wallet",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
        }),
        execute: async ({ walletAddress }: { walletAddress: string }) => {
          this.emitToolCall("getPortfolio", jobId);
          toolsCalled.push("getPortfolio");
          return getPortfolio(walletAddress);
        },
      }),

      getPnlReport: tool({
        description: "Get profit & loss report for a wallet",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
        }),
        execute: async ({ walletAddress }: { walletAddress: string }) => {
          this.emitToolCall("getPnlReport", jobId);
          toolsCalled.push("getPnlReport");
          return getPnlReport(walletAddress);
        },
      }),

      webSearch: tool({
        description: "Search the web for protocol docs or research",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("webSearch", jobId);
          toolsCalled.push("webSearch");
          return webSearch(query);
        },
      }),

      scrapeUrl: tool({
        description: "Scrape a URL for detailed content",
        inputSchema: z.object({
          url: z.string().describe("URL to scrape"),
        }),
        execute: async ({ url }: { url: string }) => {
          this.emitToolCall("scrapeUrl", jobId);
          toolsCalled.push("scrapeUrl");
          return scrapeUrl(url);
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
          const result = await createEncryptedReport(
            title,
            content,
            userSignature,
            job.id.toString()
          );
          deliverableHash = result.encryptedContent;
          fileverseFileId = result.fileId;
          return { fileId: result.fileId, status: "saved" };
        },
      }),
    };

    const result = await runAgent({
      system: systemPrompt,
      prompt: job.description,
      tools,
      maxSteps: 5,
    });

    this.emit({
      agent: this.role,
      type: "submit",
      message: `Analyst submitted deliverable for Job #${jobId}`,
      jobId,
      metadata: { reasoning: result.text },
    });

    return {
      success: true,
      deliverableHash,
      fileverseFileId,
      metadata: {
        toolsCalled,
        duration: 0,
        reasoning: result.text,
      },
    };
  }
}
