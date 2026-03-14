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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  creating: "1/4 — Creating job on-chain...",
  approving: "2/4 — Approving USDC spend...",
  funding: "3/4 — Funding job...",
  signing: "4/4 — Signing encryption key...",
  submitting: "Agent working — watch the Live Activity feed below...",
  done: "Job submitted!",
  error: "Something went wrong",
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
          `Insufficient USDC balance. You have ${formatUnits(currentBalance, 6)} USDC but need ${budget}. Use the "Mint Test USDC" button below.`
        );
      }
      const fundHash = await writeContractAsync({
        ...agentJobsConfig,
        functionName: "fund",
        args: [jobId, budgetBigInt],
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
    <Card className="relative rounded-[2rem] border border-white/[0.06] bg-[#0c0d12] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <CardContent className="p-6">
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          New Job
        </p>
        <h2 className="text-lg font-light text-white tracking-tight mb-4">Post a Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">What do you need?</label>
            <Input
              placeholder='e.g. "Find me the best yield for 500 USDC on Base"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#0a0b0f] border-white/[0.06] focus:border-[#ff0033]/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500 mb-1 block">Select Agent</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setManualAgent("auto")}
                className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                  manualAgent === "auto"
                    ? "bg-[#ff0033]/10 border-[#ff0033]/30 text-[#ff0033]"
                    : "bg-[#0a0b0f] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                }`}
              >
                Auto-route
              </button>
              {SELECTABLE_AGENTS.map((role) => {
                const meta = AGENTS[role];
                const isSelected = manualAgent === role;
                const isDisabled = role === AgentRole.Ghost && preflight && !preflight.bitgo;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setManualAgent(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                      isSelected
                        ? "bg-[#ff0033]/10 border-[#ff0033]/30 text-[#ff0033]"
                        : "bg-[#0a0b0f] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                    }`}
                  >
                    {meta.name}.eth
                    {isDisabled && <span className="text-amber-400 ml-1">(preview)</span>}
                  </button>
                );
              })}
            </div>
            {selectedRole && agentMeta && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>→</span>
                <Badge variant="secondary" className="bg-[#ff0033]/10 text-[#ff0033] border-[#ff0033]/20">
                  {agentMeta.name}.eth
                </Badge>
                <span>{agentMeta.description}</span>
                <span className="text-zinc-600">• {agentMeta.baseFee} USDC base fee</span>
              </div>
            )}
            {isGhostWithoutBitGo && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <p className="text-xs text-amber-400">
                  BitGo execution is currently unavailable. Ghost will produce a quote + policy preview only — no trade will be executed. Job escrow still applies.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Budget (USDC)</label>
              <Input
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-[#0a0b0f] border-white/[0.06] focus:border-[#ff0033]/30 w-32"
              />
            </div>
            <div className="flex-1" />
            <Button
              type="submit"
              disabled={!description.trim() || !isConnected || step !== "idle" && step !== "done" && step !== "error"}
              className="bg-[#ff0033] hover:bg-[#ff1a40] rounded-xl"
            >
              {step === "idle" || step === "done" || step === "error"
                ? "Post Job →"
                : "Processing..."}
            </Button>
          </div>

          {!isConnected && (
            <p className="text-xs text-amber-400">Connect your wallet to post a job</p>
          )}

          {isConnected && formattedBalance !== null && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500">
                USDC Balance: <span className="text-white font-mono">{parseFloat(formattedBalance).toFixed(2)}</span>
              </span>
              <button
                type="button"
                onClick={handleMint}
                disabled={minting}
                className="px-2 py-1 rounded bg-[#ff0033]/10 border border-[#ff0033]/20 text-[#ff0033] hover:bg-[#ff0033]/20 transition-colors disabled:opacity-50"
              >
                {minting ? "Minting..." : "Mint 100 Test USDC"}
              </button>
            </div>
          )}

          {isConnected && prefs.hasRecords && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-1.5">
              <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">ENS DeFi Preferences</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-zinc-400">
                  Risk: <span className="text-[#ff0033]">{prefs.risk}</span>
                </span>
                <span className="text-zinc-400">
                  Assets: <span className="text-[#ff0033]">{prefs.assets}</span>
                </span>
                <span className="text-zinc-400">
                  Max trade: <span className="text-[#ff0033]">{prefs.maxTrade} USDC</span>
                </span>
                {prefs.killswitch && (
                  <span className="text-red-400">Kill switch active</span>
                )}
              </div>
              {ensName && (
                <p className="text-[10px] text-zinc-600">Loaded from {ensName} text records</p>
              )}
            </div>
          )}

          {step !== "idle" && (
            <div className="text-xs">
              <span className={step === "error" ? "text-red-400" : step === "done" ? "text-green-400" : "text-[#ff0033]"}>
                {STEP_LABELS[step]}
              </span>
              {step === "error" && errorMsg && (
                <span className="text-red-400 block mt-1">{errorMsg}</span>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
