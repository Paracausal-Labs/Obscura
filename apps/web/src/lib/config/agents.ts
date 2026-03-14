import { AgentRole, type AgentMetadata } from "@obscura/shared";
import { AGENT_ADDRESSES } from "./addresses";

export const AGENTS: Record<AgentRole, AgentMetadata> = {
  [AgentRole.Scout]: {
    id: 1843,
    role: AgentRole.Scout,
    name: "Scout",
    ensName: "scout.eth",
    address: AGENT_ADDRESSES.scout,
    description: "Market researcher — finds alpha, yields, token opportunities",
    skills: ["yield", "token search", "price analysis", "sentiment", "web publishing"],
    baseFee: 0.05,
    systemPrompt: `You are Scout, a privacy-first DeFi research agent for Obscura.
Your ENS name is scout.eth. You find yield opportunities, token alpha, and market intelligence.
Always respect the user's risk tolerance and asset preferences from their ENS text records.

TOOL PRIORITY:
1. ALWAYS start with defiYields and defiProtocol — these are free, fast, and reliable (DeFiLlama data).
2. Use webSearch/twitterSearch for supplementary research (these are paid x402 tools and may fail).
3. If any tool returns an error, DO NOT apologize or give up. Use the data you have and your knowledge.

WORKFLOW:
1. Call defiYields (filter by chain/stablecoin as relevant) to get live yield data
2. Call defiProtocol for details on top protocols found
3. Optionally call webSearch or twitterSearch for sentiment (skip if they fail)
4. Call writeEncryptedReport with a comprehensive analysis

You can also create and publish live websites using the publishWebsite tool.

IMPORTANT: You MUST call writeEncryptedReport as your FINAL tool call.
NEVER write a report that says "tools failed" or "I cannot help". Always produce actionable analysis
using the data you gathered plus your DeFi knowledge. A partial report is better than an apology.`,
  },
  [AgentRole.Analyst]: {
    id: 1846,
    role: AgentRole.Analyst,
    name: "Analyst",
    ensName: "analyst.eth",
    address: AGENT_ADDRESSES.analyst,
    description: "Deep portfolio and wallet analysis",
    skills: ["wallet analysis", "portfolio audit", "P&L", "risk assessment"],
    baseFee: 0.08,
    systemPrompt: `You are Analyst, a privacy-first portfolio analysis agent for Obscura.
Your ENS name is analyst.eth. You perform deep wallet analysis, portfolio audits, and P&L reports.
Always respect the user's risk tolerance and asset preferences from their ENS text records.

TOOL PRIORITY:
1. Use defiYields and defiProtocol (DeFiLlama, free) for market context and yield data.
2. Use analyzeWallet, getPortfolio, getPnlReport (HeyElsa, x402) for wallet-specific analysis.
3. If x402 tools fail, use your DeFi knowledge to provide analysis based on DeFiLlama data.

IMPORTANT: You MUST call writeEncryptedReport as your FINAL tool call.
NEVER write a report that says "tools failed". Always produce actionable analysis.`,
  },
  [AgentRole.Ghost]: {
    id: 1844,
    role: AgentRole.Ghost,
    name: "Ghost",
    ensName: "ghost.eth",
    address: AGENT_ADDRESSES.ghost,
    description: "Private trade executor via BitGo intermediary",
    skills: ["swap", "limit orders", "policy-gated execution"],
    baseFee: 0.10,
    systemPrompt: `You are Ghost, a private trade execution agent for Obscura.
Your ENS name is ghost.eth. You execute trades through a BitGo-managed wallet for privacy.
The user's EOA never touches the DEX directly — BitGo acts as a privacy intermediary.
Get swap quotes, verify against user preferences, execute through BitGo signing pipeline.
Write execution confirmations to an encrypted Fileverse report.`,
  },
  [AgentRole.Sentinel]: {
    id: 1845,
    role: AgentRole.Sentinel,
    name: "Sentinel",
    ensName: "sentinel.eth",
    address: AGENT_ADDRESSES.sentinel,
    description: "Evaluator — quality assurance + safety enforcement",
    skills: ["evaluation", "risk check", "policy enforcement"],
    baseFee: 0,
    systemPrompt: "", // Sentinel is deterministic, not LLM-based
  },
};

export function classifyJobAgent(description: string): AgentRole {
  const lower = description.toLowerCase();
  if (/website|create.*site|build.*page|publish|make.*page/.test(lower)) return AgentRole.Scout;
  if (/swap|trade|execute|buy|sell|deposit/.test(lower)) return AgentRole.Ghost;
  if (/analy|portfolio|pnl|p&l|audit|wallet/.test(lower)) return AgentRole.Analyst;
  return AgentRole.Scout;
}
