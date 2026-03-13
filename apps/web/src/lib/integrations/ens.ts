import { normalize } from "viem/ens";
import { getEthSepoliaClient } from "../config/chains";
import type { UserPrefs } from "@obscura/shared";

const ENS_KEYS = {
  risk: "defi.risk",
  assets: "defi.assets",
  maxTrade: "defi.maxTrade",
  protocols: "defi.protocols",
  killswitch: "agent.killswitch",
  preferred: "agent.preferred",
} as const;

const DEFAULT_PREFS: UserPrefs = {
  risk: "moderate",
  assets: "ETH,USDC",
  maxTrade: "500",
  protocols: "aave,compound",
  killswitch: false,
  preferred: "",
};

export async function getEnsText(
  name: string,
  key: string
): Promise<string | null> {
  const client = getEthSepoliaClient();
  try {
    const result = await client.getEnsText({ name: normalize(name), key });
    return result ?? null;
  } catch {
    return null;
  }
}

async function reverseResolveAddress(address: string): Promise<string | null> {
  const client = getEthSepoliaClient();
  try {
    const name = await client.getEnsName({
      address: address as `0x${string}`,
    });
    return name ?? null;
  } catch {
    return null;
  }
}

export async function getUserPreferences(ensNameOrAddress: string): Promise<UserPrefs> {
  let ensName = ensNameOrAddress;

  // If raw address, try reverse resolution
  if (ensNameOrAddress.startsWith("0x")) {
    const resolved = await reverseResolveAddress(ensNameOrAddress);
    if (!resolved) return DEFAULT_PREFS;
    ensName = resolved;
  }

  const [risk, assets, maxTrade, protocols, killswitch, preferred] =
    await Promise.all([
      getEnsText(ensName, ENS_KEYS.risk),
      getEnsText(ensName, ENS_KEYS.assets),
      getEnsText(ensName, ENS_KEYS.maxTrade),
      getEnsText(ensName, ENS_KEYS.protocols),
      getEnsText(ensName, ENS_KEYS.killswitch),
      getEnsText(ensName, ENS_KEYS.preferred),
    ]);

  return {
    risk: risk || DEFAULT_PREFS.risk,
    assets: assets || DEFAULT_PREFS.assets,
    maxTrade: maxTrade || DEFAULT_PREFS.maxTrade,
    protocols: protocols || DEFAULT_PREFS.protocols,
    killswitch: killswitch === "true",
    preferred: preferred || DEFAULT_PREFS.preferred,
  };
}

export async function checkKillSwitch(ensNameOrAddress: string): Promise<boolean> {
  if (ensNameOrAddress.startsWith("0x")) {
    const resolved = await reverseResolveAddress(ensNameOrAddress);
    if (!resolved) return false;
    ensNameOrAddress = resolved;
  }
  const value = await getEnsText(ensNameOrAddress, ENS_KEYS.killswitch);
  return value === "true";
}
