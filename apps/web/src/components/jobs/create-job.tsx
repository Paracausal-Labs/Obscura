"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useSignMessage,
  useReadContract,
} from "wagmi";
import { erc20Abi, parseEventLogs, zeroAddress, formatUnits } from "viem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { classifyJobAgent, AGENTS } from "@/lib/config/agents";
import { AgentRole } from "@obscura/shared";
import { agentJobsConfig, AGENT_JOBS_ABI } from "@/lib/contracts/agent-jobs";
import { ADDRESSES, AGENT_ADDRESSES } from "@/lib/config/addresses";
import { useEnsIdentity, useEnsPreferences } from "@/hooks/useEnsIdentity";

interface PreflightStatus {
  bitgo: boolean;
  heyelsa: boolean;
  fileverse: boolean;
  groq: boolean;
  contracts: boolean;
  rpc: boolean;
}

type FlowStep =
  | "idle"
  | "creating"
  | "approving"
  | "funding"
  | "signing"
  | "submitting"
  | "done"
  | "error";

const STEP_LABELS: Record<FlowStep, string> = {
  idle: "",
  creating: "SECURE_CHANNEL :: CREATING JOB ON-CHAIN...",
  approving: "POLICY_AUTH :: APPROVING USDC SPEND...",
  funding: "ESCROW_LOCK :: FUNDING JOB...",
  signing: "REPORTS_ENC :: SIGNING ENCRYPTION KEY...",
  submitting: "ORCHESTRATOR :: AGENT DISPATCHED — MONITOR LIVE_FEED...",
  done: "TRANSACTION_SETTLED :: JOB SUBMITTED",
  error: "CRITICAL_FAILURE :: TRANSACTION INTERRUPTED",
};

