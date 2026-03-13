export const REPUTATION_REGISTRY_ABI = [
  {
    type: "function",
    name: "giveFeedback",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int64" },
      { name: "decimals", type: "uint8" },
      { name: "tag1", type: "bytes32" },
      { name: "tag2", type: "bytes32" },
      { name: "endpoint", type: "string" },
      { name: "uri", type: "string" },
      { name: "hash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getSummary",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clients", type: "address[]" },
      { name: "tag1", type: "bytes32" },
      { name: "tag2", type: "bytes32" },
    ],
    outputs: [
      { name: "avgValue", type: "int256" },
      { name: "count", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

import { ADDRESSES } from "../config/addresses";

export const reputationConfig = {
  address: ADDRESSES.REPUTATION_REGISTRY,
  abi: REPUTATION_REGISTRY_ABI,
} as const;
