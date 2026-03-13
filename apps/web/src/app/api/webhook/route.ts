import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getBaseSepoliaClient } from "@/lib/config/chains";
import { agentJobsConfig } from "@/lib/contracts/agent-jobs";
import { getUserPreferences, checkKillSwitch } from "@/lib/integrations/ens";
import { isBitGoEnabled } from "@/lib/integrations/bitgo";

export async function POST(req: Request) {
  try {
    if (!isBitGoEnabled()) {
      return NextResponse.json(
        { error: "BitGo integration is disabled" },
        { status: 503 }
      );
    }

    const secret = process.env.BITGO_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-signature-sha256") || "";
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const txDetails = JSON.parse(rawBody);

    // Extract jobId from the BitGo address label (set by Ghost as "job-{id}")
    const label: string = txDetails.label || txDetails.wallet?.label || "";
    const jobIdMatch = label.match(/^job-(\d+)$/);
    if (!jobIdMatch) {
      return NextResponse.json(
        { error: "Cannot determine job from webhook — no job label" },
        { status: 400 }
      );
    }

    const jobId = BigInt(jobIdMatch[1]);

    // Read verified client address from on-chain job
    const publicClient = getBaseSepoliaClient();
    let onChainJob: { client: `0x${string}` };
    try {
      onChainJob = await publicClient.readContract({
        ...agentJobsConfig,
        functionName: "getJob",
        args: [jobId],
      });
    } catch {
      return NextResponse.json(
        { error: "Job not found on-chain" },
        { status: 404 }
      );
    }

    // Use verified on-chain client address for policy checks
    const clientAddress = onChainJob.client;
    const userPrefs = await getUserPreferences(clientAddress);

    // Kill switch check
    const killed = await checkKillSwitch(clientAddress);
    if (killed) {
      return NextResponse.json({
        approved: false,
        reason: "Kill switch is active",
      });
    }

    // Spending limit check
    if (txDetails.amount && userPrefs.maxTrade) {
      const amountUsd = parseFloat(txDetails.amount);
      const maxTrade = parseFloat(userPrefs.maxTrade);
      if (amountUsd > maxTrade) {
        return NextResponse.json({
          approved: false,
          reason: `Amount ${amountUsd} exceeds spending limit ${maxTrade}`,
        });
      }
    }

    // Asset whitelist check
    if (txDetails.asset && userPrefs.assets) {
      const allowed = userPrefs.assets
        .split(",")
        .map((a: string) => a.trim().toLowerCase());
      if (!allowed.includes(txDetails.asset.toLowerCase())) {
        return NextResponse.json({
          approved: false,
          reason: `Asset ${txDetails.asset} not in whitelist: ${userPrefs.assets}`,
        });
      }
    }

    return NextResponse.json({ approved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
