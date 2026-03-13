# OBSCURA — Complete Build Specification

> **"Private-by-default agent commerce with public reputation."**
> Built by Paracausal Labs | ETH Mumbai 2026 | March 13–15 (42 hours)

---

## 1. What Is Obscura?

A privacy-first marketplace where AI agents are independent DeFi service providers. Users post jobs ("find me yield", "swap 500 USDC to ETH"), pick an agent manually or auto-assign by reputation, execute through a BitGo-managed privacy intermediary, receive encrypted results, and build on-chain reputation.

**Think:** Fiverr for autonomous DeFi agents — but the user's EOA stays off the DeFi path, every deliverable is encrypted, and reputation lives on-chain.

**Not a council. Not a debate. An economy.**

---

## 2. How It's Different From Agentropolis

| | Agentropolis (HackMoney) | Obscura (ETH Mumbai) |
|---|---|---|
| Agent model | Council — 5 agents debate one trade | Marketplace — users hire agents directly |
| User role | Approve/reject proposals | Post jobs, hire agents |
| On-chain primitive | Uniswap v4 hooks | ERC-8183 escrow + ERC-8004 reputation |
| Visual | 3D isometric cyberpunk (R3F) | Analytics dashboard with charts |
| Privacy | None | Core — user EOA off-path, encrypted docs, policy-gated execution |
| Economy | Agents don't earn | Agents earn USDC via job escrow |
| Decision model | Debate → vote → execute | Job → select agent → execute → evaluate → pay |

---

## 3. The Four Agents

Each agent is an independent service provider, registered on ERC-8004 with an ENS name.

### Scout (`scout.eth`)
- **Role:** Market researcher — finds alpha, yields, token opportunities
- **HeyElsa endpoints:** `search_token` ($0.001), `get_token_price` ($0.002), `get_yield_suggestions` ($0.02)
- **AgentCash endpoints:** Twitter search ($0.0025), Exa web search ($0.002), Firecrawl scrape ($0.01)
- **Job types:** "Find best yield for X", "Research this new token", "What's the sentiment on $TOKEN?"
- **Deliverable:** Encrypted Fileverse doc with DeFi data + social sentiment + audit status

### Analyst (`analyst.eth`)
- **Role:** Deep portfolio and wallet analysis
- **HeyElsa endpoints:** `analyze_wallet` ($0.02), `get_portfolio` ($0.01), `get_pnl_report` ($0.015)
- **AgentCash endpoints:** Web search ($0.002), web scrape ($0.01) for protocol docs
- **Job types:** "Analyze my wallet", "Full portfolio audit with social monitoring", "P&L report"
- **Deliverable:** Encrypted Fileverse doc with analysis + risk metrics + protocol research

### Ghost (`ghost.eth`)
- **Role:** Private trade executor — swaps through a BitGo-managed execution wallet
- **HeyElsa endpoints:** `get_swap_quote` ($0.01), `execute_swap` ($0.02), `get_transaction_status` ($0.001)
- **BitGo:** Signs execution through a managed wallet and enforces webhook policy
- **Job types:** "Swap X to Y", "Execute this trade privately"
- **Deliverable:** Encrypted Fileverse doc with tx hash + execution details
- **Privacy:** User EOA never touches the DEX directly; BitGo is the execution intermediary

### Sentinel (`sentinel.eth`)
- **Role:** Evaluator — quality assurance + safety enforcement
- **HeyElsa endpoints:** `get_balances` ($0.005), `get_swap_quote` (slippage check)
- **BitGo:** Runs webhook policy — approves/denies transactions
- **Special role:** Acts as ERC-8183 `evaluator` — calls `complete()` or `reject()`
- **ENS:** Reads user's risk preferences from text records to enforce limits

---

## 4. Full Flow (Step by Step)

### User Posts a Job

```
User connects wallet (RainbowKit)
  → Browses agent marketplace (sees reputation scores from ERC-8004)
  → Types: "Find me the best yield for 500 USDC on Base"
  → Sets budget: 0.05 USDC, expiry: 1 hour
  → Chooses: Auto-assign (highest reputation) or manual agent pick
  → Frontend calls ERC-8183 createJob(provider=selectedAgent, evaluator=sentinel, ...)
  → Frontend calls fund(jobId, budget)
  → JobFunded event emitted on Base Sepolia
```

### Agent Picks Up Job

```
Orchestrator (backend) watches JobFunded events
  → Reads assigned provider from the job
  → Verifies kill switch + ENS risk preferences
  → Triggers scout.eth (already selected in createJob)
  → Agent status: WORKING
```

### Agent Executes Privately

```
Scout agent (Groq Llama 3.3 reasoning):
  → Reads user's ENS text records:
      - defi.risk = "conservative"
      - defi.assets = "ETH,USDC,WBTC"
      - defi.maxTrade = "500"
  → Calls HeyElsa x402: get_yield_suggestions
      - Pays $0.02 USDC via x402 protocol
      - Gets yield opportunities across Base DeFi
  → Calls HeyElsa x402: get_token_price (for context)
  → LLM analyzes results against user preferences
  → Writes findings to encrypted Fileverse doc:
      - "Aave v3 on Base: 4.2% APY for USDC"
      - "Compound v3: 3.8% APY"
      - "Recommendation: Aave v3 (matches conservative risk profile)"
  → Submits deliverable hash on-chain: ERC-8183 submit()
```

### Evaluation

```
Sentinel agent picks up evaluation:
  → Reads on-chain deliverable metadata summary
  → Verifies: Does recommendation match user's risk profile? (reads ENS records)
  → Verifies: Is the yield data current? (spot-checks via HeyElsa)
  → Verifies: Did the agent call the expected tools / respond in time?
  → Scores: 92/100
  → Calls ERC-8183 complete() → escrow releases 0.05 USDC to scout.eth
  → Calls ERC-8004 giveFeedback() → scout.eth reputation increases
  → Activity feed updates in real-time
```

### If User Wants Execution (Follow-up Job)

```
User posts follow-up: "Execute: deposit 500 USDC into Aave v3"
  → ERC-8183 createJob() with 0.10 USDC budget
  → Ghost is selected as provider

Ghost executes with user EOA off-path:
  → User keeps execution capital in BitGo-managed wallet
  → Calls HeyElsa x402: execute_swap (dry_run: true) → gets pipeline_id
  → Polls get_transaction_status() until status = sign_pending
  → Receives unsigned tx_data from HeyElsa pipeline
  → Sends unsigned tx_data to BitGo for signing
  → Sentinel's BitGo webhook evaluates:
      - Within spending limit? (reads ENS defi.maxTrade)
      - Asset whitelisted? (reads ENS defi.assets)
      - Risk acceptable?
      → APPROVED ✓
  → BitGo signs the transaction
  → Ghost broadcasts signed tx from BitGo execution wallet
  → Ghost submits tx hash back to HeyElsa pipeline
  → Writes encrypted confirmation to Fileverse
  → Submits deliverable: ERC-8183 submit()
  → Sentinel evaluates → complete() → escrow released
  → Reputation updated
```

### The Privacy Result

```
On-chain (what anyone sees):
  - 0x7f3a... → 0x9bc2... (0.02 USDC)    ← HeyElsa API payment
  - 0xa14f... → 0x3d8e... (0.05 USDC)    ← Job escrow release
  - 0xBITGO... → 0xAAVE... (500 USDC)    ← The actual trade
  - 0xe893... → 0x1c4d... (0.001 USDC)   ← Another API call
  - Observer sees a BitGo intermediary, not the user's EOA touching DeFi directly.

Your dashboard (what YOU see):
  - Scout found Aave 4.2% APY ✓
  - Ghost deposited 500 USDC into Aave via BitGo execution wallet ✓
  - Sentinel approved all transactions ✓
  - Full report encrypted on Fileverse ✓
  - Portfolio: +$21/year projected yield
```

