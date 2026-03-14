// Report storage — encrypted reports and fileId registry.
// Backed by Upstash Redis when available, in-memory fallback otherwise.

import { kvSet, kvGet, kvGetByPrefix } from "./store";

const REPORT_PREFIX = "report:";
const FILEID_PREFIX = "fileid:";
const REPORT_TTL = 86400; // 24 hours

export async function storeLocalReport(jobId: string, encryptedContent: string) {
  await kvSet(`${REPORT_PREFIX}${jobId}`, encryptedContent, REPORT_TTL);
}

export async function getLocalReport(jobId: string): Promise<string | null> {
  return kvGet(`${REPORT_PREFIX}${jobId}`);
}

export async function storeFileId(jobId: string, fileId: string) {
  await kvSet(`${FILEID_PREFIX}${jobId}`, fileId);
}

export async function getFileId(jobId: string): Promise<string | null> {
  return kvGet(`${FILEID_PREFIX}${jobId}`);
}

export async function getAllFileIds(): Promise<Record<string, string>> {
  return kvGetByPrefix(FILEID_PREFIX);
}
