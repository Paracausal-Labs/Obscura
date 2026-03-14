// Persistent key-value store.
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL is set, otherwise falls back to in-memory.

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  }
  return redis;
}

// In-memory fallback (survives HMR via globalThis)
const globalStore = globalThis as unknown as {
  kvFallback: Map<string, string> | undefined;
};
const mem = globalStore.kvFallback ?? new Map<string, string>();
globalStore.kvFallback = mem;

const MAX_MEM_ENTRIES = 500;

export async function kvSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const r = getRedis();
  if (r) {
    if (ttlSeconds) {
      await r.set(key, value, { ex: ttlSeconds });
    } else {
      await r.set(key, value);
    }
    return;
  }
  if (mem.size >= MAX_MEM_ENTRIES) {
    const oldest = mem.keys().next().value;
    if (oldest !== undefined) mem.delete(oldest);
  }
  mem.set(key, value);
}

export async function kvGet(key: string): Promise<string | null> {
  const r = getRedis();
  if (r) {
    return r.get<string>(key);
  }
  return mem.get(key) ?? null;
}

export async function kvGetByPrefix(prefix: string): Promise<Record<string, string>> {
  const r = getRedis();
  if (r) {
    const keys = await r.keys(`${prefix}*`);
    if (keys.length === 0) return {};
    const values = await r.mget<string[]>(...keys);
    const result: Record<string, string> = {};
    keys.forEach((k, i) => {
      const short = k.replace(prefix, "");
      if (values[i]) result[short] = values[i];
    });
    return result;
  }
  const result: Record<string, string> = {};
  for (const [k, v] of mem) {
    if (k.startsWith(prefix)) {
      result[k.replace(prefix, "")] = v;
    }
  }
  return result;
}

export function isRedisEnabled(): boolean {
  return !!getRedis();
}