---

## 5. Sponsor Integration (Deep)

### ENS — $2,000

**Bounty: Best creative use of ENS ($1,000) + Pool prize ($1,000)**

ENS is NOT cosmetic. It's the CONTROL LAYER for the entire system.

**ENSIP-25 Agent Identity (first-ever implementation):**
```
Text record: agent-registration[eip155:84532:0x8004A818...][1]
Value: "true"
```
Each agent's ENS name proves they own an ERC-8004 identity. Verifiable on-chain.

**DeFi Strategy Text Records (creative use):**
```
defi.risk          = "conservative"       # Agent risk tolerance
defi.assets        = "ETH,USDC,WBTC"     # Allowed assets
defi.maxTrade      = "500"                # Max trade size (USD)
defi.protocols     = "aave,compound"      # Allowed protocols
agent.killswitch   = "false"             # Emergency stop
agent.preferred    = "scout.eth"          # Preferred agent
```

**Kill Switch Demo:**
Change `agent.killswitch` from `false` to `true` → all agents stop immediately.
Change back to `false` → agents resume. ENS name = master key.

**Why judges will love it:**
ENS text records as a programmable agent control layer is novel. It's not "display a name" — it's "ENS governs an autonomous DeFi system." ENSIP-25 has zero implementations.

---

### HeyElsa — $2,000

**Bounty: Best use of x402 + OpenClaw ($1,000) + SDK projects ($1,000)**

HeyElsa is the BRAIN. Every piece of market intelligence and every trade goes through x402.

**Endpoints used by each agent:**

| Agent | Endpoint | Cost | Purpose |
|-------|----------|------|---------|
| Scout | `search_token` | $0.001 | Find tokens across chains |
| Scout | `get_token_price` | $0.002 | Real-time pricing |
| Scout | `get_yield_suggestions` | $0.02 | Yield opportunities |
| Analyst | `analyze_wallet` | $0.02 | Wallet behavior + risk |
| Analyst | `get_portfolio` | $0.01 | Portfolio breakdown |
| Analyst | `get_pnl_report` | $0.015 | Profit/loss tracking |
| Ghost | `get_swap_quote` | $0.01 | Quote with routing |
| Ghost | `execute_swap` | $0.02 | Execute trade |
| Ghost | `get_transaction_status` | $0.001 | Track pipeline |
| Sentinel | `get_balances` | $0.005 | Verify post-trade |

**Integration:**
```typescript
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';

const client = withPaymentInterceptor(
  axios.create({ baseURL: 'https://x402-api.heyelsa.ai' }),
  walletClient  // pays USDC on Base per request
);

// Scout calls this
const yields = await client.post('/api/get_yield_suggestions', {
  wallet_address: userAddress,
  chain: 'base'
});
```

**Cost per full job cycle:** ~$0.05-0.08 (negligible)

---

### BitGo — $2,000

**Bounty: Best Privacy Application ($1,200) + Best DeFi Application ($800)**

BitGo provides TWO things: execution privacy and policy enforcement.

**Privacy ($1,200) — User EOA Off-Path Execution:**
```typescript
import { BitGoAPI } from '@bitgo/sdk-api';
import { Tbase } from '@bitgo/sdk-coin-base';

const bitgo = new BitGoAPI({ accessToken: TOKEN, env: 'test' });
bitgo.register('tbase', Tbase.createInstance);

const wallet = await bitgo.coin('tbase').wallets().get({ id: walletId });

// Ghost requests an unsigned tx from HeyElsa, then signs via BitGo
const pipeline = await heyElsa.executeSwap({ dry_run: true, ...swapParams });
const unsignedTx = await waitForSignPending(pipeline.pipeline_id);
const signedTx = await signWithBitGo(wallet, unsignedTx);
```

This is the honest privacy claim for the bounty: the user's EOA never interacts with the protocol directly, and execution is policy-gated through BitGo custody.

**DeFi ($800) — Webhook Policy Engine:**
```typescript
// Next.js API route: /api/webhook
export async function POST(req: Request) {
  const txDetails = await req.json();

  // Read user's limits from ENS text records
  const maxTrade = await ensClient.getEnsText({ name: 'user.eth', key: 'defi.maxTrade' });
  const allowedAssets = await ensClient.getEnsText({ name: 'user.eth', key: 'defi.assets' });

  // Sentinel logic
  if (txDetails.amount > Number(maxTrade)) {
    return Response.json({ approved: false, reason: 'Exceeds spending limit' });
  }

  return Response.json({ approved: true });
}
```

BitGo POSTs every transaction to our webhook → Sentinel evaluates → approve/deny.
This is "policy-governed yield strategy with enterprise-grade controls."

---

### Fileverse — $1,000

**Bounty: Build What Big Tech Won't**

Fileverse is the MEMORY. Every agent deliverable is an encrypted document.

**Integration (correct API):**
```typescript
import { Agent } from '@fileverse/agents';
import { privateKeyToAccount } from 'viem/accounts';
import { PinataStorageProvider } from '@fileverse/agents/storage';

const storageProvider = new PinataStorageProvider({
  jwt: process.env.PINATA_JWT,
  gateway: process.env.PINATA_GATEWAY,
});

const fileverseAgent = new Agent({
  chain: 'gnosis',
  viemAccount: privateKeyToAccount(process.env.FILEVERSE_PRIVATE_KEY as `0x${string}`),
  pimlicoAPIKey: process.env.PIMLICO_API_KEY,
  storageProvider,
});

await fileverseAgent.setupStorage('obscura-reports');

// Scout writes research report (app-level encryption before write)
const reportMd = `# Job #12 — Yield Research
**Agent:** scout.eth
**Findings:** Aave v3: 4.2% APY on Base
**Recommendation:** Deposit 500 USDC
**Timestamp:** ${new Date().toISOString()}`;

const encrypted = encryptForUser(reportMd, userWalletDerivedKey);
const report = await fileverseAgent.create(encrypted);

// Read + decrypt
const data = await fileverseAgent.getFile(report.fileId);
const decrypted = decryptForUser(data.content, userWalletDerivedKey);
```

**Encryption model:**
- E2E encryption is implemented at APP level (not built into Agents SDK)
- AES-256-GCM with key derived from a user-held signature
- Sentinel evaluates metadata only (not encrypted content) — see Fix 2 in Section 15

**What gets stored on Fileverse:**
- Scout's market research reports (encrypted)
- Analyst's portfolio analysis (encrypted)
- Ghost's trade execution confirmations (encrypted)
- All docs visible at agents.fileverse.io but only user can decrypt

Exactly their bounty: "privacy-first apps where users can collaborate with humans and agents without surveillance."

---

### Base — $1,050

**AI × Onchain ($350):**
- Multi-agent system with on-chain economic identity (ERC-8004)
- Agents earn and spend USDC autonomously via ERC-8183 escrow
- Agent-to-agent coordination: Ghost uses Scout's research to execute trades
- x402 payment settlement on Base

**DeFi 2.0 ($350):**
- Novel primitive: agent job marketplace for DeFi
- Reputation-based agent selection (not random, not round-robin — best agent wins)
- ERC-8183 escrow = new DeFi coordination mechanism

**Privacy ($350):**
- "User EOA stays off the DeFi path while agent execution stays policy-gated"
- BitGo executes as a privacy intermediary between the user and the protocol
- Encrypted Fileverse deliverables = strategy can't be copied

---

### ERC-8004 + ERC-8183 (Standards Flex)

**ERC-8004 (already deployed on Base Sepolia):**
- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- We call `register()` for each agent, `giveFeedback()` after each job
- No deployment needed — just interact with existing contracts

**ERC-8183 (we deploy our own — among the first implementations):**
- Fork `erc-8183/base-contracts` (CC0 license)
- Deploy `AgentJobs.sol` on Base Sepolia
- 6-state machine: Open → Funded → Submitted → Completed/Rejected/Expired
- USDC escrow for job payments
- Skip hooks for MVP (`hook = address(0)`)

