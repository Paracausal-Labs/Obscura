import { AgentRole } from "@obscura/shared";
import type { AgentResult } from "@obscura/shared";
import { BaseAgent } from "./base-agent";
import type { AgentContext } from "./types";
import { runAgent } from "../integrations/groq";
import { AGENTS } from "../config/agents";
import {
  twitterSearch,
  webSearch,
  publishWebsite,
} from "../integrations/agentcash";
import {
  getTopYields as llamaYields,
  getProtocolTvl as llamaProtocol,
} from "../integrations/defillama";
import { createEncryptedReport } from "../integrations/fileverse";
import { deriveKeyFromSignature, encrypt, encodePayload } from "../integrations/crypto";
import { storeLocalReport } from "../integrations/local-reports";

type QueryType = "defi" | "website" | "research";

const KNOWN_PROTOCOLS = /\b(aave|aerodrome|morpho|compound|uniswap|sushiswap|curve|yearn|lido|pendle|gmx|velodrome|moonwell|extra finance|baseswap|pancakeswap)\b/i;

function classifyQuery(description: string): QueryType {
  const lower = description.toLowerCase();
  if (/website|landing page|create.*page|build.*site|publish.*page/.test(lower)) return "website";
  if (/yield|apy|farm|stake|swap|token|protocol|defi|usdc|eth.*base|tvl|liquidity/.test(lower)) return "defi";
  if (KNOWN_PROTOCOLS.test(lower)) return "defi";
  if (/analy|research|deep dive|review|compare/.test(lower) && KNOWN_PROTOCOLS.test(lower)) return "defi";
  return "research";
}

export class ScoutAgent extends BaseAgent {
  role = AgentRole.Scout;

