import { NextResponse } from "next/server";
import { orchestrator } from "@/lib/agents/orchestrator";
import type { Job } from "@obscura/shared";
import { JobStatus } from "@obscura/shared";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, provider, evaluator, budget, expiredAt, userEnsName, userSignature } = body;

    // Build a job object (in production this would come from on-chain events)
    const job: Job = {
      id: BigInt(Date.now()),
      client: body.client || "0x0000000000000000000000000000000000000000",
      provider: provider || "0x0000000000000000000000000000000000000000",
      evaluator: evaluator || "0x0000000000000000000000000000000000000000",
      budget: BigInt(budget || 50000), // 0.05 USDC in 6 decimals
      expiredAt: BigInt(expiredAt || Math.floor(Date.now() / 1000) + 3600),
      description,
      deliverable: "",
      status: JobStatus.Funded,
    };

    // Process job asynchronously
    const result = orchestrator.processJob(
      job,
      userEnsName || "user.eth",
      userSignature || "default-sig"
    );

    // Don't await — let it run in the background, SSE will stream updates
    result.catch((error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      void message; // logged via orchestrator activity events
    });

    return NextResponse.json({
      jobId: job.id.toString(),
      status: "processing",
      message: "Job submitted. Watch the activity feed for updates.",
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
