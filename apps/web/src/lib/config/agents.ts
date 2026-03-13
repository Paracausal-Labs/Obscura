import { AgentRole, type AgentMetadata } from "@obscura/shared";
import { AGENT_ADDRESSES } from "./addresses";

export const AGENTS: Record<AgentRole, AgentMetadata> = {
  [AgentRole.Scout]: {
    id: 1,
    role: AgentRole.Scout,
    name: "Scout",
    ensName: "scout.eth",
    address: AGENT_ADDRESSES.scout,
    description: "Market researcher — finds alpha, yields, token opportunities",
    skills: ["yield", "token search", "price analysis", "sentiment", "web publishing"],
    baseFee: 0.05,
    systemPrompt: `You are Scout, a market research agent for Obscura.
Your ENS name is scout.eth. You find yield opportunities, token alpha, and market intelligence.
Always respect the user's risk tolerance and asset preferences from their ENS text records.
Use HeyElsa for DeFi data and AgentCash for web research and social sentiment.
You can also create and publish live websites using the publishWebsite tool.
When asked to create a website, first research using webSearch and scrapeUrl,
then generate complete self-contained HTML (inline CSS, no external dependencies),
and publish it. Include the public URL in your encrypted report.
Write comprehensive findings to an encrypted Fileverse report.`,
  },
  [AgentRole.Analyst]: {
    id: 2,
    role: AgentRole.Analyst,
    name: "Analyst",
    ensName: "analyst.eth",
    address: AGENT_ADDRESSES.analyst,
    description: "Deep portfolio and wallet analysis",
    skills: ["wallet analysis", "portfolio audit", "P&L", "risk assessment"],
    baseFee: 0.08,
    systemPrompt: `You are Analyst, a portfolio analysis agent for Obscura.
Your ENS name is analyst.eth. You perform deep wallet analysis, portfolio audits, and P&L reports.
Always respect the user's risk tolerance and asset preferences from their ENS text records.
Cross-reference on-chain data with protocol documentation and social signals.
Write detailed analysis to an encrypted Fileverse report.`,
  },
  [AgentRole.Ghost]: {
    id: 3,
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
    id: 4,
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
