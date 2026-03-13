"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useSignMessage,
} from "wagmi";
import { erc20Abi, parseEventLogs, zeroAddress } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classifyJobAgent, AGENTS } from "@/lib/config/agents";
import { agentJobsConfig, AGENT_JOBS_ABI } from "@/lib/contracts/agent-jobs";
import { ADDRESSES, AGENT_ADDRESSES } from "@/lib/config/addresses";
import { useEnsIdentity, useEnsPreferences } from "@/hooks/useEnsIdentity";

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
  submitting: "Submitting to agents...",
  done: "Job submitted!",
  error: "Something went wrong",
};

export function CreateJob() {
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("0.05");
  const [step, setStep] = useState<FlowStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();

  const { ensName } = useEnsIdentity(address);
  const prefs = useEnsPreferences(ensName);

  const suggestedAgent = description ? classifyJobAgent(description) : null;
  const agentMeta = suggestedAgent ? AGENTS[suggestedAgent] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !isConnected || !address || !publicClient) return;

    setErrorMsg("");

    try {
      const role = classifyJobAgent(description);
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

      // Step 3: Fund the job
      setStep("funding");
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
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Post a Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">What do you need?</label>
            <Input
              placeholder='e.g. "Find me the best yield for 500 USDC on Base"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          {suggestedAgent && agentMeta && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Auto-selected:</span>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                {agentMeta.name}.eth
              </Badge>
              <span className="text-xs text-zinc-600">({agentMeta.description})</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Budget (USDC)</label>
              <Input
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-zinc-800 border-zinc-700 w-32"
              />
            </div>
            <div className="flex-1" />
            <Button
              type="submit"
              disabled={!description.trim() || !isConnected || step !== "idle" && step !== "done" && step !== "error"}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {step === "idle" || step === "done" || step === "error"
                ? "Post Job →"
                : "Processing..."}
            </Button>
          </div>

          {!isConnected && (
            <p className="text-xs text-amber-400">Connect your wallet to post a job</p>
          )}

          {isConnected && prefs.hasRecords && (
            <div className="rounded-md bg-zinc-800/50 border border-zinc-700/50 p-3 space-y-1.5">
              <p className="text-xs text-zinc-500 font-medium">ENS DeFi Preferences</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-zinc-400">
                  Risk: <span className="text-violet-400">{prefs.risk}</span>
                </span>
                <span className="text-zinc-400">
                  Assets: <span className="text-violet-400">{prefs.assets}</span>
                </span>
                <span className="text-zinc-400">
                  Max trade: <span className="text-violet-400">{prefs.maxTrade} USDC</span>
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
              <span className={step === "error" ? "text-red-400" : step === "done" ? "text-green-400" : "text-violet-400"}>
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
