"use client";

import { useEnsName, useEnsAvatar, useEnsText } from "wagmi";
import { normalize } from "viem/ens";
import { sepolia } from "viem/chains";

/**
 * Resolve ENS name, avatar, and optional text records for an address.
 * Uses Sepolia ENS (chainId 11155111) for testnet.
 */
export function useEnsIdentity(address: `0x${string}` | undefined) {
  const { data: ensName, isLoading: nameLoading } = useEnsName({
    address,
    chainId: sepolia.id,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: sepolia.id,
  });

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return {
    ensName,
    ensAvatar,
    displayName: ensName || truncated,
    isLoading: nameLoading,
  };
}

/**
 * Read ENS text records for DeFi preferences.
 * Keys follow our custom schema: defi.risk, defi.assets, defi.maxTrade, agent.killswitch
 */
export function useEnsPreferences(ensName: string | null | undefined) {
  const normalized = ensName ? normalize(ensName) : undefined;
  const chainId = sepolia.id;

  const { data: risk } = useEnsText({
    name: normalized,
    key: "defi.risk",
    chainId,
  });

  const { data: assets } = useEnsText({
    name: normalized,
    key: "defi.assets",
    chainId,
  });

  const { data: maxTrade } = useEnsText({
    name: normalized,
    key: "defi.maxTrade",
    chainId,
  });

  const { data: killswitch } = useEnsText({
    name: normalized,
    key: "agent.killswitch",
    chainId,
  });

  return {
    risk: risk || "moderate",
    assets: assets || "ETH,USDC",
    maxTrade: maxTrade || "1000",
    killswitch: killswitch === "true",
    hasRecords: Boolean(risk || assets || maxTrade || killswitch),
  };
}

/**
 * Read ENSIP-25 agent verification text records.
 */
export function useEnsAgentVerification(ensName: string | null | undefined) {
  const normalized = ensName ? normalize(ensName) : undefined;
  const chainId = sepolia.id;

  const { data: agentAddress } = useEnsText({
    name: normalized,
    key: "agent.address",
    chainId,
  });

  const { data: verified } = useEnsText({
    name: normalized,
    key: "agent.verified",
    chainId,
  });

  const { data: role } = useEnsText({
    name: normalized,
    key: "agent.role",
    chainId,
  });

  const { data: capabilities } = useEnsText({
    name: normalized,
    key: "agent.capabilities",
    chainId,
  });

  const { data: protocol } = useEnsText({
    name: normalized,
    key: "agent.protocol",
    chainId,
  });

  return {
    agentAddress,
    verified: verified === "true",
    role,
    capabilities: capabilities?.split(",") || [],
    protocol,
  };
}