  protected async execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult> {
    const { job, userPrefs, userSignature } = context;
    const jobId = Number(job.id);
    const config = AGENTS[AgentRole.Scout];
    const queryType = classifyQuery(job.description);

    // Step 1: Gather data programmatically (no LLM tool calling needed)
    const researchData: Record<string, unknown> = {};

    if (queryType === "defi") {
      await this.gatherDefiData(jobId, job.description, researchData, toolsCalled);
    } else if (queryType === "website") {
      await this.gatherWebData(jobId, job.description, researchData, toolsCalled);
    } else {
      await this.gatherResearchData(jobId, job.description, researchData, toolsCalled);
    }

    // Step 2: Use LLM to write a report from gathered data (text generation only, no tools)
    const reportPrompt = this.buildReportPrompt(job.description, userPrefs, researchData, queryType);

    const result = await runAgent({
      system: `${config.systemPrompt}

User preferences (from ENS text records):
- Risk tolerance: ${userPrefs.risk}
- Preferred assets: ${userPrefs.assets}
- Max trade size: ${userPrefs.maxTrade}
- Preferred protocols: ${userPrefs.protocols}`,
      prompt: reportPrompt,
      tools: {},
      maxSteps: 1,
    });

    let reportContent = result.text || "";

    // If LLM returned nothing, generate a basic report from the data we have
    if (reportContent.length < 50) {
      const dataKeys = Object.keys(researchData).filter((k) => researchData[k] && typeof researchData[k] !== "string");
      reportContent = `## Research Report: ${job.description}\n\n`;
      if (researchData.yields) reportContent += `### Yield Data\n\n${JSON.stringify(researchData.yields, null, 2).slice(0, 2000)}\n\n`;
      for (const key of dataKeys) {
        if (key.startsWith("protocol_")) {
          const proto = researchData[key] as Record<string, unknown>;
          reportContent += `### ${proto.name || key}\n\n- **TVL:** ${JSON.stringify(proto.tvl)}\n- **Category:** ${proto.category}\n- **Description:** ${proto.description}\n- **URL:** ${proto.url}\n\n`;
        }
      }
      if (researchData.webResults && typeof researchData.webResults === "object" && !("note" in (researchData.webResults as Record<string, unknown>))) {
        reportContent += `### Web Research\n\n${JSON.stringify(researchData.webResults, null, 2).slice(0, 1500)}\n\n`;
      }
      if (reportContent.length < 100) reportContent += "Research data was limited. Please try a more specific query.\n";
    }

    // Step 3: If website query, try to publish
    if (queryType === "website" && !researchData.publishedUrl) {
      await this.tryPublishWebsite(jobId, job.description, reportContent, researchData, toolsCalled);
    }

    // Step 4: Write encrypted report
    let deliverableHash = "";
    let fileverseFileId = "";

    const finalContent = researchData.publishedUrl
      ? `${reportContent}\n\n## Published Website\n\nLive URL: ${researchData.publishedUrl}`
      : reportContent;

    this.emitToolCall("writeEncryptedReport", jobId);
    toolsCalled.push("writeEncryptedReport");
    try {
      const fvResult = await createEncryptedReport(
        `Scout Report — Job #${jobId}`,
        finalContent,
        userSignature,
        job.id.toString()
      );
      deliverableHash = fvResult.encryptedContent;
      fileverseFileId = fvResult.fileId;
    } catch {
      const key = deriveKeyFromSignature(userSignature, job.id.toString());
      const markdown = `# Scout Report — Job #${jobId}\n\n${finalContent}\n\n---\n*Generated by Obscura at ${new Date().toISOString()}*`;
      const payload = encrypt(markdown, key);
      deliverableHash = encodePayload(payload);
      fileverseFileId = `local:${job.id}`;
      await storeLocalReport(job.id.toString(), deliverableHash);
    }

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

  private async gatherDefiData(
    jobId: number,
    description: string,
    data: Record<string, unknown>,
    toolsCalled: string[]
  ) {
    // DeFiLlama yields
    this.emitToolCall("defiYields", jobId);
    toolsCalled.push("defiYields");
    try {
      const chain = /base/i.test(description) ? "Base" : undefined;
      const stablecoin = /stablecoin|usdc|usdt|dai/i.test(description);
      data.yields = await llamaYields(chain, stablecoin);
    } catch (e) {
      data.yields = { error: e instanceof Error ? e.message : "failed" };
    }

    // Extract protocol names from description and fetch details
    const protocols = description.match(KNOWN_PROTOCOLS);
    if (protocols) {
      for (const proto of [...new Set(protocols)].slice(0, 3)) {
        this.emitToolCall("defiProtocol", jobId);
        toolsCalled.push("defiProtocol");
        try {
          data[`protocol_${proto.toLowerCase()}`] = await llamaProtocol(proto.toLowerCase());
        } catch { /* skip */ }
      }
    }

    // Supplementary web search (may fail, that's ok)
    this.emitToolCall("webSearch", jobId);
    toolsCalled.push("webSearch");
    try {
      data.webResults = await webSearch(description);
    } catch {
      data.webResults = { note: "Web search unavailable" };
    }
  }

  private async gatherWebData(
    jobId: number,
    description: string,
    data: Record<string, unknown>,
    toolsCalled: string[]
  ) {
    // Web search for topic research
    this.emitToolCall("webSearch", jobId);
    toolsCalled.push("webSearch");
    try {
      data.webResults = await webSearch(description);
    } catch {
      data.webResults = { note: "Web search unavailable — using general knowledge" };
    }

    // Twitter sentiment
    this.emitToolCall("twitterSearch", jobId);
    toolsCalled.push("twitterSearch");
    try {
      const topic = description.replace(/create.*page|build.*site|landing page/gi, "").trim();
      data.twitterResults = await twitterSearch(topic);
    } catch {
      data.twitterResults = { note: "Twitter search unavailable" };
    }
  }

  private async gatherResearchData(
    jobId: number,
    description: string,
    data: Record<string, unknown>,
    toolsCalled: string[]
  ) {
    // Web search
    this.emitToolCall("webSearch", jobId);
    toolsCalled.push("webSearch");
    try {
      data.webResults = await webSearch(description);
    } catch {
      data.webResults = { note: "Web search unavailable" };
    }

    // DeFi data as supplement
    this.emitToolCall("defiYields", jobId);
    toolsCalled.push("defiYields");
    try {
      data.yields = await llamaYields();
    } catch { /* skip */ }

    // Extract any protocol names and fetch details
    const protocols = description.match(KNOWN_PROTOCOLS);
    if (protocols) {
      for (const proto of [...new Set(protocols)].slice(0, 3)) {
        this.emitToolCall("defiProtocol", jobId);
        toolsCalled.push("defiProtocol");
        try {
          data[`protocol_${proto.toLowerCase()}`] = await llamaProtocol(proto.toLowerCase());
        } catch { /* skip */ }
      }
    }
  }

  private async tryPublishWebsite(
    jobId: number,
    description: string,
    reportContent: string,
    data: Record<string, unknown>,
    toolsCalled: string[]
  ) {
    this.emitToolCall("publishWebsite", jobId);
    toolsCalled.push("publishWebsite");
    try {
      // Use LLM to generate HTML from the report content
      const htmlResult = await runAgent({
        system: "You are an HTML generator. Output ONLY valid HTML. No explanation, no markdown, just a complete HTML document with inline CSS. Make it look modern with a dark theme.",
        prompt: `Create a beautiful landing page HTML about: ${description}\n\nUse this research data:\n${reportContent.slice(0, 2000)}`,
        tools: {},
        maxSteps: 1,
      });

      let html = htmlResult.text;
      if (html && html.includes("<html") || html.includes("<!DOCTYPE")) {
        // Clean up markdown code fences if present
        html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
        const result = await publishWebsite(html);
        data.publishedUrl = result.publicUrl || result.siteUrl;
      }
    } catch {
      data.publishedUrl = null;
    }
  }

  private buildReportPrompt(
    description: string,
    userPrefs: { risk: string; assets: string; maxTrade: string; protocols: string },
    data: Record<string, unknown>,
    queryType: QueryType
  ): string {
    const dataStr = JSON.stringify(data, null, 2).slice(0, 6000);

    if (queryType === "website") {
      return `Write a comprehensive research report about: "${description}"

Here is the data gathered from web search and social media:
${dataStr}

Write a detailed markdown report (at least 300 words) covering:
1. Overview of the topic
2. Key findings from the research
3. Relevant links and sources
4. Conclusion

If a website was published, mention the URL. Do NOT say "tools failed" — use the data provided plus your knowledge.`;
    }

    if (queryType === "defi") {
      return `Write a comprehensive DeFi analysis report for: "${description}"

User's risk tolerance: ${userPrefs.risk}
Preferred assets: ${userPrefs.assets}
Max trade size: ${userPrefs.maxTrade} USDC

Here is the live DeFi data gathered:
${dataStr}

Write a detailed markdown report (at least 300 words) covering:
1. Top yield opportunities (with APY, TVL, and protocol names)
2. Risk assessment based on user preferences
3. Specific recommendations
4. Any relevant protocol details

Use the ACTUAL data provided. Do NOT hallucinate APY numbers. Do NOT say "tools failed."`;
    }

    return `Write a comprehensive research report about: "${description}"

Here is the data gathered:
${dataStr}

Write a detailed markdown report (at least 300 words) with actionable analysis. Do NOT say "tools failed."`;
  }
}
