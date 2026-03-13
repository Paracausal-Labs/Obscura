import axios, { type AxiosInstance } from "axios";
import { withPaymentInterceptor, createSigner } from "x402-axios";

async function createX402Client(baseURL: string): Promise<AxiosInstance> {
  const privateKey = process.env.PAYMENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("PAYMENT_PRIVATE_KEY not set");

  const signer = await createSigner("base", privateKey as `0x${string}`);
  return withPaymentInterceptor(axios.create({ baseURL }), signer);
}

let _enrichClient: AxiosInstance | null = null;
async function enrichClient(): Promise<AxiosInstance> {
  if (!_enrichClient) _enrichClient = await createX402Client("https://stableenrich.dev");
  return _enrichClient;
}

let _socialClient: AxiosInstance | null = null;
async function socialClient(): Promise<AxiosInstance> {
  if (!_socialClient) _socialClient = await createX402Client("https://stablesocial.dev");
  return _socialClient;
}

export async function webSearch(query: string) {
  const c = await enrichClient();
  const { data } = await c.post("/exa/search", { query });
  return data;
}

export async function scrapeUrl(url: string) {
  const c = await enrichClient();
  const { data } = await c.post("/firecrawl/scrape", { url });
  return data;
}

export async function twitterSearch(query: string) {
  const c = await socialClient();
  const { data } = await c.post("/twitter/search", { query });
  return data;
}
