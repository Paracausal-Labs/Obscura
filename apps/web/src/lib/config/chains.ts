import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import type { AgentRole } from "@obscura/shared";

export const ethereumSepolia = sepolia;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _baseSepoliaClient: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ethSepoliaClient: any = null;

export function getBaseSepoliaClient() {
  if (!_baseSepoliaClient) {
    _baseSepoliaClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
    });
  }
  return _baseSepoliaClient;
}

export function getEthSepoliaClient() {
  if (!_ethSepoliaClient) {
    _ethSepoliaClient = createPublicClient({
      chain: ethereumSepolia,
      transport: http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || "https://eth-sepolia.public.blastapi.io"),
    });
  }
  return _ethSepoliaClient;
}

const ROLE_ENV_KEY: Record<string, string> = {
  scout: "SCOUT_PRIVATE_KEY",
  analyst: "ANALYST_PRIVATE_KEY",
  ghost: "GHOST_PRIVATE_KEY",
  sentinel: "SENTINEL_PRIVATE_KEY",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _walletClients = new Map<string, any>();

export function getWalletClientForRole(role: AgentRole) {
  const cached = _walletClients.get(role);
  if (cached) return cached;

  const envVar = ROLE_ENV_KEY[role];
  if (!envVar) throw new Error(`No key mapping for role: ${role}`);

  const key = process.env[envVar];
  if (!key) throw new Error(`${envVar} not configured`);

  const account = privateKeyToAccount(key as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
  });

  _walletClients.set(role, client);
  return client;
}

export { baseSepolia };
