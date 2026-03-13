import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { orchestrator } from "@/lib/agents/orchestrator";
import type { Job } from "@obscura/shared";
import { JobStatus } from "@obscura/shared";
import { getBaseSepoliaClient } from "@/lib/config/chains";
import { agentJobsConfig } from "@/lib/contracts/agent-jobs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, client, userSignature, userEnsName } = body;

    if (!userSignature) {
      return NextResponse.json(
        { error: "userSignature is required" },
        { status: 400 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: "client address is required" },
        { status: 400 }
      );
    }

    if (!jobId && jobId !== 0) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // Verify signature was produced by claimed client
    const message = `Obscura encryption key for job #${jobId}`;
    const sigValid = await verifyMessage({
      address: client as `0x${string}`,
      message,
      signature: userSignature as `0x${string}`,
    });

    if (!sigValid) {
      return NextResponse.json(
        { error: "Signature does not match client address" },
        { status: 401 }
      );
    }

    // Read on-chain job state
    const publicClient = getBaseSepoliaClient();
    let onChainJob: {
      id: bigint;
      client: `0x${string}`;
      provider: `0x${string}`;
      evaluator: `0x${string}`;
      budget: bigint;
      expiredAt: bigint;
      description: string;
      deliverable: `0x${string}`;
      status: number;
    };

    try {
      onChainJob = await publicClient.readContract({
        ...agentJobsConfig,
        functionName: "getJob",
        args: [BigInt(jobId)],
      });
    } catch {
      return NextResponse.json(
        { error: "Job not found on-chain" },
        { status: 404 }
      );
    }

    // Verify caller is the job's client
    if (onChainJob.client.toLowerCase() !== (client as string).toLowerCase()) {
      return NextResponse.json(
        { error: "Client address does not match on-chain job" },
        { status: 403 }
      );
    }

    // Verify job is funded
    if (onChainJob.status !== JobStatus.Funded) {
      return NextResponse.json(
        { error: "Job is not in Funded status on-chain" },
        { status: 400 }
      );
    }

    // Build job from on-chain data (not caller-supplied)
    const job: Job = {
      id: BigInt(jobId),
      client: onChainJob.client,
      provider: onChainJob.provider,
      evaluator: onChainJob.evaluator,
      budget: onChainJob.budget,
      expiredAt: onChainJob.expiredAt,
      description: onChainJob.description,
      deliverable: "",
      status: JobStatus.Funded,
    };

    const result = await orchestrator.processJob(
      job,
      userEnsName || client,
      userSignature
    );

    return NextResponse.json({
      jobId: job.id.toString(),
      status: result.sentinelResult.success ? "completed" : "rejected",
      agentRole: result.assignedRole,
      score: result.sentinelResult.metadata.reasoning,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const log = orchestrator.getActivityLog();
  return NextResponse.json({ activity: log });
}