---

## 6. On-Chain Architecture

```
BASE SEPOLIA
├── AgentJobs.sol (ERC-8183 — OUR deployment)
│   ├── createJob(provider, evaluator, expiredAt, description, hook)
│   ├── fund(jobId, expectedBudget)
│   ├── submit(jobId, deliverableHash)
│   ├── complete(jobId, reason)
│   ├── reject(jobId, reason)
│   └── claimRefund(jobId)
│
├── ERC-8004 IdentityRegistry (existing: 0x8004A818...)
│   ├── register(agentURI, metadata[]) → agentId (NFT)
│   ├── setMetadata(agentId, "skills", "yield,swap,analysis")
│   └── getMetadata(agentId, "skills")
│
├── ERC-8004 ReputationRegistry (existing: 0x8004B663...)
│   ├── giveFeedback(agentId, value, decimals, tag1, tag2, endpoint, uri, hash)
│   ├── getSummary(agentId, clients[], tag1, tag2)
│   └── readAllFeedback(agentId, clients[], tag1, tag2, includeRevoked)
│
└── Test USDC (ERC-20 for escrow)

ETHEREUM SEPOLIA
├── ENS Registry
│   ├── scout.eth, analyst.eth, ghost.eth, sentinel.eth
│   ├── ENSIP-25 text records (agent-registration proof)
│   ├── DeFi preference records (defi.risk, defi.assets, etc.)
│   └── Kill switch (agent.killswitch)
└── ENS Public Resolver

OFF-CHAIN
├── Vercel AI SDK + Groq (Llama 3.3 70B — agent reasoning + tool calling)
├── HeyElsa x402 API (DeFi data + execution — Base mainnet USDC)
├── AgentCash x402 APIs (web research, Twitter, scraping — Base mainnet USDC)
│   ├── stableenrich.dev (Exa search, Firecrawl scrape, Twitter)
│   ├── stablesocial.dev (social media data)
│   └── stablestudio.dev (image generation for reports)
├── BitGo Testnet (managed wallet + signing + webhook)
├── Fileverse/IPFS (encrypted document storage — Gnosis)
└── ngrok (BitGo webhook tunnel)
```

---

## 6.5. Agent Runtime Architecture

### How Agents Think and Act

Agents are NOT persistent background daemons. They're **event-driven**: a job is funded → the orchestrator triggers the assigned agent → the agent runs a multi-step reasoning loop (5-30 seconds) → submits deliverable → done.

**Framework: Vercel AI SDK** (`ai` + `@ai-sdk/groq`)

Why this over alternatives:
- **OpenClaw**: Great reference surface for HeyElsa tools. We either wrap `elsa-openclaw` directly or mirror its tool signatures while keeping Vercel AI SDK as the orchestration layer.
- **LangChain**: Overkill, heavy dependency.
- **Raw Groq API**: No built-in tool calling loop.
- **Vercel AI SDK**: Native Next.js, tool calling built-in, `maxSteps` for agent loops, streaming for real-time UI.

### Agent Loop Pattern

```typescript
import { generateText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// Each agent follows this pattern
const result = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  maxSteps: 5,  // agent can reason + act up to 5 rounds
  system: `You are Scout, a market research agent for Obscura.
Your ENS name is scout.eth. You find yield opportunities and alpha.
User preferences: ${JSON.stringify(userEnsPrefs)}
Always respect the user's risk tolerance and asset preferences.`,
  prompt: jobDescription,
  tools: {
    // HeyElsa tools
    searchToken: tool({
      description: 'Search for tokens across blockchains',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => heyElsa.searchToken(query),
    }),
    getYieldSuggestions: tool({
      description: 'Find yield opportunities for a wallet',
      parameters: z.object({ wallet: z.string(), chain: z.string() }),
      execute: async ({ wallet, chain }) => heyElsa.getYieldSuggestions(wallet, chain),
    }),
    // AgentCash tools (web research superpowers)
    twitterSearch: tool({
      description: 'Search Twitter for sentiment about a token or protocol',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => agentCash.twitterSearch(query),
    }),
    webSearch: tool({
      description: 'Search the web for protocol info, audits, news',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => agentCash.webSearch(query),
    }),
    // Fileverse tool
    writeEncryptedReport: tool({
      description: 'Write findings to encrypted Fileverse doc',
      parameters: z.object({ title: z.string(), content: z.string() }),
      execute: async ({ title, content }) => fileverse.createEncryptedReport(title, content, userKey),
    }),
  },
});
```

**How `maxSteps: 5` works:**
1. LLM sees job + tools → decides: "I should search for yield" → calls `getYieldSuggestions`
2. Gets result → LLM thinks: "Let me check Twitter sentiment" → calls `twitterSearch`
3. Gets result → LLM thinks: "Let me verify audit status" → calls `webSearch`
4. Gets result → LLM synthesizes everything → calls `writeEncryptedReport`
5. Returns final summary → orchestrator submits deliverable on-chain

This is a proper agent loop, not a single API call.

### Orchestrator Flow

```
ERC-8183 JobFunded event
  │
  ▼
ORCHESTRATOR (watches events via viem watchContractEvent)
  │
  ├── Load assigned provider from the funded job
  ├── Read user's ENS text records (risk, assets, maxTrade)
  ├── Check kill switch before each step
  │
  ▼
AGENT (Vercel AI SDK + Groq Llama 3.3)
  │
  ├── TOOLS (multi-step reasoning loop):
  │   ├── HeyElsa x402 ──── DeFi data + execution (Base mainnet USDC)
  │   ├── AgentCash x402 ── Web research + social + media (Base mainnet USDC)
  │   ├── BitGo SDK ──────── Signing + webhook policy
  │   ├── Fileverse SDK ──── Encrypted doc storage
  │   └── ENS (viem) ─────── Read user preferences
  │
  ├── maxSteps: 5 (think → act → think → act → done)
  │
  ▼
DELIVERABLE (encrypted Fileverse doc hash)
  │
  ▼
SUBMIT ON-CHAIN (ERC-8183 submit())
  │
  ▼
SENTINEL EVALUATES → complete() or reject()
  │
  ▼
ERC-8004 giveFeedback() → reputation updated
```

---

## 6.6. AgentCash Integration (Superpower Layer)

AgentCash is NOT a sponsor — but it gives our agents superpowers beyond DeFi that make the demo incredible. It uses the same x402 protocol as HeyElsa, so the integration pattern is identical.

### What AgentCash Adds

| Without AgentCash | With AgentCash |
|---|---|
| "Find yield" → HeyElsa API → "Aave 4.2%" | "Research this yield" → HeyElsa + Twitter sentiment + web audit search + protocol docs → comprehensive report |
| Static text report | Report with AI-generated charts/images |
| Email yourself the results manually | Agent emails you the encrypted report link |
| View results only in our UI | Agent creates a hosted result page |

### Integration (same x402 pattern as HeyElsa)

```typescript
// lib/integrations/agentcash.ts
import { withPaymentInterceptor } from 'x402-axios';

const enrichClient = withPaymentInterceptor(
  axios.create({ baseURL: 'https://stableenrich.dev' }),
  walletClient  // same x402 payment wallet
);

// Scout can research beyond DeFi data
export const webSearch = (query: string) =>
  enrichClient.post('/exa/search', { query });           // $0.002

export const scrapeUrl = (url: string) =>
  enrichClient.post('/firecrawl/scrape', { url });       // $0.01

export const twitterSearch = (query: string) =>
  enrichClient.post('/twitter/search', { query });       // $0.0025
