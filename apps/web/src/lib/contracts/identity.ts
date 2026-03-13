export const IDENTITY_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    inputs: [{ name: "metadataURI", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getIdentity",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "metadataURI", type: "string" },
      { name: "registeredAt", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalIdentities",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

import { ADDRESSES } from "../config/addresses";

export const identityConfig = {
  address: ADDRESSES.IDENTITY_REGISTRY,
  abi: IDENTITY_REGISTRY_ABI,
} as const;
