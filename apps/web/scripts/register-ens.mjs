/**
 * Register obscura.eth on Sepolia and create agent subnames with text records.
 *
 * Usage: node scripts/register-ens.mjs
 *
 * Requires DEPLOYER_PRIVATE_KEY in .env with Sepolia ETH.
 */

import { createPublicClient, createWalletClient, http, namehash, keccak256, toHex } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { normalize } from "viem/ens";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });

const SEPOLIA_RPC = process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("DEPLOYER_PRIVATE_KEY not set in .env");
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

// ENS Sepolia contract addresses
const CONTRACTS = {
  registrarController: "0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968",
  publicResolver: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
  nameWrapper: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
  registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  reverseRegistrar: "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6",
};

// Minimal ABIs
const controllerAbi = [
  {
    name: "makeCommitment",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "registration", type: "tuple", components: [
      { name: "label", type: "string" },
      { name: "owner", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "secret", type: "bytes32" },
      { name: "resolver", type: "address" },
      { name: "data", type: "bytes[]" },
      { name: "reverseRecord", type: "uint8" },
      { name: "referrer", type: "bytes32" },
    ]}],
    outputs: [{ type: "bytes32" }],
  },
  {
    name: "commit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "register",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "registration", type: "tuple", components: [
      { name: "label", type: "string" },
      { name: "owner", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "secret", type: "bytes32" },
      { name: "resolver", type: "address" },
      { name: "data", type: "bytes[]" },
      { name: "reverseRecord", type: "uint8" },
      { name: "referrer", type: "bytes32" },
    ]}],
    outputs: [],
  },
  {
    name: "rentPrice",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "label", type: "string" },
      { name: "duration", type: "uint256" },
    ],
    outputs: [{ name: "price", type: "tuple", components: [
      { name: "base", type: "uint256" },
      { name: "premium", type: "uint256" },
    ]}],
  },
  {
    name: "available",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "label", type: "string" }],
    outputs: [{ type: "bool" }],
  },
];

const registryAbi = [
  {
    name: "setSubnodeOwner",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "label", type: "bytes32" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    name: "setResolver",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "resolver", type: "address" },
    ],
    outputs: [],
  },
];

const resolverAbi = [
  {
    name: "setText",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "setAddr",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "addr", type: "address" },
    ],
    outputs: [],
  },
];

const reverseRegistrarAbi = [
  {
    name: "setName",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ type: "bytes32" }],
  },
];