```

### Updated Agent Capabilities

| Agent | HeyElsa x402 Tools | AgentCash x402 Tools |
|-------|-------------------|---------------------|
| **Scout** | search_token, get_token_price, get_yield | Twitter sentiment, web search, web scrape |
| **Analyst** | analyze_wallet, get_portfolio, get_pnl | Protocol doc scraping, social monitoring |
| **Ghost** | get_swap_quote, execute_swap | (none — stays focused on private execution) |
| **Sentinel** | get_balances | Web scrape (verify protocol legitimacy) |

### Strengthens Base AI×Onchain Bounty

The Base track says: *"Agentic commerce infrastructure: tools that let AI agents pay for services, APIs, and data via HTTP-native payment protocols (think x402-style)"*

Our agents paying for HeyElsa DeFi data + AgentCash web research + AgentCash social data — ALL via x402 micropayments on Base — that's the agentic commerce vision in action.

---

## 6.7. Mainnet Cost Breakdown

On-chain contracts stay on **Base Sepolia** (free). Only x402 API calls need mainnet USDC. The agent server bridges both networks independently.

### Network Split

| Component | Network | Cost |
|-----------|---------|------|
| ERC-8183, ERC-8004 | Base Sepolia | Free |
| ENS names + text records | Ethereum Sepolia | Free |
| BitGo wallets | BitGo Testnet | Free |
| HeyElsa x402 | Base Mainnet | USDC |
| AgentCash x402 | Base Mainnet | USDC |
| Fileverse docs | Gnosis | ~Free |

### Per-Job Cost

| Call | Cost |
|------|------|
| HeyElsa (3-5 endpoints) | ~$0.04-0.08 |
| AgentCash (2-3 endpoints) | ~$0.01-0.05 |
| **Per job total** | **~$0.05-0.13** |

### Full Hackathon Budget

| Phase | Jobs | Cost |
|-------|------|------|
| Development + testing | ~30 | ~$2.70 |
| Demo rehearsal | ~10 | ~$0.90 |
| Live demo | ~5 | ~$0.45 |
| Buffer | ~15 | ~$1.35 |
| **Total x402 cost** | **~60** | **~$5.40** |

### Wallet Funding

| Wallet | Purpose | Amount |
|--------|---------|--------|
| HeyElsa payment wallet | HeyElsa x402 calls | ~$3-4 USDC on Base |
| AgentCash wallet | Web research, social, scrape | ~$1-2 from existing $11.96 |
| Base Sepolia | All on-chain txns | $0 (testnet) |
| Ethereum Sepolia | ENS setup | $0 (testnet) |
| **Total out-of-pocket** | | **~$3-5 USDC** |

---

## 7. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | You know it from Agentropolis |
| Styling | TailwindCSS + shadcn/ui | Fast, beautiful, dark theme |
| Wallet | RainbowKit + wagmi + viem | Standard, dual-chain support |
| Charts | lightweight-charts + Recharts | TradingView-style price charts + bar/pie |
| Agent Runtime | Vercel AI SDK (`ai` + `@ai-sdk/groq`) | Tool calling, maxSteps agent loop, native Next.js |
| LLM | Groq Llama 3.3 70B | Fast inference, free tier, used in Agentropolis |
| DeFi Engine | x402-axios (HeyElsa) | Pay-per-request, all DeFi data |
| Research Engine | x402-axios (AgentCash) | Web search, Twitter, scraping via x402 |
| Privacy | @bitgo/sdk-api + @bitgo/sdk-coin-base | Managed execution wallet, signing, webhook policies |
| Storage | @fileverse/agents | Encrypted docs, IPFS-backed |
| Identity | ENS (viem getEnsText/setEnsText) | Text records, ENSIP-25 |
| Contracts | Foundry | ERC-8183 deployment |
| Monorepo | Turborepo | You know this from Agentropolis |
| Real-time | Server-Sent Events (SSE) | Simpler than WebSockets for activity feed |
| Deploy | Vercel | One-click deploy |

---

## 8. Frontend Design

### Theme
- Background: `#09090b` (near-black)
- Surface: `#18181b` (zinc-900)
- Accent: `#8b5cf6` (violet-500) — privacy/mystery vibes
- Success: `#22c55e` (green)
- Text: `#fafafa` (zinc-50)
- Muted: `#71717a` (zinc-500)

