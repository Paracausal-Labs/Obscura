import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _agentWalletClient: any = null;

export function getAgentWalletClient() {
  if (_agentWalletClient) return _agentWalletClient;

  const key = process.env.AGENT_SIGNER_PRIVATE_KEY;
  if (!key) throw new Error("AGENT_SIGNER_PRIVATE_KEY not configured");

  const account = privateKeyToAccount(key as `0x${string}`);
  _agentWalletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
  });
  return _agentWalletClient;
}

export { baseSepolia };
