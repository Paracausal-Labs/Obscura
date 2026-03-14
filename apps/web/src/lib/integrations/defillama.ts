// DeFiLlama API — free, no auth, reliable fallback for DeFi data

const BASE = "https://yields.llama.fi";
const API = "https://api.llama.fi";
const COINS = "https://coins.llama.fi";

const MIN_TVL = 500_000; // $500k minimum to filter out micro-cap noise

export async function getTopYields(chain?: string, stablecoin?: boolean) {
  const res = await fetch(`${BASE}/pools`);
  if (!res.ok) throw new Error(`DeFiLlama pools: ${res.status}`);
  const { data } = (await res.json()) as { data: Record<string, unknown>[] };

  let pools = data;
  if (chain) {
    const c = chain.toLowerCase();
    pools = pools.filter(
      (p) => (p.chain as string).toLowerCase() === c
    );
  }
  if (stablecoin) {
    pools = pools.filter((p) => p.stablecoin === true);
  }

  // Filter out tiny pools with unrealistic APYs, cap at 1000% to avoid noise
  pools = pools.filter(
    (p) =>
      ((p.tvlUsd as number) ?? 0) >= MIN_TVL &&
      ((p.apy as number) ?? 0) > 0 &&
      ((p.apy as number) ?? 0) < 1000
  );

  return pools
    .sort((a, b) => (b.apy as number) - (a.apy as number))
    .slice(0, 15)
    .map((p) => ({
      project: p.project,
      chain: p.chain,
      symbol: p.symbol,
      tvlUsd: `$${((p.tvlUsd as number) / 1e6).toFixed(1)}M`,
      apy: `${(p.apy as number).toFixed(2)}%`,
      apyBase: p.apyBase ? `${(p.apyBase as number).toFixed(2)}%` : "—",
      apyReward: p.apyReward ? `${(p.apyReward as number).toFixed(2)}%` : "—",
      stablecoin: p.stablecoin,
    }));
}

export async function getProtocolTvl(protocol: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(protocol)) {
    throw new Error("Invalid protocol slug");
  }
  const res = await fetch(`${API}/protocol/${protocol}`);
  if (!res.ok) throw new Error(`DeFiLlama protocol: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    name: data.name,
    tvl: data.currentChainTvls,
    description: data.description,
    url: data.url,
    chains: data.chains,
    category: data.category,
  };
}

export async function getTokenPrice(
  chain: string,
  address: string
) {
  const key = `${chain}:${address}`;
  const res = await fetch(`${COINS}/prices/current/${key}`);
  if (!res.ok) throw new Error(`DeFiLlama price: ${res.status}`);
  const data = (await res.json()) as {
    coins: Record<string, { price: number; symbol: string; decimals: number }>;
  };
  return data.coins[key] ?? null;
}

export async function getStablecoinYields() {
  return getTopYields(undefined, true);
}

export async function getBaseYields() {
  return getTopYields("base");
}
