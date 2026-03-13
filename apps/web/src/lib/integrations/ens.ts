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

export async function getUserPreferences(ensName: string): Promise<UserPrefs> {
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
    risk: risk || "moderate",
    assets: assets || "ETH,USDC",
    maxTrade: maxTrade || "500",
    protocols: protocols || "aave,compound",
    killswitch: killswitch === "true",
    preferred: preferred || "",
  };
}

export async function checkKillSwitch(ensName: string): Promise<boolean> {
  const value = await getEnsText(ensName, ENS_KEYS.killswitch);
  return value === "true";
}
