import { z } from "zod";
import { tool } from "ai";
import { AgentRole } from "@obscura/shared";
import type { AgentResult } from "@obscura/shared";
import { BaseAgent } from "./base-agent";
import type { AgentContext } from "./types";
import { runAgent } from "../integrations/groq";
import { AGENTS } from "../config/agents";
import {
  searchToken,
  getTokenPrice,
  getYieldSuggestions,
} from "../integrations/heyelsa";
import {
  twitterSearch,
  webSearch,
} from "../integrations/agentcash";
import { createEncryptedReport } from "../integrations/fileverse";

export class ScoutAgent extends BaseAgent {
  role = AgentRole.Scout;

  protected async execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult> {
    const { job, userPrefs, userSignature } = context;
    const jobId = Number(job.id);
    const config = AGENTS[AgentRole.Scout];

    const systemPrompt = `${config.systemPrompt}

User preferences (from ENS text records):
- Risk tolerance: ${userPrefs.risk}
- Preferred assets: ${userPrefs.assets}
- Max trade size: ${userPrefs.maxTrade}
- Preferred protocols: ${userPrefs.protocols}`;

    let deliverableHash = "";
    let fileverseFileId = "";

    const tools = {
      searchToken: tool({
        description: "Search for a token by name or symbol",
        inputSchema: z.object({
          query: z.string().describe("Token name or symbol to search"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("searchToken", jobId);
          toolsCalled.push("searchToken");
          return searchToken(query);
        },
      }),

      getTokenPrice: tool({
        description: "Get the current price of a token",
        inputSchema: z.object({
          token: z.string().describe("Token symbol or address"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ token, chain }: { token: string; chain: string }) => {
          this.emitToolCall("getTokenPrice", jobId);
          toolsCalled.push("getTokenPrice");
          return getTokenPrice(token, chain);
        },
      }),

      getYieldSuggestions: tool({
        description: "Get yield farming suggestions for a wallet",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ walletAddress, chain }: { walletAddress: string; chain: string }) => {
          this.emitToolCall("getYieldSuggestions", jobId);
          toolsCalled.push("getYieldSuggestions");
          return getYieldSuggestions(walletAddress, chain);
        },
      }),

      twitterSearch: tool({
        description: "Search Twitter/X for sentiment and alpha",
        inputSchema: z.object({
          query: z.string().describe("Search query for Twitter"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("twitterSearch", jobId);
          toolsCalled.push("twitterSearch");
          return twitterSearch(query);
        },
      }),

      webSearch: tool({
        description: "Search the web for research and news",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("webSearch", jobId);
          toolsCalled.push("webSearch");
          return webSearch(query);
        },
      }),

      writeEncryptedReport: tool({
        description: "Write findings to an encrypted Fileverse report",
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
            userSignature
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
      message: `Scout submitted deliverable for Job #${jobId}`,
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