const MOCK_USDC_MINT_ABI = [
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const SELECTABLE_AGENTS = [AgentRole.Scout, AgentRole.Analyst, AgentRole.Ghost] as const;

export function CreateJob() {
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("0.05");
  const [step, setStep] = useState<FlowStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualAgent, setManualAgent] = useState<AgentRole | "auto">("auto");

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();

  const [preflight, setPreflight] = useState<PreflightStatus | null>(null);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    fetch("/api/preflight")
      .then((r) => r.json())
      .then((data) => setPreflight(data))
      .catch(() => setPreflight(null));
  }, []);

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: ADDRESSES.USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const formattedBalance = usdcBalance !== undefined
    ? formatUnits(usdcBalance, 6)
    : null;

  async function handleMint() {
    if (!address || !publicClient) return;
    setMinting(true);
    try {
      const hash = await writeContractAsync({
        address: ADDRESSES.USDC,
        abi: MOCK_USDC_MINT_ABI,
        functionName: "mint",
        args: [address, BigInt(100 * 1e6)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refetchBalance();
    } catch {
      // mint failed — user rejected or network error
    } finally {
      setMinting(false);
    }
  }

  const { ensName } = useEnsIdentity(address);
  const prefs = useEnsPreferences(ensName);

  const suggestedAgent = description ? classifyJobAgent(description) : null;
  const selectedRole = manualAgent !== "auto" ? manualAgent : suggestedAgent;
  const isGhostWithoutBitGo = selectedRole === AgentRole.Ghost && preflight && !preflight.bitgo;
  const agentMeta = selectedRole ? AGENTS[selectedRole] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !isConnected || !address || !publicClient) return;

    setErrorMsg("");

    try {
      const role = manualAgent !== "auto" ? manualAgent : classifyJobAgent(description);
      const provider = AGENT_ADDRESSES[role as keyof typeof AGENT_ADDRESSES];
      const evaluator = AGENT_ADDRESSES.sentinel;
      const expiredAt = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const budgetBigInt = BigInt(Math.round(parseFloat(budget) * 1e6));

      // Step 1: Create job on-chain
      setStep("creating");
      const createHash = await writeContractAsync({
        ...agentJobsConfig,
        functionName: "createJob",
        args: [provider, evaluator, expiredAt, description, zeroAddress],
      });

      const createReceipt = await publicClient.waitForTransactionReceipt({
        hash: createHash,
      });

      const events = parseEventLogs({
        abi: AGENT_JOBS_ABI,
        logs: createReceipt.logs,
        eventName: "JobCreated",
      });

      if (events.length === 0) {
        throw new Error("JobCreated event not found in receipt");
      }
      const jobId = events[0].args.jobId;

      // Step 2: Approve USDC spend
      setStep("approving");
      const approveHash = await writeContractAsync({
        address: ADDRESSES.USDC,
        abi: erc20Abi,
        functionName: "approve",
        args: [ADDRESSES.AGENT_JOBS, budgetBigInt],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Step 3: Fund the job (check balance first)
      setStep("funding");
      const currentBalance = await publicClient.readContract({
        address: ADDRESSES.USDC,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
      if (currentBalance < budgetBigInt) {
        throw new Error(
          `INS_BAL :: You have ${formatUnits(currentBalance, 6)} USDC but need ${budget}. Use the "Mint Test USDC" button.`
        );
      }
      const fundHash = await writeContractAsync({
        ...agentJobsConfig,
        functionName: "fund",
        args: [jobId, budgetBigInt],
        gas: BigInt(200_000),
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash });

      // Step 4: Sign per-job encryption key
      setStep("signing");
      const userSignature = await signMessageAsync({
        message: `Obscura encryption key for job #${jobId}`,
      });

      // Step 5: Submit to backend
      setStep("submitting");
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jobId.toString(),
          description,
          provider,
          evaluator,
          budget: budgetBigInt.toString(),
          expiredAt: expiredAt.toString(),
          client: address,
          userSignature,
          userEnsName: ensName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Backend submission failed");
      }

      setStep("done");
      setDescription("");
    } catch (err) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-[#ff0033]/20 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ff0033] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        {/* ──────── LEFT: inputs ──────── */}
        <div className="flex-1 space-y-8">
          <div>
            <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
              Mission Parameters
            </p>
            <h2 className="text-3xl font-light text-white tracking-tight mb-6">Initialize Job</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-1">Directive</label>
                <div className="relative group">
                  <Input
                    placeholder='Describe your goal, e.g. "Scan Base for yields > 10%"'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 bg-[#07080a] border-white/[0.06] focus:border-[#ff0033]/40 focus:ring-1 focus:ring-[#ff0033]/20 transition-all rounded-xl pl-4 pr-24 placeholder:text-zinc-700 text-sm"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("sample-prompts");
                          if (el) el.classList.toggle("hidden");
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[9px] font-mono text-zinc-500 uppercase tracking-wider hover:border-[#ff0033]/30 hover:text-zinc-300 transition-all"
                      >
                        Examples
                      </button>
                      <div
                        id="sample-prompts"
                        className="hidden absolute right-0 top-full mt-2 w-80 max-h-64 rounded-xl border border-white/[0.06] bg-[#0a0b10] shadow-2xl shadow-black/50 z-50 overflow-y-auto overscroll-contain"
                      >
                        {[
                          { label: "Yield Research", prompt: "Find me the best yield opportunities for USDC on Base" },
                          { label: "Protocol Deep Dive", prompt: "Give me a deep analysis of Aerodrome Finance on Base" },
                          { label: "Token Analysis", prompt: "Research the top trending tokens on Base this week" },
                          { label: "Portfolio Audit", prompt: "Analyze my wallet on Base and suggest optimizations" },
                          { label: "Market Research", prompt: "What are the best DeFi protocols on Base right now?" },
                          { label: "Risk Assessment", prompt: "Analyze the risk profile of stablecoin yields on Base" },
                        ].map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => {
                              setDescription(s.prompt);
                              document.getElementById("sample-prompts")?.classList.add("hidden");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] last:border-0"
                          >
                            <span className="text-[9px] font-bold text-[#ff0033] uppercase tracking-wider">{s.label}</span>
                            <p className="text-xs text-zinc-400 mt-0.5">{s.prompt}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-1">Agent Assignment</label>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setManualAgent("auto")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                      manualAgent === "auto"
                        ? "bg-[#ff0033]/10 border-[#ff0033]/40 text-[#ff0033] shadow-[0_0_15px_rgba(255,0,51,0.15)]"
                        : "bg-[#07080a] border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                    }`}
                  >
                    Auto-Route
                  </button>
                  {SELECTABLE_AGENTS.map((role) => {
                    const meta = AGENTS[role];
                    const isSelected = manualAgent === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setManualAgent(role)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                          isSelected
                            ? "bg-[#ff0033]/10 border-[#ff0033]/40 text-[#ff0033] shadow-[0_0_15px_rgba(255,0,51,0.15)]"
                            : "bg-[#07080a] border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                        }`}
                      >
                        {meta.name}
                      </button>
                    );
                  })}
                </div>
                {selectedRole && agentMeta && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <div className="w-2 h-2 rounded-full bg-[#ff0033] shadow-[0_0_8px_rgba(255,0,51,0.5)]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none">
                        Active_Intermediary: <span className="text-white">{agentMeta.name}.eth</span>
                      </p>
                      <p className="text-[9px] text-zinc-600 mt-1">{agentMeta.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-1">Bounty (USDC)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-12 bg-[#07080a] border-white/[0.06] focus:border-[#ff0033]/40 w-32 rounded-xl text-center font-mono font-bold"
                  />
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-end gap-3">
                   {isConnected && formattedBalance !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Available_USDC: <span className="text-white">{parseFloat(formattedBalance).toFixed(2)}</span></span>
                      <button
                        type="button"
                        onClick={handleMint}
                        disabled={minting}
                        className="text-[8px] font-black uppercase tracking-widest text-[#ff0033] hover:text-[#ff1a40] transition-colors disabled:opacity-30"
                      >
                        {minting ? "SYNCING..." : "MINT_TEST_FUNDS"}
                      </button>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!description.trim() || !isConnected || (step !== "idle" && step !== "done" && step !== "error")}
                    className="relative h-12 px-10 bg-gradient-to-b from-zinc-100/10 to-transparent backdrop-blur-lg border border-[#ff0033]/40 text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:border-[#ff0033] hover:shadow-[0_0_25px_rgba(255,0,51,0.3)] group/btn overflow-hidden disabled:opacity-50 disabled:grayscale"
                  >
                    <span className="relative z-10 transition-colors group-hover/btn:text-white">
                      {step === "idle" || step === "done" || step === "error" ? "Execute Mission" : "In Progress"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff0033]/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#ff0033] to-transparent opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </div>

              {step !== "idle" && (
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    {step !== "done" && step !== "error" && (
                      <div className="w-1 h-3 bg-[#ff0033] animate-pulse" />
                    )}
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${
                      step === "error" ? "text-red-400" : step === "done" ? "text-green-400" : "text-[#ff0033]"
                    }`}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                  {step === "error" && errorMsg && (
                    <p className="text-[9px] font-mono text-red-500/80 mt-2 pl-4 border-l border-red-500/20">{errorMsg}</p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ──────── RIGHT: Profile/ENS ──────── */}
        <div className="lg:w-[320px] space-y-6">
          <div className="p-6 rounded-[1.5rem] bg-[#07080a]/50 border border-white/[0.04] backdrop-blur-md">
            <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.25em] mb-4">Identity Decryption</p>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff0033]/20 to-transparent border border-white/[0.06] flex items-center justify-center">
                <span className="text-xl">◈</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold tracking-tight truncate">{ensName || (address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Disconnected")}</h4>
                <p className="text-[9px] text-[#ff0033] font-mono uppercase tracking-widest font-bold">Client_Authenticated</p>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <p className="text-zinc-700 text-[8px] uppercase tracking-widest mb-1.5">ENS DeFi Intelligence</p>
                {prefs.hasRecords ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[8px] text-zinc-500 uppercase mb-1">Risk_Tier</p>
                      <p className="text-[10px] font-black text-white">{prefs.risk}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[8px] text-zinc-500 uppercase mb-1">Max_Bounty</p>
                      <p className="text-[10px] font-black text-white">{prefs.maxTrade} USDC</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] col-span-2">
                      <p className="text-[8px] text-zinc-500 uppercase mb-1">Asset_Protocol</p>
                      <p className="text-[10px] font-black text-white truncate">{prefs.assets}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/[0.02] bg-white/[0.01] text-center">
                    <p className="text-[9px] text-zinc-700 leading-relaxed uppercase tracking-tighter">No policy records found on ENS</p>
                  </div>
                )}
               </div>

               <div className="pt-4 border-t border-white/[0.04]">
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-600 uppercase">Privacy_Layer</span>
                    <span className="text-green-500/80 font-bold uppercase tracking-widest">ENABLED</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className="text-zinc-600 uppercase">ESCR_Prot</span>
                    <span className="text-green-500/80 font-bold uppercase tracking-widest">ERC-8183</span>
                 </div>
               </div>
            </div>
          </div>

          {isGhostWithoutBitGo && (
            <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/[0.08] relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Dev_Mode Warning</p>
               <p className="text-[9px] text-amber-500/60 leading-relaxed uppercase tracking-tighter">
                 BitGo bridge offline. Ghost will generate strategy intelligence without on-chain execution. Policy escrow enforced.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
