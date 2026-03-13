import { NextResponse } from "next/server";
import { isBitGoEnabled } from "@/lib/integrations/bitgo";

export async function GET() {
  const checks = {
    bitgo: isBitGoEnabled(),
    heyelsa: Boolean(process.env.HEYELSA_API_URL),
    fileverse: Boolean(
      process.env.FILEVERSE_PRIVATE_KEY &&
      process.env.PIMLICO_API_KEY &&
      process.env.PINATA_JWT &&
      process.env.PINATA_GATEWAY
    ),
    groq: Boolean(process.env.GROQ_API_KEY),
    contracts: Boolean(process.env.NEXT_PUBLIC_AGENT_JOBS_ADDRESS),
    rpc: Boolean(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
  };

  return NextResponse.json(checks);
}
