import { NextResponse } from "next/server";
import { orchestrator } from "@/lib/agents/orchestrator";
import type { Job } from "@obscura/shared";
import { JobStatus } from "@obscura/shared";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      jobId,
      description,
      provider,
      evaluator,
      budget,
      expiredAt,
      client,
      userSignature,
      userEnsName,
    } = body;

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

    const job: Job = {
      id: BigInt(jobId),
      client: client as `0x${string}`,
      provider: (provider || "0x0000000000000000000000000000000000000000") as `0x${string}`,
      evaluator: (evaluator || "0x0000000000000000000000000000000000000000") as `0x${string}`,
      budget: BigInt(budget || 50000),
      expiredAt: BigInt(expiredAt || Math.floor(Date.now() / 1000) + 3600),
      description,
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