### Page 1: Dashboard (`/`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ◈ OBSCURA                                    [Connect Wallet]  │
│  The gig economy for AI agents                                  │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ AGENTS   │  ┌─ Overview ─────────────────────────────────────┐   │
│          │  │ Total Value    Jobs Done    Agents    Savings   │   │
│ ┌──────┐ │  │ $12,847       47           4/4 ●     $847     │   │
│ │ 🔍   │ │  └───────────────────────────────────────────────┘   │
│ │scout │ │                                                       │
│ │● LIVE│ │  ┌─ Portfolio ────────────────────────────────────┐   │
│ │R: 87 │ │  │                                                │   │
│ └──────┘ │  │  $13k ┤         ╱╲                             │   │
│ ┌──────┐ │  │       ┤    ╱╲╱╱╱  ╲   ╱╲                      │   │
│ │ 📊   │ │  │  $12k ┤╱╱╱╱        ╲╱╱  ╲╱                    │   │
│ │analys│ │  │       ┤                                        │   │
│ │○ IDLE│ │  │  $11k ┤                                        │   │
│ │R: 72 │ │  │       └──────────────────────────────────────  │   │
│ └──────┘ │  │        Mar 7  Mar 9  Mar 11  Mar 13            │   │
│ ┌──────┐ │  └────────────────────────────────────────────────┘   │
│ │ 👻   │ │                                                       │
│ │ghost │ │  ┌─ Agent Reputation ──────┐ ┌─ Job Stats ────────┐  │
│ │● EXEC│ │  │ ghost.eth   ████████ 94 │ │ Completed: 38      │  │
│ │R: 94 │ │  │ sentinel    ███████░ 89 │ │ Active: 3          │  │
│ └──────┘ │  │ scout.eth   ███████░ 87 │ │ Success: 92%       │  │
│ ┌──────┐ │  │ analyst     █████░░░ 72 │ │ Avg time: 43s      │  │
│ │ 🛡   │ │  └────────────────────────┘ └────────────────────┘  │
│ │senti │ │                                                       │
│ │● EVAL│ │  ┌─ Live Activity ────────────────────────────────┐   │
│ │R: 89 │ │  │ 14:23 scout.eth picked up Job #12             │   │
│ └──────┘ │  │ 14:23 scout → HeyElsa: get_yield_suggestions  │   │
│          │  │ 14:24 scout → Fileverse: report encrypted      │   │
│ [+ Post  │  │ 14:24 scout submitted deliverable #12          │   │
│   Job]   │  │ 14:25 sentinel evaluating...                   │   │
│          │  │ 14:25 sentinel → APPROVED ✓ (92/100)           │   │
│          │  │ 14:25 Job #12 COMPLETED → 0.05 USDC released   │   │
│          │  │ 14:25 scout.eth rep: 87 → 88                   │   │
│          │  └────────────────────────────────────────────────┘   │
└──────────┴───────────────────────────────────────────────────────┘
```

### Page 2: Marketplace (`/marketplace`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ◈ OBSCURA > Marketplace                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Post a Job ──────────────────────────────────────────────┐   │
│  │ What do you need?                                         │   │
│  │ ┌──────────────────────────────────────────────────────┐  │   │
│  │ │ Find me the best yield for 500 USDC on Base         │  │   │
│  │ └──────────────────────────────────────────────────────┘  │   │
│  │ Budget: [0.05 USDC]   Expires: [1 hour]                  │   │
│  │ Selection: [Highest reputation (MVP)] ▼                   │   │
│  │ Agent: [Auto-selected: scout.eth] [Change]                │   │
│  │                                         [Post Job →]      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Active Jobs ─────────────────────────────────────────────┐   │
│  │ #14 │ "Analyze wallet 0x7f..." │ analyst.eth │ ⏳ Working │   │
│  │ #13 │ "Swap 200 USDC → ETH"   │ ghost.eth   │ 🟡 Eval   │   │
│  │ #12 │ "Find best yield"       │ scout.eth   │ ✅ Done    │   │
│  │ #11 │ "Portfolio P&L report"  │ analyst.eth │ ✅ Done    │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Browse Agents ───────────────────────────────────────────┐   │
│  │ ┌────────────────────────────────────────────────────────┐│   │
│  │ │ 👻 ghost.eth              Rep: █████████░ 94/100      ││   │
│  │ │ Private trade executor    Jobs: 31 | Win: 97%         ││   │
│  │ │ Skills: swap, limit orders, policy-gated execution    ││   │
│  │ │ Base fee: 0.10 USDC                                   ││   │
│  │ │ Avg delivery: 30s | ERC-8004 ID: #3                   ││   │
│  │ │ ENS: ghost.eth | ENSIP-25: verified ✓      [Hire →]  ││   │
│  │ └────────────────────────────────────────────────────────┘│   │
│  │ ┌────────────────────────────────────────────────────────┐│   │
│  │ │ 🔍 scout.eth              Rep: ███████░░░ 87/100      ││   │
│  │ │ Market scanner            Jobs: 23 | Win: 91%         ││   │
│  │ │ Skills: yield, token search, price analysis           ││   │
│  │ │ Base fee: 0.05 USDC                                   ││   │
│  │ │ Avg delivery: 45s | ERC-8004 ID: #1                   ││   │
│  │ │ ENS: scout.eth | ENSIP-25: verified ✓      [Hire →]  ││   │
│  │ └────────────────────────────────────────────────────────┘│   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Page 3: Privacy Panel (`/privacy`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ◈ OBSCURA > Privacy                           [● Privacy: ON]  │
├─────────────────────────────┬────────────────────────────────────┤
│  YOUR VIEW (Decrypted)      │  CHAIN VIEW (Public)              │
│                             │                                    │
│  Job #12: Find yield        │  Txn 1: 0x7f3a → 0x9bc2          │
│  Agent: scout.eth           │    0.02 USDC (unknown purpose)    │
│  Found: Aave v3 4.2% APY   │                                    │
│  Rec: Deposit 500 USDC     │  Txn 2: 0xa14f → 0x3d8e          │
│  Status: ✅ Completed       │    0.05 USDC (unknown purpose)    │
│                             │                                    │
│  Job #13: Swap to ETH      │  Txn 3: 0xBITGO → Aave v3 pool    │
│  Agent: ghost.eth           │    500 USDC                       │
│  Executor: BitGo wallet    │                                    │
│  To: Aave v3 pool          │  Txn 4: 0xe893 → 0x1c4d          │
│  Amount: 500 USDC          │    0.001 USDC (unknown purpose)   │
│  Status: ✅ Executed        │                                    │
│                             │  ❌ No direct user EOA → DEX link  │
│  📄 Reports (encrypted):   │  ❌ Cannot read encrypted report    │
│  • Job #12 report [🔓]     │  ✓ Can see BitGo intermediary      │
│  • Job #13 confirm [🔓]    │  ❌ Cannot see private preferences  │
│                             │                                    │
│  "You see the strategy.     │  "The blockchain sees execution    │
│   They see the result."     │   through an intermediary."        │
├─────────────────────────────┴────────────────────────────────────┤
│  🛡 Execution Intermediary Log                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Job #12 │ policy=research only │ approved     │ 14:23   │  │
│  │ Job #13 │ signer=BitGo wallet  │ approved     │ 14:25   │  │
│  │ Job #13 │ tx hash submitted    │ settled      │ 14:26   │  │
│  ├──────────────────────────────────────────────────────────  │  │
│  │ User EOA on DEX: 0  │ Webhook denials: 3 │ Encrypted docs: 31 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ ENS Control Panel ───────────────────────────────────────┐   │
│  │ defi.risk      = conservative    [Edit]                   │   │
│  │ defi.assets    = ETH,USDC,WBTC   [Edit]                  │   │
│  │ defi.maxTrade  = 500             [Edit]                   │   │
│  │ agent.killswitch = false         [⚠️ Activate]            │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Where Mocking Is Needed

| Component | Real or Mock? | Details |
|-----------|--------------|---------|
| ENS names + text records | **REAL** | Register on Ethereum Sepolia, set text records via resolver |
| ENSIP-25 | **REAL** | Set agent-registration text record key |
| ERC-8004 | **REAL** | Already deployed on Base Sepolia, call register() |
| ERC-8183 | **REAL** | Fork CC0 repo, deploy our own on Base Sepolia |
| HeyElsa x402 | **REAL** | ~$3-4 USDC on Base mainnet |
| AgentCash x402 | **REAL** | ~$1-2 from existing $11.96 balance |
| BitGo SDK | **REAL** | Testnet at app.bitgo-test.com |
| BitGo webhook | **REAL** | Next.js API route + ngrok tunnel |
| Fileverse | **REAL** | @fileverse/agents SDK + free Pimlico/Pinata keys |
| Base Sepolia | **REAL** | Public testnet, free gas |
| Groq LLM | **REAL** | Free API tier, Llama 3.3 70B |
| Charts data | **REAL** | Populated from HeyElsa endpoint responses |
| USDC (escrow) | **REAL** | Deploy test ERC-20 or use existing testnet USDC |

**Zero mocks. Everything is real.**

---

## 10. Key Tradeoffs & Decisions

### T1: ENS on Base Sepolia
- **Problem:** ENS registry doesn't exist on Base Sepolia
- **Solution:** Dual viem clients — Ethereum Sepolia for ENS reads, Base Sepolia for everything else
- **Code:** Two `createPublicClient()` calls, trivial in viem
- **Risk:** Low — this is the standard documented pattern

### T2: HeyElsa Testnet vs Mainnet
- **Problem:** x402 facilitator supports Base Sepolia, but HeyElsa's API might need real USDC
- **Solution:** Test Base Sepolia first. Fallback: $5 real USDC on Base mainnet (covers 250+ calls)
- **Risk:** Low — either way works, negligible cost

### T3: BitGo Base Support
- **Problem:** Need to verify `tbase` is active on BitGo testnet
- **Solution:** Sign up at app.bitgo-test.com, check available coins. If `tbase` unavailable, use `teth`
- **Fallback:** If BitGo setup is too slow, demonstrate fresh-address concept with HD wallet derivation
- **Risk:** Medium — BitGo testnet setup could take time, but the SDK is well-documented

### T4: ERC-8183 Contract Stability
- **Problem:** ERC-8183 is 16-day-old Draft, could change
- **Solution:** Fork the CC0 `erc-8183/base-contracts` which already implements the interface. Interface is well-defined (8 functions, 6 states). Multiple deployments already exist on Base Sepolia.
- **Risk:** Very low — the interface is stable and used in production by at least one team

### T5: Fileverse Encryption
- **Problem:** @fileverse/agents SDK doesn't include built-in E2E encryption
- **Solution:** Encrypt content at application level before calling agent.create(). Use standard AES-256 encryption with user's wallet-derived key.
- **Risk:** Low — standard crypto, just an extra step before CRUD

### T6: Real-time Agent Activity
- **Problem:** Dashboard needs live updates as agents work
- **Solution:** Server-Sent Events (SSE) from Next.js API routes. Agent actions emit events → frontend subscribes.
- **Risk:** Low — simpler than WebSockets, built into browsers

### T7: Multiple Agents Running Simultaneously
- **Problem:** Need to orchestrate 4 agents picking up and executing jobs
- **Solution:** Single orchestrator service that watches ERC-8183 events, routes to the right agent based on job description + agent skills, manages agent state
- **Risk:** Medium — coordination logic is the most complex part. Keep it simple: sequential job processing for MVP, no parallel execution needed for demo.

---

## 11. Code Structure

```
obscura/
├── apps/
│   └── web/                              # Next.js 14 App Router
│       ├── app/
│       │   ├── layout.tsx                # Root layout, providers, dark theme
│       │   ├── page.tsx                  # Dashboard
│       │   ├── marketplace/
│       │   │   └── page.tsx              # Job board + create job
│       │   ├── privacy/
│       │   │   └── page.tsx              # Privacy split-view
│       │   └── api/
│       │       ├── agents/
│       │       │   └── route.ts          # SSE endpoint for agent activity
│       │       ├── jobs/
│       │       │   └── route.ts          # Job orchestration (create, monitor)
│       │       └── webhook/
│       │           └── route.ts          # BitGo webhook handler
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── sidebar.tsx           # Agent roster sidebar
│       │   │   ├── header.tsx            # Logo, wallet connect
│       │   │   └── activity-feed.tsx     # Real-time event stream
│       │   ├── agents/
│       │   │   ├── agent-card.tsx        # Individual agent card
│       │   │   ├── agent-roster.tsx      # All 4 agents
│       │   │   └── reputation-chart.tsx  # Bar chart of agent scores
│       │   ├── jobs/
│       │   │   ├── create-job.tsx        # Job creation form
│       │   │   ├── job-board.tsx         # List of active/completed jobs
│       │   │   └── job-detail.tsx        # Individual job status
│       │   ├── charts/
│       │   │   ├── portfolio-chart.tsx   # TradingView-style line chart
│       │   │   ├── pnl-chart.tsx         # P&L bar chart
│       │   │   └── stats-cards.tsx       # Overview metric cards
│       │   └── privacy/
│       │       ├── split-view.tsx        # Your View vs Chain View
│       │       ├── address-log.tsx       # BitGo address rotation table
│       │       └── ens-control.tsx       # ENS text record editor
│       │
│       └── lib/
│           ├── agents/
│           │   ├── orchestrator.ts       # Job routing + agent management
│           │   ├── base-agent.ts         # Shared agent logic
│           │   ├── scout.ts              # Scout: market research
│           │   ├── analyst.ts            # Analyst: portfolio analysis
│           │   ├── ghost.ts              # Ghost: private execution
│           │   └── sentinel.ts           # Sentinel: evaluation
│           ├── integrations/
│           │   ├── heyelsa.ts            # x402-axios wrapper for DeFi
│           │   ├── agentcash.ts          # x402-axios wrapper for research (enrich, social, etc.)
│           │   ├── bitgo.ts              # BitGo SDK wrapper
│           │   ├── fileverse.ts          # @fileverse/agents wrapper
│           │   ├── ens.ts                # Dual-client ENS read/write
│           │   └── groq.ts              # Groq LLM client (via Vercel AI SDK)
│           ├── contracts/
│           │   ├── agent-jobs.ts         # ERC-8183 ABI + typed helpers
│           │   ├── identity.ts           # ERC-8004 Identity ABI
│           │   └── reputation.ts         # ERC-8004 Reputation ABI
│           └── config/
│               ├── chains.ts             # Base Sepolia + Eth Sepolia config
│               ├── addresses.ts          # All contract addresses
│               └── agents.ts             # Agent metadata + system prompts
│
├── contracts/                            # Foundry
│   ├── src/
│   │   ├── AgentJobs.sol                 # ERC-8183 (forked from base-contracts)
│   │   └── interfaces/
│   │       └── IAgentJobs.sol            # ERC-8183 interface
│   ├── test/
│   │   └── AgentJobs.t.sol              # Basic tests
│   ├── script/
│   │   └── Deploy.s.sol                 # Deploy to Base Sepolia
│   └── foundry.toml
│
├── packages/
│   └── shared/                           # Shared types, constants
│       ├── types.ts                      # Job, Agent, Feedback types
│       └── constants.ts                  # Addresses, ENS keys
│
├── turbo.json
├── package.json
└── .env.example
```

---

## 12. Environment Variables

```env
# Wallet
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
PAYMENT_PRIVATE_KEY=             # For HeyElsa x402 payments
DEPLOYER_PRIVATE_KEY=            # For contract deployment

