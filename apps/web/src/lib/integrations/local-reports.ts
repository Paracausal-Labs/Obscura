// In-memory store for encrypted reports when Fileverse is unavailable.
// Survives HMR via globalThis.

const MAX_REPORTS = 100;

const globalForReports = globalThis as unknown as {
  localReports: Map<string, string> | undefined;
};

const reports = globalForReports.localReports ?? new Map<string, string>();
globalForReports.localReports = reports;

export function storeLocalReport(jobId: string, encryptedContent: string) {
  if (reports.size >= MAX_REPORTS) {
    const oldest = reports.keys().next().value;
    if (oldest !== undefined) reports.delete(oldest);
  }
  reports.set(jobId, encryptedContent);
}

export function getLocalReport(jobId: string): string | null {
  return reports.get(jobId) ?? null;
}
