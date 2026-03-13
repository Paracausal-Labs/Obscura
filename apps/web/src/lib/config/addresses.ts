import type { Address } from "viem";
import { AgentRole } from "@obscura/shared";

export const ADDRESSES = {
  AGENT_JOBS: (process.env.NEXT_PUBLIC_AGENT_JOBS_ADDRESS || "0x0000000000000000000000000000000000000000") as Address,
  IDENTITY_REGISTRY: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as Address,
  REPUTATION_REGISTRY: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as Address,
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x0000000000000000000000000000000000000000") as Address,
} as const;

export const AGENT_ADDRESSES = {
  scout: (process.env.NEXT_PUBLIC_SCOUT_ADDRESS || "0x0000000000000000000000000000000000000001") as Address,
  analyst: (process.env.NEXT_PUBLIC_ANALYST_ADDRESS || "0x0000000000000000000000000000000000000002") as Address,
  ghost: (process.env.NEXT_PUBLIC_GHOST_ADDRESS || "0x0000000000000000000000000000000000000003") as Address,
  sentinel: (process.env.NEXT_PUBLIC_SENTINEL_ADDRESS || "0x0000000000000000000000000000000000000004") as Address,
} as const;

export function getAgentRoleByAddress(address: string): AgentRole | null {
  const lower = address.toLowerCase();
  for (const [role, addr] of Object.entries(AGENT_ADDRESSES)) {
    if (addr.toLowerCase() === lower) return role as AgentRole;
  }
  return null;
}
