import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getEnsText } from "@/lib/integrations/ens";

export async function POST(req: Request) {
  try {
    const secret = process.env.BITGO_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-bitgo-signature") || "";
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

    if (signature !== expected) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const txDetails = JSON.parse(rawBody);

    const ensName = txDetails.wallet?.label || txDetails.ensName;
    if (!ensName) {
      return NextResponse.json(
        { error: "No user context in webhook" },
        { status: 400 }
      );
    }

    // Read user's limits from ENS text records
    const maxTrade = await getEnsText(ensName, "defi.maxTrade");
    const allowedAssets = await getEnsText(ensName, "defi.assets");
    const killswitch = await getEnsText(ensName, "agent.killswitch");

    // Kill switch check
    if (killswitch === "true") {
      return NextResponse.json({
        approved: false,
        reason: "Kill switch is active",
      });
    }

    // Spending limit check
    if (txDetails.amount && maxTrade) {
      const amountUsd = parseFloat(txDetails.amount);
      if (amountUsd > parseFloat(maxTrade)) {
        return NextResponse.json({
          approved: false,
          reason: `Amount ${amountUsd} exceeds spending limit ${maxTrade}`,
        });
      }
    }

    // Asset whitelist check
    if (txDetails.asset && allowedAssets) {
      const allowed = allowedAssets
        .split(",")
        .map((a: string) => a.trim().toLowerCase());
      if (!allowed.includes(txDetails.asset.toLowerCase())) {
        return NextResponse.json({
          approved: false,
          reason: `Asset ${txDetails.asset} not in whitelist: ${allowedAssets}`,
        });
      }
    }

    return NextResponse.json({ approved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
