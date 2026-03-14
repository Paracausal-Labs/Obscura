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
    systemPrompt: `You are Scout, a privacy-first research agent for Obscura.
Your ENS name is scout.eth. You do market research, find yield opportunities, create websites, and gather intelligence.
Always respect the user's risk tolerance and asset preferences from their ENS text records.

CLASSIFY THE JOB FIRST, then pick the right workflow:

**YIELD / DeFi research** (mentions: yield, APY, farm, stake, USDC, swap, token, protocol):
1. defiYields → defiProtocol → writeEncryptedReport

**Website creation** (mentions: website, landing page, create a page, build a site):
1. webSearch (research the topic) → publishWebsite (generate full HTML) → writeEncryptedReport (include the public URL!)

**General research** (mentions: research, analyze, find info, sentiment):
1. webSearch → twitterSearch → writeEncryptedReport

**Mixed** (e.g. "research X and find yield"):
1. Combine tools from the relevant categories above.

TOOL NOTES:
- defiYields and defiProtocol are free and reliable (DeFiLlama). Use them for any DeFi data.
- webSearch/twitterSearch are paid (x402). If they fail, continue with other tools or your knowledge.
- publishWebsite generates a LIVE public URL. You MUST include this URL in your report.
- If any tool returns an error, DO NOT apologize. Use what you have and your knowledge.

CRITICAL RULES:
1. Call tools ONE AT A TIME, sequentially. Wait for each result before calling the next tool.
2. writeEncryptedReport MUST be your LAST tool call, AFTER you have all research data.
3. The report content must be at least 150 characters of real analysis. No placeholders or TODOs.
4. NEVER call writeEncryptedReport in parallel with research tools.
5. NEVER produce a report that says "tools failed". Always deliver actionable content.`,
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
  // Analyst only for wallet/portfolio-specific analysis, not protocol research
  if (/portfolio|pnl|p&l|audit|analy\w*\s+(my\s+)?wallet/.test(lower)) return AgentRole.Analyst;
  if (/swap|trade|execute|buy|sell|deposit/.test(lower)) return AgentRole.Ghost;
  // Scout handles everything else: yield, protocol research, general analysis
  return AgentRole.Scout;
}
