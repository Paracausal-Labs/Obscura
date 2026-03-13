import type { Address } from "./types";

export const CHAIN_IDS = {
  BASE_SEPOLIA: 84532,
  ETH_SEPOLIA: 11155111,
} as const;

export const ERC8004_ADDRESSES = {
  IDENTITY_REGISTRY: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as Address,
  REPUTATION_REGISTRY: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as Address,
};

export const ENS_KEYS = {
  RISK: "defi.risk",
  ASSETS: "defi.assets",
  MAX_TRADE: "defi.maxTrade",
  PROTOCOLS: "defi.protocols",
  KILLSWITCH: "agent.killswitch",
  PREFERRED: "agent.preferred",
  AGENT_REGISTRATION: "agent-registration",
} as const;

export const AGENT_ENS_NAMES = {
  scout: "scout.eth",
  analyst: "analyst.eth",
  ghost: "ghost.eth",
  sentinel: "sentinel.eth",
} as const;

export const DEFAULT_JOB_EXPIRY_HOURS = 1;
export const DEFAULT_AGENT_MAX_STEPS = 5;
export const SENTINEL_MAX_STEPS = 3;
