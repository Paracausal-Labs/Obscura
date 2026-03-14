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
  scrapeUrl,
  publishWebsite,
} from "../integrations/agentcash";
import {
  getTopYields as llamaYields,
  getProtocolTvl as llamaProtocol,
  getStablecoinYields as llamaStableYields,
} from "../integrations/defillama";
import { createEncryptedReport } from "../integrations/fileverse";
import { deriveKeyFromSignature, encrypt, encodePayload } from "../integrations/crypto";
import { storeLocalReport } from "../integrations/local-reports";

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
      // --- Reliable free tools (DeFiLlama) — use these first ---
      defiYields: tool({
        description:
          "Get top DeFi yield opportunities from DeFiLlama. Use this FIRST for any yield/APY research. Filter by chain or stablecoin.",
        inputSchema: z.object({
          chain: z.string().optional().describe("Filter by chain (e.g. 'Base', 'Ethereum')"),
          stablecoinOnly: z.boolean().default(false).describe("Only show stablecoin pools"),
        }),
        execute: async ({ chain, stablecoinOnly }: { chain?: string; stablecoinOnly: boolean }) => {
          this.emitToolCall("defiYields", jobId);
          toolsCalled.push("defiYields");
          try {
            if (stablecoinOnly) return await llamaStableYields();
            return await llamaYields(chain);
          } catch (e) {
            return { error: `DeFiLlama yields unavailable: ${e instanceof Error ? e.message : "unknown"}` };
          }
        },
      }),

      defiProtocol: tool({
        description:
          "Get TVL, description, and details for a DeFi protocol from DeFiLlama (e.g. 'aave', 'aerodrome', 'morpho').",
        inputSchema: z.object({
          protocol: z.string().describe("Protocol slug (e.g. 'aave', 'uniswap', 'aerodrome')"),
        }),
        execute: async ({ protocol }: { protocol: string }) => {
          this.emitToolCall("defiProtocol", jobId);
          toolsCalled.push("defiProtocol");
          try { return await llamaProtocol(protocol); }
          catch (e) {
            return { error: `DeFiLlama protocol lookup failed: ${e instanceof Error ? e.message : "unknown"}` };
          }
        },
      }),

      // --- Paid tools (x402 micropayments) — fallback if free tools insufficient ---
      searchToken: tool({
        description: "Search for a token by name or symbol (HeyElsa, paid via x402)",
        inputSchema: z.object({
          query: z.string().describe("Token name or symbol to search"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("searchToken", jobId);
          toolsCalled.push("searchToken");
          try { return await searchToken(query); }
          catch (e) { return { error: `searchToken failed (x402): ${e instanceof Error ? e.message : "payment/network error"}. Use defiYields or defiProtocol instead.` }; }
        },
      }),

      getTokenPrice: tool({
        description: "Get the current price of a token (HeyElsa, paid via x402)",
        inputSchema: z.object({
          token: z.string().describe("Token symbol or address"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ token, chain }: { token: string; chain: string }) => {
          this.emitToolCall("getTokenPrice", jobId);
          toolsCalled.push("getTokenPrice");
          try { return await getTokenPrice(token, chain); }
          catch (e) { return { error: `getTokenPrice failed (x402): ${e instanceof Error ? e.message : "payment/network error"}` }; }
        },
      }),

      getYieldSuggestions: tool({
        description: "Get personalized yield suggestions for a wallet (HeyElsa, paid via x402). Prefer defiYields for general research.",
        inputSchema: z.object({
          walletAddress: z.string().describe("Wallet address"),
          chain: z.string().default("base").describe("Chain name"),
        }),
        execute: async ({ walletAddress, chain }: { walletAddress: string; chain: string }) => {
          this.emitToolCall("getYieldSuggestions", jobId);
          toolsCalled.push("getYieldSuggestions");
          try { return await getYieldSuggestions(walletAddress, chain); }
          catch (e) { return { error: `getYieldSuggestions failed (x402): ${e instanceof Error ? e.message : "payment/network error"}. Use defiYields instead.` }; }
        },
      }),

      twitterSearch: tool({
        description: "Search Twitter/X for sentiment and alpha (paid via x402)",
        inputSchema: z.object({
          query: z.string().describe("Search query for Twitter"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("twitterSearch", jobId);
          toolsCalled.push("twitterSearch");
          try { return await twitterSearch(query); }
          catch (e) { return { error: `twitterSearch failed (x402): ${e instanceof Error ? e.message : "payment/network error"}. Continue with other data sources.` }; }
        },
      }),

      webSearch: tool({
        description: "Search the web for research and news (paid via x402). Try defiYields/defiProtocol first for DeFi data.",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          this.emitToolCall("webSearch", jobId);
          toolsCalled.push("webSearch");
          try { return await webSearch(query); }
          catch (e) { return { error: `webSearch failed (x402): ${e instanceof Error ? e.message : "payment/network error"}. Use defiYields or defiProtocol for DeFi data.` }; }
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

      publishWebsite: tool({
        description: "Create and publish a live website with HTML content. Returns a public URL.",
        inputSchema: z.object({
          html: z.string().describe("Complete HTML content including DOCTYPE, head, body, inline CSS"),
          filename: z.string().default("index.html").describe("Filename"),
        }),
        execute: async ({ html, filename }: { html: string; filename: string }) => {
          this.emitToolCall("publishWebsite", jobId);
          toolsCalled.push("publishWebsite");
          try { return await publishWebsite(html, filename); }
          catch (e) { return { error: `publishWebsite failed: ${e instanceof Error ? e.message : "upload error"}` }; }
        },
      }),

      writeEncryptedReport: tool({
        description: "Write findings to an encrypted Fileverse report",
        inputSchema: z.object({
          title: z.string().describe("Report title"),
          content: z.string().describe("Report content in markdown"),
        }),
        execute: async ({ title, content }: { title: string; content: string }) => {
          if (deliverableHash !== "") {
            return { fileId: fileverseFileId, status: "already saved — do not call again" };
          }
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
            await storeLocalReport(job.id.toString(), deliverableHash);
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

    // If the model didn't call writeEncryptedReport, force a report with its text output
    if (deliverableHash === "" && result.text) {
      this.emitToolCall("writeEncryptedReport", jobId);
      toolsCalled.push("writeEncryptedReport");
      try {
        const fvResult = await createEncryptedReport(
          `Scout Report — Job #${jobId}`,
          result.text,
          userSignature,
          job.id.toString()
        );
        deliverableHash = fvResult.encryptedContent;
        fileverseFileId = fvResult.fileId;
      } catch {
        const key = deriveKeyFromSignature(userSignature, job.id.toString());
        const markdown = `# Scout Report — Job #${jobId}\n\n${result.text}\n\n---\n*Generated by Obscura at ${new Date().toISOString()}*`;
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
        ? `Scout submitted deliverable for Job #${jobId}`
        : `Scout failed to produce report for Job #${jobId}`,
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