// Agent configuration
const AGENTS = {
  scout: {
    address: process.env.NEXT_PUBLIC_SCOUT_ADDRESS,
    description: "DeFi research & token discovery agent",
    capabilities: "token-search,yield-analysis,web-research,twitter-sentiment",
  },
  analyst: {
    address: process.env.NEXT_PUBLIC_ANALYST_ADDRESS,
    description: "Portfolio analysis & risk assessment agent",
    capabilities: "wallet-analysis,portfolio-breakdown,pnl-reports,protocol-research",
  },
  ghost: {
    address: process.env.NEXT_PUBLIC_GHOST_ADDRESS,
    description: "Privacy-preserving trade execution agent",
    capabilities: "swap-execution,bitgo-signing,intermediary-wallets,encrypted-reports",
  },
  sentinel: {
    address: process.env.NEXT_PUBLIC_SENTINEL_ADDRESS,
    description: "Job evaluation & quality assurance agent",
    capabilities: "deliverable-scoring,tool-validation,risk-compliance,on-chain-settlement",
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForTx(hash) {
  console.log(`  tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") throw new Error(`Transaction reverted: ${hash}`);
  return receipt;
}

async function main() {
  const label = "obscura";
  const name = `${label}.eth`;
  const duration = BigInt(365 * 24 * 60 * 60); // 1 year

  console.log(`\nRegistering ${name} on Sepolia...`);
  console.log(`Owner: ${account.address}\n`);

  // Step 1: Check availability
  const isAvailable = await publicClient.readContract({
    address: CONTRACTS.registrarController,
    abi: controllerAbi,
    functionName: "available",
    args: [label],
  });

  if (!isAvailable) {
    console.log(`${name} is already taken. Checking if we own it...`);
    const owner = await publicClient.getEnsAddress({ name: normalize(name) });
    if (owner?.toLowerCase() === account.address.toLowerCase()) {
      console.log(`We already own ${name}! Skipping registration, setting up subnames...\n`);
    } else {
      console.error(`${name} is owned by ${owner}. Try a different name.`);
      process.exit(1);
    }
  } else {
    // Step 2: Get rent price
    const price = await publicClient.readContract({
      address: CONTRACTS.registrarController,
      abi: controllerAbi,
      functionName: "rentPrice",
      args: [label, duration],
    });
    const totalPrice = price.base + price.premium;
    console.log(`Rent price: ${Number(totalPrice) / 1e18} ETH (base: ${Number(price.base) / 1e18}, premium: ${Number(price.premium) / 1e18})`);

    // Step 3: Build registration struct (no inline data — set records after)
    const secret = keccak256(toHex(`obscura-${Date.now()}`));

    const registration = {
      label,
      owner: account.address,
      duration,
      secret,
      resolver: CONTRACTS.publicResolver,
      data: [],
      reverseRecord: 0,
      referrer: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };

    // Step 4: Make commitment
    const commitment = await publicClient.readContract({
      address: CONTRACTS.registrarController,
      abi: controllerAbi,
      functionName: "makeCommitment",
      args: [registration],
    });

    console.log(`\nCommitting...`);
    const commitHash = await walletClient.writeContract({
      address: CONTRACTS.registrarController,
      abi: controllerAbi,
      functionName: "commit",
      args: [commitment],
    });
    await waitForTx(commitHash);

    // Step 5: Wait for commitment to mature (minCommitmentAge = 60s on-chain)
    // Using 90s to account for variable block times on Sepolia
    console.log(`\nWaiting 90 seconds for commitment to mature...`);
    for (let i = 90; i > 0; i--) {
      process.stdout.write(`\r  ${i}s remaining...`);
      await sleep(1000);
    }
    console.log(`\r  Ready!              `);

    // Step 6: Register (send 2x price as buffer)
    const sendValue = totalPrice * 2n;
    console.log(`\nRegistering ${name} (sending ${Number(sendValue) / 1e18} ETH)...`);

    // Simulate first to catch revert reasons
    try {
      await publicClient.simulateContract({
        address: CONTRACTS.registrarController,
        abi: controllerAbi,
        functionName: "register",
        args: [registration],
        value: sendValue,
        account: account.address,
      });
    } catch (simErr) {
      console.error("Simulation failed:", simErr.message?.slice(0, 300));
      throw simErr;
    }

    const registerHash = await walletClient.writeContract({
      address: CONTRACTS.registrarController,
      abi: controllerAbi,
      functionName: "register",
      args: [registration],
      value: sendValue,
    });
    await waitForTx(registerHash);
    console.log(`${name} registered!`);

    // Set addr record
    console.log(`\nSetting addr record on ${name}...`);
    const setAddrHash = await walletClient.writeContract({
      address: CONTRACTS.publicResolver,
      abi: resolverAbi,
      functionName: "setAddr",
      args: [namehash(normalize(name)), account.address],
    });
    await waitForTx(setAddrHash);

    // Set reverse record (primary name)
    console.log(`Setting reverse record (primary name)...`);
    const setNameHash = await walletClient.writeContract({
      address: CONTRACTS.reverseRegistrar,
      abi: reverseRegistrarAbi,
      functionName: "setName",
      args: [name],
    });
    await waitForTx(setNameHash);
  }

  // Step 7: Set text records on obscura.eth
  const parentNode = namehash(normalize(name));
  console.log(`\nSetting text records on ${name}...`);

  const textRecords = {
    "description": "Privacy-first AI agent DeFi marketplace",
    "url": "https://obscura.xyz",
    "com.github": "paracausal-labs/obscura",
    "agent.protocol": "ERC-8183",
    "agent.network": "base-sepolia",
    "agent.contract": process.env.NEXT_PUBLIC_AGENT_JOBS_ADDRESS || "",
  };

  for (const [key, value] of Object.entries(textRecords)) {
    if (!value) continue;
    const hash = await walletClient.writeContract({
      address: CONTRACTS.publicResolver,
      abi: resolverAbi,
      functionName: "setText",
      args: [parentNode, key, value],
    });
    await waitForTx(hash);
    console.log(`  ${key} = ${value}`);
  }

  // Step 8: Create agent subnames
  console.log(`\nCreating agent subnames...`);

  for (const [role, agent] of Object.entries(AGENTS)) {
    if (!agent.address) {
      console.log(`  Skipping ${role} — no address set`);
      continue;
    }

    const subname = `${role}.${name}`;
    const subnameNode = namehash(normalize(subname));
    const labelHash = keccak256(toHex(role));
    console.log(`\n  Creating ${subname} → ${agent.address}`);

    // Create subname via Registry (name is not wrapped)
    const subnodeHash = await walletClient.writeContract({
      address: CONTRACTS.registry,
      abi: registryAbi,
      functionName: "setSubnodeOwner",
      args: [parentNode, labelHash, account.address],
    });
    await waitForTx(subnodeHash);

    // Set resolver on the subname
    const resolverHash = await walletClient.writeContract({
      address: CONTRACTS.registry,
      abi: registryAbi,
      functionName: "setResolver",
      args: [subnameNode, CONTRACTS.publicResolver],
    });
    await waitForTx(resolverHash);

    // Set addr record
    const addrHash = await walletClient.writeContract({
      address: CONTRACTS.publicResolver,
      abi: resolverAbi,
      functionName: "setAddr",
      args: [subnameNode, agent.address],
    });
    await waitForTx(addrHash);
    console.log(`    addr → ${agent.address}`);

    // Set text records (ENSIP-25 + agent metadata)
    const agentTextRecords = {
      "description": agent.description,
      "agent.role": role,
      "agent.capabilities": agent.capabilities,
      "agent.protocol": "ERC-8183",
      "agent.contract": process.env.NEXT_PUBLIC_AGENT_JOBS_ADDRESS || "",
      // ENSIP-25: verification record linking ENS name to agent address
      "agent.address": agent.address,
      "agent.verified": "true",
    };

    for (const [key, value] of Object.entries(agentTextRecords)) {
      if (!value) continue;
      const txHash = await walletClient.writeContract({
        address: CONTRACTS.publicResolver,
        abi: resolverAbi,
        functionName: "setText",
        args: [subnameNode, key, value],
      });
      await waitForTx(txHash);
      console.log(`    ${key} = ${value}`);
    }
  }

  console.log(`\n\nDone! ENS setup complete.`);
  console.log(`\nRegistered names:`);
  console.log(`  ${name} → ${account.address}`);
  for (const [role, agent] of Object.entries(AGENTS)) {
    if (agent.address) console.log(`  ${role}.${name} → ${agent.address}`);
  }
}

main().catch((err) => {
  console.error("\nFailed:", err.message || err);
  process.exit(1);
});