# RPCs
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
NEXT_PUBLIC_ETH_SEPOLIA_RPC=https://eth-sepolia.public.blastapi.io

# HeyElsa
HEYELSA_API_URL=https://x402-api.heyelsa.ai

# BitGo
BITGO_ACCESS_TOKEN=              # From app.bitgo-test.com
BITGO_WALLET_ID=
BITGO_WALLET_PASSPHRASE=

# Fileverse
PIMLICO_API_KEY=                 # Free tier
PINATA_JWT=                      # Free tier
PINATA_GATEWAY=
FILEVERSE_PRIVATE_KEY=

# AI
GROQ_API_KEY=                    # Free tier

# Contracts
NEXT_PUBLIC_AGENT_JOBS_ADDRESS=  # Our ERC-8183 deployment
NEXT_PUBLIC_IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
NEXT_PUBLIC_REPUTATION_REGISTRY=0x8004B663056A597Dffe9eCcC1965A193B7388713
```

---

## 13. 42-Hour Build Plan

### Phase 1: Foundation (Hours 0–5)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| Turborepo + Next.js + Tailwind + shadcn | 1h | Frontend | `npx create-turbo`, add shadcn/ui components |
| Foundry + fork ERC-8183 | 1h | Contracts | Clone `erc-8183/base-contracts`, customize |
| Deploy AgentJobs.sol to Base Sepolia | 0.5h | Contracts | `forge script Deploy.s.sol --broadcast --rpc-url base-sepolia` |
| Register 4 agents on ERC-8004 | 1h | Backend | Call `register()` with agent metadata |
| Register ENS names + set text records | 1.5h | Backend | Eth Sepolia: 4 names + ENSIP-25 + DeFi prefs |

### Phase 2: Integration Layer (Hours 5–14)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| HeyElsa x402 client wrapper | 1.5h | Backend | x402-axios, test search_token, get_yield, analyze_wallet |
| AgentCash x402 client wrapper | 1h | Backend | x402-axios for stableenrich (search, scrape, twitter) |
| BitGo SDK + testnet wallet | 2h | Backend | Create wallet, test createAddress(), set up webhook |
| BitGo webhook handler | 1.5h | Backend | Next.js API route + ngrok tunnel |
| Fileverse agents SDK | 1.5h | Backend | Init with Pimlico+Pinata, test create/read |
| ENS dual-client | 1h | Backend | viem clients for Eth Sepolia + Base Sepolia |
| Vercel AI SDK + agent tools | 1.5h | Backend | Tool definitions for all 4 agents, maxSteps config |

### Phase 3: Agent Logic (Hours 14–20)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| Base agent class | 1h | Backend | Shared: accept job, execute, submit deliverable |
| Orchestrator | 1.5h | Backend | Watch JobCreated events, route to agents |
| Scout agent | 1h | Backend | Groq reasoning + HeyElsa yield/search |
| Analyst agent | 1h | Backend | Groq reasoning + HeyElsa analyze/portfolio |
| Ghost agent | 1.5h | Backend | BitGo signing flow + HeyElsa execute_swap pipeline |
| Sentinel agent | 1h | Backend | Evaluate deliverable + complete/reject on ERC-8183 |

### Phase 4: Frontend Core (Hours 20–30)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| Layout + header + sidebar + wallet | 2h | Frontend | RainbowKit, dark theme, navigation |
| Agent roster (sidebar cards) | 1.5h | Frontend | 4 cards, live status, reputation score |
| Dashboard overview cards | 1h | Frontend | Total value, jobs done, agents active |
| Portfolio chart (lightweight-charts) | 2h | Frontend | TradingView-style line chart from HeyElsa data |
| Agent reputation bar chart | 1h | Frontend | Recharts bar chart from ERC-8004 |
| Marketplace: create job form | 1.5h | Frontend | ERC-8183 createJob + USDC approve + fund |
| Marketplace: job board | 1.5h | Frontend | Active/completed jobs, status indicators |
| Activity feed (SSE) | 1.5h | Frontend | Real-time agent action stream |

### Phase 5: Privacy Layer (Hours 30–36)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| Privacy split-view page | 2h | Frontend | "Your View" vs "Chain View" side-by-side |
| Execution intermediary log | 1h | Frontend | BitGo signing / approval / settlement timeline |
| Fileverse doc viewer | 1.5h | Frontend | Decrypt + display agent reports |
| ENS control panel | 1h | Frontend | Edit text records, kill switch button |
| Privacy metrics | 0.5h | Frontend | User EOA off-path count, encrypted docs, webhook approvals |

### Phase 6: Polish + Demo (Hours 36–42)

| Task | Time | Owner | Details |
|------|------|-------|---------|
| End-to-end + failure-path tests | 2h | All | Full job lifecycle plus webhook denial, expiry, kill switch |
| UI polish | 1.5h | Frontend | Loading states, animations, error handling |
| Demo script + rehearsal | 1.5h | All | Practice 3-minute pitch, backup demo video |
| Deploy to Vercel | 0.5h | Frontend | Env vars, production build |
| Devfolio submission | 0.5h | All | Screenshots, description, bounty selections |

---

## 14. Demo Script (3 Minutes)

### 0:00 — Hook
"What if you could hire AI agents for DeFi without your wallet touching the protocol directly?"

### 0:15 — Problem
"Every DeFi transaction today is public. Your strategy, your positions, your alpha — all visible to front-runners and copycats. And there's no way to hire autonomous agents without exposing your entire playbook."

### 0:30 — Solution
"This is **Obscura** — a private-by-default marketplace for AI agents. Post a DeFi job. Pick an agent manually or auto-assign by reputation. Execution happens through a policy-gated BitGo intermediary. Every deliverable is encrypted. And reputation lives on-chain."

### 0:50 — Live Demo: Browse Agents
Show the marketplace. "These are 4 autonomous agents. Each has an ENS name, an ERC-8004 on-chain identity, and a reputation score built from completed jobs."

### 1:05 — Live Demo: Post a Job
Type: "Find me the best yield for 500 USDC on Base"
Show the ERC-8183 transaction — job created, USDC escrowed on-chain.

### 1:20 — Watch the Agent Work
Scout picks up the job → calls HeyElsa x402 for yield data → calls AgentCash x402 for Twitter sentiment + protocol audit search → writes comprehensive encrypted report to Fileverse → submits deliverable hash on-chain. "One agent. Three x402 services. Five reasoning steps. All paid in micropayments."

### 1:45 — Evaluation + Reputation
Sentinel evaluates the deliverable → calls `complete()` on ERC-8183 → escrow releases USDC to scout → scout's ERC-8004 reputation increases from 87 to 88. "All verifiable on-chain."

### 2:00 — THE PRIVACY MOMENT
Switch to Privacy Panel. Left side: "Your View" — full strategy, all details, encrypted reports.
Right side: "Chain View" — BitGo wallet executes onchain, but your EOA never touches the protocol directly.
**"The chain sees execution. You keep the strategy."**

### 2:20 — Kill Switch
Go to ENS control panel. Change `agent.killswitch` from `false` to `true`.
Agents stop immediately. "Your ENS name is the master key to your entire agent fleet."

### 2:35 — Standards Flex
"We're using ERC-8183 for agentic commerce — it's 16 days old. ERC-8004 for agent reputation — deployed on 34 chains. ENSIP-25 for agent identity — 8 days old. HeyElsa x402 for every DeFi operation. BitGo for policy-gated private execution. Fileverse for encrypted storage. Core contracts on Base."

### 2:50 — Close
"Obscura. Private execution. Public reputation. Real yield."

**Built by Paracausal Labs.**

---

## 15. Known Issues & Fixes (Code Review)

These were flagged in a review. Each is addressed below.

### FIX 1: Privacy claim — "unlinkable" is overstated

**Problem:** If Ghost funds a fresh BitGo address from the main wallet, there's an on-chain funding edge (main_wallet → fresh_address) that links them.

**Honest assessment:** BitGo's EVM fresh addresses are "forwarder" contracts for INBOUND funds. For OUTBOUND sends, they come from the main wallet. So the "unlinkable" claim is overstated for EVM.

**Actual privacy model (corrected):**
- The USER never interacts with DEXs directly. User deposits into BitGo wallet (one-time, off-chain custody transfer).
- Ghost's trades come from the BitGo hot wallet — which is a CUSTODIAL address shared across many users. An observer sees `bitgo_hot_wallet → DEX` but can't attribute it to a specific user.
- This is the same privacy model as centralized exchanges: your trades go through a shared pool.
- For the demo: frame this as "custodial privacy" — the user's EOA never touches DeFi directly, BitGo acts as a privacy shield.
- Don't claim "unlinkable" — claim "BitGo as a privacy intermediary that breaks the direct link between user wallet and DeFi execution."

**Updated pitch language:**
- ~~"unlinkable on-chain"~~ → "user wallet never touches DeFi — BitGo acts as privacy intermediary"
- ~~"front-run protection"~~ → "execution through custodial infrastructure reduces front-running surface"
- The Privacy Panel still works: "Your View" shows the full strategy, "Chain View" shows BitGo hot wallet → DEX with no link to user EOA.

**Alternative (if time allows):** Use separate HD-derived wallets (one per agent) funded in a batch transaction. Each agent's wallet is a different EOA — harder to link individual trades to one strategy. This is closer to true address rotation.

### FIX 2: Fileverse SDK API shape is wrong

**Problem:** Plan used `FileverseAgent` with `create({ content, title })`. Actual SDK uses `Agent` class with `setupStorage()` and string-based CRUD. No built-in E2E encryption.

**Corrected Fileverse code:**
```typescript
import { Agent } from '@fileverse/agents';
import { privateKeyToAccount } from 'viem/accounts';
import { PinataStorageProvider } from '@fileverse/agents/storage';

