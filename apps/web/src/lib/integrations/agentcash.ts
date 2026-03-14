import axios, { type AxiosInstance } from "axios";
import { withPaymentInterceptor, createSigner } from "x402-axios";

const CHAIN_ID_TO_NETWORK: Record<string, string> = {
  "eip155:8453": "base",
  "eip155:84532": "base-sepolia",
  "eip155:1": "ethereum",
  "eip155:137": "polygon",
};

async function createX402Client(baseURL: string): Promise<AxiosInstance> {
  const privateKey = process.env.PAYMENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("PAYMENT_PRIVATE_KEY not set");

  const signer = await createSigner("base", privateKey as `0x${string}`);
  const client = axios.create({ baseURL });

  // Patch: x402 v2 servers send payment requirements in the payment-required
  // header (base64 JSON) with a nested resource object and eip155 network IDs.
  // x402-axios expects flat PaymentRequirements in response.data.accepts with
  // short network names. This interceptor bridges the two formats.
  client.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 402) {
      let paymentData = error.response.data;

      // If body is empty, decode from header
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

      // Transform v2 format: merge top-level resource into each accepts entry
      if (paymentData?.accepts && paymentData?.resource) {
        const resource = paymentData.resource;
        paymentData.accepts = paymentData.accepts
          .filter((a: Record<string, unknown>) => {
            const net = a.network as string;
            // Only keep entries for networks we can pay on
            return net === "base" || net === "eip155:8453" || CHAIN_ID_TO_NETWORK[net] === "base";
          })
          .map((a: Record<string, unknown>) => ({
            ...a,
            network: CHAIN_ID_TO_NETWORK[a.network as string] ?? a.network,
            maxAmountRequired: a.maxAmountRequired ?? a.amount,
            resource: resource.url ?? baseURL,
            description: resource.description ?? "",
            mimeType: resource.mimeType ?? "application/json",
          }));
      }

      error.response.data = paymentData;
    }
    return Promise.reject(error);
  });

  return withPaymentInterceptor(client, signer);
}

let _enrichClient: AxiosInstance | null = null;
async function enrichClient(): Promise<AxiosInstance> {
  if (!_enrichClient) _enrichClient = await createX402Client("https://stableenrich.dev");
  return _enrichClient;
}

let _twitterClient: AxiosInstance | null = null;
async function twitterClient(): Promise<AxiosInstance> {
  if (!_twitterClient) _twitterClient = await createX402Client("https://twit.sh");
  return _twitterClient;
}

export async function webSearch(query: string) {
  const c = await enrichClient();
  const { data } = await c.post("/api/exa/search", { query });
  return data;
}

export async function scrapeUrl(url: string) {
  // Block internal/cloud metadata URLs
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only HTTP(S) URLs allowed");
  }
  const host = parsed.hostname;
  if (host === "localhost" || host.startsWith("127.") || host.startsWith("169.254.") || host.startsWith("10.") || host.startsWith("192.168.") || host === "metadata.google.internal") {
    throw new Error("Internal URLs not allowed");
  }
  const c = await enrichClient();
  const { data } = await c.post("/api/firecrawl/scrape", { url });
  return data;
}

export async function twitterSearch(query: string) {
  const c = await twitterClient();
  const { data } = await c.get("/tweets/search", { params: { words: query } });
  return data;
}

let _uploadClient: AxiosInstance | null = null;
async function uploadClient(): Promise<AxiosInstance> {
  if (!_uploadClient) _uploadClient = await createX402Client("https://stableupload.dev");
  return _uploadClient;
}

export async function publishWebsite(html: string, filename: string = "index.html") {
  const c = await uploadClient();
  const { data } = await c.post("/api/upload", {
    filename,
    contentType: "text/html",
    tier: "10mb",
  });
  await axios.put(data.uploadUrl, html, {
    headers: { "Content-Type": "text/html" },
  });
  return {
    publicUrl: data.publicUrl,
    siteUrl: data.siteUrl,
    uploadId: data.uploadId,
  };
}
