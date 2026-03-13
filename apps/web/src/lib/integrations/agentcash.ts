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
  // Upload HTML to pre-signed S3 URL — must use plain axios, not x402 client
  await axios.put(data.uploadUrl, html, {
    headers: { "Content-Type": "text/html" },
  });
  return {
    publicUrl: data.publicUrl,
    siteUrl: data.siteUrl,
    uploadId: data.uploadId,
  };
}