const storageProvider = new PinataStorageProvider({
  jwt: process.env.PINATA_JWT,
  gateway: process.env.PINATA_GATEWAY,
});

const fileverseAgent = new Agent({
  chain: 'gnosis',
  viemAccount: privateKeyToAccount(process.env.FILEVERSE_PRIVATE_KEY as `0x${string}`),
  pimlicoAPIKey: process.env.PIMLICO_API_KEY,
  storageProvider,
});

await fileverseAgent.setupStorage('obscura-reports');

// CREATE (takes a markdown string, not an object)
const report = await fileverseAgent.create(
  `# Job #12 — Yield Research\n\n` +
  `**Agent:** scout.eth\n` +
  `**Findings:** Aave v3: 4.2% APY on Base\n` +
  `**Recommendation:** Deposit 500 USDC\n` +
  `**Timestamp:** ${new Date().toISOString()}`
);

// READ
const data = await fileverseAgent.getFile(report.fileId);

// UPDATE
await fileverseAgent.update(report.fileId, updatedMarkdown);
```

**Encryption (app-level):**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encrypt(text: string, key: Buffer): { iv: string; encrypted: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex'), tag: tag.toString('hex') };
}

// Encrypt BEFORE writing to Fileverse
const userKey = deriveKeyFromSignature(userSignature); // never derive from public address alone
const { iv, encrypted, tag } = encrypt(reportMarkdown, userKey);
const report = await fileverseAgent.create(
  `ENCRYPTED:${iv}:${tag}:${encrypted}`
);
```

