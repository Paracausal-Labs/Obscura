import { NextResponse } from "next/server";
import { getEnsText } from "@/lib/integrations/ens";

export async function POST(req: Request) {
  try {
    const txDetails = await req.json();

    // Read user's limits from ENS text records
    const maxTrade = await getEnsText("user.eth", "defi.maxTrade");
    const allowedAssets = await getEnsText("user.eth", "defi.assets");
    const killswitch = await getEnsText("user.eth", "agent.killswitch");

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
      const allowed = allowedAssets.split(",").map((a: string) => a.trim().toLowerCase());
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
