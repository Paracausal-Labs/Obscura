import { createPublicClient, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";

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

export { baseSepolia };