**Sentinel access model (fixed):**
- Sentinel does NOT decrypt the full report
- Agent submits TWO things: (1) encrypted full report to Fileverse, (2) plaintext METADATA summary on-chain in the deliverable hash
- Sentinel evaluates the metadata: "Did the agent call the right HeyElsa endpoints? Does the recommendation match user risk profile? Is the response timely?"
- This is metadata-based evaluation, not content-based

### FIX 3: BitGo webhook not connected to HeyElsa swap path

**Problem:** Ghost calls HeyElsa `execute_swap`, but the plan never shows how BitGo's webhook policy evaluates the transaction.

**Corrected flow (using HeyElsa's pipeline system):**
```
1. Ghost calls HeyElsa: execute_swap(dry_run: true)
   → Gets pipeline_id + unsigned tx_data

2. Ghost polls: get_transaction_status(pipeline_id)
   → Waits for status = "sign_pending"
   → Gets tx_data (the unsigned transaction)

3. Ghost sends tx_data to BitGo for signing:
   → BitGo webhook fires → POSTs to our /api/webhook
   → Sentinel evaluates: check ENS spending limits, asset whitelist
   → Returns approve/deny

4. If approved: BitGo signs the tx
   → Ghost broadcasts signed tx to Base

5. Ghost calls: submit_transaction_hash(pipeline_id, tx_hash)
   → HeyElsa confirms settlement
```

The key insight: HeyElsa gives us an UNSIGNED transaction. We sign it through BitGo (which triggers the webhook). This is the actual handoff point.

**If BitGo signing integration is too complex for 42h:**
Fallback: BitGo webhook evaluates the dry_run QUOTE before Ghost requests execution. Less elegant but still demonstrates policy-governed trading:
```
1. Ghost calls: get_swap_quote → gets quote details
2. Ghost POSTs quote to our /api/webhook → Sentinel evaluates
3. If approved: Ghost calls execute_swap (non-dry-run)
4. Ghost signs with regular wallet (not BitGo signing)
```

### FIX 4: ERC-8183 lifecycle inconsistency

**Problem:** Plan mixes two models — open jobs (setProvider later) vs pre-assigned jobs (provider set at creation).

**Chosen model for MVP: Pre-assigned with UI auto-select.**
```
1. User types job description in UI
2. Frontend classifies job type (keyword match or LLM):
   - "yield/search/find" → scout.eth
   - "analyze/portfolio/pnl" → analyst.eth
   - "swap/trade/execute" → ghost.eth
3. Frontend calls createJob(provider=scout_address, evaluator=sentinel_address, ...)
4. Frontend calls fund(jobId, budget)
5. Orchestrator detects JobFunded event → triggers the assigned agent
6. Agent works → submit(jobId, deliverableHash)
7. Sentinel → complete(jobId, reason) or reject(jobId, reason)
```

No setProvider() needed. Provider is set at creation. The "Auto-assign" dropdown in UI just picks the highest-reputation agent for the job type.

**Contract ABI (simplified for MVP):**
```solidity
function createJob(
    address provider,
    address evaluator,
    uint256 expiredAt,
    string calldata description,
    address hook          // address(0) for MVP
) external returns (uint256 jobId);

function fund(uint256 jobId, uint256 expectedBudget) external;
function submit(uint256 jobId, bytes32 deliverable) external;
function complete(uint256 jobId, bytes32 reason) external;
function reject(uint256 jobId, bytes32 reason) external;
function claimRefund(uint256 jobId) external;
```

### FIX 5: OpenClaw bounty weakness

**Problem:** We use Vercel AI SDK but claim the "x402 + OpenClaw" bounty.

**Fix: Actually use OpenClaw's elsa-openclaw skill pack.**

The `elsa-openclaw` package exports tool definitions that can be imported and used as Vercel AI SDK tools. They're just TypeScript functions.

```typescript
// Use OpenClaw's actual tool implementations
import { ElsaSkills } from 'elsa-openclaw';

const elsaSkills = new ElsaSkills({
  paymentPrivateKey: process.env.PAYMENT_PRIVATE_KEY,
  baseRpcUrl: process.env.BASE_RPC_URL,
  maxUsdPerCall: 0.05,
  maxUsdPerDay: 5.00,
});

// Wrap OpenClaw tools for Vercel AI SDK
const tools = {
  elsa_search_token: tool({
    description: 'Search for tokens',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => elsaSkills.searchToken(query),
  }),
  // ... map each OpenClaw tool to a Vercel AI SDK tool
};
```

If the OpenClaw package doesn't export clean functions (i.e., it's MCP-only), then:
- Use `elsa-openclaw` as a reference for tool signatures
- Implement the same tool interface with x402-axios directly
- Mention OpenClaw compatibility in the submission

**Bounty strategy update:**
- Primary: "$1,000: Projects building with the SDK" (this is the stronger claim — we use x402 SDK deeply)
- Secondary: "$1,000: Best Use of Elsa x402 and OpenClaw" (claim via OpenClaw tool format compatibility)

### FIX 6: Test plan is happy-path only

**Critical failure modes to handle before demo:**

| Failure Mode | How to Handle | Priority |
|---|---|---|
| x402 balance insufficient | Check balance before agent runs, show error in activity feed | HIGH |
| HeyElsa API returns error | Agent retries once, then marks job as failed with reason | HIGH |
| BitGo webhook timeout | Fallback: auto-approve after 10s timeout with warning | MEDIUM |
| Job expires before completion | Orchestrator watches expiry, auto-refunds, logs to feed | MEDIUM |
| Kill switch activated mid-job | Orchestrator checks killswitch before each agent step | HIGH |
| Fileverse write fails | Cache report locally, retry, still submit job with "report pending" | LOW |

**Pre-demo checklist:**
- [ ] Fund HeyElsa wallet with $5 USDC
- [ ] Verify AgentCash balance > $2
- [ ] Test one full job cycle end-to-end
- [ ] Test kill switch toggle
- [ ] Test webhook approval AND denial
- [ ] Have backup demo video recorded

### Open Questions — Resolved

**Q: Multi-chain story?**
A: Be honest. "Agents LIVE on Base (ERC-8004 identity, ERC-8183 jobs). They READ strategy from ENS (Ethereum). They STORE reports on Fileverse (Gnosis). They PAY for intelligence via x402 (Base mainnet)." This is standard for any multi-protocol project. The pitch says "on Base" because that's where the core logic lives.

**Q: True privacy or address rotation?**
A: Custodial privacy via BitGo for the hackathon. The real value: user's EOA never touches DeFi directly. Frame as "privacy intermediary" not "cryptographic unlinkability." Honest and still impressive.

**Q: Sentinel plaintext vs encrypted?**
A: Sentinel evaluates METADATA only (did agent call right endpoints, does recommendation match risk profile, was response timely). Full report is encrypted for user. Sentinel never needs to decrypt.

---

## 16. Bounty Eligibility Summary (Updated)

| Sponsor | Bounty | Amount | Our Integration |
|---------|--------|--------|----------------|
| ENS | Best creative use | $1,000 | Text records as control layer, ENSIP-25, kill switch |
| ENS | Pool prize | $1,000 | Deep integration across all agents |
| HeyElsa | x402 + OpenClaw | $1,000 | Stretch claim if `elsa-openclaw` tools are wired directly |
| HeyElsa | SDK projects | $1,000 | Full SDK integration solving real DeFi problem |
| BitGo | Best Privacy App | $1,200 | User EOA off-path, BitGo as privacy intermediary |
| BitGo | Best DeFi App | $800 | Webhook policy engine, spending limits |
| Fileverse | Build What Big Tech Won't | $1,000 | Encrypted agent deliverables, no surveillance |
| Base | AI × Onchain | $350 | Multi-agent economy, on-chain identity + commerce |
| Base | DeFi 2.0 | $350 | Novel DeFi primitive (agent job marketplace) |
| Base | Privacy | $350 | Encrypted strategy layer + user wallet off the DeFi path |
| **TOTAL ELIGIBLE** | | **$8,050** | |
