import axios, { type AxiosInstance } from "axios";
import { withPaymentInterceptor, createSigner } from "x402-axios";

const CHAIN_ID_TO_NETWORK: Record<string, string> = {
  "eip155:8453": "base",
  "eip155:84532": "base-sepolia",
};

let _client: AxiosInstance | null = null;

async function client(): Promise<AxiosInstance> {
  if (_client) return _client;

  const privateKey = process.env.PAYMENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("PAYMENT_PRIVATE_KEY not set");

  const signer = await createSigner("base", privateKey as `0x${string}`);
  const axiosClient = axios.create({
    baseURL: process.env.HEYELSA_API_URL || "https://x402-api.heyelsa.ai",
  });

  // Patch: bridge x402 v2 header-based payment requirements to body format
  axiosClient.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 402) {
      let paymentData = error.response.data;
      if (!paymentData || (typeof paymentData === "string" && paymentData.length === 0)) {
        const header = error.response.headers["payment-required"];
        if (header) {
          try {
            paymentData = JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
          } catch {
            return Promise.reject(error);
          }
        }
      }
      if (paymentData?.accepts && paymentData?.resource) {
        const resource = paymentData.resource;
        paymentData.accepts = paymentData.accepts
          .filter((a: Record<string, unknown>) => {
            const net = a.network as string;
            return net === "base" || net === "eip155:8453" || CHAIN_ID_TO_NETWORK[net] === "base";
          })
          .map((a: Record<string, unknown>) => ({
            ...a,
            network: CHAIN_ID_TO_NETWORK[a.network as string] ?? a.network,
            maxAmountRequired: (a.maxAmountRequired ?? a.amount) as string,
            resource: (resource.url ?? "") as string,
            description: (resource.description ?? "") as string,
            mimeType: (resource.mimeType ?? "application/json") as string,
          }));
      }
      error.response.data = paymentData;
    }
    return Promise.reject(error);
  });

  _client = withPaymentInterceptor(axiosClient, signer);
  return _client;
}

export async function searchToken(query: string) {
  const c = await client();
  const { data } = await c.post("/api/search_token", { query });
  return data;
}

export async function getTokenPrice(token: string, chain = "base") {
  const c = await client();
  const { data } = await c.post("/api/get_token_price", { token, chain });
  return data;
}

export async function getYieldSuggestions(walletAddress: string, chain = "base") {
  const c = await client();
  const { data } = await c.post("/api/get_yield_suggestions", {
    wallet_address: walletAddress,
    chain,
  });
  return data;
}

export async function analyzeWallet(walletAddress: string, chain = "base") {
  const c = await client();
  const { data } = await c.post("/api/analyze_wallet", {
    wallet_address: walletAddress,
    chain,
  });
  return data;
}

export async function getPortfolio(walletAddress: string) {
  const c = await client();
  const { data } = await c.post("/api/get_portfolio", {
    wallet_address: walletAddress,
  });
  return data;
}

export async function getPnlReport(walletAddress: string) {
  const c = await client();
  const { data } = await c.post("/api/get_pnl_report", {
    wallet_address: walletAddress,
  });
  return data;
}

export async function getSwapQuote(params: {
  from_token: string;
  to_token: string;
  amount: string;
  chain?: string;
}) {
  const c = await client();
  const { data } = await c.post("/api/get_swap_quote", {
    chain: "base",
    ...params,
  });
  return data;
}

export async function executeSwap(params: {
  from_token: string;
  to_token: string;
  amount: string;
  wallet_address: string;
  dry_run?: boolean;
}) {
  const c = await client();
  const { data } = await c.post("/api/execute_swap", {
    chain: "base",
    ...params,
  });
  return data;
}

export async function getTransactionStatus(pipelineId: string) {
  const c = await client();
  const { data } = await c.post("/api/get_transaction_status", {
    pipeline_id: pipelineId,
  });
  return data;
}

export async function getBalances(walletAddress: string, chain = "base") {
  const c = await client();
  const { data } = await c.post("/api/get_balances", {
    wallet_address: walletAddress,
    chain,
  });
  return data;
}
