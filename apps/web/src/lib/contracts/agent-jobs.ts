export const AGENT_JOBS_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_usdc", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimRefund",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "complete",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createJob",
    inputs: [
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "expiredAt", type: "uint256" },
      { name: "description", type: "string" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fund",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "expectedBudget", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getJob",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "budget", type: "uint256" },
          { name: "expiredAt", type: "uint256" },
          { name: "description", type: "string" },
          { name: "deliverable", type: "bytes32" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "jobCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reject",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submit",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverable", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "JobCompleted",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "reason", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "JobCreated",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "provider", type: "address", indexed: false },
      { name: "evaluator", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "JobFunded",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "budget", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "JobRefunded",
    inputs: [{ name: "jobId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "JobRejected",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "reason", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "JobSubmitted",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "deliverable", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "InvalidAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidExpiry",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidStatus",
    inputs: [
      { name: "expected", type: "uint8" },
      { name: "actual", type: "uint8" },
    ],
  },
  {
    type: "error",
    name: "JobNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "NotExpired",
    inputs: [],
  },
  {
    type: "error",
    name: "OnlyClient",
    inputs: [],
  },
  {
    type: "error",
    name: "OnlyEvaluator",
    inputs: [],
  },
  {
    type: "error",
    name: "OnlyProvider",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address" }],
  },
  {
    type: "error",
    name: "ZeroBudget",
    inputs: [],
  },
] as const;

import { ADDRESSES } from "../config/addresses";

export const agentJobsConfig = {
  address: ADDRESSES.AGENT_JOBS,
  abi: AGENT_JOBS_ABI,
} as const;
